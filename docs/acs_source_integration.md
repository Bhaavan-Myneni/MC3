# ACS Source Integration

## Purpose

Documents American Community Survey (ACS) integration for Monroe County (FIPS `18105`) to support the resume claim of integrating disparate data sources including ACS.

## Raw Files Used

| File pattern | Location | ACS table | Topic |
|---|---|---|---|
| `ACSDT5Y*.B25070-*.csv` | `data/raw/misc/dataset_archive/mc3_snap- us bureau/B25070/` | B25070 | Gross rent as % of household income (housing cost burden) |
| `ACSST5Y*.S1903-Data.csv` | `data/raw/acs/reference_repo/S1903_Median_Income/` | S1903 | Median household income |

Example rent burden file: `ACSDT5Y2023.B25070-2025-07-26T051415.csv`

Example income file: `ACSST5Y2023.S1903-Data.csv`

## Original Columns

### B25070 (wide format)

- `Label (Grouping)` — rent burden category labels
- `Monroe County, Indiana!!Estimate` — household count estimate
- `Monroe County, Indiana!!Margin of Error` — ACS margin of error

Categories include: Less than 10%, 10–14.9%, …, 30.0–34.9%, 35.0–39.9%, 40.0–49.9%, 50.0% or more, Not computed, Total.

### S1903

- `GEO_ID` — `0500000US18105` for Monroe County
- `S1903_C03_001E` — median household income estimate (dollars)

## Cleaning Steps (`clean_acs_housing_or_demographics`)

1. **Discover** B25070 CSV files under `data/raw` via recursive search.
2. **Parse year** from filename (e.g. `ACSDT5Y2023` → 2023).
3. **Extract estimates** from Monroe County estimate column; strip commas and margin-of-error symbols.
4. **Compute rent burden ≥30%** by summing categories at 30% and above; divide by renters with computed rent (total minus "Not computed").
5. **Load S1903** files; filter `GEO_ID == 0500000US18105`; read median income column.
6. **Standardize** output schema: `year`, `indicator_name`, `indicator_value`, `indicator_unit`, `data_topic`, lineage fields, `county_fips`, `county_name`.
7. **Save** to processed and verified JSON paths.

## Processed Outputs

| Output | Path |
|---|---|
| CSV | `data/processed/acs_housing_demographics_clean.csv` |
| JSON | `data/processed/acs_housing_demographics_clean.json` |
| Website verified | `website/data/verified/acs_housing_demographics_clean.json` |

## Indicators Produced

| Indicator | Unit | Years available | Notes |
|---|---|---|---|
| `renters_gross_rent_30_plus_pct` | percent | 2013–2023 (per files present) | Share of renter households paying ≥30% of income on gross rent |
| `median_household_income` | dollars | Per S1903 files present | Monroe County median household income |

## How This Supports the ACS Claim

- Uses **actual ACS extracts** already stored in `data/raw`.
- Filters to **Monroe County / FIPS 18105** where geographic identifiers exist.
- Runs through the **same Python/Pandas ETL pipeline** (`etl/automated_pipeline.py`) as other verified indicators.
- Exports lineage metadata (`source_file`, `etl_processed_at`, `verified`) for auditability.

## Limitations

- B25070 is a **housing cost burden** measure, not a full housing stability index.
- ACS 5-year estimates have **margins of error** not propagated into derived percentages in this phase.
- Not all ACS tables in the archive are yet integrated.

## Regenerate

```bash
cd etl
python automated_pipeline.py
```
