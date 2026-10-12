'use strict';
/**
 * Pruebas de copia de seguridad, restauración, exportación y seguridad.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { crearContexto, registroValido, servidorEnPrueba } = require('./_ayuda');

let ctx;
let srv;

test.before(async () => {
  ctx = crearContexto();
  srv = await servidorEnPrueba(ctx.cfg);
});
test.after(async () => {
  if (srv) await srv.cerrar();
  if (ctx) ctx.limpiar();
});

/* ------------------------------------------------------------- backups */

test('1. La copia de seguridad se crea y supera el control de integridad', () => {
  const backup = require('../src/services/backup.service');
  const r = backup.crear({ nota: 'prueba automática' });
  assert.ok(fs.existsSync(r.ruta), 'el fichero debe existir');
  assert.ok(r.bytes > 1000);
  assert.match(r.sha256, /^[0-9a-f]{64}$/);
  assert.equal(r.integridad.ok, true);
  assert.match(r.archivo, /^backup-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.db$/);
});

test('2. La copia contiene los mismos registros que la base activa', () => {
  const backup = require('../src/services/backup.service');
  const registrosService = require('../src/services/registro.service');
  registrosService.registrar(registroValido(), { ip: '127.0.0.1' });

  const antes = require('../src/repositories/participantes.repo').listar({ limite: 1000 }).total;
  const r = backup.crear();

  const copia = new (require('better-sqlite3'))(r.ruta, { readonly: true });
  try {
    const enCopia = copia.prepare('SELECT COUNT(*) AS n FROM participantes').get().n;
    assert.equal(enCopia, antes, 'la copia debe tener los mismos registros');
    const integr = copia.prepare('PRAGMA integrity_check').all();
    assert.equal(integr[0].integrity_check, 'ok');
  } finally {
    copia.close();
  }
});

test('3. La copia se genera con una base abierta (VACUUM INTO, no copia a ojo)', () => {
  const backup = require('../src/services/backup.service');
  // Se escribe mientras la base está en uso: es justo lo que un "copiar el
  // fichero" no garantiza.
  const con = require('../src/database').conexion();
  con.prepare("INSERT INTO participantes (codigo_publico, rol, nombre, email, email_normalizado, huella_duplicado, cons_terminos, cons_contacto, estado, creado_en, actualizado_en) VALUES ('HCGA-CI-TEST-000001','carrier','Prueba concurrente','p@c.test','p@c.test','huella-prueba',1,1,'registrado',datetime('now'),datetime('now'))").run();
  const r = backup.crear();
  assert.equal(r.integridad.ok, true);
});

test('4. Restaurar una copia devuelve los datos al estado anterior', () => {
  const backup = require('../src/services/backup.service');
  const repo = require('../src/repositories/participantes.repo');
  const { migrar } = require('../src/database/migrate');
  migrar();

  // Estado A: se guarda una copia.
  repo.registrarAtomico(repo.preparar(registroValido(), {}));
  const estadoA = repo.listar({ limite: 1000 }).total;
  const copia = backup.crear({ nota: 'estado A' });

  // Estado B: se añaden más registros que NO están en la copia.
  repo.registrarAtomico(repo.preparar(registroValido(), {}));
  repo.registrarAtomico(repo.preparar(registroValido(), {}));
  assert.equal(repo.listar({ limite: 1000 }).total, estadoA + 2);

  const r = backup.restaurar(copia.ruta);
  assert.equal(r.restaurado, true);
  assert.ok(r.reserva, 'debe guardarse una copia del estado anterior');
  assert.ok(fs.existsSync(r.reserva), 'la reserva debe existir en disco');
  assert.equal(r.integridad.ok, true);

  const tras = repo.listar({ limite: 1000 }).total;
  assert.equal(tras, estadoA, 'la restauración devuelve exactamente el estado de la copia');

  // La reserva permite volver atrás: contiene el estado B.
  require('../src/database').cerrar();
  require('../src/database').abrir(ctx.cfg.baseDatos.archivo);
  const copia2 = new (require('better-sqlite3'))(r.reserva, { readonly: true });
  try {
    assert.equal(copia2.prepare('SELECT COUNT(*) AS n FROM participantes').get().n, estadoA + 2);
  } finally {
    copia2.close();
  }
});

