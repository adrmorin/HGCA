'use strict';
/**
 * Repositorio del historial de correos.
 *
 * Se registra CADA intento. Un fallo de correo nunca borra ni el participante
 * ni el certificado: solo deja una fila con estado 'error' y el motivo.
 */
const { conexion } = require('../database');
const { ahoraIso } = require('../utils/fechas');

function registrarIntento({
  certificadoId,
  destinatario,
  remitente,
  asunto,
  adjuntoRuta = null,
  adjuntoBytes = null,
}) {
  const con = conexion();
  const ahora = ahoraIso();
  const intento = con
    .prepare('SELECT COALESCE(MAX(intento),0) AS n FROM correos WHERE certificado_id = ?')
    .get(certificadoId).n + 1;
  const info = con
    .prepare(
      `INSERT INTO correos
         (certificado_id, destinatario, remitente, asunto, estado, intento,
          adjunto_ruta, adjunto_bytes, creado_en, actualizado_en)
       VALUES (?,?,?,?, 'en_curso', ?, ?, ?, ?, ?)`
    )
    .run(certificadoId, destinatario, remitente, asunto, intento, adjuntoRuta, adjuntoBytes, ahora, ahora);
  // Se devuelve el identificador numérico, no la fila completa: quien llama
  // lo necesita para marcar el resultado del intento.
  return Number(info.lastInsertRowid);
}

function porId(id) {
  return conexion().prepare('SELECT * FROM correos WHERE id = ?').get(id) || null;
}

function marcarAceptado(id, smtpId) {
  const ahora = ahoraIso();
  return conexion()
    .prepare("UPDATE correos SET estado='aceptado', aceptado_en=?, mensaje_smtp_id=?, actualizado_en=? WHERE id=?")
    .run(ahora, smtpId || null, ahora, id);
}

function marcarError(id, motivo) {
  const ahora = ahoraIso();
  return conexion()
    .prepare("UPDATE correos SET estado='error', motivo_error=?, actualizado_en=? WHERE id=?")
    .run(String(motivo).slice(0, 500), ahora, id);
}

function ultimoExitoso(certificadoId) {
  return conexion()
    .prepare("SELECT * FROM correos WHERE certificado_id = ? AND estado='aceptado' ORDER BY id DESC LIMIT 1")
    .get(certificadoId) || null;
}

function listarPorCertificado(certificadoId) {
  return conexion()
    .prepare('SELECT * FROM correos WHERE certificado_id = ? ORDER BY id DESC')
    .all(certificadoId);
}

/** Cuenta los envios aceptados; sirve para evitar reenvios indiscriminados. */
function totalAceptados(certificadoId) {
  return conexion()
    .prepare("SELECT COUNT(*) AS n FROM correos WHERE certificado_id = ? AND estado='aceptado'")
    .get(certificadoId).n;
}

module.exports = {
  registrarIntento,
  porId,
  marcarAceptado,
  marcarError,
  ultimoExitoso,
  listarPorCertificado,
  totalAceptados,
};