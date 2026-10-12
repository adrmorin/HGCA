/*
 * Página pública de verificación (la que abre el código QR del certificado).
 * Adaptada de hcga-registro (frontend/js/verificar.js) para consultar Supabase.
 *
 * Privacidad: solo muestra código, fecha, rol y estado; el nombre aparece
 * únicamente si el titular autorizó su publicación. Nunca correo ni teléfono.
 */
(function () {
  "use strict";

  var SUPABASE_URL = "https://nhyovijaojrcowgxbaif.supabase.co";
  var SUPABASE_KEY = "sb_publishable_3SJz2nqAAu18_q1WhJFGDA_YtaKc9NL";
  var salida = document.getElementById("salida");

  var ETIQUETAS = {
    registered: { clase: "warn", titulo: "Certificado registrado", desc: "El registro es válido. El titular aún no ha confirmado su correo." },
    verified: { clase: "ok", titulo: "Certificado verificado", desc: "Autenticidad confirmada por HCGA Trading LLC." },
    revoked: { clase: "bad", titulo: "Certificado revocado", desc: "Este certificado ya no es válido: fue reemplazado por una versión nueva o HCGA anuló el registro." },
    inexistente: { clase: "bad", titulo: "Código no reconocido", desc: "Este código no corresponde a ningún certificado emitido por HCGA Trading LLC." }
  };

  var ICONOS = {
    ok: '<polyline points="20 6 9 17 4 12"/>',
    bad: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    warn: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
  };

  function esc(s) {
    return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fila(etiqueta, valor, mono) {
    return "<dt>" + esc(etiqueta) + "</dt><dd>" + (mono ? '<span class="mono">' + esc(valor) + "</span>" : esc(valor)) + "</dd>";
  }
  function icono(clase) {
    return '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"'
      + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONOS[clase] || ICONOS.warn) + "</svg>";
  }
  function fecha(iso) {
    if (!iso) return null;
    try {
      return new Intl.DateTimeFormat("es-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short", hour12: false })
        .format(new Date(iso)) + " ET";
    } catch (e) { return iso; }
  }

  function pintar(datos) {
    var e = ETIQUETAS[datos ? datos.status : "inexistente"] || ETIQUETAS.inexistente;
    var html = '<div class="card"><div class="head"><div class="icon ' + e.clase + '">' + icono(e.clase) + "</div>"
      + "<div><h1>" + esc(e.titulo) + "</h1><p>" + esc(e.desc) + "</p></div></div>";

    if (datos) {
      html += "<dl>";
      html += fila("Código único (CUI)", datos.cui, true);
      html += fila("Fecha de emisión", fecha(datos.issued_at) || "—");
      html += fila("Versión", String(datos.version || 1), true);
      html += fila("Rol", datos.role === "carrier" ? "Carrier" : "Shipper");
      if (datos.public_name) html += fila("Nombre publicado", datos.public_name);
      html += fila("Fecha de verificación", fecha(datos.verified_at) || "— (correo sin confirmar)");
      html += "</dl>";
      if (!datos.public_name) {
        html += '<p class="note warn">El titular no ha autorizado que se muestre su nombre,'
          + " por lo que aquí no aparece ningún dato identificable.</p>";
      }
    }
    html += "</div>";
    if (!datos) {
      html += '<p class="note warn">Si cree que el código es correcto, compruebe que ha copiado'
        + " la dirección completa y vuelva a intentarlo.</p>";
    }
    salida.innerHTML = html;
    document.title = e.titulo + " — HCGA Trading LLC";
  }

  function fallo(mensaje) {
    salida.innerHTML = '<div class="card"><div class="head"><div class="icon bad">' + icono("bad") + "</div>"
      + "<div><h1>No verificable</h1><p>Error técnico al consultar el certificado.</p></div></div></div>"
      + '<p class="note warn">' + esc(mensaje) + "</p>";
    document.title = "No verificable — HCGA Trading LLC";
  }

  var token = (new URLSearchParams(location.search).get("t") || "").trim().toUpperCase();
  if (!/^[A-Z2-9]{32}$/.test(token)) {
    pintar(null);
    return;
  }

  fetch(SUPABASE_URL + "/rest/v1/rpc/verify_certificate", {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ p_token: token })
  })
    .then(function (r) {
      if (!r.ok) throw new Error("http_" + r.status);
      return r.json();
    })
    .then(function (filas) { pintar(filas && filas[0] ? filas[0] : null); })
    .catch(function () { fallo("No hemos podido contactar con el servidor. Inténtelo de nuevo en unos minutos."); });
})();
