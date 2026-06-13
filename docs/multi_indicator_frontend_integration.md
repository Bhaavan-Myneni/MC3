# Multi-Indicator Frontend Integration

**Phase:** 6.5 — extend the homepage beyond child poverty to all verified ETL indicators.

---

## 1. Why the Dashboard Shows More Than Child Poverty

Phase 5 wired only child poverty to the website. Phase 6 extended the ETL to education, economy, demographics, and social services — but the homepage still emphasized poverty. Phase 6.5 gives all five verified indicators equal visibility with cards, mini trend charts, and narrative story blocks.

The original dashboard JSON in `website/data/processed/` is preserved unchanged. Verified values come exclusively from `website/data/verified/`.

---

## 2. Verified Indicators on the Homepage

| Indicator | Latest verified value | Topic |
|-----------|----------------------|-------|
| Child poverty | 14.0% in 2024 | Demographics |
| Graduation rate | 90.77% in 2017 | Education |
| Unemployment rate | 5.8% in 2025 | Economy |
| Child population | 44,236 in 2021 | Demographics |
| SNAP participants | 7,527 in 2023 | Social services |

---

## 3. JSON Files per Card and Chart

| UI element | JSON file(s) |
|------------|--------------|
| Child Poverty card + mini chart | `children_in_poverty_clean.json`, `poverty_metrics_verified.json` |
| Graduation Rate card + mini chart | `graduation_rate_clean.json` |
| Unemployment card + mini chart | `unemployment_rate_clean.json` |
| Child Population card + mini chart | `demographics_population_clean.json` |
| SNAP card + mini chart | `social_services_indicator_clean.json` |
| Validation warnings | `phase6_indicator_validation_report.json` |
| Full poverty trend (preserved) | `children_in_poverty_clean.json`, `metric_validation_report.json` |

---

## 4. Indicators With Trend Charts

All five indicators have multiple years in their source files and render mini line charts via Chart.js:

| Indicator | Years in file | Chart canvas ID |
|-----------|---------------|-----------------|
| Child poverty | 2014–2024 (11) | `verifiedPovertyMiniChart` |
| Graduation rate | 2006–2017 (12) | `verifiedGraduationMiniChart` |
| Unemployment | 2020–2025 (6) | `verifiedUnemploymentMiniChart` |
| Child population | 2000–2021 (22) | `verifiedChildPopulationMiniChart` |
| SNAP participants | 1990–2023 (34) | `verifiedSnapMiniChart` |

If a future ETL run produces only one year, the card still renders and the chart area shows: *"Trend not available from selected source."*

---

## 5. Latest-Value-Only Cases

No current indicator is latest-value-only — all support trends. Summary-only files:

- `poverty_metrics_verified.json` — aggregates for subtitle text, not charted
- `phase6_indicator_validation_report.json` — validation metadata
- `metric_validation_report.json` — poverty discrepancy flags for the detailed section

---

## 6. Unverified Claims Avoided

These dashboard values are **not** shown as verified:

| Claim | Source | Verified alternative |
|-------|--------|---------------------|
| 95% graduation rate | `dashboard_summary.json` | 90.77% in 2017 |
| 3.9% unemployment | `dashboard_summary.json` | 5.8% in 2025 |
| 8.3pp poverty reduction | `dashboard_summary.json` | 6.2pp (2014–2024) |
| `total_children_impacted: 1735` | Dashboard JSON | Not verified |

Story blocks and validation warnings explicitly call out graduation and unemployment mismatches.

---

## 7. Portfolio Impact

- Demonstrates end-to-end data engineering: raw CSV/XLSX → Python ETL → verified JSON → multi-indicator static dashboard.
- Shows data quality discipline — discrepancies are documented, not hidden.
- Balances the portfolio narrative across poverty, education, economy, demographics, and social services instead of a single-metric story.

---

## Implementation Files

| File | Role |
|------|------|
| `website/index.html` | Verified Community Indicators grid, story blocks, preserved poverty section |
| `website/js/verified-indicators.js` | Loads JSON, renders cards and mini charts |
| `website/css/style.css` | Multi-indicator grid, cards, charts, stories |
| `docs/verified_indicator_frontend_mapping.md` | Field-level mapping reference |

---

## Run Locally

```bash
cd etl
python automated_pipeline.py

cd website
python3 -m http.server 8000
```

Open http://localhost:8000 and scroll to **Verified Community Indicators**.
