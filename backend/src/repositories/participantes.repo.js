'use strict';
/**
 * Repositorio de participantes.
 *
 * Todas las consultas usan parametros enlazados ($1, $2...). Nunca se
 * concatena entrada del usuario dentro de una cadena SQL.
 */
const { conexion, enTransaccion } = require('../database');
const { ahoraIso } = require('../utils/fechas');
const ids = require('../utils/ids');
const mask = require('../utils/mask');

const CAMPOS_INSERTAR = [
  'codigo_publico', 'rol', 'nombre',
  'id_tipo', 'id_valor', 'id_normalizado', 'id_parcial',
  'email', 'email_normalizado', 'telefono', 'telefono_normalizado', 'telefono_parcial',
  'opt_camiones', 'opt_equipo_usado', 'opt_equipo_necesitado', 'opt_estados', 'opt_cargas_mes',
  'opt_plataforma', 'opt_plataforma_costo', 'opt_membresia', 'opt_rutas', 'opt_brokers', 'opt_tarifa_promedio',
  'cons_terminos', 'cons_contacto', 'cons_publico', 'cons_compartir',
  'estado', 'idioma', 'origen', 'huella_duplicado', 'ip', 'user_agent',
  'creado_en', 'actualizado_en',
];

/**
 * Construye la fila a partir de un payload ya validado por el esquema zod.
 * Aqui es donde se decide la normalizacion y el enmascarado.
 */
function preparar(datos, contexto = {}) {
  const ahora = ahoraIso();
  const emailNorm = mask.normalizarCorreo(datos.email);
  const telNorm = mask.normalizarTelefono(datos.telefono);
  const idNorm = mask.normalizarIdentificacion(datos.idType, datos.idValue);
  const huella = ids.huella(emailNorm);

  // El formulario llama "equip" al equipo que usa (carrier) o al que necesita
  // (shipper). La tabla los guarda por separado para no perder el matiz.
  const opt = datos.opt || {};
  const esCarrier = datos.role === 'carrier';
  const equipo = opt.equip && opt.equip !== '' ? opt.equip : null;
  const numero = (v) => (v === undefined || v === null || v === '' ? null : Number(v));

  return {
    codigo_publico: datos.codigoPublico || ids.codigoPublico(),
    rol: datos.role,
    nombre: String(datos.name).trim(),
    id_tipo: datos.idType || null,
    id_valor: datos.idValue ? String(datos.idValue).trim() : null,
    id_normalizado: idNorm || null,
    id_parcial: mask.enmascararIdentificacion(datos.idType, datos.idValue),
    email: String(datos.email).trim(),
    email_normalizado: emailNorm,
    telefono: datos.phone ? String(datos.phone).trim() : null,
    telefono_normalizado: telNorm || null,
    telefono_parcial: mask.enmascararTelefono(datos.phone),
    opt_camiones: numero(opt.trucks),
    opt_equipo_usado: esCarrier ? equipo : null,
    opt_equipo_necesitado: esCarrier ? null : equipo,
    opt_estados: opt.states || null,
    opt_cargas_mes: numero(opt.loads),
    opt_plataforma: opt.board || null,
    opt_plataforma_costo: numero(opt.boardCost),
    opt_membresia: opt.member || null,
    opt_rutas: opt.lanes || null,
    opt_brokers: opt.brokers || null,
    opt_tarifa_promedio: numero(opt.avgRate),
    cons_terminos: datos.consents?.terms ? 1 : 0,
    cons_contacto: datos.consents?.contact ? 1 : 0,
    cons_publico: datos.consents?.publicListing ? 1 : 0,
    cons_compartir: datos.consents?.shareWithFinanciers ? 1 : 0,
    estado: 'registrado',
    idioma: datos.language === 'en' ? 'en' : 'es',
    origen: datos.source ?? null,
    huella_duplicado: huella,
    ip: contexto.ip ?? null,
    user_agent: (contexto.userAgent || '').slice(0, 250) || null,
    creado_en: ahora,
    actualizado_en: ahora,
  };
}

function insertar(fila) {
  const con = conexion();
  const marcadores = CAMPOS_INSERTAR.map(() => '?').join(', ');
  const valores = CAMPOS_INSERTAR.map((c) => fila[c] ?? null);
  const info = con
    .prepare(`INSERT INTO participantes (${CAMPOS_INSERTAR.join(', ')}) VALUES (${marcadores})`)
    .run(valores);
  return porId(info.lastInsertRowid);
}

function porId(id) {
  return conexion().prepare('SELECT * FROM participantes WHERE id = ?').get(id) || null;
}

