'use strict';
/**
 * Formato de fechas.
 *
 * El certificado dice "FECHA Y HORA DE EMISION (HORA DEL ESTE, EE. UU.)", así que
 * el formato se fija en America/New_York por defecto (configurable con
 * ZONA_HORARIA). Se guarda siempre UTC en la base de datos.
 */
const { config } = require('../config');

function ahoraIso() {
  return new Date().toISOString();
}

function formatear(fechaIso, opciones = {}) {
  const cfg = config();
  const fecha = fechaIso instanceof Date ? fechaIso : new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return '—';
  const fmt = new Intl.DateTimeFormat('es-US', {
    timeZone: cfg.certificados.zonaHoraria,
    dateStyle: opciones.soloFecha ? 'medium' : 'medium',
    timeStyle: opciones.soloFecha ? undefined : 'short',
    hour12: false,
  });
  return fmt.format(fecha) + ' ' + opciones.zona || cfg.certificados.zonaHoraria;
}

/** "11 oct 2026, 09:30 ET" -> para el certificado y para el correo. */
function fechaCertificado(fechaIso) {
  if (!fechaIso) return '—';
  return formatear(fechaIso, { zona: 'ET' });
}

function fechaCorta(fechaIso) {
  if (!fechaIso) return '—';
  return formatear(fechaIso, { soloFecha: true });
}

/** Etiqueta de estado legible para el certificado. */
function etiquetaEstado(estado) {
  return (
    {
      registrado: 'REGISTRADO',
      verificado: 'VERIFICADO',
      revocado: 'REVOCADO',
      anulado: 'ANULADO',
    }[estado] || 'REGISTRADO'
  );
}

/** Texto largo para el certificado: "Pendiente de confirmacion" / fecha. */
function textoEstadoCertificado(estado, fechaVerificacion) {
  if (estado === 'verificado') return 'Verificado';
  if (estado === 'revocado') return 'Revocado';
  if (estado === 'anulado') return 'Anulado';
  return 'Pendiente de confirmacion';
}

module.exports = { ahoraIso, formatear, fechaCertificado, fechaCorta, etiquetaEstado, textoEstadoCertificado };