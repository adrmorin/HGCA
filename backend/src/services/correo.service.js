'use strict';
/**
 * Servicio de correo.
 *
 * Principios:
 *  - Nodemailer + parametros SMTP tomados de variables de entorno. Ninguna
 *    credencial esta en el codigo, ni en el frontend, ni en los logs.
 *  - Un fallo de correo NO borra ni el registro ni el certificado: solo deja
 *    una fila en `correos` con estado 'error' y su motivo.
 *  - "Aceptado" significa que el servidor SMTP acepto el mensaje. NO significa
 *    que haya llegado a la bandeja de entrada; el codigo lo refleja así.
 *  - Modo captura (SMTP_MODO_CAPTURA=true): los mensajes se guardan en disco
 *    y NO salen a Internet. Es el modo de las pruebas locales.
 */
const fs = require('node:fs');
const path = require('node:path');
const nodemailer = require('nodemailer');
const { config } = require('../config');
const correosRepo = require('../repositories/correos.repo');
const { crearLogger } = require('../utils/logger');

const log = crearLogger('correo');

let transporte = null;
let modoCacheado = null;

/**
 * Traduce los errores tipicos de Nodemailer a un texto apto para mostrar a un
 * usuario final (y otroDetailed para el log).
 */
function explicarError(err) {
  const codigo = err && err.code ? String(err.code) : 'E_SMTP';
  const mapa = {
    EAUTH: 'El servidor SMTP rechazó las credenciales.',
    EAUTH5: 'Credenciales SMTP incorrectas o sin permiso de envio.',
    ECONNECTION: 'No se pudo conectar con el servidor SMTP.',
    ECONNREFUSED: 'El servidor SMTP rechazo la conexion.',
    ETIMEDOUT: 'El servidor SMTP tardó demasiado en responder.',
    ESOCKET: 'Se interrumpio la conexion con el servidor SMTP.',
    EENVELOPE: 'El servidor SMTP rechazó el destinatario.',
    EMESSAGE: 'El servidor SMTP rechazó el mensaje.',
    ETOOLARGE: 'El mensaje supera el tamaño máximo admitido por el servidor.',
    ETLS: 'Problema de seguridad TLS con el servidor SMTP.',
    CERT_HAS_EXPIRED: 'El certificado TLS del servidor SMTP ha caducado.',
    EPROTO: 'Version de TLS no negociada con el servidor SMTP.',
  };
  return {
    codigo,
    usuario: mapa[codigo] || 'No se pudo entregar el correo en este momento.',
    tecnico: [codigo, err && err.command, err && err.responseCode]
      .filter(Boolean)
      .join(' | ')
      .slice(0, 400),
  };
}

function obtenerTransporte() {
  const cfg = config();
  if (modoCacheado === cfg.correo.modoCaptura && transporte) return transporte;

  if (cfg.correo.modoCaptura) {
    // No se abre ningun socket: el "envio" consisten en escribir el mensaje.
    transporte = { modoCaptura: true };
    log.warn('correo en MODO CAPTURA: los mensajes se guardan en disco y no salen a Internet', {
      destino: cfg.correo.rutaCaptura,
    });
  } else {
    if (!cfg.correo.host || !cfg.correo.clave) {
      throw new Error('SMTP no configurado: defina SMTP_HOST y SMTP_PASS en el archivo .env (vease docs/GUIA-SMTP.md).');
    }
    transporte = nodemailer.createTransport({
      host: cfg.correo.host,
      port: cfg.correo.puerto,
      secure: cfg.correo.seguro,
      auth: { user: cfg.correo.usuario, pass: cfg.correo.clave },
      connectionTimeout: cfg.correo.tiempoEsperaMs,
      greetingTimeout: cfg.correo.tiempoEsperaMs,
      socketTimeout: cfg.correo.tiempoEsperaMs,
      requireTLS: cfg.correo.exigirTls && !cfg.correo.seguro && cfg.correo.puerto !== 25,
      tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    });
    log.info('transporte SMTP configurado', { host: cfg.correo.host, puerto: cfg.correo.puerto, secure: cfg.correo.seguro });
  }
  modoCacheado = cfg.correo.modoCaptura;
  return transporte;
}

