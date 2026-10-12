'use strict';
/**
 * Repositorio de certificados.
 *
 * Un participante tiene como mucho UN certificado vigente
 * (indice parcial unico `ux_certificados_vigente`). Las reemisiones crean una
 * fila nueva con `version` incrementada y revocan la anterior; nunca se
 * sobrescribe un PDF ya emitido.
 */
const crypto = require('node:crypto');
const { conexion, enTransaccion } = require('../database');
const { ahoraIso } = require('../utils/fechas');
const { tokenVerificacion } = require('../utils/ids');

const ESTADOS_VALIDOS = ['registrado', 'verificado', 'revocado', 'anulado'];

function sha256(archivo) {
  return crypto.createHash('sha256').update(archivo).digest('hex');
}

function siguienteVersion(participanteId) {
  const r = conexion()
    .prepare('SELECT COALESCE(MAX(version), 0) AS v FROM certificados WHERE participante_id = ?')
    .get(participanteId);
  return r.v + 1;
}

function vigenteDe(participanteId) {
  return conexion()
    .prepare("SELECT * FROM certificados WHERE participante_id = ? AND estado IN ('registrado','verificado') ORDER BY version DESC LIMIT 1")
    .get(participanteId) || null;
}

function porId(id) {
  return conexion().prepare('SELECT * FROM certificados WHERE id = ?').get(id) || null;
}

function porToken(token) {
  if (!token || typeof token !== 'string') return null;
  return conexion().prepare('SELECT * FROM certificados WHERE token_verificacion = ?').get(token) || null;
}

function listarPorParticipante(participanteId) {
  return conexion()
    .prepare('SELECT * FROM certificados WHERE participante_id = ? ORDER BY version DESC')
    .all(participanteId);
}

function listar({ limite = 100 } = {}) {
  return conexion()
    .prepare(
      `SELECT c.*, p.codigo_publico, p.rol
         FROM certificados c JOIN participantes p ON p.id = c.participante_id
        ORDER BY c.id DESC LIMIT ?`
    )
    .all(limite);
}

/** Crea la fila del certificado dentro de una transaccion. */
function crear({ participanteId, estado = 'registrado', emitidoEn, paginas, plantillaVersion }) {
  return enTransaccion(() => {
    const con = conexion();
    const version = siguienteVersion(participanteId);
    const ahora = ahoraIso();
    // Si ya habia un vigente, se revoca para que el indice unico no choque.
    const previo = vigenteDe(participanteId);
    if (previo) {
      con.prepare("UPDATE certificados SET estado='revocado', revocado_en=?, motivo_revocacion=?, actualizado_en=? WHERE id=?")
        .run(ahora, 'Reemitido por una nueva version', ahora, previo.id);
    }
    const info = con
      .prepare(
        `INSERT INTO certificados
           (participante_id, version, token_verificacion, emitido_en, plantilla_version, paginas,
            estado_generacion, estado, intentos, creado_en, actualizado_en)
         VALUES (?,?,?,?,?,?, 'generando', ?, 0, ?, ?)`
      )
      .run(participanteId, version, tokenVerificacion(), emitidoEn || ahora, plantillaVersion || 'v4', paginas || '1', estado, ahora, ahora);
    return porId(info.lastInsertRowid);
  });
}

function marcarGenerado(id, { rutaPdf, sha256Pdf, bytes }) {
  const ahora = ahoraIso();
  return conexion()
    .prepare(
      `UPDATE certificados
          SET estado_generacion='generado', ruta_pdf=?, sha256_pdf=?, bytes=?,
              error_ultimo=NULL, intentos=intentos+1, actualizado_en=?
        WHERE id=?`
    )
    .run(rutaPdf, sha256Pdf, bytes ?? null, ahora, id);
}

function marcarError(id, motivo) {
  const ahora = ahoraIso();
  return conexion()
    .prepare(
      `UPDATE certificados
          SET estado_generacion='error', error_ultimo=?, intentos=intentos+1, actualizado_en=?
        WHERE id=?`
    )
    .run(String(motivo).slice(0, 500), ahora, id);
}

function restaurarAPendiente(id) {
  const ahora = ahoraIso();
  return conexion()
    .prepare("UPDATE certificados SET estado_generacion='pendiente', error_ultimo=NULL, actualizado_en=? WHERE id=?")
    .run(ahora, id);
}

function revocar(id, motivo) {
  const ahora = ahoraIso();
  return conexion()
    .prepare("UPDATE certificados SET estado='revocado', revocado_en=?, motivo_revocacion=?, actualizado_en=? WHERE id=?")
    .run(ahora, motivo || 'Revocado por HCGA', ahora, id);
}

function marcarVerificado(id, fechaVerificacion) {
  const ahora = ahoraIso();
  return conexion()
    .prepare("UPDATE certificados SET estado='verificado', fecha_verificacion=?, actualizado_en=? WHERE id=?")
    .run(fechaVerificacion || ahora, ahora, id);
}

/** Sincroniza el estado del certificado con el del participante. */
function sincronizarEstado(participanteId) {
  const vigente = vigenteDe(participanteId);
  if (!vigente) return null;
  return vigente;
}

module.exports = {
  sha256,
  siguienteVersion,
  vigenteDe,
  porId,
  porToken,
  listarPorParticipante,
  listar,
  crear,
  marcarGenerado,
  marcarError,
  restaurarAPendiente,
  revocar,
  marcarVerificado,
  sincronizarEstado,
  ESTADOS_VALIDOS,
};