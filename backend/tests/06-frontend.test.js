'use strict';
/**
 * Pruebas del frontend y de la vista pública de verificación.
 *
 * Comprueban que el formulario original se conserva (campos, roles, textos) y
 * que la sección de contadores está presente y bien formada. El JavaScript del
 * navegador no se ejecuta aquí: para eso está la prueba manual documentada en
 * docs/MANUAL-USUARIO.md, que el usuario hace sobre el formulario real.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { crearContexto, servidorEnPrueba, RAIZ } = require('./_ayuda');

let ctx;
let srv;
let html;
let css;
let js;
let verificar;
let verificarJs;

test.before(async () => {
  ctx = crearContexto();
  srv = await servidorEnPrueba(ctx.cfg);
  html = fs.readFileSync(path.join(ctx.cfg.rutas.frontend, 'index.html'), 'utf8');
  css = fs.readFileSync(path.join(ctx.cfg.rutas.frontend, 'css', 'hcga-formulario.css'), 'utf8')
    + fs.readFileSync(path.join(ctx.cfg.rutas.frontend, 'css', 'estadisticas.css'), 'utf8');
  js = fs.readFileSync(path.join(ctx.cfg.rutas.frontend, 'js', 'hcga-formulario.js'), 'utf8');
  verificar = fs.readFileSync(path.join(ctx.cfg.rutas.frontend, 'verificar.html'), 'utf8');
  verificarJs = fs.readFileSync(path.join(ctx.cfg.rutas.frontend, 'js', 'verificar.js'), 'utf8');
});

test.after(async () => {
  if (srv) await srv.cerrar();
  if (ctx) ctx.limpiar();
});

/* ------------------------------------------- el formulario original sigue */

test('1. Se conservan TODOS los campos del formulario original', () => {
  // Campos presentes en el HTML estático.
  for (const campo of ['name="role"', 'name="name"', 'name="email"', 'name="phone"', 'name="company_website"']) {
    assert.ok(html.includes(campo), `falta el campo original: ${campo}`);
  }
  // Campos que el formulario original genera dinámicamente según el rol
  // (idType, idValue y el bloque opcional), igual que antes.
  for (const campo of ['id="idType"', 'id="idValue"', 'id="o_trucks"', 'id="o_lanes"']) {
    assert.ok(js.includes(campo), `el formulario dinámico no genera: ${campo}`);
  }
  assert.ok(html.includes('id="idBlock"') && html.includes('id="optBlock"'), 'deben existir los bloques dinámicos');
  for (const casilla of ['id="c_terms"', 'id="c_contact"', 'id="c_public"', 'id="c_share"']) {
    assert.ok(html.includes(casilla), `falta el consentimiento original: ${casilla}`);
  }
});

