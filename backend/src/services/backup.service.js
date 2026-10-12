'use strict';
/**
 * Copias de seguridad y restauracion.
 *
 * IMPORTANTE: no se copia el fichero de la base de datos "a ojo". Si hay
 * transacciones en curso, una copia hecha así puede quedar inconsistente e
 * inservible. Se usa la API de respaldo de SQLite (`VACUUM INTO`), que
 * produce una copia coherente aunque la base de datos este en uso.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { conexion, integridad } = require('../database');
const { config } = require('../config');
const auditoriaRepo = require('../repositories/auditoria.repo');
const { crearLogger } = require('../utils/logger');

const log = crearLogger('backup');

function selloTiempo() {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
}

/**
 * Nombre único de copia.
 * Dos backups seguidos en el mismo segundo no deben pisarse, así que se
 * añade un sufijo corto cuando el nombre ya existe.
 */
function nombreLibre(directorio, base) {
  let nombre = `${base}.db`;
  let n = 1;
  while (fs.existsSync(path.join(directorio, nombre))) {
    nombre = `${base}-${n}.db`;
    n += 1;
  }
  return nombre;
}

/**
 * Crea una copia de seguridad coherente.
 * @returns {{ruta:string, bytes:number, sha256:string, duracionMs:number}}
 */
function crear({ nota = null, ip = null } = {}) {
  const cfg = config();
  fs.mkdirSync(cfg.rutas.backups, { recursive: true });
  const nombre = nombreLibre(cfg.rutas.backups, `backup-${selloTiempo()}`);
  const destino = path.join(cfg.rutas.backups, nombre);

  const inicio = Date.now();
  const con = conexion();
  // VACUUM INTO escribe una copia compacta y consistente de toda la base.
  // No admite parametros enlazados: el destino lo genera la propia
  // aplicacion y se escapa comillas dobles por si acaso.
  con.exec(`VACUUM INTO '${destino.replace(/'/g, "''")}'`);
  const duracionMs = Date.now() - inicio;

  const buffer = fs.readFileSync(destino);
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

  // Comprobacion de integridad de la propia copia.
  const control = verificarArchivo(destino);
  if (!control.ok) {
    log.error('la copia de seguridad no supera el control de integridad', { destino });
    throw new Error(`La copia creada no es valida: ${control.detalle.join('; ')}`);
  }

  if (nota) fs.writeFileSync(`${destino}.txt`, `Copia de seguridad\n${new Date().toISOString()}\n${nota}\n`, 'utf8');

  auditoriaRepo.registrar({
    accion: 'admin.backup',
    entidad: 'sistema',
    detalle: { archivo: nombre, bytes: buffer.length },
    ip,
    actor: 'admin',
  });
  log.info('copia de seguridad creada', { archivo: nombre, bytes: buffer.length, duracionMs });

  return { ruta: destino, archivo: nombre, bytes: buffer.length, sha256, duracionMs, integridad: control };
}

/** Controla la integridad de un fichero SQLite. */
function verificarArchivo(ruta) {
  let db;
  try {
    db = new (require('better-sqlite3'))(ruta, { readonly: true, fileMustExist: true });
  } catch (err) {
    return { ok: false, detalle: [`el fichero no es una base de datos SQLite (${err.message})`] };
  }
  try {
    const filas = db.prepare('PRAGMA integrity_check').all();
    const ok = filas.length === 1 && filas[0].integrity_check === 'ok';
    return { ok, detalle: filas.map((f) => f.integrity_check) };
  } catch (err) {
    return { ok: false, detalle: [`el fichero no es una base de datos SQLite utilizable (${err.message})`] };
  } finally {
    db.close();
  }
}

/**
 * Restaura una copia. Cierra la base activa, sustituye el fichero (guardando
 * antes el anterior) y vuelve a abrir.
 * @param {string} ruta ruta de la copia .db
 */
function restaurar(ruta, { ip = null } = {}) {
  const cfg = config();
  if (!fs.existsSync(ruta)) throw new Error(`No existe la copia indicada: ${ruta}`);

  const control = verificarArchivo(ruta);
  if (!control.ok) {
    throw new Error(`La copia no supera el control de integridad: ${control.detalle.join('; ')}`);
  }

  const { abrir, cerrar } = require('../database');
  const activa = cfg.baseDatos.archivo;
  cerrar();

  // Se conservan los ficheros auxiliares de WAL antes de tocar nada.
  const reserva = `${activa}.antes-de-restaurar-${selloTiempo()}`;
  const hayReserva = fs.existsSync(activa);
  if (hayReserva) fs.copyFileSync(activa, reserva);
  for (const sufijo of ['-wal', '-shm']) {
    if (fs.existsSync(activa + sufijo)) fs.renameSync(activa + sufijo, reserva + sufijo);
  }

  fs.copyFileSync(ruta, activa);
  abrir(activa);

  auditoriaRepo.registrar({
    accion: 'admin.restaurar',
    entidad: 'sistema',
    detalle: { origen: path.basename(ruta), reserva: hayReserva ? path.basename(reserva) : null },
    ip,
    actor: 'admin',
  });
  log.warn('base de datos restaurada', { origen: path.basename(ruta), reserva: hayReserva ? path.basename(reserva) : null });

  return { restaurado: true, reserva: hayReserva ? reserva : null, integridad: integridad() };
}

/** Lista las copias disponibles, de la mas reciente a la mas antigua. */
function listar() {
  const cfg = config();
  if (!fs.existsSync(cfg.rutas.backups)) return [];
  return fs
    .readdirSync(cfg.rutas.backups)
    .filter((f) => f.endsWith('.db'))
    .map((f) => {
      const ruta = path.join(cfg.rutas.backups, f);
      const st = fs.statSync(ruta);
      return { archivo: f, bytes: st.size, creadoEn: st.mtime.toISOString() };
    })
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
}

module.exports = { crear, restaurar, listar, verificarArchivo };