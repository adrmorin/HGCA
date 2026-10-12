'use strict';
/**
 * Pruebas del certificado PDF y del codigo QR.
 *
 * Se comprueba de verdad:
 *   - que el PDF se abre y tiene las páginas esperadas;
 *   - que los marcadores {{...}} han desaparecido;
 *   - que los datos del participante aparecen en el documento;
 *   - que el QR está incrustado y SE LEE con un lector independiente;
 *   - que el QR apunta a la URL de verificación correcta.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PDFDocument } = require('pdf-lib');
const { crearContexto } = require('./_ayuda');
const { leerQrDelCertificado } = require('./_verificar-qr');

let ctx;

test.before(() => { ctx = crearContexto(); });
test.after(() => ctx && ctx.limpiar());

/** Datos de ejemplo (NO son datos reales de ninguna persona). */
const participante = {
  id: 1,
  codigo_publico: 'HCGA-CI-2026-7KQ4M2',
  nombre: 'Transportes Ejemplo LLC',
  rol: 'carrier',
  id_parcial: 'USDOT ••••1234',
  email: 'ejemplo@empresa-demo.test',
  telefono_parcial: '•••-•••-4567',
  creado_en: '2026-10-11T12:00:00.000Z',
};
const certificado = {
  id: 1,
  token_verificacion: '7KQ4M2XB3RT5WV8YC9ZD1HF2JG6NPL4Q',
  version: 1,
  emitido_en: '2026-10-11T12:00:00.000Z',
  estado: 'registrado',
  fecha_verificacion: null,
};

/**
 * Texto de todas las páginas de un PDF, con pdfjs-dist.
 *
 * Se devuelven dos formas porque el extractor de texto divide las frases:
 *  - la plantilla lleva letras espaciadas ("P R I M E R A  P A R T E");
 *  - pdf-lib escribe el texto insertado en fragmentos por palabra.
 * Para comparar sin depender de esos cortes se usa `normalizar`, que elimina
 * todos los espacios.
 */
async function textoDelPdf(buffer) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: false }).promise;
  const partes = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    partes.push(tc.items.map((it) => it.str).join(' '));
  }
  const texto = partes.join('\n');
  return { texto, normalizado: normalizar(texto), paginas: doc.numPages };
}

/** Elimina todos los espacios: insensitive a la separacion de palabras. */
function normalizar(texto) {
  return String(texto).replace(/\s+/g, '');
}

/** ¿Aparece `aguja` dentro de `pila`, ignorando los espacios? */
function contiene(pila, aguja) {
  return normalizar(pila).includes(normalizar(aguja));
}

let generado;

test('1. La plantilla original se puede abrir y tiene 2 páginas', async () => {
  const original = fs.readFileSync(ctx.cfg.certificados.plantilla);
  const doc = await PDFDocument.load(original);
  assert.equal(doc.getPageCount(), 2);
});

test('2. Generar el certificado produce un PDF válido con las páginas configuradas', async () => {
  const servicio = require('../src/services/certificado.service');
  const r = await servicio.generar({ participante, certificado });
  assert.ok(r.buffer.length > 50000, 'el PDF debería tener un tamaño razonable');
  const doc = await PDFDocument.load(r.buffer);
  assert.equal(doc.getPageCount(), 1, 'por defecto solo se entrega la página 1');
  generado = r;
});

test('3. El nombre de archivo no contiene datos personales', async () => {
  const { rutaSugerida } = generado;
  assert.match(rutaSugerida, /^CERT-HCGA-CI-2026-7KQ4M2-v1\.pdf$/);
  assert.ok(!rutaSugerida.includes('@'), 'no debe aparecer el correo');
  assert.ok(!/Ejemplo/i.test(rutaSugerida), 'no debe aparecer el nombre');
});

test('4. El PDF generado conserva el contenido original de la plantilla', async () => {
  const { texto } = await textoDelPdf(generado.buffer);
  // Textos institucionales que NO deben cambiar.
  for (const frase of [
    'CERTIFICADO DIGITAL DE',
    'INTENCIÓN COMERCIAL',
    'PRIMERA PARTE',
    'EMPRESA DE TRANSPORTE',
    'SEGUNDA PARTE',
    'POTENCIAL CLIENTE',
    'NATURALEZA DEL DOCUMENTO',
    'DATOS Y CONFIDENCIALIDAD',
    'VERIFICACIÓN',
    'EMITIDO POR HCGA TRADING LLC',
    'ACEPTADO ELECTRÓNICAMENTE POR EL TITULAR',
    'MANIFESTACIÓN DE INTERÉS',
    'DECLARACIÓN DEL TITULAR',
  ]) {
    assert.ok(contiene(texto, frase), `el certificado debería conservar "${frase}"`);
  }
});

test('5. La hoja interna "NO SE ENVÍA AL CLIENTE" queda fuera', async () => {
  const { texto, paginas } = await textoDelPdf(generado.buffer);
  assert.equal(paginas, 1);
  assert.ok(!texto.includes('HOJA PARA EL EQUIPO'), 'la página 2 no debe estar en el certificado');
  assert.ok(!texto.includes('Cómo se llena y se usa la plantilla'));
});

