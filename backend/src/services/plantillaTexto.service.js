'use strict';
/**
 * Eliminacion de los marcadores {{...}} del texto de la plantilla.
 *
 * POR QUE NO BASTA CON TAPARLOS
 * -----------------------------
 * La plantilla trae sus marcadores como texto real ("{{CLIENTE_NOMBRE}}").
 * Si solo se cubren con un rectangulo, el documento queda bien a la vista,
 * pero los marcadores siguen en la CAPA DE TEXTO: los veria un buscador
 * dentro del PDF, un lector de pantalla o cualquier extractor de texto.
 * Aqui se eliminan de verdad.
 *
 * COMO SE IDENTIFICAN
 * -------------------
 * En esta plantilla los marcadores son, por diseño, el UNICO texto compuesto
 * en la fuente monoespaciada (DejaVu Sans Mono). Todo el texto institucional
 * (titulos, parrafos, etiquetas) esta en Liberation Sans. Comprobado sobre el
 * PDF original:
 *
 *     F10 (DejaVuSansMono)  340 operaciones, 61 llaves
 *     F18 (DejaVuSansMono)   42 operaciones,  4 llaves
 *     resto de fuentes     miles de operaciones, 0 llaves
 *
 * Por eso la regla es: se descarta toda operacion de escritura dibujada con
 * una fuente monoespaciada. Es simple, determinista y no depende de acertar
 * con la decodificacion de los glifos.
 *
 * COMO SE COMPRUEBA
 * -----------------
 * Tras generar el PDF, backend/tests/03-certificado.test.js extrae el texto
 * del documento y verifica que no queda ni un solo "{{". Si algum dia la
 * plantilla cambiara, esa prueba lo detectaria.
 *
 * El resto del contenido (logos, lineas, colores, textos institucionales) se
 * reenvia tal cual, sin tocarlo.
 */
const { PDFName, PDFRef } = require('pdf-lib');
const zlib = require('node:zlib');

const INICIO_MARCADOR = '{{';
const FIN_MARCADOR = '}}';

// --- Parte 1: flujos y diccionarios de recursos ----------------------------

