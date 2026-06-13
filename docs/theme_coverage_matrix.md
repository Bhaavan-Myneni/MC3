# Theme Coverage Matrix

Monroe County childhood conditions themes mapped to raw sources, processed outputs, and verification status.

| Theme | Raw Source | Processed Output | Website Output | Verified? | Notes |
|---|---|---|---|---|---|
| Housing stability | ACS B25070 (`data/raw/misc/dataset_archive/mc3_snap- us bureau/B25070/`) | `data/processed/housing_stability_clean.json` | `website/data/verified/housing_stability_clean.json` | **Yes** | Rent burden ≥30% proxy; not full stability index |
| Food access | SNAP Kids Count xlsx (`Monthly average number of persons issued food stamps (SNAP).xlsx`) | `data/processed/food_access_clean.json` | `website/data/verified/food_access_clean.json` | **Partial** | SNAP participation proxy; no free/reduced lunch file found |
| Mental health | CDC WONDER / NCHS suicide mortality (`data/raw/public_health/cdc_wonder/`) | `data/processed/mental_health_clean.json` | `website/data/verified/mental_health_clean.json` | **Partial** | Suicide deaths signal; not youth survey data |
| Poverty | `Children in Poverty.csv` | `data/processed/children_in_poverty_clean.json` | `website/data/verified/children_in_poverty_clean.json` | **Yes** | Core verified indicator |
| Education | `High school graduation rate.xlsx` | `data/processed/graduation_rate_clean.json` | `website/data/verified/graduation_rate_clean.json` | **Yes** | Source ends 2017 |
| Economy | `STATSIN_asu*.xlsx` | `data/processed/unemployment_rate_clean.json` | `website/data/verified/unemployment_rate_clean.json` | **Yes** | County unemployment rate |
| Demographics | `Child population by age group.xlsx`; ACS S1903 median income | `demographics_population_clean.json`; `acs_housing_demographics_clean.json` | Same under `website/data/verified/` | **Yes** | Population count + ACS median income |
| Social services | SNAP xlsx (same as food access source) | `data/processed/social_services_indicator_clean.json` | `website/data/verified/social_services_indicator_clean.json` | **Yes** | Monthly average SNAP participants |
| Public health (clinical care) | `Clinical Care.csv` | `data/processed/public_health_mental_health_clean.json` | `website/data/verified/public_health_mental_health_clean.json` | **Yes** | Uninsured children rate |
| CDC WONDER (suicide mortality) | `monroe_county_suicide_deaths_wonder_export.txt` | `data/processed/cdc_wonder_suicide_clean.json` | `website/data/verified/cdc_wonder_suicide_clean.json` | **Yes** | NCHS vital statistics / WONDER D77 methodology |

## Cross-Reference

- Phase 8 validation report: `data/processed/phase8_theme_validation_report.json`
- Resume claim tracker: `docs/resume_claim_evidence_tracker.md`
- ACS details: `docs/acs_source_integration.md`
- CDC WONDER gap: `docs/cdc_wonder_gap_and_plan.md`

## Gaps Requiring Future Data

1. **Youth mental health** — needs behavioral health or well-being survey extract.
2. **Free/reduced school lunch** — not found in current raw inventory.
3. **CDC WONDER** — no extract present; see gap plan doc.
