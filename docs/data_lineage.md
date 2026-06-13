# MC3 Data Lineage

This document explains how data flows through the MC3 project — from original source folders to the working dashboard, and the planned future pipeline.

**Principle:** Portfolio credibility depends on tracing every dashboard number back to a real source file. No fabricated metrics.

---

## Lineage Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORIGINAL SOURCE FOLDERS                       │
│  reference-repo/  │  DATASET-.../  │  target-repo/data/processed/ │
└────────┬──────────────────┬─────────────────────┬───────────────┘
         │ copy (Phase 1)   │ copy (Phase 1)      │ copy (Phase 1)
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PORTFOLIO DATA FOLDERS                        │
│  data/raw/  │  data/processed/existing_dashboard_json/          │
│             │  website/data/processed/  ◄── ACTIVE FOR WEBSITE   │
└────────┬────────────────────────────────────────────────────────┘
         │
         │ CURRENT FLOW (pre-ETL)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  target-repo/data_analysis_simple.py  (ad-hoc Python scripts)   │
│  target-repo/generate_pdf_visualizations.py                     │
└────────┬────────────────────────────────────────────────────────┘
         │ generates JSON
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  website/data/processed/*.json  →  dataLoader.js  →  Chart.js  │
└─────────────────────────────────────────────────────────────────┘

         │ FUTURE FLOW (Phase 3+)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  data/raw/  →  etl/  →  data/processed/  →  PostgreSQL          │
│                              ↓                                   │
│                     SQL reporting views                          │
│                              ↓                                   │
│              website/data/processed/ (verified exports)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Original Source Folders (Untouched)

| Folder | Role in lineage | Contents |
|--------|-----------------|----------|
| `reference-repo/` | **Authoritative organized raw data** | ACS, education, economy, social services, geography — governed by `rules.md` |
| `DATASET-20251012T022637Z-1-001/` | **Flat download archive** | Same datasets in unorganized layout; used by `data_analysis_simple.py` |
| `target-repo/data/processed/` | **Original dashboard JSON** | First generation of web-ready chart data |

These folders were **never modified** during Phase 1 or Phase 2.

---

## Copied Portfolio Folders

| Folder | Copied from | Role in lineage |
|--------|-----------|-----------------|
| `data/raw/acs/reference_repo/` | `reference-repo/01_Demographics_ACS/` | Canonical ACS source for future ETL |
| `data/raw/economy/reference_repo/` | `reference-repo/02_Economic_Data/` | Unemployment source |
| `data/raw/education/reference_repo/` | `reference-repo/03_Education_Data/` | School metrics source |
| `data/raw/social_services/reference_repo/` | `reference-repo/04_Social_Services/` | Safety-net program source |
| `data/raw/geography/reference_repo/` | `reference-repo/05_Geographic_Data/` | Spatial boundaries |
| `data/raw/misc/dataset_archive/` | `DATASET-.../DATASET/` | Complete flat archive backup |
| `data/processed/existing_dashboard_json/` | `target-repo/data/processed/` | Archived dashboard JSON |
| `website/data/processed/` | `target-repo/data/processed/` | **Active dashboard data path** |

---

## Current Frontend Flow

### Step 1: Raw / source data exists on disk

Examples:

- `data/raw/misc/dataset_archive/Children in Poverty.csv`
- `data/raw/acs/reference_repo/S1701_Poverty_Status/`
- `data/raw/education/reference_repo/High school graduation rate.xlsx`

### Step 2: Previous analysis scripts transform data

Located in `target-repo/` (not yet moved to `/etl/`):

| Script | Input path (hardcoded) | Output |
|--------|------------------------|--------|
| `data_analysis_simple.py` | `../DATASET-20251012T022637Z-1-001/DATASET` | `data/processed/*.json` |
| `generate_pdf_visualizations.py` | PDF + datasets | `pdf_visualizations_complete.json` |

These scripts were run manually in a prior development phase. They are **not yet reproducible** as a formal pipeline.

### Step 3: Processed JSON stored for the website

13 JSON files in `website/data/processed/`:

- `poverty_trend.json`, `demographics.json`, `education.json`, `economy.json`
- `social-services.json`, `dashboard_summary.json`, `monroe_county_comprehensive.json`
- `pdf_visualizations_complete.json` (primary chart config bundle)
- And 5 additional analysis files

### Step 4: Website charts consume JSON

```
Browser loads index.html
    → main.js initializes MC3DataApp
    → visualizations.js fetches data/processed/pdf_visualizations_complete.json
    → dataLoader.js loads additional JSON as needed
    → Chart.js renders charts
```

**Active data path:** `website/data/processed/` (relative to web root)

---

## What Data Feeds the Working Website Today

| Data type | Location | Status |
|-----------|----------|--------|
| Chart configurations | `website/data/processed/pdf_visualizations_complete.json` | **Active** — primary fetch in `visualizations.js` |
| Topic JSON files | `website/data/processed/*.json` (12 others) | **Active** — loaded by pages and dataLoader |
| Raw CSV/XLSX | `data/raw/` | **Not directly consumed by website** — requires ETL |
| PostgreSQL | N/A | **Does not exist yet** |

The website is a **static JSON consumer**. It does not read raw CSV or XLSX files directly.

---

## What Data Is Only Raw / Source

These files exist but are **not yet wired to the dashboard**:

| Category | Count | Examples |
|----------|-------|----------|
| ACS CSV tables | ~400+ | S1701, S1401, S2301, S1903 |
| Education XLSX | 6+ | Graduation rate, suspensions, enrollment |
| Social services XLSX | 12+ | SNAP, TANF, foster care |
| Unemployment XLSX | 5+ | `STATSIN_asu20–24.xlsx` |
| Shapefiles | 2 tract sets | 2010 and 2024 boundaries |
| Health CSV | 1+ | `Clinical Care.csv` |

This raw data needs **ETL standardization** before it can reliably feed charts or a database.

---

## What Data Needs ETL Standardization Later

| Issue | Current state | ETL goal |
|-------|---------------|----------|
| Duplicate files across folders | 208 duplicate records documented | Pick canonical path per dataset |
| Inconsistent formats | CSV, XLSX, multi-header ACS | Normalize to clean tables |
| Hardcoded script paths | Points to `DATASET-.../` outside `/data/raw/` | Read from `/data/raw/` only |
| Unverified dashboard metrics | `1735 children impacted`, `8.3pp` reduction | Trace or flag in metadata |
| No run metadata | JSON lacks source version/timestamp | Add lineage manifest per export |
| XLSX columns unreadable without openpyxl | Sheet names only | Parse and document all columns |
| Two tract boundary vintages | 2010 vs 2024 shapefiles | Document spatial join rules |

---

## Future Planned Flow

```
Existing Raw Data
        ↓
Python ETL Pipeline          (/etl/extract, transform, load)
        ↓
Cleaned CSV / JSON Outputs   (/data/processed/ with manifests)
        ↓
PostgreSQL Tables            (/database/schema)
        ↓
SQL Reporting Views          (/database/views)
        ↓
Website Dashboard            (/website/ — verified JSON exports)
        ↓
Policy Recommendations       (/docs/ — methodology + citations)
```

Each layer will add:

1. **Validation** — row counts, schema checks, Monroe County FIPS filter
2. **Lineage metadata** — `source_file`, `extracted_at`, `row_hash`
3. **Sample data flags** — `"sample_data": true` when fallback is used
4. **Reproducibility** — `python etl/pipelines/run_all.py` regenerates all outputs

---

## Why Documenting Lineage Matters for Portfolio Credibility

| Reason | Explanation |
|--------|-------------|
| **Traceability** | Interviewers can follow a KPI from chart → JSON → ETL → raw CSV row |
| **Trust** | Shows you do not fabricate impact numbers — critical for government data work |
| **Reproducibility** | Proves the pipeline can be re-run when new ACS years are released |
| **Governance** | Aligns with `reference-repo/rules.md` — never modify originals |
| **Debugging** | When a chart looks wrong, lineage shows exactly which source file to check |
| **Professional practice** | Mirrors real data engineering: sources → staging → warehouse → BI tool |

---

## Lineage Records from Phase 2 Inventory

| Output | Path | Purpose |
|--------|------|---------|
| Full file catalog | `data/processed/data_inventory.csv` | 1,134 files with paths, types, topics |
| JSON inventory | `data/processed/data_inventory.json` | Machine-readable with summary stats |
| Field definitions | `docs/data_dictionary.md` | Confirmed vs. inferred fields |
| This document | `docs/data_lineage.md` | End-to-end flow explanation |

Regenerate inventory:

```bash
cd etl
python data_inventory.py
```

---

## Related Documentation

- [`data_inventory.md`](data_inventory.md) — file catalog and duplicate map
- [`data_dictionary.md`](data_dictionary.md) — field-level definitions
- [`architecture.md`](architecture.md) — system architecture diagram
- [`project_audit.md`](project_audit.md) — initial workspace audit
