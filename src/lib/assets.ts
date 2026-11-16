import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Build-time check for files in /public.
 *
 * Used so the site never renders a broken <img> or <video>: if an asset
 * referenced in src/config/media.ts has not been uploaded yet, components
 * render a branded fallback instead. Runs during `astro dev` and
 * `astro build` (both execute from the project root).
 */
export const publicAssetExists = (src: string | undefined): src is string =>
  Boolean(src) && existsSync(join(process.cwd(), 'public', decodeURI(src as string)));

/** Return the first path that exists in /public, if any. */
export const firstExistingAsset = (candidates: readonly string[]): string | undefined =>
  candidates.find(publicAssetExists);
