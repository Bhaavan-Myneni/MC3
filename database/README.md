# Database — PostgreSQL Layer

PostgreSQL schema, views, and queries for the MC3 Summit 2025 Data Hub.

**Phase 4 status:** Schema and reporting views implemented for verified child poverty ETL output.

---

## Structure

```
database/
├── schema/
│   └── 001_initial_schema.sql    # mc3 schema, tables, seed data
├── views/
│   └── 001_poverty_views.sql     # Dashboard-ready reporting views
├── queries/
│   └── example_poverty_queries.sql
└── README.md                     # This file
```

---

## Tables

| Table | Purpose |
|-------|---------|
| `mc3.data_sources` | Registry of raw files from `/data/raw/` |
| `mc3.children_in_poverty` | Verified poverty trend (2014–2024, FIPS 18105) |

Column mapping from `children_in_poverty_clean.csv`:

| CSV column | DB column | Type |
|------------|-----------|------|
| `county_id` | `county_id` | source |
| `county_fips` | `county_fips` | derived |
| `county_name` | `county_name` | source |
| `year` | `year` | source |
| `children_in_poverty` | `children_in_poverty_proportion` | source (0–1) |
| `children_in_poverty_rate_pct` | `children_in_poverty_rate` | derived (0–100) |
| `children_in_poverty_ci_high` | `ci_high` | source → percent |
| `children_in_poverty_ci_low` | `ci_low` | source → percent |
| `data_topic`, `indicator_name`, `source_file`, `etl_processed_at` | lineage | ETL |
| `value_type`, `verified` | lineage | ETL |

---

## Views

| View | Purpose |
|------|---------|
| `mc3.v_child_poverty_trend` | Year-by-year rates for charts |
| `mc3.v_child_poverty_summary` | Verified 6.2pp change and aggregates |
| `mc3.v_dashboard_metric_cards` | Safe KPI cards (no unverified impact counts) |

---

## Quick Start

```bash
# 1. Start PostgreSQL (optional)
docker compose up -d

# 2. Set connection URL
export DATABASE_URL=postgresql://mc3_user:mc3_password@localhost:5432/mc3

# 3. Apply schema and views
psql "$DATABASE_URL" -f database/schema/001_initial_schema.sql
psql "$DATABASE_URL" -f database/views/001_poverty_views.sql

# 4. Run ETL (loads into mc3.children_in_poverty when schema exists)
cd etl
python automated_pipeline.py

# 5. Run example queries
psql "$DATABASE_URL" -f database/queries/example_poverty_queries.sql
```

---

## Rules

- All data traces to `/data/raw/` source files via `mc3.data_sources`
- Verified poverty change: **6.2 percentage points** (not 8.3 from `dashboard_summary.json`)
- PostgreSQL is **optional** — website and ETL work without it
- Do not fabricate metrics

---

## Documentation

- [`docs/database_schema.md`](../docs/database_schema.md) — full schema guide
- [`docs/metric_validation.md`](../docs/metric_validation.md) — verified vs unverified metrics
- [`docs/etl_pipeline.md`](../docs/etl_pipeline.md) — ETL pipeline details
