'use strict';
/**
 * Servicio de orquestacion del registro.
 *
 * Encadena: validacion -> deteccion de duplicados -> alta en SQLite ->
 * emision del certificado -> envio del correo. Cada paso es independiente y
 * sus fallos se registran sin perder lo ya hecho:
 *
 *   - Si falla el PDF, el REGISTRO se conserva y se avisa.
 *   - Si falla el correo, el REGISTRO y el CERTIFICADO se conservan y se avisa.
 *
 * La respuesta que vuelve al navegador refleja el estado real persistido,
 * nunca una suposicion.
 */
const fs = require('node:fs');
const path = require('node:path');
const { config } = require('../config');
const participantesRepo = require('../repositories/participantes.repo');
const certificadosRepo = require('../repositories/certificados.repo');
const estadisticasRepo = require('../repositories/estadisticas.repo');
const auditoriaRepo = require('../repositories/auditoria.repo');
const correosRepo = require('../repositories/correos.repo');
const { validarRegistro } = require('../validators/registro.schema');
const certificadoService = require('./certificado.service');
const correoService = require('./correo.service');
const qrService = require('./qr.service');
const mask = require('../utils/mask');
const { crearLogger } = require('../utils/logger');

const log = crearLogger('registro');

class ErrorRegistro extends Error {
  constructor(mensaje, codigo, estado = 400, extra = {}) {
    super(mensaje);
    this.codigo = codigo;
    this.estado = estado;
    this.extra = extra;
  }
}

/** Respuesta publica de un registro: nunca devuelve el correo completo. */
function respuestaParticipante(p) {
  return {
    codigo: p.codigo_publico,
    nombre: p.nombre,
    rol: p.rol,
    estado: p.estado,
    emailEnmascarado: mask.enmascararCorreo(p.email),
    idParcial: p.id_parcial,
    telefonoParcial: p.telefono_parcial,
    creadoEn: p.creado_en,
  };
}

/**
 * Da de alta un participante.
 * @returns {Promise<object>} resumen del resultado
 */
async function registrar(cuerpo, contexto = {}) {
  const cfg = config();

  // --- 0. Campo trampa para robots -------------------------------------
  if (cuerpo && typeof cuerpo.company_website === 'string' && cuerpo.company_website.trim() !== '') {
    log.warn('envio descartado por campo trampa (robot)', { ip: contexto.ip });
    // Se responde como si hubiera sido correcto, sin guardar nada, para que un
    // robot no aprenda que el filtro existe.
    return {
      aceptado: true,
      real: false,
      mensaje: 'Registro recibido.',
      participante: null,
      certificado: null,
      correo: { estado: 'no_enviado', mensaje: 'No se envio ningun correo.' },
    };
  }

  // --- 1. Validacion (la misma que hace el navegador) -------------------
  const validado = validarRegistro(cuerpo);
  if (!validado.ok) {
    throw new ErrorRegistro('Revise los campos marcados.', 'VALIDACION', 400, { campos: validado.errores });
  }
  const datos = validado.datos;

  // --- 2. Duplicados ----------------------------------------------------
  const emailNorm = mask.normalizarCorreo(datos.email);
  const idNorm = mask.normalizarIdentificacion(datos.idType, datos.idValue);
  const dup = participantesRepo.buscarDuplicado({
    emailNormalizado: emailNorm,
    rol: datos.rol,
    idNormalizado: idNorm,
    idTipo: datos.idType,
  });

  if (dup) {
    const existente = dup.fila;
    log.info('registro rechazado por duplicado', {
      motivo: dup.motivo,
      codigoExistente: existente.codigo_publico,
      estadoExistente: existente.estado,
    });
    auditoriaRepo.registrar({
      accion: 'admin.acceso',
      resultado: 'denegado',
      entidad: 'participante',
      entidadId: existente.id,
      detalle: { motivo: 'duplicado', clave: dup.motivo },
      ip: contexto.ip,
    });
    return {
      aceptado: false,
      real: true,
      duplicado: true,
      motivo: dup.motivo,
      mensaje:
        dup.motivo === 'email'
          ? 'Ya existe un registro con este correo electrónico.'
          : 'Ya existe un registro con esta identificación y este rol.',
      participante: respuestaParticipante(existente),
      certificado: certificadoResumen(certificadosRepo.vigenteDe(existente.id)),
      correo: { estado: 'no_enviado', mensaje: 'No se envio ningun correo: el registro ya existia.' },
    };
  }

  // --- 3. Alta en SQLite ------------------------------------------------
  const fila = participantesRepo.preparar(datos, contexto);
  let participante;
  try {
    // `registrarAtomico` inserta dentro de una transaccion y devuelve la fila
    // ya persistida, junto con el total recalculado desde la propia tabla.
    participante = participantesRepo.registrarAtomico(fila);
  } catch (err) {
    if (/UNIQUE constraint failed: participantes\.(huella_duplicado|rol, id_normalizado)/.test(String(err.message))) {
      // Carrera: dos peticiones identicas llegaron a la vez. Se devuelve el
      // duplicado en lugar de un 500, y en ningun caso se cuenta dos veces.
      log.warn('duplicado detectado por restriccion UNIQUE (carrera de peticiones)', {});
      const deNuevo = participantesRepo.buscarDuplicado({
        emailNormalizado: emailNorm,
        rol: datos.rol,
        idNormalizado: idNorm,
        idTipo: datos.idType,
      });
      if (deNuevo) {
        return {
          aceptado: false,
          real: true,
          duplicado: true,
          motivo: deNuevo.motivo,
          mensaje: 'Ya existe un registro con estos datos.',
          participante: respuestaParticipante(deNuevo.fila),
          certificado: certificadoResumen(certificadosRepo.vigenteDe(deNuevo.fila.id)),
          correo: { estado: 'no_enviado', mensaje: 'No se envio ningun correo: el registro ya existia.' },
        };
      }
    }
    throw err;
  }

  const totales = estadisticasRepo.estadisticas({ regla: cfg.privacidad.regla });
  log.info('registro creado', {
    codigo: participante.codigo_publico,
    rol: participante.rol,
    total: totales.totalParticipantes,
  });

  // --- 4. Certificado ---------------------------------------------------
  const resultadoCert = await emitirCertificado(participante.id, { ip: contexto.ip });
  // --- 5. Correo -------------------------------------------------------
  const resultadoCorreo = await enviarCertificado(resultadoCert, { ip: contexto.ip });

  const totalsFinales = estadisticasRepo.estadisticas({ regla: cfg.privacidad.regla });

  return {
    aceptado: true,
    real: true,
    duplicado: false,
    mensaje: 'Registro completado.',
    participante: respuestaParticipante(participante),
    certificado: resultadoCert.certificado
      ? certificadoResumen(participantesRepo.porId(participante.id) && certificadosRepo.vigenteDe(participante.id))
      : null,
    correo: resultadoCorreo,
    estadisticas: totales,
    estadisticasFinales: totalsFinales,
  };
}

