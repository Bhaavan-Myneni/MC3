# Data Transformation Details

Technical reference for how `etl/automated_pipeline.py` transforms raw MC3 source files into cleaned outputs and verified website JSON.

**Scope:** ETL only. The static website reads outputs; it does not transform data.

---

## 1. Raw Data Discovery

### Inventory-driven awareness

Phase 2 `etl/data_inventory.py` cataloged **1,134 files** under `data/raw/`, `data/processed/`, and `website/data/processed/`. Outputs:

- `data/processed/data_inventory.csv`
- `data/processed/data_inventory.json`

### Manual ETL source selection

Phase 6 indicators were chosen from inventory + `docs/phase6_source_selection.md` based on:

- Confirmed Monroe County rows
- Readable column structure
- Policy relevance (poverty, education, economy, demographics, social services)

### Runtime file discovery

| Method | Used for |
|--------|----------|
| `find_file_by_name(filename)` | Recursive search under `data/raw/` |
| `search_dir.rglob("STATSIN_asu*.xlsx")` | Unemployment multi-file merge |

If a file is not found, the ETL raises `FileNotFoundError` (poverty) or records the indicator in `indicators_skipped` (Phase 6).

---

## 2. File Loading

### CSV (child poverty)

```python
frame = pd.read_csv(source_path)
```

Source: `data/raw/misc/dataset_archive/Children in Poverty.csv`

### Excel — Kids Count exports

```python
frame = pd.read_excel(source_path, sheet_name="Kidscount Export")
```

Used for: graduation, child population, SNAP.

### Excel — STATSIN unemployment

```python
frame = pd.read_excel(path, sheet_name="data")
```

One file per year (`STATSIN_asu20.xlsx` … `STATSIN_asu25.xlsx`).

### Missing files

- Poverty: pipeline **stops** with `FileNotFoundError`
- Phase 6: indicator added to `indicators_skipped` with reason; other indicators continue

---

## 3. Column Standardization

Function: `clean_column_names(columns: list[str])`

| Step | Example |
|------|---------|
| Lowercase | `Children In Poverty` → `children in poverty` |
| Replace non-alphanumeric runs with `_` | `children in poverty` → `children_in_poverty` |
| Collapse repeated `_` | `children__in__poverty` → `children_in_poverty` |
| Strip leading/trailing `_` | — |

**Before → After (poverty CSV):**

| Original | Standardized |
|----------|--------------|
| `County ID` | `county_id` |
| `County` | `county` |
| `Year` | `year` |
| `Children In Poverty` | `children_in_poverty` |
| `Children In Poverty CI High` | `children_in_poverty_ci_high` |
| `Children In Poverty CI Low` | `children_in_poverty_ci_low` |

**Kids Count exports** use columns: `location`, `timeframe`, `dataformat`, `data` (and `age_group` for population).

**STATSIN** uses `cnty_fips`, `cnty_urate` after standardization.

---

## 4. Filtering Logic

### Monroe County FIPS

```python
MONROE_COUNTY_FIPS = "18105"
MONROE_COUNTY_NAME = "Monroe County"
```

### Poverty CSV

```python
monroe_mask = (
    frame["county_fips"].eq("18105")
    | frame["county_name"].str.contains("Monroe County", case=False, na=False)
)
```

`county_fips` extracted via `_extract_county_fips(county_id)` — last 5 digits of `05000US18105`.

### Kids Count XLSX

```python
frame["location"].astype(str).str.strip().eq("Monroe")
```

Plus `dataformat` filter:

- `"Percent"` for graduation
- `"Number"` for population and SNAP

### STATSIN unemployment

```python
monroe = frame[frame["cnty_fips"] == 105]
```

**Note:** STATSIN uses Indiana county code `105` (Monroe), not full FIPS `18105`.

### Empty filter result

Raises `ValueError` — indicator not exported.

---

## 5. Type Conversion

| Field | Conversion |
|-------|------------|
| `year` / `timeframe` | `pd.to_numeric(..., errors="coerce").astype("Int64")` then `int` where applicable |
| Poverty proportion | `pd.to_numeric(..., errors="coerce")` |
| `indicator_value` | `pd.to_numeric(..., errors="coerce")` |
| Graduation proportion → percent | `indicator_value * 100`, rounded to 2 decimals |
| Poverty proportion → percent | `children_in_poverty * 100`, rounded to 1 decimal |
| Unemployment rate | `round(cnty_urate, 1)` — already percent in source |
| Missing values | `dropna(subset=["year", "indicator_value"])` for Kids Count rows |

---

## 6. Indicator Metadata

