<?php
/*
 * Copia este archivo como config.php EN EL SERVIDOR (misma carpeta que enviar.php)
 * y pon la misma clave que MAIL_RELAY_SECRET en la app de certificados de GoDaddy.
 * config.php no debe subirse nunca a GitHub ni al zip del sitio.
 */
return [
    'secret'    => 'PEGA_AQUI_LA_CLAVE_COMPARTIDA',   // mínimo 32 caracteres
    'from'      => 'ing.alberto@hcgatrading.com',
    'from_name' => 'HCGA Trading LLC',
];