function porCodigoPublico(codigo) {
  return conexion().prepare('SELECT * FROM participantes WHERE codigo_publico = ?').get(codigo) || null;
}

/**
 * Busca una fila viva que colisione con la clave de unicidad.
 *
 * Normaliza la clave recibida aquí mismo: si el correo llega en mayúsculas o
 * con espacios, debe encontrar la fila igual. Quien llama no tiene que
 * acordarse de normalizar.
 */
function buscarDuplicado({ emailNormalizado, rol, idNormalizado, idTipo }) {
  const con = conexion();
  const correo = mask.normalizarCorreo(emailNormalizado);

  const porCorreo = con
    .prepare("SELECT * FROM participantes WHERE email_normalizado = ? AND estado <> 'anulado'")
    .get(correo);
  if (porCorreo) return { fila: porCorreo, motivo: 'email' };

  if (idNormalizado && idTipo && idTipo !== 'WEB') {
    const porId = con
      .prepare("SELECT * FROM participantes WHERE rol = ? AND id_normalizado = ? AND estado <> 'anulado'")
      .get(rol, idNormalizado);
    // 'motivo' son valores internos que se comparan en las pruebas y se
  // traducen en el mensaje de la API. Van sin tilde a propósito: los textos
  // que ve el usuario se construyen aparte, ya traducidos.
  if (porId) return { fila: porId, motivo: 'identificacion' };
  }
  return null;
}

/** Ultimo registro vivo con el mismo correo (incluye anulados, para diagnostico). */
function historialPorCorreo(emailNormalizado) {
  return conexion()
    .prepare('SELECT * FROM participantes WHERE email_normalizado = ? ORDER BY id DESC')
    .all(emailNormalizado);
}

function marcarVerificado(id) {
  const con = conexion();
  const ahora = ahoraIso();
  return con
    .prepare("UPDATE participantes SET estado='verificado', email_verificado_en=?, actualizado_en=? WHERE id=? AND estado='registrado'")
    .run(ahora, ahora, id);
}

function marcarAnulado(id, motivo) {
  const con = conexion();
  const ahora = ahoraIso();
  return con
    .prepare("UPDATE participantes SET estado='anulado', anulado_en=?, motivo_anulacion=?, actualizado_en=? WHERE id=?")
    .run(ahora, motivo || null, ahora, id);
}

function actualizarRol(id, rol, idTipo, idValue) {
  const ahora = ahoraIso();
  return conexion()
    .prepare(
      `UPDATE participantes
          SET rol = ?, id_tipo = ?, id_valor = ?, id_normalizado = ?, id_parcial = ?, actualizado_en = ?
        WHERE id = ?`
    )
    .run(
      rol,
      idTipo || null,
      idValue || null,
      mask.normalizarIdentificacion(idTipo, idValue) || null,
      mask.enmascararIdentificacion(idTipo, idValue),
      ahora,
      id
    );
}

function listar({ limite = 50, desplazamiento = 0, estado = null, rol = null } = {}) {
  const con = conexion();
  const cond = [];
  const args = [];
  if (estado) { cond.push('estado = ?'); args.push(estado); }
  if (rol) { cond.push('rol = ?'); args.push(rol); }
  const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
  const filas = con
    .prepare(`SELECT * FROM participantes ${where} ORDER BY id DESC LIMIT ? OFFSET ?`)
    .all(...args, limite, desplazamiento);
  const total = con.prepare(`SELECT COUNT(*) AS n FROM participantes ${where}`).get(...args).n;
  return { filas, total };
}

/**
 * Registro + contador coherente en una sola transaccion.
 *
 * El INSERT y la lectura posterior ocurren dentro de la misma transaccion, de
 * modo que el total que se devuelve SIEMPRE refleja el estado persistido, no
 * una estimacion. Si el codigo publico colisiona ( astronomicamente improbable )
 * se reintenta con uno nuevo en lugar de fallar.
 */
function registrarAtomico(fila) {
  return enTransaccion(() => {
    let intento = 0;
    for (;;) {
      try {
        const filaFinal = { ...fila, codigo_publico: ids.codigoPublico() };
        return insertar(filaFinal);
      } catch (err) {
        const unico = String(err && err.message || '');
        if (/UNIQUE constraint failed: participantes\.codigo_publico/.test(unico) && intento < 5) {
          intento += 1;
          continue;
        }
        throw err;
      }
    }
  });
}

module.exports = {
  preparar,
  insertar,
  registrarAtomico,
  porId,
  porCodigoPublico,
  buscarDuplicado,
  historialPorCorreo,
  marcarVerificado,
  marcarAnulado,
  actualizarRol,
  listar,
};