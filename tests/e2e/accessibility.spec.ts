import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('no WCAG 2.2 AA violations (axe)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(summary).toEqual([]);
});

test('no axe violations with the contact form in an error state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#contact');
  await page.locator('#inquiry-form [data-submit]').click();
  const results = await new AxeBuilder({ page }).include('#contact').analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

test('skip link moves focus to main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await skip.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('keyboard focus is always visible', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard test on desktop');
  await page.goto('/');
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const style = getComputedStyle(el);
      return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
    });
    expect(outline).toBe(true);
  }
});

test('reduced motion: content is visible immediately, hero video does not autoplay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hidden = await page
    .locator('[data-reveal]')
    .evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== '1').length);
  expect(hidden).toBe(0);
  const video = page.locator('[data-hero-video]');
  if (await video.count()) expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test('content is readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#sound h2')).toBeVisible();
  const opacity = await page.locator('#packages li').first().evaluate((el) => getComputedStyle(el).opacity);
  expect(opacity).toBe('1');
  await context.close();
});
