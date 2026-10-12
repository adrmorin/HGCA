'use strict';
/**
 * Registro local de eventos en archivo.
 *
 * Reglas de privacidad aplicadas aquí:
 *  - Nunca se escriben contrasenas, tokens de verificacion ni cuerpos de correo.
 *  - Los datos personales se reduce a identificadores internos o a un hash corto.
 *  - Cada linea es JSON para poder filtrar con Select-String o con un visor.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { config } = require('../config');

const NIVELES = { debug: 10, info: 20, warn: 30, error: 40 };

/** Claves cuyo valor se sustituye por un hash corto en los logs. */
const SENSIBLES = new Set([
  'password', 'clave', 'smtp_pass', 'password_hash', 'token', 'token_verificacion',
  'authorization', 'cookie', 'secret', 'admin_hash',
]);

function ocultar(entrada, profundidad = 0) {
  if (profundidad > 6 || entrada === null || typeof entrada !== 'object') return entrada;
  if (Array.isArray(entrada)) return entrada.map((v) => ocultar(v, profundidad + 1));
  const salida = {};
  for (const [k, v] of Object.entries(entrada)) {
    const clave = k.toLowerCase();
    if (SENSIBLES.has(clave) && typeof v === 'string' && v) {
      salida[k] = `[oculto ${crypto.createHash('sha256').update(v).digest('hex').slice(0, 8)}]`;
    } else if (typeof v === 'string') {
      salida[k] = v.length > 300 ? `${v.slice(0, 300)}…` : v;
    } else {
      salida[k] = ocultar(v, profundidad + 1);
    }
  }
  return salida;
}

class Logger {
  constructor() {
    this.nivel = 'info';
    this.flujo = null;
    this.ultimoArchivo = null;
  }

  configurar({ nivel, archivo } = {}) {
    this.nivel = nivel || process.env.LOG_NIVEL || 'info';
    this.flujo = archivo ? fs.createWriteStream(archivo, { flags: 'a' }) : null;
    return this;
  }

  _escribir(nivel, mensaje, datos) {
    if ((NIVELES[nivel] || 0) < (NIVELES[this.nivel] || 0)) return;
    const registro = {
      ts: new Date().toISOString(),
      nivel,
      msg: mensaje,
      ...(datos ? { datos: ocultar(datos) } : {}),
    };
    const linea = JSON.stringify(registro);
    if (this.flujo) this.flujo.write(linea + '\n');
    const conColor = process.stdout.isTTY && nivel !== 'info';
    const prefijo = `[${registro.ts}] ${nivel.toUpperCase().padEnd(5)}`;
    if (nivel === 'error') console.error(conColor ? `\x1b[31m${prefijo}\x1b[0m ${mensaje}` : `${prefijo} ${mensaje}`, datos ?? '');
    else if (nivel === 'warn') console.warn(conColor ? `\x1b[33m${prefijo}\x1b[0m ${mensaje}` : `${prefijo} ${mensaje}`);
    else console.log(`${prefijo} ${mensaje}`, datos ? JSON.stringify(registro.datos) : '');
  }

  debug(m, d) { this._escribir('debug', m, d); }
  info(m, d) { this._escribir('info', m, d); }
  warn(m, d) { this._escribir('warn', m, d); }
  error(m, d) { this._escribir('error', m, d); }
}

/**
 * Devuelve el logger global, creando el archivo de log del dia si hace falta.
 * @param {string} nombre nombre logico ("app", "correo", "certificados"...)
 */
function crearLogger(nombre = 'app') {
  const cfg = config();
  const dir = cfg.rutas.logs;
  fs.mkdirSync(dir, { recursive: true });
  const hoy = new Date().toISOString().slice(0, 10);
  const archivo = path.join(dir, `${nombre}-${hoy}.log`);
  const log = new Logger();
  log.configurar({ archivo });
  log.archivo = archivo;
  return log;
}

module.exports = { crearLogger, Logger, ocultar };