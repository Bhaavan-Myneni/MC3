import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the MC3 Summit 2025 static site.
 *
 * The site has no build step, so tests run against a plain
 * `python3 -m http.server` instance that Playwright starts and tears
 * down automatically (see `webServer` below).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],

  // Default tolerance for tests/visual.spec.ts's toHaveScreenshot() calls —
  // a small pixel budget absorbs anti-aliasing noise between runs without
  // masking a real visual regression.
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },

  use: {
    baseURL: 'http://127.0.0.1:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Pin to the Chromium binary pre-installed in this environment
        // rather than the revision @playwright/test would otherwise try
        // to download. Safe to delete this line in an environment where
        // `npx playwright install` has been run normally.
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
          : undefined,
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],

  webServer: {
    command: 'python3 -m http.server 8000',
    url: 'http://127.0.0.1:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
