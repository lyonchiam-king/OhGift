# Oh! Gift — website

Premium corporate & personal gifting site for **Oh! Gift**, Penang, Malaysia.
A catalogue-and-enquiry site: every path ends in **WhatsApp**, a **quote request**,
or a **catalogue download**. There is no cart, no checkout and no payment gateway.

Built as plain HTML, CSS and JavaScript — no build step, no framework, no
dependencies. Open the folder, edit a file, refresh the browser.

---

## Preview it locally

Any static server works. From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

> Opening `index.html` directly with `file://` mostly works, but the catalogue
> download and form posting behave better over `http://`. Use the command above.

---

## ✅ Fill-in checklist

Everything below lives in **`js/site.config.js`** unless stated otherwise.
Open that file and search for `TODO` — there are 19 of them.

| # | What | Where | Notes |
|---|------|-------|-------|
| 1 | **WhatsApp number** | `WHATSAPP` | Digits only, no `+`, no spaces. Malaysia: country code `60` and **drop the leading 0** — local `012-345 6789` becomes `60123456789`. |
| 2 | **Business email** | `EMAIL` | Used in the footer, contact card, and as the form fallback. |
| 3 | **Phone** | `PHONE_DISPLAY`, `PHONE_TEL` | Display version is what people read; `PHONE_TEL` is what the link dials. |
| 4 | **Quote form endpoint** | `QUOTE_FORM_ENDPOINT` | See [Wiring up the forms](#wiring-up-the-forms). |
| 5 | **Catalogue form endpoint** | `LEAD_FORM_ENDPOINT` | Same — this one is your lead-gen list. |
| 6 | **Rose-gold hex** | `css/styles.css` → `--rose` | See [Changing the rose gold](#changing-the-rose-gold) — there's a contrast rule to respect. |
| 7 | **Logo files** | `assets/logo.svg`, `assets/logo-light.svg` | See [Swapping the logo](#swapping-the-logo). |
| 8 | **Product photos** | `assets/gifts/*.jpg`, `assets/hero.jpg` etc. | See [Swapping photos](#swapping-photos). |
| 9 | **Gift names, descriptions, RM prices** | `index.html` → the `<article class="gift-card">` blocks | See [Editing the catalogue](#editing-the-catalogue). |
| 10 | **Catalogue PDF** | `assets/catalogue.pdf` | Just overwrite the file, keeping the name. |
| 11 | **Tagline** | `TAGLINE` | Currently a placeholder: *"Gifts worth an Oh!"* |
| 12 | **SSM registration number** | `SSM` | Shows in the footer. |
| 13 | **Address & postcode** | `ADDRESS_*` | Feeds the footer, contact card and the SEO schema. |
| 14 | **Social links** | `SOCIAL` | Set a value to `""` to hide that icon entirely. |
| 15 | **MOQ & lead time** | `MOQ`, `LEAD_TIME` | `MOQ` appears in three places at once. |
| 16 | **Live domain** | `SITE_URL` **and** the `<head>` of `index.html` | The `og:` / `canonical` tags are hard-coded — search `ohgift.com.my`. |
| 17 | **About-section facts** | `index.html` → `#about` | Founding year, order count, founding story. Marked `TODO`. |

There are a few more content `TODO`s inside `index.html` (pricing disclaimer,
volume tiers, About copy). Search the file for `TODO` to find them.

---

## Swapping the logo

Replace **`assets/logo.svg`** (header, dark text) and **`assets/logo-light.svg`**
(footer, light text on charcoal). SVG is preferred — it stays sharp at any size.

Using a PNG or JPG instead? Keep the same base name and update the two `<img>`
tags in `index.html`:

```html
<img src="assets/logo.svg"       alt="Oh! Gift" width="260" height="72">   <!-- header -->
<img src="assets/logo-light.svg" alt="Oh! Gift" width="260" height="72">   <!-- footer -->
```

Set `width`/`height` to your file's real pixel dimensions — that stops the page
from jumping while images load. Display height is controlled by CSS
(`.header__logo img` and `.footer__brand img`), so a large file is fine.

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
| `placeholder-hamper.jpg` | 800×1000 | 4:5 | Spare — use for any gift you have no photo for yet |

**Before you upload:** resize to roughly the dimensions above and save as JPEG
at ~80% quality. A 4 MB camera file will make the site feel slow on mobile data,
which is where most of your buyers are. Aim for under 200 KB per photo.

If you change a filename or its proportions, update the matching `<img>` tag's
`src`, `width` and `height` in `index.html`.

---

## Editing the catalogue

Each gift is one `<article>` block inside `<div class="gift-grid">` in
`index.html`. To add a gift, copy an existing block and change these:

```html
<article class="gift-card reveal"
         data-cat="cny"                          <!-- which filter chips show it -->
         data-gift="CNY Prosperity Hamper"       <!-- name sent to WhatsApp + form -->
         data-price="RM 188">                    <!-- price sent to WhatsApp + form -->
```

- **`data-cat`** must match a chip's `data-filter`: `cny`, `raya`, `deepavali`,
  `christmas`, `vip`. Space-separate for more than one, e.g. `data-cat="vip cny"`.
- **`data-gift`** and **`data-price`** are what get pre-filled into the WhatsApp
  message and the quote form when someone taps a card's buttons. Keep them in
  sync with the visible text.

Then update the visible `<h3>`, the description, the `<strong>RM 188</strong>`
price and the `<img>` `src`/`alt`.

**Adding a new occasion?** Add a chip to the `.filters` block and give it a
matching `data-filter` value:

```html
<button class="filter" type="button" data-filter="mooncake" aria-pressed="false">Mid-Autumn</button>
```

---

## Wiring up the forms

Both forms POST to whatever URL you put in `js/site.config.js`. Two easy options:

**Formspree** (works on any host) — sign up at [formspree.io](https://formspree.io),
create two forms, and paste the endpoints in:

```js
QUOTE_FORM_ENDPOINT: "https://formspree.io/f/abcdwxyz",
LEAD_FORM_ENDPOINT:  "https://formspree.io/f/efghijkl",
```

**Netlify Forms** (only if you host on Netlify) — leave both endpoints as `""`
and add `data-netlify="true"` to the two `<form>` tags in `index.html`.

### While the endpoints are still empty

Nothing breaks. Both forms fall back to opening the visitor's email app with all
the answers pre-filled, addressed to your `EMAIL`. That's a safety net for
testing, not a real solution — a good share of visitors have no email client
configured, so **set a real endpoint before you launch.**

### The catalogue download

The download is deliberately gated: the PDF only starts after the lead form
submits successfully. The lead reaches you through the form endpoint. If you'd
rather push leads into a CRM or Google Sheet as well, there's a marked spot in
`js/main.js` (search `onSuccess`).

Both forms include a hidden honeypot field (`_gotcha`) that silently absorbs
most bot spam.

---

## Changing the rose gold

The palette lives at the top of `css/styles.css`:

```css
--rose:      #B76E79;   /* brand accent — gradients, borders, large display text */
--rose-deep: #8E4A56;   /* buttons, links, small text */
```

`--rose` is used **decoratively only**. `--rose-deep` is used everywhere text
has to be readable, because rose gold at full brightness sits around 3.6:1
against the cream background — under the 4.5:1 that body text needs.

**So if you change `--rose` to your exact brand hex, keep `--rose-deep` dark
enough to stay above 4.5:1 on cream.** Paste both into
[webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/)
against `#FDF9F5` to check. Same applies to `--rose-mid` (used in button
gradients against white text).

The WhatsApp green is also darkened from the usual `#1FA855` to `#157F45` for
the same reason — white text on the brighter green only reaches 3.09:1.

---

## Deploying

It's a static site, so anything works. No build command, no output directory.

- **Netlify / Cloudflare Pages / Vercel** — connect the repo, leave the build
  command empty, publish directory `/`.
- **GitHub Pages** — repo Settings → Pages → deploy from `main`, folder `/root`.
- **Any web host** — upload the whole folder by FTP.

**After you have a domain**, update `SITE_URL` in `js/site.config.js` *and* the
four hard-coded `ohgift.com.my` URLs in the `<head>` of `index.html`
(`canonical`, `og:url`, `og:image`, `twitter:image`). Open Graph needs absolute
URLs, which is why those can't come from the config.

---

## File structure

```
index.html              Every section, in order. All copy lives here.
css/styles.css          One stylesheet, numbered sections, tokens at the top.
js/site.config.js       ← your details. The only file you must edit.
js/main.js              Behaviour: nav, filters, forms, reveals, SEO schema.
assets/
  logo.svg              Header logo (dark text)
  logo-light.svg        Footer logo (light text)
  favicon.svg           Browser tab icon
  hero.jpg              Hero background
  corporate.jpg  personal.jpg  about.jpg
  og-image.jpg          Social share card
  placeholder-hamper.jpg
  catalogue.pdf         ← replace with your real catalogue
  gifts/                8 product photos
```

---

## What's already handled

- **Responsive**, mobile-first — verified with no horizontal overflow at 390px.
- **Accessible** — semantic landmarks, one `h1`, no heading skips, alt text on
  every image, every input labelled, visible focus rings, `prefers-reduced-motion`
  respected, and every tap target meets the WCAG 2.2 minimum. Colour contrast
  passes AA throughout.
- **SEO** — title, meta description, Open Graph and Twitter cards, canonical
  URL, and `LocalBusiness`/`Organization` JSON-LD schema with the Penang address.
  The schema is generated from `site.config.js`, so it can't drift out of sync.
- **Fast** — no frameworks or libraries, one stylesheet, one script, all images
  lazy-loaded below the fold with width/height set to prevent layout shift.
- **Conversion mechanics** — floating WhatsApp button, WhatsApp in the header,
  per-gift WhatsApp with the item pre-filled, "Add to quote" that pre-fills and
  scrolls to the form, and the gated catalogue download. All three routes are
  reachable within one scroll from anywhere on the page.

## Known placeholders

The site is complete and working, but it ships with **sample content**: eight
invented gifts with indicative RM prices, invented volume tiers, invented About
statistics, and generated placeholder images. Replace all of it with your real
catalogue before launch — see the checklist at the top.
