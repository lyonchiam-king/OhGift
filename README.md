# Oh! Gift — website

Premium corporate & personal gifting site for **Oh! Gift**, Penang, Malaysia.
A catalogue-and-enquiry site: every path ends in **WhatsApp**, a **quote request**,
or a **catalogue download**. There is no cart, no checkout and no payment gateway.

Plain HTML, CSS and JavaScript. **No build step and no third-party libraries** —
open the folder, edit a file, refresh the browser.

---

## Preview it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

> Opening `index.html` over `file://` mostly works, but the catalogue download
> and form posting behave properly over `http://`. Use the command above.

---

## ✅ Fill-in checklist

Everything below lives in **`js/site.config.js`** unless stated otherwise.
Open it and search for `TODO` — there are 18.

| # | What | Where | Notes |
|---|------|-------|-------|
| 1 | **WhatsApp number** | `WHATSAPP` | Digits only, no `+`, no spaces. Malaysia: country code `60` and **drop the leading 0** — local `012-345 6789` becomes `60123456789`. |
| 2 | **Business email** | `EMAIL` | Footer, contact card, and the form fallback. |
| 3 | **Phone** | `PHONE_DISPLAY`, `PHONE_TEL` | Display version is what people read; `PHONE_TEL` is what the link dials. |
| 4 | **Quote form endpoint** | `QUOTE_FORM_ENDPOINT` | See [Wiring up the forms](#wiring-up-the-forms). |
| 5 | **Catalogue form endpoint** | `LEAD_FORM_ENDPOINT` | Your lead-gen list. |
| 6 | **Real logo files** | `assets/logo*.svg` | **The current ones are my reconstruction, not your artwork** — see [The logo](#the-logo). |
| 7 | **Product photos** | `assets/gifts/*.jpg` etc. | See [Swapping photos](#swapping-photos). |
| 8 | **Gift names, copy, RM prices** | `index.html` → `<article class="gift-card">` blocks | See [Editing the catalogue](#editing-the-catalogue). |
| 9 | **Catalogue PDF** | `assets/catalogue.pdf` | Overwrite the file, keep the name. |
| 10 | **SSM registration number** | `SSM` | Shows in the footer. |
| 11 | **Address & postcode** | `ADDRESS_*` | Footer, contact card, and the SEO schema. |
| 12 | **Social links** | `SOCIAL` | Set a value to `""` to hide that icon. |
| 13 | **MOQ & lead time** | `MOQ`, `LEAD_TIME` | `MOQ` appears in three places at once. |
| 14 | **Live domain** | `SITE_URL` **and** the `<head>` of `index.html` | The `og:`/`canonical` tags are hard-coded — search `ohgift.com.my` (4 places). |
| 15 | **About-section facts** | `index.html` → `#about` | Founding story, and the three stat numbers. Marked `TODO`. |
| 16 | **Volume tiers** | `index.html` → `.tier-table` | The percentages are invented. |

Tagline is already set to **"Customised gifts, meaningful moments"**.

More content `TODO`s live in `index.html` — search the file for `TODO`.

---

## The logo

⚠️ **`assets/logo.svg`, `logo-light.svg` and `logo-full.svg` are a reconstruction
I drew by eye from the artwork you sent.** The ring, the bow, the box and the
heart are approximations — the curves will not match your real vector, and the
wordmark is live text in a fallback serif rather than your actual lettering.
**Replace all three with the original files before launch.**

There are three because one lockup can't do every job:

| File | Contains | Used for |
|------|----------|----------|
| `logo.svg` | mark + "OH! Gift" | Header (renders at 50px tall) |
| `logo-light.svg` | same, cream type | Footer, on the dark background |
| `logo-full.svg` | mark + wordmark + tagline | Not used on the page — for print, email signatures, socials |

The tagline is deliberately **not** in the header lockup: at 50px tall it would
be about 3px of illegible smudge. It appears as real text under the hero
headline instead, where it can actually be read.

Swapping in your own: keep the filenames, and update `width`/`height` on the two
`<img>` tags in `index.html` to your file's real dimensions (they're currently
`863`×`259`) so the page doesn't shift while loading. Display size is set in CSS.

The browser-tab icon is **`assets/favicon.svg`**.

---

## Swapping photos

Every image in `/assets` is a labelled placeholder at the **correct aspect
ratio**. Overwrite the file, keep the filename, and nothing else needs touching.

| File | Size | Ratio | Used for |
|------|------|-------|----------|
| `hero.jpg` | 1920×1080 | 16:9 | Hero background |
| `gifts/*.jpg` | 800×1000 | **4:5** | Product cards (8 of them) |
| `corporate.jpg` | 1200×900 | 4:3 | Corporate section |
| `personal.jpg` | 1200×900 | 4:3 | Personal gifting section |
| `about.jpg` | 1200×900 | 4:3 | About section |
| `og-image.jpg` | 1200×630 | 1.91:1 | Social share preview |
| `placeholder-hamper.jpg` | 800×1000 | 4:5 | Spare, for any gift with no photo yet |

**Before you upload:** resize to roughly those dimensions and save as JPEG at
~80% quality. A 4 MB camera file will make the site feel slow on mobile data,
which is where most of your buyers are. Aim for under 200 KB per photo.

Images fade up from a soft blur as they load. That works with whatever you drop
in — there is no baked-in thumbnail to go stale.

---

## Editing the catalogue

Each gift is one `<article>` inside `<div class="gift-grid">` in `index.html`.
Copy a block and change these three attributes:

```html
<article class="gift-card reveal"
         data-cat="cny"                          <!-- which filter chips show it -->
         data-gift="CNY Prosperity Hamper"       <!-- name sent to WhatsApp + form -->
         data-price="RM 188">                    <!-- price sent to WhatsApp + form -->
```

- **`data-cat`** must match a chip's `data-filter`: `cny`, `raya`, `deepavali`,
  `christmas`, `vip`. Space-separate for more than one: `data-cat="vip cny"`.
- **`data-gift`** / **`data-price`** are what get pre-filled into the WhatsApp
  message and the quote form. Keep them in sync with the visible text.

Then update the `<h3>`, the description, the `<strong>RM 188</strong>` price and
the `<img>` `src`/`alt`.

**New occasion?** Add a chip with a matching `data-filter`:

```html
<button class="filter" type="button" data-filter="mooncake" aria-pressed="false">Mid-Autumn</button>
```

---

## Wiring up the forms

Both forms POST to the URL you put in `js/site.config.js`.

**Formspree** (works on any host) — create two forms at
[formspree.io](https://formspree.io) and paste the endpoints in:

```js
QUOTE_FORM_ENDPOINT: "https://formspree.io/f/abcdwxyz",
LEAD_FORM_ENDPOINT:  "https://formspree.io/f/efghijkl",
```

**Netlify Forms** (Netlify hosting only) — leave both as `""` and add
`data-netlify="true"` to the two `<form>` tags in `index.html`.

### While the endpoints are empty

Nothing breaks: both forms fall back to opening the visitor's email app with the
answers pre-filled. That's a testing safety net, not a solution — plenty of
visitors have no email client configured. **Set a real endpoint before launch.**

### The catalogue download

Deliberately gated: the PDF only starts after the lead form submits
successfully, so you capture the lead. To also push leads into a CRM or Google
Sheet, there's a marked spot in `js/main.js` (search `onSuccess`).

Both forms carry a hidden honeypot field (`_gotcha`) that absorbs most bot spam.

---

## Colours

The palette lives at the top of `css/styles.css`:

```css
--brand:       #7A1C27;   /* deep burgundy — text, links, buttons  9.84:1 on cream */
--brand-mid:   #96222F;   /* button gradients, hover               8.18:1 vs white */
--brand-light: #B8636D;   /* DECORATIVE only — borders, gradients */
--brand-pale:  #D9A6AB;   /* DECORATIVE only */
--brand-red:   #E30613;   /* your logo red — accents only */
--kraft:       #DFC09A;   /* the tan from the logo's gift box */
--gold:        #C9A227;   /* metallic thread in the dividers */
```

The site runs on **deep burgundy** with your **bright logo red** kept as an
accent — that's the direction you picked, and it's why the buttons and body
links are wine rather than pillarbox red.

**If you change these:** `--brand` is used for every piece of readable text and
every button, so it must stay dark enough for **4.5:1 against the cream
background** (`#FDF9F5`) and against white. `--brand-light` and `--brand-pale`
are decorative and must never carry small text. Check any change at
[webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/).

The WhatsApp green is darkened from the usual `#1FA855` to `#157F45` for the
same reason — white text on the brighter green only reaches 3.09:1.

---

## Motion

Animation lives in two files you can tune or delete independently:

- **`css/motion.css`** — all the animation styling
- **`js/motion.js`** — all the animation behaviour

Delete both `<link>`/`<script>` tags from `index.html` and the site still works
completely; it just stops moving.

### What's implemented

**Hero** — drifting warm-bloom mesh, film grain, floating ribbon/sparkle shapes
on parallax, cursor-follow glow (desktop only), and a staggered word-by-word
headline reveal.
**Scroll** — reveal-on-enter everywhere, background imagery on parallax, a
burgundy-to-gold progress bar, metallic shimmer sweeping the dividers, and a
pinned "How it works" panel whose progress rail tracks the step you're reading.
**Cards** — pointer-tracked 3D tilt with a moving glare, image zoom and lift,
price/CTA slide, and FLIP-animated reflow when you change the filter.
**Numbers** — count-up on the About stats, sequential trust badges with the
icons drawing themselves in.
**Micro** — button ripple, gradient shift and press states, magnetic pull on the
primary CTAs, pulsing WhatsApp button with an easing tooltip, animated form
focus states, confetti burst on submit, staggered mobile menu.
**Loading** — logo preloader with a metallic sweep, and blur-up image loading.

### Three deliberate calls

1. **No GSAP, Lenis, VanillaTilt or canvas-confetti.** All of it is done with
   IntersectionObserver, pointer events and `requestAnimationFrame`. The whole
   site ships **13 KB of gzipped JavaScript**; those four libraries alone would
   be roughly 90 KB before a line of site code. Your brief said performance
   first and mid-range mobile — this was the way to honour that.

2. **No momentum-scroll hijacking (Lenis).** It's the one suggested effect I
   left out on purpose: replacing native scrolling reliably costs you smoothness
   on mid-range Android, and it interferes with assistive tech and
   find-in-page. Native smooth scrolling is on. **Say the word and I'll add
   Lenis** — it's about ten lines — but I wouldn't ship it to this audience.

3. **Labels sit above the fields, not floating inside them.** They animate on
   focus and the underline grows, but the label text stays permanently visible.
   Float-labels hide the question once someone starts typing, which is a poor
   trade on a long procurement form. Ask and I'll switch it.

### Tuning it

Speeds and easing are CSS custom properties at the top of `motion.css`. To calm
a single effect, edit its section; to calm everything, raise the durations.
Every effect is grouped under a numbered heading matching the file's contents
list.

### Reduced motion

Every effect has a static fallback, collected in one block at the bottom of
`motion.css`. With "reduce motion" enabled the site is fully legible and every
conversion path still works — verified, not assumed: the preloader is removed
instantly, all content renders at full opacity, stats show final values, and
filtering, add-to-quote and the gated download all still function.

---

## Deploying

Static site — no build command, no output directory.

- **Netlify / Cloudflare Pages / Vercel** — connect the repo, empty build
  command, publish directory `/`.
- **GitHub Pages** — Settings → Pages → deploy from `main`, folder `/root`.
- **Any host** — upload the folder by FTP.

**After you have a domain:** update `SITE_URL` in `js/site.config.js` *and* the
four hard-coded `ohgift.com.my` URLs in the `<head>` of `index.html`
(`canonical`, `og:url`, `og:image`, `twitter:image`). Open Graph needs absolute
URLs, which is why those can't come from the config.

---

## File structure

```
index.html              Every section, in order. All copy lives here.
css/
  styles.css            Design system + layout. Tokens at the top.
  motion.css            All animation styling. Safe to delete.
js/
  site.config.js        ← your details. The only file you must edit.
  main.js               Behaviour: nav, filters, forms, SEO schema.
  motion.js             All animation behaviour. Safe to delete.
assets/
  logo.svg              Header lockup        ← replace with your real artwork
  logo-light.svg        Footer lockup        ← replace
  logo-full.svg         Full lockup+tagline  ← replace
  favicon.svg           Browser tab icon
  hero.jpg  corporate.jpg  personal.jpg  about.jpg
  og-image.jpg          Social share card
  placeholder-hamper.jpg
  catalogue.pdf         ← replace with your real catalogue
  gifts/                8 product photos
```

---

## What's already handled

- **Responsive**, mobile-first — no horizontal overflow at 390px; pointer
  effects (tilt, cursor glow, magnetic buttons) switch off on touch.
- **Accessible** — semantic landmarks, one `h1`, no heading skips, alt text on
  every image, every input labelled, visible focus rings, every tap target at
  the WCAG 2.2 minimum, and colour contrast passing AA throughout.
- **SEO** — title, meta description, Open Graph and Twitter cards, canonical
  URL, and `LocalBusiness`/`Organization` JSON-LD with the Penang address,
  generated from `site.config.js` so it can't drift out of sync.
- **Fast** — zero libraries, 13 KB of gzipped JS, images lazy-loaded below the
  fold with width/height set to prevent layout shift, scroll and pointer work
  batched into a single animation frame.
- **Conversion** — floating WhatsApp button, WhatsApp in the header, per-gift
  WhatsApp with the item pre-filled, "Add to quote" that pre-fills and scrolls
  to the form, and the gated catalogue download. All three reachable within one
  scroll from anywhere.

## Known placeholders

The site is complete and working, but ships with **sample content**: a
reconstructed logo, eight invented gifts with indicative RM prices, invented
volume tiers, invented About statistics, and generated placeholder images.
Replace all of it before launch — see the checklist at the top.
