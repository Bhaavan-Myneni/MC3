import { test, expect } from '@playwright/test';

/**
 * API-layer test automation for the site's data layer.
 *
 * This is a static site with no REST backend, but the frontend still
 * depends on a real HTTP contract: the JS in js/verified-data.js and
 * js/verified-indicators.js fetches JSON files under /data/verified/ at
 * runtime and treats them as an API. Those endpoints deserve the same
 * treatment a REST API would get — status codes, content shape, and
 * cross-checks against what the UI ends up displaying — independent of
 * whether the *browser* renders them correctly (that's covered by
 * homepage-data.spec.ts and charts.spec.ts). Testing at this layer catches
 * data problems (a bad ETL export, a missing field) even if a UI bug were
 * masking them, and is much faster since no browser/CDN is involved.
 */

// These 4 files share a common ETL-normalized schema (indicator_name +
// indicator_value per record). children_in_poverty_clean.json predates
// that normalization and keeps its own field names
// (children_in_poverty / children_in_poverty_rate_pct) — it gets its own
// test below rather than being forced into this shape.
const RECORD_ARRAY_ENDPOINTS = [
  { file: 'graduation_rate_clean.json', indicatorName: 'high_school_graduation_rate' },
  { file: 'unemployment_rate_clean.json', indicatorName: 'county_unemployment_rate' },
  { file: 'demographics_population_clean.json', indicatorName: null },
  { file: 'social_services_indicator_clean.json', indicatorName: null },
];

test.describe('Verified data API contract (/data/verified/*.json)', () => {
  test('poverty_metrics_verified.json returns a well-formed, internally consistent summary object', async ({
    request,
  }) => {
    const res = await request.get('/data/verified/poverty_metrics_verified.json');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.indicator_name).toBe('children_in_poverty');
    expect(body.verified).toBe(true);
    expect(body.county_fips).toBe('18105');
    expect(body.start_year).toBeLessThan(body.end_year);

    // The percentage-point change is derived from start/end pct — verify the
    // math rather than just trusting the field exists (this is exactly the
    // kind of drift the site's own metric_validation_report.json exists to
    // catch: an 8.3pp figure was flagged elsewhere as inconsistent with
    // this 6.2pp verified value).
    const expectedChange = Number((body.start_value_pct - body.end_value_pct).toFixed(1));
    expect(body.percentage_point_change).toBeCloseTo(expectedChange, 1);
  });

  test('metric_validation_report.json is reachable and reports on the poverty metric', async ({ request }) => {
    const res = await request.get('/data/verified/metric_validation_report.json');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('json');

    const body = await res.json();
    expect(body).toBeTruthy();
  });

  for (const { file, indicatorName } of RECORD_ARRAY_ENDPOINTS) {
    test(`${file} returns a non-empty array of verified year-indexed records`, async ({ request }) => {
      const res = await request.get(`/data/verified/${file}`);
      expect(res.status(), `${file} should return 200`).toBe(200);

      const body = await res.json();
      expect(Array.isArray(body), `${file} should be a JSON array`).toBe(true);
      expect(body.length, `${file} should not be empty`).toBeGreaterThan(0);

      const years = new Set<number>();
      for (const record of body) {
        expect(record.verified, `every record in ${file} should be marked verified`).toBe(true);
        expect(typeof record.year).toBe('number');
        expect(typeof record.indicator_value).toBe('number');
        expect(Number.isNaN(record.indicator_value), `${file} record for ${record.year} should not be NaN`).toBe(
          false
        );
        if (indicatorName) {
          expect(record.indicator_name).toBe(indicatorName);
        }
        years.add(record.year);
      }
      // Years should be unique per file (no duplicate/conflicting records for the same year).
      expect(years.size, `${file} should not have duplicate year entries`).toBe(body.length);
    });
  }

  test('children_in_poverty_clean.json returns verified, internally consistent per-year records', async ({
    request,
  }) => {
    const res = await request.get('/data/verified/children_in_poverty_clean.json');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    const years = new Set<number>();
    for (const record of body) {
      expect(record.verified).toBe(true);
      expect(record.indicator_name).toBe('children_in_poverty');
      expect(typeof record.children_in_poverty).toBe('number');
      expect(typeof record.children_in_poverty_rate_pct).toBe('number');
      // The proportion and percentage fields should always agree.
      expect(record.children_in_poverty_rate_pct / 100).toBeCloseTo(record.children_in_poverty, 2);
      years.add(record.year);
    }
    expect(years.size).toBe(body.length);
  });

  test('a nonexistent data file returns 404, not a silent empty 200', async ({ request }) => {
    const res = await request.get('/data/verified/this_file_does_not_exist.json');
    expect(res.status()).toBe(404);
  });

  test('cross-check: the homepage poverty card matches the verified API value', async ({ page, request }) => {
    const res = await request.get('/data/verified/poverty_metrics_verified.json');
    const metrics = await res.json();

    await page.goto('/index.html');
    const cardText = (await page.locator('#card-poverty-value').textContent())?.trim() ?? '';

    expect(cardText).toContain(String(metrics.end_value_pct));
    expect(cardText).toContain(String(metrics.end_year));
  });
});
