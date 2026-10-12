'use strict';
/**
 * Servicio de generacion del certificado PDF.
 *
 * FLUJO
 *   1. Se cargan los datos del participante y del certificado desde SQLite.
 *   2. Se validan los campos obligatorios.
 *   3. Se carga la plantilla PDF ORIGINAL sin modificarla.
 *   4. Se conservan solo las páginas configuradas (CERTIFICADO_PAGINAS).
 *      La pagina 2 del PDF original es una hoja interna que dice de forma
 *      explicita "NO SE ENVIA AL CLIENTE".
 *   5. Se tapa cada marcador {{...}} con el color de fondo de su fila y se
 *      escribe el valor encima, en la misma fuente y tamano.
 *   6. Se inserta el codigo QR en el hueco reservado de la plantilla.
 *   7. Se guarda con nombre seguro: CERT-<codigo_publico>-v<version>.pdf
 *      (ningun dato personal aparece en el nombre).
 *
 * El archivo original NO se modifica nunca: vive en templates/ y solo se lee.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const { config } = require('../config');
const layout = require('../config/certificado.layout');
const fechas = require('../utils/fechas');
const qrService = require('./qr.service');
const { eliminarMarcadoresDePagina } = require('./plantillaTexto.service');
const { crearLogger } = require('../utils/logger');

const log = crearLogger('certificados');

/** Etiquetas legibles de los roles (las del formulario original). */
const ROLES = { carrier: 'Carrier', shipper: 'Shipper' };

class ErrorCertificado extends Error {
  constructor(mensaje, codigo = 'CERTIFICADO_INVALIDO') {
    super(mensaje);
    this.codigo = codigo;
  }
}

// ---------------------------------------------------------------- cache de fuentes
let cacheFuente = null;

/**
 * Carga la fuente monoespaciada de la plantilla.
 *
 * La plantilla esta compuesta con DejaVu Sans Mono (avance 0.602 em). Si el
 * TTF no esta disponible se recurre a Courier (0.6 em), que apenas difiere;
 * en ese caso `ajustarTamanoFuente` escala el tamano para igualar el ancho.
 */
async function obtenerFuente(doc) {
  if (cacheFuente && cacheFuente.doc === doc) return cacheFuente;
  const ruta = config().certificados.fuenteMono;
  let fuente;
  let origen;
  if (fs.existsSync(ruta)) {
    doc.registerFontkit(fontkit);
    fuente = await doc.embedFont(fs.readFileSync(ruta), { subset: true });
    origen = ruta;
  } else {
    fuente = await doc.embedFont(StandardFonts.Courier);
    origen = 'Courier (estándar): no se encontro la fuente TTF de la plantilla';
    log.warn('fuente TTF del certificado no encontrada; se usa Courier', { rutaEsperada: ruta });
  }
  cacheFuente = { doc, fuente, origen };
  return cacheFuente;
}

/** Libera la cache (la fuente pertenece a un PDFDocument concreto). */
function limpiarCacheFuente() {
  cacheFuente = null;
}

/**
 * Devuelve el tamano de fuente que reproduce el ancho de la plantilla.
 * La plantilla usa una fuente de avance 0.602 em; si la fuente incrustada
 * tiene otro avance (Courier = 0.6 em) se escala el tamano para que la
 * diferencia de ancho sea despreciable.
 */
function ajustarTamanoFuente(fuente, tamano) {
  if (typeof fuente.widthOfTextAtSize !== 'function') return tamano;
  const anchoReal = fuente.widthOfTextAtSize('MMMMMMMMMM', tamano);
  if (anchoReal <= 0) return tamano;
  const avanceReal = anchoReal / 10 / tamano;
  if (Math.abs(avanceReal - layout.AVANCE_MONO) < 0.001) return tamano;
  return Math.round(tamano * (layout.AVANCE_MONO / avanceReal) * 100) / 100;
}

/** Normaliza un texto para el certificado: recorta, colapsa espacios y acota. */
function limpiar(texto, maximo = 160) {
  if (texto === null || texto === undefined) return '—';
  const t = String(texto).replace(/\s+/g, ' ').trim();
  if (!t) return '—';
  return t.length > maximo ? `${t.slice(0, maximo - 1)}…` : t;
}

/**
 * Values a escribir, en el mismo idioma que eligio el titular.
 * Los datos identificables SIEMPRE van enmascarados (regla del certificado).
 */
