# Legacy site (reference only)

This folder contains the previous djpazo.com implementation, kept for
reference during the redesign. **Nothing in this folder is deployed.**

| File | What happened to it |
| --- | --- |
| `index.html` | Replaced by the Astro site in `src/`. Testimonials, contact form (Web3Forms), social links, and music links were migrated. |
| `images/dj_picture_*.jpg` | Optimized (rotation fixed, GPS/EXIF stripped, resized) into `public/images/...`. See `src/config/media.ts`. |
| `images/edm_house_full_setlist_image.png`, `moonlight_pazo.png` | Optimized into `public/images/production/`. |
| `images/*-white-logo.png`, `soundcloud-white-icon.png` | Replaced by inline SVG icons. |
| `images/Pazo_Circle_Logo.jpg` | Replaced by `public/favicon.svg` + `public/apple-touch-icon.png`. |
| `llms.txt`, `llms-full.txt`, `agents.md`, `robots.txt` | Content preserved and now **generated** from `src/config/*` by `src/pages/*.ts`, so they always match the site. |

Once the redesign is live and you're happy with it, this folder can be
deleted. Git history keeps everything.
