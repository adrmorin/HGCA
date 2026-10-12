'use strict';
/**
 * Pruebas de correo: modo captura, errores SMTP y registro de intentos.
 *
 * El modo captura no abre ninguna conexion: es lo que permite probar el flujo
 * completo sin enviar nada real. Los errores SMTP se provocan con un servidor
 * de captura real levantado en localhost, sin salida a Internet.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { crearContexto, registroValido } = require('./_ayuda');

let ctx;

test.before(() => {
  ctx = crearContexto();
});
test.after(() => {
  try { require('../src/services/correo.service').cerrar(); } catch { /* nada */ }
  if (ctx) ctx.limpiar();
});

/** Crea un participante y su certificado, y devuelve las rutas. */
function prepararEnvio() {
  const registroService = require('../src/services/registro.service');
  return registroService.registrar(registroValido(), { ip: '127.0.0.1' });
}

/* ------------------------------------------------- errores y diagnóstico */

test('1. Los errores de SMTP se traducen a mensajes comprensibles', () => {
  const { explicarError } = require('../src/services/correo.service');
  const casos = [
    [{ code: 'EAUTH' }, 'EAUTH', /credenciales/i],
    [{ code: 'ECONNECTION' }, 'ECONNECTION', /conectar/i],
    [{ code: 'ETIMEDOUT' }, 'ETIMEDOUT', /tard[oó]/i],
    [{ code: 'EENVELOPE' }, 'EENVELOPE', /destinatario/i],
    [{ code: 'ETLS' }, 'ETLS', /TLS/i],
    [{ code: 'ETOOLARGE' }, 'ETOOLARGE', /tama[nñ]o/i],
    [{ code: 'ALGO_RARO' }, 'ALGO_RARO', /No se pudo entregar/i],
  ];
  for (const [err, codigo, patron] of casos) {
    const r = explicarError(err);
    assert.equal(r.codigo, codigo);
    assert.match(r.usuario, patron, `mensaje para ${codigo}`);
    assert.ok(r.tecnico.includes(codigo), 'el detalle técnico debe llevar el código');
  }
});

test('2. En modo captura no se abre ninguna conexión SMTP', async () => {
  const correo = require('../src/services/correo.service');
  const r = await correo.verificarConexion();
  assert.equal(r.ok, true);
  assert.equal(r.modo, 'captura');
  assert.match(r.mensaje, /no se abre ninguna conexión/i);
});

test('3. El envío en modo captura se guarda en disco y queda "aceptado"', async () => {
  const resultado = await prepararEnvio();
  assert.equal(resultado.correo.estado, 'aceptado', JSON.stringify(resultado.correo));
  assert.equal(resultado.correo.modo, 'captura');
  assert.equal(resultado.correo.entregaConfirmada, false, 'no se puede afirmar la entrega');

  const dir = path.join(ctx.cfg.correo.rutaCaptura, new Date().toISOString().slice(0, 10));
  const ficheros = fs.readdirSync(dir);
  const txt = ficheros.filter((f) => f.endsWith('.txt'));
  const pdfs = ficheros.filter((f) => f.endsWith('.pdf'));
  assert.ok(txt.length > 0, 'debe guardarse el mensaje');
  assert.ok(pdfs.length > 0, 'debe adjuntarse una copia del certificado');

  const cuerpo = fs.readFileSync(path.join(dir, txt[0]), 'utf8');
  assert.match(cuerpo, /recibimos y registramos su inter/i);
  assert.match(cuerpo, /no es un contrato/i);
  assert.ok(!/SMTP_PASS|password/i.test(cuerpo), 'el mensaje no debe contener credenciales');
});

test('4. El adjunto de la captura es el certificado real', async () => {
  await prepararEnvio();
  const dir = path.join(ctx.cfg.correo.rutaCaptura, new Date().toISOString().slice(0, 10));
  const pdf = fs.readdirSync(dir).filter((f) => f.endsWith('.pdf')).pop();
  const buffer = fs.readFileSync(path.join(dir, pdf));
  assert.equal(buffer.subarray(0, 5).toString('latin1'), '%PDF-', 'debe ser un PDF válido');
  assert.ok(buffer.length > 50000);
});

