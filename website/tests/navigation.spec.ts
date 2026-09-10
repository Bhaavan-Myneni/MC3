import { test, expect } from '@playwright/test';
import { routes, navLinks } from './fixtures/pages';
import { HomePage } from './pages/HomePage';
import { SubPage } from './pages/SubPage';

/** Build the right page object (HomePage vs generic SubPage) for a route. */
function pageObjectFor(page: import('@playwright/test').Page, route: (typeof routes)[number]) {
  return route.path === HomePage.path ? new HomePage(page) : new SubPage(page, route);
}

test.describe('Page load & navigation smoke tests', () => {
  for (const route of routes) {
    test(
      `${route.name} page loads with correct title and no console/page errors`,
      { tag: ['@smoke', '@regression'] },
      async ({ page }) => {
        const po = pageObjectFor(page, route);
        const response = await po.goto();
        expect(response?.status(), `${route.path} should respond 200`).toBe(200);
        await expect(page).toHaveTitle(route.title);

        await po.expectChromeVisible();
        await po.expectNoJsErrors();
      }
    );
  }

  for (const route of routes) {
    test(
      `${route.name} page has a working nav bar linking to all 6 pages`,
      { tag: ['@smoke', '@regression'] },
      async ({ page }) => {
        const po = pageObjectFor(page, route);
        await po.goto();
        await expect(po.nav).toBeVisible();
        await po.expectNavHasAllPages();
      }
    );
  }

  test(
    'clicking every nav link from the home page lands on the right page',
    { tag: ['@regression'] },
    async ({ page }) => {
      const home = new HomePage(page);
      for (const link of navLinks) {
        await home.goto();
        const navLink = home.navLink(link.label);
        await expect(navLink).toBeVisible();
        await navLink.click();
        await expect(page).toHaveURL(new RegExp(link.path.replace('/index.html', '(/index\\.html)?$')));
      }
    }
  );

  test(
    'all internal same-origin links resolve without 404s',
    { tag: ['@regression'] },
    async ({ page, request }) => {
      const checked = new Set<string>();
      const broken: string[] = [];

      for (const route of routes) {
        const po = pageObjectFor(page, route);
        await po.goto();
        const hrefs = await po.collectInternalHrefs();

        for (const href of hrefs) {
          const absolute = new URL(href, page.url()).toString();
          if (checked.has(absolute)) continue;
          checked.add(absolute);

          const res = await request.get(absolute);
          if (!res.ok()) broken.push(`${absolute} -> ${res.status()} (linked from ${route.path})`);
        }
      }

      expect(broken, `Broken internal links found:\n${broken.join('\n')}`).toEqual([]);
    }
  );
});
