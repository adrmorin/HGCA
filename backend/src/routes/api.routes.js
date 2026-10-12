'use strict';
/**
 * Definicion de rutas de la API.
 *
 * La tabla pedida en el enunciado se mantiene; la de certificados se amplia
 * con tres rutas auxiliares necesarias para operar:
 *   GET  /api/admin/certificados/:id/archivo   descarga del PDF
 *   POST /api/admin/certificados/:id/revocar   revocacion administrativa
 *   GET  /api/admin/auditoria                  historial de operaciones
 */
const express = require('express');
const c = require('../controllers/api.controller');
const { exigirAdmin } = require('../middleware/autenticacion');
const { limiteRegistro, limiteLectura, limiteAdmin } = require('../middleware/limites');
const { asyncHandler } = require('../middleware/errores');

const router = express.Router();
const h = asyncHandler;

/** Rutas abiertas a cualquiera: solo datos agregados y verificacion minima. */
const publico = express.Router();
publico.get('/estadisticas', limiteLectura, h(c.estadisticasPublicas));
router.use('/publico', publico);

router.get('/verificar/:token', limiteLectura, h(c.verificar));

// --------------------------------------------------------------- sin autenticar
router.get('/health', h(c.salud));
router.post('/clientes', limiteRegistro, h(c.crearCliente));
router.get('/clientes/contador', limiteLectura, h(c.contadorTotal));
router.get('/confirmar/:token', limiteLectura, h(c.confirmarPorToken));

// --------------------------------------------------------------- administracion
const admin = express.Router();
admin.use(exigirAdmin, limiteAdmin);
admin.get('/clientes', h(c.listarClientes));
admin.get('/clientes/:id', h(c.obtenerCliente));
admin.post('/clientes/:id/certificados', h(c.generarCertificado));
admin.get('/certificados', h(c.listarCertificados));
admin.get('/certificados/:id', h(c.obtenerCertificado));
admin.get('/certificados/:id/archivo', h(c.descargarCertificado));
admin.post('/certificados/:id/enviar', h(c.enviarCertificado));
admin.post('/certificados/:id/revocar', h(c.revocarCertificado));
admin.get('/exportaciones/clientes.json', h(c.exportarClientes));
admin.post('/backups', h(c.crearBackup));
admin.get('/backups', h(c.listarBackups));
admin.get('/auditoria', h(c.auditoria));
admin.get('/correo/verificar', h(c.verificarCorreo));
admin.get('/sistema', h(c.estadoSistema));
router.use('/admin', admin);

/*
 * Atajos que conservan literalmente las rutas del enunciado. Apuntan a las
 * mismas funciones y comparten la MISMA autenticacion: no son una via
 * alternativa para saltarse el control de acceso.
 */
router.get('/clientes/:id', exigirAdmin, limiteAdmin, h(c.obtenerCliente));
router.post('/clientes/:id/certificados', exigirAdmin, limiteAdmin, h(c.generarCertificado));
router.get('/certificados/:id', exigirAdmin, limiteAdmin, h(c.obtenerCertificado));
router.post('/certificados/:id/enviar', exigirAdmin, limiteAdmin, h(c.enviarCertificado));
router.get('/exportaciones/clientes.json', exigirAdmin, limiteAdmin, h(c.exportarClientes));
router.post('/backups', exigirAdmin, limiteAdmin, h(c.crearBackup));

module.exports = router;