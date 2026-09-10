import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

/**
 * The homepage hero stats and verified indicator cards start out showing
 * literal "Loading..." text and get filled in asynchronously by
 * dataLoader.js / verified-indicators.js once their JSON fetches resolve.
 * These tests make sure that actually happens instead of the page
 * silently getting stuck.
 */
test.describe('Homepage hero stats', () => {
  test(
    'all hero stat tiles populate with real values, not stuck on "Loading..."',
    { tag: ['@regression'] },
    async ({ page }) => {
      const home = new HomePage(page);
      await home.goto();
      await home.expectHeroStatsPopulated();
    }
  );
});

test.describe('Verified community indicators section', () => {
  for (const indicator of HomePage.verifiedIndicators) {
    test(`${indicator} indicator card shows a value and does not error`, { tag: ['@regression'] }, async ({ page }) => {
      const home = new HomePage(page);
      await home.goto();
      await home.expectVerifiedIndicatorPopulated(indicator);
    });
  }

  test(
    'the validation warning banner is hidden when there is no discrepancy, or informative when shown',
    { tag: ['@regression'] },
    async ({ page }) => {
      const home = new HomePage(page);
      await home.goto();
      const warning = home.validationWarning();
      const isHidden = await warning.getAttribute('hidden');
      if (isHidden === null) {
        await expect(warning).not.toBeEmpty();
      }
    }
  );

  test('verified poverty detail section shows consistent start/end rates', { tag: ['@regression'] }, async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    const { startRate, endRate, startYear, endYear } = home.povertyDetail();

    await expect(startRate).toContainText('%');
    await expect(endRate).toContainText('%');
    expect(Number(await startYear.textContent())).toBeLessThan(Number(await endYear.textContent()));
  });
});
