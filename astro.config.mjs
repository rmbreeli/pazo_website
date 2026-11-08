// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// The canonical site URL lives here (Astro needs it for absolute URLs)
// and is mirrored in src/config/business.ts -> `business.website`.
// If you change the primary domain in Netlify, change both.
export default defineConfig({
  site: 'https://www.djpazo.com',
  trailingSlash: 'ignore',
  build: {
    // Inline small stylesheets to avoid a render-blocking request.
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
