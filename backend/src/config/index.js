'use strict';
/**
 * Carga y validacion de la configuracion de la aplicacion.
 *
 * Toda la configuracion llega por variables de entorno (.env). El modulo falla
 * de forma explicita si falta un valor obligatorio: es preferible no arrancar
 * que arrancar con valores inventados que acaben en los logs o en un PDF.
 */
const path = require('node:path');
const fs = require('node:fs');
const dotenv = require('dotenv');

const RAIZ = path.resolve(__dirname, '..', '..', '..');

dotenv.config({ path: path.join(RAIZ, '.env') });

class ErrorConfig extends Error {}

function leerEnv(clave, defecto) {
  const v = process.env[clave];
  return v === undefined || v === '' ? defecto : v;
}

function leerEntero(clave, defecto) {
  const v = process.env[clave];
  if (v === undefined || v === '') return defecto;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) throw new ErrorConfig(`La variable ${clave} debe ser un numero entero.`);
  return n;
}

function leerBooleano(clave, defecto) {
  const v = process.env[clave];
  if (v === undefined || v === '') return defecto;
  return ['1', 'true', 'si', 'yes', 'on'].includes(String(v).trim().toLowerCase());
}

function rutaAbsoluta(rel) {
  return path.isAbsolute(rel) ? rel : path.join(RAIZ, rel);
}

function hostPermitido(clave, defecto) {
  const v = leerEnv(clave, defecto);
  // Evita quedar expuestos a toda la red por accidente. Publicar exige un acto
  // deliberado: fijar PERMITIR_BIND_EXTERNO=true.
  if (v === '0.0.0.0' && !leerBooleano('PERMITIR_BIND_EXTERNO', false)) {
    throw new ErrorConfig(
      `${clave}=0.0.0.0 requiere PERMITIR_BIND_EXTERNO=true (vease la guia de publicacion).`
    );
  }
  return v;
}