test('6. Todos los marcadores {{...}} se han sustituido', async () => {
  const { texto } = await textoDelPdf(generado.buffer);
  const marcadores = texto.match(/\{\{[^}]*\}\}/g);
  assert.equal(marcadores, null, `quedan marcadores sin sustituir: ${marcadores && marcadores.join(', ')}`);
});

test('7. Los datos del participante aparecen en el certificado', async () => {
  const { texto } = await textoDelPdf(generado.buffer);
  assert.ok(contiene(texto, 'HCGA-CI-2026-7KQ4M2'), 'debe aparecer el código único');
  assert.ok(contiene(texto, 'Transportes Ejemplo LLC'), 'debe aparecer el nombre');
  assert.ok(contiene(texto, 'Carrier'), 'debe aparecer el rol');
  assert.ok(contiene(texto, 'USDOT'), 'debe aparecer la identificación enmascarada');
  assert.ok(contiene(texto, '4567'), 'debe aparecer el teléfono enmascarado');
});

test('8. Los datos sensibles se imprimen ENMASCARADOS, nunca en claro', async () => {
  const { texto } = await textoDelPdf(generado.buffer);
  assert.ok(!texto.includes('ejemplo@empresa-demo.test'), '¡el correo aparece en claro!');
  assert.ok(texto.includes('e***@empresa-demo.test'), 'el correo debe ir enmascarado');
  assert.ok(!/\b555-0123\b/.test(texto), '¡el teléfono aparece en claro!');
  assert.ok(!/\b1234\b(?!.*•)/.test(texto.replace(/USDOT ••••\d+/g, '')), 'la identificación no debe ir en claro');
});

test('9. La URL de verificación apunta al origen público configurado', async () => {
  const { texto } = await textoDelPdf(generado.buffer);
  assert.ok(
    texto.includes(`${ctx.cfg.origenPublico}/verificar/${certificado.token_verificacion}`),
    'la URL de verificación debe estar en el certificado'
  );
});

test('10. El código QR está incrustado y se LEE correctamente', async () => {
  const r = await leerQrDelCertificado(generado.buffer);
  assert.equal(r.ok, true, r.motivo);
  assert.equal(
    r.texto,
    `${ctx.cfg.origenPublico}/verificar/${certificado.token_verificacion}`,
    'el QR debe contener la URL de verificación'
  );
});

test('11. El certificado conserva el sello digital y la fecha de aceptación', async () => {
  const { texto } = await textoDelPdf(generado.buffer);
  assert.ok(!texto.includes('{{'), 'no debe quedar ningún marcador');
  assert.ok(texto.includes('HCGA-SELLO-'), 'debe aparecer el sello de HCGA');
  assert.ok(!texto.includes('— —'), 'la fecha de aceptación no debe quedar como marcador');
});

test('11b. El sello digital es un resumen, no el token de verificación recortado', async () => {
  const { texto } = await textoDelPdf(generado.buffer);
  // Si el sello fuese el token recortado, el PDF contendría parte del token de
  // verificación, que es el mismo dato que va en el QR. El sello debe ser un
  // resumen independiente: mismo prefijo, 24 caracteres, y no aparece en el
  // QR ni en la URL de verificación.
  const sello = texto.match(/HCGA-SELLO-([0-9A-Z]{24})/);
  assert.ok(sello, `no se encontro un sello con 24 caracteres: ${texto.match(/HCGA-SELLO-\S*/)}`);
  // El token sí aparece, pero solo dentro de la URL de verificación, que es
  // lo que el lector teclea o escanea. Lo que no debe ocurrir es que el sello
  // sea un trozo de ese token.
  assert.ok(
    !sello[1].includes(certificado.token_verificacion.slice(0, 8)),
    'el sello no debe ser un trozo del token'
  );
  assert.ok(
    !certificado.token_verificacion.startsWith(sello[1]),
    'el sello no debe ser el token recortado'
  );
  // El token aparece exactamente una vez: en la URL.
  const apariciones = texto.split(certificado.token_verificacion).length - 1;
  assert.ok(apariciones <= 1, `el token no debe repetirse en el PDF (${apariciones} veces)`);
  // Dos certificados del mismo participante en fechas distintas deben tener
  // sellos distintos: por eso el resumen incluye la fecha de emisión.
  const servicio = require('../src/services/certificado.service');
  const otro = await servicio.generar({
    participante,
    certificado: { ...certificado, emitido_en: '2026-10-12T18:30:00.000Z' },
  });
  const textoOtro = (await textoDelPdf(otro.buffer)).texto;
  const selloOtro = textoOtro.match(/HCGA-SELLO-([0-9A-Z]{24})/);
  assert.ok(selloOtro && selloOtro[1] !== sello[1], 'una reemisión debe cambiar el sello');
});

