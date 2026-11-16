# DJ PAZO: djpazo.com

Official single-page website for **DJ PAZO** (Pazo Entertainment LLC), a
professional DJ based in Northwest Arkansas.

Built with **Astro + TypeScript + Tailwind CSS**, with near-zero JavaScript, self-hosted
fonts (Space Grotesk + Manrope), and static output hosted on **Netlify**.

> Lighthouse (production build): Performance 98 mobile / 100 desktop,
> Accessibility 100, Best Practices 100, SEO 100. CLS 0.

---

## Quick start

Requires **Node 22.23+** (`nvm use` reads `.nvmrc`).

```bash
npm install          # install dependencies
npm run dev          # local dev server -> http://localhost:4321
npm run build        # type-check + production build into dist/
npm run preview      # serve the production build locally
npm run test:e2e     # Playwright end-to-end tests (run `npm run build` first)
```

---

## How the site is organized

```
src/
├── config/              <- EDIT CONTENT HERE (no component changes needed)
│   ├── business.ts      contact info, socials, location, services, genres, form key
│   ├── packages.ts      package names, prices, durations, inclusions, CTA text
│   ├── testimonials.ts  real client reviews (never invent these)
│   ├── media.ts         every photo & video path, captions, alt text, categories
│   └── content.ts       headlines and section copy (hero headline lives here)
├── components/          one file per section + small shared pieces
├── layouts/BaseLayout.astro   <head>: SEO meta, Open Graph, JSON-LD, fonts
├── lib/                 helpers (structured data, form logic, AI-file builders)
├── pages/
│   ├── index.astro      the single page: Hero, Sound, Reviews+Media, Packages, Contact
│   ├── llms.txt.ts      -> /llms.txt       (generated from config)
│   ├── llms-full.txt.ts -> /llms-full.txt  (generated from config)
│   ├── agents.md.ts     -> /agents.md      (generated from config)
│   ├── robots.txt.ts    -> /robots.txt
│   └── sitemap.xml.ts   -> /sitemap.xml
└── styles/global.css    design tokens (colors, fonts), buttons, form styles
public/
├── images/  (see public/images/README.md)
└── videos/  (see public/videos/README.md)
legacy/      previous site, for reference only (not deployed)
tests/e2e/   Playwright tests
```

**Why the AI/SEO files are generated:** change a price in `packages.ts` and
the pricing cards, the form dropdown, the JSON-LD, `/llms.txt`,
`/llms-full.txt` and `/agents.md` all update on the next build. They can
never contradict each other.

---

## Common edits

After any edit: commit and push. Netlify rebuilds automatically.

### Change a package price, description, or inclusions
Open **`src/config/packages.ts`** and edit the package:
```ts
price: { amount: 795 },                        // -> "$795"
price: { amount: 100, per: 'hour' },           // -> "$100 / hour"
additionalFee: { amount: 150, label: 'flat fee' },
duration: '4 hours of reception coverage',
inclusions: ['DJ and MC / announcement services', ...],
featured: true,                                // champagne-accented card
ctaLabel: 'Inquire About This Package',
```
> The Private Events inclusions are **initial suggestions**. Confirm them.
> Wedding inclusions come from the previously published package details.

### Update contact info or social links
**`src/config/business.ts`**: `contact.email`, `contact.phoneDisplay`,
`contact.phoneE164` (format `+1XXXXXXXXXX`), and `socials`. Footer, contact
section, mobile menu, structured data and AI files all update.

### Add a testimonial
**`src/config/testimonials.ts`**: copy an entry and paste the client's
**exact words**. Optional fields: `affiliation`, `context` (e.g. "Wedding"),
`source` (only if accurate, e.g. "Google"). `featured: true` = the large quote.
After 3 supporting reviews, extras go into an expandable "More reviews" list.

### Change the hero headline or any section copy
**`src/config/content.ts`**: `heroCopy.headline` is an array, one item per line:
```ts
headline: ['Music that', 'moves people.'],
```

### Add or replace photos and videos
See **[`public/images/README.md`](public/images/README.md)** and
**[`public/videos/README.md`](public/videos/README.md)**. Short version:

1. Replace: upload a file with the **same name** to the same folder.
2. Add: upload, then add an entry to `gallery` in `src/config/media.ts`.
3. Phone photos: `npm run media:optimize -- ~/Downloads/IMG_1234.JPG public/images/events/weddings/wedding-02.jpg`
   (fixes rotation, resizes, **strips GPS location**).

