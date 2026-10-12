'use strict';
/**
 * Middleware auxiliar: identidad de la peticion y cabeceras de seguridad.
 */
const crypto = require('node:crypto');

/**
 * Anade un identificador a cada peticion y lo devuelve en la cabecera
 * `X-Request-Id`. Permite correlacionar un aviso del usuario con su linea en el
 * log sin exponer datos personales.
 */
function idPeticion(req, res, next) {
  const recibido = req.get('x-request-id');
  const id = recibido && /^[A-Za-z0-9_-]{8,64}$/.test(recibido) ? recibido : crypto.randomUUID();
  req.idPeticion = id;
  res.setHeader('X-Request-Id', id);
  next();
}

/**
 * NoCache: las respuestas de la API nunca deben quedarse en una cache
 * intermedia ni en el historial del navegador.
 */
function sinCache(_req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  next();
}

/**
 * Tiempo de respuesta en la cabecera, para diagnostico.
 */
function temporizador(req, res, next) {
  const inicio = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - inicio) / 1e6;
    res.locals.duracionMs = Math.round(ms * 100) / 100;
  });
  next();
}

module.exports = { idPeticion, sinCache, temporizador };