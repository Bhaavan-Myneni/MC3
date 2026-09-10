import { Page, Locator, expect } from '@playwright/test';
import { navLinks } from '../fixtures/pages';

/**
 * Shared behavior for every page on the site: the header nav, the
 * disclaimer banner, and the footer are identical chrome across all 6
 * pages, so console-error collection and nav interactions live here once
 * instead of being copy-pasted into every spec.
 */
export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly nav: Locator;
  readonly footer: Locator;

  private consoleErrors: string[] = [];
  private pageErrors: string[] = [];

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header.main-header');
    this.nav = page.locator('nav.main-nav');
    this.footer = page.locator('footer.main-footer');

    // Attach listeners immediately so errors thrown during the upcoming
    // goto()/navigation are captured, not just ones after the page settles.
    page.on('console', (msg) => {
      if (msg.type() === 'error') this.consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => this.pageErrors.push(err.message));
  }

  async goto(path: string) {
    return this.page.goto(path);
  }

  getConsoleErrors(): string[] {
    return this.consoleErrors;
  }

  getPageErrors(): string[] {
    return this.pageErrors;
  }

  async expectNoJsErrors() {
    expect(this.getConsoleErrors(), `console.error() calls:\n${this.getConsoleErrors().join('\n')}`).toEqual([]);
    expect(this.getPageErrors(), `uncaught JS errors:\n${this.getPageErrors().join('\n')}`).toEqual([]);
  }

  async expectChromeVisible() {
    await expect(this.header).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  /** Nav link locator for one of the 6 site sections, by its label. */
  navLink(label: string): Locator {
    return this.nav.locator('a', { hasText: label });
  }

  /**
   * Below the 768px breakpoint the site collapses `.main-nav` behind a
   * hamburger button (`.mobile-menu-toggle`, injected by main.js) and only
   * shows it once that button is clicked (adds a `.mobile-open` class) —
   * see css/style.css's `@media (max-width: 768px)` block. That's
   * intentional responsive design, not a bug, so any test that needs to
   * see or click a nav link must open the menu first on narrow viewports.
   * On desktop viewports the toggle button is never rendered visible, so
   * this is a no-op there.
   */
  async ensureNavOpen() {
    const toggle = this.page.locator('.mobile-menu-toggle');
    if ((await toggle.count()) === 0) return;
    if (!(await toggle.isVisible())) return; // desktop viewport — nav is already shown
    if (await this.nav.isVisible()) return; // already open
    await toggle.click();
    await expect(this.nav).toBeVisible();
  }

  async expectNavHasAllPages() {
    await this.ensureNavOpen();
    for (const link of navLinks) {
      const filename = link.path.split('/').pop();
      await expect(
        this.nav.locator(`a[href$="${filename}"]`).first(),
        `nav should contain a link to ${link.label}`
      ).toBeVisible();
    }
  }

  async clickNav(label: string) {
    await this.ensureNavOpen();
    await this.navLink(label).click();
  }

  /** All same-origin, non-anchor hrefs found anywhere on the current page. */
  async collectInternalHrefs(): Promise<string[]> {
    return this.page.locator('a[href]').evaluateAll((els) =>
      els
        .map((el) => (el as HTMLAnchorElement).getAttribute('href'))
        .filter((href): href is string => !!href)
        .filter((href) => !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:'))
    );
  }

  /** The homepage-only "Explore Our Data Stories" nav boxes (see subpage-data.spec.ts). */
  navigationBoxes(): Locator {
    return this.page.locator('.navigation-boxes');
  }
}