Every cleaned row includes lineage fields added by ETL:

| Field | Example | Purpose |
|-------|---------|---------|
| `data_topic` | `demographics`, `education`, `economy`, `social_services` | Thematic grouping |
| `indicator_name` | `children_in_poverty`, `high_school_graduation_rate`, etc. | Stable indicator ID |
| `indicator_unit` | `percent` or `count` | Display unit (Phase 6 indicators) |
| `source_file` | Relative path from project root | Data lineage |
| `etl_processed_at` | ISO 8601 UTC timestamp | Run audit trail |
| `value_type` | `rate_proportion`, `rate_percent`, `population_count`, `service_count` | Semantic type |
| `verified` | `True` | ETL-processed flag |
| `county_fips` | `18105` | Geographic filter |
| `county_name` | `Monroe County` or `Monroe County, IN` | Geographic label |

Poverty rows retain additional source columns: `county_id`, `county`, `children_in_poverty_ci_high`, `children_in_poverty_ci_low`.

Function: `_add_lineage_fields()` for Phase 6 indicators; inline assignment in `clean_children_in_poverty()`.

---

## 7. Output Generation

### Per-indicator cleaned files

Function: `save_indicator_outputs(base_name, frame)`

```python
frame.to_csv(PROCESSED_DIR / f"{base_name}_clean.csv", index=False)
frame.to_json(PROCESSED_DIR / f"{base_name}_clean.json", orient="records", indent=2)
```

| Base name | Rows (current run) |
|-----------|-------------------|
| `children_in_poverty` | 11 |
| `graduation_rate` | 12 |
| `unemployment_rate` | 6 |
| `demographics_population` | 22 |
| `social_services_indicator` | 34 |

### Poverty summary metrics

`poverty_metrics_verified.json` — single-object summary from `calculate_poverty_metrics()`.

### Validation reports

| File | Contents |
|------|----------|
| `metric_validation_report.json` | Poverty vs `dashboard_summary.json` comparison |
| `phase6_indicator_validation_report.json` | Phase 6 run summary, warnings, methodology notes |

### Verified website exports

Function: `export_verified_json_for_website()`

Copies JSON from `data/processed/` to `website/data/verified/`:

```
children_in_poverty_clean.json
poverty_metrics_verified.json
metric_validation_report.json
graduation_rate_clean.json
unemployment_rate_clean.json
demographics_population_clean.json
social_services_indicator_clean.json
phase6_indicator_validation_report.json
```

**Does not write to** `website/data/processed/`.

---

## 8. Metric Validation

### Required column checks

`validate_required_columns(frame, required_columns, context)` — raises `ValueError` if any required column missing after standardization.

### Value range checks

- Poverty: non-empty Monroe filter; numeric year and rate columns
- Graduation/unemployment: `dropna` on year and value
- Population: requires `age_group` column for summation

### Missing year checks

**Inferred:** ETL does not impute missing years; charts show only years present in source. Gaps in unemployment series (pre-2020) reflect available STATSIN files, not imputation.

### Dashboard comparison

`compare_existing_dashboard_metrics()`:

- Loads `website/data/processed/dashboard_summary.json` if present
- Compares poverty percentage-point claim to ETL `percentage_point_change`
- Writes warnings to `metric_validation_report.json`

Phase 6 hardcoded warnings in `run_phase6_indicators()`:

- `dashboard_graduation_claim` (95% vs 90.77%)
- `dashboard_unemployment_claim` (3.9% vs 5.4%–6.4% range)

---

## 9. PostgreSQL-Ready Outputs

### Schema alignment

- `database/schema/001_initial_schema.sql` — `mc3.children_in_poverty`
- `database/schema/002_add_verified_indicators.sql` — education, economy, demographic, social tables

### Optional load

`load_to_postgres(cleaned)` runs when `DATABASE_URL` is set:

- Maps poverty DataFrame columns to `mc3.children_in_poverty`
- Deletes prior rows for `indicator_name = 'children_in_poverty'` before insert

Phase 6 indicator tables exist in schema; full multi-indicator PostgreSQL load is **partial** — poverty load is implemented in pipeline; other indicators have schema ready.

### Website independence

The static dashboard reads `website/data/verified/*.json` via HTTP `fetch()`. PostgreSQL is not required for chart rendering.

---

## Run Command

```bash
cd etl
pip install -r requirements.txt
python automated_pipeline.py
```

---

## Related Documentation

- [`visualization_methodology.md`](visualization_methodology.md)
- [`etl_pipeline.md`](etl_pipeline.md)
- [`phase6_source_selection.md`](phase6_source_selection.md)