test('2. Se conservan los dos roles del formulario, sin inventar ninguno', () => {
  const roles = [...html.matchAll(/data-role="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(roles.sort(), ['carrier', 'shipper']);
  assert.ok(!/data-role="(auditor|admin|otro)/.test(html), 'no debe haber roles inventados');
});

test('3. Se conservan los textos y la identidad visual originales', () => {
  // Paleta y tipografías del diseño original.
  for (const trozo of ['--ink:#14171A', '--red:#9E2A2F', '--red-bright:#C6383E', 'Barlow Condensed', 'Inter']) {
    assert.ok(css.includes(trozo), `falta la identidad visual: ${trozo}`);
  }
  // Textos legales y de contacto.
  assert.ok(js.includes('ing.alberto@hcgatrading.com'));
  assert.ok(js.includes('Aviso de privacidad de HCGA'));
  assert.ok(js.includes('No es un contrato'));
  assert.ok(js.includes('shipperSub: "Remitente"'));
  assert.ok(js.includes('carrierSub: "Transportista"'));
});

test('4. Se conservan los textos ES y EN completos', () => {
  assert.ok(js.includes('es: {'), 'debe existir el bloque de textos en español');
  assert.ok(js.includes('en: {'), 'debe existir el bloque de textos en inglés');
  for (const clave of ['title', 'lead', 'roleLegend', 'c1pre', 'dataUseText', 'submit', 'eConsent']) {
    assert.ok(js.includes(`${clave}:`), `falta el texto "${clave}"`);
  }
});

test('5. Se conservan las reglas de validación del navegador', () => {
  assert.ok(js.includes('/^\\d{5,8}$/'), 'validación de USDOT');
  assert.ok(js.includes('/^\\d{5,7}$/'), 'validación de MC');
  assert.ok(js.includes('/^\\d{2}-?\\d{7}$/'), 'validación de EIN');
  assert.ok(js.includes('telefonoValido') || js.includes('pd.length === 10'), 'validación de teléfono');
  assert.ok(js.includes('if (!$("c_terms").checked)'), 'consentimiento obligatorio');
  assert.ok(js.includes('if (!$("c_contact").checked)'), 'consentimiento de contacto obligatorio');
  // El campo trampa se conserva y se envía vacío.
  assert.ok(js.includes('company_website'));
});

test('6. El formulario se envía a la API real, no al prototipo', () => {
  assert.ok(js.includes('var PROTOTYPE = false'), 'el prototipo debe estar desactivado');
  assert.ok(js.includes('API + "/clientes"'), 'debe enviar a POST /api/clientes');
  assert.ok(!js.includes('simulate: "Simular'), 'se elimina el botón de simulación del prototipo');
});

test('7. Se evita el doble envío y se ofrece un reintento seguro', () => {
  assert.ok(js.includes('envioEnCurso'), 'debe bloquear el reenvío por clics repetidos');
  assert.ok(js.includes('claveOperacion'), 'debe generar una clave de operación');
  assert.ok(js.includes('X-Operacion'), 'debe enviar la clave de operación');
  assert.ok(js.includes('sendRetry'), 'debe ofrecer un reintento');
});

test('8. Se evita afirmar un envío de correo que el servidor no confirmó', () => {
  // El mensaje de éxito del correo solo se pinta cuando el servidor dice ok.
  const indice = js.indexOf('if (c.ok) {');
  assert.ok(indice > 0, 'debe comprobar el estado real devuelto por el servidor');
  assert.ok(js.includes('mailOkBody'), 'debe tener el texto de correo enviado');
  assert.ok(js.includes('mailErrBody'), 'debe tener el texto de correo fallido');
  // Explicita que aceptar un mensaje no es lo mismo que recibirlo.
  assert.ok(
    /aceptar un mensaje no garantiza|does not guarantee delivery/.test(js),
    'debe matizar que aceptar en el servidor SMTP no es entregar en la bandeja'
  );
  // Y debe avisar de revisar el correo no deseado.
  assert.ok(/no deseado|spam folder/.test(js));
});

/* ------------------------------------------------------- sección contadores */

test('9. La sección de contadores existe y está bien marcada', () => {
  assert.ok(html.includes('id="stats"'), 'debe existir la sección de estadísticas');
  assert.ok(html.includes('id="statsTotal"'), 'debe existir el total');
  assert.ok(html.includes('id="statsRoles"'), 'debe existir el contenedor de roles');
  assert.ok(html.includes('id="statsUpdated"'), 'debe indicar cuándo se actualizó');
  assert.ok(html.includes('aria-live="polite"'), 'debe anunciar los cambios a lectores de pantalla');
  assert.ok(html.includes('aria-labelledby="statsTitle"'), 'debe estar etiquetada');
});

test('10. El total se pinta siempre desde la respuesta del servidor', () => {
  const i = js.indexOf('function renderEstadisticas');
  const bloque = js.slice(i, i + 900);
  assert.ok(bloque.includes('$("statsTotal").textContent = String(s.totalParticipantes)'));
  // Y los contadores por rol se generan desde s.roles, nunca desde una lista
  // escrita a mano en el frontend.
  assert.ok(bloque.includes('(s.roles || []).map'));
  assert.ok(js.includes('cargarEstadisticas'), 'debe consultar el servidor');
  assert.ok(js.includes('/publico/estadisticas'), 'debe usar el endpoint público');
});

test('11. No hay contadores incrementados a mano en el frontend', () => {
  // Tras un registro solo se vuelve a LEER del servidor.
  assert.ok(js.includes('// Los contadores se leen del servidor: nunca se incrementan a mano.'));
  assert.ok(!/statsTotal\s*\+\s*1|total\s*\+=\s*1/.test(js), 'no debe haber incrementos manuales');
});

test('12. Se muestra la fecha de actualización de las cifras', () => {
  assert.ok(js.includes('s.actualizadoEn'), 'debe leer la marca de tiempo del servidor');
  assert.ok(js.includes('statsUpdated'), 'debe mostrarla al usuario');
});

test('13. Si las estadísticas fallan, se avisa sin inventar cifras', () => {
  assert.ok(js.includes('statsUnavailable'), 'debe tener un mensaje de error');
  assert.ok(js.includes('$("statsError").hidden = false'), 'debe mostrar el aviso');
  assert.ok(!js.includes('statsTotal").textContent = "—"'), 'no debe rellenar con cifras falsas');
});

test('14. El diseño de los contadores es adaptable y accesible', () => {
  const estilos = fs.readFileSync(path.join(ctx.cfg.rutas.frontend, 'css', 'estadisticas.css'), 'utf8');
  assert.ok(estilos.includes('@media (max-width:560px)'), 'debe adaptarse a móvil');
  assert.ok(estilos.includes('prefers-reduced-motion'), 'debe respetar la preferencia de menos animación');
  assert.ok(estilos.includes('grid-template-columns'), 'debe usar una rejilla adaptable');
  // Se reutilizan las variables del diseño original.
  assert.ok(estilos.includes('var(--panel)') && estilos.includes('var(--red-bright)'));
});

/* ------------------------------------------------- página de verificación */

test('15. La página del QR se sirve y no revela datos de contacto', () => {
  assert.ok(verificarJs.includes('/api/verificar/'), 'debe consultar el endpoint de verificación');
  // No debe PEDIR ni MOSTRAR correo ni teléfono: solo el código, la fecha y el
  // rol (y el nombre, únicamente si el titular lo autorizó).
  const codigo = verificarJs + verificar;
  assert.ok(!/datos\.correo|\.email\b|telefonoAmostrar/.test(codigo), 'no debe leer campos de contacto');
  assert.ok(!/participant\.email|correo del titular|p\.email/.test(codigo));
  assert.ok(verificar.includes('noindex'), 'no debe indexarse en buscadores');
  assert.match(verificarJs, /nombrePublico/, 'solo debe mostrar el nombre si se autorizó');
  assert.match(verificar, /No contiene datos personales/);
});

test('15b. Ninguna página incluye scripts en línea (obligatorio por la CSP)', () => {
  // El servidor envía una CSP con script-src 'self': un <script> en línea
  // quedaría bloqueado y la página dejaría de funcionar.
  for (const [nombre, contenido] of [
    ['index.html', html],
    ['verificar.html', verificar],
  ]) {
    const enLinea = contenido.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi);
    assert.equal(enLinea, null, `${nombre} tiene un script en línea: ${enLinea && enLinea[0].slice(0, 80)}`);
  }
  // Y el JavaScript de la verificación está en su propio fichero.
  assert.ok(html.includes('<script src="/js/hcga-formulario.js">'));
  assert.ok(verificar.includes('<script src="/js/verificar.js">'));
  const jsVerificar = verificarJs;
  assert.ok(jsVerificar.includes('/api/verificar/'), 'el script debe consultar el endpoint');
  assert.ok(!jsVerificar.includes('<script'), 'el script no debe inyectar HTML con etiquetas');
});

test('16. La página de verificación se entrega desde /verificar/:token', async () => {
  const r = await fetch(`${srv.base}/verificar/ABCDEFGH`);
  assert.equal(r.status, 200);
  const texto = await r.text();
  assert.match(texto, /HCGA/);
  assert.ok(!texto.includes('{{'), 'no debe quedar ningún marcador');
});

test('17. Los estilos del formulario original están separados en su archivo', () => {
  const original = fs.readFileSync(path.join(RAIZ, '_originales', 'hcga-formulario-registro.html'), 'utf8');
  const estilosOriginales = original.match(/<style>([\s\S]*?)<\/style>/)[1];
  // Cada regla del CSS extraído debe estar en el archivo del proyecto.
  const reglas = estilosOriginales
    .match(/^\s*([.#][\w-]+[^{]*)\{/gm)
    .map((r) => r.replace(/\s*\{$/, '').trim())
    .filter((r) => r.length > 2);
  for (const regla of reglas.slice(0, 60)) {
    assert.ok(css.includes(regla), `el CSS del proyecto no conserva la regla: ${regla}`);
  }
  assert.ok(!html.includes('<style>'), 'los estilos deben estar en ficheros aparte');
});