# MC3 Data Inventory

**Generated:** June 13, 2026  
**Inventory script:** `etl/data_inventory.py`  
**Machine-readable outputs:** `data/processed/data_inventory.csv`, `data/processed/data_inventory.json`

---

## 1. Purpose of the Data Inventory

The data inventory catalogs every real file already present in the MC3 workspace. It answers:

- What raw source data exists?
- What processed JSON powers the dashboard?
- Where are files duplicated?
- Which files are ready for ETL vs. already web-ready?

**No fake sample data was created.** This inventory only documents existing files.

---

## 2. Where Raw Data Currently Lives

### Portfolio copy (`/data/raw/`)

| Subfolder | Source copied from | Approx. files | Description |
|-----------|-------------------|---------------|-------------|
| `acs/reference_repo/` | `reference-repo/01_Demographics_ACS/` | ~405 | ACS tables: poverty, income, enrollment, SNAP, employment |
| `economy/reference_repo/` | `reference-repo/02_Economic_Data/` | ~10 | Census tract unemployment estimates (XLSX) |
| `education/reference_repo/` | `reference-repo/03_Education_Data/` | ~6 | Graduation, enrollment, suspensions, lunch programs |
| `social_services/reference_repo/` | `reference-repo/04_Social_Services/` | ~12 | SNAP, TANF, foster care, juvenile cases, WIC |
| `geography/reference_repo/` | `reference-repo/05_Geographic_Data/` | ~12 | Census tract shapefiles (2010 and 2024) |
| `misc/dataset_archive/` | `DATASET-20251012T022637Z-1-001/DATASET/` | ~678 | Flat download archive (CSV, XLSX, shapefiles) |

### Original sources (untouched)

- `reference-repo/` — organized source data with governance rules
- `DATASET-20251012T022637Z-1-001/` — flat downloaded archive

---

## 3. Where Processed Dashboard JSON Currently Lives

| Location | Stage label | Files | Role |
|----------|-------------|-------|------|
| `website/data/processed/` | `processed_dashboard_active` | 13 | **Actively consumed by the website** |
| `data/processed/existing_dashboard_json/` | `processed_dashboard_archive` | 13 | Archive copy from Phase 1 scaffold |
| `target-repo/data/processed/` | (original) | 13 | Original working copy (untouched) |

The 13 dashboard JSON files are identical copies across all three locations (208 duplicate records detected in inventory).

---

## 4. Major Data Categories Found

| Category | Files | Primary formats | Example files |
|----------|-------|-----------------|---------------|
| **Demographics** | 1,040 | CSV, TXT | ACS S1701 poverty, S1401 enrollment, `Children in Poverty.csv` |
| **Economy** | 27 | CSV, XLSX | Unemployment estimates, S2301 employment, `Clinical Care.csv` |
| **Education** | 15 | XLSX, CSV | Graduation rate, suspensions, school enrollment |
| **Social Services** | 24 | XLSX | SNAP, TANF, foster care, juvenile filings |
| **Geography** | 10 | SHP, DBF, PRJ | `tl_2010_18105_tract10`, `tl_2024_18_tract` |
| **Housing** | 6 | XLSX | Homeless/unstable students |
| **Health** | 3 | CSV, XLSX | Clinical care, mental health provider ratio |
| **Correlations** | 8 | JSON | `monroe_county_comprehensive.json`, dashboard composites |
| **Other** | 1 | — | Miscellaneous |

*Topic counts include ACS metadata `.txt` files classified under demographics.*

---

## 5. Number of Files by Category

```
demographics      1,040
economy              27
social_services      24
education            15
geography            10
correlations          8
housing               6
health                3
other                 1
─────────────────────────
TOTAL             1,134
```

---

## 6. Number of Files by Type

| Extension | Count | Notes |
|-----------|-------|-------|
| `.csv` | 737 | ACS data tables, poverty trends, clinical care |
| `.txt` | 297 | ACS table notes and column metadata |
| `.xlsx` | 64 | Education, social services, unemployment |
| `.json` | 26 | 13 dashboard files × 2 copies + 2 inventory outputs |
| `.xml` | 6 | Shapefile metadata |
| `.shp` | 4 | Census tract boundaries (companion files cataloged separately) |

---

## 7. Known Duplicate / Overlapping Data Locations

### Dashboard JSON (exact copies)

All 13 JSON files exist in **three places**:

- `website/data/processed/`
- `data/processed/existing_dashboard_json/`
- `target-repo/data/processed/` (original)