/** Verifica la conexion con el servidor SMTP. No envia nada. */
async function verificarConexion() {
  const t = obtenerTransporte();
  if (t.modoCaptura) {
    return { ok: true, modo: 'captura', mensaje: 'Modo captura activo: no se abre ninguna conexión SMTP.' };
  }
  await t.verify();
  return { ok: true, modo: 'smtp', mensaje: `Conexion correcta con ${config().correo.host}:${config().correo.puerto}.` };
}

/** Cuerpo del correo que acompana al certificado (texto de la hoja interna). */
function construirMensaje({ participante, certificado, enlaceConfirmacion }) {
  const cfg = config();
  const lineas = [
    `Hola ${participante.nombre},`,
    '',
    'recibimos y registramos su interes en la plataforma de HCGA Trading LLC.',
    `Adjuntamos su Certificado Digital de Intencion Comercial (codigo ${participante.codigo_publico}).`,
  ];
  if (enlaceConfirmacion) {
    lineas.push('Para confirmar su correo electrónico, haga clic aquí:', enlaceConfirmacion);
  } else {
    lineas.push('Para confirmar su correo electrónico, siga el enlace que recibe en este mensaje.');
  }
  lineas.push(
    'Este certificado no es un contrato y registrarse no tiene ningun costo.',
    'Nos pondremos en contacto con usted sobre el lanzamiento de la plataforma.',
    'Para corregir o eliminar su registro: ing.alberto@hcgatrading.com.',
    '',
    `HCGA Trading LLC`,
    `Este mensaje se ha enviado desde ${cfg.correo.remitente}.`
  );
  return lineas.join('\n');
}

/** Guarda el mensaje en disco cuando SMTP_MODO_CAPTURA=true. */
function guardarEnCaptura({ destinatario, asunto, texto, pdfRuta, pdfBytes }) {
  const cfg = config();
  const dir = path.join(cfg.correo.rutaCaptura, new Date().toISOString().slice(0, 10));
  fs.mkdirSync(dir, { recursive: true });
  const sello = new Date().toISOString().replace(/[:.]/g, '-');
  const base = `captura-${sello}-${destinatario.replace(/[^A-Za-z0-9._-]/g, '_')}`;
  const eml = path.join(dir, `${base}.txt`);
  const adjunto = pdfRuta ? path.join(dir, `${base}.pdf`) : null;

  const cabecera = [
    `Para: ${destinatario}`,
    `De: ${cfg.correo.remitenteNombre} <${cfg.correo.remitente}>`,
    `Asunto: ${asunto}`,
    `Fecha: ${new Date().toString()}`,
    '',
    texto,
    '',
    '---',
    'Mensaje capturado localmente. NO se ha entregado a ningun servidor externo.',
  ].join('\n');
  fs.writeFileSync(eml, cabecera, 'utf8');
  if (adjunto && fs.existsSync(pdfRuta)) fs.copyFileSync(pdfRuta, adjunto);

  return { eml, adjunto, bytes: pdfBytes ?? null };
}

/**
 * Envia el certificado de un participante.
 *
 * @param {object} p
 * @param {object} p.participante fila de `participantes`
 * @param {object} p.certificado   fila de `certificados`
 * @param {string} p.pdfRuta       ruta local del PDF generado
 * @param {string} [p.enlaceConfirmacion]
 * @returns {Promise<{ok:boolean, estado:string, intentoId:number, mensaje:string}>}
 */
