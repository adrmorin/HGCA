'use strict';
/**
 * Controlador de la API.
 *
 * Cada funcion recibe (req, res) y responde con la forma unificada
 *   exito : { ok: true,  datos: {...} }
 *   fallo : { ok: false, error: { codigo, mensaje } }
 */
const fs = require('node:fs');
const path = require('node:path');
const { config } = require('../config');
const { conexion, integridad } = require('../database');
const { versionActual } = require('../database/migrate');
const registroService = require('../services/registro.service');
const estadisticasService = require('../services/estadisticas.service');
const qrService = require('../services/qr.service');
const correoService = require('../services/correo.service');
const backupService = require('../services/backup.service');
const exportacionService = require('../services/exportacion.service');
const participantesRepo = require('../repositories/participantes.repo');
const certificadosRepo = require('../repositories/certificados.repo');
const correosRepo = require('../repositories/correos.repo');
const auditoriaRepo = require('../repositories/auditoria.repo');
const { ErrorApi, asyncHandler } = require('../middleware/errores');
const mask = require('../utils/mask');
const fechas = require('../utils/fechas');

// ------------------------------------------------------------------ salud

async function salud(_req, res) {
  const cfg = config();
  let base = { ok: true, mensaje: 'estado correcto' };
  try {
    conexion().prepare('SELECT 1').get();
  } catch (e) {
    base = { ok: false, mensaje: 'la base de datos no responde' };
  }
  const plantilla = fs.existsSync(cfg.certificados.plantilla);
  res.status(base.ok ? 200 : 503).json({
    ok: base.ok,
    datos: {
      estado: base.ok ? 'ok' : 'degradado',
      mensaje: base.mensaje,
      version: require('../../../package.json').version,
      entorno: cfg.entorno,
      hora: new Date().toISOString(),
      baseDeDatos: { ok: base.ok, esquema: versionActual() },
      plantillaCertificado: { ok: plantilla, ruta: path.basename(cfg.correo.rutaCaptura ? cfg.certificados.plantilla : '') },
      correo: {
        modo: cfg.correo.modoCaptura ? 'captura-local' : 'smtp',
        configurado: Boolean(cfg.correo.host && cfg.correo.clave),
      },
      administracion: { habilitada: Boolean(cfg.seguridad.hashAdmin) },
    },
  });
}

// ------------------------------------------------------------- participantes

async function crearCliente(req, res) {
  const contexto = {
    ip: req.ip,
    userAgent: req.get('user-agent') || '',
  };
  let resultado;
  try {
    resultado = await registroService.registrar(req.body, contexto);
  } catch (err) {
    if (err instanceof registroService.ErrorRegistro) {
      throw new ErrorApi(err.codigo, err.mensaje, err.estado, err.extra);
    }
    throw err;
  }

  // Duplicado: 409 con el codigo existente, para que el cliente pueda
  // recuperar la operacion sin volver a enviarla.
  if (resultado.duplicado) {
    res.status(409).json({ ok: false, error: { codigo: 'DUPLICADO', mensaje: resultado.mensaje }, datos: resultado });
    return;
  }

  // Cache invalidada: el contador publico tiene que reflejar el alta ya.
  estadisticasService.invalidarCache();

  res.status(201).json({ ok: true, datos: resultado });
}

async function listarClientes(req, res) {
  const limite = Math.min(Number.parseInt(req.query.limite || '50', 10) || 50, 200);
  const desplazamiento = Math.max(Number.parseInt(req.query.desplazamiento || '0', 10) || 0, 0);
  const { filas, total } = participantesRepo.listar({
    limite,
    desplazamiento,
    estado: req.query.estado || null,
    rol: req.query.rol || null,
  });
  res.json({
    ok: true,
    datos: {
      total,
      limite,
      desplazamiento,
      participantes: filas.map((p) => ({
        codigo: p.codigo_publico,
        nombre: p.nombre,
        rol: p.rol,
        estado: p.estado,
        email: p.email,
        idTipo: p.id_tipo,
        idParcial: p.id_parcial,
        creadoEn: p.creado_en,
        certificados: certificadosRepo.listarPorParticipante(p.id).map((c) => ({
          id: c.id,
          version: c.version,
          estado: c.estado,
          emitidoEn: c.emitido_en,
        })),
      })),
    },
  });
}

