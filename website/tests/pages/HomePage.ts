import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

const HERO_STAT_IDS = ['total-population', 'poverty-rate', 'graduation-rate', 'unemployment-rate'] as const;
const VERIFIED_INDICATORS = ['poverty', 'graduation', 'unemployment', 'population', 'snap'] as const;

export type HeroStatId = (typeof HERO_STAT_IDS)[number];
export type VerifiedIndicator = (typeof VERIFIED_INDICATORS)[number];

/** Page object for index.html — the only page with hero stats and the verified-indicators dashboard. */
export class HomePage extends BasePage {
  static readonly path = '/index.html';
  static readonly title = 'MC3 Summit 2025 - Monroe County Childhood Conditions';

  static readonly heroStatIds = HERO_STAT_IDS;
  static readonly verifiedIndicators = VERIFIED_INDICATORS;

  static readonly chartIds = [
    'verifiedPovertyMiniChart',
    'verifiedGraduationMiniChart',
    'verifiedUnemploymentMiniChart',
    'verifiedChildPopulationMiniChart',
    'verifiedSnapMiniChart',
    'verifiedPovertyChart',
  ];

  async goto() {
    return super.goto(HomePage.path);
  }

  heroStat(id: HeroStatId): Locator {
    return this.page.locator(`#${id}`);
  }

  async expectHeroStatsPopulated() {
    for (const id of HERO_STAT_IDS) {
      const stat = this.heroStat(id);
      await expect(stat, `#${id} should stop showing the loading placeholder`).not.toHaveText('Loading...', {
        timeout: 10_000,
      });
      const text = (await stat.textContent())?.trim() ?? '';
      expect(text.length, `#${id} should not be empty once loaded`).toBeGreaterThan(0);
    }
  }

  verifiedIndicatorValue(indicator: VerifiedIndicator): Locator {
    return this.page.locator(`#card-${indicator}-value`);
  }

  async expectVerifiedIndicatorPopulated(indicator: VerifiedIndicator) {
    const value = this.verifiedIndicatorValue(indicator);
    await expect(value).toBeVisible();
    const text = (await value.textContent())?.trim() ?? '';
    expect(text.length, `#card-${indicator}-value should have text`).toBeGreaterThan(0);
    expect(text.toLowerCase()).not.toContain('undefined');
    expect(text.toLowerCase()).not.toContain('nan');
  }

  validationWarning(): Locator {
    return this.page.locator('#verified-multi-warning');
  }

  povertyDetail() {
    return {
      startRate: this.page.locator('#verified-start-rate'),
      endRate: this.page.locator('#verified-end-rate'),
      startYear: this.page.locator('#verified-start-year'),
      endYear: this.page.locator('#verified-end-year'),
    };
  }
}
