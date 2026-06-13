# MC3 Portfolio Project Audit

**Date:** June 13, 2026  
**Reference site:** [mc3-monroecounty2025.netlify.app](https://mc3-monroecounty2025.netlify.app/)  
**Workspace:** `/Users/bhaavanmyneni/Downloads/MC3`

---

## Executive Summary

This workspace is **not an empty project**. It already contains a working MC3 data portal website, raw Monroe County datasets, and supporting documentation — but the files are spread across multiple folders rather than organized as a single professional portfolio repository.

The live Netlify site matches the code in `target-repo/`. The portfolio upgrade will **reorganize and extend** what exists, not start from scratch.

---

## 1. Current Project Structure

### Workspace root (`MC3/`)

```
MC3/
├── docs/                              # NEW — created for this audit (root-level docs)
├── target-repo/                       # PRIMARY — deployed website (≈ Netlify site)
├── reference-repo/                    # SOURCE DATA + earlier app scaffold
├── DATASET-20251012T022637Z-1-001/    # Extracted raw dataset archive
├── DATASET-20251012T022637Z-1-001.zip # Raw data (3 duplicate copies)
└── Data-Driven Visualizations for Monroe County Childhood Conditions Summit.pdf
```

**Important:** There is no root-level `README.md`, no unified `data/`, `etl/`, `database/`, or `website/` folder yet. The workspace is a **collection of related assets**, not a single repo layout.

---

### `target-repo/` — Existing Website (Primary Frontend)

This is a **complete, deployable static website** and the closest match to the public Netlify portal.

| Area | Contents |
|------|----------|
| **Entry point** | `index.html` — homepage with disclaimer banner, KPI cards, mission section, Chart.js charts |
| **Pages** | `pages/demographics.html`, `education.html`, `economy.html`, `social-services.html`, `correlations.html` |
| **Styles** | `css/style.css` (Monroe County branding: navy `#003366`, gold `#FFB500`), `css/visualizations.css` |
| **JavaScript** | `js/main.js`, `dataLoader.js`, `visualizations.js`, `narratives.js` |
| **Processed data** | `data/processed/*.json` (13 JSON files for charts and summaries) |
| **Assets** | `assets/images/ysb-logo.svg` |
| **Python scripts** | `data_analysis.py`, `data_analysis_simple.py`, `generate_pdf_visualizations.py` (at repo root, not in `/etl`) |
| **Docs** | `docs/setup.md`, plus many deployment guides |
| **Deploy config** | `package.json`, `vercel.json`, `build.sh`, `deploy.sh` |
| **Git** | Own `.git` history (shallow clone from GitHub) |

**Tech stack:** Vanilla HTML/CSS/JavaScript, Chart.js (CDN), Font Awesome, Python 3 for offline JSON generation. No React, no build step, no database.

**How it runs locally:**

```bash
cd target-repo
python3 -m http.server 8000
# or: npm start
```

---

### `reference-repo/` — Raw Data Archive + Earlier App

Organized source data used by the summit team, following `rules.md` (never modify originals).

| Folder | Purpose |
|--------|---------|
| `01_Demographics_ACS/` | Census ACS tables (poverty, income, enrollment, SNAP, employment) |
| `02_Economic_Data/` | Unemployment estimates by census tract |
| `03_Education_Data/` | Graduation rates, enrollment, suspensions, lunch programs |
| `04_Social_Services/` | Foster care, TANF, SNAP, juvenile cases, WIC, etc. |
| `05_Geographic_Data/` | Census tract shapefiles (2010 and 2024) |
| `MC3_Summit_2025_App/` | Earlier copy of the web app (similar structure to `target-repo`) |
| `css/`, `js/` | Shared visualization assets at repo root |

**Documentation:** `README.md`, `README_Data_Organization.md`, `README_MC3_Summit_2025.md`, `README_EDUCATION.md`, `README_ECONOMIC_ANALYSIS.md`, `rules.md`

---

### `DATASET-20251012T022637Z-1-001/DATASET/` — Flat Raw Data Dump

Unzipped archive with ~35+ files: CSV, XLSX, and shapefile folders. Examples:

- `Children in Poverty.csv`
- `S1401School Enrollment/`, `S1701Poverty Status in the Past 12 Months/`
- `Clinical Care.csv`
- `Monthly average number of persons issued food stamps (SNAP).xlsx`
- Census tract shapefiles

This is the path referenced by `target-repo/data_analysis_simple.py` (`../DATASET-20251012T022637Z-1-001/DATASET`).

---

## 2. Is This Empty or an Existing Website?

| Question | Answer |
|----------|--------|
| Empty project? | **No** |
| Existing website? | **Yes** — `target-repo/` is a working portal |
| Matches Netlify reference? | **Yes** — same title, disclaimer, nav, Monroe County branding |
| Production-ready data pipeline? | **Partial** — Python scripts generate JSON; no formal ETL or database |
| Portfolio-ready structure? | **No** — needs reorganization into standard folders |

---

## 3. Current Frontend Structure (Summary)

```
target-repo/
├── index.html                 # Landing page + executive KPIs
├── pages/                     # 5 topic pages (demographics most complete)
├── css/
│   ├── style.css              # Layout, header, Monroe County theme
│   └── visualizations.css     # Chart containers, cards, trends
├── js/
│   ├── main.js                # MC3DataApp controller (perf, a11y, init)
│   ├── dataLoader.js          # Loads/parses CSV, JSON, Excel, GeoJSON
│   ├── visualizations.js      # Chart.js chart builders
│   └── narratives.js          # Story text and insight blocks
├── data/processed/            # Web-ready JSON (fed to charts)
└── assets/images/             # YSB / summit branding
```

**Data flow today:**

```
Raw CSV/XLSX (external DATASET folder or reference-repo)
        ↓
data_analysis_simple.py  (manual, ad-hoc Python)
        ↓
data/processed/*.json
        ↓
dataLoader.js + visualizations.js  (browser)
        ↓
Charts on index.html + pages/*.html
```

**Gaps in the frontend:**

- No API layer — frontend reads static JSON only
- Some pages are templates with less content than demographics
- Processed JSON includes narrative metrics that should be verified against source data or labeled as sample/derived
- No automated refresh when raw data changes

---

## 4. What Is Missing (vs. Target Portfolio Layout)

| Target folder | Current state | Gap |
|---------------|---------------|-----|
| `/etl` | Python scripts live in `target-repo/` root | No modular ETL package, no `requirements.txt`, no pipeline orchestration |
| `/database` | Does not exist | No PostgreSQL, no SQL schema, no migrations |
| `/website` | Frontend is `target-repo/` itself | Not separated from data/scripts; no clean deploy boundary |
| `/docs` | Exists inside `target-repo/` only | No root-level architecture, ETL, or database docs |
| `/data/raw` | Split across `reference-repo/`, `DATASET-.../`, zip files | No single canonical raw data location |
| `/data/processed` | Exists in `target-repo/data/processed/` | Not at workspace root; no lineage metadata |
| `/README.md` | Only inside sub-repos | No top-level portfolio README |

**Also missing for a professional data analytics portfolio:**

- `requirements.txt` / `pyproject.toml` for reproducible Python environment
- `.env.example` for database connection settings
- SQL scripts (`schema.sql`, `views.sql`, seed scripts)
- ETL job logging, idempotency, and data validation tests
- Docker Compose for local PostgreSQL
- CI workflow (lint, test ETL, validate JSON schema)
- Clear **sample vs. verified** data labeling in outputs
- Single git repo at workspace root (currently two nested `.git` folders)

---

## 5. What Will Be Added (Planned Upgrade)

The upgrade **preserves all working files** and reorganizes into a portfolio-standard layout:

```
MC3/                              # Unified portfolio root
├── README.md                     # Portfolio overview, quick start, skills demonstrated
├── etl/
│   ├── extract/                  # Read raw CSV/XLSX/shapefiles
│   ├── transform/                # Clean, join, aggregate, validate
│   ├── load/                     # Write to PostgreSQL + export JSON for website
│   ├── pipelines/                # Runnable jobs (e.g., run_all.py)
│   └── requirements.txt
├── database/
│   ├── schema/                   # CREATE TABLE scripts
│   ├── migrations/               # Versioned schema changes
│   ├── views/                    # Analyst-friendly SQL views
│   └── seeds/                    # Optional sample seed data (clearly labeled)
├── website/                      # Migrated from target-repo (unchanged behavior)
│   ├── index.html
│   ├── pages/, css/, js/, assets/
│   └── data/processed/           # JSON exported from ETL (or symlinked)
├── data/
│   ├── raw/                      # Canonical copy of source files (read-only)
│   └── processed/                # ETL outputs + export manifests
└── docs/
    ├── project_audit.md          # This file
    ├── architecture.md           # System diagram, data flow
    ├── etl_guide.md              # How to run pipelines
    ├── database_guide.md         # Schema, queries, local setup
    └── data_dictionary.md        # Field definitions and sources
```

### Migration principles

1. **Copy, don't delete** — `target-repo/` and `reference-repo/` stay intact until migration is verified.
2. **No fabricated metrics** — dashboard numbers must trace to raw sources or be tagged `sample_data: true` in JSON metadata.
3. **Website parity** — `website/` should look and behave like the Netlify reference after migration.
4. **Incremental rollout** — reorganize first, then add PostgreSQL, then wire ETL → DB → JSON export.

---

## 6. Why Each Folder Is Needed

### `/etl` — Extract, Transform, Load

**Why:** Raw Monroe County data arrives as CSV, XLSX, and shapefiles in inconsistent formats. A dedicated ETL layer shows you can build repeatable pipelines — not one-off scripts.

**Portfolio proof:**
- Python data engineering (pandas, pathlib, logging)
- Data validation and transformation logic
- Scheduled or on-demand pipeline runs
- Export clean datasets for both SQL and the website

**Today:** `data_analysis_simple.py` does part of this but lives outside a proper package and falls back to hardcoded sample poverty data when files are missing.

---

### `/database` — PostgreSQL + SQL

**Why:** A static JSON site demonstrates frontend skills only. Employers want to see that you can model data, write SQL, and serve analytics from a real database.

**Portfolio proof:**
- Relational schema design (facts, dimensions, geography)
- SQL queries, views, and aggregations
- PostgreSQL setup (local Docker or cloud)
- Optional: API layer later (FastAPI/Flask) reading from DB

**Today:** No database layer exists. All analytics are pre-baked into JSON files.

---

### `/website` — Public Dashboard

**Why:** Separates the user-facing product from backend engineering. Mirrors how real teams deploy frontend independently from data pipelines.

**Portfolio proof:**
- Responsive, accessible dashboard (Chart.js, semantic HTML)
- Consumes processed outputs via `dataLoader.js`
- Deployable to Netlify/Vercel as a static site
- Matches the MC3 summit experience stakeholders already know

**Today:** This already works in `target-repo/`; it just needs to live under `/website` with a clear contract for data inputs.

---

### `/docs` — Documentation

**Why:** Portfolio projects are judged on communication as much as code. Docs explain architecture, data sources, and how to reproduce results.

**Portfolio proof:**
- Architecture decisions written down
- Data dictionary with source attribution
- Setup guides for interns, reviewers, and hiring managers
- Audit trail for what is real data vs. sample data

**Today:** Good deployment docs exist in `target-repo/`, but no root-level system documentation.

---

### `/data/raw` — Untouched Source Files

**Why:** Follows `reference-repo/rules.md`: never modify originals. One canonical raw folder makes ETL inputs obvious and reproducible.

**Portfolio proof:**
- Data governance discipline
- Clear separation of source vs. derived data
- Easy for reviewers to trace a chart number back to a CSV row

**Today:** Raw data is duplicated across `reference-repo/`, `DATASET-.../`, and zip archives.

---

### `/data/processed` — ETL Outputs

**Why:** Stores cleaned tables, parquet/CSV intermediates, and JSON exports with manifests (row counts, run timestamp, source version).

**Portfolio proof:**
- Lineage: raw → transformed → consumed
- Versioned outputs for the website
- Metadata for data quality checks

**Today:** Only JSON exists inside `target-repo/data/processed/` without run manifests.

---

### `/README.md` — Portfolio Entry Point

**Why:** First file a recruiter or collaborator opens. Should explain the problem, stack, how to run everything, and what skills the project demonstrates.

**Today:** READMEs exist inside sub-repos but not at the portfolio root.

---

## 7. How This Upgrade Proves Your Skills

| Skill | Current project | After upgrade |
|-------|---------------|---------------|
| **Python ETL** | Ad-hoc scripts (`data_analysis_simple.py`) | Modular `/etl` package with extract → transform → load, tests, `requirements.txt` |
| **SQL** | None | Schema, views, and analytical queries in `/database` |
| **PostgreSQL** | None | Local Docker Postgres storing Monroe County metrics by topic and year |
| **Dashboard / Frontend** | Working Chart.js portal | Same UX under `/website`, fed by documented JSON exports from ETL |
| **Data engineering hygiene** | Partial | Raw/processed separation, manifests, sample-data flags, no fabricated impact numbers |

**End-to-end story for a portfolio reviewer:**

1. Raw ACS and county Excel files land in `/data/raw`
2. `/etl` pipelines clean and load them into PostgreSQL
3. SQL views power aggregations (poverty trends, graduation rates, SNAP participation)
4. ETL exports verified JSON to `/data/processed` and `/website/data/processed`
5. `/website` renders the same MC3 experience as the Netlify reference
6. `/docs` explains sources, methodology, and how to reproduce locally

---

## 8. Project Plan (Before Major Code Changes)

### Phase 0 — Audit (Complete)

- [x] Inspect workspace folders and files
- [x] Compare `target-repo/` to Netlify reference site
- [x] Document gaps and migration plan (this file)

### Phase 1 — Scaffold (Next)

- [ ] Create root `README.md` with portfolio narrative
- [ ] Create empty scaffold folders: `etl/`, `database/`, `website/`, `data/raw/`, `data/processed/`
- [ ] Copy `target-repo/` → `website/` (preserve original)
- [ ] Consolidate raw data into `data/raw/` from `reference-repo/` and `DATASET-.../` (copy only)
- [ ] Add `docs/architecture.md` with data-flow diagram

### Phase 2 — ETL Foundation

- [ ] Move/refactor `data_analysis_simple.py` into `etl/` modules
- [ ] Add `requirements.txt` (pandas, openpyxl, psycopg2-binary, etc.)
- [ ] Add validation: source file exists, row counts, sample-data fallback flags
- [ ] Generate JSON exports to `data/processed/` with metadata block per file

### Phase 3 — Database Layer

- [ ] Design PostgreSQL schema (geography, demographics, education, economy, social_services)
- [ ] Add `database/schema/001_initial.sql`
- [ ] Add `docker-compose.yml` for local PostgreSQL
- [ ] Implement `etl/load/` to insert transformed data
- [ ] Create SQL views for dashboard KPIs

### Phase 4 — Website Integration

- [ ] Point `website/js/dataLoader.js` at exported JSON paths
- [ ] Verify all 5 pages render with processed data
- [ ] Add visible source citations and sample-data badges where needed
- [ ] Test responsive layout against Netlify reference

### Phase 5 — Polish & Deploy

- [ ] Root-level deploy config for `website/`
- [ ] Add Makefile or scripts: `make etl`, `make db-up`, `make serve`
- [ ] Final documentation pass in `/docs`
- [ ] Optional: GitHub Actions for ETL validation

---

## 9. Risks and Constraints

| Risk | Mitigation |
|------|------------|
| Duplicate data across 3 locations | Pick `data/raw/` as canonical; document copies |
| Hardcoded sample data in Python fallback | Label all sample outputs; prefer real extracts |
| Two nested git repos | Optionally init single root repo; do not delete sub-repo history |
| Impact metrics in JSON may not match sources | Re-validate against raw CSV before publishing |
| Large zip/shapefile binaries | Keep in `data/raw/`; use `.gitignore` + LFS if needed |

---

## 10. Files Inspected for This Audit

### Workspace root
- `DATASET-20251012T022637Z-1-001/` (structure)
- `Data-Driven Visualizations for Monroe County Childhood Conditions Summit.pdf` (presence only)

### `target-repo/` (primary website)
- `index.html`, `package.json`, `vercel.json`, `README.md`, `PROJECT_SUMMARY.md`
- `pages/` (all 5 HTML pages)
- `js/main.js`, `js/dataLoader.js`, `js/visualizations.js`, `js/narratives.js`
- `css/style.css`, `css/visualizations.css`
- `data/processed/` (all 13 JSON files — sampled `dashboard_summary.json`)
- `data_analysis_simple.py`, `data_analysis.py`
- `docs/setup.md`

### `reference-repo/` (data archive)
- `README.md`, `README_Data_Organization.md`, `rules.md`
- `01_Demographics_ACS/` through `05_Geographic_Data/` (structure)
- `MC3_Summit_2025_App/` (structure)

### External reference
- [mc3-monroecounty2025.netlify.app](https://mc3-monroecounty2025.netlify.app/) — layout, disclaimer, KPI sections confirmed

---

## 11. Files Created by This Step

| File | Purpose |
|------|---------|
| `docs/project_audit.md` | This audit and project plan |
| `docs/` (folder) | Root-level documentation directory |

---

## 12. Recommended Next Step

**Phase 1 — Scaffold the portfolio layout without breaking the working site.**

Concrete actions:

1. Write root `README.md` describing the full-stack MC3 portfolio goal.
2. Copy `target-repo/` into `website/` so the live site keeps working while you reorganize.
3. Copy raw datasets into `data/raw/` (from `reference-repo/` and `DATASET-.../DATASET/`).
4. Create stub `etl/README.md` and `database/README.md` describing intended layout.
5. Add `docs/architecture.md` with a simple data-flow diagram.

Only after the scaffold is verified should you refactor Python scripts into `/etl` or add PostgreSQL — that keeps risk low and progress visible.

---

*This audit follows project rules: no working files deleted, no fabricated metrics, sample data must be clearly labeled in all future outputs.*
