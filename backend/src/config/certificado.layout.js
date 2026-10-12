'use strict';
/**
 * Configuracion centralizada de la plantilla del certificado.
 *
 * TODO lo relacionado con "donde va cada dato" vive aqui. Si se ajusta una
 * posicion, un tamano o un color, se toca este archivo y nada mas.
 *
 * ORIGEN DE COORDENADAS
 * ---------------------
 * pdf-lib usa el sistema del PDF: origen en la ESQUINA INFERIOR IZQUIERDA,
 * unidades en puntos (1 pt = 1/72 pulgada). La pagina es Carta 612 x 792 pt.
 *
 * COMO SE MEDIO
 * -------------
 * Las coordenadas se extrajeron del propio PDF con pdfjs-dist (el motor de
 * renderizado de Firefox) leyendo la matriz de texto de cada marcador
 * `{{...}}`. Esa matriz ya esta expresada en el sistema del PDF (origen
 * abajo-izquierda), por lo que los valores de este archivo se copiaron
 * directamente sin invertir el eje.
 *
 * La caja que ocupa cada marcador se calcula en tiempo de ejecucion con
 * `widthOfTextAtSize` sobre la MISMA fuente que usa la plantilla
 * (DejaVu Sans Mono), de modo que al taparlo no quedan restos del original.
 *
 * FUENTE
 * ------
 * La plantilla usa DejaVu Sans Mono (monoespaciada, avance 0.602 em), que es
 * la que se incrusta desde templates/fonts/. Si ese fichero no estuviera,
 * el servicio cae a Courier (avance 0.6 em) y escala el tamano para igualar
 * el ancho; la diferencia seria del 0.3 %.
 *
 * COLOR DE FONDO
 * --------------
 * Los marcadores del bloque gris del encabezado se tapan sobre #F6F4EF;
 * el resto, sobre blanco. Los colores se muestrearon del propio PDF.
 */

const PAGE = { ANCHO: 612, ALTO: 792 };

const COLOR = {
  // Muestreado del PDF original (pixel mas oscuro dentro de cada marcador).
  TEXTO: [0x1b / 255, 0x20 / 255, 0x24 / 255], // #1B2024
  TEXTO_SUAVE: [0x6a / 255, 0x70 / 255, 0x77 / 255], // #6A7077
  FONDO_CABECERA: [0xf6 / 255, 0xf4 / 255, 0xef / 255], // #F6F4EF
  FONDO_BLANCO: [1, 1, 1],
};

/**
 * Marcadores de la pagina 1 (la que se entrega).
 *
 *  x, y     posicion de la LINEA BASE del texto, en coordenadas PDF.
 *  fuente   cuerpo en puntos con el que esta compuesto el marcador.
 *  fondo    color con el que se tapa el marcador antes de escribir el valor.
 *  maxAncho ancho util de la columna. Si el valor no cabe, el servicio
 *           reduce el cuerpo hasta un minimo y, si aun asi no cabe, recorta.
 *           `null` = sin limite (por defecto, como en la plantilla).
 *
 * Cuando un mismo `clave` aparece en varias filas, se coloca en todas:
 * el codigo unico, por ejemplo, sale en el encabezado, en el bloque gris,
 * en la seccion de verificacion y en el pie.
 */