async function obtenerCliente(req, res) {
  const ref = req.params.id;
  const p = /^\d+$/.test(ref) ? participantesRepo.porId(Number(ref)) : participantesRepo.porCodigoPublico(ref);
  if (!p) throw new ErrorApi('NO_ENCONTRADO', 'No existe ningún registro con ese identificador.', 404);

  const certs = certificadosRepo.listarPorParticipante(p.id);
  res.json({
    ok: true,
    datos: {
      codigo: p.codigo_publico,
      nombre: p.nombre,
      rol: p.rol,
      estado: p.estado,
      email: p.email,
      emailEnmascarado: mask.enmascararCorreo(p.email),
      telefono: p.telefono,
      idTipo: p.id_tipo,
      idValor: p.id_valor,
      idParcial: p.id_parcial,
      consentimientos: {
        terminos: !!p.cons_terminos,
        contacto: !!p.cons_contacto,
        publicacion: !!p.cons_publico,
        compartirConTerceros: !!p.cons_compartir,
      },
      creadoEn: p.creado_en,
      actualizadoEn: p.actualizado_en,
      emailVerificadoEn: p.email_verificado_en,
      certificados: certs.map((c) => ({
        id: c.id,
        version: c.version,
        estado: c.estado,
        estadoGeneracion: c.estado_generacion,
        emitidoEn: c.emitido_en,
        fechaVerificacion: c.fecha_verificacion,
        archivo: c.ruta_pdf ? path.basename(c.ruta_pdf) : null,
        bytes: c.ruta_pdf && fs.existsSync(c.ruta_pdf) ? fs.statSync(c.ruta_pdf).size : null,
        urlVerificacion: qrService.urlVerificacion(c.token_verificacion),
        correos: correosRepo.listarPorCertificado(c.id).map((m) => ({
          estado: m.estado,
          intento: m.intento,
          aceptadoEn: m.aceptado_en,
          motivoError: m.motivo_error,
        })),
      })),
    },
  });
}

// ------------------------------------------------------------- estadisticas

function estadisticasPublicas(_req, res) {
  res.json({ ok: true, datos: estadisticasService.estadisticas() });
}

function contadorTotal(_req, res) {
  const s = estadisticasService.estadisticas();
  res.json({ ok: true, datos: { total: s.totalParticipantes, actualizadoEn: s.actualizadoEn } });
}

// ------------------------------------------------------------ certificados

async function generarCertificado(req, res) {
  const ref = req.params.id;
  const p = /^\d+$/.test(ref) ? participantesRepo.porId(Number(ref)) : participantesRepo.porCodigoPublico(ref);
  if (!p) throw new ErrorApi('NO_ENCONTRADO', 'No existe ningún registro con ese identificador.', 404);

  const forzar = req.query.forzar === 'si' || req.body?.forzar === true;
  const resultado = await registroService.emitirCertificado(p.id, { forzar, ip: req.ip });
  if (!resultado.ok) {
    throw new ErrorApi('CERTIFICADO_NO_GENERADO', resultado.mensaje, 500, {
      registroConservado: true,
    });
  }
  res.status(201).json({ ok: true, datos: { certificado: registroService.certificadoResumen(resultado.certificado) } });
}

async function obtenerCertificado(req, res) {
  const c = certificadosRepo.porId(Number(req.params.id));
  if (!c) throw new ErrorApi('NO_ENCONTRADO', 'No existe ese certificado.', 404);
  const p = participantesRepo.porId(c.participante_id);
  res.json({
    ok: true,
    datos: {
      id: c.id,
      codigo: p.codigo_publico,
      version: c.version,
      estado: c.estado,
      estadoGeneracion: c.estado_generacion,
      emitidoEn: c.emitido_en,
      fechaVerificacion: c.fecha_verificacion,
      archivo: c.ruta_pdf ? path.basename(c.ruta_pdf) : null,
      existe: Boolean(c.ruta_pdf && fs.existsSync(c.ruta_pdf)),
      sha256: c.sha256_pdf,
      errorUltimo: c.error_ultimo,
      urlVerificacion: qrService.urlVerificacion(c.token_verificacion),
      correos: correosRepo.listarPorCertificado(c.id).map((m) => ({
        estado: m.estado,
        intento: m.intento,
        destinatario: m.destinatario,
        aceptadoEn: m.aceptado_en,
        motivoError: m.motivo_error,
        creadoEn: m.creado_en,
      })),
    },
  });
}