async function enviarCertificado({ participante, certificado, pdfRuta, enlaceConfirmacion = null, destinatario = null }) {
  const cfg = config();
  // El historial de correos cuelga de un certificado real (clave foránea). Un
  // certificado de prueba con id 0 no existe en la tabla, así que se permite
  // la ausencia de id solo en ese caso.
  if (!certificado || !certificado.id) {
    throw new Error('enviarCertificado necesita un certificado persistido (con id) para registrar el intento.');
  }
  const para = destinatario || participante.email;
  const asunto = cfg.correo.asunto;
  const texto = construirMensaje({ participante, certificado, enlaceConfirmacion });

  if (!fs.existsSync(pdfRuta)) {
    throw new Error(`No se encuentra el PDF del certificado en ${pdfRuta}.`);
  }
  const bytes = fs.statSync(pdfRuta).size;

  const intentoId = correosRepo.registrarIntento({
    certificadoId: certificado.id,
    destinatario: para,
    remitente: cfg.correo.remitente,
    asunto,
    adjuntoRuta: pdfRuta,
    adjuntoBytes: bytes,
  });

  const transporteReal = obtenerTransporte();
  let ultimo = null;

  for (let intento = 1; intento <= cfg.correo.reintentosMax; intento++) {
    try {
      if (transporteReal.modoCaptura) {
        const captura = guardarEnCaptura({ destinatario: para, asunto, texto, pdfRuta, pdfBytes: bytes });
        correosRepo.marcarAceptado(intentoId, `captura:${path.basename(captura.eml)}`);
        log.info('mensaje capturado localmente (sin salida a Internet)', {
          intentoId,
          destinatario: para,
          fichero: path.basename(captura.eml),
        });
        return {
          ok: true,
          estado: 'aceptado',
          modo: 'captura',
          intentoId,
          mensaje: 'Mensaje guardado en la carpeta de captura local.',
          entregaConfirmada: false,
        };
      }

      const info = await transporteReal.sendMail({
        from: `"${cfg.correo.remitenteNombre}" <${cfg.correo.remitente}>`,
        to: para,
        subject: asunto,
        text: texto,
        html: `<p>${escapar(texto).split('\n\n').join('</p><p>')}</p>`,
        attachments: [{ filename: path.basename(pdfRuta), path: pdfRuta }],
      });
      correosRepo.marcarAceptado(intentoId, info.messageId || null);
      log.info('correo aceptado por el servidor SMTP', {
        intentoId,
        intento,
        destinatario: para,
        messageId: info.messageId || null,
        aceptados: info.accepted?.length || 0,
        rechazados: info.rejected?.length || 0,
      });
      return {
        ok: true,
        estado: 'aceptado',
        modo: 'smtp',
        intentoId,
        mensaje: 'El servidor SMTP acepto el mensaje. Esto no confirma la entrega en la bandeja de entrada.',
        entregaConfirmada: false,
      };
    } catch (err) {
      ultimo = err;
      const { codigo, usuario, tecnico } = explicarError(err);
      log.warn('intento de envio fallido', { intentoId, intento, codigo, tecnico });

      // Errores que no tienen sentido reintentar.
      const noReintentable = ['EAUTH', 'EAUTH5', 'EENVELOPE', 'CERT_HAS_EXPIRED', 'ETLS', 'ETOOLARGE', 'EMESSAGE'];
      if (noReintentable.includes(codigo) || intento === cfg.correo.reintentosMax) break;
      await esperar(cfg.correo.esperaReintentoMs * intento);
    }
  }

  const { codigo, usuario, tecnico } = explicarError(ultimo);
  correosRepo.marcarError(intentoId, tecnico);
  log.error('correo no entregado; el registro y el certificado se conservan', {
    intentoId,
    codigo,
    destinatario: para,
  });
  return { ok: false, estado: 'error', intentoId, codigo, mensaje: usuario, detalle: tecnico, entregaConfirmada: false };
}

function escapar(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/**
 * Espera entre reintentos.
 *
 * Se usa un temporizador real, no Atomics.wait: Atomics.wait bloquea TODO el
 * proceso, incluida la cola de peticiones HTTP del servidor. Con reintentos de
 * varios segundos, un Atomics.wait dejaría el formulario sin responder.
 */
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Cierra el transporte (usado al apagar el servidor). */
function cerrar() {
  if (transporte && !transporte.modoCaptura && typeof transporte.close === 'function') {
    transporte.close();
  }
  transporte = null;
  modoCacheado = null;
}

module.exports = {
  enviarCertificado,
  verificarConexion,
  construirMensaje,
  explicarError,
  cerrar,
  obtenerTransporte,
};