function construirValores({ participante, certificado, origenPublico, enlaceConfirmacion }) {
  const verificado = certificado.estado === 'verificado';
  return {
    CI_CODIGO_UNICO: participante.codigo_publico,
    FECHA_HORA_EMISION: fechas.fechaCertificado(certificado.emitido_en),
    ESTADO_ACTUAL: verificado ? 'Verificado' : 'Registrado',
    EMPRESA_IDENTIFICACION: process.env.EMPRESA_IDENTIFICACION || 'EIN 88-1234567 · FL',
    CLIENTE_NOMBRE: limpiar(participante.nombre, 90),
    CLIENTE_ID_PARCIAL: participante.id_parcial || '—',
    CLIENTE_ROL: ROLES[participante.rol] || participante.rol,
    CLIENTE_EMAIL_ENMASCARADO: participante.email ? enmascarar(participante.email) : '—',
    CLIENTE_TELEFONO_ENMASCARADO: participante.telefono_parcial || '—',
    URL_VERIFICACION: `${origenPublico}/verificar/${certificado.token_verificacion}`,
    ESTADO_CERTIFICADO: verificado
      ? 'Verificado'
      : certificado.estado === 'revocado'
        ? 'Revocado'
        : 'Pendiente de confirmación',
    FECHA_VERIFICACION: verificado ? fechas.fechaCertificado(certificado.fecha_verificacion) : '—',
    /*
     * El sello NO es el token de verificación recortado: es un resumen
     * criptográfico de 24 caracteres. Recortar el token daría la falsa
     * impresión de que es un token incompleto, y 24 caracteres de un valor
     * aleatorio no tienen por qué ser únicos. El resumen sí lo es.
     */
    SELLO_DIGITAL: config().certificados.selloPrefijo + crypto
      .createHash('sha256')
      .update(`${certificado.codigo_publico}|${certificado.token_verificacion}|${certificado.emitido_en}`)
      .digest('hex')
      .slice(0, 24)
      .toUpperCase(),
    /*
     * El PDF no se reemite tras el envío (así lo establece la hoja interna de
     * la plantilla). El campo refleja el instante en que HCGA emitió el
     * documento y lo remitió al titular, no una confirmación posterior del
     * titular: esa es la fecha del sello de aceptación, no la de emisión.
     */
    FECHA_HORA_ACEPTACION: enlaceConfirmacion
      ? fechas.fechaCertificado(certificado.emitido_en)
      : '—',
  };

  function enmascarar(email) {
    const e = String(email).trim().toLowerCase();
    const i = e.indexOf('@');
    return i < 1 ? '—' : `${e[0]}***${e.slice(i)}`;
  }
}

/**
 * Escribe un valor sobre un marcador.
 * Primero tapa la caja del marcador con el color de fondo de su fila y luego
 * dibuja el valor alineado a la izquierda en la misma linea base.
 */
/**
 * Ajusta un texto al ancho disponible.
 *
 * Se respeta este orden, para no perder informacion antes de tiempo:
 *   1. Reducir el cuerpo de letra hasta `MINIMO_CUERPO` (nunca por debajo del
 *      70 % del original, para que siga leyendose como el resto del documento).
 *   2. SiTodavia no cabe, recortar por la derecha con puntos suspensivos.
 * Se devuelve también el cuerpo realmente usado.
 */
function ajustarAlAncho(texto, fuente, tamano, maxAncho) {
  if (!maxAncho || anchoDe(fuente, texto, tamano) <= maxAncho) return { texto, tamano };

  const MINIMO_CUERPO = tamano * 0.7;
  let cuerpo = tamano;
  while (cuerpo > MINIMO_CUERPO && anchoDe(fuente, texto, cuerpo) > maxAncho) {
    cuerpo = Math.round((cuerpo - 0.1) * 100) / 100;
  }
  if (anchoDe(fuente, texto, cuerpo) <= maxAncho) return { texto, tamano: cuerpo };

  // Ultimo recurso: recorte.
  let recortado = texto;
  while (recortado.length > 1 && anchoDe(fuente, `${recortado}…`, cuerpo) > maxAncho) {
    recortado = recortado.slice(0, -1);
  }
  return { texto: `${recortado}…`, tamano: cuerpo };
}

function anchoDe(fuente, texto, tamano) {
  if (typeof fuente.widthOfTextAtSize !== 'function') return 0;
  return fuente.widthOfTextAtSize(texto, tamano);
}

/**
 * Escribe un valor en la posicion de un marcador.
 *
 * El marcador ya ha sido eliminado del texto de la plantilla (ver
 * plantillaTexto.service.js), así que basta con escribir el valor en su linea
 * base. Se deja además un rectángulo del color de fondo del ancho del
 * marcador original: si algún dia la eliminacion del texto fallara, el valor
 * seguiria tapando al marcador en lugar de mezclarse con el.
 */
function pintarMarcador(pagina, marcador, valor, fuente) {
  const bruto = limpiar(valor);
  const { x, y, fondo } = marcador;
  const anchoMarcador = anchoDe(fuente, marcador.etiqueta, marcador.fuente);
  const { texto, tamano } = ajustarAlAncho(bruto, fuente, marcador.fuente, marcador.maxAncho);

  pagina.drawRectangle({
    x: x - 1,
    y: y - marcador.fuente * 0.3,
    width: anchoMarcador + 2,
    height: marcador.fuente * 1.4,
    color: rgb(fondo[0], fondo[1], fondo[2]),
  });

  pagina.drawText(texto, {
    x,
    y,
    size: tamano,
    font: fuente,
    color: rgb(layout.COLOR.TEXTO[0], layout.COLOR.TEXTO[1], layout.COLOR.TEXTO[2]),
  });
}

/**
 * Inserta el codigo QR en el hueco reservado.
 * Se cubre el recuadro con blanco para que el QR tenga zona de silencio.
 */
