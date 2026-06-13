# ETL — Extract, Transform, Load

This folder will hold the Python ETL pipeline for the MC3 Summit 2025 Data Hub.

## Current Status

**Phase 1 (scaffold):** This folder is a placeholder. No ETL scripts have been moved here yet.

Existing data processing scripts remain in their original locations:

- `target-repo/data_analysis_simple.py`
- `target-repo/data_analysis.py`
- `target-repo/generate_pdf_visualizations.py`

## Planned Structure

```
etl/
├── extract/          # Read raw CSV, XLSX, and shapefiles from /data/raw
├── transform/        # Clean, join, validate, and aggregate
├── load/             # Write to PostgreSQL and export JSON for /website
├── pipelines/        # Runnable entry points (e.g., run_all.py)
└── requirements.txt  # Python dependencies
```

## Data Sources

Raw source files are already available in `/data/raw/` (copied from `reference-repo/` and `DATASET-20251012T022637Z-1-001/`). Phase 2 will inventory these files before building pipelines.

## Rules

- Never modify files in `/data/raw/` — treat them as read-only sources.
- Label any fallback or placeholder outputs as sample data in metadata.
- Do not fabricate impact metrics; all dashboard numbers must trace to source files.

## Next Step

Phase 2 — Create a data inventory and data dictionary from the existing real files in `/data/raw/`.
