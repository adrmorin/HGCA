'use strict';
/**
 * Verificacion de que el QR incrustado en el certificado se puede LEER de
 * verdad: se rasteriza el PDF generado, se recorta la zona reservada para el
 * QR y se decodifica con un lector independiente del que lo genero.
 *
 * Es una comprobacion de la Fase 5 (validacion documental). Requiere las
 * dependencias de desarrollo `mupdf` y `jsqr`.
 *
 * ---
 *  Por que NO se usa `canvas`
 * ---
 * `canvas` es un modulo nativo que necesita Python y las herramientas de
 * compilacion de C++ para instalarse en un equipo sin binario precompilado.
 * Eso convertia `npm install` en una fuente de fallos para quien solo quiere
 * usar la aplicacion.
 *
 * No hace falta: `mupdf` ya entrega los pixeles en crudo
 * (`Pixmap.getPixels()` -> `Uint8ClampedArray` en RGBA), que es exactamente lo
 * que `jsqr` espera. Menos dependencias nativas, menos problemas.
 */
const fs = require('node:fs');
const path = require('node:path');
const jsQR = require('jsqr');
const layout = require('../src/config/certificado.layout');

/**
 * Rasteriza una pagina del PDF y devuelve sus pixeles en RGBA.
 *
 * mupdf devuelve los pixeles tal cual los produce el renderizador, y para
 * DeviceRGB eso son 3 bytes por pixel (sin canal alfa). `jsqr` trabaja con
 * RGBA de 4 bytes, asi que aqui se anade el canal alfa a255. Si se olvidara,
 * el recorte se desalinearia y el QR no se leeria: es un fallo silencioso,
 * por eso la conversion es explicita y no se da por supuesta.
 */
async function rasterizar(pdfBuffer, { escala = 4, pagina = 0 } = {}) {
  const mupdf = await import('mupdf');
  const doc = mupdf.Document.openDocument(Buffer.from(pdfBuffer), 'application/pdf');
  const pix = doc
    .loadPage(pagina)
    .toPixmap(mupdf.Matrix.scale(escala, escala), mupdf.ColorSpace.DeviceRGB, false, true);
  const ancho = pix.getWidth();
  const alto = pix.getHeight();
  const componentes = pix.getNumberOfComponents();
  const origen = pix.getPixels();

  let data;
  if (componentes === 4) {
    data = origen;
  } else {
    data = new Uint8ClampedArray(ancho * alto * 4);
    for (let i = 0, j = 0; i < origen.length; i += componentes, j += 4) {
      data[j] = origen[i];
      data[j + 1] = origen[i + 1];
      data[j + 2] = origen[i + 2];
      data[j + 3] = 255;
    }
  }
  return { data, width: ancho, height: alto };
}

/** Copia un rectangulo de la imagen. Devuelve null si no cabe entero. */
function recortar(img, x0, y0, ancho, alto) {
  if (x0 < 0 || y0 < 0 || x0 + ancho > img.width || y0 + alto > img.height) return null;
  const salida = new Uint8ClampedArray(ancho * alto * 4);
  for (let fila = 0; fila < alto; fila++) {
    const origen = ((y0 + fila) * img.width + x0) * 4;
    salida.set(img.data.subarray(origen, origen + ancho * 4), fila * ancho * 4);
  }
  return { data: salida, width: ancho, height: alto };
}

/**
 * Recorta la zona del QR segun el layout y la decodifica.
 * @returns {Promise<{ok: boolean, texto: string|null, motivo: string|null}>}
 */
