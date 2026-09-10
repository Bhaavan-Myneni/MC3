import { test, expect } from '@playwright/test';
import { routes } from './fixtures/pages';
import { HomePage } from './pages/HomePage';
import { SubPage } from './pages/SubPage';

/**
 * Regression test for a real bug found in this repo: main.js's
 * `initializeHomepageData()` used to run unconditionally on every page and
 * called `populateStatistics()`, which writes hardcoded homepage numbers
 * into `#total-population`, `#poverty-rate`, `#graduation-rate`, and
 * `#unemployment-rate`. Several subpages happen to reuse those same ids for
 * their own, page-specific stat tiles (e.g. demographics.html's own
 * `#total-population`), so the homepage script was silently clobbering
 * each subpage's real numbers with the homepage's numbers on every load.
 *
 * This locks in that each subpage keeps its own local value, and that only
 * the homepage renders the homepage-only nav boxes (the other bug fixed
 * alongside this one).
 */
const subpageRoutes = routes.filter((r) => r.path !== HomePage.path);

test.describe('Subpages keep their own local hero-stat values', () => {
  test('demographics.html #total-population is not overwritten by the homepage figure', { tag: ['@regression'] }, async ({
    page,
  }) => {
    const route = routes.find((r) => r.name === 'Demographics')!;
    const sub = new SubPage(page, route);
    await sub.goto();
    await expect(sub.heroStat('total-population')).toHaveText('142,850');
  });

  test('education.html #graduation-rate is not overwritten by the homepage figure', { tag: ['@regression'] }, async ({
    page,
  }) => {
    const route = routes.find((r) => r.name === 'Education')!;
    const sub = new SubPage(page, route);
    await sub.goto();
    await expect(sub.heroStat('graduation-rate')).toHaveText('92.5%');
  });

  test(
    'economy.html #unemployment-rate and #poverty-rate are not overwritten by the homepage figures',
    { tag: ['@regression'] },
    async ({ page }) => {
      const route = routes.find((r) => r.name === 'Economy')!;
      const sub = new SubPage(page, route);
      await sub.goto();
      await expect(sub.heroStat('unemployment-rate')).toHaveText('3.2%');
      await expect(sub.heroStat('poverty-rate')).toHaveText('18.4%');
    }
  );

  test(
    'subpages do not render the homepage-only "Explore Our Data Stories" nav boxes',
    { tag: ['@regression'] },
    async ({ page }) => {
      for (const route of subpageRoutes) {
        const sub = new SubPage(page, route);
        await sub.goto();
        await expect(sub.navigationBoxes(), `${route.path} should not have homepage nav boxes`).toHaveCount(0);
      }
    }
  );
});