test('5. Cada intento de envío queda registrado en la base de datos', async () => {
  const correosRepo = require('../src/repositories/correos.repo');
  const certificadosRepo = require('../src/repositories/certificados.repo');
  const participantesRepo = require('../src/repositories/participantes.repo');

  const resultado = await prepararEnvio();
  const p = participantesRepo.porCodigoPublico(resultado.participante.codigo);
  const certs = certificadosRepo.listarPorParticipante(p.id);
  const correos = correosRepo.listarPorCertificado(certs[0].id);
  assert.ok(correos.length >= 1, 'debe haber al menos un intento');
  assert.equal(correos[0].estado, 'aceptado');
  assert.ok(correos[0].aceptado_en, 'debe constar la marca de aceptación');
  assert.equal(certificadosRepo.porId(certs[0].id).estado_generacion, 'generado');
});

/* ------------------------------------------ no se reenvía indefinidamente */

test('6. Un certificado no se reenvía más de 3 veces automáticamente', async () => {
  const registroService = require('../src/services/registro.service');
  const participantesRepo = require('../src/repositories/participantes.repo');
  const certificadosRepo = require('../src/repositories/certificados.repo');
  const correosRepo = require('../src/repositories/correos.repo');

  const resultado = await prepararEnvio();
  const p = participantesRepo.porCodigoPublico(resultado.participante.codigo);
  const cert = certificadosRepo.vigenteDe(p.id);

  // Se fuerza el limite de envios aceptados.
  for (let i = 0; i < ctx.cfg.correo.reintentosMax; i++) {
    correosRepo.marcarAceptado(
      correosRepo.registrarIntento({
        certificadoId: cert.id,
        destinatario: p.email,
        remitente: 'x@y.test',
        asunto: 'relleno',
      }),
      `relleno-${i}`
    );
  }
  const extra = await registroService.enviarCertificado({ ok: true, certificado: cert });
  assert.equal(extra.estado, 'omitido');
  assert.match(extra.mensaje, /ya se envió varias veces/i);
});

/* --------------------------------------------- SMTP real contra localhost */

test('7. Un SMTP mal configurado falla sin perder el registro ni el certificado', async () => {
  const { recargar } = require('../src/config');
  const registroService = require('../src/services/registro.service');
  const participantesRepo = require('../src/repositories/participantes.repo');
  const certificadosRepo = require('../src/repositories/certificados.repo');

  // Se apunta a un puerto cerrado: la conexion falla de verdad.
  recargar({ ...process.env, SMTP_MODO_CAPTURA: 'false', SMTP_HOST: '127.0.0.1', SMTP_PORT: '59999', SMTP_PASS: 'x', SMTP_REINTENTOS_MAX: '1' });
  require('../src/services/correo.service').cerrar();

  const resultado = await registroService.registrar(registroValido(), { ip: '127.0.0.1' });
  assert.equal(resultado.aceptado, true, 'el registro debe conservarse');

  const p = participantesRepo.porCodigoPublico(resultado.participante.codigo);
  assert.ok(p, 'el participante debe estar guardado');

  const certs = certificadosRepo.listarPorParticipante(p.id);
  assert.equal(certs[0].estado_generacion, 'generado', 'el certificado debe conservarse');
  assert.ok(certs[0].ruta_pdf && fs.existsSync(certs[0].ruta_pdf), 'el PDF debe estar en disco');

  assert.equal(resultado.correo.estado, 'error');
  assert.equal(resultado.correo.entregaConfirmada, false);
  assert.ok(resultado.correo.mensaje, 'debe explicarse el fallo al usuario');

  // Vuelve al modo captura para el resto de pruebas.
  recargar({ ...process.env, SMTP_MODO_CAPTURA: 'true', SMTP_HOST: '', SMTP_PORT: '587', SMTP_PASS: '' });
  require('../src/services/correo.service').cerrar();
});

test('8. El error de correo queda registrado con su motivo técnico', async () => {
  const correosRepo = require('../src/repositories/correos.repo');
  const certificadosRepo = require('../src/repositories/certificados.repo');
  const participantesRepo = require('../src/repositories/participantes.repo');
  const { conexion } = require('../src/database');

  const conError = conexion()
    .prepare("SELECT c.* FROM correos c WHERE c.estado='error' ORDER BY c.id DESC LIMIT 1")
    .get();
  assert.ok(conError, 'debe existir un correo con estado error');
  assert.ok(conError.motivo_error, 'debe guardar el motivo');
  assert.ok(conError.destinatario, 'debe constar el destinatario');
  assert.equal(conError.aceptado_en, null, 'un envío fallido no puede constar como aceptado');
  assert.ok(!/pass|password/i.test(conError.motivo_error || ''), 'el motivo no debe filtrar la contraseña');
});