function certificadoResumen(c) {
  if (!c) return null;
  return {
    id: c.id,
    version: c.version,
    estado: c.estado,
    estadoGeneracion: c.estado_generacion,
    emitidoEn: c.emitido_en,
    fechaVerificacion: c.fecha_verificacion,
    urlVerificacion: qrService.urlVerificacion(c.token_verificacion),
    ruta: c.ruta_pdf ? path.basename(c.ruta_pdf) : null,
  };
}

/**
 * Emite (o reemite) el certificado de un participante.
 * @returns {Promise<{ok:boolean, certificado:object|null, mensaje:string}>}
 */
async function emitirCertificado(participanteId, { forzar = false, ip = null } = {}) {
  const cfg = config();
  const participante = participantesRepo.porId(participanteId);
  if (!participante) return { ok: false, certificado: null, mensaje: 'El registro no existe.' };

  const vigente = certificadosRepo.vigenteDe(participanteId);
  if (vigente && vigente.estado_generacion === 'generado' && !forzar) {
    return { ok: true, certificado: vigente, mensaje: 'El certificado ya estaba emitido.', reutilizado: true };
  }

  const emitidoEn = new Date().toISOString();
  const filaCert = certificadosRepo.crear({
    participanteId,
    emitidoEn,
    paginas: cfg.certificados.paginas.join(','),
    plantillaVersion: 'v4',
  });

  const enlaceConfirmacion = `${cfg.origenPublico}/confirmar/${filaCert.token_verificacion}`;
  try {
    const { buffer, rutaSugerida } = await certificadoService.generar({
      participante,
      certificado: filaCert,
      enlaceConfirmacion,
    });

    const destino = path.join(cfg.rutas.almacenamiento, 'certificados', rutaSugerida);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    // Escritura atomica: se escribe a un temporal y se renombra, para que un
    // corte de luz no deje un PDF a medio escribir.
    const temporal = `${destino}.tmp`;
    fs.writeFileSync(temporal, buffer);
    fs.renameSync(temporal, destino);

    const sha = certificadosRepo.sha256(buffer);
    certificadosRepo.marcarGenerado(filaCert.id, {
      rutaPdf: destino,
      sha256Pdf: sha,
      bytes: buffer.length,
    });

    const emitido = certificadosRepo.porId(filaCert.id);
    auditoriaRepo.registrar({
      accion: forzar ? 'certificado.reemitir' : 'certificado.generar',
      entidad: 'certificado',
      entidadId: filaCert.id,
      detalle: { version: filaCert.version, bytes: buffer.length },
      ip,
      actor: 'admin',
    });
    log.info('certificado generado', {
      codigo: participante.codigo_publico,
      version: filaCert.version,
      bytes: buffer.length,
      archivo: path.basename(destino),
    });
    const generado = certificadosRepo.porId(filaCert.id);
    return { ok: true, certificado: generado, mensaje: 'Certificado generado.' };
  } catch (err) {
    certificadosRepo.marcarError(filaCert.id, err.message);
    log.error('fallo al generar el certificado; el registro se conserva', {
      codigo: participante.codigo_publico,
      motivo: err.message,
    });
    auditoriaRepo.registrar({
      accion: 'certificado.generar',
      entidad: 'certificado',
      entidadId: filaCert.id,
      resultado: 'error',
      detalle: { motivo: String(err.message).slice(0, 300) },
      ip,
    });
    return {
      ok: false,
      certificado: certificadosRepo.porId(filaCert.id),
      mensaje: 'No se pudo generar el certificado. El registro se ha conservado.',
    };
  }
}