const MARCADORES_PAGINA_1 = [
  // -- Encabezado: a la derecha de "DOCUMENTO N.º", sobre blanco ------------
  {
    clave: 'CI_CODIGO_UNICO',
    etiqueta: '{{CI_CODIGO_UNICO}}',
    x: 467.99, y: 741.75, maxAncho: 130, fuente: 8.0, fondo: COLOR.FONDO_BLANCO,
  },
  // -- Bloque gris: codigo, fecha y estado --------------------------------
  {
    clave: 'CI_CODIGO_UNICO',
    etiqueta: '{{CI_CODIGO_UNICO}}',
    x: 63.33, y: 625.5, maxAncho: 380, fuente: 7.6, fondo: COLOR.FONDO_CABECERA,
  },
  {
    clave: 'FECHA_HORA_EMISION',
    etiqueta: '{{FECHA_HORA_EMISION}}',
    x: 63.33, y: 603.75, maxAncho: 380, fuente: 7.6, fondo: COLOR.FONDO_CABECERA,
  },
  {
    clave: 'ESTADO_ACTUAL',
    etiqueta: '{{ESTADO_ACTUAL}}',
    x: 190.92, y: 578.25, maxAncho: 320, fuente: 7.6, fondo: COLOR.FONDO_CABECERA,
  },
  // -- Seccion I: empresa de transporte ----------------------------------
  {
    clave: 'EMPRESA_IDENTIFICACION',
    etiqueta: '{{EMPRESA_IDENTIFICACION}}',
    x: 313.99, y: 529.5, maxAncho: 240, fuente: 7.6, fondo: COLOR.FONDO_BLANCO,
  },
  // -- Seccion II: potencial cliente -------------------------------------
  {
    clave: 'CLIENTE_NOMBRE',
    etiqueta: '{{CLIENTE_NOMBRE}}',
    x: 52.58, y: 460.5, maxAncho: 250, fuente: 7.6, fondo: COLOR.FONDO_BLANCO,
  },
  {
    clave: 'CLIENTE_ID_PARCIAL',
    etiqueta: '{{CLIENTE_ID_PARCIAL}}',
    x: 52.58, y: 435.75, maxAncho: 250, fuente: 7.6, fondo: COLOR.FONDO_BLANCO,
  },
  {
    clave: 'CLIENTE_ROL',
    etiqueta: '{{CLIENTE_ROL: Shipper | Carrier}}',
    x: 313.99, y: 435.75, maxAncho: 235, fuente: 7.6, fondo: COLOR.FONDO_BLANCO,
  },
  {
    clave: 'CLIENTE_EMAIL_ENMASCARADO',
    etiqueta: '{{CLIENTE_EMAIL_ENMASCARADO}}',
    x: 52.58, y: 411.0, maxAncho: 250, fuente: 7.6, fondo: COLOR.FONDO_BLANCO,
  },
  {
    clave: 'CLIENTE_TELEFONO_ENMASCARADO',
    etiqueta: '{{CLIENTE_TELEFONO_ENMASCARADO}}',
    x: 313.99, y: 411.0, maxAncho: 235, fuente: 7.6, fondo: COLOR.FONDO_BLANCO,
  },
  // -- Seccion VII: verificacion -----------------------------------------
  {
    clave: 'CI_CODIGO_UNICO',
    etiqueta: '{{CI_CODIGO_UNICO}}',
    x: 52.58, y: 134.25, maxAncho: 250, fuente: 7.6, fondo: COLOR.FONDO_BLANCO,
  },
  {
    clave: 'URL_VERIFICACION',
    etiqueta: '{{URL_VERIFICACION}}',
    x: 313.99, y: 134.25, maxAncho: 235, fuente: 7.6, fondo: COLOR.FONDO_BLANCO,
  },
  {
    clave: 'ESTADO_CERTIFICADO',
    etiqueta: '{{ESTADO_CERTIFICADO}}',
    x: 52.58, y: 109.5, maxAncho: 250, fuente: 7.6, fondo: COLOR.FONDO_BLANCO,
  },
  {
    clave: 'FECHA_VERIFICACION',
    etiqueta: '{{FECHA_VERIFICACION}}',
    x: 313.99, y: 109.5, maxAncho: 235, fuente: 7.6, fondo: COLOR.FONDO_BLANCO,
  },
  // -- Firmas: sello de HCGA y aceptacion electronica del titular ---------
  {
    clave: 'SELLO_DIGITAL',
    etiqueta: '{{SELLO_DIGITAL}}',
    x: 136.98, y: 50.25, maxAncho: 210, fuente: 7.0, fondo: COLOR.FONDO_BLANCO,
  },
  {
    clave: 'FECHA_HORA_ACEPTACION',
    etiqueta: '{{FECHA_HORA_ACEPTACION}}',
    x: 386.55, y: 61.5, maxAncho: 175, fuente: 7.0, fondo: COLOR.FONDO_BLANCO,
  },
  // -- Pie de pagina ------------------------------------------------------
  {
    clave: 'CI_CODIGO_UNICO',
    etiqueta: '{{CI_CODIGO_UNICO}}',
    x: 472.55, y: 28.5, maxAncho: 130, fuente: 7.6, fondo: COLOR.FONDO_BLANCO,
  },
];

/**
 * Hueco reservado para el codigo QR.
 *
 * Medido sobre el recuadro discontinuo de la plantilla ("631 204 67 67 re"
 * dentro del formulario de la pagina 1), que ocupa de x = 473.1 a 523.7 y de
 * y = 589.5 a 639.3. El hueco se cubre de blanco para que el QR tenga zona
 * de silencio y no se solape con el marco.
 */
const QR = {
  x: 473.1,
  y: 589.5,
  tamano: 50.6,
  margenInterior: 1.5,
  nivelCorreccion: 'M',
  margenBlanco: 1,
};

module.exports = {
  PAGE,
  COLOR,
  MARCADORES_PAGINA_1,
  QR,
  /** Avance de la fuente con la que esta compuesta la plantilla, en em. */
  AVANCE_MONO: 0.602,
};