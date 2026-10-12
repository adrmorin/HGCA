/*
 * Página del enlace "Confirmar mi correo" del correo automático.
 * Llama a verify_registration() en Supabase, que pasa el registro y su
 * certificado vigente a "verified". El enlace es de un solo uso y caduca a los 7 días.
 */
(function () {
  "use strict";

  var SUPABASE_URL = "https://nhyovijaojrcowgxbaif.supabase.co";
  var SUPABASE_KEY = "sb_publishable_3SJz2nqAAu18_q1WhJFGDA_YtaKc9NL";
  var salida = document.getElementById("salida");

  var ICONOS = {
    ok: '<polyline points="20 6 9 17 4 12"/>',
    warn: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    bad: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
  };

  function esc(s) {
    return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fecha(iso) {
    try {
      return new Intl.DateTimeFormat("es-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short", hour12: false })
        .format(new Date(iso)) + " ET";
    } catch (e) { return iso; }
  }

  function pintar(clase, titulo, desc, filas) {
    var html = '<div class="card"><div class="head"><div class="icon ' + clase + '">'
      + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + ICONOS[clase] + '</svg></div><div><h1>' + esc(titulo) + '</h1><p>' + esc(desc) + '</p></div></div>';
    if (filas && filas.length) {
      html += "<dl>" + filas.map(function (f) {
        return "<dt>" + esc(f[0]) + "</dt><dd>" + (f[2] ? '<span class="mono">' + esc(f[1]) + "</span>" : esc(f[1])) + "</dd>";
      }).join("") + "</dl>";
    }
    salida.innerHTML = html + "</div>";
    document.title = titulo + " — HCGA Trading LLC";
  }

  var token = (new URLSearchParams(location.search).get("t") || "").trim().toUpperCase();
  if (!/^[A-Z2-9]{32}$/.test(token)) {
    pintar("bad", "Enlace no válido", "Compruebe que ha abierto el enlace completo del correo que le enviamos.");
    return;
  }

  fetch(SUPABASE_URL + "/rest/v1/rpc/verify_registration", {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ p_token: token })
  })
    .then(function (r) {
      return r.json().catch(function () { return null; }).then(function (d) { return { ok: r.ok, d: d }; });
    })
    .then(function (res) {
      if (res.ok && res.d && res.d[0]) {
        var f = res.d[0];
        pintar("ok", "Correo confirmado", "Gracias. Su registro de interés queda verificado.",
          [["Código único (CUI)", f.cui, true], ["Fecha de verificación", fecha(f.verified_at)]]);
      } else if (res.d && res.d.message === "invalid_or_expired_token") {
        pintar("warn", "Enlace ya usado o caducado",
          "Si ya confirmó su correo, no necesita hacer nada. Si no, escríbanos a ing.alberto@hcgatrading.com.");
      } else {
        throw new Error("respuesta no válida");
      }
    })
    .catch(function () {
      pintar("bad", "No pudimos confirmar su correo", "Error técnico al contactar con el servidor. Inténtelo de nuevo en unos minutos.");
    });
})();
