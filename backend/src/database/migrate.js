'use strict';
/**
 * Migraciones del esquema.
 *
 * Cada migracion es idempotente y se registra en la tabla `_migraciones`.
 * Para anadir una migracion nueva: suba el numero en MIGRACIONES y describa
 * los cambios. Nunca edite una migracion ya aplicada en produccion.
 */
const fs = require('node:fs');
const path = require('node:path');
const { conexion } = require('./index');

const MIGRACIONES = [
  {
    version: 1,
    nombre: 'esquema-inicial',
    aplicar(con) {
      const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      con.exec(sql);
    },
  },
  {
    // Añade columnas que se Incorporaron después de la primera publicación.
    // Es idempotente: si la columna ya existe no hace nada.
    version: 2,
    nombre: 'certificados-bytes',
    aplicar(con) {
      const columnas = con.prepare('PRAGMA table_info(certificados)').all().map((c) => c.name);
      if (!columnas.includes('bytes')) {
        con.exec('ALTER TABLE certificados ADD COLUMN bytes INTEGER');
      }
    },
  },
];

function versionActual(con = conexion()) {
  const fila = con
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='_migraciones'")
    .get();
  if (!fila) return 0;
  const r = con.prepare('SELECT COALESCE(MAX(version),0) AS v FROM _migraciones').get();
  return r.v;
}

function migrar({ log } = {}) {
  const con = conexion();
  const actual = versionActual(con);
  const aplicadas = [];

  for (const m of MIGRACIONES) {
    if (m.version <= actual) continue;
    con.transaction(() => {
      m.aplicar(con);
      con
        .prepare('INSERT INTO _migraciones (version, nombre, aplicada_en, sqlite_version) VALUES (?,?,?,?)')
        .run(m.version, m.nombre, new Date().toISOString(), con.prepare('select sqlite_version() v').get().v);
    })();
    aplicadas.push({ version: m.version, nombre: m.nombre });
    if (log) log.info('migracion aplicada', { version: m.version, nombre: m.nombre });
  }
  return { versionAnterior: actual, versionActual: versionActual(con), aplicadas };
}

module.exports = { migrar, MIGRACIONES, versionActual };