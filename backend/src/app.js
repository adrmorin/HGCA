'use strict';
/**
 * Construccion de la aplicacion Express.
 *
 * Se exporta como factory (`createApp`) para que las pruebas puedan levantar
 * una instancia aislada, con su propia base de datos temporal.
 */
const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');

const { config } = require('./config');
const rutas = require('./routes/api.routes');
const { manejador, noEncontrado } = require('./middleware/errores');
const { limiteGlobal } = require('./middleware/limites');
const { idPeticion, sinCache, temporizador } = require('./middleware/contexto');

function createApp() {
  const cfg = config();
  const app = express();

  // El servidor puede estar detras de un proxy inverso propio. Solo se confia
  // en X-Forwarded-For si el operador lo activa de forma explicita; sin eso,
  // la IP real la ve todo el mundo y los limites por IP son fiables.
  app.set('trust proxy', cfg.seguridad.confiarProxy ? 1 : false);
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'no-referrer' },
    })
  );
  app.use(compression());
  app.use(temporizador);
  app.use(idPeticion);
  app.use(limiteGlobal);

  // --- API -------------------------------------------------------------
  app.use('/api', sinCache, express.json({ limit: cfg.seguridad.cuerpoMaximoBytes }), rutas);

  // --- Pagina publica de verificacion (la que abre el QR) --------------
  app.get('/verificar/:token', (req, res) => {
    const archivo = path.join(cfg.rutas.frontend, 'verificar.html');
    if (!fs.existsSync(archivo)) {
      return res.status(404).type('text/plain; charset=utf-8').send('Página de verificación no disponible en esta instalación.');
    }
    return res.sendFile(archivo);
  });

  // --- Frontend --------------------------------------------------------
  app.use(
    express.static(cfg.rutas.frontend, {
      index: 'index.html',
      extensions: ['html'],
      setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache'),
    })
  );

  app.use(noEncontrado);
  app.use(manejador);

  return app;
}

module.exports = { createApp };