'use strict';
/**
 * Enmascarado de datos personales.
 *
 * Regla del certificado (hoja interna del PDF, seccion B):
 *   Identificacion -> solo los ultimos 4 caracteres:  "USDOT ••••1234"
 *   Correo         -> primera letra y dominio:         "j***@empresa.com"
 *   Telefono       -> solo los ultimos 4 digitos:      "•••-•••-4567"
 *
 * Estas funciones son la UNICA forma de preparar datos para el certificado.
 * Los datos completos nunca se imprimen (se guardan, no se imprimen).
 */

function soloDigitos(v) {
  return String(v ?? '').replace(/\D/g, '');
}

/**
 * Normaliza el valor de identificación según su tipo.
 * Devuelve la clave con la que se detectan duplicados.
 */
function normalizarIdentificacion(tipo, valor) {
  const v = String(valor ?? '').trim();
  if (!v) return '';
  switch (tipo) {
    case 'USDOT':
      return 'usdot:' + soloDigitos(v.replace(/^(usdot|dot)[\s-]*/i, ''));
    case 'MC':
      return 'mc:' + soloDigitos(v.replace(/^mc[\s-]*/i, ''));
    case 'EIN':
      return 'ein:' + soloDigitos(v);
    case 'WEB': {
      const sinProtocolo = v.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').replace(/:\d+$/, '');
      return 'web:' + sinProtocolo;
    }
    default:
      return 'otro:' + v.toLowerCase();
  }
}

/** Identificacion tal y como se imprime: "USDOT ••••1234" o "empresa.com". */
function enmascararIdentificacion(tipo, valor) {
  const v = String(valor ?? '').trim();
  if (!v) return '—';
  if (tipo === 'WEB') {
    const dominio = v.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    return dominio;
  }
  const d = soloDigitos(v);
  const etiqueta = tipo === 'EIN' ? 'EIN' : tipo;
  if (!d) return `${etiqueta} ••••—`;
  return `${etiqueta} ••••${d.slice(-4).padStart(4, '•')}`;
}

/** Correo: "j***@empresa.com" (primera letra + dominio). */
function enmascararCorreo(email) {
  const e = String(email ?? '').trim().toLowerCase();
  if (!e) return '—';
  const i = e.indexOf('@');
  if (i < 1) return '—';
  return `${e[0]}***${e.slice(i)}`;
}

/** Telefono: "•••-•••-4567". */
function enmascararTelefono(telefono) {
  const d = soloDigitos(telefono);
  if (!d) return '—';
  const ultimos = d.slice(-4).padStart(4, '•');
  return `•••-•••-${ultimos}`;
}

/** Normalizacion de correo para comparar: minusculas, sin espacios. */
function normalizarCorreo(email) {
  return String(email ?? '').trim().toLowerCase();
}

/** Normalización del teléfono a solo dígitos (con prefijo internacional si existe). */
function normalizarTelefono(telefono) {
  const d = soloDigitos(telefono);
  if (!d) return '';
  return d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
}

module.exports = {
  normalizarIdentificacion,
  enmascararIdentificacion,
  enmascararCorreo,
  enmascararTelefono,
  normalizarCorreo,
  normalizarTelefono,
  soloDigitos,
};