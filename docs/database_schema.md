# MC3 PostgreSQL Database Schema

**Phase:** 4 — schema and reporting views from verified ETL output  
**Verified metric:** 6.2 percentage-point child poverty reduction (2014: 20.2% → 2024: 14.0%)

---

## Why PostgreSQL Was Added

The MC3 project began with static JSON files powering the website. PostgreSQL adds:

- **Structured storage** for cleaned ETL outputs
- **SQL reporting views** for dashboards (Chart.js, Tableau, Power BI)
- **Reproducible analytics** independent of hand-edited JSON
- **Portfolio credibility** — demonstrates SQL, schema design, and data engineering

PostgreSQL is **optional**. The website and ETL pipeline complete successfully without it.

---

## Cleaned CSV Inspection

Source: `data/processed/children_in_poverty_clean.csv`

### Column inventory

| Column | Example value | Category |
|--------|---------------|----------|
| `county_id` | `05000US18105` | **Source** — Census GEO ID |
| `county` | `Monroe County, IN` | **Source** — raw county label (legacy) |
| `year` | `2014` | **Source** |
| `children_in_poverty` | `0.202` | **Source** — rate as proportion (0–1) |
| `children_in_poverty_ci_high` | `0.243` | **Source** — CI proportion |
| `children_in_poverty_ci_low` | `0.161` | **Source** — CI proportion |
| `county_fips` | `18105` | **Derived** — extracted from `county_id` |
| `county_name` | `Monroe County, IN` | **Derived** — standardized from `county` |
| `children_in_poverty_rate_pct` | `20.2` | **Derived** — proportion × 100 |
| `data_topic` | `demographics` | **ETL lineage** |
| `indicator_name` | `children_in_poverty` | **ETL lineage** |
| `source_file` | `data/raw/misc/dataset_archive/Children in Poverty.csv` | **ETL lineage** |
| `etl_processed_at` | `2026-06-13T19:19:29+00:00` | **ETL lineage** |
| `value_type` | `rate_proportion` | **ETL lineage** |
| `verified` | `True` | **ETL lineage** |

---

## Tables Created

### `mc3.data_sources`

Registry of raw files copied into `/data/raw/`.

| Column | Type | Notes |
|--------|------|-------|
| `source_id` | SERIAL PK | Auto-increment |
| `source_name` | TEXT | e.g., `Children in Poverty.csv` |
| `source_file` | TEXT | Portfolio path under `/data/raw/` |
| `source_type` | TEXT | `csv`, `xlsx`, etc. |
| `source_notes` | TEXT | Includes verified 6.2pp note |
| `created_at` | TIMESTAMP | Default `CURRENT_TIMESTAMP` |

### `mc3.children_in_poverty`

Stores verified poverty trend rows.

| Column | Type | Maps from CSV |
|--------|------|---------------|
| `poverty_id` | SERIAL PK | — |
| `county_id` | TEXT | `county_id` |
| `county_fips` | TEXT NOT NULL | `county_fips` |
| `county_name` | TEXT NOT NULL | `county_name` |
| `year` | INTEGER NOT NULL | `year` |
| `children_in_poverty_proportion` | NUMERIC | `children_in_poverty` |
| `children_in_poverty_rate` | NUMERIC (0–100) | `children_in_poverty_rate_pct` |
| `ci_high` | NUMERIC (0–100) | `children_in_poverty_ci_high` × 100 |
| `ci_low` | NUMERIC (0–100) | `children_in_poverty_ci_low` × 100 |
| `data_topic` | TEXT | `data_topic` |
| `indicator_name` | TEXT | `indicator_name` |
| `source_file` | TEXT | `source_file` |
| `etl_processed_at` | TIMESTAMP | `etl_processed_at` |
| `value_type` | TEXT | `value_type` |
| `verified` | BOOLEAN | `verified` |
| `source_id` | INTEGER FK | Links to `mc3.data_sources` |