async function leerQrDelCertificado(pdfBuffer, { pagina = 0, escala = 4 } = {}) {
  const img = await rasterizar(pdfBuffer, { escala, pagina });
  const q = layout.QR;

  // El origen de la imagen es la esquina superior izquierda; el del PDF, la
  // inferior izquierda, asi que se invierte la coordenada vertical.
  const x = Math.round(q.x * escala);
  const y = Math.round((layout.PAGE.ALTO - q.y - q.tamano) * escala);
  const lado = Math.round(q.tamano * escala);

  if (x < 0 || y < 0 || x + lado > img.width || y + lado > img.height) {
    return {
      ok: false,
      texto: null,
      motivo: `El hueco del QR queda fuera de la pagina (x=${x}, y=${y}, lado=${lado}, pagina=${img.width}x${img.height}).`,
    };
  }

  // Se amplia un poco el recorte para no perder los modulos de los bordes, que
  // son los que el lector necesita para encontrar los patrones de inicio.
  const holgura = Math.round(lado * 0.06);
  const x0 = Math.max(0, x - holgura);
  const y0 = Math.max(0, y - holgura);
  const ancho = Math.min(img.width - x0, lado + holgura * 2);
  const alto = Math.min(img.height - y0, lado + holgura * 2);

  const recorte = recortar(img, x0, y0, ancho, alto);
  if (!recorte) {
    return {
      ok: false,
      texto: null,
      motivo: `El recorte del QR no cabe en la pagina (${ancho}x${alto} en ${img.width}x${img.height}).`,
    };
  }

  const leido = jsQR(recorte.data, recorte.width, recorte.height);
  if (!leido) {
    return { ok: false, texto: null, motivo: 'El lector no pudo decodificar el codigo QR del certificado.' };
  }
  return { ok: true, texto: leido.data, motivo: null };
}

/** Comprobacion de la Fase 5 sobre un PDF ya generado en disco. */
async function verificarArchivo(rutaPdf) {
  if (!fs.existsSync(rutaPdf)) {
    return { ok: false, texto: null, motivo: `No existe el PDF: ${rutaPdf}` };
  }
  return leerQrDelCertificado(fs.readFileSync(rutaPdf));
}

module.exports = { leerQrDelCertificado, verificarArchivo, rasterizar, generarEjemplo };

/**
 * Genera un certificado de ejemplo en memoria, sin tocar la base de datos.
 *
 * Sirve para que `npm run test:qr` funcione por sí solo, sin depender de que
 * antes se haya ejecutado `npm run test:template`: si el PDF no existe, se
 * genera aqui con los mismos datos ficticios que usan las pruebas.
 */
async function generarEjemplo() {
  const servicio = require('../src/services/certificado.service');
  const r = await servicio.generar({
    participante: {
      id: 1,
      codigo_publico: 'HCGA-CI-2026-7KQ4M2',
      nombre: 'Transportes Ejemplo LLC',
      rol: 'carrier',
      id_parcial: 'USDOT ••••1234',
      email: 'ejemplo@empresa-demo.test',
      telefono_parcial: '•••-•••-4567',
      creado_en: '2026-10-11T12:00:00.000Z',
    },
    certificado: {
      id: 1,
      token_verificacion: '7KQ4M2XB3RT5WV8YC9ZD1HF2JG6NPL4Q',
      version: 1,
      emitido_en: '2026-10-11T12:00:00.000Z',
      estado: 'registrado',
      fecha_verificacion: null,
    },
  });
  return r.buffer;
}

/* Uso directo:  node backend/tests/_verificar-qr.js [fichero.pdf] */
if (require.main === module) {
  const arg = process.argv[2];
  const rutaPorDefecto = path.join(
    __dirname, '..', '..', 'storage', 'certificados', '_prueba-plantilla.pdf'
  );

  const correr = async () => {
    // Si no se indica un fichero, se usa el de la plantilla si existe; si no,
    // se genera uno en memoria. Asi el comando nunca falla por un paso previo.
    if (arg || fs.existsSync(rutaPorDefecto)) {
      return verificarArchivo(arg || rutaPorDefecto);
    }
    console.log('  No hay ningun PDF de ejemplo: se genera uno en memoria.');
    const buffer = await generarEjemplo();
    return leerQrDelCertificado(buffer);
  };

  correr()
    .then((r) => {
      console.log(r.ok ? `QR OK -> ${r.texto}` : `QR NO VERIFICABLE: ${r.motivo}`);
      process.exit(r.ok ? 0 : 1);
    })
    .catch((e) => { console.error(e); process.exit(1); });
}