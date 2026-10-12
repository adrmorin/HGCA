'use strict';
/**
 * Esquema de validacion del registro.
 *
 * Las reglas reproducen EXACTAMENTE las del JavaScript del formulario original
 * (fichero _originales/hcga-formulario-registro.html, funcion `validate`), de
 * forma que lo que el navegador acepta y lo que acepta el servidor coinciden.
 * La validacion del navegador es una comodidad; esta es la que manda.
 */
const { z } = require('zod');

/** Tipos de identificación admitidos, agrupados por rol. */
const ID_POR_ROL = {
  carrier: ['USDOT', 'MC'],
  shipper: ['EIN', 'WEB'],
};

/** Opciones del bloque opcional, por rol (mismas que el formulario). */
const OPCIONES = {
  carrier: {
    trucks: z.coerce.number().int().min(1).max(999).optional(),
    equip: z.enum(['straight_26ft', 'straight_16_24ft', 'cargo_van', 'tractor_53ft', 'other']).optional(),
    states: z.string().trim().max(60).optional(),
    loads: z.coerce.number().int().min(0).max(9999).optional(),
    board: z.enum(['none', 'dat', 'truckstop', 'other']).optional(),
    boardCost: z.coerce.number().int().min(0).max(9999).optional(),
    member: z.enum(['yes', 'no', 'depends']).optional(),
  },
  shipper: {
    loads: z.coerce.number().int().min(0).max(9999).optional(),
    equip: z.enum(['straight_26ft', 'straight_16_24ft', 'cargo_van', 'tractor_53ft', 'other']).optional(),
    lanes: z.string().trim().max(120).optional(),
    brokers: z.enum(['yes', 'no', 'sometimes']).optional(),
    avgRate: z.coerce.number().int().min(0).max(99999).optional(),
  },
};

const texto = (max) => z.string().trim().max(max);

/** Reglas de identificación, equivalentes a las del formulario. */
const REGLAS_ID = {
  USDOT: {
    mensaje: 'El número USDOT tiene entre 5 y 8 dígitos.',
    valido: (v) => /^\d{5,8}$/.test(String(v).replace(/^(usdot|dot)[\s-]*/i, '').replace(/\D/g, '')),
  },
  MC: {
    mensaje: 'El número MC tiene entre 5 y 7 dígitos.',
    valido: (v) => /^\d{5,7}$/.test(String(v).replace(/^mc[\s-]*/i, '').replace(/\D/g, '')),
  },
  EIN: {
    mensaje: 'El EIN tiene 9 dígitos, por ejemplo 12-3456789.',
    valido: (v) => /^\d{2}-?\d{7}$/.test(String(v).trim()),
  },
  WEB: {
    mensaje: 'Escriba un sitio web válido, por ejemplo empresa.com.',
    valido: (v) => /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(String(v).trim()),
  },
};

/** Teléfono: 10 dígitos, 11 empezando por 1, o internacional con + y 8-15. */
function telefonoValido(v) {
  const d = String(v || '').replace(/\D/g, '');
  if (d.length === 10) return true;
  if (d.length === 11 && d[0] === '1') return true;
  if (/^\s*\+/.test(String(v)) && d.length >= 8 && d.length <= 15) return true;
  return false;
}

const CONSENTIMIENTOS = z.object({
  terms: z.literal(true, { errorMap: () => ({ message: 'Esta autorización es necesaria para registrarse.' }) }),
  contact: z.literal(true, { errorMap: () => ({ message: 'Esta autorización es necesaria para registrarse.' }) }),
  publicListing: z.boolean().optional().default(false),
  shareWithFinanciers: z.boolean().optional().default(false),
});

const cuerpoBase = z.object({
  schema: z.string().max(60).optional(),
  role: z.enum(['carrier', 'shipper'], {
    errorMap: () => ({ message: 'Elija Carrier o Shipper.' }),
  }),
  name: texto(120).min(2, 'Este campo es obligatorio.'),
  idType: z.enum(['USDOT', 'MC', 'EIN', 'WEB']),
  idValue: texto(120).min(1, 'Este campo es obligatorio.'),
  email: texto(160)
    .min(1, 'Este campo es obligatorio.')
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'Escriba un correo válido, por ejemplo nombre@empresa.com.'),
  phone: texto(30).min(1, 'Este campo es obligatorio.').refine(telefonoValido, 'Escriba un teléfono válido, por ejemplo (239) 555-0123.'),
  opt: z.record(z.union([z.string(), z.number(), z.null()])).optional().default({}),
  consents: CONSENTIMIENTOS,
  textVersions: z.object({ certificate: z.string().max(10).optional(), consents: z.string().max(10).optional() }).optional(),
  language: z.enum(['es', 'en']).optional().default('es'),
  source: z.string().max(40).optional(),
  submittedAt: z.string().max(40).optional(),
  userAgent: z.string().max(300).optional(),
  // Campo trampa para robots: debe venir vacio.
  company_website: z.string().max(200).optional(),
});

/**
 * Valida y normaliza el cuerpo de un registro.
 * @returns {{ok: true, datos: object} | {ok: false, errores: Record<string,string>}}
 */
function validarRegistro(cuerpo) {
  const base = cuerpoBase.safeParse(cuerpo);
  if (!base.success) {
    return { ok: false, errores: aMapaErrores(base.error) };
  }
  const d = base.data;

  // El tipo de identificación tiene que corresponder al rol elegido.
  if (!ID_POR_ROL[d.role].includes(d.idType)) {
    return { ok: false, errores: { idType: `El tipo de identificación no corresponde al rol seleccionado.` } };
  }

  // Formato del identificación.
  const regla = REGLAS_ID[d.idType];
  if (regla && !regla.valido(d.idValue)) {
    return { ok: false, errores: { idValue: regla.mensaje } };
  }

  // Bloque opcional: se filtra a las claves que el formulario define para el rol.
  const permitidas = OPCIONES[d.role];
  const opt = {};
  for (const clave of Object.keys(permitidas)) {
    const bruto = d.opt?.[clave];
    if (bruto === undefined || bruto === null || bruto === '') continue;
    const r = permitidas[clave].safeParse(bruto);
    if (r.success) opt[clave] = r.data;
    // Un valor opcional inválido no invalida el registro: se descarta.
  }

  // Descarta cargas en blanco del objeto opcional.
  if (!Object.keys(opt).length) delete d.opt;

  return { ok: true, datos: { ...d, opt } };
}

/** Convierte los errores de zod en un mapa {campo: mensaje} en español. */
function aMapaErrores(error) {
  const mapa = {};
  for (const issue of error.issues) {
    const clave = issue.path[0] ? String(issue.path[0]) : '_general';
    // Para el bloque opcional se baja al campo real (opt.cargas -> "opt").
    if (clave === 'opt') continue;
    if (!mapa[clave]) mapa[clave] = issue.message;
  }
  return mapa;
}

/** Token de verificacion: 32 caracteres de un alfabeto sin ambiguedad. */
const TOKEN_ESQUEMA = z.string().regex(/^[A-Z2-9]{32}$/, 'Token de verificación no válido.');

module.exports = {
  validarRegistro,
  telefonoValido,
  ID_POR_ROL,
  OPCIONES,
  REGLAS_ID,
  TOKEN_ESQUEMA,
};