async function descargarCertificado(req, res) {
  const c = certificadosRepo.porId(Number(req.params.id));
  if (!c || !c.ruta_pdf || !fs.existsSync(c.ruta_pdf)) {
    throw new ErrorApi('NO_ENCONTRADO', 'El archivo del certificado no esta disponible.', 404);
  }
  const p = participantesRepo.porId(c.participante_id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${path.basename(c.ruta_pdf)}"`);
  res.send(fs.readFileSync(c.ruta_pdf));
  res.locals.codigo = p.codigo_publico;
}

async function enviarCertificado(req, res) {
  const c = certificadosRepo.porId(Number(req.params.id));
  if (!c) throw new ErrorApi('NO_ENCONTRADO', 'No existe ese certificado.', 404);
  if (c.estado_generacion !== 'generado') {
    throw new ErrorApi('CERTIFICADO_NO_GENERADO', 'El certificado aún no se ha generado.', 409);
  }
  const resultado = await registroService.enviarCertificado({ ok: true, certificado: c }, { ip: req.ip });
  res.status(resultado.ok ? 200 : 502).json({
    ok: Boolean(resultado.ok),
    ...(resultado.ok ? { datos: resultado } : { error: { codigo: resultado.estado === 'error' ? 'CORREO_NO_ENVIADO' : 'CORREO_OMITIDO', mensaje: resultado.mensaje } }),
  });
}

async function revocarCertificado(req, res) {
  const c = certificadosRepo.porId(Number(req.params.id));
  if (!c) throw new ErrorApi('NO_ENCONTRADO', 'No existe ese certificado.', 404);
  const motivo = String(req.body?.motivo || 'Revocado por HCGA').slice(0, 200);
  certificadosRepo.revocar(c.id, motivo);
  auditoriaRepo.registrar({
    accion: 'certificado.revocar',
    entidad: 'certificado',
    entidadId: c.id,
    detalle: { motivo },
    ip: req.ip,
    actor: 'admin',
  });
  res.json({ ok: true, datos: { id: c.id, estado: 'revocado', revocadoEn: new Date().toISOString() } });
}

// ---------------------------------------------------------------- verificar

function verificar(req, res) {
  const token = String(req.params.token || '').toUpperCase();
  if (!qrService.tokenTieneFormaValida(token)) {
    // Misma respuesta que un certificado inexistente: no se permite
    // distinguir "token mal formado" de "token que no existe".
    return res.status(404).json({
      ok: false,
      datos: { valido: false, estado: 'inexistente', mensaje: 'El código no corresponde a ningún certificado emitido.' },
    });
  }

  const c = certificadosRepo.porToken(token);
  if (!c) {
    return res.status(404).json({
      ok: false,
      datos: { valido: false, estado: 'inexistente', mensaje: 'El código no corresponde a ningún certificado emitido.' },
    });
  }

  const p = participantesRepo.porId(c.participante_id);
  const comun = {
    codigo: p.codigo_publico,
    emitidoEn: c.emitido_en,
    fechaEmision: fechas.fechaCertificado(c.emitido_en),
    version: c.version,
    // El nombre SOLO se muestra si el titular autorizo la publicacion.
    nombrePublico: p.cons_publico ? p.nombre : null,
    nombrePublicoDisponible: Boolean(p.cons_publico),
  };

  if (c.estado === 'revocado') {
    return res.status(200).json({
      ok: true,
      datos: { ...comun, valido: false, estado: 'revocado', fechaVerificacion: c.fecha_verificacion, mensaje: 'Este certificado ha sido revocado por HCGA.' },
    });
  }
  if (c.estado === 'anulado') {
    return res.status(200).json({
      ok: true,
      datos: { ...comun, valido: false, estado: 'anulado', fechaVerificacion: c.fecha_verificacion, mensaje: 'El registro asociado a este certificado está anulado.' },
    });
  }

  return res.status(200).json({
    ok: true,
    datos: {
      ...comun,
      valido: true,
      estado: c.estado,
      rol: p.rol,
      fechaVerificacion: c.fecha_verificacion,
      fechaVerificacionLegible: c.fecha_verificacion ? fechas.fechaCertificado(c.fecha_verificacion) : null,
      mensaje: c.estado === 'verificado' ? 'Certificado verificado.' : 'Certificado válido. El titular aún no ha confirmado su correo.',
    },
  });
}

// ------------------------------------------------------------------ publico

async function confirmarPorToken(req, res) {
  const token = String(req.params.token || '').toUpperCase();
  const resultado = await registroService.confirmarEmail(token, { ip: req.ip });
  if (!resultado.ok) {
    return res.status(resultado.motivo === 'CERTIFICADO_INEXISTENTE' ? 404 : 200).json({
      ok: false,
      datos: { confirmado: false, estado: resultado.motivo },
    });
  }
  estadisticasService.invalidarCache();
  return res.json({
    ok: true,
    datos: {
      confirmado: true,
      codigo: resultado.participante.codigo_publico,
      nombre: resultado.participante.nombre,
      estado: resultado.participante.estado,
      fecha: fechas.fechaCertificado(resultado.participante.email_verificado_en),
    },
  });
}

function paginaVerificar(_req, res) {
  const archivo = path.join(config().rutas.frontend, 'verificar.html');
  if (!fs.existsSync(archivo)) {
    return res.status(404).type('text/plain; charset=utf-8').send('Página de verificación no disponible en esta instalación.');
  }
  return res.sendFile(archivo);
}

// ------------------------------------------------------------------- admin

function listarCertificados(req, res) {
  const limite = Math.min(Number.parseInt(req.query.limite || '100', 10) || 100, 500);
  res.json({ ok: true, datos: { certificados: certificadosRepo.listar({ limite }) } });
}

function auditoria(_req, res) {
  res.json({ ok: true, datos: { eventos: auditoriaRepo.listar({ limite: 200 }) } });
}

function exportarClientes(req, res) {
  auditoriaRepo.registrar({
    accion: 'admin.exportar',
    entidad: 'sistema',
    detalle: { formato: 'json' },
    ip: req.ip,
    actor: 'admin',
  });
  const incluirCompleto = req.query.correoCompleto === 'si';
  const datos = exportacionService.construir({ incluirCorreoCompleto: incluirCompleto });
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="clientes-${new Date().toISOString().slice(0, 10)}.json"`);
  res.send(`${JSON.stringify(datos, null, 2)}\n`);
}

function crearBackup(req, res) {
  const resultado = backupService.crear({ nota: req.body?.nota || null, ip: req.ip });
  res.status(201).json({ ok: true, datos: { ...resultado, ruta: path.basename(resultado.ruta) } });
}

function listarBackups(_req, res) {
  res.json({ ok: true, datos: { copias: backupService.listar() } });
}

async function verificarCorreo(_req, res) {
  try {
    const r = await correoService.verificarConexion();
    res.json({ ok: true, datos: r });
  } catch (err) {
    const { codigo, usuario, tecnico } = correoService.explicarError(err);
    res.status(502).json({ ok: false, error: { codigo, mensaje: usuario }, datos: { tecnico } });
  }
}

function estadoSistema(_req, res) {
  res.json({
    ok: true,
    datos: {
      integridad: integridad(),
      copias: backupService.listar().length,
      certificados: certificadosRepo.listar({ limite: 1000 }).length,
      auditoria: auditoriaRepo.ACCIONES,
      versionEsquema: versionActual(),
    },
  });
}

module.exports = {
  salud,
  crearCliente,
  listarClientes,
  obtenerCliente,
  estadisticasPublicas,
  contadorTotal,
  generarCertificado,
  obtenerCertificado,
  descargarCertificado,
  enviarCertificado,
  revocarCertificado,
  verificar,
  confirmarPorToken,
  paginaVerificar,
  listarCertificados,
  auditoria,
  exportarClientes,
  crearBackup,
  listarBackups,
  verificarCorreo,
  estadoSistema,
  asyncHandler,
};