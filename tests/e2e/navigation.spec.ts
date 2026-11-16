import { test, expect } from '@playwright/test';

const sections = [
  { id: 'sound', label: 'The Sound' },
  { id: 'reviews-media', label: 'Reviews + Media' },
  { id: 'packages', label: 'Packages' },
  { id: 'contact', label: 'Contact' },
];

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); // instant scrolling for deterministic tests
  await page.goto('/');
});

test('page has exactly the five primary sections in order', async ({ page }) => {
  const ids = await page.locator('main > section').evaluateAll((els) => els.map((el) => el.id));
  expect(ids).toEqual(['home', 'sound', 'reviews-media', 'packages', 'contact']);
});

test.describe('desktop navigation', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  for (const { id, label } of sections) {
    test(`"${label}" scrolls to #${id}`, async ({ page }) => {
      await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: label, exact: true }).click();
      await expect(page.locator(`#${id}`)).toBeInViewport();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
    });
  }

  test('wordmark returns to the top', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.getByRole('link', { name: 'DJ PAZO, back to top' }).click();
    await expect(page.locator('#home h1')).toBeInViewport();
  });
});

test('hero CTAs lead to packages and contact', async ({ page }) => {
  await page.locator('#home').getByRole('link', { name: 'Explore Packages' }).click();
  await expect(page.locator('#packages')).toBeInViewport();

  await page.goto('/');
  await page.locator('#home').getByRole('link', { name: 'Book DJ PAZO' }).click();
  await expect(page.locator('#contact')).toBeInViewport();
});

test('package CTAs scroll to the form and preselect the package', async ({ page }) => {
  const cases = [
    ['Private Events', 'Private Events'],
    ['Essential Wedding Reception', 'Essential Wedding Reception'],
    ['Signature Wedding Reception', 'Signature Wedding Reception'],
  ];
  for (const [name, expected] of cases) {
    await page.getByRole('link', { name: `Inquire About This Package: ${name}` }).click();
    await expect(page.locator('#inquiry-form')).toBeInViewport();
    await expect(page.locator('#package')).toHaveValue(expected);
  }

  await page.getByRole('link', { name: 'Plan a custom event' }).click();
  await expect(page.locator('#package')).toHaveValue('Custom event / not sure yet');
});

test('?package= query preselects the package (shareable links)', async ({ page }) => {
  await page.goto('/?package=signature-wedding#contact');
  await expect(page.locator('#package')).toHaveValue('Signature Wedding Reception');
});

test.describe('mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only');

  test('opens, traps focus, closes with Escape', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Menu' });
    await toggle.click();
    await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-menu')).toBeVisible();
    expect(await page.locator('main').evaluate((el) => (el as HTMLElement).inert)).toBe(true);
    await expect(page.locator('#mobile-menu a').first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await expect(page.locator('#menu-toggle')).toBeFocused();
    expect(await page.locator('main').evaluate((el) => (el as HTMLElement).inert)).toBe(false);
  });

  for (const { id, label } of sections) {
    test(`menu link "${label}" navigates and closes the menu`, async ({ page }) => {
      await page.locator('#menu-toggle').click();
      await page.locator('#mobile-menu').getByRole('link', { name: label }).click();
      await expect(page.locator('#mobile-menu')).toBeHidden();
      await expect(page.locator(`#${id}`)).toBeInViewport();
    });
  }
});

test('no horizontal overflow', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
