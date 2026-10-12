'use strict';
/**
 * Consultas de estadisticas.
 *
 * IMPORTANTE: los contadores se calculan SIEMPRE con SQL sobre el estado
 * actual de la tabla `participantes`. No existe ningun contador almacenado
 * que pueda desincronizarse, y ninguna cifra se incrementa "a mano" desde el
 * frontend.
 */
const { conexion } = require('../database');

/** Estados que cuentan como participante, segun la regla configurada. */
function estadosQueCuentan(regla) {
  return regla === 'verificados' ? ['verificado'] : ['registrado', 'verificado'];
}

/**
 * Devuelve el mismo objeto que consume GET /api/publico/estadisticas,
 * pero SIN datos personales: solo agregados.
 */
function estadisticas({ regla = 'confirmados' } = {}) {
  const con = conexion();
  const estados = estadosQueCuentan(regla);
  const marcadores = estados.map(() => '?').join(', ');

  const total = con
    .prepare(`SELECT COUNT(*) AS n FROM participantes WHERE estado IN (${marcadores})`)
    .get(...estados).n;

  const verificados = con
    .prepare("SELECT COUNT(*) AS n FROM participantes WHERE estado = 'verificado'")
    .get().n;

  const anulados = con
    .prepare("SELECT COUNT(*) AS n FROM participantes WHERE estado = 'anulado'")
    .get().n;

  // Cifras por rol. Se enumeran TODOS los roles del formulario, aunque su
  // cantidad sea 0, para que la interfaz no "salte" al aparecer el primer
  // registro de ese rol.
  const filasRol = con
    .prepare(`SELECT rol, COUNT(*) AS cantidad FROM participantes WHERE estado IN (${marcadores}) GROUP BY rol`)
    .all(...estados);
  const porRol = new Map(filasRol.map((f) => [f.rol, f.cantidad]));

  return {
    totalParticipantes: total,
    totalVerificados: verificados,
    totalAnulados: anulados,
    porRol,
    regla,
    actualizadoEn: new Date().toISOString(),
  };
}

/** Serie de altas por dia (para el panel administrativo). */
function altasPorDia({ dias = 30, regla = 'confirmados' } = {}) {
  const estados = estadosQueCuentan(regla);
  const marcadores = estados.map(() => '?').join(', ');
  return conexion()
    .prepare(
      `SELECT substr(creado_en, 1, 10) AS dia, rol, COUNT(*) AS cantidad
         FROM participantes
        WHERE estado IN (${marcadores})
        GROUP BY dia, rol
        ORDER BY dia DESC
        LIMIT ?`
    )
    .all(...estados, dias * 3);
}

module.exports = { estadisticas, estadosQueCuentan, altasPorDia };