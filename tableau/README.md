# Tableau Import Guide

Tableau workbooks are included in this project. See `docs/tableau_claim_check.md`.

## Workbooks

| Workbook | CSV data source |
|---|---|
| `mc3_child_poverty_trends.twb` | `data/processed/children_in_poverty_clean.csv` |
| `mc3_housing_stability.twb` | `data/processed/housing_stability_clean.csv` |
| `mc3_mental_health_suicide.twb` | `data/processed/mental_health_clean.csv` |
| `mc3_multi_indicator_dashboard.twb` | `data/processed/cdc_wonder_suicide_clean.csv` |

Regenerate workbooks after ETL:

```bash
cd etl
python automated_pipeline.py
python generate_tableau_workbooks.py
```
