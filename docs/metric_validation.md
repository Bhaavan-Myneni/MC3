# MC3 Metric Validation

This document records verified metrics, known discrepancies, and safe language for portfolio materials.

**ETL script:** `etl/automated_pipeline.py`  
**Validation output:** `data/processed/metric_validation_report.json`  
**Verified metrics:** `data/processed/poverty_metrics_verified.json`

---

## Known Discrepancy (Phase 2 → Phase 3)

| Source | Claim | ETL verified value | Status |
|--------|-------|-------------------|--------|
| `dashboard_summary.json` | "8.3 percentage point reduction in child poverty" | **6.2 percentage points** | **Mismatch — do not use 8.3** |
| `poverty_trend.json` | `improvement: 6.2` | **6.2 percentage points** | **Match — verified** |
| `poverty_trend.json` | `total_children_impacted: 1735` | Not calculable from source | **Unverified — flag only** |

### How the verified value was calculated

From `Children in Poverty.csv` (Monroe County, 2014–2024):

- 2014 rate: `0.202` → **20.2%**
- 2024 rate: `0.140` → **14.0%**
- Percentage-point change: `20.2 - 14.0 = **6.2**`

The ETL pipeline reproduces the rates in `poverty_trend.json` exactly. The `8.3` figure in `dashboard_summary.json` has **no matching source** in the confirmed poverty CSV and should be treated as an unsupported claim until traced to another dataset.

---

## Source Files Compared

| File | Role | Modified by ETL? |
|------|------|------------------|
| `data/raw/.../Children in Poverty.csv` | **Authoritative raw source** | No — read only |
| `data/processed/children_in_poverty_clean.csv` | ETL cleaned output | Created by ETL |
| `data/processed/poverty_metrics_verified.json` | Verified aggregates | Created by ETL |
| `website/data/processed/poverty_trend.json` | Existing dashboard trend | No — compared only |
| `website/data/processed/dashboard_summary.json` | Existing executive summary | No — compared only |

---

## Which Metrics Are Verified

| Metric | Value | Verified by |
|--------|-------|-------------|
| Child poverty rate by year (2014–2024) | 20.2%, 17.8%, … 14.0% | ETL matches raw CSV |
| Percentage-point change (2014 → 2024) | 6.2 | ETL calculation |
| Monroe County FIPS | 18105 | Present in source |
| Confidence intervals (high/low) | Per-year values | Copied from source |

---

## Which Metrics Remain Unverified

| Metric | Where it appears | Why unverified |
|--------|------------------|----------------|
| `8.3 percentage point reduction` | `dashboard_summary.json` | Does not match poverty source; origin unknown |
| `total_children_impacted: 1735` | `poverty_trend.json` | Requires child population denominator not in CSV |
| `95% high school graduation rate` | `dashboard_summary.json` | Not processed in Phase 3 poverty ETL |
| `3.9% unemployment rate` | `dashboard_summary.json` | Not processed in Phase 3 poverty ETL |
| `qualityScore: 0.98` | `demographics.json` metadata | Dashboard metadata only |

---

## Why the Project Should Avoid Unsupported Claims

Government and community data work requires **traceability**. Using an unverified `8.3` figure when the source file supports `6.2` would:

- Undermine portfolio credibility in interviews
- Mislead policy discussions at the MC3 Summit
- Violate the project rule: do not fabricate impact metrics

The correct approach is to **flag discrepancies** in `metric_validation_report.json` and use only ETL-verified values in new outputs.

---

## Safe Wording for README / Resume

### Recommended

- "Built an ETL workflow to verify and standardize Monroe County child poverty trend data."
- "Flagged inconsistencies between dashboard summary metrics and source trend files."
- "Created validation outputs to support reproducible community indicator reporting."
- "Reproduced 2014–2024 child poverty rates from confirmed CSV source with 6.2 percentage-point decline."

### Avoid unless independently verified

- "Reduced poverty by 8.3 percentage points"
- "Proved 1,735 children were impacted"
- "Improved accessibility by 40%"
- "Reduced ETL time by 30%"

---

## Regenerate Validation

```bash
cd etl
python automated_pipeline.py
```

Review outputs:

- `data/processed/metric_validation_report.json`
- `data/processed/poverty_metrics_verified.json`

---

## Next Steps (Phase 4+)

1. Build PostgreSQL schema for `children_in_poverty_clean`
2. Validate graduation and unemployment claims against their raw XLSX/CSV sources
3. Document or remove `total_children_impacted` until methodology is defined
4. Update website to consume ETL-verified JSON (new versioned path, not overwrite)
