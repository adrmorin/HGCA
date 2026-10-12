'use strict';
/**
 * Exportacion de registros a JSON.
 *
 * - UTF-8 sin BOM: los acentos y la "ñ" se conservan al abrir el fichero.
 * - SQLite sigue siendo la fuente oficial: el JSON es una copia de lectura,
 *   jamas una base de datos alternativa.
 * - Nunca se exportan tokens de verificacion, huellas de duplicado ni secretos.
 * - Solo una peticion autenticada puede descargar la exportacion.
 */
const fs = require('node:fs');
const path = require('node:path');
const { config } = require('../config');
const participantesRepo = require('../repositories/participantes.repo');
const certificadosRepo = require('../repositories/certificados.repo');
const correosRepo = require('../repositories/correos.repo');
const { versionActual } = require('../database/migrate');

/**
 * Campos autorizados en la exportacion.
 * Cualquier campo no listado aquí queda fuera, aunque exista en la tabla.
 */
const CAMPOS_PARTICIPANTE = [
  'codigo_publico', 'rol', 'nombre', 'id_tipo', 'id_parcial',
  'email', 'email_normalizado', 'telefono', 'telefono_parcial',
  'opt_camiones', 'opt_equipo_usado', 'opt_equipo_necesitado', 'opt_estados', 'opt_cargas_mes',
  'opt_plataforma', 'opt_plataforma_costo', 'opt_membresia', 'opt_rutas', 'opt_brokers', 'opt_tarifa_promedio',
  'cons_terminos', 'cons_contacto', 'cons_publico', 'cons_compartir',
  'estado', 'email_verificado_en', 'anulado_en', 'motivo_anulacion',
  'idioma', 'origen', 'creado_en', 'actualizado_en',
];

const CAMPOS_CERTIFICADO = [
  'id', 'version', 'emitido_en', 'plantilla_version', 'estado', 'estado_generacion',
  'fecha_verificacion', 'revocado_en', 'motivo_revocacion', 'creado_en', 'actualizado_en',
];

const CAMPOS_CORREO = [
  'id', 'destinatario', 'asunto', 'estado', 'intento', 'aceptado_en', 'creado_en',
];

function filtrar(objeto, campos, prohibidos) {
  const salida = {};
  for (const campo of campos) {
    if (prohibidos.includes(campo)) continue;
    salida[campo] = objeto[campo] ?? null;
  }
  return salida;
}

/**
 * Construye el objeto de exportacion completo en memoria.
 * @param {object} opciones
 * @param {boolean} [opciones.incluirCorreos=true]
 * @param {boolean} [opciones.incluirCorreoCompleto=false] incluye el correo sin enmascarar
 */
function construir({ incluirCorreos = true, incluirCorreoCompleto = false } = {}) {
  const cfg = config();
  const prohibidos = cfg.exportacion.camposProhibidos;
  const { filas } = participantesRepo.listar({ limite: 1_000_000, desplazamiento: 0 });

  const participantes = filas.map((p) => {
    const certs = certificadosRepo.listarPorParticipante(p.id).map((c) => {
      const base = filtrar(c, CAMPOS_CERTIFICADO, prohibidos);
      base.participante = p.codigo_publico;
      base.correos = incluirCorreos
        ? correosRepo.listarPorCertificado(c.id).map((m) => ({
            ...filtrar(m, CAMPOS_CORREO, prohibidos),
            // Por defecto el correo se exporta enmascarado.
            destinatario: incluirCorreoCompleto ? m.destinatario : enmascarar(m.destinatario),
          }))
        : [];
      return base;
    });
    return { ...filtrar(p, CAMPOS_PARTICIPANTE, prohibidos), certificados: certs };
  });

  return {
    metadatos: {
      proyecto: 'HCGA Trading LLC - Registro de participantes',
      versionEsquema: versionActual(),
      exportadoEn: new Date().toISOString(),
      versionAplicacion: require('../../../package.json').version,
      totalParticipantes: participantes.length,
      nota: 'Copia de lectura. La base de datos SQLite sigue siendo la fuente oficial de los datos.',
      privacidad: 'No incluye tokens de verificacion, huellas de duplicado ni credenciales.',
      correoCompletoIncluido: Boolean(incluirCorreoCompleto),
    },
    participantes,
  };
}

function enmascarar(email) {
  const e = String(email || '').toLowerCase();
  const i = e.indexOf('@');
  return i < 1 ? '—' : `${e[0]}***${e.slice(i)}`;
}

/**
 * Exporta a un fichero en data/exportaciones/ y devuelve la ruta.
 * @returns {{ruta:string, archivo:string, bytes:number, total:number}}
 */
function exportarEnDisco(opciones = {}) {
  const cfg = config();
  fs.mkdirSync(cfg.exportacion.directorio, { recursive: true });
  const sello = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const archivo = `clientes-${sello}.json`;
  const ruta = path.join(cfg.exportacion.directorio, archivo);
  const datos = construir(opciones);
  // JSON.stringify sin BOM: UTF-8 puro, los acentos se conservan tal cual.
  fs.writeFileSync(ruta, `${JSON.stringify(datos, null, 2)}\n`, 'utf8');
  return { ruta, archivo, bytes: fs.statSync(ruta).size, total: datos.metadatos.totalParticipantes };
}

module.exports = { construir, exportarEnDisco, CAMPOS_PARTICIPANTE, CAMPOS_CERTIFICADO, CAMPOS_CORREO };