'use strict';
/**
 * Repositorio de auditoria.
 *
 * Solo operaciones administrativas y de sistema. Nunca se guardan contrasenas,
 * tokens de verificacion ni cuerpos de correo.
 */
const { conexion } = require('../database');
const { ahoraIso } = require('../utils/fechas');

const ACCIONES = Object.freeze({
  'certificado.generar': 'Generación de certificado',
  'certificado.reemitir': 'Reemision de certificado',
  'certificado.revocar': 'Revocacion de certificado',
  'certificado.enviar': 'Envio de certificado por correo',
  'participante.anular': 'Anulacion de registro',
  'participante.verificar': 'Confirmacion de correo',
  'admin.exportar': 'Exportacion JSON',
  'admin.backup': 'Creacion de copia de seguridad',
  'admin.restaurar': 'Restauracion de copia de seguridad',
  'admin.acceso': 'Acceso administrativo',
});

function registrar({ accion, entidad = null, entidadId = null, resultado = 'ok', detalle = null, ip = null, actor = 'sistema' }) {
  if (!ACCIONES[accion]) throw new Error(`Accion de auditoria desconocida: ${accion}`);
  conexion()
    .prepare(
      `INSERT INTO auditoria (fecha, actor, accion, entidad, entidad_id, resultado, detalle, ip)
       VALUES (?,?,?,?,?,?,?,?)`
    )
    .run(ahoraIso(), actor, accion, entidad, entidadId, resultado, detalle ? JSON.stringify(detalle).slice(0, 2000) : null, ip);
}

function listar({ limite = 200 } = {}) {
  return conexion().prepare('SELECT * FROM auditoria ORDER BY id DESC LIMIT ?').all(limite);
}

module.exports = { registrar, listar, ACCIONES };