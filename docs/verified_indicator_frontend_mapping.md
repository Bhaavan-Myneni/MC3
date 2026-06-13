# Verified Indicator Frontend Mapping

Maps each ETL-verified JSON file to its website section, fields, and UI behavior.

**Last updated:** Phase 6.5

---

## Summary Table

| JSON file | Website section | Value field | Year field | Latest verified | Trend chart |
|-----------|-----------------|-------------|------------|-----------------|-------------|
| `children_in_poverty_clean.json` | Verified Community Indicators → Child Poverty card + mini chart; Verified Child Poverty — Detailed Trend | `children_in_poverty_rate_pct` | `year` | 14.0% in 2024 | Yes (11 years, 2014–2024) |
| `poverty_metrics_verified.json` | Child Poverty card subtitle (6.2pp change) | `end_value_pct`, `percentage_point_change` | `start_year`, `end_year` | Summary only | No |
| `graduation_rate_clean.json` | Verified Community Indicators → Graduation Rate card + mini chart | `indicator_value` | `year` | 90.77% in 2017 | Yes (12 years, 2006–2017) |
| `unemployment_rate_clean.json` | Verified Community Indicators → Unemployment card + mini chart | `indicator_value` | `year` | 5.8% in 2025 | Yes (6 years, 2020–2025) |
| `demographics_population_clean.json` | Verified Community Indicators → Child Population card + mini chart | `indicator_value` | `year` | 44,236 in 2021 | Yes (22 years, 2000–2021) |
| `social_services_indicator_clean.json` | Verified Community Indicators → SNAP Participants card + mini chart | `indicator_value` | `year` | 7,527 in 2023 | Yes (34 years, 1990–2023) |
| `phase6_indicator_validation_report.json` | Validation warning box below indicator cards | `validation_warnings[].message` | — | Report metadata | No |
| `metric_validation_report.json` | Verified Child Poverty — Detailed Trend warning | `discrepancies` | — | Poverty-only flags | No |

---

## File Schemas

### `children_in_poverty_clean.json`

Array of records. Key columns:

| Column | Type | Notes |
|--------|------|-------|
| `year` | integer | 2014–2024 |
| `children_in_poverty_rate_pct` | float | Display value (percent scale) |
| `children_in_poverty` | float | Proportion in source CSV |
| `indicator_name` | string | `children_in_poverty` |
| `source_file` | string | Path to `Children in Poverty.csv` |
| `verified` | boolean | Always `true` |

**Latest:** 14.0% in 2024  
**Trend:** Yes — used by `verifiedPovertyMiniChart` and the full poverty section chart.

### `poverty_metrics_verified.json`

Single summary object (not a time series):

| Column | Value |
|--------|-------|
| `start_year` | 2014 |
| `end_year` | 2024 |
| `start_value_pct` | 20.2 |
| `end_value_pct` | 14.0 |
| `percentage_point_change` | 6.2 |

**UI use:** Child Poverty card subtitle only.

### `graduation_rate_clean.json`

| Column | Type | Notes |
|--------|------|-------|
| `year` | integer | 2006–2017 |
| `indicator_value` | float | Percent |
| `indicator_name` | string | `high_school_graduation_rate` |
| `indicator_unit` | string | `percent` |
| `source_file` | string | Graduation xlsx path |

**Latest:** 90.77% in 2017  
**Trend:** Yes — `verifiedGraduationMiniChart`. Source ends at 2017.

### `unemployment_rate_clean.json`

| Column | Type | Notes |
|--------|------|-------|
| `year` | integer | 2020–2025 |
| `indicator_value` | float | Percent |
| `indicator_name` | string | `county_unemployment_rate` |
| `source_file` | string | Semicolon-separated STATSIN xlsx paths |

**Latest:** 5.8% in 2025  
**Trend:** Yes — `verifiedUnemploymentMiniChart`.

### `demographics_population_clean.json`

| Column | Type | Notes |
|--------|------|-------|
| `year` | integer | 2000–2021 |
| `indicator_value` | float | Summed child population count |
| `indicator_name` | string | `total_child_population` |
| `indicator_unit` | string | `count` |

**Latest:** 44,236 in 2021  
**Trend:** Yes — `verifiedChildPopulationMiniChart`. Validation note: summed across age groups.

### `social_services_indicator_clean.json`

| Column | Type | Notes |
|--------|------|-------|
| `year` | integer | 1990–2023 |
| `indicator_value` | float | Monthly average SNAP participants |
| `indicator_name` | string | `snap_participants_monthly_avg` |
| `indicator_unit` | string | `count` |

**Latest:** 7,527 in 2023  
**Trend:** Yes — `verifiedSnapMiniChart`.

### `phase6_indicator_validation_report.json`

| Field | Purpose |
|-------|---------|
| `indicators_processed` | ETL summary per indicator |
| `validation_warnings` | Dashboard claim mismatches (95% graduation, 3.9% unemployment) |
| `missing_methodology_notes` | Population summation caveat |

---

## Website Section Map

| HTML section | ID | Data sources | JS module |
|--------------|-----|--------------|-----------|
| Verified Community Indicators | `#verified-etl-hub` | All 5 `*_clean.json` + `poverty_metrics_verified.json` + `phase6_indicator_validation_report.json` | `website/js/verified-indicators.js` |
| Verified Indicator Stories | `#verified-indicator-stories` | Static copy aligned to verified values | None (HTML only) |
| Verified Child Poverty — Detailed Trend | `#verified-poverty-section` | `children_in_poverty_clean.json`, `poverty_metrics_verified.json`, `metric_validation_report.json` | `verified-data.js`, `verified-poverty-chart.js` |

---

## Chart Container IDs

| Canvas ID | Indicator | Min years for trend |
|-----------|-----------|---------------------|
| `verifiedPovertyMiniChart` | Child poverty | 2+ (has 11) |
| `verifiedGraduationMiniChart` | Graduation rate | 2+ (has 12) |
| `verifiedUnemploymentMiniChart` | Unemployment | 2+ (has 6) |
| `verifiedChildPopulationMiniChart` | Child population | 2+ (has 22) |
| `verifiedSnapMiniChart` | SNAP participants | 2+ (has 34) |

If fewer than 2 years exist, the card shows: *"Trend not available from selected source."*

---

## Graceful Failure Behavior

| Condition | Behavior |
|-----------|----------|
| JSON file missing (HTTP 404) | Card shows "Data unavailable"; panel gets `verified-indicator-missing` class |
| Parse / runtime error | Console warning; panel gets `verified-indicator-error` class |
| Chart.js unavailable | Mini chart note shown; card values still render |
| `website/data/processed/` | Never read or overwritten by verified indicator code |
