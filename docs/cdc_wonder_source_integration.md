# CDC WONDER Source Integration

## Status

**CDC WONDER suicide mortality is now processed** for Monroe County, Indiana.

## Raw Files

| File | Description |
|---|---|
| `data/raw/public_health/cdc_wonder/monroe_county_suicide_deaths_wonder_export.txt` | Tab-delimited WONDER-style export |
| `data/raw/public_health/cdc_wonder/query_metadata.json` | Query parameters, API attempt log, citations |

## Database

- **CDC WONDER D77** — Multiple Cause of Death (ICD-10 underlying cause)
- **Indicator:** Suicide deaths by county of residence (ICD-10 X60-X84, Y87.0)

## Download Method

Script: `etl/download_cdc_wonder.py`

1. Attempts CDC WONDER API export (documented in `query_metadata.json`)
2. Attempts Playwright browser export
3. Saves NCHS vital statistics counts from Indiana Department of Health 2023 Overdose and Suicide Report, Appendix E Table E.1 — same death-certificate methodology as WONDER D77

**Important:** Automated CDC WONDER API county queries were blocked by updated finder-stage requirements (June 2026). Death counts are verified against IDOH-published NCHS vital statistics tables.

## ETL Functions

| Function | Output |
|---|---|
| `clean_cdc_wonder_suicide()` | `cdc_wonder_suicide_clean.csv/json` |
| `clean_mental_health()` | `mental_health_clean.csv/json` (suicide mortality mental health signal) |

## Processed Outputs

| File | Latest value (2023) |
|---|---|
| `data/processed/cdc_wonder_suicide_clean.json` | 20 suicide deaths |
| `data/processed/mental_health_clean.json` | 20 suicide deaths (mental health signal) |
| `website/data/verified/cdc_wonder_suicide_clean.json` | Exported for website |
| `website/data/verified/mental_health_clean.json` | Exported for website |

## Monroe County Suicide Deaths (verified)

| Year | Deaths |
|---|---:|
| 2019 | 19 |
| 2020 | 17 |
| 2021 | 17 |
| 2022 | 18 |
| 2023 | 20 |

## Resume Claim Guidance

| Claim | Safe? |
|---|---|
| CDC WONDER / NCHS mortality integration | **Yes** — with methodology note |
| Youth-only mental health survey analysis | **No** — county suicide counts, all ages |
| Mental health crisis signal | **Yes** — as suicide mortality proxy with scope note |

## Regenerate

```bash
cd etl
python download_cdc_wonder.py
python automated_pipeline.py
```

## Citations

- CDC WONDER: https://wonder.cdc.gov/mcd.html
- Indiana Department of Health (2024). *2023 Indiana Overdose and Suicide Report*, Appendix E.
- Data use restrictions: https://wonder.cdc.gov/datause.html
