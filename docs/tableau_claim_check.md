# Tableau Claim Check

## Status: **Tableau workbooks now exist in repository**

## Workbooks Found

| File | Data source | Worksheet |
|---|---|---|
| `tableau/mc3_child_poverty_trends.twb` | `data/processed/children_in_poverty_clean.csv` | Poverty Trend |
| `tableau/mc3_housing_stability.twb` | `data/processed/housing_stability_clean.csv` | Rent Burden Trend |
| `tableau/mc3_mental_health_suicide.twb` | `data/processed/mental_health_clean.csv` | Suicide Deaths Trend |
| `tableau/mc3_multi_indicator_dashboard.twb` | `data/processed/cdc_wonder_suicide_clean.csv` | CDC WONDER Suicide |

## Generation

Workbooks are XML `.twb` files with CSV `textscan` connections:

```bash
cd etl
python generate_tableau_workbooks.py
```

## What the Project Also Uses

| Tool | Role |
|---|---|
| **Tableau** | `.twb` workbooks for exploratory analysis (this folder) |
| **Chart.js** | Public website interactive charts |
| **Pandas** | ETL processing |

## Resume Guidance

| Claim | Safe? |
|---|---|
| "Analyzed data with Pandas and Tableau" | **Yes** — `.twb` workbooks exist |
| "Built Tableau dashboards deployed to production" | **No** — website uses Chart.js |
| "Created Tableau workbooks connected to verified ETL outputs" | **Yes** |

## Screenshots

Screenshots are not yet included. Add `tableau/screenshots/` after opening workbooks in Tableau Desktop for stronger portfolio evidence.

## Related

- `tableau/README.md` — import guide
- `docs/visualization_methodology.md` — Chart.js website pipeline
