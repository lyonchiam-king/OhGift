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

    var lastY = 0;
    var onScroll = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      header.classList.toggle("is-stuck", y > 8);
      // hide past the trust strip while scrolling down, reveal on any
      // upward move — never while the mobile menu is open
      if (!document.body.classList.contains("nav-open")) {
        if (y > 320 && y > lastY + 4) header.classList.add("is-hidden");
        else if (y <= 320 || y < lastY - 4) header.classList.remove("is-hidden");
      }
      lastY = y;
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

  var revealIO = null;

  function revealAll(items) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    items.forEach(function (el) { revealIO.observe(el); });
  }

  function initReveal() {
    revealAll($$(".reveal"));
  }

  /* ----------------------------------------- 6b. gift catalogue data ----- */
  /* The grid is rendered from assets/data/gifts.json — edit it at /admin/
     rather than touching this file. Rendering must complete before the
     filter buttons, quote/WhatsApp actions and motion effects bind, so
     those wait for the gifts:ready event below. */

  var escapeHTML = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  var WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2 22l5.36-1.4a9.8 9.8 0 0 0 4.68 1.19h.01c5.43 0 9.85-4.42 9.85-9.86A9.8 9.8 0 0 0 19 4.86 9.78 9.78 0 0 0 12.04 2Zm0 17.94h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.14 8.14 0 0 1-1.25-4.34c0-4.52 3.68-8.2 8.2-8.2a8.15 8.15 0 0 1 8.19 8.2c0 4.52-3.68 8.18-8.19 8.18Zm5.43-5.56c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.09 3.2 5.07 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>';

  function giftCardHTML(g, i) {
    var cats = (g.cats || []).join(" ");
    var delay = ["", " d1", " d2", " d3"][i % 4];
    var name = escapeHTML(g.name);
    var price = escapeHTML(String(g.price));
    return (
      '<article class="gift-card reveal' + delay + '" ' +
        'data-cat="' + escapeHTML(cats) + '" ' +
        'data-gift="' + name + '" ' +
        'data-price="RM ' + price + '">' +
        '<div class="gift-card__media">' +
          '<img src="' + escapeHTML(g.image) + '" alt="' + escapeHTML(g.alt || g.name) + '" ' +
            'width="800" height="1000" loading="lazy" decoding="async">' +
          '<span class="gift-card__tag">' + escapeHTML(g.tag || "") + '</span>' +
        '</div>' +
        '<div class="gift-card__body">' +
          '<h3>' + name + '</h3>' +
          '<p class="gift-card__desc">' + escapeHTML(g.desc || "") + '</p>' +
          '<p class="gift-card__price">From <strong>RM ' + price + '</strong></p>' +
          '<div class="gift-card__actions">' +
            '<button class="btn btn--ghost btn--sm" type="button" data-quote>Add to quote</button>' +
            '<button class="icon-btn" type="button" data-wa-item aria-label="Ask about ' + name + ' on WhatsApp">' +
              WA_SVG +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function initGifts() {
    var grid = $("#gift-grid");
    if (!grid) return;

    fetch("assets/data/gifts.json")
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); })
      .then(function (data) {
        var gifts = data.gifts || [];
        grid.insertAdjacentHTML("beforeend", gifts.map(giftCardHTML).join(""));
        // grid children carry .reveal — hook them into the same observer,
        // then let filters, quote/WhatsApp buttons and motion.js bind
        grid.querySelectorAll(".gift-card").forEach(function (card) { revealAll([card]); });
        initFilters();
        initGiftActions();

        document.documentElement.setAttribute("data-gifts", "ready");
        document.dispatchEvent(new CustomEvent("gifts:ready"));
      })
      .catch(function (err) {
        console.error("Could not load the gift catalogue", err);
        grid.insertAdjacentHTML("beforeend",
          '<p style="max-width:60ch;margin:0 auto">The catalogue could not be loaded. ' +
          'Please WhatsApp us and we will send it over.</p>');
      });
  }

  /* -------------------------------------------- 7. catalogue filters ----- */

  function initFilters() {
    var buttons = $$(".filter");
    var cards   = $$("#gift-grid .gift-card");
    var status  = $("#filter-status");
    if (!buttons.length || !cards.length) return;

    // Remember each card's own tag so filtering can swap it for the active
    // occasion and restore it when "All gifts" is selected again.
    var originalTags = {};
    cards.forEach(function (card) {
      var tag = card.querySelector(".gift-card__tag");
      if (tag) originalTags[card.dataset.gift] = tag.textContent;
    });

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var want = btn.dataset.filter;
        var label = btn.textContent.trim();
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
            // The tag follows the occasion you're browsing, not the card's
            // default — a CNY gift under the CNY filter reads "Chinese New Year".
            var tag = card.querySelector(".gift-card__tag");
            if (tag) tag.textContent = want === "all" ? originalTags[card.dataset.gift] : label;
          }
        });

        document.dispatchEvent(new CustomEvent("giftfilter:after"));

        if (status) {
          status.textContent = shown + (shown === 1 ? " gift" : " gifts") +
                               " shown for " + label + ".";
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
    initGifts();
    initForms();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
