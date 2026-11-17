import { test, expect } from '@playwright/test';
import { packages, describePrice, formatDollars } from '../../src/config/packages';
import { testimonials } from '../../src/config/testimonials';

test.describe('metadata', () => {
  test.beforeEach(async ({ page }) => page.goto('/'));

  test('title, description, canonical, Open Graph', async ({ page }) => {
    await expect(page).toHaveTitle('DJ PAZO | Professional DJ in Northwest Arkansas');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Northwest Arkansas/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.djpazo.com/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://www.djpazo.com/images/og/og-image.jpg');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  });

  test('heading hierarchy: one h1, h2 per section', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1);
    for (const id of ['sound', 'reviews-media', 'packages', 'contact']) {
      await expect(page.locator(`#${id} h2`)).toHaveCount(1);
    }
  });

  test('JSON-LD is valid and contains only supported facts', async ({ page }) => {
    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(raw ?? '{}');
    const business = data['@graph'].find((node: { '@type': string[] }) => Array.isArray(node['@type']));
    expect(business.telephone).toBe('+14794266076');
    expect(business.email).toBe('pazobeatzz@gmail.com');
    expect(business.address.streetAddress).toBeUndefined();
    expect(business.aggregateRating).toBeUndefined();
    expect(business.openingHours).toBeUndefined();
    expect(business.hasOfferCatalog.itemListElement).toHaveLength(packages.length);
  });

  test('all real testimonials appear verbatim', async ({ page }) => {
    for (const t of testimonials) {
      await expect(page.getByText(t.quote, { exact: false }).first()).toBeAttached();
      await expect(page.getByText(t.name).first()).toBeAttached();
    }
  });

  test('prices on the page match the config', async ({ page }) => {
    for (const pkg of packages) {
      // Same formatter as the page, so $1,495 is expected with its thousands separator.
      await expect(page.locator(`#packages`)).toContainText(formatDollars(pkg.price.amount));
    }
    await expect(page.locator('#packages')).toContainText('$150');
    await expect(page.locator('#packages')).toContainText('flat fee');
  });
});

test.describe('crawler & AI files', () => {
  test('robots.txt allows crawling and points to the sitemap', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toMatch(/User-agent: \*\nAllow: \//);
    expect(body).not.toMatch(/Disallow: \/\s*$/m);
    expect(body).toContain('Sitemap: https://www.djpazo.com/sitemap.xml');
  });

  test('sitemap.xml lists the canonical URL', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text();
    expect(body).toContain('<loc>https://www.djpazo.com/</loc>');
  });

  for (const path of ['/llms.txt', '/llms-full.txt', '/agents.md']) {
    test(`${path} is consistent with the published packages`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.ok()).toBe(true);
      const body = await response.text();
      for (const pkg of packages) {
        expect(body).toContain(pkg.name);
        expect(body).toContain(describePrice(pkg));
      }
      expect(body).toContain('pazobeatzz@gmail.com');
      expect(body).toContain('Pazo Entertainment LLC');
    });
  }

  test('llms-full.txt lists every inclusion and testimonial', async ({ request }) => {
    const body = await (await request.get('/llms-full.txt')).text();
    for (const pkg of packages) for (const item of pkg.inclusions) expect(body).toContain(item);
    for (const t of testimonials) expect(body).toContain(t.quote);
  });
});
