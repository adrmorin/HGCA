/*
 * Campos obligatorios (*) y cartel emergente — compartido por
 * formulario-registro.html (choferes) y formulario-shipper.html (shippers).
 *
 * Un campo es obligatorio si tiene el atributo `required` o si su etiqueta
 * lleva <span class="req">*</span>. Los bloques condicionales ocultos con
 * style="display:none" o [hidden] no se exigen (p. ej. direcciones previas
 * cuando se reside hace 3+ años, o el remolque en camiones rectos).
 */
(function () {
  "use strict";

  var TXT = {
    es: {
      title: "Faltan campos obligatorios",
      lead: "Es necesario completar los campos obligatorios (*) para terminar el registro.",
      listHead: "Pendientes:",
      more: function (n) { return "… y " + n + " más"; },
      section: "Acápite",
      ok: "Completar campos"
    },
    en: {
      title: "Required fields missing",
      lead: "You need to complete the required fields (*) to finish the registration.",
      listHead: "Pending:",
      more: function (n) { return "… and " + n + " more"; },
      section: "Section",
      ok: "Complete fields"
    }
  };
  var MAX_ITEMS = 8;

  /* ---------------------------------------------------------- estilos */
  var css =
    ".hcga-missing{outline:2px solid #EF5350;outline-offset:2px;border-radius:var(--radius-sm,6px)}" +
    ".hcga-req-backdrop{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;" +
      "padding:16px;background:rgba(0,0,0,.62);animation:hcgaReqFade .15s ease-out}" +
    ".hcga-req-dialog{width:100%;max-width:440px;max-height:calc(100vh - 32px);display:flex;flex-direction:column;overflow:hidden;" +
      "background:var(--panel,#1a1a1a);color:var(--text,#F3F1F0);border:1px solid rgba(239,83,80,.55);" +
      "border-radius:var(--radius,8px);box-shadow:0 18px 50px rgba(0,0,0,.55);padding:22px}" +
    ".hcga-req-head{display:flex;gap:12px;align-items:flex-start;margin-bottom:10px}" +
    ".hcga-req-icon{flex-shrink:0;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;" +
      "background:rgba(137,0,0,.3);color:#EF5350}" +
    ".hcga-req-title{margin:0;font-family:var(--font-head,'Saira',sans-serif);font-style:italic;font-weight:800;" +
      "font-stretch:125%;font-size:22px;line-height:1.1;color:#fff}" +
    ".hcga-req-lead{margin:4px 0 0;font-size:14.5px;color:var(--dim,#a0a0a0);line-height:1.45}" +
    ".hcga-req-listhead{margin:14px 0 6px;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--dim,#a0a0a0)}" +
    ".hcga-req-list{margin:0;padding:0 4px 0 0;list-style:none;display:grid;gap:6px;font-size:13.5px;min-height:0;overflow-y:auto;flex:1 1 auto}" +
    ".hcga-req-head,.hcga-req-listhead,.hcga-req-btn{flex-shrink:0}" +
    ".hcga-req-list li{padding:7px 10px;background:var(--panel-2,#1f1f1f);border-left:3px solid #EF5350;border-radius:4px}" +
    ".hcga-req-list small{display:block;color:var(--dimmer,#777);font-size:11.5px;margin-top:1px}" +
    ".hcga-req-btn{margin-top:14px;width:100%;padding:12px 16px;border:0;border-radius:var(--radius-sm,6px);cursor:pointer;" +
      "background:var(--red,#890000);color:#fff;font:700 15px var(--font-base,'Inter',sans-serif)}" +
    ".hcga-req-btn:hover,.hcga-req-btn:focus-visible{filter:brightness(1.18);outline:2px solid #EF5350;outline-offset:2px}" +
    "@keyframes hcgaReqFade{from{opacity:0}to{opacity:1}}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------------------------------------------------------- utilidades */
  function clean(s) { return String(s || "").replace(/\*/g, "").replace(/\s+/g, " ").trim(); }

  function isConditionallyHidden(el, root) {
    for (var n = el; n && n !== root; n = n.parentElement) {
      if (n.hidden || (n.style && n.style.display === "none")) return true;
    }
    return false;
  }

  function fieldBox(el) {
    return el.closest(".upload-card") || el.closest("label.chip") || el.closest(".consent-item") ||
      el.closest(".consent") || el.closest(".field") || el;
  }

  function labelFor(el) {
    var lab = el.id ? document.querySelector('label[for="' + el.id + '"]') : null;
    if (!lab) {
      var box = el.closest("label") || el.closest(".field");
      if (box) lab = box.matches("label") ? box : box.querySelector("label");
    }
    if (!lab) return null;
    return lab;
  }

  function labelText(el) {
    var lab = labelFor(el);
    if (!lab) {
      var card = el.closest(".upload-card");
      var cardLabel = card && card.querySelector(".upload-label");
      return cardLabel ? clean(cardLabel.textContent) : (el.name || el.id);
    }
    var strong = lab.querySelector("strong");
    var i18n = (strong || lab).querySelector("[data-i18n]");
    return clean((i18n || strong || lab).textContent) || el.name || el.id;
  }

  function sectionText(el) {
    var acc = el.closest(".acc-item");
    var title = acc && acc.querySelector(".acc-title");
    return title ? clean(title.textContent) : "";
  }

  function isMarkedRequired(el) {
    if (el.required) return true;
    var lab = labelFor(el);
    return !!(lab && lab.querySelector(".req"));
  }

  function isEmpty(el, form) {
    var type = (el.type || "").toLowerCase();
    if (type === "checkbox") return !el.checked;
    if (type === "radio") return !form.querySelector('input[type="radio"][name="' + el.name + '"]:checked');
    if (type === "file") return !(el.files && el.files.length);
    if (!String(el.value || "").trim()) return true;
    return typeof el.checkValidity === "function" && !el.readOnly && !el.checkValidity();
  }

  /* ---------------------------------------------------------- API */

  /**
   * Devuelve los campos obligatorios sin completar del formulario.
   * `extras`: [{ ok: bool, label, section, focus: elemento }] para requisitos
   * que no son inputs (firma en canvas, verificación biométrica…).
   */
  function check(form, extras) {
    var missing = [];
    var seenRadio = {};
    var controls = form.querySelectorAll("input, select, textarea");
    for (var i = 0; i < controls.length; i++) {
      var el = controls[i];
      var type = (el.type || "").toLowerCase();
      if (type === "hidden" || type === "button" || type === "submit" || el.disabled) continue;
      if (!isMarkedRequired(el) || isConditionallyHidden(el, form)) continue;
      if (type === "radio") { if (seenRadio[el.name]) continue; seenRadio[el.name] = true; }
      if (isEmpty(el, form)) missing.push({ el: el, label: labelText(el), section: sectionText(el) });
    }
    (extras || []).forEach(function (x) {
      if (!x.ok) missing.push({ el: x.focus, label: x.label, section: x.section || (x.focus ? sectionText(x.focus) : "") });
    });
    return missing;
  }

  function mark(missing) {
    document.querySelectorAll(".hcga-missing").forEach(function (n) { n.classList.remove("hcga-missing"); });
    missing.forEach(function (m) { if (m.el) fieldBox(m.el).classList.add("hcga-missing"); });
  }

  function openSection(el) {
    var acc = el && el.closest(".acc-item");
    if (!acc) return;
    acc.classList.add("open");
    var trig = acc.querySelector(".acc-header, .acc-trigger");
    if (trig) trig.setAttribute("aria-expanded", "true");
  }

  function showDialog(lang, missing, onClose) {
    var t = TXT[lang] || TXT.es;
    var old = document.querySelector(".hcga-req-backdrop");
    if (old) old.remove();

    var back = document.createElement("div");
    back.className = "hcga-req-backdrop";
    var items = missing.slice(0, MAX_ITEMS).map(function (m) {
      return "<li>" + esc(m.label) + (m.section ? "<small>" + esc(m.section) + "</small>" : "") + "</li>";
    }).join("");
    if (missing.length > MAX_ITEMS) items += "<li>" + esc(t.more(missing.length - MAX_ITEMS)) + "</li>";

    back.innerHTML =
      '<div class="hcga-req-dialog" role="alertdialog" aria-modal="true" aria-labelledby="hcgaReqTitle" aria-describedby="hcgaReqLead">' +
        '<div class="hcga-req-head">' +
          '<div class="hcga-req-icon" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>' +
          '<div><h2 class="hcga-req-title" id="hcgaReqTitle">' + esc(t.title) + "</h2>" +
          '<p class="hcga-req-lead" id="hcgaReqLead">' + esc(t.lead) + "</p></div>" +
        "</div>" +
        (items ? '<div class="hcga-req-listhead">' + esc(t.listHead) + '</div><ul class="hcga-req-list">' + items + "</ul>" : "") +
        '<button type="button" class="hcga-req-btn">' + esc(t.ok) + "</button>" +
      "</div>";
    document.body.appendChild(back);

    var btn = back.querySelector(".hcga-req-btn");
    function close() {
      document.removeEventListener("keydown", onKey, true);
      back.remove();
      if (onClose) onClose();
    }
    function onKey(e) {
      if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); if (e.key === "Escape") close(); else btn.focus(); }
    }
    btn.addEventListener("click", close);
    back.addEventListener("click", function (e) { if (e.target === back) close(); });
    document.addEventListener("keydown", onKey, true);
    btn.focus();
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /**
   * Valida y, si falta algo, marca los campos, muestra el cartel y al cerrarlo
   * abre el acápite del primer pendiente y lleva el foco a él.
   * Devuelve true si todo está completo.
   */
  function guard(form, lang, extras) {
    var missing = check(form, extras);
    mark(missing);
    if (!missing.length) return true;
    showDialog(lang, missing, function () {
      var first = missing[0].el;
      if (!first) return;
      openSection(first);
      var box = fieldBox(first);
      setTimeout(function () {
        box.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof first.focus === "function") { try { first.focus({ preventScroll: true }); } catch (e) {} }
      }, 120);
    });
    return false;
  }

  // Al corregir un campo se quita su marca.
  document.addEventListener("input", unmark, true);
  document.addEventListener("change", unmark, true);
  function unmark(e) {
    var el = e.target;
    if (!el || !el.closest) return;
    var box = fieldBox(el);
    if (box.classList.contains("hcga-missing") && !isEmpty(el, el.form || document)) box.classList.remove("hcga-missing");
  }

  window.HCGARequired = { check: check, guard: guard, showDialog: showDialog };
})();
