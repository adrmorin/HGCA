'use strict';
/**
 * Middleware de autenticacion administrativa.
 *
 * Criterios:
 *  - El backend decide siempre. Ocultar un boton en el frontend no protege nada.
 *  - La clave se compara con `timingSafeEqual` para no filtrar informacion por
 *    el tiempo de respuesta.
 *  - Si ADMIN_HASH no esta configurado, los endpoints administrativos quedan
 *    CERRADOS (403), nunca abiertos. Es preferible bloquear que exponer.
 *  - La clave viaja en la cabecera `X-Admin-Key` o en `Authorization: Bearer`.
 */
const crypto = require('node:crypto');
const { config } = require('../config');
const auditoriaRepo = require('../repositories/auditoria.repo');
const { crearLogger } = require('../utils/logger');

const log = crearLogger('seguridad');

/** Deriva el hash scrypt con los parametros acordados. */
function derivarHash(clave, saltHex) {
  const salt = Buffer.from(saltHex, 'hex');
  return crypto.scryptSync(clave, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
}

/** Formato de almacenamiento del hash: "scrypt$<saltHex>$<hashHex>". */
function crearHashAdmin(clave) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `scrypt$${salt}$${derivarHash(clave, salt)}`;
}

/** Comprueba una clave contra el hash guardado, en tiempo constante. */
function verificarClave(clave, hashAlmacenado) {
  if (!clave || !hashAlmacenado) return false;
  const partes = String(hashAlmacenado).split('$');
  if (partes.length !== 3 || partes[0] !== 'scrypt') return false;
  const calculado = Buffer.from(derivarHash(clave, partes[1]), 'hex');
  const esperado = Buffer.from(partes[2], 'hex');
  if (calculado.length !== esperado.length) return false;
  return crypto.timingSafeEqual(calculado, esperado);
}

function claveDeLaPeticion(req) {
  const cabecera = req.get('x-admin-key');
  if (cabecera) return cabecera;
  const auth = req.get('authorization') || '';
  if (/^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, '').trim();
  return null;
}

/** Middleware que exige una clave de administración válida. */
function exigirAdmin(req, res, next) {
  const cfg = config();
  if (!cfg.seguridad.hashAdmin) {
    log.warn('acceso administrativo denegado: ADMIN_HASH no esta configurado', { ruta: req.path });
    auditoriaRepo.registrar({
      accion: 'admin.acceso',
      resultado: 'denegado',
      detalle: { motivo: 'ADMIN_HASH no configurado', ruta: req.originalUrl },
      ip: req.ip,
      actor: 'anonimo',
    });
    return res.status(503).json({
      ok: false,
      error: {
        codigo: 'ADMIN_NO_CONFIGURADO',
        mensaje: 'El acceso administrativo no está habilitado en este servidor.',
      },
    });
  }

  const clave = claveDeLaPeticion(req);
  if (!clave || !verificarClave(clave, cfg.seguridad.hashAdmin)) {
    log.warn('acceso administrativo denegado', { ruta: req.originalUrl, ip: req.ip });
    auditoriaRepo.registrar({
      accion: 'admin.acceso',
      resultado: 'denegado',
      detalle: { ruta: req.originalUrl },
      ip: req.ip,
      actor: 'anonimo',
    });
    return res.status(401).json({
      ok: false,
      error: { codigo: 'NO_AUTORIZADO', mensaje: 'Credenciales administrativas incorrectas.' },
    });
  }

  req.admin = { actor: 'admin' };
  next();
}

module.exports = { exigirAdmin, crearHashAdmin, verificarClave };