Missing files never show broken images. They render as branded panels
until uploaded.

**Hero video:** upload to `public/videos/hero/hero-video.mp4`
(or `public/images/hero/hero-video.mp4`). Poster: `public/images/hero/hero-poster.jpg`.

### Add a new event category
Add it to `mediaCategories` in `src/config/media.ts`, create a matching
folder under `public/images/events/`, and use the new key on gallery items.
To list a new *service* (event type), add it to `services` in `business.ts`.
It appears in The Pazo Sound, the form's event-type dropdown, and the AI files.

---

## Contact form

The inquiry form posts to **[Web3Forms](https://web3forms.com)**, the same
integration the previous site used, so submissions keep going to the
inbox that access key is registered to.

- **Access key:** Web3Forms keys are *public by design* (they can only send
  to the inbox they're registered with). The existing key is the default in
  `src/config/business.ts`. To use a different key, set the env var
  `PUBLIC_WEB3FORMS_ACCESS_KEY` in Netlify (*Site configuration > Environment
  variables*) or in a local `.env` (see `.env.example`). No secrets are stored in the repo.
- **Built in:** field validation with accessible error messages, honeypot spam
  protection (`botcheck`), double-submit protection, a 15 s timeout, and
  success **only** when Web3Forms responds `{ "success": true }`. On failure
  the visitor's input is kept and email/phone are offered instead.
- **Works without JavaScript:** the form falls back to a normal POST.
- **Package preselection:** package buttons preselect the dropdown. Shareable
  link: `https://www.djpazo.com/?package=signature-wedding#contact`.

**Before launch:** send one real test inquiry from the preview URL and
confirm it arrives. (Delivery could not be tested from the development
network. All success/failure paths are covered by mocked E2E tests.)
If the Web3Forms dashboard restricts allowed domains, add the Netlify preview domain.

---

## Previewing without touching the live site

The live site deploys from **`master`**. This redesign lives on
**`website-redesign`**, and nothing reaches production until it is merged.

**Option A: Netlify Deploy Preview (recommended)**
1. Push the branch: `git push origin website-redesign`
2. Open a Pull Request `website-redesign -> master` on GitHub, **but do not merge it**.
3. Netlify posts a Deploy Preview link on the PR
   (`https://deploy-preview-N--<site>.netlify.app`).

**Option B: Branch deploy**
Netlify > *Site configuration > Build & deploy > Branches and deploy contexts*
> add `website-redesign` under branch deploys. Each push deploys to
`https://website-redesign--<site>.netlify.app`.

`netlify.toml` contains the build settings (`npm run build`, publish `dist`,
Node 22), so no Netlify UI changes are needed. The old site had no build step.
Once merged, this file switches production to the Astro build automatically.

**Going live (only when approved):** merge the PR into `master`.

---

## Pre-launch checklist

- [ ] Confirm the **canonical domain**. The site uses `https://www.djpazo.com`
      (set in `astro.config.mjs` and `business.ts`). The previous AI files used
      `https://djpazo.com/`. Match whichever domain is *primary* in Netlify.
- [ ] Confirm the **Private Events inclusions** in `packages.ts`.
- [ ] Send a real test inquiry from the preview URL.
- [ ] Upload the hero video + remaining media (or set `hideMissingMedia = true`).
- [ ] After launch, submit `https://www.djpazo.com/sitemap.xml` in Google Search Console.

---

## Testing

```bash
npm run build && npm run test:e2e
```
Covers navigation and CTAs (desktop + mobile menu), form validation, success,
and four failure modes, double-submit protection, media fallbacks (no broken
images or video players), lazy-loaded gallery videos, SEO metadata and JSON-LD,
consistency of `/llms.txt`, `/llms-full.txt` and `/agents.md` with the package
config, and an axe-core WCAG 2.2 AA scan. Tests use the locally installed
Google Chrome (`PW_CHANNEL="" ` + `npx playwright install chromium` to use
Playwright's browser instead).

## Accessibility & performance notes

- WCAG 2.2 AA: semantic landmarks, skip link, visible focus, labelled form
  fields with live error messages, keyboard-operable menu (focus trapped with
  `inert`, Escape closes) and media viewer (native `<dialog>`).
- `prefers-reduced-motion`: no fade-ins, no smooth scroll, hero video doesn't autoplay.
- Hero video starts only after page load, pauses off-screen, respects Data Saver,
  and has a pause button. Gallery videos load only when played.
- The hero image is deliberately never animated (it's the LCP element).
