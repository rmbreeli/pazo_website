import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against the production build (`npm run build` first).
 * They always start their own preview server on a dedicated port, so a dev
 * server you happen to have running is never tested by mistake (dev mode
 * injects the Astro toolbar, which skews results).
 * Locally they use the installed Google Chrome; set PW_CHANNEL="" to use
 * Playwright's bundled Chromium instead (after `npx playwright install chromium`).
 */
const channel = process.env.PW_CHANNEL ?? 'chrome';
const port = 4399;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${port}`,
    ...(channel && { channel }),
  },
  webServer: {
    command: `npx astro preview --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, ...(channel && { channel }) } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, ...(channel && { channel }) } },
  ],
});
