'use strict';
/**
 * Limites de peticiones.
 *
 * Se aplican tres niveles:
 *   1. Global por IP: evita que una direccion agote el servidor.
 *   2. Especifico del registro: evita el alta masiva automatizada.
 *   3. Verificacion publica: evita que se exhausten los tokens del QR.
 *
 * Las claves se construyen con `req.ip`, que Express obtiene de la
 * cabecera X-Forwarded-For SOLO si se ha configurado CONFIAR_PROXY=true.
 * Sin esa opcion, un atacante no puede falsear su IP desde fuera.
 */
const rateLimit = require('express-rate-limit');
const { config } = require('../config');

function mensaje(texto) {
  return (req, res) => {
    res.status(429).json({
      ok: false,
      error: { codigo: 'DEMASIADAS_PETICIONES', mensaje: texto },
    });
  };
}

const limiteGlobal = rateLimit({
  windowMs: 60_000,
  limit: config().seguridad.limiteGlobalPorIpMin,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: mensaje('Ha enviado demasiadas peticiones. Espere un minuto e inténtelo de nuevo.'),
});

const limiteRegistro = rateLimit({
  windowMs: 60_000,
  limit: config().seguridad.limiteRegistroPorIpMin,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: mensaje('Ha enviado demasiados registros desde esta conexión. Espere un minuto.'),
});

const limiteLectura = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: mensaje('Ha consultado demasiadas veces. Espere un momento.'),
});

const limiteAdmin = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: mensaje('Demasiadas peticiones administrativas. Espere un minuto.'),
});

module.exports = { limiteGlobal, limiteRegistro, limiteLectura, limiteAdmin };