/* ==========================================================================
   Oh! Gift — MOTION
   --------------------------------------------------------------------------
   All animation behaviour. No libraries: IntersectionObserver, pointer events
   and requestAnimationFrame do everything here.

   Deliberate choices worth knowing:
   • Only transform/opacity are animated, and scroll/pointer work is batched
     into a single rAF so we never lay out mid-frame.
   • REDUCED is checked once. Every effect either skips or degrades to static.
   • Nothing here gates content. If this file fails to load, the site still
     works completely — the CSS preloader self-dismisses on its own timer.
   ========================================================================== */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINE    = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var IO      = "IntersectionObserver" in window;

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* one shared rAF loop for all scroll/pointer driven work */
  var frameJobs = [], queued = false;
  function onFrame(fn) { frameJobs.push(fn); }
  function requestFrame() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      for (var i = 0; i < frameJobs.length; i++) frameJobs[i]();
    });
  }

  /* --------------------------------------------- 1. scroll progress ------ */
  function scrollProgress() {
    var bar = $("#scroll-progress");
    if (!bar || REDUCED) return;
    onFrame(function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? clamp((window.pageYOffset || doc.scrollTop) / max, 0, 1) : 0;
      bar.style.transform = "scaleX(" + p + ")";
    });
  }

  /* ------------------------------------------------- 2. preloader -------- */
  function preloader() {
    var el = $("#preloader");
    if (!el) return;
    if (REDUCED) { el.remove(); return; }
    var kill = function () {
      if (!el.parentNode) return;
      el.classList.add("is-done");
      window.setTimeout(function () { el.remove(); }, 500);
    };
    // whichever comes first: page loaded, or a hard 1.9s ceiling
    if (document.readyState === "complete") window.setTimeout(kill, 450);
    else window.addEventListener("load", function () { window.setTimeout(kill, 250); });
    window.setTimeout(kill, 1900);
  }

  /* -------------------------------------------- 3. split headline -------- */
  /* Wraps each word in its own overflow-hidden span so it can rise into view.
     Walks child nodes, so inline markup like <span class="oh"> survives. */
  function splitWords(el, base) {
    if (!el || el.dataset.split) return;
    el.dataset.split = "1";
    var i = 0;
    function wrap(node) {
      var out = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { out.appendChild(document.createTextNode(tok)); return; }
        var outer = document.createElement("span");
        outer.className = "split-word";
        var inner = document.createElement("span");
        inner.textContent = tok;
        inner.style.setProperty("--i", i++);
        if (base) inner.style.setProperty("--base", base + "ms");
        outer.appendChild(inner);
        out.appendChild(outer);
      });
      return out;
    }
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      if (n.nodeType === 3) { el.replaceChild(wrap(n), n); return; }
      if (n.nodeType !== 1) return;
      // An inline element (like the gradient-filled <span class="oh">) is
      // animated WHOLE. Splitting its inner text would nest inline-blocks
      // inside it and break `background-clip: text`, making it invisible.
      var outer = document.createElement("span");
      outer.className = "split-word";
      var inner = document.createElement("span");
      inner.style.setProperty("--i", i++);
      if (base) inner.style.setProperty("--base", base + "ms");
      el.replaceChild(outer, n);
      inner.appendChild(n);
      outer.appendChild(inner);
    });
  }

  function heroHeadline() {
    var h1 = $("#hero-title");
    if (!h1 || REDUCED) return;
    splitWords(h1, 250);
    requestAnimationFrame(function () { document.body.classList.add("split-ready"); });
  }

  /* ----------------------------------------- 4. hero atmosphere ---------- */
  function heroFloaters() {
    var host = $(".hero__floaters");
    if (!host || REDUCED) return;
    // deterministic-ish scatter, kept clear of the copy column on desktop
    var specs = [
      { l: 62, t: 14, s: 90,  cls: "",      dx: 22,  dy: -30, dr: 14, dur: 19 },
      { l: 78, t: 46, s: 54,  cls: "box",   dx: -18, dy: 24,  dr: -12, dur: 23 },
      { l: 88, t: 20, s: 26,  cls: "spark", dx: 14,  dy: 20,  dr: 40, dur: 15 },
      { l: 55, t: 70, s: 34,  cls: "spark", dx: -12, dy: -22, dr: -30, dur: 21 },
      { l: 70, t: 82, s: 68,  cls: "",      dx: 18,  dy: -18, dr: 10, dur: 26 },
      { l: 92, t: 66, s: 42,  cls: "box",   dx: -14, dy: -16, dr: 16, dur: 17 }
    ];
    specs.forEach(function (s, n) {
      var i = document.createElement("i");
      i.className = s.cls;
      i.style.cssText =
        "left:" + s.l + "%;top:" + s.t + "%;width:" + s.s + "px;height:" + s.s + "px;" +
        "--dx:" + s.dx + "px;--dy:" + s.dy + "px;--dr:" + s.dr + "deg;" +
        "animation-duration:1.1s," + s.dur + "s;animation-delay:" + (400 + n * 120) + "ms,0s;";
      host.appendChild(i);
    });
  }

  function heroSpotlight() {
    var hero = $(".hero"), spot = $(".hero__spotlight");
    if (!hero || !spot || REDUCED || !FINE) return;
    hero.classList.add("has-spotlight");
    var mx = 50, my = 50, pending = false;
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width) * 100;
      my = ((e.clientY - r.top) / r.height) * 100;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        spot.style.setProperty("--mx", mx + "%");
        spot.style.setProperty("--my", my + "%");
      });
    });
    hero.addEventListener("pointerleave", function () { hero.classList.remove("has-spotlight"); });
    hero.addEventListener("pointerenter", function () { hero.classList.add("has-spotlight"); });
  }

  /* ------------------------------------------------- 5. parallax --------- */
  function parallax() {
    var items = $$("[data-parallax]");
    if (!items.length || REDUCED) return;
    // only animate what's on screen
    var visible = [];
    if (IO) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var i = visible.indexOf(en.target);
          if (en.isIntersecting && i === -1) visible.push(en.target);
          else if (!en.isIntersecting && i !== -1) visible.splice(i, 1);
        });
      }, { rootMargin: "120px 0px" });
      items.forEach(function (el) { io.observe(el); });
    } else visible = items;

    onFrame(function () {
      var vh = window.innerHeight;
      for (var i = 0; i < visible.length; i++) {
        var el = visible[i];
        var r = el.getBoundingClientRect();
        var speed = parseFloat(el.dataset.parallax) || 0.12;
        // -1 .. 1 across the viewport
        var t = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = "translate3d(0," + (t * speed * 100).toFixed(2) + "px,0)";
      }
    });
  }

  /* --------------------------------------------- 6. divider shimmer ------ */
  function dividers() {
    var els = $$(".divider");
    if (!els.length || !IO) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        obs.unobserve(en.target);
      });
    }, { threshold: .6 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* --------------------------------------------- 7. trust icon draw ------ */
  function iconDraw() {
    $$(".trust__item").forEach(function (item, n) {
      $$("path, circle", item).forEach(function (p) {
        try {
          var len = Math.ceil(p.getTotalLength());
          p.style.setProperty("--len", len);
        } catch (e) { /* getTotalLength unsupported — CSS falls back to 120 */ }
      });
      item.style.setProperty("--d", n);
    });
  }

  /* ------------------------------------------------ 8. card tilt --------- */
  function cardTilt() {
    if (REDUCED || !FINE) return;
    $$(".gift-card").forEach(function (card) {
      var media = $(".gift-card__media", card);
      var raf = false, rx = 0, ry = 0, gx = 50, gy = 50;

      card.addEventListener("pointerenter", function () { card.classList.add("is-tilting"); });
      card.addEventListener("pointerleave", function () {
        card.classList.remove("is-tilting");
        card.style.removeProperty("--rx");
        card.style.removeProperty("--ry");
      });
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        ry = (px - .5) * 9;      // degrees — kept small so text stays crisp
        rx = (.5 - py) * 7;
        gx = px * 100; gy = py * 100;
        if (raf) return;
        raf = true;
        requestAnimationFrame(function () {
          raf = false;
          card.style.setProperty("--rx", rx.toFixed(2) + "deg");
          card.style.setProperty("--ry", ry.toFixed(2) + "deg");
          if (media) {
            media.style.setProperty("--gx", gx.toFixed(1) + "%");
            media.style.setProperty("--gy", gy.toFixed(1) + "%");
          }
        });
      });
    });
  }

  /* ----------------------------------- 9. FLIP layout on filtering ------- */
  /* main.js fires these two events around the hidden-attribute change. */
  function filterFlip() {
    var grid = $("#gift-grid");
    if (!grid || REDUCED) return;
    var before = null;

    document.addEventListener("giftfilter:before", function () {
      before = new Map();
      $$(".gift-card", grid).forEach(function (c) {
        if (!c.hidden) before.set(c, c.getBoundingClientRect());
      });
    });

    document.addEventListener("giftfilter:after", function () {
      if (!before) return;
      var cards = $$(".gift-card", grid);
      cards.forEach(function (c) {
        if (c.hidden) return;
        var after = c.getBoundingClientRect();
        var prev = before.get(c);
        if (!prev) { c.classList.add("is-entering");
          c.addEventListener("animationend", function h() {
            c.classList.remove("is-entering"); c.removeEventListener("animationend", h); });
          return; }
        var dx = prev.left - after.left, dy = prev.top - after.top;
        if (!dx && !dy) return;
        c.style.setProperty("--fx", dx + "px");
        c.style.setProperty("--fy", dy + "px");
        c.classList.add("flip-start");
      });
      // force one reflow, then let them travel to their new homes
      void grid.offsetWidth;
      cards.forEach(function (c) {
        if (!c.classList.contains("flip-start")) return;
        c.classList.remove("flip-start");
        c.classList.add("flip-play");
        c.addEventListener("transitionend", function h() {
          c.classList.remove("flip-play");
          c.style.removeProperty("--fx"); c.style.removeProperty("--fy");
          c.removeEventListener("transitionend", h);
        });
      });
      before = null;
    });
  }

  /* ---------------------------------------- 10. buttons: ripple + magnet - */
  function buttonFx() {
    document.addEventListener("pointerdown", function (e) {
      var btn = e.target.closest && e.target.closest(".btn");
      if (!btn || REDUCED) return;
      var r = btn.getBoundingClientRect();
      var size = Math.max(r.width, r.height);
      var span = document.createElement("span");
      span.className = "ripple";
      span.style.cssText = "width:" + size + "px;height:" + size + "px;left:" +
        (e.clientX - r.left - size / 2) + "px;top:" + (e.clientY - r.top - size / 2) + "px;";
      btn.appendChild(span);
      span.addEventListener("animationend", function () { span.remove(); });
    });

    if (REDUCED || !FINE) return;
    $$(".btn--primary, .wa-float").forEach(function (btn) {
      btn.classList.add("is-magnetic");
      var raf = false, tx = 0, ty = 0;
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * .22;
        ty = (e.clientY - (r.top + r.height / 2)) * .3;
        btn.classList.add("is-pulling");
        if (raf) return;
        raf = true;
        requestAnimationFrame(function () {
          raf = false;
          btn.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px)";
        });
      });
      btn.addEventListener("pointerleave", function () {
        btn.classList.remove("is-pulling");
        btn.style.transform = "";
      });
    });
  }

  /* --------------------------------------------------- 11. count-up ------ */
  function countUp() {
    var els = $$("[data-count]");
    if (!els.length) return;

    var render = function (el, v) {
      var dp = parseInt(el.dataset.decimals || "0", 10);
      el.textContent = (el.dataset.prefix || "") +
        v.toLocaleString("en-MY", { minimumFractionDigits: dp, maximumFractionDigits: dp }) +
        (el.dataset.suffix || "");
    };

    if (REDUCED || !IO) {
      els.forEach(function (el) { render(el, parseFloat(el.dataset.count)); });
      return;
    }
    els.forEach(function (el) { render(el, 0); });

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseFloat(el.dataset.count), t0 = null;
        var dur = 1500;
        (function tick(ts) {
          if (t0 === null) t0 = ts;
          var p = clamp((ts - t0) / dur, 0, 1);
          var eased = 1 - Math.pow(1 - p, 3);        // easeOutCubic
          render(el, target * eased);
          if (p < 1) requestAnimationFrame(tick);
          else render(el, target);
        })(performance.now());
        obs.unobserve(el);
      });
    }, { threshold: .5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------- 12. form focus ----- */
  function formFocus() {
    $$(".field").forEach(function (field) {
      var input = $("input, select, textarea", field);
      if (!input) return;
      if (!$(".underline", field)) {
        var u = document.createElement("span");
        u.className = "underline";
        u.setAttribute("aria-hidden", "true");
        // sit it under the control, not the label
        input.parentNode.insertBefore(u, input.nextSibling);
        u.style.top = "";
      }
      input.addEventListener("focus", function () { field.classList.add("is-focused"); });
      input.addEventListener("blur",  function () { field.classList.remove("is-focused"); });
    });
  }

  /* ------------------------------------- 13. sticky how-it-works --------- */
  function howSteps() {
    var steps = $$(".how__steps .step");
    var rail  = $$(".how__rail li");
    if (!steps.length || !IO) return;

    var setActive = function (n) {
      steps.forEach(function (s, i) { s.classList.toggle("is-active", i === n); });
      rail.forEach(function (r, i) { r.classList.toggle("is-active", i === n); });
    };
    setActive(0);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        setActive(steps.indexOf(en.target));
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ------------------------------------------ 14. mobile menu stagger ---- */
  function menuStagger() {
    var panel = $("#mobile-nav");
    if (!panel) return;
    $$("li, .btn", panel).forEach(function (el, i) { el.style.setProperty("--i", i); });
  }

  /* ------------------------------------------------ 15. blur-up --------- */
  function blurUp() {
    $$("main img, .footer img").forEach(function (img) {
      if (img.closest(".header__logo") || img.src.indexOf("logo") !== -1) return;
      img.setAttribute("data-blurup", "");
      if (img.complete && img.naturalWidth) img.classList.add("is-loaded");
      else img.addEventListener("load", function () { img.classList.add("is-loaded"); });
      img.addEventListener("error", function () { img.classList.add("is-loaded"); });
    });
  }

  /* --------------------------------------- 16. celebration confetti ------ */
  /* ~90 particles on a throwaway canvas. Runs for well under a second and
     removes itself; nothing persists between bursts. */
  function confetti() {
    if (REDUCED) return;
    var colours = ["#D80000", "#8C1116", "#DBB789", "#C39C63", "#A81419", "#FDF9F5"];
    var c = document.createElement("canvas");
    c.setAttribute("aria-hidden", "true");
    c.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:350";
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
    document.body.appendChild(c);
    var ctx = c.getContext("2d"); ctx.scale(dpr, dpr);

    var parts = [], N = 90;
    for (var i = 0; i < N; i++) {
      var a = (Math.PI * 2 * i) / N + Math.random() * .3;
      var sp = 6 + Math.random() * 9;
      parts.push({
        x: innerWidth / 2, y: innerHeight * .58,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6,
        w: 5 + Math.random() * 6, h: 3 + Math.random() * 5,
        rot: Math.random() * 6.28, vr: (Math.random() - .5) * .3,
        col: colours[(Math.random() * colours.length) | 0], life: 0
      });
    }
    var MAX = 110;
    (function frame() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      var alive = 0;
      parts.forEach(function (p) {
        p.life++;
        if (p.life > MAX) return;
        alive++;
        p.vy += .32;               // gravity
        p.vx *= .992; p.vy *= .992;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - p.life / MAX);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.col;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) requestAnimationFrame(frame); else c.remove();
    })();
  }

  /* ------------------------------------------------------- boot ---------- */
  function init() {
    preloader();
    heroHeadline();
    heroFloaters();
    heroSpotlight();
    dividers();
    iconDraw();
    cardTilt();
    filterFlip();
    buttonFx();
    countUp();
    formFocus();
    howSteps();
    menuStagger();
    blurUp();
    scrollProgress();
    parallax();

    if (frameJobs.length) {
      window.addEventListener("scroll", requestFrame, { passive: true });
      window.addEventListener("resize", requestFrame, { passive: true });
      requestFrame();
    }
    document.addEventListener("ohgift:success", confetti);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