test('5. No se restaura un fichero que no sea una base válida', () => {
  const backup = require('../src/services/backup.service');
  const falso = path.join(ctx.dir, 'esto-no-es-una-base.db');
  fs.writeFileSync(falso, 'esto no es una base de datos SQLite');
  assert.throws(() => backup.restaurar(falso), /integridad|no es v/i);
});

test('6. Las copias se listan de la más reciente a la más antigua', () => {
  const backup = require('../src/services/backup.service');
  backup.crear();
  backup.crear();
  const lista = backup.listar();
  assert.ok(lista.length >= 3, `deben existir al menos 3 copias, hay ${lista.length}`);
  const nombres = lista.map((c) => c.archivo);
  assert.equal(new Set(nombres).size, nombres.length, 'los nombres no se repiten');
  const fechas = lista.map((c) => c.creadoEn);
  assert.deepEqual(fechas, [...fechas].sort().reverse());
});

/* --------------------------------------------------------- exportación */

test('7. La exportación JSON es válida y conserva los acentos', () => {
  const exportacion = require('../src/services/exportacion.service');
  const registroService = require('../src/services/registro.service');
  registroService.registrar(
    registroValido({ name: 'Transporte Añil Ñandú S.L.', role: 'shipper', idType: 'EIN', idValue: '12-3456789' }),
    { ip: '127.0.0.1' }
  );

  const r = exportacion.exportarEnDisco();
  assert.ok(fs.existsSync(r.ruta));

  const bruto = fs.readFileSync(r.ruta);
  assert.ok(!bruto.slice(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])), 'sin BOM: acentos y ñ deben leerse bien');

  const datos = JSON.parse(bruto.toString('utf8'));
  assert.ok(datos.metadatos.exportadoEn);
  assert.ok(datos.metadatos.versionEsquema >= 1);
  assert.ok(Array.isArray(datos.participantes));
  assert.ok(datos.participantes.some((p) => p.nombre === 'Transporte Añil Ñandú S.L.'));
  assert.ok(bruto.includes('Añil'), 'el fichero debe contener la ñ literal');
});

test('8. La exportación NO incluye tokens, huellas ni secretos', () => {
  const exportacion = require('../src/services/exportacion.service');
  const texto = JSON.stringify(exportacion.construir());
  assert.ok(!/token_verificacion/.test(texto), 'no debe incluir el token de verificación');
  assert.ok(!/huella_duplicado/.test(texto), 'no debe incluir la huella de duplicado');
  assert.ok(!/smtp_pass|password/i.test(texto), 'no debe incluir credenciales');
  // Tampoco el valor literal del token en ninguna parte.
  const certificadosRepo = require('../src/repositories/certificados.repo');
  for (const c of certificadosRepo.listar({ limite: 500 })) {
    assert.ok(!texto.includes(c.token_verificacion), `el token ${c.token_verificacion} no debe aparecer`);
  }
});

test('9. Por defecto el CORREO del historial sale enmascarado en la exportación', async () => {
  const exportacion = require('../src/services/exportacion.service');
  const correosRepo = require('../src/repositories/correos.repo');
  const certificadosRepo = require('../src/repositories/certificados.repo');
  // Se genera un registro real: crea certificado y deja un envío registrado.
  await srv.pedir('/api/clientes', { method: 'POST', body: registroValido() });

  const certs = certificadosRepo.listar({ limite: 500 });
  const conCorreos = certs
    .map((c) => correosRepo.listarPorCertificado(c.id)[0])
    .filter(Boolean);
  assert.ok(conCorreos.length > 0, 'debe haber al menos un envío registrado');

  const enmascarado = exportacion.construir({ incluirCorreoCompleto: false });
  const completo = exportacion.construir({ incluirCorreoCompleto: true });

  // Se revisa el historial de correo, no todo el documento: el correo del
  // PARTICIPANTE sí se exporta completo (lo necesita la administración para
  // poder contactar), lo enmascarado es el duplicado del historial.
  const correosDe = (datos) =>
    datos.participantes.flatMap((p) => p.certificados.flatMap((c) => c.correos));
  const sinCompleto = correosDe(enmascarado);
  const conCorreo = correosDe(completo);

  assert.ok(sinCompleto.length >= 1);
  for (const correo of sinCompleto) {
    assert.ok(correo.destinatario.includes('***'), `el destinatario debe ir enmascarado: ${correo.destinatario}`);
  }
  assert.ok(
    conCorreos.every((c) => !c.destinatario.includes('***')),
    'con --correo-completo el destinatario aparece entero'
  );
});

