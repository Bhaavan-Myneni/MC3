# Phase 6 Verified Indicators

**Phase:** 6 — extend reproducible ETL to education, economy, demographics, and social services.

---

## 1. Why Additional Indicators Were Selected

Phase 3–5 verified child poverty only. Phase 6 extends the same pattern to other real files already in `/data/raw/` documented in the Phase 2 inventory — without overwriting the existing dashboard.

---

## 2. Source Files Used

| Indicator | Source file(s) |
|-----------|----------------|
| Graduation rate | `data/raw/education/reference_repo/High school graduation rate.xlsx` |
| Unemployment | `data/raw/economy/reference_repo/Unemployment_Estimates/STATSIN_asu20–25.xlsx` |
| Child population | `data/raw/social_services/reference_repo/Child population by age group.xlsx` |
| SNAP participants | `data/raw/social_services/reference_repo/Monthly average number of persons issued food stamps (SNAP).xlsx` |
| Poverty (existing) | `data/raw/misc/dataset_archive/Children in Poverty.csv` |

---

## 3. Successfully Verified Indicators

| Indicator | Latest year | Latest verified value | Unit |
|-----------|-------------|----------------------|------|
| High school graduation rate | 2017 | 90.77% | percent |
| County unemployment rate | 2025 | 5.8% | percent |
| Total child population | 2021 | 44,236 | count |
| SNAP monthly average | 2023 | 7,527 | count |
| Child poverty rate | 2024 | 14.0% | percent |

---

## 4. Skipped Indicators and Why

| Candidate | Reason |
|-----------|--------|
| `Clinical Care.csv` | Health/uninsured metric — SNAP selected for social services |
| ACS `B01001` population | Not found at expected paths |
| `High school dropout rate.xlsx` | Graduation file chosen as education indicator |
| Dashboard `95%` graduation claim | Not matched by source (latest verified: 90.77% in 2017) |
| Dashboard `3.9%` unemployment claim | Not matched by STATSIN county rates (5.4%–6.4%) |

---

## 5. Cleaned Files Created

```
data/processed/
├── graduation_rate_clean.csv / .json
├── unemployment_rate_clean.csv / .json
├── demographics_population_clean.csv / .json
├── social_services_indicator_clean.csv / .json
└── phase6_indicator_validation_report.json
```

Poverty outputs from Phase 3 are **not overwritten**.

---

## 6. Website JSON Exports

```
website/data/verified/
├── graduation_rate_clean.json
├── unemployment_rate_clean.json
├── demographics_population_clean.json
├── social_services_indicator_clean.json
├── phase6_indicator_validation_report.json
└── (existing poverty verified files unchanged)
```

`website/data/processed/` was **not modified**.

---

## 7. SQL Tables and Views Added

| Asset | Path |
|-------|------|
| Tables | `database/schema/002_add_verified_indicators.sql` |
| Views | `database/views/002_verified_dashboard_views.sql` |

Tables: `mc3.education_indicators`, `mc3.economic_indicators`, `mc3.demographic_indicators`, `mc3.social_service_indicators`

Views: `v_verified_education_trend`, `v_verified_economic_trend`, `v_verified_demographic_trend`, `v_verified_social_services_trend`, `v_mc3_verified_dashboard_feed`

PostgreSQL loading remains optional.

---

## 8. What Remains Unverified

- `dashboard_summary.json` graduation claim (95%)
- `dashboard_summary.json` unemployment claim (3.9%)
- `dashboard_summary.json` 8.3pp poverty claim (verified as 6.2pp)
- `total_children_impacted: 1735`
- Foster care, TANF, clinical care, mental health ratios

---

## 9. Safe Wording for README / Resume

**Recommended:**

- Extended a reproducible Python ETL workflow to validate multiple Monroe County community indicators across poverty, education, economy, and demographics.
- Created validation reports that distinguish verified dashboard metrics from unverified or inconsistent source claims.
- Exported verified JSON datasets for static dashboard rendering while preserving the original deployed website data.

**Avoid unless verified:**

- Improved accessibility by 40%
- Reduced ETL time by 30%
- Proved children impacted
- Claimed 95% graduation or 3.9% unemployment without source match

---

## Run Commands

```bash
cd etl
python automated_pipeline.py

cd website
python3 -m http.server 8000
```

---

## Related Documentation

- [`phase6_source_selection.md`](phase6_source_selection.md)
- [`frontend_verified_data_integration.md`](frontend_verified_data_integration.md)
- [`multi_indicator_frontend_integration.md`](multi_indicator_frontend_integration.md)
- [`verified_indicator_frontend_mapping.md`](verified_indicator_frontend_mapping.md)
- [`metric_validation.md`](metric_validation.md)

---

## 10. How Each Verified Indicator Appears on the Website

Phase 6.5 added a multi-indicator homepage section. Each verified export maps to a specific UI element.

| Indicator | Homepage section | JSON file(s) | UI elements |
|-----------|------------------|--------------|-------------|
| Child poverty | Verified Community Indicators + Verified Child Poverty — Detailed Trend | `children_in_poverty_clean.json`, `poverty_metrics_verified.json` | Card (14.0% in 2024), mini chart, full trend chart, 6.2pp subtitle |
| Graduation rate | Verified Community Indicators + Education story | `graduation_rate_clean.json` | Card (90.77% in 2017), mini chart, source-ends-2017 note |
| Unemployment | Verified Community Indicators + Economy story | `unemployment_rate_clean.json` | Card (5.8% in 2025), mini chart |
| Child population | Verified Community Indicators + Demographics story | `demographics_population_clean.json` | Card (44,236 in 2021), mini chart, summation caveat |
| SNAP participants | Verified Community Indicators + Social Services story | `social_services_indicator_clean.json` | Card (7,527 in 2023), mini chart |

**Sections in `website/index.html`:**

1. `#verified-etl-hub` — **Verified Community Indicators** (5 cards + 5 mini charts)
2. `#verified-indicator-stories` — **Verified Indicator Stories** (5 narrative blocks)
3. `#verified-poverty-section` — **Verified Child Poverty — Detailed Trend** (Phase 5 full chart, preserved)

**JavaScript:** `website/js/verified-indicators.js` loads all verified JSON files, updates card values from ETL output, renders mini charts where 2+ years exist, and shows validation warnings from `phase6_indicator_validation_report.json` without breaking the page if a file is missing.

**Unverified dashboard JSON** in `website/data/processed/` is not used for these sections.