/**
 * Envia por correo el certificado ya generado.
 * Nunca lanza: un fallo de correo se devuelve como estado 'error'.
 */
async function enviarCertificado(resultadoCert, { ip = null } = {}) {
  const cfg = config();
  if (!resultadoCert || !resultadoCert.ok || !resultadoCert.certificado) {
    return { estado: 'no_enviado', mensaje: 'No hay certificado que enviar.' };
  }
  const cert = resultadoCert.certificado;
  if (!cert.ruta_pdf || !fs.existsSync(cert.ruta_pdf)) {
    return { estado: 'no_enviado', mensaje: 'No hay PDF generado todavia.' };
  }

  // Evita reenvios indiscriminados: como maximo 3 envios aceptados por
  // certificado. Un reenvio manual lo pide el administrador de forma expresa.
  const aceptados = correosRepo.totalAceptados(cert.id);
  if (aceptados >= cfg.correo.reintentosMax) {
    log.info('envio omitido: limite de envios aceptados alcanzado', { certificadoId: cert.id, aceptados });
    return {
      estado: 'omitido',
      mensaje: 'Este certificado ya se envió varias veces. Use el reenvío manual si hace falta.',
    };
  }

  const participante = participantesRepo.porId(cert.participante_id);
  const enlaceConfirmacion = `${cfg.origenPublico}/confirmar/${cert.token_verificacion}`;

  try {
    const r = await correoService.enviarCertificado({
      participante,
      certificado: cert,
      pdfRuta: cert.ruta_pdf,
      enlaceConfirmacion,
      destinatario: cfg.correo.remitentePorDefecto ? cfg.correo.remitente : null,
    });
    auditoriaRepo.registrar({
      accion: 'certificado.enviar',
      entidad: 'certificado',
      entidadId: cert.id,
      resultado: r.ok ? 'ok' : 'error',
      detalle: { estado: r.estado, codigo: r.codigo || null },
      ip,
    });
    return r;
  } catch (err) {
    log.error('fallo inesperado al enviar el correo', { motivo: err.message, certificadoId: cert.id });
    return { estado: 'error', mensaje: 'No se pudo enviar el correo.', detalle: String(err.message).slice(0, 300) };
  }
}

/**
 * Confirma el correo de un titular a partir del token del certificado.
 * El PDF NO se reemite: el estado se consulta siempre por el QR.
 */
async function confirmarEmail(token, { ip = null } = {}) {
  const cert = certificadosRepo.porToken(token);
  if (!cert) return { ok: false, motivo: 'CERTIFICADO_INEXISTENTE' };
  if (cert.estado === 'revocado' || cert.estado === 'anulado') {
    return { ok: false, motivo: cert.estado.toUpperCase(), certificado: cert };
  }

  participantesRepo.marcarVerificado(cert.participante_id);
  certificadosRepo.marcarVerificado(cert.id, new Date().toISOString());
  auditoriaRepo.registrar({
    accion: 'participante.verificar',
    entidad: 'participante',
    entidadId: cert.participante_id,
    detalle: { certificado: cert.id },
    ip,
    actor: 'titular',
  });
  const participante = participantesRepo.porId(cert.participante_id);
  log.info('correo confirmado por el titular', { codigo: participante.codigo_publico });
  return { ok: true, participante, certificado: certificadosRepo.porId(cert.id) };
}

module.exports = {
  registrar,
  emitirCertificado,
  enviarCertificado,
  confirmarEmail,
  respuestaParticipante,
  certificadoResumen,
  ErrorRegistro,
};