### Raw data overlap

| Pattern | Example | Notes |
|---------|---------|-------|
| `reference_repo/` vs `dataset_archive/` | `Children in Poverty.csv` | Same file in organized and flat archive |
| Education XLSX | `Student enrollment.xlsx` | Present in both `education/reference_repo/` and `misc/dataset_archive/` |
| Social services XLSX | `Monthly average number of persons issued food stamps (SNAP).xlsx` | Duplicated across folders |
| ACS tables | S1401, S1701 folders | Appear in both `acs/reference_repo/` and `misc/dataset_archive/` |
| Misplaced ACS files | S1401 files inside `S1702_Family_Poverty_Status/` | Same filename/size in multiple ACS subfolders (208 duplicate records total) |

**Action taken:** Duplicates are documented, not deleted.

---

## 8. Files Most Important for the Current Dashboard

These processed JSON files directly power the website charts:

| File | Top-level keys | Dashboard use |
|------|----------------|---------------|
| `pdf_visualizations_complete.json` | Chart configs for all topics | **Primary data source** — fetched by `visualizations.js` |
| `poverty_trend.json` | `years`, `poverty_rates`, `improvement` | Homepage poverty trend chart |
| `demographics.json` | `totalPopulation`, `children`, `timeSeries` | Demographics KPIs and charts |
| `education.json` | `education`, `timeSeries` | Education page metrics |
| `economy.json` | `economy`, `timeSeries` | Economy page metrics |
| `social-services.json` | `socialServices`, `timeSeries` | Social services page |
| `dashboard_summary.json` | `key_findings`, `data_sources` | Executive summary cards |
| `monroe_county_comprehensive.json` | Cross-topic composites | Correlations / comprehensive view |

### Key raw source files feeding prior analysis

| Raw file | Confirmed columns | Feeds |
|----------|-------------------|-------|
| `Children in Poverty.csv` | `County ID`, `County`, `Year`, `Children In Poverty`, CI High/Low | `poverty_trend.json` |
| ACS S1701/S1702 tables | `GEO_ID`, `NAME`, estimate/margin columns | Demographics, poverty |
| `High school graduation rate.xlsx` | Sheet: `Kidscount Export` | Education metrics |
| `STATSIN_asu*.xlsx` | Sheets: `data`, `fields`, `alternate` | Unemployment by tract |
| `Clinical Care.csv` | `Uninsured Children` by year | Health indicators |

---

## 9. Files Needing Further Verification Before Official Claims

These dashboard JSON values should be traced to raw sources before publishing as verified facts:

| Claim / field | Source file | Verification status |
|---------------|-------------|---------------------|
| `total_children_impacted: 1735` in `poverty_trend.json` | Derived from poverty rate change | **Needs verification** — calculated metric, not a raw column |
| `8.3 percentage point reduction` in `dashboard_summary.json` | Unclear single source | **Needs verification** — does not match 6.2pp in `poverty_trend.json` |
| `95% high school graduation rate` | `High school graduation rate.xlsx` | **Needs verification** — XLSX columns not yet parsed (openpyxl recommended) |
| `3.9% unemployment rate` | `STATSIN_asu*.xlsx` | **Needs verification** — requires ETL extraction |
| `totalPopulation: 139718` in `demographics.json` | ACS tables | **Needs verification** — trace to specific ACS table/year |
| `qualityScore: 0.98` in metadata | No raw equivalent | **Inferred** — dashboard metadata only |

---

## 10. How to Regenerate the Inventory

```bash
cd etl
python data_inventory.py
```

Optional — install Excel column parsing:

```bash
pip install -r requirements.txt
```

Outputs are written to:

- `data/processed/data_inventory.csv`
- `data/processed/data_inventory.json`

### Scan directories

1. `data/raw/` — all raw/source files
2. `data/processed/` — archive JSON and inventory outputs
3. `website/data/processed/` — active dashboard JSON

### Last run summary

| Metric | Value |
|--------|-------|
| Total files cataloged | 1,134 |
| Unreadable files | 0 |
| Duplicate records flagged | 208 |
| openpyxl available | No (sheet names read via zip/XML; install for column details) |
| geopandas available | No (shapefiles cataloged by component files) |

---

## Related Documentation

- [`data_dictionary.md`](data_dictionary.md) — field definitions by topic
- [`data_lineage.md`](data_lineage.md) — data flow from source to dashboard
- [`architecture.md`](architecture.md) — system architecture
- [`../data/README.md`](../data/README.md) — data folder layout
