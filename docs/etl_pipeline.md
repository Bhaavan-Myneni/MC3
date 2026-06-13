# MC3 ETL Pipeline

**Script:** `etl/automated_pipeline.py`  
**Phase:** 3 — first reproducible pipeline using confirmed real data

---

## 1. What the ETL Pipeline Does

The pipeline reads raw Monroe County data from `/data/raw`, cleans and validates it, calculates verified metrics, compares results against existing dashboard JSON (without modifying those files), and writes new versioned outputs to `/data/processed`.

Current scope: **Children in Poverty.csv** — the first confirmed source file from the Phase 2 inventory.

---

## 2. Why Children in Poverty.csv Was Chosen First

| Reason | Detail |
|--------|--------|
| Confirmed columns | Phase 2 verified all six required fields |
| Clear geography | Monroe County FIPS `18105` present in every row |
| Time series | 2014–2024 annual observations |
| Dashboard linkage | Powers `poverty_trend.json` and is cited in `dashboard_summary.json` |
| Metric discrepancy | Summary claims `8.3pp` reduction; trend file shows `6.2pp` — needs validation |

Starting with a single, well-understood file demonstrates reproducible ETL before scaling to ACS tables and XLSX sources.

---

## 3. Confirmed Raw Fields

Source file: `Children in Poverty.csv` (found under `/data/raw/`)

| Raw column | Cleaned column | Type |
|------------|----------------|------|
| `County ID` | `county_id` | string (`05000US18105`) |
| `County` | `county_name` | string |
| `Year` | `year` | integer |
| `Children In Poverty` | `children_in_poverty` | float (proportion 0–1) |
| `Children In Poverty CI High` | `children_in_poverty_ci_high` | float |
| `Children In Poverty CI Low` | `children_in_poverty_ci_low` | float |

Derived fields added by ETL:

- `county_fips` — extracted from `county_id` (`18105`)
- `children_in_poverty_rate_pct` — proportion × 100, rounded to 1 decimal
- `data_topic`, `indicator_name`, `source_file`, `etl_processed_at`, `value_type`, `verified`

---

## 4. How Columns Are Cleaned

1. **Find file** — `find_file_by_name()` searches `/data/raw` recursively; prefers `reference_repo` paths when available.
2. **Validate** — `validate_required_columns()` checks all six required fields exist.
3. **Rename** — `clean_column_names()` converts headers to `snake_case` (e.g., `County ID` → `county_id`).
4. **Type coercion** — year → integer; poverty fields → numeric.
5. **Lineage** — `source_file` and `etl_processed_at` appended to every row.

---

## 5. How Monroe County Data Is Filtered

Rows are kept when either:

- `county_fips == "18105"`, or
- `county_name` contains `"Monroe County"`

This ensures only Monroe County, Indiana records are processed.

---

## 6. How Poverty Metrics Are Calculated

From the cleaned time series, `calculate_poverty_metrics()` computes:

| Metric | Description |
|--------|-------------|
| `start_year` / `end_year` | First and last observation years |
| `start_value` / `end_value` | Raw proportion values (0–1) |
| `start_value_pct` / `end_value_pct` | Same values on percent scale |
| `absolute_change` | `end_value - start_value` (proportion scale) |
| `percentage_point_change` | `start_value_pct - end_value_pct` |
| `percent_change_relative` | Relative percent change from start |
| `min_value` / `max_value` | Range on proportion scale |
| `number_of_years` | `end_year - start_year` |

**Verified result (2014 → 2024):** 20.2% → 14.0% = **6.2 percentage-point reduction**.

---

## 7. Rate vs. Count Language

The source field `Children In Poverty` stores a **rate proportion**, not a headcount.

| Correct | Incorrect |
|---------|-----------|
| "6.2 percentage-point reduction in child poverty rate" | "6.2% reduction" (ambiguous) |
| "Child poverty rate fell from 20.2% to 14.0%" | "Child poverty count change" (wrong — not a count) |

Only use **percentage-point change** when the source is clearly a rate. Do not describe `total_children_impacted` without a documented denominator.

---

## 8. How Existing Dashboard JSON Metrics Are Compared

`compare_existing_dashboard_metrics()` reads (read-only):

- `website/data/processed/poverty_trend.json`
- `website/data/processed/dashboard_summary.json`

It checks:

1. Whether each year's `poverty_rates` matches ETL `children_in_poverty_rate_pct`
2. Whether `improvement` matches ETL `percentage_point_change`
3. Whether `dashboard_summary.json` claims match verified ETL values
4. Flags `total_children_impacted` and other unverified summary claims

Results are saved to `data/processed/metric_validation_report.json`. **Existing dashboard files are not modified.**

---

## 9. Output Files in `/data/processed`

| File | Contents |
|------|----------|
| `children_in_poverty_clean.csv` | Cleaned Monroe County poverty time series |
| `children_in_poverty_clean.json` | Same data in JSON records format |
| `poverty_metrics_verified.json` | Verified aggregate metrics |
| `metric_validation_report.json` | Dashboard comparison and warnings |

These are **new versioned ETL outputs**. They do not replace `existing_dashboard_json/` or `website/data/processed/`.

---

## 10. Optional PostgreSQL Loading

Set `DATABASE_URL` in a `.env` file or environment variable:

```
DATABASE_URL=postgresql://user:password@localhost:5432/mc3
```

If `DATABASE_URL` is not set, the pipeline prints:

```
PostgreSQL load skipped because DATABASE_URL was not provided.
```

If set, cleaned data is written to table `children_in_poverty_clean` via SQLAlchemy. Connection errors are logged and do not crash the pipeline.

---

## Run Commands

```bash
cd etl
pip install -r requirements.txt
python automated_pipeline.py
```

Expected terminal output:

```
Starting MC3 ETL pipeline...
Searching for Children in Poverty.csv...
Found source file at ...
Cleaning poverty data...
Calculating verified poverty metrics...
Comparing against existing dashboard metrics...
Saving processed outputs...
PostgreSQL load skipped because DATABASE_URL was not provided.
ETL pipeline completed successfully.
```

---

## Related Documentation

- [`metric_validation.md`](metric_validation.md) — discrepancy details and safe wording
- [`data_lineage.md`](data_lineage.md) — source-to-dashboard flow
- [`data_dictionary.md`](data_dictionary.md) — field definitions