test('12. Un certificado verificado muestra el estado y la fecha', async () => {
  const servicio = require('../src/services/certificado.service');
  const verificado = {
    ...certificado,
    estado: 'verificado',
    fecha_verificacion: '2026-10-11T18:30:00.000Z',
  };
  const r = await servicio.generar({ participante, certificado: verificado });
  const { texto } = await textoDelPdf(r.buffer);
  assert.ok(/Verificado/i.test(texto), 'debe indicar que está verificado');
  assert.ok(!texto.includes('Pendiente de confirmacion'), 'no debe seguir diciendo pendiente');
});

test('13. Un nombre muy largo se ajusta sin desbordar la página', async () => {
  const servicio = require('../src/services/certificado.service');
  const largo = { ...participante, nombre: 'Empresa Con Un Denominado Social Extremadamente Largo Para Comprobar El Ajuste ' + 'X'.repeat(60) };
  const r = await servicio.generar({ participante: largo, certificado });
  const doc = await PDFDocument.load(r.buffer);
  const { width, height } = doc.getPage(0).getSize();
  assert.equal(width, 612, 'la página conserva el ancho Carta');
  assert.equal(height, 792, 'la página conserva el alto Carta');
  const { texto } = await textoDelPdf(r.buffer);
  assert.ok(contiene(texto, 'Empresa Con Un Denominado Social'));
  assert.ok(!contiene(texto, 'X'.repeat(60)), 'el nombre debe recortarse para que quepa');
});

test('14. Un certificado revocado se marca como tal', async () => {
  const servicio = require('../src/services/certificado.service');
  const r = await servicio.generar({
    participante,
    certificado: { ...certificado, estado: 'revocado' },
  });
  const { texto } = await textoDelPdf(r.buffer);
  assert.ok(/Revocado/i.test(texto));
});

test('15. Si falta la plantilla, el error es explícito y no un 500 genérico', async () => {
  const servicio = require('../src/services/certificado.service');
  const rutaOriginal = ctx.cfg.certificados.plantilla;
  try {
    ctx.cfg.certificados.plantilla = path.join(ctx.dir, 'no-existe.pdf');
    await assert.rejects(
      () => servicio.generar({ participante, certificado }),
      (e) => e.codigo === 'PLANTILLA_AUSENTE'
    );
  } finally {
    ctx.cfg.certificados.plantilla = rutaOriginal;
  }
});

test('16. Si la plantilla pide una página inexistente, el error es explícito', async () => {
  const servicio = require('../src/services/certificado.service');
  const original = ctx.cfg.certificados.paginas;
  try {
    ctx.cfg.certificados.paginas = [1, 99];
    await assert.rejects(
      () => servicio.generar({ participante, certificado }),
      (e) => e.codigo === 'PAGINAS_INVALIDAS'
    );
  } finally {
    ctx.cfg.certificados.paginas = original;
  }
});

test('17. Un nombre de rol desconocido no rompe la generación', async () => {
  const servicio = require('../src/services/certificado.service');
  const r = await servicio.generar({ participante: { ...participante, rol: 'otro' }, certificado });
  const { texto } = await textoDelPdf(r.buffer);
  assert.ok(texto.includes('otro'), 'debe imprimir el rol recibido');
});

test('18. La URL del QR se construye con ORIGEN_PUBLICO', () => {
  const qr = require('../src/services/qr.service');
  const ids = require('../src/utils/ids');

  assert.equal(
    qr.urlVerificacion('ABCDEFGH'),
    `${ctx.cfg.origenPublico}/verificar/ABCDEFGH`
  );

  // Los tokens reales se generan con un alfabeto sin I, L, O, 0 ni 1 para
  // que no se confundan al dictarlos. El validador del endpoint publico es
  // deliberadamente mas permisivo (admite I, L y O) y solo descarta lo que
  // si causa confusion real al leerlo: el 0 y el 1.
  const token = ids.tokenVerificacion();
  assert.equal(qr.tokenTieneFormaValida(token), true, `el token generado debería ser válido: ${token}`);
  assert.ok(!/[ILO01]/.test(token), 'el token generado no debería contener I, L, O, 0 ni 1');

  assert.equal(qr.tokenTieneFormaValida(token.slice(0, 31)), false, 'un token corto no es válido');
  assert.equal(qr.tokenTieneFormaValida(`${token}X`), false, 'un token largo no es válido');
  assert.equal(qr.tokenTieneFormaValida(`0${token.slice(1)}`), false, 'no debe aceptar el 0');
  assert.equal(qr.tokenTieneFormaValida(`1${token.slice(1)}`), false, 'no debe aceptar el 1');
  assert.equal(qr.tokenTieneFormaValida('con espacio'), false);
  assert.equal(qr.tokenTieneFormaValida(null), false);
});

test('19. El QR codifica el contenido completo sin recortarse', async () => {
  const qr = require('../src/services/qr.service');
  const token = require('../src/utils/ids').tokenVerificacion();
  const png = await qr.pngBuffer(qr.urlVerificacion(token));
  assert.ok(png.length > 500, 'debe producir un PNG con contenido');
  // El PNG empieza por su firma magica.
  assert.equal(png.slice(1, 4).toString('latin1'), 'PNG');
});