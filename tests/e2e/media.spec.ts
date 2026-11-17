import { test, expect } from '@playwright/test';
import { gallery, hideMissingMedia } from '../../src/config/media';
import { existsSync } from 'node:fs';

const missing = gallery.filter((item) => !existsSync(`public${item.src}`));
const present = gallery.filter((item) => existsSync(`public${item.src}`));
const presentVideos = present.filter((item) => item.type === 'video');
const noVideosYet = 'No gallery videos uploaded yet';

/** Resolves once the browser has rendered two frames, so IntersectionObserver callbacks have run. */
const afterNextFrames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
});

test('no broken images anywhere on the page', async ({ page }) => {
  // Force lazy images to load, then wait for each one to decode.
  // decode() resolves once the image is ready and rejects only if it is broken,
  // so this never races against slow downloads the way checking `complete` does.
  const broken = await page.locator('img').evaluateAll(async (imgs) => {
    const results = await Promise.all(
      (imgs as HTMLImageElement[]).map(async (img) => {
        img.loading = 'eager';
        try {
          await img.decode();
          return img.naturalWidth > 0 ? null : img.src;
        } catch {
          return img.src;
        }
      }),
    );
    return results.filter(Boolean);
  });
  expect(broken).toEqual([]);
});

test('every image has alt text', async ({ page }) => {
  const withoutAlt = await page.locator('img:not([alt])').count();
  expect(withoutAlt).toBe(0);
});

test('missing gallery files render branded placeholders, not broken media', async ({ page }) => {
  await expect(page.locator('[data-media-placeholder]')).toHaveCount(missing.length);
  await expect(page.locator('[data-lightbox-open]')).toHaveCount(present.length);
  for (const item of missing) {
    await expect(page.locator(`[src="${item.src}"]`)).toHaveCount(0);
  }
});

test('hero never renders a broken video player', async ({ page }) => {
  const heroVideoExists = existsSync('public/videos/hero/hero-video.mp4') || existsSync('public/images/hero/hero-video.mp4');
  await expect(page.locator('[data-hero-video]')).toHaveCount(heroVideoExists ? 1 : 0);
  await expect(page.locator('#home img')).toBeVisible(); // poster is always the base layer
});

test('gallery videos are not downloaded on page load', async ({ page }) => {
  const videoRequests: string[] = [];
  page.on('request', (request) => {
    if (/\/videos\/(?!hero)/.test(request.url())) videoRequests.push(request.url());
  });
  await page.reload();
  await page.waitForLoadState('networkidle');
  expect(videoRequests).toEqual([]);
});

test('gallery tiles appear in the order set in media.ts', async ({ page }) => {
  const shown = hideMissingMedia ? present : gallery;
  await expect(page.locator('ul[aria-label="Photo and video gallery"] > li')).toContainText(shown.map((item) => item.title));
});

test('gallery video previews autoplay muted in view, pause for the lightbox, and can be paused', async ({ page }) => {
  test.skip(presentVideos.length === 0, noVideosYet);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();

  const tile = page.locator('[data-gallery-preview]').first();
  const video = tile.locator('video');
  const toggle = tile.locator('[data-gallery-toggle]');
  const isPlaying = () => video.evaluate((v: HTMLVideoElement) => !v.paused);

  await tile.scrollIntoViewIfNeeded();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(await video.evaluate((v: HTMLVideoElement) => !v.paused && v.muted && v.loop)).toBe(true);

  await tile.locator('[data-lightbox-open]').click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect(await isPlaying()).toBe(false);
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(toggle).toHaveAccessibleName(/^Play .+ preview$/);
  expect(await isPlaying()).toBe(false);
});

test('with reduced motion, gallery previews stay paused and download nothing until played', async ({ page }) => {
  test.skip(presentVideos.length === 0, noVideosYet);
  const tile = page.locator('[data-gallery-preview]').first();
  const video = tile.locator('video');
  const toggle = tile.locator('[data-gallery-toggle]');

  await tile.scrollIntoViewIfNeeded();
  await page.evaluate(afterNextFrames);
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(video).not.toHaveAttribute('src');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
});

test('lightbox opens a photo, then closes with Escape and restores focus', async ({ page }) => {
  const trigger = page.locator('[data-lightbox-open]').first();
  await trigger.click();
  const dialog = page.locator('#lightbox');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-lightbox-stage] img')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(dialog.locator('[data-lightbox-stage] *')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('listen links open the real external sources in a new tab', async ({ page }) => {
  const links = page.locator('a[href*="soundcloud.com/dj-pazo/"], a[href*="youtube.com/watch"]');
  await expect(links).toHaveCount(3);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
});
