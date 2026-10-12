'use strict';
/**
 * Pruebas de la capa de datos: esquema, migraciones, validacion y persistencia.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { crearContexto, registroValido, RAIZ } = require('./_ayuda');

let ctx;

test.before(() => { ctx = crearContexto(); });
test.after(() => ctx && ctx.limpiar());

test('1. La base de datos se crea y el esquema está al día', () => {
  const { conexion } = require('../src/database');
  const tablas = conexion()
    .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    .all()
    .map((t) => t.name);
  for (const t of ['participantes', 'certificados', 'correos', 'auditoria', '_migraciones']) {
    assert.ok(tablas.includes(t), `falta la tabla ${t}`);
  }
});

test('2. Las claves foráneas están activas', () => {
  const { conexion } = require('../src/database');
  assert.equal(conexion().pragma('foreign_keys', { simple: true }), 1);
});

test('3. Las migraciones son idempotentes', () => {
  const { migrar, versionActual } = require('../src/database/migrate');
  const primera = migrar();
  assert.equal(primera.aplicadas.length, 0, 'no debería volver a aplicarse nada');
  assert.ok(versionActual() >= 1);
});

test('4. La validación acepta un registro válido', () => {
  const { validarRegistro } = require('../src/validators/registro.schema');
  const r = validarRegistro(registroValido());
  assert.equal(r.ok, true, JSON.stringify(r.errores));
});

test('5. La validación rechaza datos inválidos', () => {
  const { validarRegistro } = require('../src/validators/registro.schema');
  const casos = [
    ['sin rol', registroValido({ role: undefined }), 'role'],
    ['nombre corto', registroValido({ name: 'A' }), 'name'],
    ['correo inválido', registroValido({ email: 'nope' }), 'email'],
    ['USDOT corto', registroValido({ idType: 'USDOT', idValue: '12' }), 'idValue'],
    ['EIN inválido', registroValido({ role: 'shipper', idType: 'EIN', idValue: '1' }), 'idValue'],
    ['sin consentimiento', registroValido({ consents: { terms: false, contact: true } }), 'consents'],
  ];
  for (const [nombre, cuerpo, esperado] of casos) {
    const r = validarRegistro(cuerpo);
    assert.equal(r.ok, false, `${nombre} debería rechazarse`);
    assert.ok(r.errores[esperado], `${nombre}: se esperaba un error en "${esperado}", se obtuvo ${JSON.stringify(r.errores)}`);
  }
});

test('6. El tipo de identificación debe corresponder al rol', () => {
  const { validarRegistro } = require('../src/validators/registro.schema');
  const r = validarRegistro(registroValido({ role: 'carrier', idType: 'EIN' }));
  assert.equal(r.ok, false);
  assert.ok(r.errores.idType);
});

test('7. El enmascarado sigue la regla del certificado', () => {
  const mask = require('../src/utils/mask');
  assert.equal(mask.enmascararIdentificacion('USDOT', '1234567'), 'USDOT ••••4567');
  assert.equal(mask.enmascararIdentificacion('WEB', 'https://www.Empresa.com/x'), 'empresa.com');
  assert.equal(mask.enmascararCorreo('Juan.Perez@Empresa.COM'), 'j***@empresa.com');
  assert.equal(mask.enmascararTelefono('(239) 555-0123'), '•••-•••-0123');
});

test('8. Persistencia: el registro sobrevive al reinicio', () => {
  const participantesRepo = require('../src/repositories/participantes.repo');
  const { conexion } = require('../src/database');
  const { validarRegistro } = require('../src/validators/registro.schema');

  const datos = registroValido();
  const v = validarRegistro(datos);
  const fila = participantesRepo.preparar(v.datos, { ip: '127.0.0.1' });
  const creado = participantesRepo.registrarAtomico(fila);
  assert.ok(creado.id > 0);

  // Simula reiniciar el servidor: se cierra y se vuelve a abrir la base.
  require('../src/database').cerrar();
  require('../src/database').abrir(ctx.cfg.baseDatos.archivo);

  const recargado = require('../src/repositories/participantes.repo').porCodigoPublico(creado.codigo_publico);
  assert.ok(recargado, 'el registro debería seguir ahí tras reabrir');
  assert.equal(recargado.email, datos.email);
  assert.equal(recargado.rol, 'carrier');
});

test('9. Detección de duplicados por correo', () => {
  const participantesRepo = require('../src/repositories/participantes.repo');
  const { validarRegistro } = require('../src/validators/registro.schema');
  const datos = registroValido();
  const v = validarRegistro(datos);
  const creado = participantesRepo.registrarAtomico(participantesRepo.preparar(v.datos, {}));

  // Mismo correo, escrito de otra forma (mayúsculas y espacios).
  const dup = participantesRepo.buscarDuplicado({
    emailNormalizado: datos.email.toUpperCase(),
    rol: 'shipper',
    idNormalizado: 'web:otro.com',
    idTipo: 'WEB',
  });
  assert.ok(dup, 'debería detectar el duplicado por correo');
  assert.equal(dup.motivo, 'email');
  assert.equal(dup.fila.id, creado.id);
});

test('10. Detección de duplicados por identificación registral', () => {
  const participantesRepo = require('../src/repositories/participantes.repo');
  const { validarRegistro } = require('../src/validators/registro.schema');
  const datos = registroValido({ role: 'carrier', idType: 'USDOT', idValue: '9988776' });
  const v = validarRegistro(datos);
  participantesRepo.registrarAtomico(participantesRepo.preparar(v.datos, {}));

  const dup = participantesRepo.buscarDuplicado({
    emailNormalizado: 'otra-cosa@distinta.com',
    rol: 'carrier',
    idNormalizado: require('../src/utils/mask').normalizarIdentificacion('USDOT', 'USDOT 9988776'),
    idTipo: 'USDOT',
  });
  assert.ok(dup, 'debería detectar el duplicado por USDOT');
  assert.equal(dup.motivo, 'identificacion');
});

test('11. El sitio web NO se usa como clave de unicidad', () => {
  const participantesRepo = require('../src/repositories/participantes.repo');
  const { validarRegistro } = require('../src/validators/registro.schema');
  const datos = registroValido({ role: 'shipper', idType: 'WEB', idValue: 'https://compartido.example' });
  const v = validarRegistro(datos);
  const creado = participantesRepo.registrarAtomico(participantesRepo.preparar(v.datos, {}));

  // Otra empresa distinta, mismo sitio, correo distinto: debe admitirse.
  const dup = participantesRepo.buscarDuplicado({
    emailNormalizado: 'otra@empresa-distinta.com',
    rol: 'shipper',
    idNormalizado: require('../src/utils/mask').normalizarIdentificacion('WEB', 'https://www.compartido.example'),
    idTipo: 'WEB',
  });
  assert.equal(dup, null, 'el sitio web no debe generar un falso duplicado');
  assert.ok(creado.id > 0);
});

test('12. Una baja libera el identificador para una nueva inscripción', () => {
  const participantesRepo = require('../src/repositories/participantes.repo');
  const { validarRegistro } = require('../src/validators/registro.schema');
  const datos = registroValido({ role: 'carrier', idType: 'USDOT', idValue: '1122334' });
  const v = validarRegistro(datos);
  const creado = participantesRepo.registrarAtomico(participantesRepo.preparar(v.datos, {}));
  participantesRepo.marcarAnulado(creado.id, 'prueba');

  const dup = participantesRepo.buscarDuplicado({
    emailNormalizado: datos.email,
    rol: 'carrier',
    idNormalizado: require('../src/utils/mask').normalizarIdentificacion('USDOT', '1122334'),
    idTipo: 'USDOT',
  });
  assert.equal(dup, null, 'una fila anulada no debe bloquear un alta nuevo');
});

test('13. Los identificadores y tokens no son predecibles ni se derivan de datos', () => {
  const ids = require('../src/utils/ids');
  const a = ids.tokenVerificacion();
  const b = ids.tokenVerificacion();
  assert.notEqual(a, b);
  assert.match(a, /^[A-Z2-9]{32}$/);
  assert.ok(!a.includes('1234567'), 'el token no puede contener el identificador del participante');

  const c1 = ids.codigoPublico(2026);
  const c2 = ids.codigoPublico(2026);
  assert.notEqual(c1, c2);
  assert.match(c1, /^HCGA-CI-2026-[A-Z2-9]{6}$/);
});

test('14. Se generan 10 000 tokens distintos', () => {
  const ids = require('../src/utils/ids');
  const vistos = new Set();
  for (let i = 0; i < 10000; i++) vistos.add(ids.tokenVerificacion());
  assert.equal(vistos.size, 10000);
});

test('15. La consulta de integridad de la base es correcta', () => {
  const { integridad } = require('../src/database');
  assert.equal(integridad().ok, true);
});

test('16. Las consultas usan parámetros: una comilla no rompe nada', () => {
  const participantesRepo = require('../src/repositories/participantes.repo');
  const { validarRegistro } = require('../src/validators/registro.schema');
  const peligroso = "'; DROP TABLE participantes; --";
  const v = validarRegistro(registroValido({ name: `Empresa ${peligroso}` }));
  const creado = participantesRepo.registrarAtomico(participantesRepo.preparar(v.datos, {}));
  assert.equal(creado.nombre, `Empresa ${peligroso}`);
  // La tabla sigue existiendo.
  assert.ok(participantesRepo.listar({ limite: 1 }).total > 0);
});

test('17. El esquema declarado está documentado y contiene las entidades pedidas', () => {
  const sql = fs.readFileSync(path.join(RAIZ, 'backend', 'src', 'database', 'schema.sql'), 'utf8');
  for (const t of ['participantes', 'certificados', 'correos', 'auditoria']) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${t}`), `falta la tabla ${t} en schema.sql`);
  }
  assert.match(sql, /PRIMARY KEY/, 'debe haber claves primarias');
  assert.match(sql, /REFERENCES participantes/, 'debe haber claves foráneas');
  assert.match(sql, /CREATE INDEX/, 'debe haber índices');
});