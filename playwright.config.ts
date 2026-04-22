import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * We want the test matrix to cover every engine the app is expected to run on
 * (Chromium, Firefox, WebKit), but we also need `npm run test:e2e` to succeed
 * out of the box in environments that only have Chromium installed (most CI
 * sandboxes, many dev containers).
 *
 * Strategy:
 *  - Always include Chromium desktop + Chromium-based mobile.
 *  - Include Firefox and WebKit (+ mobile Safari) only when their binaries
 *    are already present on disk, or when PLAYWRIGHT_ALL_BROWSERS=1.
 *  - On CI (PLAYWRIGHT_ALL_BROWSERS=1) we expect `npx playwright install` to
 *    have been run, so every browser is exercised.
 */

function hasBrowser(dirPrefix: string): boolean {
  const cacheDir =
    process.env.PLAYWRIGHT_BROWSERS_PATH ||
    path.join(process.env.HOME ?? '', '.cache', 'ms-playwright');
  try {
    return fs
      .readdirSync(cacheDir)
      .some((entry) => entry.startsWith(dirPrefix));
  } catch {
    return false;
  }
}

const allBrowsers = process.env.PLAYWRIGHT_ALL_BROWSERS === '1';
const hasWebkit = allBrowsers || hasBrowser('webkit');
const hasFirefox = allBrowsers || hasBrowser('firefox');

const projects = [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
];

if (hasFirefox) {
  projects.push({ name: 'firefox', use: { ...devices['Desktop Firefox'] } });
}

if (hasWebkit) {
  projects.push(
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 14'] } },
  );
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects,
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
