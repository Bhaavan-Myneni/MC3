import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { SiteRoute } from '../fixtures/pages';

/**
 * Page object for any of the 5 non-home pages (demographics, education,
 * economy, social-services, correlations). They share identical structure
 * — hero-stats block, chart canvases, header/footer — so one parametrized
 * class covers all 5 instead of duplicating near-identical subclasses.
 */
export class SubPage extends BasePage {
  readonly route: SiteRoute;

  constructor(page: import('@playwright/test').Page, route: SiteRoute) {
    super(page);
    this.route = route;
  }

  async goto() {
    return super.goto(this.route.path);
  }

  heroStat(id: string): Locator {
    return this.page.locator(`#${id}`);
  }

  chart(chartId: string): Locator {
    return this.page.locator(`#${chartId}`);
  }
}