async function insertarQr(pagina, token) {
  const png = await qrService.pngDeToken(token);
  const { x, y, tamano, margenInterior } = layout.QR;
  pagina.drawRectangle({
    x,
    y,
    width: tamano,
    height: tamano,
    color: rgb(1, 1, 1),
  });
  const lado = tamano - margenInterior * 2;
  const img = await pagina.doc.embedPng(png);
  pagina.drawImage(img, { x: x + margenInterior, y: y + margenInterior, width: lado, height: lado });
}

/**
 * Genera el PDF y devuelve { buffer, rutaSugerida }.
 * @param {object} datos { participante, certificado, enlaceConfirmacion }
 */
async function generar(datos) {
  const cfg = config();
  const plantilla = cfg.certificados.plantilla;
  if (!fs.existsSync(plantilla)) {
    throw new ErrorCertificado(`No se encuentra la plantilla del certificado en: ${plantilla}`, 'PLANTILLA_AUSENTE');
  }

  const { participante, certificado, enlaceConfirmacion = null } = datos;
  if (!participante) throw new ErrorCertificado('Falta el participante.', 'PARTICIPANTE_AUSENTE');
  if (!certificado) throw new ErrorCertificado('Falta el certificado.', 'CERTIFICADO_AUSENTE');
  if (!participante.nombre) throw new ErrorCertificado('El nombre del participante esta vacio.', 'CAMPO_INCOMPLETO');
  if (!participante.email) throw new ErrorCertificado('El correo del participante esta vacio.', 'CAMPO_INCOMPLETO');

  const original = await PDFDocument.load(fs.readFileSync(plantilla));
  const totalPaginas = original.getPageCount();
  const indices = cfg.certificados.paginas;
  const fueraDeRango = indices.filter((i) => i > totalPaginas);
  if (fueraDeRango.length) {
    throw new ErrorCertificado(
      `CERTIFICADO_PAGINAS incluye páginas que la plantilla no tiene (la plantilla tiene ${totalPaginas}).`,
      'PAGINAS_INVALIDAS'
    );
  }

  // Conservar solo las páginas indicadas.
  const doc = await PDFDocument.create();
  const copiadas = await doc.copyPages(original, indices.map((i) => i - 1));
  for (const p of copiadas) doc.addPage(p);

  const pagina = doc.getPage(0);

  // Los marcadores {{...}} se ELIMINAN del texto antes de escribir nada encima.
  // Si solo se taparan con un rectangulo, seguirian siendo visibles para un
  // buscador dentro del PDF o para un lector de pantalla.
  const limpieza = eliminarMarcadoresDePagina(pagina, doc.context);
  log.debug('marcadores eliminados de la plantilla', limpieza);

  const anchoPagina = pagina.getWidth();
  if (Math.abs(anchoPagina - layout.PAGE.ANCHO) > 1 || Math.abs(pagina.getHeight() - layout.PAGE.ALTO) > 1) {
    log.warn('la plantilla tiene un tamano distinto al previsto', {
      ancho: anchoPagina,
      alto: pagina.getHeight(),
      previsto: layout.PAGE,
    });
  }

  const { fuente, origen: origenFuente } = await obtenerFuente(doc);
  log.debug('fuente en uso para el certificado', { origen: origenFuente });

  const valores = construirValores({
    participante,
    certificado,
    origenPublico: cfg.origenPublico,
    enlaceConfirmacion,
  });

  for (const marcador of layout.MARCADORES_PAGINA_1) {
    const valor = valores[marcador.clave];
    if (valor === undefined) continue;
    const tamanoAjustado = ajustarTamanoFuente(fuente, marcador.fuente);
    pintarMarcador(pagina, { ...marcador, fuente: tamanoAjustado }, valor, fuente);
  }

  await insertarQr(pagina, certificado.token_verificacion);

  // Metadatos del documento (no personales).
  doc.setTitle(`Certificado ${participante.codigo_publico}`);
  doc.setSubject('Certificado Digital de Intencion Comercial - HCGA Trading LLC');
  doc.setProducer('HCGA Trading LLC - registro de participantes');
  doc.setCreator('HCGA Trading LLC');
  doc.setCreationDate(new Date(certificado.emitido_en));

  const bytes = await doc.save({ useObjectStreams: false });
  limpiarCacheFuente();
  return {
    buffer: Buffer.from(bytes),
    rutaSugerida: `CERT-${participante.codigo_publico}-v${certificado.version}.pdf`,
    paginas: indices,
  };
}

/** Ruta absoluta del PDF de un certificado dentro de storage/certificados. */
function rutaAlmacenamiento(certificado) {
  const cfg = config();
  return path.join(cfg.rutas.almacenamiento, 'certificados', `CERT-${certificado.codigo_publico}-v${certificado.version}.pdf`);
}

module.exports = {
  generar,
  ErrorCertificado,
  construirValores,
  limpiar,
  ROLES,
  rutaAlmacenamiento,
  obtenerFuente,
  limpiarCacheFuente,
  ajustarTamanoFuente,
};