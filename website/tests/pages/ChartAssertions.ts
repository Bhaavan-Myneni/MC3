import { Page, expect } from '@playwright/test';

/**
 * Shared Chart.js assertion used by both HomePage and SubPage specs. A
 * <canvas> tag existing in the DOM doesn't mean Chart.js actually drew
 * anything on it — a bad fetch or JS error partway through setup can leave
 * a blank canvas with no thrown error. `Chart.getChart(canvas)` looks up
 * the live chart instance registered against a canvas, which is a much
 * stronger signal than "the tag is present".
 */
export async function expectChartRenders(page: Page, chartId: string) {
  await page.waitForFunction(() => (window as any).Chart !== undefined, null, { timeout: 10_000 });

  const canvas = page.locator(`#${chartId}`);
  await expect(canvas, `canvas #${chartId} should exist`).toHaveCount(1);

  await page.waitForFunction(
    (id) => {
      const el = document.getElementById(id) as HTMLCanvasElement | null;
      return !!el && !!(window as any).Chart.getChart(el);
    },
    chartId,
    { timeout: 10_000 }
  );

  const box = await canvas.boundingBox();
  expect(box?.width ?? 0, `#${chartId} should have non-zero rendered width`).toBeGreaterThan(0);
  expect(box?.height ?? 0, `#${chartId} should have non-zero rendered height`).toBeGreaterThan(0);
}
