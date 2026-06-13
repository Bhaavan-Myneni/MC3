# Public Health Source Integration

## Scope

This document covers **verified public health data processed in Phase 8**. It does **not** claim CDC WONDER integration (see `docs/cdc_wonder_gap_and_plan.md`).

## Raw File Used

| File | Path |
|---|---|
| Clinical Care.csv | `data/raw/misc/dataset_archive/Clinical Care.csv` |

## Original Columns

- `County ID` — state + county FIPS prefix
- `County` — county name
- `Year` — survey year
- `Uninsured Children` — proportion (0–1 scale)
- `Uninsured Children CI High` / `Uninsured Children CI Low` — confidence interval bounds

## Cleaning Steps (`clean_public_health_or_mental_health`)

1. Load CSV with pandas.
2. Standardize column names via `clean_column_names()`.
3. Filter to Monroe County (`county_fips == 18105` or county name match).
4. Convert uninsured proportion to **percent** (`indicator_value = uninsured_children * 100`).
5. Append ETL lineage fields (`source_file`, `data_topic`, `verified`, etc.).
6. Save processed CSV/JSON and export to `website/data/verified/`.

## Processed Outputs

| Output | Path |
|---|---|
| CSV | `data/processed/public_health_mental_health_clean.csv` |
| JSON | `data/processed/public_health_mental_health_clean.json` |
| Website verified | `website/data/verified/public_health_mental_health_clean.json` |

**Naming note:** The output file is named `public_health_mental_health_clean` for pipeline consistency, but the content is **uninsured children rate** — a **clinical care access** indicator, not mental health.

## Indicator Produced

| Indicator | Unit | Topic | Latest year in source |
|---|---|---|---|
| `uninsured_children_rate` | percent | `public_health` | 2022 (per source file) |

## What This Does and Does Not Support

| Resume / portfolio claim | Supported? |
|---|---|
| Public health data integration (county clinical care file) | Yes |
| CDC WONDER integration | No |
| Youth mental health coverage | No |
| Pandas-based health indicator analysis | Yes |

## Limitations

- Single indicator from one county-level file.
- No behavioral health, suicide, or youth mental health measures in current raw data.
- Confidence intervals are present in source but not exported in cleaned output in this phase.

## Regenerate

```bash
cd etl
python automated_pipeline.py
```
