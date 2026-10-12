'use strict';
/**
 * Arranque del servidor.
 *
 * Antes de aceptar trafico se comprueba, en este orden:
 *   1. Que la configuracion sea valida.
 *   2. Que la base de datos exista y tenga el esquema al dia (migraciones).
 *   3. Que la plantilla del certificado este disponible.
 * Si algo falta, se dice exactamente que y se detiene: es preferible un
 * arranque fallido y claro que un servidor a medias.
 */
const fs = require('node:fs');
const { config } = require('./config');
const { createApp } = require('./app');
const { migrar } = require('./database/migrate');
const { abrir, cerrar } = require('./database');
const correoService = require('./services/correo.service');
const { crearLogger } = require('./utils/logger');

function comprobarEntorno() {
  const cfg = config();
  const problemas = [];

  if (!fs.existsSync(cfg.baseDatos.archivo)) {
    // Se crea: es el comportamiento normal de la primera ejecucion.
    fs.mkdirSync(require('node:path').dirname(cfg.baseDatos.archivo), { recursive: true });
  }
  if (!fs.existsSync(cfg.certificados.plantilla)) {
    problemas.push(
      `Falta la plantilla del certificado:\n     ${cfg.certificados.plantilla}\n` +
      '     Copiela a templates/certificado-original.pdf (vease README, paso 7).'
    );
  }
  if (!fs.existsSync(cfg.rutas.frontend)) {
    problemas.push(`Falta la carpeta del frontend: ${cfg.rutas.frontend}`);
  }
  return problemas;
}

async function arrancar() {
  const cfg = config();
  const log = crearLogger('servidor');

  const problemas = comprobarEntorno();
  if (problemas.length) {
    console.error('\nNo se puede arrancar:\n' + problemas.map((p) => '  - ' + p).join('\n'));
    process.exit(1);
  }

  abrir(cfg.baseDatos.archivo);
  const info = migrar({ log });
  log.info('base de datos lista', {
    archivo: cfg.baseDatos.archivo,
    esquema: info.versionActual,
    migracionesAplicadas: info.aplicadas.length,
  });

  const app = createApp();

  // Comprobacion del SMTP al arrancar: avisa pronto, no en el primer envio.
  if (cfg.correo.conectarAlArrancar) {
    try {
      const r = await correoService.verificarConexion();
      log.info('SMTP verificado', { modo: r.modo, mensaje: r.mensaje });
    } catch (err) {
      const { usuario, tecnico } = correoService.explicarError(err);
      log.warn(`el correo no esta disponible todavia: ${usuario}`, { tecnico });
      log.warn('el registro y los certificados NO se pierden aunque el correo falle');
    }
  }

  const servidor = app.listen(cfg.puerto, cfg.host, () => {
    const url = `http://${cfg.host}:${cfg.puerto}`;
    console.log('');
    console.log('  HCGA Trading LLC · Registro de participantes');
    console.log('  ------------------------------------------------');
    console.log(`  Servidor escuchando en:  ${url}`);
    console.log(`  Formulario:              ${url}/`);
    console.log(`  Estadisticas publicas:   ${url}/api/publico/estadisticas`);
    console.log(`  Base de datos:           ${cfg.baseDatos.archivo}`);
    console.log(`  Plantilla:               ${cfg.certificados.plantilla}`);
    console.log(`  Correo:                  ${cfg.correo.modoCaptura ? 'MODO CAPTURA (no sale a Internet)' : `SMTP ${cfg.correo.host || '(sin configurar)'}`}`);
    console.log(`  Administracion:          ${cfg.seguridad.hashAdmin ? 'habilitada' : 'DESHABILITADA (defina ADMIN_HASH)'}`);
    console.log('');
    log.info('servidor arrancado', { url, entorno: cfg.entorno });
  });

  servidor.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\nEl puerto ${cfg.puerto} ya esta ocupado. Cierre el otro programa o cambie PORT en .env.\n`);
    } else {
      console.error('\nError al arrancar el servidor:', err.message);
    }
    process.exit(1);
  });

  const apagar = (senal) => {
    console.log(`\nRecibida la senal ${senal}; cerrando...`);
    servidor.close(() => {
      correoService.cerrar();
      cerrar();
      console.log('Servidor cerrado correctamente.');
      process.exit(0);
    });
    // Si alguna conexion se queda colgada, se fuerza la salida.
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGINT', () => apagar('SIGINT'));
  process.on('SIGTERM', () => apagar('SIGTERM'));

  return servidor;
}

if (require.main === module) {
  arrancar().catch((err) => {
    console.error('\nError grave al arrancar:', err);
    process.exit(1);
  });
}

module.exports = { arrancar };