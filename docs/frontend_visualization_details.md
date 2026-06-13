# Frontend Visualization Details

How verified MC3 dashboard charts and cards are rendered in the static website. **Documentation only** — describes existing `website/js/` behavior without modifying files.

---

## 1. Static Data Serving

### Verified JSON location

```
website/data/verified/
├── children_in_poverty_clean.json
├── poverty_metrics_verified.json
├── metric_validation_report.json
├── graduation_rate_clean.json
├── unemployment_rate_clean.json
├── demographics_population_clean.json
├── social_services_indicator_clean.json
└── phase6_indicator_validation_report.json
```

### HTTP serving

When running `python3 -m http.server` from `website/`:

- URL pattern: `http://localhost:8000/data/verified/<filename>`
- No API server; files served as static assets
- Netlify deployment uses the same relative paths

### Original dashboard JSON (not used by verified sections)

`website/data/processed/` — legacy charts on topic subpages. Verified homepage sections **do not** read from this folder.

---

## 2. JavaScript Data Loading

### Script load order (homepage)

From `website/index.html`:

```html
<script src="js/verified-data.js"></script>
<script src="js/verified-poverty-chart.js"></script>
<script src="js/verified-indicators.js"></script>
```

`verified-data.js` must load first — poverty chart depends on `window.MC3VerifiedData`.

### verified-data.js

| Function | Fetches | Returns |
|----------|---------|---------|
| `fetchVerifiedJson(filename)` | `data/verified/{filename}` | JSON or `null` |
| `loadVerifiedPovertyTrend()` | `children_in_poverty_clean.json` | Sorted array by `year` |
| `loadVerifiedPovertyMetrics()` | `poverty_metrics_verified.json` | Summary object |
| `loadMetricValidationReport()` | `metric_validation_report.json` | Validation object |

Base path: `const VERIFIED_DATA_BASE = 'data/verified/';`

On HTTP error or network failure: `console.warn`, returns `null` — page continues.

### verified-indicators.js

| Function | Role |
|----------|------|
| `loadVerifiedFile(filename)` | Generic fetch for each indicator JSON |
| `normalizeRecords(data, config)` | Maps rows to `{ year, value, source_file }` |
| `updateCard(config, records, metrics)` | Sets card value, trend, source text |
| `populateStoryFields(config)` | Sets story, why-it-matters, limitation text |
| `renderMiniChart(config, records)` | Chart.js line chart on mini canvas |
| `initVerifiedCommunityIndicators()` | Orchestrates all five indicators on `DOMContentLoaded` |

**Config array:** `VERIFIED_INDICATOR_CONFIG` — one entry per indicator with file path, value field, canvas ID, formatters, and story text.

**Value field mapping:**

| Indicator | JSON value field |
|-----------|------------------|
| Poverty | `children_in_poverty_rate_pct` |
| Others | `indicator_value` |

**Row filter:** `indicator_name` must match config when field present in JSON.

### verified-poverty-chart.js

| Function | Role |
|----------|------|
| `initVerifiedPovertySection()` | Loads trend + metrics + validation report in parallel |
| `renderVerifiedPovertyChart(canvas, trendRecords)` | Full-size Chart.js line chart |
| `populateVerifiedMetricCards(metrics)` | Updates `#verified-latest-rate`, `#verified-pp-change`, etc. |
| `displayValidationWarning(report)` | Shows 8.3pp vs 6.2pp note in `#verified-validation-warning` |

Y-axis values: prefers `children_in_poverty_rate_pct`; falls back to `children_in_poverty * 100`.

---

## 3. Chart.js Rendering

### Library

Loaded from CDN in `website/index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

### Chart type

**Line charts** for all verified time-series indicators — years are categorical/numeric labels on x-axis; metric values on y-axis.

### Mini charts (verified-indicators.js)

| Canvas ID | Color | Label |
|-----------|-------|-------|
| `verifiedPovertyMiniChart` | `#2E86AB` | Child Poverty Rate (%) |
| `verifiedGraduationMiniChart` | `#003366` | Graduation Rate (%) |
| `verifiedUnemploymentMiniChart` | `#FFB500` | Unemployment Rate (%) |
| `verifiedChildPopulationMiniChart` | `#4A7C59` | Child Population |
| `verifiedSnapMiniChart` | `#8B4513` | SNAP Participants |

