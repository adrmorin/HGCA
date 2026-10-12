'use strict';
/**
 * Utilidad compartida por las pruebas.
 *
 * Cada archivo de pruebas trabaja en una base de datos SQLite TEMPORAL propia,
 * en un directorio temporal del sistema. Así:
 *   - las pruebas nunca tocan los datos reales del usuario;
 *   - se pueden ejecutar en cualquier orden y repetidas veces;
 *   - se puede comprobar la persistencia reiniciando la conexión.
 */
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const RAIZ = path.resolve(__dirname, '..', '..');

/**
 * Prepara un entorno aislado y devuelve un "contexto" de pruebas.
 * @param {object} [opciones] sobreescrituras de variables de entorno
 */
function crearContexto(opciones = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hcga-prueba-'));
  const env = {
    NODE_ENV: 'test',
    RUTA_BASE_DATOS: path.join(dir, 'prueba.db'),
    RUTA_DATOS: dir,
    RUTA_ALMACENAMIENTO: path.join(dir, 'storage'),
    RUTA_LOGS: path.join(dir, 'logs'),
    RUTA_BACKUPS: path.join(dir, 'backups'),
    RUTA_EXPORTACIONES: path.join(dir, 'exportaciones'),
    RUTA_CAPTURA_CORREO: path.join(dir, 'captura'),
    SMTP_MODO_CAPTURA: 'true',
    ADMIN_HASH: '',
    CONTADORES_CACHE_MS: '0',
    // Las pruebas hacen muchos registros seguidos desde la misma IP; el límite
    // por defecto (10/min) se sube para no confundir el objetivo de la prueba.
    LIMITE_REGISTRO_POR_IP_MIN: '10000',
    LIMITE_POR_IP_MIN: '100000',
    HOST: '127.0.0.1',
    PORT: '0',
    ORIGEN_PUBLICO: 'http://127.0.0.1:3000',
    ...opciones,
  };

  // Las variables se aplican ANTES de cargar la configuración.
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }

  const { recargar } = require('../src/config');
  const cfg = recargar(env);
  const db = require('../src/database');
  db.abrir(cfg.baseDatos.archivo);
  require('../src/database/migrate').migrar();

  return {
    dir,
    cfg,
    db,
    /** Cierra la base de datos y borra el directorio temporal. */
    limpiar() {
      try { db.cerrar(); } catch { /* ya cerrada */ }
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* ya borrado */ }
      // Restaura la configuración real del proyecto.
      const { recargar: recargarReal } = require('../src/config');
      recargarReal({ RUTA_BASE_DATOS: undefined });
    },
  };
}

/** Datos de un registro válido, con valores por defecto sensatos. */
function registroValido(over = {}) {
  const n = crypto.randomBytes(4).toString('hex');
  return {
    role: 'carrier',
    name: 'Transportes Prueba ' + n,
    idType: 'USDOT',
    idValue: String(100000 + (parseInt(n.slice(0, 4), 16) % 900000)),
    email: `prueba.${n}@ejemplo.com`,
    phone: '(239) 555-0123',
    opt: {},
    consents: { terms: true, contact: true, publicListing: false, shareWithFinanciers: false },
    language: 'es',
    source: 'prueba',
    ...over,
  };
}

/** Arranca el servidor HTTP en un puerto libre y devuelve { base, cerrar }. */
async function servidorEnPrueba(cfg) {
  const { createApp } = require('../src/app');
  const app = createApp();
  const servidor = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const puerto = servidor.address().port;
  return {
    app,
    servidor,
    puerto,
    base: `http://127.0.0.1:${puerto}`,
    /** fetch(...) contra este servidor. */
    async pedir(ruta, opciones = {}) {
      const r = await fetch(`http://127.0.0.1:${puerto}${ruta}`, {
        ...opciones,
        headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) },
        body: opciones.body ? JSON.stringify(opciones.body) : undefined,
      });
      let cuerpo = null;
      try { cuerpo = await r.json(); } catch { cuerpo = null; }
      return { status: r.status, cuerpo };
    },
    cerrar() {
      return new Promise((resolve) => servidor.close(resolve));
    },
  };
}

module.exports = { crearContexto, registroValido, servidorEnPrueba, RAIZ };