'use strict';
/**
 * Identificadores, tokens y sellos.
 *
 * Regla de seguridad: ningun identificador o token de verificacion puede
 * derivarse de datos personales ni ser correlativo. Todo lo aleatorio usa
 * crypto.randomBytes / randomUUID.
 */
const crypto = require('node:crypto');

const ALFABETO_BASE32 = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'; // sin I, L, O, 0, 1

/** Número aleatorio seguro en [0, max) sin sesgo de módulo. */
function enteroAleatorio(max) {
  if (max <= 0) return 0;
  const limite = Math.floor(0x100000000 / max) * max;
  const buf = crypto.randomBytes(4);
  const n = buf.readUInt32BE(0);
  return n < limite ? n % max : enteroAleatorio(max);
}

/** Cadena aleatoria de `longitud` caracteres usando un alfabeto sin ambiguedad. */
function cadenaAleatoria(longitud = 24) {
  let salida = '';
  while (salida.length < longitud) {
    const bytes = crypto.randomBytes(longitud);
    for (let i = 0; i < bytes.length && salida.length < longitud; i++) {
      salida += ALFABETO_BASE32[bytes[i] % ALFABETO_BASE32.length];
    }
  }
  return salida;
}

/** Token opaco del QR. 160 bits de entropia -> 32 caracteres base32. */
function tokenVerificacion() {
  return cadenaAleatoria(32);
}

/**
 * Codigo publico del participante: HCGA-CI-2026-7KQ4M2.
 * La parte aleatoria evita que se adivine el siguiente codigo mirando el actual.
 */
function codigoPublico(anio = new Date().getUTCFullYear()) {
  return `HCGA-CI-${anio}-${cadenaAleatoria(6)}`;
}

/** Sello digital shown en el certificado (campo {{SELLO_DIGITAL}}). */
function selloDigital(prefijo = 'HCGA-SELLO-') {
  return prefijo + crypto.createHash('sha256').update(crypto.randomBytes(24)).digest('hex').slice(0, 32).toUpperCase();
}

/** Huella SHA-256 de la clave de unicidad del participante. */
function huella(clave) {
  return crypto.createHash('sha256').update(String(clave), 'utf8').digest('hex');
}

function compararEnTiempoConstante(a, b) {
  const ba = Buffer.from(String(a ?? ''), 'utf8');
  const bb = Buffer.from(String(b ?? ''), 'utf8');
  if (ba.length !== bb.length) {
    // Se compara igualmente para no filtrar la longitud por el tiempo de salida.
    crypto.timingSafeEqual(ba, ba);
    return false;
  }
  return crypto.timingSafeEqual(ba, bb);
}

module.exports = {
  enteroAleatorio,
  cadenaAleatoria,
  tokenVerificacion,
  codigoPublico,
  selloDigital,
  huella,
  compararEnTiempoConstante,
};