Options: `responsive: true`, `maintainAspectRatio: false`, legend hidden, `maxTicksLimit: 6` on x-axis.

### Detailed poverty chart (verified-poverty-chart.js)

| Setting | Value |
|---------|-------|
| Canvas | `verifiedPovertyChart` |
| Type | `line` |
| Fill | `true` with rgba background |
| Legend | displayed |
| Y-axis ticks | suffixed with `%` |
| Tooltips | `"X% child poverty rate"` |

### Formatting rules

| Metric type | Card display | Chart y values |
|-------------|--------------|----------------|
| Percent (poverty) | `toFixed(1)` + `%` | Raw percent numbers |
| Percent (graduation) | `toFixed(2)` + `%` | Raw percent numbers |
| Percent (unemployment) | `toFixed(1)` + `%` | Raw percent numbers |
| Count (population, SNAP) | `toLocaleString()` | Raw integers |

### Minimum data for chart

`records.length >= 2` required for mini chart. Otherwise canvas hidden and note shown: *"Trend not available from selected source."*

All five current indicators have 2+ years — mini charts render when JSON loads successfully.

---

## 4. Error Handling

### Missing JSON file

```javascript
if (!response.ok) {
    console.warn(`[MC3 Verified] Missing file: ${filename} (HTTP ${response.status})`);
    return null;
}
```

### Empty records

- Card value → `"Data unavailable"`
- Panel → CSS class `verified-indicator-missing`

### Per-indicator try/catch

Failed indicator logs warning; adds `verified-indicator-error` class; other indicators still render.

### Chart.js unavailable

Mini chart note: *"Chart.js unavailable — showing latest value only."*

Detailed poverty fallback element `#verified-chart-fallback` shows user-facing message; rest of page unaffected.

### Validation warnings

`showMultiValidationWarnings()` and `displayValidationWarning()` populate warning boxes from JSON — hidden when no warnings.

---

## 5. Storytelling Support

### What comes from JSON

- Latest metric value and year
- Full time series for charts
- `source_file` for source label
- Poverty trend summary from `poverty_metrics_verified.json`
- Validation messages from report JSON

### What is explanatory (not a data source)

Hardcoded in `VERIFIED_INDICATOR_CONFIG`:

- `storyConnection`
- `whyItMatters`
- `limitation`
- Static `trendLabel` (graduation: "Verified source ends in 2017")

HTML placeholders: `#card-{id}-story`, `#card-{id}-why`, `#card-{id}-limitation`, etc.

### Why text accompanies charts

- Improves accessibility — screen reader users get context beyond the canvas
- Reduces over-interpretation — limitation notes on every card
- Separates verified numbers from narrative framing

### Cross-indicator warnings

`phase6_indicator_validation_report.json` → `#verified-multi-warning` lists graduation and unemployment dashboard mismatches.

---

## HTML Element Reference

| Element ID | Purpose |
|------------|---------|
| `#verified-indicators-dashboard` | Five indicator panels |
| `#verifiedPovertyMiniChart` … `#verifiedSnapMiniChart` | Mini chart canvases |
| `#verifiedPovertyChart` | Detailed poverty chart |
| `#verified-latest-rate`, `#verified-pp-change` | Detailed poverty metric cards |
| `#verified-validation-warning` | Poverty 8.3pp flag |
| `#verified-multi-warning` | Phase 6 validation warnings |

---

## Subpages (legacy charts)

Topic pages (`pages/demographics.html`, etc.) use `website/js/visualizations.js` and `website/data/processed/` JSON — **separate pipeline** from verified homepage indicators. Path fix in `visualizations.js` uses `getSiteDataPath()` for subpage-relative fetch.

Verified documentation in this file applies to **homepage verified sections only**.

---

## Related Documentation

- [`visualization_methodology.md`](visualization_methodology.md)
- [`data_transformation_details.md`](data_transformation_details.md)
- [`verified_indicator_frontend_mapping.md`](verified_indicator_frontend_mapping.md)