**Constraints:** year 1900–2100; rate and CI between 0 and 100; unique `(county_fips, year, indicator_name)`.

**Indexes:** `county_fips`, `year`, `indicator_name`, `(county_fips, year)`.

---

## Views Created

### `mc3.v_child_poverty_trend`

Returns year-by-year rates for charting:

```
county_fips, county_name, year, children_in_poverty_rate, ci_high, ci_low, indicator_name, source_file
```

**Use for:** Chart.js line charts, Tableau, Power BI, CSV export.

### `mc3.v_child_poverty_summary`

Calculates verified aggregates:

| Output | Verified value (Monroe County) |
|--------|------------------------------|
| `start_year` / `start_rate` | 2014 / 20.2% |
| `end_year` / `end_rate` | 2024 / 14.0% |
| `percentage_point_change` | **6.2** (20.2 − 14.0) |
| `relative_percent_change` | -30.69% |
| `min_rate` / `max_rate` | 13.7% / 20.2% |
| `number_of_years` | 11 |

### `mc3.v_dashboard_metric_cards`

Safe KPI cards — uses **"Verified Poverty Rate Improvement"**, not unverified "Children Impacted":

- Latest Child Poverty Rate
- Verified Poverty Rate Improvement (6.2 percentage points)
- Reporting Years Covered
- Minimum Poverty Rate Observed

---

## How Views Support Dashboards

| Tool | View to use |
|------|-------------|
| Chart.js (future API) | `mc3.v_child_poverty_trend` |
| Homepage KPI cards | `mc3.v_dashboard_metric_cards` |
| Policy summary slide | `mc3.v_child_poverty_summary` |
| SQL portfolio demo | `database/queries/example_poverty_queries.sql` |

This goes beyond static JSON because views **recalculate** metrics from stored data — any row change automatically updates summaries.

---

## Connection to ETL Output

```
Children in Poverty.csv (data/raw/)
        ↓
etl/automated_pipeline.py
        ↓
data/processed/children_in_poverty_clean.csv
        ↓
load_to_postgres()  [optional, if DATABASE_URL set]
        ↓
mc3.children_in_poverty
        ↓
mc3.v_child_poverty_trend / summary / metric_cards
```

ETL `load_to_postgres()`:

- Skips if `DATABASE_URL` is missing
- Skips if `mc3` schema does not exist (prompts to run SQL files first)
- Deletes existing `children_in_poverty` rows for idempotent reload
- Inserts mapped columns into `mc3.children_in_poverty`

---

## Metric Validation

| Claim | Status |
|-------|--------|
| 6.2 percentage-point reduction | **Verified** — ETL + SQL views |
| 20.2% → 14.0% trend | **Verified** — matches raw CSV |
| 8.3 percentage-point reduction | **Rejected** — `dashboard_summary.json` only; no source |
| 1,735 children impacted | **Unverified** — not in poverty CSV |

The schema and views use **6.2**, not **8.3**.

---

## Commands

### Start PostgreSQL

```bash
docker compose up -d
```

### Set database URL

```bash
export DATABASE_URL=postgresql://mc3_user:mc3_password@localhost:5432/mc3
```

### Run SQL schema

```bash
psql "$DATABASE_URL" -f database/schema/001_initial_schema.sql
psql "$DATABASE_URL" -f database/views/001_poverty_views.sql
```

### Run ETL (optional DB load)

```bash
cd etl
python automated_pipeline.py
```

### Run example queries

```bash
psql "$DATABASE_URL" -f database/queries/example_poverty_queries.sql
```

---

## Resume Bullet (Safe)

> Designed a PostgreSQL schema and dashboard-ready reporting views to validate and serve Monroe County child poverty trend indicators from a reproducible Python ETL pipeline.

---

## Related Documentation

- [`database/README.md`](../database/README.md)
- [`etl_pipeline.md`](etl_pipeline.md)
- [`metric_validation.md`](metric_validation.md)
- [`architecture.md`](architecture.md)
