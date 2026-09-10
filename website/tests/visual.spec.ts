import { test, expect } from '@playwright/test';
import { routes } from './fixtures/pages';
import { HomePage } from './pages/HomePage';
import { SubPage } from './pages/SubPage';

/**
 * Visual regression coverage: a full-page screenshot of every page,
 * compared against a committed baseline via Playwright's built-in
 * `toHaveScreenshot()`.
 *
 * IMPORTANT — generating baselines: the first run against each browser
 * project creates `tests/visual.spec.ts-snapshots/*.png` if it doesn't
 * exist; every run after that is a real comparison. Screenshot baselines
 * are platform-sensitive (font rendering differs by OS), so generate them
 * on whatever machine will also *check* them — normally that means
 * running `npm run test:visual:update` once in CI (see
 * .github/workflows/playwright.yml) rather than on a local laptop, then
 * committing the resulting PNGs. Do not hand-generate baselines on a
 * machine that can't reach the Chart.js/Font Awesome CDNs the page
 * depends on — a baseline captured mid-failure (missing charts/icons)
 * will make every future *correct* render look like a diff.
 */
test.describe('Visual regression', () => {
  for (const route of routes) {
    test(`${route.name} page matches its visual baseline`, { tag: ['@visual'] }, async ({ page }) => {
      const po = route.path === HomePage.path ? new HomePage(page) : new SubPage(page, route);
      await po.goto();

      // Let any Chart.js entrance animation (default ~1s) finish so the
      // screenshot captures the settled chart, not an arbitrary frame of
      // it animating in.
      if (route.chartIds.length > 0) {
        await page.waitForFunction(() => (window as any).Chart !== undefined, null, { timeout: 10_000 }).catch(() => {});
        await page.waitForTimeout(1500);
      }

      await expect(page).toHaveScreenshot(`${route.name.toLowerCase().replace(/\s+/g, '-')}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});
