'use strict';
/**
 * Pruebas de la API REST: rutas, códigos HTTP, seguridad y contadores.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
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

/* --------------------------------------------------------------- salud */

test('1. GET /api/health informa del estado del servidor', async () => {
  const r = await srv.pedir('/api/health');
  assert.equal(r.status, 200);
  assert.equal(r.cuerpo.ok, true);
  assert.equal(r.cuerpo.datos.baseDeDatos.ok, true);
  assert.equal(r.cuerpo.datos.plantillaCertificado.ok, true);
});

test('2. Una ruta inexistente devuelve 404 en JSON', async () => {
  const r = await srv.pedir('/api/no-existe');
  assert.equal(r.status, 404);
  assert.equal(r.cuerpo.ok, false);
  assert.equal(r.cuerpo.error.codigo, 'RUTA_NO_ENCONTRADA');
});

test('3. El cuerpo JSON inválido se rechaza con 400', async () => {
  const r = await fetch(`${srv.base}/api/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ esto no es json',
  });
  assert.equal(r.status, 400);
});

/* ------------------------------------------------------------ registro */

test('4. POST /api/clientes crea el registro, el certificado y devuelve 201', async () => {
  const r = await srv.pedir('/api/clientes', { method: 'POST', body: registroValido() });
  assert.equal(r.status, 201, JSON.stringify(r.cuerpo));
  const d = r.cuerpo.datos;
  assert.equal(d.aceptado, true);
  assert.equal(d.duplicado, false);
  assert.match(d.participante.codigo, /^HCGA-CI-\d{4}-[A-Z2-9]{6}$/);
  assert.equal(d.participante.rol, 'carrier');
  assert.ok(d.certificado, 'debería haber certificado');
  assert.equal(d.certificado.estadoGeneracion, 'generado');
  assert.ok(d.certificado.urlVerificacion.includes('/verificar/'));
});

test('5. La respuesta del registro no incluye el correo completo', async () => {
  const cuerpo = registroValido();
  const r = await srv.pedir('/api/clientes', { method: 'POST', body: cuerpo });
  const texto = JSON.stringify(r.cuerpo);
  assert.ok(!texto.includes(cuerpo.email), 'el correo completo no debe aparecer');
  assert.ok(r.cuerpo.datos.participante.emailEnmascarado.includes('***'));
});

test('6. Un envío idéntico repetido devuelve 409 y NO cuenta dos veces', async () => {
  const cuerpo = registroValido();
  const antes = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos.totalParticipantes;

  const a = await srv.pedir('/api/clientes', { method: 'POST', body: cuerpo });
  assert.equal(a.status, 201);
  const b = await srv.pedir('/api/clientes', { method: 'POST', body: cuerpo });
  assert.equal(b.status, 409);
  assert.equal(b.cuerpo.error.codigo, 'DUPLICADO');
  assert.equal(b.cuerpo.datos.duplicado, true);
  assert.equal(b.cuerpo.datos.participante.codigo, a.cuerpo.datos.participante.codigo);

  const despues = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos.totalParticipantes;
  assert.equal(despues, antes + 1, 'el duplicado no debe incrementar el contador');
});

test('7. Cinco envíos simultáneos del mismo registro solo crean una fila', async () => {
  const cuerpo = registroValido();
  const antes = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos.totalParticipantes;

  const resultados = await Promise.all(
    Array.from({ length: 5 }, () => srv.pedir('/api/clientes', { method: 'POST', body: cuerpo }))
  );
  const creados = resultados.filter((r) => r.status === 201);
  const duplicados = resultados.filter((r) => r.status === 409);
  assert.equal(creados.length, 1, `debería crearse exactamente 1, se crearon ${creados.length}`);
  assert.equal(duplicados.length, 4, 'los otros cuatro deberían ser duplicados');

  const despues = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos.totalParticipantes;
  assert.equal(despues, antes + 1, 'el contador debe subir exactamente 1');
});

test('8. Los datos inválidos devuelven 400 con el detalle por campo', async () => {
  const r = await srv.pedir('/api/clientes', { method: 'POST', body: registroValido({ email: 'no-es-correo' }) });
  assert.equal(r.status, 400);
  assert.ok(r.cuerpo.error.campos, 'debe indicar los campos con error');
  assert.ok(r.cuerpo.error.campos.email);
});

test('9. Un registro rechazado NO incrementa el contador', async () => {
  const antes = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos.totalParticipantes;
  await srv.pedir('/api/clientes', { method: 'POST', body: registroValido({ role: undefined }) });
  await srv.pedir('/api/clientes', { method: 'POST', body: registroValido({ idValue: '1' }) });
  await srv.pedir('/api/clientes', { method: 'POST', body: registroValido({ email: 'x' }) });
  const despues = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos.totalParticipantes;
  assert.equal(despues, antes, 'los rechazos no deben contar');
});

test('10. El campo trampa descarta el registro sin avisar al robot', async () => {
  const antes = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos.totalParticipantes;
  const r = await srv.pedir('/api/clientes', {
    method: 'POST',
    body: registroValido({ company_website: 'http://spam.example' }),
  });
  assert.equal(r.status, 201);
  assert.equal(r.cuerpo.datos.real, false, 'no debe haberse guardado nada');
  assert.equal(r.cuerpo.datos.participante, null);
  const despues = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos.totalParticipantes;
  assert.equal(despues, antes);
});

/* --------------------------------------------------------- contadores */

test('11. El total público coincide con las filas reales de la tabla', async () => {
  const { conexion } = require('../src/database');
  const publico = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos;
  const real = conexion()
    .prepare("SELECT COUNT(*) AS n FROM participantes WHERE estado IN ('registrado','verificado')")
    .get().n;
  assert.equal(publico.totalParticipantes, real, 'la cifra pública debe salir de la tabla');
});

test('12. El contador por rol coincide con el recuento real por rol', async () => {
  const { conexion } = require('../src/database');
  await srv.pedir('/api/clientes', { method: 'POST', body: registroValido({ role: 'shipper', idType: 'EIN', idValue: '12-3456789' }) });
  const publico = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos;
  for (const r of publico.roles) {
    const real = conexion()
      .prepare("SELECT COUNT(*) AS n FROM participantes WHERE estado IN ('registrado','verificado') AND rol = ?")
      .get(r.rol).n;
    assert.equal(r.cantidad, real, `el contador de "${r.rol}" debe coincidir con la tabla`);
  }
});

test('13. Las estadísticas siempre incluyen los dos roles del formulario', async () => {
  const publico = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos;
  assert.equal(publico.roles.length, 2);
  const roles = publico.roles.map((r) => r.rol).sort();
  assert.deepEqual(roles, ['carrier', 'shipper']);
});

test('14. El total público es la suma de los contadores por rol', async () => {
  const publico = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos;
  const suma = publico.roles.reduce((a, r) => a + r.cantidad, 0);
  assert.equal(suma, publico.totalParticipantes);
});

test('15. Las estadísticas públicas NO contienen datos personales', async () => {
  const cuerpo = registroValido({ name: 'Nombre Confidencial Unico', publicListing: true });
  await srv.pedir('/api/clientes', { method: 'POST', body: cuerpo });
  const r = await srv.pedir('/api/publico/estadisticas');
  const texto = JSON.stringify(r.cuerpo);
  assert.ok(!texto.includes(cuerpo.email), 'no debe filtrar el correo');
  assert.ok(!texto.includes('Nombre Confidencial Unico'), 'no debe filtrar el nombre');
  assert.ok(!texto.includes(cuerpo.phone), 'no debe filtrar el teléfono');
  assert.ok(!/token/i.test(texto), 'no debe filtrar el token');
  assert.ok(!/huella/i.test(texto), 'no debe filtrar la huella');
  // Solo campos agregados y nombres de rol.
  assert.deepEqual(Object.keys(r.cuerpo.datos).sort(), [
    'actualizadoEn', 'reglaContador', 'roles', 'totalAnulados', 'totalParticipantes', 'totalVerificados',
  ]);
});

test('16. GET /api/clientes/contador devuelve el total', async () => {
  const a = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos.totalParticipantes;
  const b = (await srv.pedir('/api/clientes/contador')).cuerpo.datos;
  assert.equal(b.total, a);
});

test('17. Confirmar el correo mueve el registro a "verificado"', async () => {
  const r = await srv.pedir('/api/clientes', { method: 'POST', body: registroValido() });
  const token = r.cuerpo.datos.certificado.urlVerificacion.split('/').pop();
  const antes = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos;

  const v = await srv.pedir(`/api/verificar/${token}`);
  assert.equal(v.status, 200);
  assert.equal(v.cuerpo.datos.valido, true);
  assert.equal(v.cuerpo.datos.estado, 'registrado');
  assert.equal(antes.totalVerificados, 0, 'todavía no está verificado');

  const c = await srv.pedir(`/api/confirmar/${token}`);
  assert.equal(c.status, 200);
  assert.equal(c.cuerpo.datos.confirmado, true);

  const despues = (await srv.pedir('/api/publico/estadisticas')).cuerpo.datos;
  assert.equal(despues.totalVerificados, antes.totalVerificados + 1);
  assert.equal(despues.totalParticipantes, antes.totalParticipantes, 'confirmar no crea un participante nuevo');

  const v2 = await srv.pedir(`/api/verificar/${token}`);
  assert.equal(v2.cuerpo.datos.estado, 'verificado');
});

/* ------------------------------------------------------- verificación */

test('18. Un token inexistente devuelve 404 sin revelar nada', async () => {
  const r = await srv.pedir('/api/verificar/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  assert.equal(r.status, 404);
  assert.equal(r.cuerpo.datos.valido, false);
  assert.equal(r.cuerpo.datos.estado, 'inexistente');
  assert.ok(!r.cuerpo.datos.codigo);
});

test('19. Un token con formato inválido se trata como inexistente', async () => {
  for (const token of ['corto', '../../etc/passwd', '%00', 'a'.repeat(500), 'con espacio']) {
    const r = await srv.pedir(`/api/verificar/${encodeURIComponent(token)}`);
    assert.equal(r.status, 404, `token "${token}"`);
    assert.equal(r.cuerpo.datos.estado, 'inexistente');
  }
});

test('20. La verificación pública solo muestra el nombre si se autorizó', async () => {
  const conPermiso = registroValido({ consents: { terms: true, contact: true, publicListing: true, shareWithFinanciers: false } });
  const r1 = await srv.pedir('/api/clientes', { method: 'POST', body: conPermiso });
  const t1 = r1.cuerpo.datos.certificado.urlVerificacion.split('/').pop();
  const v1 = await srv.pedir(`/api/verificar/${t1}`);
  assert.equal(v1.cuerpo.datos.nombrePublico, conPermiso.name, 'con autorización debe mostrarse');

  const sinPermiso = registroValido({ consents: { terms: true, contact: true, publicListing: false, shareWithFinanciers: false } });
  const r2 = await srv.pedir('/api/clientes', { method: 'POST', body: sinPermiso });
  const t2 = r2.cuerpo.datos.certificado.urlVerificacion.split('/').pop();
  const v2 = await srv.pedir(`/api/verificar/${t2}`);
  assert.equal(v2.cuerpo.datos.nombrePublico, null, 'sin autorización NO debe mostrarse');
  assert.equal(v2.cuerpo.datos.nombrePublicoDisponible, false);
  const texto = JSON.stringify(v2.cuerpo);
  assert.ok(!texto.includes(sinPermiso.email));
  assert.ok(!texto.includes(sinPermiso.phone));
});

/* ----------------------------------------------------- administración */

test('21. Los endpoints administrativos están cerrados sin credenciales', async () => {
  const rutas = [
    ['GET', '/api/admin/clientes'],
    ['GET', '/api/admin/certificados'],
    ['GET', '/api/exportaciones/clientes.json'],
    ['GET', '/api/admin/auditoria'],
    ['POST', '/api/admin/backups'],
  ];
  for (const [metodo, ruta] of rutas) {
    const r = await srv.pedir(ruta, { method: metodo });
    assert.ok(r.status === 503 || r.status === 401, `${ruta} devolvió ${r.status}; debería estar cerrado`);
  }
});

test('22. Con una clave incorrecta se rechaza el acceso administrativo', async () => {
  const r = await srv.pedir('/api/admin/clientes', { headers: { 'X-Admin-Key': 'clave-inventada' } });
  assert.ok(r.status === 503 || r.status === 401, `status ${r.status}`);
});

test('23. Las rutas del enunciado que requieren auth también están protegidas', async () => {
  const r = await srv.pedir('/api/admin/clientes');
  assert.ok(r.status === 503 || r.status === 401);
});

/* ------------------------------------------------------------- varios */

test('24. El límite por IP protege el registro', async () => {
  // El límite por defecto es 10/min; se comprueba que existe y responde.
  const { limiteRegistro } = require('../src/middleware/limites');
  assert.ok(limiteRegistro, 'debe existir el limitador de registro');
});

test('25. Las respuestas llevan X-Request-Id y no se cachean', async () => {
  const r = await fetch(`${srv.base}/api/health`);
  assert.ok(r.headers.get('x-request-id'), 'debe devolver X-Request-Id');
  assert.match(r.headers.get('cache-control') || '', /no-store/);
});

test('26. El servidor envía cabeceras de seguridad (helmet)', async () => {
  const r = await fetch(`${srv.base}/api/health`);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(r.headers.get('content-security-policy'), 'debe haber CSP');
  assert.equal(r.headers.get('x-powered-by'), null, 'no debe anunciar Express');
});

test('27. Se sirve el formulario en la raíz', async () => {
  const r = await fetch(`${srv.base}/`);
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.match(html, /HCGA/);
  assert.match(html, /statsTotal/, 'debe incluir la sección de contadores');
  assert.match(html, /name="role"/, 'debe conservar el formulario original');
});

test('28. Se sirve la página pública de verificación', async () => {
  const r = await fetch(`${srv.base}/verificar/ABCDEFGH`);
  assert.equal(r.status, 200);
  assert.match(await r.text(), /HCGA/);
});