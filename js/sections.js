/* ==========================================================================
   Oh! Gift — per-section content from assets/data/sections.json
   ==========================================================================
   Each home-page section's eyebrow / title / paragraph / photo can be edited
   at /admin/ (the CMS, "Homepage sections"). This script applies whatever is
   in that file on top of the static HTML. If a field is empty — or the file
   fails to load — the static HTML text shows instead, so the page can never
   end up blank.

   Loaded last so it also wins over the tagline from js/site.config.js.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };

  /* Set an element's text. Empty / missing values are skipped so the
     static HTML copy stays as the fallback. */
  function putText(el, value) {
    if (!el || value == null || String(value).trim() === "") return;
    el.textContent = String(value);
  }

  function putImage(el, src, alt) {
    if (!el || !src || String(src).trim() === "") return;
    el.setAttribute("src", String(src));
    if (alt && String(alt).trim() !== "") el.setAttribute("alt", String(alt));
  }

  function applySections(S) {
    /* an object worker: fn(sectionObj) if that section exists in the JSON */
    function sec(name, fn) {
      if (S && S[name] && typeof S[name] === "object") fn(S[name]);
    }

    /* ---------- Hero (top banner) ---------- */
    sec("hero", function (h) {
      putText($(".hero .eyebrow"), h.eyebrow);
      var title = $("#hero-title");
      if (title && (h.title || h.titleAccent)) {
        var esc = function (s) {
          return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
          });
        };
        title.innerHTML =
          esc(h.title) + ' <span class="oh">' + esc(h.titleAccent || "Oh!") + "</span>";
      }
      putText($("[data-tagline]"), h.tagline);
      putText($(".hero__lede"), h.lede);
      putImage($(".hero__media img"), h.image);
    });

    /* ---------- Gift collection intro ---------- */
    sec("gifting", function (g) {
      putText($("#gifting .section-head .eyebrow"), g.eyebrow);
      putText($("#gifting-title"), g.title);
      putText($("#gifting .section-head .lede"), g.lede);
    });

    /* ---------- Corporate gifting ---------- */
    sec("corporate", function (c) {
      putText($("#corporate .eyebrow"), c.eyebrow);
      putText($("#corp-title"), c.title);
      putText($("#corporate .lede"), c.lede);
      putImage($("#corporate .corp__media img"), c.image, c.imageAlt);
    });

    /* ---------- How it works ---------- */
    sec("how", function (w) {
      putText($("#how .how__aside .eyebrow"), w.eyebrow);
      putText($("#how-title"), w.title);
      putText($("#how .how__aside .lede"), w.lede);
    });

    /* ---------- Personal / occasions ---------- */
    sec("occasions", function (o) {
      putText($("#occasions .eyebrow"), o.eyebrow);
      putText($("#personal-title"), o.title);
      putText($("#occasions .lede"), o.lede);
      var ul = $("ul.occasions");
      if (ul && ul.nextElementSibling) putText(ul.nextElementSibling, o.note);
      putImage($("#occasions .personal__media img"), o.image, o.imageAlt);
    });

    /* ---------- About / our story ---------- */
    sec("about", function (a) {
      putText($("#about .eyebrow"), a.eyebrow);
      putText($("#about-title"), a.title);
      var body = $("#about .about__body");
      if (body && a.body && String(a.body).trim() !== "") {
        var esc = function (s) {
          return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
          });
        };
        body.innerHTML = String(a.body)
          .trim()
          .split(/\n\s*\n/)                    /* blank line = new paragraph */
          .map(function (p) { return "<p>" + esc(p.trim()) + "</p>"; })
          .join("");
      }
      putImage($("#about .about__media img"), a.image, a.imageAlt);
    });

    /* ---------- Catalogue download ---------- */
    sec("catalogue", function (c) {
      putText($("#catalogue .eyebrow"), c.eyebrow);
      putText($("#cat-title"), c.title);
      putText($("#catalogue .download__aside > p:not(.eyebrow)"), c.lede);
    });

    /* ---------- Contact ---------- */
    sec("contact", function (c) {
      putText($("#contact .section-head .eyebrow"), c.eyebrow);
      putText($("#contact-title"), c.title);
      putText($("#contact .section-head .lede"), c.lede);
    });
  }

  var url = "assets/data/sections.json" +
    "?v=" + encodeURIComponent(String(new Date().getTime()).slice(-6)); /* dodge stale cache a little */

  fetch(url)
    .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
    .then(applySections)
    .catch(function () {
      /* No file / bad file → the static HTML copy stands. Nothing to do. */
    });
})();