<?php
/*
 * HCGA · Pasarela de correo en cPanel
 *
 * La app de certificados (GoDaddy Node.js Hosting) no puede abrir conexiones
 * SMTP; solo HTTPS. Este script recibe el correo por HTTPS y lo envía con el
 * servidor de correo de GoDaddy del hosting cPanel (PHP mail()).
 *
 * Seguridad: solo acepta peticiones firmadas con la clave compartida
 *   X-HCGA-Timestamp: segundos UNIX (se rechaza si difiere más de 5 minutos)
 *   X-HCGA-Signature: hex(HMAC-SHA256(clave, timestamp + "." + cuerpo))
 * La clave vive en config.php (junto a este archivo, solo en el servidor;
 * nunca en el repositorio ni en el zip). Ver config.example.php.
 *
 * Cuerpo JSON:
 *   { "to": "...", "subject": "...", "text": "...", "html": "...",
 *     "attachments": [{ "filename": "...", "contentType": "application/pdf", "contentBase64": "..." }] }
 */

declare(strict_types=1);

const MAX_BYTES = 4 * 1024 * 1024;   // el PDF en base64 ocupa ~170 KB
const MAX_DESFASE = 300;             // segundos

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function responder(int $status, array $cuerpo): void {
    http_response_code($status);
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE);
    exit;
}

function cabecera(string $nombre): string {
    $clave = 'HTTP_' . strtoupper(str_replace('-', '_', $nombre));
    return isset($_SERVER[$clave]) ? trim((string) $_SERVER[$clave]) : '';
}

/** Codifica un texto para una cabecera de correo (RFC 2047). */
function cabeceraUtf8(string $texto): string {
    return preg_match('/[^\x20-\x7E]/', $texto) ? '=?UTF-8?B?' . base64_encode($texto) . '?=' : $texto;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    responder(405, ['error' => 'method_not_allowed']);
}

$config = is_file(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : null;
if (!is_array($config) || strlen((string) ($config['secret'] ?? '')) < 32 || empty($config['from'])) {
    responder(500, ['error' => 'not_configured']);
}

$cuerpo = file_get_contents('php://input', false, null, 0, MAX_BYTES + 1);
if ($cuerpo === false || $cuerpo === '' || strlen($cuerpo) > MAX_BYTES) {
    responder(413, ['error' => 'invalid_size']);
}

// --- Firma ------------------------------------------------------------------
$ts = cabecera('X-HCGA-Timestamp');
$firma = strtolower(cabecera('X-HCGA-Signature'));
if (!ctype_digit($ts) || abs(time() - (int) $ts) > MAX_DESFASE || !preg_match('/^[0-9a-f]{64}$/', $firma)) {
    responder(401, ['error' => 'unauthorized']);
}
$esperada = hash_hmac('sha256', $ts . '.' . $cuerpo, (string) $config['secret']);
if (!hash_equals($esperada, $firma)) {
    responder(401, ['error' => 'unauthorized']);
}

// --- Validación del mensaje -------------------------------------------------
$m = json_decode($cuerpo, true);
if (!is_array($m)) responder(400, ['error' => 'invalid_json']);

$para = trim((string) ($m['to'] ?? ''));
$asunto = trim((string) ($m['subject'] ?? ''));
$texto = (string) ($m['text'] ?? '');
$html = (string) ($m['html'] ?? '');
if (!filter_var($para, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $para . $asunto)) {
    responder(400, ['error' => 'invalid_recipient_or_subject']);
}
if ($asunto === '' || ($texto === '' && $html === '')) {
    responder(400, ['error' => 'empty_message']);
}

$adjuntos = [];
foreach ((array) ($m['attachments'] ?? []) as $a) {
    $nombre = preg_replace('/[^A-Za-z0-9._-]/', '_', (string) ($a['filename'] ?? 'adjunto'));
    $tipo = (string) ($a['contentType'] ?? 'application/octet-stream');
    $datos = base64_decode((string) ($a['contentBase64'] ?? ''), true);
    if ($datos === false || !preg_match('#^[a-z]+/[a-z0-9.+-]+$#i', $tipo)) {
        responder(400, ['error' => 'invalid_attachment']);
    }
    $adjuntos[] = [$nombre, $tipo, $datos];
}

// --- Composición MIME -------------------------------------------------------
$remitente = (string) $config['from'];
$nombreRemitente = (string) ($config['from_name'] ?? 'HCGA Trading LLC');
$dominio = substr(strrchr($remitente, '@') ?: '@localhost', 1);
$idMensaje = sprintf('<%s@%s>', bin2hex(random_bytes(16)), $dominio);
$sepMixto = 'mix_' . bin2hex(random_bytes(12));
$sepAlt = 'alt_' . bin2hex(random_bytes(12));
$eol = "\r\n";

$cabeceras = [
    'From: ' . cabeceraUtf8($nombreRemitente) . " <$remitente>",
    "Reply-To: $remitente",
    "Message-ID: $idMensaje",
    'Date: ' . date(DATE_RFC2822),
    'MIME-Version: 1.0',
    "Content-Type: multipart/mixed; boundary=\"$sepMixto\"",
];

$partes = "--$sepMixto$eol"
    . "Content-Type: multipart/alternative; boundary=\"$sepAlt\"$eol$eol"
    . "--$sepAlt$eol"
    . "Content-Type: text/plain; charset=UTF-8$eol"
    . "Content-Transfer-Encoding: base64$eol$eol"
    . chunk_split(base64_encode($texto !== '' ? $texto : strip_tags($html)), 76, $eol)
    . ($html !== ''
        ? "--$sepAlt$eol"
          . "Content-Type: text/html; charset=UTF-8$eol"
          . "Content-Transfer-Encoding: base64$eol$eol"
          . chunk_split(base64_encode($html), 76, $eol)
        : '')
    . "--$sepAlt--$eol";

foreach ($adjuntos as [$nombre, $tipo, $datos]) {
    $partes .= "--$sepMixto$eol"
        . "Content-Type: $tipo; name=\"$nombre\"$eol"
        . "Content-Disposition: attachment; filename=\"$nombre\"$eol"
        . "Content-Transfer-Encoding: base64$eol$eol"
        . chunk_split(base64_encode($datos), 76, $eol);
}
$partes .= "--$sepMixto--$eol";

// -f fija el remitente del sobre (Return-Path) para que el SPF del dominio
// (include:secureserver.net) valide el envío desde los servidores de GoDaddy.
$ok = mail($para, cabeceraUtf8($asunto), $partes, implode($eol, $cabeceras), '-f' . $remitente);
if (!$ok) {
    $e = error_get_last();
    responder(502, ['error' => 'mail_failed', 'detail' => $e['message'] ?? null]);
}
responder(200, ['ok' => true, 'messageId' => $idMensaje]);
