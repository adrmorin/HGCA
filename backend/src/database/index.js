'use strict';
/**
 * Capa de acceso a SQLite.
 *
 * - Conexion unica y reutilizable (better-sqlite3 es sincrono).
 * - PRAGMA foreign_keys = ON en cada conexion (SQLite lo apaga por defecto).
 * - WAL activado para que las lecturas no bloqueen a las escrituras.
 * - Consultas siempre parametrizadas: no se concatena entrada del usuario.
 */
const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');
const { config } = require('../config');

let db = null;
let rutaActual = null;

function abrir(archivo = config().baseDatos.archivo) {
  if (db && rutaActual === archivo) return db;

  if (db) {
    try { db.close(); } catch { /* ya estaba cerrada */ }
  }
  fs.mkdirSync(path.dirname(archivo), { recursive: true });
  db = new Database(archivo);
  db.pragma('foreign_keys = ON');
  db.pragma(`busy_timeout = ${config().baseDatos.busyTimeoutMs}`);
  if (config().baseDatos.wal) {
    // WAL mejora la concurrencia de lectura/escritura en un unico equipo.
    // En sistemas de red con otros motores WAL puede dar problemas; por eso
    // se puede desactivar con SQLITE_WAL=false.
    db.pragma('journal_mode = WAL');
  }
  db.pragma('synchronous = NORMAL');
  rutaActual = archivo;
  return db;
}

function conexion() {
  return db || abrir();
}

/**
 * Ejecuta `fn` dentro de una transaccion. Si `fn` lanza, se hace ROLLBACK.
 * better-sqlite3 ya ofrece `db.transaction`, pero se expone aquí un envoltorio
 * con reintento ante SQLITE_BUSY, que es el error realisticamente esperable
 * cuando dos registrations llegan en el mismo instante.
 */
function enTransaccion(fn, { reintentos = 3 } = {}) {
  const conexionActual = conexion();
  let ultimoError;
  for (let intento = 1; intento <= reintentos; intento++) {
    try {
      return conexionActual.transaction(fn)();
    } catch (err) {
      ultimoError = err;
      const busy = err && (err.code === 'SQLITE_BUSY' || /database is locked/i.test(err.message || ''));
      if (!busy || intento === reintentos) throw err;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25 * intento);
    }
  }
  throw ultimoError;
}

function cerrar() {
  if (db) {
    try { db.close(); } catch { /* ignorar */ }
    db = null;
    rutaActual = null;
  }
}

/** Verifica la integridad del fichero SQLite. Devuelve true/false. */
function integridad() {
  const filas = conexion().prepare('PRAGMA integrity_check').all();
  const ok = filas.length === 1 && filas[0].integrity_check === 'ok';
  return { ok, detalle: filas.map((f) => f.integrity_check) };
}

module.exports = { abrir, conexion, enTransaccion, cerrar, integridad };