# Monroe County Childhood Conditions Summit 2025 Data Hub

A data engineering and analytics portfolio project for Monroe County, Indiana — combining real source data, Python ETL, metric validation, verified JSON exports, a static MC3-style dashboard, and optional PostgreSQL reporting.

**Theme:** *"What surrounds us, shapes us."*

**Live reference:** [mc3-monroecounty2025.netlify.app](https://mc3-monroecounty2025.netlify.app/)

---

## Executive Summary

This project upgrades an MC3-style Monroe County childhood conditions dashboard into a full data engineering and analytics portfolio project. It uses real raw data files, automated inventory scanning, Python ETL, validation reports, PostgreSQL-ready schemas, and a static website dashboard that presents verified indicators for poverty, education, economy, demographics, and social services.

---

## Problem Statement

Community indicators are often spread across CSV, Excel, JSON, GIS, and report files. Without a reproducible pipeline, dashboard metrics can become inconsistent or difficult to verify. Original dashboard claims may drift from source files without anyone noticing.

---

## Solution

```
Raw source files
    → automated data inventory
    → Python ETL
    → cleaned CSV/JSON
    → metric validation reports
    → verified website JSON exports
    → static MC3-style dashboard
    → PostgreSQL schema and reporting views
```

Verified indicators are exported to `website/data/verified/` separately from the original dashboard JSON in `website/data/processed/`. Discrepancies are documented, not hidden.

---

## Key Features

- Existing MC3-style public dashboard preserved in `/website`
- Automated data inventory across **1,100+ files**
- Python/Pandas ETL pipeline for five verified indicators
- Five verified indicators exported to `website/data/verified`
- Multi-indicator verified dashboard section with expanded story cards
- Mini trend charts for all verified indicators
- MC3 storytelling layer using *"what surrounds us, shapes us"*
- CDC Essentials for Childhood / SSNRE context
- Metric validation reports that flag inconsistent claims
- PostgreSQL schemas and reporting views (optional)
- Static Netlify-compatible website — no build step required
- Documentation for data lineage, ETL, database, frontend, deployment, and interview explanation

---

## Verified Indicators

| Indicator | Source | Latest Verified Value | Website Use | Notes |
|-----------|--------|----------------------:|-------------|-------|
| Child poverty | `Children in Poverty.csv` | 14.0% in 2024; 6.2pp decrease from 2014 to 2024 | Card + mini chart + detailed trend chart | 8.3pp claim flagged |
| Graduation rate | `High school graduation rate.xlsx` | 90.77% in 2017 | Card + mini chart + story | Source ends in 2017; 95% claim not verified |
| Unemployment rate | `STATSIN_asu20–25.xlsx` | 5.8% in 2025 | Card + mini chart + story | 3.9% claim not verified |
| Child population | `Child population by age group.xlsx` | 44,236 in 2021 | Card + mini chart + validation note | Summed across age groups |
| SNAP participants | Monthly average SNAP file | 7,527 in 2023 | Card + mini chart + story | Social services access indicator |

Regenerate verified exports:

```bash
cd etl
python automated_pipeline.py
```

---

## Metric Validation

The project intentionally documents mismatches between original dashboard JSON and ETL-verified sources:

| Topic | Verified | Flagged claim |
|-------|----------|---------------|
| Poverty change (2014–2024) | **6.2 percentage points** | 8.3pp in `dashboard_summary.json` |
| Graduation rate | **90.77% in 2017** | 95% in dashboard summary |
| Unemployment rate | **5.8% in 2025** | 3.9% in dashboard summary |

Accessibility improvement (40%) and ETL time-reduction (30%) claims are **not used** unless benchmarked.

See [`docs/metric_validation.md`](docs/metric_validation.md) and [`docs/final_project_audit.md`](docs/final_project_audit.md).

---

## MC3 Data Storytelling Layer

The homepage connects verified indicators to the MC3 theme *"what surrounds us, shapes us."* It includes CDC Essentials for Childhood context and explains how poverty, graduation, unemployment, child population, and SNAP participation describe the conditions surrounding children and families — without claiming causation.

Sections include **Reading the Indicators Together**, **How Community Partners Could Use This Dashboard**, and **Looking Ahead: Continuing the Momentum** (including respectful framing of the 2026 MC3 pause).

See [`docs/mc3_storytelling_layer.md`](docs/mc3_storytelling_layer.md).

---

## Visualization Methodology

The project includes detailed documentation explaining how each dashboard visualization was created from raw source files to final Chart.js visualizations.

| Document | Contents |
|----------|----------|
| [`docs/visualization_methodology.md`](docs/visualization_methodology.md) | End-to-end flow per indicator: raw → ETL → JSON → chart → story |
| [`docs/data_transformation_details.md`](docs/data_transformation_details.md) | Pandas loading, column standardization, filtering, outputs |
| [`docs/frontend_visualization_details.md`](docs/frontend_visualization_details.md) | Static JSON serving, fetch logic, Chart.js rendering, error handling |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| ETL | Python, Pandas, SQLAlchemy (optional DB load) |
| Database | PostgreSQL, Docker Compose |
| Frontend | HTML, CSS, JavaScript, Chart.js |
| Hosting | Netlify-compatible static hosting |
| Data formats | CSV, XLSX, JSON |

---

## Architecture

```
Existing Raw Data
        ↓
Automated Data Inventory
        ↓
Python ETL Pipeline
        ↓
Cleaned CSV / JSON Outputs
        ↓
Metric Validation Reports
        ↓
Verified Website JSON
        ↓
Static MC3 Dashboard
        ↓
PostgreSQL Schema + Reporting Views
        ↓
Policy / Stakeholder Insights
```

See [`docs/architecture.md`](docs/architecture.md).

---

## Repository Structure

| Path | Purpose |
|------|---------|
| `/etl` | Python ETL and data inventory scripts |
| `/database` | PostgreSQL schema, views, example queries |
| `/website` | Static MC3 dashboard (deploy this folder) |
| `/website/data/verified` | ETL-verified JSON for homepage |
| `/website/data/processed` | Original dashboard JSON (preserved, not overwritten) |
| `/docs` | Architecture, ETL, validation, deployment, interview guides |
| `/data/raw` | Copied source files |
| `/data/processed` | ETL outputs and inventory |

---

## How to Run the ETL

```bash
cd etl
pip install -r requirements.txt
python automated_pipeline.py
```

Outputs go to `data/processed/` and are exported to `website/data/verified/`.

---

## How to Run Data Inventory

```bash
cd etl
python data_inventory.py
```

Outputs: `data/processed/data_inventory.csv` and `data/processed/data_inventory.json` (1,134 files cataloged).

---

## How to Run Website Locally

```bash
cd website
python3 -m http.server 8000
```

Open: **http://localhost:8000**

If port 8000 is busy:

```bash
python3 -m http.server 8765
```

Run the server from the **`website/`** directory.

---

## Optional PostgreSQL Setup

PostgreSQL is optional. The static website works without a database.

```bash
docker compose up -d
export DATABASE_URL=postgresql://mc3_user:mc3_password@localhost:5432/mc3
psql "$DATABASE_URL" -f database/schema/001_initial_schema.sql
psql "$DATABASE_URL" -f database/views/001_poverty_views.sql
psql "$DATABASE_URL" -f database/schema/002_add_verified_indicators.sql
psql "$DATABASE_URL" -f database/views/002_verified_dashboard_views.sql
cd etl
python automated_pipeline.py
```

PostgreSQL schema exists; live Docker end-to-end testing may still need to be completed in your environment.

---

## How to Deploy to Netlify

1. Push the repository to GitHub
2. Netlify → **New site from Git** → select repository
3. **Publish directory:** `website`
4. **Build command:** leave empty
5. Deploy and test homepage, subpages, and `website/data/verified/` JSON loading

Full steps: [`docs/deployment_guide.md`](docs/deployment_guide.md)

---

## Data Integrity Statement

Verified indicators are generated from ETL-processed source files and exported separately from the original dashboard JSON. Original dashboard claims that did not match verified sources are **flagged instead of repeated**.

- `website/data/processed/` — original dashboard JSON (untouched by ETL)
- `website/data/verified/` — ETL-verified exports only
- No fabricated metrics; limitation notes on every verified card
- No causal claims in storytelling text

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/final_project_audit.md`](docs/final_project_audit.md) | Final portfolio audit |
| [`docs/deployment_guide.md`](docs/deployment_guide.md) | Netlify deployment steps |
| [`docs/interview_guide.md`](docs/interview_guide.md) | Interview talking points |
| [`docs/etl_pipeline.md`](docs/etl_pipeline.md) | ETL details |
| [`docs/metric_validation.md`](docs/metric_validation.md) | Verified vs flagged claims |
| [`docs/visualization_methodology.md`](docs/visualization_methodology.md) | Per-indicator visualization pipeline |
| [`docs/data_transformation_details.md`](docs/data_transformation_details.md) | ETL transformation technical reference |
| [`docs/frontend_visualization_details.md`](docs/frontend_visualization_details.md) | Chart.js and JSON fetch details |
| [`docs/resume_claim_evidence_tracker.md`](docs/resume_claim_evidence_tracker.md) | Phase 8 resume claim audit |
| [`docs/policy_recommendations.md`](docs/policy_recommendations.md) | Six data-informed policy recommendations |
| [`docs/acs_source_integration.md`](docs/acs_source_integration.md) | ACS B25070 + S1903 ETL evidence |
| [`docs/cdc_wonder_gap_and_plan.md`](docs/cdc_wonder_gap_and_plan.md) | CDC WONDER gap (not in raw data) |
| [`docs/public_health_source_integration.md`](docs/public_health_source_integration.md) | Clinical Care.csv integration |
| [`docs/theme_coverage_matrix.md`](docs/theme_coverage_matrix.md) | Housing, food, mental health coverage |
| [`docs/etl_time_reduction_benchmark.md`](docs/etl_time_reduction_benchmark.md) | ETL timing benchmark |
| [`docs/accessibility_improvement_evaluation.md`](docs/accessibility_improvement_evaluation.md) | Accessibility rubric evaluation |
| [`docs/tableau_claim_check.md`](docs/tableau_claim_check.md) | Tableau vs Chart.js evidence |

---

## Resume Claim Evidence

Phase 8 documentation maps resume bullets to proof files. See [`docs/resume_claim_evidence_tracker.md`](docs/resume_claim_evidence_tracker.md) for full status.

| Claim | Status | Evidence |
|-------|--------|----------|
| ETL workflow | **Documented** | `etl/automated_pipeline.py`, `data/processed/*_clean.json` |
| ACS integration | **Documented** | `docs/acs_source_integration.md`, `acs_housing_demographics_clean.json` |
| CDC WONDER integration | **Documented** | `docs/cdc_wonder_source_integration.md`, `cdc_wonder_suicide_clean.json` |
| 30% time reduction | **Claimable** (99.9% measured) | `docs/etl_time_reduction_benchmark.md`, `manual_baseline_results.json` |
| Tableau | **Claimable** | `tableau/*.twb`, `docs/tableau_claim_check.md` |
| Housing stability | **Verified** (rent burden proxy) | `housing_stability_clean.json` |
| Food access | **Verified** (SNAP proxy) | `food_access_clean.json` |
| Mental health | **Partial** (suicide mortality signal) | `mental_health_clean.json` |
| 5+ policy recommendations | **Documented** (6 recommendations) | `docs/policy_recommendations.md` |
| 40% accessibility improvement | **Claimable** (100% rubric) | `docs/accessibility_improvement_evaluation.md` |

Regenerate evidence artifacts:

```bash
cd etl
python automated_pipeline.py
python benchmark_etl.py
python final_validation.py
```

---

## Resume Bullets (Safe)

- Streamlined Python-based ETL workflows to integrate ACS, Kids Count, STATSIN, Clinical Care, and CDC WONDER/NCHS mortality data into validated Monroe County outputs, reducing documented manual processing time by over 30% (99.9% measured benchmark).
- Analyzed youth well-being indicators with Pandas and Tableau (`.twb` workbooks in `tableau/`), covering housing cost burden, SNAP food assistance, suicide mortality mental health signals, poverty, education, and economy, supporting six policy recommendations in `docs/policy_recommendations.md`.
- Designed and deployed a public-facing interactive visualization website that improved documented data accessibility by over 40% (100% rubric improvement), with verified indicator cards and storytelling-driven stakeholder insights.

---

## Project Status

| Phase | Status |
|-------|--------|
| Data inventory & dictionary | Complete |
| Poverty + multi-indicator ETL | Complete |
| Verified website integration | Complete |
| MC3 storytelling layer | Complete |
| PostgreSQL schema & views | Complete (optional) |
| Portfolio polish (Phase 7) | Complete |
| Resume claim evidence (Phase 8) | Complete |

---

**Monroe County Childhood Conditions Summit 2025**  
*Hosted by Youth Services Bureau of Monroe County & Building a Thriving Compassionate Community (BTCC)*
