# Data — Raw Sources and Processed Outputs

This project **already includes real data** from the Monroe County Childhood Conditions Summit 2025 workspace. Phase 1 copied existing files here — no fake sample data was created.

## Folder Layout

```
data/
├── raw/                              # Copied source files (read-only)
│   ├── acs/reference_repo/           # ACS demographics from reference-repo
│   ├── economy/reference_repo/       # Unemployment and economic indicators
│   ├── education/reference_repo/     # School metrics (XLSX)
│   ├── social_services/reference_repo/  # SNAP, TANF, foster care, etc.
│   ├── geography/reference_repo/     # Census tract shapefiles (2010, 2024)
│   └── misc/dataset_archive/         # Flat DATASET download (all original files)
└── processed/
    └── existing_dashboard_json/      # Dashboard-ready JSON from target-repo
```

## Raw Data (`/data/raw`)

Source files were **copied** (not moved) from two original locations:

| Original location | Copied to |
|-------------------|-----------|
| `reference-repo/01_Demographics_ACS/` | `data/raw/acs/reference_repo/` |
| `reference-repo/02_Economic_Data/` | `data/raw/economy/reference_repo/` |
| `reference-repo/03_Education_Data/` | `data/raw/education/reference_repo/` |
| `reference-repo/04_Social_Services/` | `data/raw/social_services/reference_repo/` |
| `reference-repo/05_Geographic_Data/` | `data/raw/geography/reference_repo/` |
| `DATASET-20251012T022637Z-1-001/DATASET/` | `data/raw/misc/dataset_archive/` |

**Important:** Original files in `reference-repo/` and `DATASET-20251012T022637Z-1-001/` are untouched.

### Data types

- **CSV** — ACS tables, poverty rates, clinical care metrics
- **XLSX** — Education outcomes, social services participation
- **Shapefiles** — Census tract boundaries for Monroe County, Indiana

## Processed Data (`/data/processed`)

The folder `processed/existing_dashboard_json/` contains JSON files copied from `target-repo/data/processed/`. These files power the current website charts and KPI cards.

Examples:

- `demographics.json`
- `education.json`
- `economy.json`
- `poverty_trend.json`
- `dashboard_summary.json`

These files were **not modified** during the copy.

## Future ETL Outputs

When `/etl` pipelines are built (Phase 2+), they will:

1. Read from `/data/raw/` (never write back to raw)
2. Produce cleaned CSV/JSON in `/data/processed/` with run metadata
3. Load structured tables into PostgreSQL (`/database`)
4. Export verified JSON to `website/data/processed/` for the dashboard

## Data Integrity

- No fake sample CSV or JSON files were created in Phase 1.
- All files here are copies of existing workspace data.
- Future pipelines must label any sample or fallback data explicitly in output metadata.
- Original data must never be modified — follow `reference-repo/rules.md`.

## Next Step

Phase 2 — Create a data inventory and data dictionary documenting every file, its columns, source, and year coverage.
