-- =====================================================================
--  Esquema de la base de datos - HCGA Trading LLC
-- _version: 1
--  SQLite 3.35+ (CHECK con columnas, claves foraneas, WAL)
--
--  Convenciones
--   * Todas las fechas se guardan en ISO-8601 UTC con formato
--     "YYYY-MM-DDTHH:MM:SS.sssZ" (texto), para que el orden lexicografico
--     coincida con el cronologico y no dependa de la zona horaria.
--   * Los importes o cantidades que puedan ser NULL guardan NULL, no "".
--   * No se borra historial: las bajas son cambios de estado, no DELETE.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
--  Control de migraciones
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS _migraciones (
  version      INTEGER PRIMARY KEY,
  nombre       TEXT NOT NULL,
  aplicada_en  TEXT NOT NULL,
  sqlite_version TEXT
);

-- ---------------------------------------------------------------------
--  1. Participantes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS participantes (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Identificador publico, unico y no correlativo con la tabla certificados.
  -- Formato: HCGA-CI-<AAAA>-<6 digitos>. Es lo que ve el titular.
  codigo_publico    TEXT    NOT NULL UNIQUE,

  -- Rol tal y como aparece en el formulario original (sin inventar roles).
  rol               TEXT    NOT NULL
                            CHECK (rol IN ('carrier','shipper')),

  -- Datos declarados en el formulario.
  nombre            TEXT    NOT NULL,
  id_tipo           TEXT    CHECK (id_tipo IN ('USDOT','MC','EIN','WEB')),
  id_valor          TEXT,
  -- Version normalizada (solo digitos o solo dominio) usada para duplicados.
  id_normalizado    TEXT,
  -- Version enmascarada que si se imprime en el certificado.
  id_parcial        TEXT,

  email             TEXT    NOT NULL,
  email_normalizado TEXT    NOT NULL,
  telefono          TEXT,
  telefono_normalizado TEXT,
  telefono_parcial  TEXT,

  -- Bloque opcional de estimacion de potencial (no cuenta para el registro).
  opt_camiones      INTEGER CHECK (opt_camiones IS NULL OR opt_camiones BETWEEN 1 AND 999),
  opt_equipo_usado  TEXT,
  opt_equipo_necesitado TEXT,
  opt_estados       TEXT,
  opt_cargas_mes    INTEGER CHECK (opt_cargas_mes IS NULL OR opt_cargas_mes BETWEEN 0 AND 9999),
  opt_plataforma    TEXT,
  opt_plataforma_costo INTEGER,
  opt_membresia     TEXT,
  opt_rutas         TEXT,
  opt_brokers       TEXT,
  opt_tarifa_promedio INTEGER,

  -- Autorizaciones del formulario.
  cons_terminos     INTEGER NOT NULL CHECK (cons_terminos IN (0,1)),
  cons_contacto     INTEGER NOT NULL CHECK (cons_contacto IN (0,1)),
  cons_publico      INTEGER NOT NULL DEFAULT 0 CHECK (cons_publico IN (0,1)),
  cons_compartir    INTEGER NOT NULL DEFAULT 0 CHECK (cons_compartir IN (0,1)),

  -- Estado del REGISTRO (no del certificado).
  --   registrado = formulario recibido y validado
  --   verificado = el titular confirmo su correo con el enlace
  --   anulado     = dado de baja por HCGA o por el titular (no cuenta)
  estado            TEXT    NOT NULL DEFAULT 'registrado'
                            CHECK (estado IN ('registrado','verificado','anulado')),

  email_verificado_en TEXT,
  anulado_en        TEXT,
  motivo_anulacion  TEXT,

  idioma            TEXT    NOT NULL DEFAULT 'es' CHECK (idioma IN ('es','en')),
  origen            TEXT,

  -- Huella de deduplicacion: SHA-256 de la clave de unicidad. Se indexa.
  huella_duplicado  TEXT    NOT NULL,

  -- Datos minimos de auditoria / traza tecnica.
  ip                TEXT,
  user_agent        TEXT,
  creado_en         TEXT    NOT NULL,
  actualizado_en    TEXT    NOT NULL
);

-- Unicidad de la persona (regla documentada en docs/DUPLICADOS.md):
--   1) Una sola fila viva por correo normalizado.
--   2) Una sola fila viva por identificador registral FUERTE dentro del mismo
--      rol: USDOT, MC o EIN. El sitio web (WEB) NO se usa como clave de
--      unicidad: dos empresas distintas podrian compartirlo.
--      Ambas reglas ignoran las filas anuladas, de modo que una baja libera
--      el identificador para una nueva inscripcion.
CREATE UNIQUE INDEX IF NOT EXISTS ux_participantes_huella_viva
  ON participantes (huella_duplicado)
  WHERE estado <> 'anulado';

CREATE UNIQUE INDEX IF NOT EXISTS ux_participantes_id_registral
  ON participantes (rol, id_normalizado)
  WHERE estado <> 'anulado' AND id_normalizado <> '' AND id_tipo <> 'WEB';

