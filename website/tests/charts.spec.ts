import { test } from '@playwright/test';
import { routes } from './fixtures/pages';
import { HomePage } from './pages/HomePage';
import { SubPage } from './pages/SubPage';
import { expectChartRenders } from './pages/ChartAssertions';

/**
 * Chart.js visualizations render on every page. Chart.js is loaded from a
 * CDN; a CDN failure should fail loudly as "chart didn't render" rather
 * than showing up as N confusing per-chart failures with no common cause.
 */
test.describe('Chart.js visualizations render', () => {
  for (const route of routes) {
    if (route.chartIds.length === 0) continue;

    test(`${route.name} page: every expected chart actually renders`, { tag: ['@regression'] }, async ({ page }) => {
      const po = route.path === HomePage.path ? new HomePage(page) : new SubPage(page, route);
      await po.goto();

      for (const chartId of route.chartIds) {
        await expectChartRenders(page, chartId);
      }
    });
  }
});
