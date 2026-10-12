'use strict';
/**
 * Servicio de estadisticas publicas.
 *
 * Solo entrega informacion AGREGADA. El endpoint publico no puede usarse para
 * enumerar participantes ni para obtener datos personales de ninguna clase.
 *
 * Cache muy corta (CONTADORES_CACHE_MS, 3 s por defecto) para absorber rafagas
 * de peticiones del formulario abierto sin que la cifra quede desfasada: tras
 * un registro confirmado la cache se invalida de inmediato.
 */
const { config } = require('../config');
const estadisticasRepo = require('../repositories/estadisticas.repo');

/**
 * Roles del formulario original. Se repiten TODOS aunque su cantidad sea 0,
 * para que la interfaz no salte de maquetacion al primer registro de un rol.
 * No se inventa ninguna categoria que no exista en el formulario.
 */
const ROLES = [
  { clave: 'carrier', etiqueta: 'Carrier', descripcion: 'Transportista', icono: 'truck' },
  { clave: 'shipper', etiqueta: 'Shipper', descripcion: 'Remitente', icono: 'box' },
];

let cache = { valor: null, expira: 0 };

function invalidarCache() {
  cache = { valor: null, expira: 0 };
}

/** Forma exacta de la respuesta publica. */
function construirRespuesta() {
  const cfg = config();
  const datos = estadisticasRepo.estadisticas({ regla: cfg.privacidad.regla });
  return {
    totalParticipantes: datos.totalParticipantes,
    totalVerificados: datos.totalVerificados,
    reglaContador: datos.regla,
    roles: ROLES.map((r) => ({
      rol: r.clave,
      etiqueta: r.etiqueta,
      descripcion: r.descripcion,
      icono: r.icono,
      cantidad: datos.porRol.get(r.clave) || 0,
    })),
    totalAnulados: datos.totalAnulados,
    actualizadoEn: datos.actualizadoEn,
  };
}

/** Estadisticas con cache muy corta. */
function estadisticas() {
  const ahora = Date.now();
  if (cache.valor && cache.expira > ahora) return cache.valor;
  const valor = construirRespuesta();
  cache = { valor, expira: ahora + config().contadores.cacheMs };
  return valor;
}

module.exports = { estadisticas, invalidarCache, construirRespuesta, ROLES };