CREATE INDEX IF NOT EXISTS ix_participantes_email    ON participantes (email_normalizado);
CREATE INDEX IF NOT EXISTS ix_participantes_rol_estado ON participantes (rol, estado);
CREATE INDEX IF NOT EXISTS ix_participantes_estado    ON participantes (estado);
CREATE INDEX IF NOT EXISTS ix_participantes_creado    ON participantes (creado_en);
CREATE INDEX IF NOT EXISTS ix_participantes_idnorm    ON participantes (rol, id_normalizado);

-- ---------------------------------------------------------------------
--  2. Certificados
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificados (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  participante_id   INTEGER NOT NULL REFERENCES participantes(id) ON DELETE RESTRICT,

  -- Version del documento: 1, 2, 3... Cada reemision incrementa.
  version           INTEGER NOT NULL DEFAULT 1,
  -- Token aleatorio criptografico que viaja dentro del QR.
  -- No es correlativo ni se deriva de datos personales.
  token_verificacion TEXT   NOT NULL UNIQUE,

  emitido_en        TEXT    NOT NULL,
  plantilla_version TEXT    NOT NULL DEFAULT 'v4',
  paginas           TEXT    NOT NULL DEFAULT '1',
  ruta_pdf          TEXT,
  sha256_pdf        TEXT,
  bytes             INTEGER,      -- tamaño del PDF en disco, para control

  -- Estado de la EMISION del archivo.
  estado_generacion TEXT    NOT NULL DEFAULT 'pendiente'
              CHECK (estado_generacion IN ('pendiente','generando','generado','error')),

  -- Estado de VALIDEZ del certificado (lo que muestra el QR).
  estado            TEXT    NOT NULL DEFAULT 'registrado'
              CHECK (estado IN ('registrado','verificado','revocado','anulado')),

  fecha_verificacion TEXT,
  revocado_en       TEXT,
  motivo_revocacion TEXT,

  error_ultimo      TEXT,
  intentos          INTEGER NOT NULL DEFAULT 0,
  creado_en         TEXT    NOT NULL,
  actualizado_en    TEXT    NOT NULL,

  -- Un certificado vigente por version y participante.
  UNIQUE (participante_id, version)
);

CREATE INDEX IF NOT EXISTS ix_certificados_participante ON certificados (participante_id);
CREATE INDEX IF NOT EXISTS ix_certificados_estado       ON certificados (estado);
-- Solo puede existir UN certificado vigente por participante.
CREATE UNIQUE INDEX IF NOT EXISTS ux_certificados_vigente
  ON certificados (participante_id)
  WHERE estado IN ('registrado','verificado');

-- ---------------------------------------------------------------------
--  3. Historial de correos
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS correos (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  certificado_id    INTEGER NOT NULL REFERENCES certificados(id) ON DELETE CASCADE,

  destinatario      TEXT    NOT NULL,
  remitente         TEXT,
  asunto            TEXT,

  -- Estado del ENVIO, no de la entrega.
  --   pendiente  = en cola
  --   en_curso   = conectado al servidor SMTP
  --   aceptado   = el servidor SMTP acepto el mensaje (NO implica entrega)
  --   error      = fallo, con motivo
  estado            TEXT    NOT NULL DEFAULT 'pendiente'
              CHECK (estado IN ('pendiente','en_curso','aceptado','error')),

  intento           INTEGER NOT NULL DEFAULT 1,
  motivo_error      TEXT,          -- codigo tecnico depurado
  mensaje_smtp_id   TEXT,          -- identificador devuelto por el servidor
  aceptado_en       TEXT,          -- marca de tiempo de la aceptacion SMTP
  adjunto_ruta      TEXT,
  adjunto_bytes     INTEGER,

  creado_en         TEXT    NOT NULL,
  actualizado_en    TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_correos_certificado ON correos (certificado_id);
CREATE INDEX IF NOT EXISTS ix_correos_estado      ON correos (estado);
CREATE INDEX IF NOT EXISTS ix_correos_creado      ON correos (creado_en);

-- ---------------------------------------------------------------------
--  4. Auditoria de operaciones administrativas
--     No contiene contrasenas ni tokens.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auditoria (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha         TEXT    NOT NULL,
  actor         TEXT    NOT NULL DEFAULT 'sistema',  -- 'admin' | 'sistema'
  accion        TEXT    NOT NULL,                   -- 'certificado.generar', ...
  entidad       TEXT,                               -- 'participante' | 'certificado' | 'sistema'
  entidad_id    INTEGER,
  resultado     TEXT    NOT NULL DEFAULT 'ok' CHECK (resultado IN ('ok','error','denegado')),
  detalle       TEXT,       -- JSON depurado, sin secretos
  ip            TEXT
);

CREATE INDEX IF NOT EXISTS ix_auditoria_fecha   ON auditoria (fecha);
CREATE INDEX IF NOT EXISTS ix_auditoria_accion  ON auditoria (accion);
CREATE INDEX IF NOT EXISTS ix_auditoria_entidad ON auditoria (entidad, entidad_id);