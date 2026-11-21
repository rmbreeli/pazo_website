import { test, expect } from '@playwright/test';
import { gallery, hideMissingMedia } from '../../src/config/media';
import { existsSync } from 'node:fs';

const missing = gallery.filter((item) => !existsSync(`public${item.src}`));
const present = gallery.filter((item) => existsSync(`public${item.src}`));
const presentVideos = present.filter((item) => item.type === 'video');
const noVideosYet = 'No gallery videos uploaded yet';
const galleryTiles = 'ul[aria-label="Photo and video gallery"] > li';

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
  await expect(page.locator('[data-media-tile]')).toHaveCount(present.length);
  for (const item of missing) {
    await expect(page.locator(`[src="${item.src}"]`)).toHaveCount(0);
  }
});

test('hero shows its video with no image in front, or the poster only when there is no video', async ({ page }) => {
  const heroVideoExists = existsSync('public/videos/hero/hero-video.mp4') || existsSync('public/images/hero/hero-video.mp4');
  await expect(page.locator('[data-hero-video]')).toHaveCount(heroVideoExists ? 1 : 0);
  await expect(page.locator('#home img')).toHaveCount(heroVideoExists ? 0 : 1);
  await expect(page.locator(heroVideoExists ? '[data-hero-video]' : '#home img')).toBeVisible();
});

test('hero video starts looping straight away', async ({ page }) => {
  test.skip(!existsSync('public/videos/hero/hero-video.mp4'), 'No hero video uploaded');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  const video = page.locator('[data-hero-video]');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.loop && v.muted)).toBe(true);
  await expect(page.locator('#home button')).toHaveCount(0); // continuous loop: no pause control
});

test('hero frame and video suit the screen: phone cut on phones, main video everywhere else', async ({ page }, testInfo) => {
  test.skip(!existsSync('public/videos/hero/hero-video.mp4'), 'No hero video uploaded');
  const hasMobileCut = existsSync('public/videos/hero/hero-video-mobile.mp4');
  const onPhone = testInfo.project.name === 'mobile';

  // Phones: tall 4:5 frame for the portrait cut, otherwise 16:9 so most of the wide shot is visible.
  if (onPhone) {
    const box = (await page.locator('[data-hero-frame]').boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(hasMobileCut ? 4 / 5 : 16 / 9, 1);
  }

  const playing = () => page.locator('[data-hero-video]').evaluate((v: HTMLVideoElement) => new URL(v.currentSrc).pathname);
  await expect.poll(playing).toBe(onPhone && hasMobileCut ? '/videos/hero/hero-video-mobile.mp4' : '/videos/hero/hero-video.mp4');
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
  await expect(page.locator(galleryTiles)).toContainText(shown.map((item) => item.title));
});

test('gallery tiles are display-only: nothing to click or tab to', async ({ page }) => {
  await expect(page.locator(`${galleryTiles} :is(a, button, [tabindex])`)).toHaveCount(0);
});

test('gallery videos loop forever, muted, with no image in front, and pause off screen', async ({ page }) => {
  test.skip(presentVideos.length === 0, noVideosYet);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();

  const tile = page.locator('[data-gallery-preview]').first();
  const video = tile.locator('video');
  const isPlaying = () => video.evaluate((v: HTMLVideoElement) => !v.paused);

  await expect(tile.locator('img')).toHaveCount(0);
  await tile.scrollIntoViewIfNeeded();
  // Frames are actually advancing (not just play() requested before the file has loaded).
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0.1)).toBe(true);
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.loop)).toBe(true);

  // Jump to just before the end: it wraps around to the start and keeps playing.
  await video.evaluate((v: HTMLVideoElement) => (v.currentTime = v.duration - 0.3));
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime < 1)).toBe(true);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(isPlaying).toBe(false);
  await tile.scrollIntoViewIfNeeded();
  await expect.poll(isPlaying).toBe(true);
});

test('with reduced motion, gallery videos show their first frame but never play', async ({ page }) => {
  test.skip(presentVideos.length === 0, noVideosYet);
  const video = page.locator('[data-gallery-preview] video').first();

  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute('src', /#t=0\.001$/);
  // HAVE_CURRENT_DATA: a frame is decoded and painted instead of an empty tile.
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test('hero video autoplays from the HTML and preloads, with a blurred backdrop behind it', async ({ page }) => {
  test.skip(!existsSync('public/videos/hero/hero-video.mp4'), 'No hero video uploaded');
  const video = page.locator('[data-hero-video]');
  await expect(video).toHaveAttribute('autoplay', '');
  await expect(video).toHaveAttribute('preload', /auto|metadata/); // metadata once Reduce Motion is detected
  const backdrop = await page.locator('[data-hero-frame]').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(backdrop).toMatch(/^url\("?data:image\/jpeg;base64,/);
});

test('with reduced motion, the hero video rests on its first frame and stops pre-fetching', async ({ page }) => {
  test.skip(!existsSync('public/videos/hero/hero-video.mp4'), 'No hero video uploaded');
  const video = page.locator('[data-hero-video]');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(video).toHaveAttribute('preload', 'metadata');
});

test('gallery videos get a blurred backdrop behind them, and no image in front', async ({ page }) => {
  test.skip(presentVideos.length === 0, noVideosYet);
  const tiles = page.locator('[data-gallery-preview] [data-media-tile]');
  for (const tile of await tiles.all()) {
    const backdrop = await tile.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(backdrop).toMatch(/^url\("?data:image\/jpeg;base64,/);
    await expect(tile.locator('img')).toHaveCount(0);
  }
});

test('gallery videos start loading just before their tile is on screen, but only play once visible', async ({ page }) => {
  test.skip(presentVideos.length === 0, noVideosYet);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();

  const tile = page.locator('[data-gallery-preview]').first();
  const video = tile.locator('video');
  await expect(video).not.toHaveAttribute('src', /./); // far below the fold: untouched on load

  // Put the tile's top edge 150 px below the viewport: inside the look-ahead zone, still off screen.
  await tile.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight - 150));
  await expect(video).toHaveAttribute('src', /#t=0\.001$/);
  await expect(video).toHaveAttribute('preload', 'auto');
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);

  await tile.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
});

test('listen links open the real external sources in a new tab', async ({ page }) => {
  const links = page.locator('a[href*="soundcloud.com/dj-pazo/"], a[href*="youtube.com/watch"]');
  await expect(links).toHaveCount(3);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
});
