'use strict';
/**
 * Generacion de codigos QR (100 % local, sin servicios externos).
 *
 * El token viaja dentro del QR y es un valor aleatorio de 160 bits generado
 * con crypto. El QR contiene una URL de verificacion construida con
 * ORIGEN_PUBLICO: en local es http://127.0.0.1:3000 y en produccion el
 * dominio publico con HTTPS.
 */
const QRCode = require('qrcode');
const { config } = require('../config');
const layout = require('../config/certificado.layout');

/** URL publica de verificacion de un certificado. */
function urlVerificacion(token) {
  const origen = config().origenPublico.replace(/\/+$/, '');
  return `${origen}/verificar/${token}`;
}

/** Ruta relativa usada por el endpoint publico de verificacion. */
function rutaVerificacion(token) {
  return `/api/verificar/${token}`;
}

/**
 * Devuelve el QR como PNG en búfer.
 * @param {string} texto contenido del QR (normalmente la URL de verificacion)
 */
async function pngBuffer(texto, { tamano = 600 } = {}) {
  return QRCode.toBuffer(texto, {
    type: 'png',
    errorCorrectionLevel: layout.QR.nivelCorreccion,
    margin: layout.QR.margenBlanco,
    width: tamano,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

/** Genera el QR de un token y devuelve el búfer PNG. */
async function pngDeToken(token, opciones = {}) {
  return pngBuffer(urlVerificacion(token), opciones);
}

/**
 * Verifica que el token tenga la forma que produce `tokenVerificacion()`.
 * Evita que un endpoint publico reciba entradas absurdas o gigantic.
 */
function tokenTieneFormaValida(token) {
  return typeof token === 'string' && /^[A-Z2-9]{32}$/.test(token);
}

module.exports = { urlVerificacion, rutaVerificacion, pngBuffer, pngDeToken, tokenTieneFormaValida };