/* ------------------------------------- servidor SMTP de captura real */

test('9. El envío llega a un servidor SMTP de captura local', async (t) => {
  const { SMTPServer } = require('smtp-server');
  const recibidos = [];
  const servidor = new SMTPServer({
    authOptional: true,
    disabledCommands: ['STARTTLS'],
    hideSTARTTLS: true,
    logger: false,
    // Acepta cualquier credencial: es un buzon de pruebas, no un relay.
    onAuth(auth, session, cb) {
      cb(null, { user: auth.username });
    },
    onData(stream, session, cb) {
      const trozos = [];
      stream.on('data', (t) => trozos.push(t));
      stream.on('end', () => {
        recibidos.push({
          bruto: Buffer.concat(trozos).toString('utf8'),
          para: session.envelope.rcptTo.map((r) => r.address),
          de: session.envelope.mailFrom.address,
        });
        cb();
      });
    },
  });

  const puerto = await new Promise((resolve) => {
    servidor.listen(0, '127.0.0.1', () => resolve(servidor.server.address().port));
  });

  const { recargar } = require('../src/config');
  recargar({
    ...process.env,
    SMTP_MODO_CAPTURA: 'false',
    SMTP_HOST: '127.0.0.1',
    SMTP_PORT: String(puerto),
    SMTP_SECURE: 'false',
    SMTP_USER: 'captura',
    SMTP_PASS: 'captura',
    SMTP_REINTENTOS_MAX: '2',
    SMTP_ESPERA_REINTENTO_MS: '10',
    // El servidor de captura local no ofrece STARTTLS. En produccion esto
    // debe seguir siendo true: sin el, el correo viaja en claro.
    SMTP_EXIGIR_TLS: 'false',
  });
  require('../src/services/correo.service').cerrar();

  const resultado = await prepararEnvio();
  assert.equal(resultado.correo.estado, 'aceptado', JSON.stringify(resultado.correo));
  assert.equal(resultado.correo.modo, 'smtp');
  assert.equal(resultado.correo.entregaConfirmada, false, 'aceptado no significa entregado');

  await new Promise((r) => setTimeout(r, 100));
  assert.equal(recibidos.length, 1, 'el servidor de captura debe haber recibido 1 mensaje');
  const mensaje = recibidos[0];
  assert.match(mensaje.bruto, /Subject:/i);
  assert.match(mensaje.bruto, /recibimos y registramos su inter/i);
  assert.ok(mensaje.bruto.includes('Content-Disposition: attachment'), 'debe llevar el PDF adjunto');
  // El adjunto va en base64: "%PDF-" codificado es "JVBERi".
  assert.ok(mensaje.bruto.includes('JVBERi'), 'el adjunto debe ser un PDF');
  assert.match(mensaje.bruto, /filename="?CERT-HCGA-CI-/, 'el adjunto se llama como el certificado');

  await new Promise((r) => servidor.close(r));
  recargar({ ...process.env, SMTP_MODO_CAPTURA: 'true', SMTP_HOST: '', SMTP_PORT: '587', SMTP_PASS: '' });
  require('../src/services/correo.service').cerrar();
});

test('10. El mensaje enviado no incluye la contraseña SMTP', async () => {
  const registroService = require('../src/services/registro.service');
  const { construirMensaje } = require('../src/services/correo.service');
  const cuerpo = construirMensaje({
    participante: { nombre: 'Prueba', codigo_publico: 'HCGA-CI-2026-ABC123' },
    certificado: {},
    enlaceConfirmacion: 'http://127.0.0.1:3000/confirmar/ABC',
  });
  assert.ok(!/SMTP_PASS|captura/i.test(cuerpo), 'el cuerpo no debe filtrar credenciales');
  assert.match(cuerpo, /Prueba/);
  assert.match(cuerpo, /confirmar\/ABC/);
});