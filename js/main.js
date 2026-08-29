/* ==========================================================================
   Oh! Gift — site behaviour
   No dependencies. Everything configurable lives in js/site.config.js.
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- utils */

  function waLink(message) {
    var num = String(CFG.WHATSAPP || "").replace(/[^0-9]/g, "");
    var text = encodeURIComponent(message || CFG.WHATSAPP_DEFAULT_MSG || "Hello!");
    return "https://wa.me/" + num + "?text=" + text;
  }

  function setText(sel, value) {
    if (value == null || value === "") return;
    $$(sel).forEach(function (el) { el.textContent = value; });
  }

  /* --------------------------------------------- 1. apply site config ---- */

  function applyConfig() {
    // WhatsApp — every element marked [data-wa]
    $$("[data-wa]").forEach(function (el) {
      el.setAttribute("href", waLink(CFG.WHATSAPP_DEFAULT_MSG));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });

    // Email links
    $$("[data-email]").forEach(function (el) {
      if (!CFG.EMAIL) return;
      el.setAttribute("href", "mailto:" + CFG.EMAIL);
      if (el.tagName === "A" && !el.querySelector("svg")) el.textContent = CFG.EMAIL;
    });

    // Phone links
    $$("[data-phone]").forEach(function (el) {
      if (!CFG.PHONE_TEL) return;
      el.setAttribute("href", "tel:" + String(CFG.PHONE_TEL).replace(/\s/g, ""));
      el.textContent = CFG.PHONE_DISPLAY || CFG.PHONE_TEL;
    });

    // Plain text bindings
    setText("[data-tagline]",   CFG.TAGLINE);
    setText("[data-ssm]",       CFG.SSM);
    setText("[data-hours]",     CFG.HOURS);
    setText("[data-legalname]", CFG.LEGAL_NAME);
    setText("[data-leadtime]",  CFG.LEAD_TIME);
    if (CFG.MOQ) setText("[data-moq]", CFG.MOQ);

    var addr = [CFG.ADDRESS_STREET, CFG.ADDRESS_CITY, CFG.ADDRESS_STATE, "Malaysia"]
      .filter(Boolean).join(", ");
    setText("[data-address]", addr);

    setText("[data-year]", String(new Date().getFullYear()));

    buildSocials();
    injectSchema();
  }

  var SOCIAL_ICONS = {
    instagram: '<path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.07-1.1.05-1.7.24-2.1.4-.5.2-.9.44-1.3.83-.4.4-.63.8-.83 1.3-.16.4-.35 1-.4 2.1C2.6 9.9 2.6 10.3 2.6 12s0 2.1.07 3.3c.05 1.1.24 1.7.4 2.1.2.5.44.9.83 1.3.4.4.8.63 1.3.83.4.16 1 .35 2.1.4 1.2.07 1.6.07 4.7.07s3.5 0 4.7-.07c1.1-.05 1.7-.24 2.1-.4.5-.2.9-.44 1.3-.83.4-.4.63-.8.83-1.3.16-.4.35-1 .4-2.1.07-1.2.07-1.6.07-3.3s0-2.1-.07-3.3c-.05-1.1-.24-1.7-.4-2.1-.2-.5-.44-.9-.83-1.3-.4-.4-.8-.63-1.3-.83-.4-.16-1-.35-2.1-.4C15.5 4 15.1 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm6.2-8.3a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z"/>',
    facebook:  '<path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z"/>',
    tiktok:    '<path d="M16.6 5.8a4.8 4.8 0 0 1-1-2.8h-3v12.1a2.5 2.5 0 1 1-1.8-2.4v-3a5.5 5.5 0 1 0 4.8 5.4V9.6a7.8 7.8 0 0 0 4.4 1.4v-3a4.8 4.8 0 0 1-3.4-2.2Z"/>',
    linkedin:  '<path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 21h4V9H3v12ZM9.5 9v12h4v-6.3c0-1.7 1.1-2.3 2-2.3s1.9.7 1.9 2.3V21h4v-6.9c0-3.8-2.2-5.4-4.4-5.4-1.8 0-2.9.9-3.4 1.8V9h-4Z"/>'
  };
  var SOCIAL_LABELS = { instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", linkedin: "LinkedIn" };

  function buildSocials() {
    var host = $("[data-socials]");
    if (!host) return;
    var social = CFG.SOCIAL || {};
    var html = "";
    Object.keys(SOCIAL_ICONS).forEach(function (key) {
      var url = social[key];
      if (!url) return;                                  // empty string hides the icon
      html += '<a href="' + url + '" target="_blank" rel="noopener" aria-label="Oh! Gift on ' +
              SOCIAL_LABELS[key] + '"><svg viewBox="0 0 24 24" aria-hidden="true">' +
              SOCIAL_ICONS[key] + '</svg></a>';
    });
    host.innerHTML = html;
  }

  /* ------------------------------------------- 2. SEO structured data ---- */

  function injectSchema() {
    var site = (CFG.SITE_URL || "").replace(/\/+$/, "");
    var social = CFG.SOCIAL || {};
    var sameAs = Object.keys(social).map(function (k) { return social[k]; }).filter(Boolean);

    var data = {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "Organization"],
      "@id": site + "/#business",
      name: CFG.BUSINESS_NAME || "Oh! Gift",
      legalName: CFG.LEGAL_NAME,
      description: "Premium corporate and personal gifting in Malaysia. Curated festive hampers, " +
                   "client and VIP gifts, custom branding, bulk pricing, SST tax invoice and nationwide delivery.",
      url: site + "/",
      image: site + "/assets/og-image.jpg",
      logo: site + "/assets/logo.svg",
      priceRange: "RM100-RM600",  // TODO: adjust to your real range
      areaServed: { "@type": "Country", name: "Malaysia" },
      address: {
        "@type": "PostalAddress",
        streetAddress: CFG.ADDRESS_STREET,
        addressLocality: CFG.ADDRESS_CITY,
        addressRegion: CFG.ADDRESS_STATE,
        postalCode: CFG.ADDRESS_POSTCODE,
        addressCountry: CFG.ADDRESS_COUNTRY || "MY"
      },
      openingHours: "Mo-Fr 09:00-18:00"
    };
    if (CFG.EMAIL) data.email = CFG.EMAIL;
    if (CFG.PHONE_TEL) data.telephone = CFG.PHONE_TEL;
    if (sameAs.length) data.sameAs = sameAs;

    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* -------------------------------------------------- 3. sticky header --- */

  function initHeader() {
    var header = $("#header");
    var waFloat = $("#wa-float");
    if (!header) return;

    var onScroll = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      header.classList.toggle("is-stuck", y > 8);
      if (waFloat) waFloat.classList.toggle("is-visible", y > 420);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------- 4. mobile nav ---- */

  function initMobileNav() {
    var toggle = $(".nav-toggle");
    var panel  = $("#mobile-nav");
    if (!toggle || !panel) return;

    var close = function () {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      panel.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    };

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) { close(); return; }
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      panel.classList.add("is-open");
      document.body.classList.add("nav-open");
    });

    $$("a", panel).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 960) close(); });
  }

  /* --------------------------------------------------- 5. scroll spy ----- */

  function initScrollSpy() {
    var links = $$('.nav a[href^="#"]');
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    var sections = links.map(function (a) {
      var id = a.getAttribute("href").slice(1);
      var el = document.getElementById(id);
      if (el) map[id] = a;
      return el;
    }).filter(Boolean);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        var active = map[entry.target.id];
        if (active) active.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ------------------------------------------------ 6. scroll reveal ----- */

  function initReveal() {
    var items = $$(".reveal");
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------- 7. catalogue filters ----- */

  function initFilters() {
    var buttons = $$(".filter");
    var cards   = $$("#gift-grid .gift-card");
    var status  = $("#filter-status");
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var want = btn.dataset.filter;
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });

        // let motion.js measure positions before the layout changes (FLIP)
        document.dispatchEvent(new CustomEvent("giftfilter:before"));

        var shown = 0;
        cards.forEach(function (card) {
          var cats = (card.dataset.cat || "").split(/\s+/);
          var show = want === "all" || cats.indexOf(want) !== -1;
          card.hidden = !show;
          if (show) {
            // A card filtered into view must be visible at once — it must not
            // sit at opacity 0 waiting on the scroll-reveal observer.
            card.classList.add("is-in");
            shown++;
          }
        });

        document.dispatchEvent(new CustomEvent("giftfilter:after"));

        if (status) {
          status.textContent = shown + (shown === 1 ? " gift" : " gifts") +
                               " shown for " + btn.textContent.trim() + ".";
        }
      });
    });
  }

  /* ------------------------------- 8. gift card → quote form / WhatsApp -- */

  function initGiftActions() {
    // "Add to quote": prefill the quote form and scroll to it
    $$("[data-quote]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card  = btn.closest(".gift-card");
        if (!card) return;
        var name  = card.dataset.gift || "";
        var price = card.dataset.price || "";

        var msg = $("#q-message");
        if (msg) {
          var line = "I'd like a quote for: " + name + (price ? " (from " + price + ")" : "") + ".";
          msg.value = msg.value.indexOf(line) !== -1 ? msg.value
                    : (msg.value ? msg.value.replace(/\s*$/, "") + "\n" + line : line);
        }

        // best-effort category match from the card's first filter category
        var sel = $("#q-category");
        var CAT = { cny: "Chinese New Year", raya: "Hari Raya", deepavali: "Deepavali",
                    christmas: "Christmas", vip: "Client & VIP gifting" };
        var key = (card.dataset.cat || "").split(/\s+/)[0];
        if (sel && CAT[key] && !sel.value) {
          Array.prototype.forEach.call(sel.options, function (o) {
            if (o.text === CAT[key]) sel.value = o.value || o.text;
          });
        }

        var target = document.getElementById("contact");
        if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
        window.setTimeout(function () {
          var first = $("#q-name");
          if (first && !first.value) first.focus({ preventScroll: true });
        }, prefersReducedMotion ? 0 : 650);
      });
    });

    // Per-item WhatsApp with the gift name pre-filled
    $$("[data-wa-item]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card  = btn.closest(".gift-card");
        var name  = card ? card.dataset.gift : "";
        var price = card ? card.dataset.price : "";
        var msg = "Hi Oh! Gift, I'm interested in the " + name +
                  (price ? " (from " + price + ")" : "") +
                  ". Could you share more details and bulk pricing?";
        window.open(waLink(msg), "_blank", "noopener");
      });
    });
  }

  /* ----------------------------------------------------- 9. forms -------- */

  function showStatus(el, kind, message) {
    if (!el) return;
    el.className = "form-status is-visible is-" + kind;
    el.textContent = message;
  }

  function validate(form) {
    var firstBad = null;
    $$("input, select, textarea", form).forEach(function (f) {
      if (f.name === "_gotcha") return;
      if (!f.checkValidity() && !firstBad) firstBad = f;
    });
    if (firstBad) {
      firstBad.focus();
      firstBad.reportValidity && firstBad.reportValidity();
      return false;
    }
    return true;
  }

  function mailtoFallback(subject, data) {
    var body = Object.keys(data).map(function (k) {
      return k + ": " + data[k];
    }).join("\n");
    var to = CFG.EMAIL || "";
    return "mailto:" + to +
           "?subject=" + encodeURIComponent(subject) +
           "&body=" + encodeURIComponent(body);
  }

  function collect(form) {
    var data = {};
    new FormData(form).forEach(function (v, k) {
      if (k === "_gotcha") return;
      if (String(v).trim() !== "") data[k] = v;
    });
    return data;
  }

  function submitForm(opts) {
    var form   = $(opts.form);
    var status = $(opts.status);
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // honeypot — silently pretend success for bots
      var hp = form.querySelector('[name="_gotcha"]');
      if (hp && hp.value) { showStatus(status, "ok", opts.successMsg); return; }

      if (!validate(form)) return;

      var data     = collect(form);
      var endpoint = CFG[opts.endpointKey];
      var btn      = form.querySelector('button[type="submit"]');
      var label    = btn ? btn.textContent : "";

      // No endpoint configured yet → fall back to the visitor's email client
      // so nothing is lost while you're still setting the site up.
      if (!endpoint) {
        showStatus(status, "busy", "Opening your email app…");
        window.location.href = mailtoFallback(opts.subject, data);
        window.setTimeout(function () {
          showStatus(status, "ok", opts.successMsg);
          document.dispatchEvent(new CustomEvent("ohgift:success"));
          opts.onSuccess && opts.onSuccess(data);
          form.reset();
        }, 900);
        return;
      }

      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      showStatus(status, "busy", "Sending…");

      fetch(endpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          showStatus(status, "ok", opts.successMsg);
          document.dispatchEvent(new CustomEvent("ohgift:success"));
          opts.onSuccess && opts.onSuccess(data);
          form.reset();
        })
        .catch(function () {
          showStatus(status, "err",
            "Sorry — that didn't go through. Please WhatsApp us or email " +
            (CFG.EMAIL || "us") + " instead.");
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });
  }

  function triggerCatalogueDownload() {
    var href = CFG.CATALOGUE_PDF || "assets/catalogue.pdf";
    var a = document.createElement("a");
    a.href = href;
    a.download = "";                      // hint the browser to save, not navigate
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function initForms() {
    submitForm({
      form: "#quote-form",
      status: "#quote-status",
      endpointKey: "QUOTE_FORM_ENDPOINT",
      subject: "Quote request — Oh! Gift website",
      successMsg: "Thank you — your request is in. We'll reply within one working day."
    });

    submitForm({
      form: "#lead-form",
      status: "#lead-status",
      endpointKey: "LEAD_FORM_ENDPOINT",
      subject: "Catalogue download — Oh! Gift website",
      successMsg: "Thank you — your download is starting. Check your downloads folder.",
      // TODO: the lead is emailed via the form endpoint. If you'd rather store
      // leads in a CRM or sheet, POST `data` to that service here as well.
      onSuccess: function () { triggerCatalogueDownload(); }
    });
  }

  /* ------------------------------------------------------- 10. boot ------ */

  function init() {
    applyConfig();
    initHeader();
    initMobileNav();
    initScrollSpy();
    initReveal();
    initFilters();
    initGiftActions();
    initForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
