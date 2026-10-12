'use strict';
/**
 * Manejo centralizado de errores.
 *
 * Reglas:
 *  - El cliente recibe un mensaje comprensible y un codigo estable. Nunca
 *    recibe una traza, un SQL ni una ruta del servidor.
 *  - El detalle tecnico va siempre al log del servidor.
 *  - Las respuestas JSON tienen siempre la misma forma: { ok, error|datos }.
 */
const { crearLogger } = require('../utils/logger');

const log = crearLogger('errores');

/** Error de negocio con codigo y estado HTTP. */
class ErrorApi extends Error {
  constructor(codigo, mensaje, estado = 400, extra = {}) {
    super(mensaje);
    this.codigo = codigo;
    this.estado = estado;
    this.extra = extra;
  }
}

/** Envuelve un handler async para que sus rechazos lleguen a Express. */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// eslint-disable-next-line no-unused-vars
function noEncontrado(req, res, next) {
  res.status(404).json({
    ok: false,
    error: { codigo: 'RUTA_NO_ENCONTRADA', mensaje: 'El recurso solicitado no existe.' },
  });
}

function manejador(err, req, res, _next) {
  const esProduccion = process.env.NODE_ENV === 'production';

  if (err instanceof ErrorApi) {
    if (err.estado >= 500) log.error(err.mensaje, { ruta: req.originalUrl, codigo: err.codigo });
    else log.warn(err.mensaje, { ruta: req.originalUrl, codigo: err.codigo });
    return res.status(err.estado).json({ ok: false, error: { codigo: err.codigo, mensaje: err.mensaje, ...err.extra } });
  }

  // Errores conocidos de SQLite.
  const msg = String(err && err.message);
  if (/UNIQUE constraint failed/.test(msg)) {
    return res.status(409).json({
      ok: false,
      error: { codigo: 'DUPLICADO', mensaje: 'Ya existe un registro con esos datos.' },
    });
  }
  if (/SQLITE_BUSY|database is locked/.test(msg)) {
    return res.status(503).json({
      ok: false,
      error: { codigo: 'BASE_DE_DATOS_OCUPADA', mensaje: 'La base de datos está ocupada. Inténtelo de nuevo en un momento.' },
    });
  }

  // Cuerpo demasiado grande.
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({
      ok: false,
      error: { codigo: 'CUERPO_DEMASIADO_GRANDE', mensaje: 'La solicitud es demasiado grande.' },
    });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      ok: false,
      error: { codigo: 'JSON_INVALIDO', mensaje: 'El cuerpo de la solicitud no es JSON válido.' },
    });
  }

  log.error('error no controlado', {
    ruta: req.originalUrl,
    metodo: req.method,
    mensaje: msg,
    pila: esProduccion ? undefined : err && err.stack,
  });

  res.status(500).json({
    ok: false,
    error: {
      codigo: 'ERROR_INTERNO',
      mensaje: 'Se ha producido un error en el servidor. Inténtelo de nuevo más tarde.',
      // El detalle tecnico solo se expone fuera de produccion.
      ...(esProduccion ? {} : { detalle: msg }),
    },
  });
}

module.exports = { ErrorApi, asyncHandler, manejador, noEncontrado };