function construirConfig(env = process.env) {
  process.env = env;
  const puertoPorDefecto = leerEntero('PORT', 3000);

  const datos = {
    entorno: leerEnv('NODE_ENV', 'development'),
    esProduccion: leerEnv('NODE_ENV', 'development') === 'production',

    raiz: RAIZ,
    host: hostPermitido('HOST', '127.0.0.1'),
    puerto: puertoPorDefecto,
    origenPublico: leerEnv('ORIGEN_PUBLICO', `http://127.0.0.1:${puertoPorDefecto}`).replace(/\/+$/, ''),

    rutas: {
      datos: rutaAbsoluta(leerEnv('RUTA_DATOS', 'data')),
      almacenamiento: rutaAbsoluta(leerEnv('RUTA_ALMACENAMIENTO', 'storage')),
      plantillas: rutaAbsoluta(leerEnv('RUTA_PLANTILLAS', 'templates')),
      logs: rutaAbsoluta(leerEnv('RUTA_LOGS', 'logs')),
      backups: rutaAbsoluta(leerEnv('RUTA_BACKUPS', 'backups')),
      frontend: rutaAbsoluta(leerEnv('RUTA_FRONTEND', 'frontend')),
    },

    baseDatos: {
      archivo: rutaAbsoluta(leerEnv('RUTA_BASE_DATOS', 'data/base-datos.db')),
      wal: leerBooleano('SQLITE_WAL', true),
      busyTimeoutMs: leerEntero('SQLITE_BUSY_TIMEOUT_MS', 5000),
    },

    certificados: {
      plantilla: rutaAbsoluta(leerEnv('RUTA_PLANTILLA_CERTIFICADO', 'templates/certificado-original.pdf')),
      // Paginas que forman el certificado entregable. La pagina 2 del PDF
      // original es una hoja interna marcada "NO SE ENVIA AL CLIENTE".
      paginas: leerEnv('CERTIFICADO_PAGINAS', '1')
        .split(',')
        .map((s) => Number.parseInt(s.trim(), 10))
        .filter((n) => Number.isInteger(n) && n >= 1),
      fuenteMono: rutaAbsoluta(leerEnv('FUENTE_MONO_PATH', 'templates/fonts/DejaVuSansMono.ttf')),
      zonaHoraria: leerEnv('ZONA_HORARIA', 'America/New_York'),
      selloPrefijo: leerEnv('SELLO_PREFIJO', 'HCGA-SELLO-'),
      maxIntentosGeneracion: leerEntero('CERTIFICADO_MAX_INTENTOS', 3),
    },

    correo: {
      host: leerEnv('SMTP_HOST', ''),
      puerto: leerEntero('SMTP_PORT', 587),
      seguro: leerBooleano('SMTP_SECURE', false),
      usuario: leerEnv('SMTP_USER', ''),
      clave: leerEnv('SMTP_PASS', ''),
      remitente: leerEnv('MAIL_FROM', 'amlawork75@gmail.com'),
      remitenteNombre: leerEnv('MAIL_FROM_NAME', 'HCGA Trading LLC'),
      conectarAlArrancar: leerBooleano('SMTP_VERIFICAR_AL_ARRANCAR', false),
      tiempoEsperaMs: leerEntero('SMTP_TIMEOUT_MS', 20000),
      // Exigir STARTTLS en los puertos de envio. Es lo correcto en Internet;
      // solo tiene sentido desactivarlo contra un relay interno propio que no
      // lo soporte (por ejemplo, el servidor de captura de las pruebas).
      exigirTls: leerBooleano('SMTP_EXIGIR_TLS', true),
      reintentosMax: leerEntero('SMTP_REINTENTOS_MAX', 3),
      esperaReintentoMs: leerEntero('SMTP_ESPERA_REINTENTO_MS', 4000),
      // Modo captura: los mensajes se guardan en disco y nunca salen a Internet.
      modoCaptura: leerBooleano('SMTP_MODO_CAPTURA', false),
      rutaCaptura: rutaAbsoluta(leerEnv('RUTA_CAPTURA_CORREO', 'storage/mail-capturado')),
      asunto: leerEnv('MAIL_ASUNTO', 'Recibimos su registro de interes - HCGA Trading LLC'),
      // Si true, un correo SMTP inválido se reenvia al remitente configurado
      // en lugar de descartar el certificado (lo activa el administrador).
      remitentePorDefecto: leerBooleano('MAIL_REMITENTE_POR_DEFECTO', false),
    },

    seguridad: {
      // Hash scrypt de la clave de administracion. Generar con: npm run admin:hash
      hashAdmin: leerEnv('ADMIN_HASH', ''),
      limiteRegistroPorIpMin: leerEntero('LIMITE_REGISTRO_POR_IP_MIN', 10),
      limiteGlobalPorIpMin: leerEntero('LIMITE_POR_IP_MIN', 300),
      cuerpoMaximoBytes: leerEntero('CUERPO_MAXIMO_BYTES', 64 * 1024),
      confiarProxy: leerBooleano('CONFIAR_PROXY', false),
    },

    contadores: {
      intervaloRefrescoMs: leerEntero('CONTADORES_INTERVALO_MS', 60000),
      cacheMs: leerEntero('CONTADORES_CACHE_MS', 3000),
    },

    privacidad: {
      // 'confirmados' = registrado + verificado (regla del contador publico)
      // 'verificados'  = solo verificado (regla de la hoja interna del PDF)
      regla: leerEnv('CONTADOR_REGLA', 'confirmados'),
      permitirReRegistroTrasAnular: leerBooleano('PERMITIR_RE_REGISTRO_TRAS_ANULAR', true),
    },

    exportacion: {
      directorio: rutaAbsoluta(leerEnv('RUTA_EXPORTACIONES', 'data/exportaciones')),
      // Campos que jamas deben salir en una exportacion JSON.
      camposProhibidos: ['token_verificacion', 'huella_duplicado', 'password_hash', 'smtp_pass'],
    },
  };

  const problemas = [];
  if (!['confirmados', 'verificados'].includes(datos.privacidad.regla)) {
    problemas.push('CONTADOR_REGLA debe ser "confirmados" o "verificados".');
  }
  if (datos.certificados.paginas.length === 0) {
    problemas.push('CERTIFICADO_PAGINAS debe indicar al menos una pagina valida.');
  }
  if (datos.esProduccion && datos.host === '127.0.0.1' && datos.seguridad.hashAdmin === '') {
    problemas.push('En produccion es obligatorio definir ADMIN_HASH (npm run admin:hash).');
  }
  if (problemas.length) {
    throw new ErrorConfig('Configuracion invalida:\n  - ' + problemas.join('\n  - '));
  }

  const directorios = [
    datos.rutas.datos,
    datos.rutas.almacenamiento,
    datos.rutas.logs,
    datos.rutas.backups,
    path.dirname(datos.baseDatos.archivo),
    datos.exportacion.directorio,
    path.join(datos.rutas.almacenamiento, 'certificados'),
  ];
  for (const dir of directorios) fs.mkdirSync(dir, { recursive: true });

  return datos;
}

let instancia = null;

function config() {
  if (!instancia) instancia = construirConfig();
  return instancia;
}

/** Recarga la configuracion aplicando sobreescrituras (usado por las pruebas). */
function recargar(overrides = {}) {
  const base = { ...process.env };
  for (const k of Object.keys(process.env)) if (!(k in base)) delete process.env[k];
  process.env = { ...base, ...overrides };
  instancia = construirConfig();
  return instancia;
}

module.exports = { config, recargar, construirConfig, ErrorConfig, RAIZ };