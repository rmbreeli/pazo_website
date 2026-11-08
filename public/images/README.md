# Photo guide

All website photos live in this folder. Every path below is referenced in
**`src/config/media.ts`**, the single file that controls the gallery and hero.

> **The site works before any upload.** If a referenced file is missing, the
> website shows an elegant branded panel in its place, never a broken image.
> Upload the file to the exact path, commit and push (or rebuild), and it
> appears automatically.

## Where each photo goes

| What | Path | Status |
| --- | --- | --- |
| Hero poster (shown before/without the hero video) | `public/images/hero/hero-poster.jpg` | Real photo in place (outdoor set). Replace anytime. |
| Social share image (1200 x 630) | `public/images/og/og-image.jpg` | Cropped from the hero poster |
| Private event photos | `public/images/events/private-events/private-event-01.jpg` ... `-03.jpg` | Real photos in place |
| Bar & restaurant photos | `public/images/events/bars-restaurants/bars-restaurants-01.jpg` | Real photo in place |
| Holiday party photos | `public/images/events/holiday-parties/holiday-party-01.jpg` | Real photo in place |
| Wedding photo | `public/images/events/weddings/wedding-01.jpg` | **Awaiting upload** |
| Wedding film poster frame | `public/images/events/weddings/wedding-highlight-01.jpg` | **Awaiting upload** |
| Nightlife photo | `public/images/events/nightlife/nightlife-01.jpg` | **Awaiting upload** |
| Performance video poster frame | `public/images/events/nightlife/performance-01.jpg` | **Awaiting upload** |
| DJ setup / booth / lighting | `public/images/dj-setup/dj-setup-01.jpg` | **Awaiting upload** |
| Studio / production | `public/images/production/production-01.jpg` | **Awaiting upload** |
| Corporate events | `public/images/events/corporate/corporate-01.jpg` | Folder ready (add to media.ts to show) |
| Music thumbnails (Listen section) | `public/images/production/throwbacks-hip-hop.jpg`, `edm-house-set.jpg`, `moonlight.jpg` | Real images in place |

## Supported formats

- **Photos:** `.jpg` (preferred), `.png`, `.webp`
- Portrait and landscape both work. Choose the tile shape in `media.ts`
  (`layout: 'tall'` for portrait, `'wide'` or `'feature'` for landscape).
- Aim for **1600–2000 px** on the longest side and under ~400 KB.

### Optimize phone photos first (recommended)

Phone photos are huge and contain hidden location (GPS) data. Run:

```bash
# optimize one photo straight from your camera roll into the site
npm run media:optimize -- ~/Downloads/IMG_1234.JPG public/images/events/weddings/wedding-02.jpg

# or drop files into public/images, then optimize everything that needs it
npm run media:optimize
```

This fixes rotation, resizes to max 2000 px, compresses, and strips metadata.

## Replace an existing photo

Upload a new file with **the same name** to the same folder. Done.

## Add a new photo to the gallery

1. Put the file in the right folder, e.g. `public/images/events/weddings/wedding-02.jpg`.
2. Open `src/config/media.ts` and copy an existing entry inside `gallery`:

   ```ts
   {
     id: 'wedding-02',
     type: 'image',
     src: '/images/events/weddings/wedding-02.jpg',
     category: 'weddings',
     title: 'First dance',
     alt: 'Couple sharing their first dance while DJ PAZO plays in the background',
     layout: 'tall', // feature | wide | tall | standard
   },
   ```

3. Write `alt` text describing what is **actually** in the photo.
4. The position in the list = the position on the page.

## Add a new event category

Add a line to `mediaCategories` in `src/config/media.ts`, e.g.
`quinceaneras: { label: 'Quinceañeras' },`, create a matching folder
(`public/images/events/quinceaneras/`), and use `category: 'quinceaneras'`
on gallery items.

## Hiding placeholders

While media is still being collected, missing items show as branded panels.
To hide missing items instead, set `hideMissingMedia = true` in `media.ts`.

**Never use stock photos that could be mistaken for DJ PAZO events.**