/** Nombre de los filtros declarados en el diccionario de un flujo. */
function filtroNames(flujo) {
  const dict = flujo.dict;
  if (!dict) return [];
  const filtro = dict.get(PDFName.of('Filter'));
  if (!filtro) return [];
  if (filtro instanceof PDFName) return [String(filtro).replace(/^\//, '')];
  if (typeof filtro.asArray === 'function') {
    return filtro.asArray().map((f) => String(f).replace(/^\//, ''));
  }
  return [];
}

/**
 * Decodifica el contenido binario de un flujo PDF, aplicando su filtro.
 *
 * Dos detalles importantes:
 *  - Los flujos llevan FlateDecode, así que hay que descomprimirlos a mano.
 *  - Tras descomprimir, los flujos de esta plantilla están codificados en
 *    UTF-16BE (con BOM 0xFF 0xFE), no en Latin-1. Los operadores PDF son
 *    ASCII puro, así que el texto decodificado se puede volver a guardar en
 *    Latin-1.
 */
function decodificarFlujo(flujo) {
  if (!flujo || typeof flujo.getContents !== 'function') return '';
  let buf = Buffer.from(flujo.getContents());

  for (const filtro of filtroNames(flujo)) {
    try {
      if (filtro === 'FlateDecode' || filtro === 'FlateEncode') buf = zlib.inflateSync(buf);
      else return ''; // filtro no soportado: mejor no tocar el flujo
    } catch {
      return '';
    }
  }

  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    const invertido = [];
    for (let i = 2; i + 1 < buf.length; i += 2) invertido.push(buf[i + 1], buf[i]);
    return Buffer.from(invertido).toString('utf16le');
  }
  return buf.toString('latin1');
}

/** Resuelve una referencia PDF si el objeto la envuelve. */
function resolver(objeto, context) {
  if (!objeto) return null;
  if (objeto instanceof PDFRef) return resolver(context.lookup(objeto), context);
  return objeto;
}

/** Devuelve los flujos de contenido propios de una pagina. */
function flujosDePagina(pagina) {
  const contenidos = pagina.node.Contents();
  if (!contenidos) return [];
  if (typeof contenidos.asArray === 'function') {
    return contenidos.asArray().filter((h) => typeof h.getContents === 'function');
  }
  if (typeof contenidos.getContents === 'function') return [contenidos];
  return [];
}

/**
 * Devuelve todos los flujos de contenido que dibuja una pagina: los suyos
 * propios y los de los XObject de tipo Form que invoque, en cascada.
 *
 * Se recorren también los formularios porque parte del texto de la plantilla
 * se dibuja dentro de un XObject y no en el flujo de la pagina.
 *
 * Cada grupo trae la forma de sustituir un flujo por otro, para poder
 * reescribirlo sin perder el resto del contenido.
 *
 * @returns {Array<{flujos: Array, recursos: object, reemplazar: Function}>}
 */
function flujosYDiccionariosDe(pagina, context, visitados = new Set(), profundidad = 0) {
  if (profundidad > 4 || visitados.has(pagina.node)) return [];
  visitados.add(pagina.node);

  const recursos = pagina.node.Resources();
  const resultado = [{
    flujos: flujosDePagina(pagina),
    recursos,
    reemplazar(flujoOriginal, nuevoFlujo) {
      const contenidos = pagina.node.Contents();
      if (typeof contenidos.asArray === 'function') {
        const arreglo = contenidos.asArray();
        for (let i = 0; i < arreglo.length; i++) {
          if (arreglo[i] === flujoOriginal) {
            contenidos.set(i, nuevoFlujo);
            return;
          }
        }
        contenidos.push(nuevoFlujo);
      } else {
        pagina.node.set(PDFName.of('Contents'), nuevoFlujo);
      }
    },
  }];

  const xobjects = resolver(recursos && recursos.lookup(PDFName.of('XObject')), context);
  if (!xobjects || typeof xobjects.keys !== 'function') return resultado;

  for (const clave of xobjects.keys()) {
    const flujo = resolver(xobjects.lookup(clave), context);
    if (!flujo || typeof flujo.getContents !== 'function') continue;
    if (String(resolver(flujo.dict.get(PDFName.of('Subtype')), context)) !== '/Form') continue;
    if (visitados.has(flujo.dict)) continue;
    visitados.add(flujo.dict);

    const recursosPropios = resolver(flujo.dict.get(PDFName.of('Resources')), context) || recursos;
    resultado.push({
      flujos: [flujo],
      recursos: recursosPropios,
      reemplazar(flujoOriginal, nuevoFlujo) {
        xobjects.set(clave, nuevoFlujo);
      },
    });

    const anidado = { node: { Resources: () => recursosPropios, Contents: () => flujo } };
    resultado.push(...flujosYDiccionariosDe(anidado, context, visitados, profundidad + 1));
  }

  return resultado;
}

// --- Parte 2: identificación de las fuentes de los marcadores ---------------

/** Nombre real de la fuente (/BaseFont), resolviendo Type0 y referencias. */
function nombreBaseFont(entrada, context) {
  const fuente = resolver(entrada, context);
  if (!fuente || typeof fuente.get !== 'function') return '';

  const directo = resolver(fuente.get(PDFName.of('BaseFont')), context);
  if (directo) return String(directo);

  // Fuente compuesta: el nombre real esta en la fuente descendiente.
  const descendientes = resolver(fuente.get(PDFName.of('DescendantFonts')), context);
  if (descendientes && typeof descendientes.lookup === 'function') {
    const hijo = resolver(descendientes.lookup(descendientes.keys()[0]), context);
    const nombre = hijo && resolver(hijo.get(PDFName.of('BaseFont')), context);
    if (nombre) return String(nombre);
  }
  return '';
}

/**
 * Nombres de recurso (/F10, /F18, ...) cuya fuente es monoespaciada.
 *
 * En la plantilla supplied los marcadores son justo el texto compuesto en la
 * fuente monoespaciada, de modo que estas son las fuentes a limpiar.
 *
 * @returns {Set<string>}
 */
function fuentesDeMarcadores(recursos, context) {
  const resultado = new Set();
  const fuentes = resolver(recursos && recursos.lookup(PDFName.of('Font')), context);
  if (!fuentes || typeof fuentes.keys !== 'function') return resultado;

  for (const clave of fuentes.keys()) {
    const nombre = nombreBaseFont(fuentes.lookup(clave), context);
    if (/Mono|Courier|monospace/i.test(nombre)) resultado.add(String(clave).replace(/^\//, ''));
  }
  return resultado;
}

// --- Parte 3: lectura de texto (para verificaciones y pruebas) -------------

/** Lee un CMap ToUnicode y devuelve glifo -> texto. */
function leerCMap(texto) {
  const mapa = new Map();
  if (!texto) return mapa;

  for (const bloque of texto.match(/beginbfchar([\s\S]*?)endbfchar/g) || []) {
    const re = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
    let m;
    while ((m = re.exec(bloque))) mapa.set(Number.parseInt(m[1], 16), hexAUtf16BE(m[2]));
  }

  for (const bloque of texto.match(/beginbfrange([\s\S]*?)endbfrange/g) || []) {
    const re = /<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g;
    let m;
    while ((m = re.exec(bloque))) {
      const lo = Number.parseInt(m[1], 16);
      const hi = Number.parseInt(m[2], 16);
      const base = hexAUtf16BE(m[3]);
      if (!base.length) continue;
      for (let c = lo; c <= hi && c - lo < 65536; c++) {
        mapa.set(c, base.length === 1 ? String.fromCharCode(base.codePointAt(0) + (c - lo)) : base);
      }
    }
  }
  return mapa;
}

/** Decodifica una cadena hexadecimal escrita en UTF-16BE. */
function hexAUtf16BE(hex) {
  const limpio = String(hex).replace(/\s+/g, '');
  if (limpio.length % 2 !== 0) return '';
  try {
    return new TextDecoder('utf-16be').decode(Buffer.from(limpio, 'hex'));
  } catch {
    let salida = '';
    const b = Buffer.from(limpio, 'hex');
    for (let i = 0; i + 1 < b.length; i += 2) salida += String.fromCharCode((b[i] << 8) | b[i + 1]);
    return salida;
  }
}

/** Convierte una cadena hexadecimal de operandos en el texto que representa. */
function decodificarHex(hex, mapa) {
  if (!mapa) return '';
  let salida = '';
  const ancho = hex.length % 4 === 0 ? 4 : 2;
  for (let i = 0; i + ancho <= hex.length; i += ancho) {
    const texto = mapa.get(Number.parseInt(hex.slice(i, i + ancho), 16));
    if (texto !== undefined) salida += texto;
  }
  return salida;
}

/** Mapa glifo -> texto de cada fuente de un diccionario de recursos. */
function mapasDeFuentesDe(recursos, context) {
  const resultado = new Map();
  const fuentes = resolver(recursos && recursos.lookup(PDFName.of('Font')), context);
  if (!fuentes || typeof fuentes.keys !== 'function') return resultado;

  for (const clave of fuentes.keys()) {
    let fuente = resolver(fuentes.lookup(clave), context);
    if (!fuente || typeof fuente.get !== 'function') continue;

    let conUnicode = fuente;
    if (!fuente.get(PDFName.of('ToUnicode'))) {
      const descendientes = resolver(fuente.get(PDFName.of('DescendantFonts')), context);
      if (descendientes && typeof descendientes.lookup === 'function') {
        const hijo = resolver(descendientes.lookup(descendientes.keys()[0]), context);
        if (hijo) conUnicode = hijo;
      }
    }

    const toUnicode = resolver(conUnicode.get(PDFName.of('ToUnicode')), context);
    if (!toUnicode || typeof toUnicode.getContents !== 'function') continue;
    const mapa = leerCMap(decodificarFlujo(toUnicode));
    if (mapa.size) resultado.set(String(clave).replace(/^\//, ''), mapa);
  }
  return resultado;
}

/** Texto que dibuja una linea del flujo, o null si no dibuja texto. */
function textoDeLinea(linea, mapa) {
  const simple = linea.match(/<([0-9A-Fa-f]+)>\s*Tj$/);
  if (simple) return decodificarHex(simple[1], mapa);

  const multiple = linea.match(/\[(.*)\]\s*TJ$/);
  if (multiple) {
    const trozos = multiple[1].match(/<([0-9A-Fa-f]+)>/g) || [];
    return trozos.map((t) => decodificarHex(t.slice(1, -1), mapa)).join('');
  }
  return null;
}

/** Texto completo de un flujo, sin pasarse por posiciones ni saltos de linea. */
function textoDeFlujo(flujo, mapas) {
  let fuente = null;
  let texto = '';
  for (const linea of decodificarFlujo(flujo).split(/\r?\n/)) {
    const t = linea.trim();
    const f = t.match(/^\/(\S+)\s+[\d.]+\s+Tf$/);
    if (f) { fuente = mapas.get(f[1]) || null; continue; }
    const s = textoDeLinea(t, fuente);
    if (s !== null) texto += s;
  }
  return texto;
}

// --- Parte 4: la operacion principal ----------------------------------------

/**
 * Elimina de la pagina todo el texto compuesto en la fuente monoespaciada,
 * que en esta plantilla son los marcadores {{...}}.
 *
 * @param {import('pdf-lib').PDFPage} pagina
 * @param {import('pdf-lib').PDFContext} context
 * @returns {{eliminadas:number, fuentes:string[]}}
 */
function eliminarMarcadoresDePagina(pagina, context) {
  const grupos = flujosYDiccionariosDe(pagina, context);
  let eliminadas = 0;
  const fuentesVistas = new Set();

  for (const grupo of grupos) {
    const deMarcadores = fuentesDeMarcadores(grupo.recursos, context);
    if (!deMarcadores.size) continue;
    for (const f of deMarcadores) fuentesVistas.add(f);

    for (const flujo of grupo.flujos) {
      const lineas = decodificarFlujo(flujo).split(/\r?\n/);
      const salida = [];
      let fuente = null;

      for (const linea of lineas) {
        const t = linea.trim();
        const cambio = t.match(/^\/(\S+)\s+[\d.]+\s+Tf$/);
        if (cambio) {
          fuente = cambio[1];
          salida.push(linea);
          continue;
        }
        // Toda operacion de escritura con fuente monoespaciada = marcador.
        if (deMarcadores.has(fuente) && textoDeLinea(t, null) !== null) {
          eliminadas += 1;
          continue;
        }
        salida.push(linea);
      }

      if (eliminadas > 0) {
        // IMPORTANTE: un flujo PDF debe ser un objeto INDIRECTO. Si se insertara
        // el flujo en crudo dentro de un array o un diccionario, el documento
        // seria inválido y algunos lectores lo rechazarian. Por eso se registra
        // en el contexto y se asígna su referencia.
        const referencia = context.register(context.flateStream(Buffer.from(salida.join('\n'), 'latin1'), {}));
        grupo.reemplazar(flujo, referencia);
      }
    }
  }

  return { eliminadas, fuentes: [...fuentesVistas] };
}

module.exports = {
  eliminarMarcadoresDePagina,
  fuentesDeMarcadores,
  nombreBaseFont,
  flujosYDiccionariosDe,
  flujosDePagina,
  mapasDeFuentesDe,
  textoDeFlujo,
  textoDeLinea,
  decodificarFlujo,
  decodificarHex,
  leerCMap,
  INICIO_MARCADOR,
  FIN_MARCADOR,
};