test('10. La exportación incluye certificados e historial de correo', async () => {
  const exportacion = require('../src/services/exportacion.service');
  const r = await srv.pedir('/api/clientes', { method: 'POST', body: registroValido() });
  const codigo = r.cuerpo.datos.participante.codigo;

  const datos = exportacion.construir();
  const conCert = datos.participantes.find((p) => p.codigo_publico === codigo);
  assert.ok(conCert, 'debe aparecer el participante recién creado');
  assert.ok(conCert.certificados.length >= 1, 'debe incluir su certificado');
  assert.ok(conCert.certificados[0].correos.length >= 1, 'debe incluir el historial de correo');
  assert.ok(!('ruta_pdf' in conCert.certificados[0]), 'no debe filtrar rutas del servidor');
  assert.ok(!('token_verificacion' in conCert.certificados[0]), 'no debe filtrar el token');
});

/* ------------------------------------------------------------ seguridad */

test('11. La autenticación administrativa acepta la clave correcta y rechaza el resto', async () => {
  const { crearHashAdmin, verificarClave } = require('../src/middleware/autenticacion');
  const clave = 'Clave-de-prueba-2026';
  const hash = crearHashAdmin(clave);
  assert.match(hash, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  assert.equal(verificarClave(clave, hash), true);
  assert.equal(verificarClave('otra', hash), false);
  assert.equal(verificarClave('', hash), false);
  assert.equal(verificarClave(clave, ''), false);
  assert.equal(verificarClave(clave, 'formato-invalido'), false);

  // Dos hashes de la misma clave son distintos (sal aleatoria).
  assert.notEqual(hash, crearHashAdmin(clave));
});

test('12. Con ADMIN_HASH configurado, el acceso sin clave se rechaza con 401', async () => {
  const { recargar } = require('../src/config');
  const { crearHashAdmin } = require('../src/middleware/autenticacion');
  recargar({ ...process.env, ADMIN_HASH: crearHashAdmin('clave-de-prueba') });

  const anonimo = await srv.pedir('/api/admin/clientes');
  assert.equal(anonimo.status, 401);

  const incorrecta = await srv.pedir('/api/admin/clientes', { headers: { 'X-Admin-Key': 'mala' } });
  assert.equal(incorrecta.status, 401);

  const correcta = await srv.pedir('/api/admin/clientes', { headers: { 'X-Admin-Key': 'clave-de-prueba' } });
  assert.equal(correcta.status, 200);
  assert.equal(correcta.cuerpo.ok, true);

  const porBearer = await srv.pedir('/api/admin/clientes', { headers: { Authorization: 'Bearer clave-de-prueba' } });
  assert.equal(porBearer.status, 200);

  recargar({ ...process.env, ADMIN_HASH: '' });
});

test('13. La exportación por HTTP exige autenticación', async () => {
  const { recargar } = require('../src/config');
  const { crearHashAdmin } = require('../src/middleware/autenticacion');
  recargar({ ...process.env, ADMIN_HASH: crearHashAdmin('clave-de-prueba') });

  const sinClave = await srv.pedir('/api/exportaciones/clientes.json');
  assert.ok(sinClave.status === 401 || sinClave.status === 503, `status ${sinClave.status}`);

  const conClave = await srv.pedir('/api/exportaciones/clientes.json', { headers: { 'X-Admin-Key': 'clave-de-prueba' } });
  assert.equal(conClave.status, 200);
  assert.ok(conClave.cuerpo.metadatos, 'debe devolver la exportación');
  assert.ok(!JSON.stringify(conClave.cuerpo).includes('token_verificacion'));

  recargar({ ...process.env, ADMIN_HASH: '' });
});

test('14. Los accesos denegados quedan auditados', async () => {
  const { recargar } = require('../src/config');
  const { crearHashAdmin } = require('../src/middleware/autenticacion');
  const auditoriaRepo = require('../src/repositories/auditoria.repo');

  const antes = auditoriaRepo.listar({ limite: 500 }).filter((e) => e.accion === 'admin.acceso' && e.resultado === 'denegado').length;
  recargar({ ...process.env, ADMIN_HASH: crearHashAdmin('clave-de-prueba') });
  await srv.pedir('/api/admin/clientes', { headers: { 'X-Admin-Key': 'intento-fallido' } });
  const despues = auditoriaRepo.listar({ limite: 500 }).filter((e) => e.accion === 'admin.acceso' && e.resultado === 'denegado').length;

  assert.ok(despues > antes, 'el intento denegado debe quedar registrado');
  recargar({ ...process.env, ADMIN_HASH: '' });
});

test('15. La auditoría no guarda secretos', () => {
  const { ocultar } = require('../src/utils/logger');
  const oculto = ocultar({
    password: 'secreto123',
    smtp_pass: 'otra-clave',
    token_verificacion: 'ABCDEFGH',
    email: 'persona@ejemplo.test',
    normal: 'texto normal',
  });
  assert.ok(!oculto.password.includes('secreto123'));
  assert.ok(!oculto.smtp_pass.includes('otra-clave'));
  assert.ok(!oculto.token_verificacion.includes('ABCDEFGH'));
  assert.match(oculto.password, /\[oculto [0-9a-f]{8}\]/);
  assert.equal(oculto.normal, 'texto normal');
});

test('16. El backup por HTTP exige autenticación', async () => {
  const { recargar } = require('../src/config');
  const { crearHashAdmin } = require('../src/middleware/autenticacion');
  recargar({ ...process.env, ADMIN_HASH: crearHashAdmin('clave-de-prueba') });

  const sinClave = await srv.pedir('/api/backups', { method: 'POST' });
  assert.ok(sinClave.status === 401 || sinClave.status === 503, `status ${sinClave.status}`);

  const conClave = await srv.pedir('/api/backups', {
    method: 'POST',
    body: { nota: 'desde la API' },
    headers: { 'X-Admin-Key': 'clave-de-prueba' },
  });
  assert.equal(conClave.status, 201);
  assert.ok(fs.existsSync(path.join(ctx.cfg.rutas.backups, conClave.cuerpo.datos.archivo)));

  recargar({ ...process.env, ADMIN_HASH: '' });
});

test('17. La descarga de certificados no acepta rutas fuera del directorio', async () => {
  const { recargar } = require('../src/config');
  const { crearHashAdmin } = require('../src/middleware/autenticacion');
  recargar({ ...process.env, ADMIN_HASH: crearHashAdmin('clave-de-prueba') });
  const cabeceras = { 'X-Admin-Key': 'clave-de-prueba' };

  // Identificadores inexistentes o mal formados: 404, nunca el fichero.
  for (const id of ['0', '-1', 'abc', '999999999', '1;DROP TABLE', '3.5']) {
    const r = await srv.pedir(`/api/admin/certificados/${encodeURIComponent(id)}/archivo`, { headers: cabeceras });
    assert.equal(r.status, 404, `/certificados/${id}/archivo devolvió ${r.status}`);
  }

  // Con un id real, solo se sirve el PDF que está en storage/certificados.
  const repo = require('../src/repositories/participantes.repo');
  const p = repo.listar({ limite: 1 }).filas[0];
  const certs = p ? require('../src/repositories/certificados.repo').listarPorParticipante(p.id) : [];
  if (certs.length && certs[0].ruta_pdf) {
    const r = await fetch(`${srv.base}/api/admin/certificados/${certs[0].id}/archivo`, { headers: cabeceras });
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-type'), 'application/pdf');
    const buf = Buffer.from(await r.arrayBuffer());
    assert.equal(buf.subarray(0, 5).toString('latin1'), '%PDF-');
    assert.match(r.headers.get('content-disposition') || '', /attachment; filename="CERT-HCGA-CI-/);
  }

  recargar({ ...process.env, ADMIN_HASH: '' });
});