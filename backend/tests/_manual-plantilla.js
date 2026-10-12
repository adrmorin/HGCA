'use strict';
/**
 * Prueba manual de la plantilla: genera un certificado de ejemplo y escribe el
 * PDF en storage/certificados/_prueba-plantilla.pdf para inspeccionarlo a ojo.
 * No toca la base de datos.
 */
const fs = require('node:fs');
const path = require('node:path');
const { config } = require('../src/config');
const certificadoService = require('../src/services/certificado.service');

(async () => {
  const cfg = config();
  const participante = {
    codigo_publico: 'HCGA-CI-2026-7KQ4M2',
    nombre: 'Transportes Rivera LLC',
    rol: 'carrier',
    id_parcial: 'USDOT ••••1234',
    email: 'operaciones@riveratransport.com',
    telefono_parcial: '•••-•••-4567',
    creado_en: new Date().toISOString(),
  };
  const certificado = {
    token_verificacion: '7KQ4M2XB3RT5WV8YC9ZD1HF2JG6NPL4Q',
    version: 1,
    emitido_en: new Date().toISOString(),
    estado: 'registrado',
    fecha_verificacion: null,
  };
  const { buffer, rutaSugerida } = await certificadoService.generar({
    participante,
    certificado,
    enlaceConfirmacion: `${cfg.origenPublico}/confirmar/EJEMPLO`,
  });
  const destino = path.join(cfg.rutas.almacenamiento, 'certificados', '_prueba-plantilla.pdf');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, buffer);
  console.log('OK ->', destino, buffer.length, 'bytes; nombre sugerido:', rutaSugerida);
})().catch((e) => {
  console.error('FALLO:', e);
  process.exit(1);
});