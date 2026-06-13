# Phase 6 Source Selection

**Date:** June 13, 2026  
**Inventory source:** `data/processed/data_inventory.json` (1,134 files)  
**Rule:** Only select files with clear columns supporting the target metric.

---

## 1. Graduation Rate / Education

### Selected

| Field | Value |
|-------|-------|
| **File** | `data/raw/education/reference_repo/High school graduation rate.xlsx` |
| **Topic** | education |
| **Why useful** | Kids Count export with Monroe County rows and annual graduation rates |
| **Sheet** | `Kidscount Export` |
| **Columns** | `LocationType`, `Location`, `TimeFrame`, `DataFormat`, `Data` |
| **Rows** | Monroe Percent rows: 12 (2006–2017) |
| **Selected?** | **Yes** |
| **Reason** | Clear Monroe filter; `DataFormat=Percent` gives graduation rate proportion |

### Skipped candidates

| File | Reason skipped |
|------|----------------|
| `High school dropout rate.xlsx` | Graduation file selected as primary education indicator |
| `Student enrollment.xlsx` | Enrollment, not graduation rate |
| `Suspensions.xlsx` | Discipline metric, not graduation |
| ACS `S1501` tables | Complex multi-header ACS; deferred to later phase |

---

## 2. Unemployment / Economy

### Selected

| Field | Value |
|-------|-------|
| **Files** | `data/raw/economy/reference_repo/Unemployment_Estimates/STATSIN_asu20.xlsx` through `STATSIN_asu25.xlsx` |
| **Topic** | economy |
| **Why useful** | County-level unemployment rate for Monroe (`cnty_fips = 105`) |
| **Sheet** | `data` |
| **Columns** | `cnty_fips`, `cnty_urate`, `cnty_urate_error`, `name`, ... |
| **Rows** | 6 annual county-level records (2020–2025 from filenames) |
| **Selected?** | **Yes** |
| **Reason** | `cnty_urate` is clearly a county unemployment rate; Monroe tracts present |

### Skipped candidates

| File | Reason skipped |
|------|----------------|
| `Clinical Care.csv` | Health/uninsured children — selected SNAP for social services instead |
| ACS `S2301_Employment_Status/` | Large ACS tables; STATSIN county rate is clearer |
| Census tract-only rates without county aggregation | County `cnty_urate` used for consistency |

---

## 3. Demographics / Population

### Selected

| Field | Value |
|-------|-------|
| **File** | `data/raw/social_services/reference_repo/Child population by age group.xlsx` |
| **Topic** | demographics |
| **Why useful** | Monroe County child population by age group over time |
| **Sheet** | `Kidscount Export` |
| **Columns** | `Location`, `Age group`, `TimeFrame`, `DataFormat`, `Data` |
| **Rows** | 220 Monroe rows; aggregated to 22 annual totals (2000–2021) |
| **Selected?** | **Yes** |
| **Reason** | Can sum `Number` rows across age groups for total child population |

### Skipped candidates

| File | Reason skipped |
|------|----------------|
| ACS `B01001` tables | Not found at expected inventory paths |
| `Child population by age group` Percent rows | Count rows used for population total |
| `demographics.json` (dashboard) | Processed dashboard file — not raw source |

---

## 4. Social Services / Well-Being

### Selected

| Field | Value |
|-------|-------|
| **File** | `data/raw/social_services/reference_repo/Monthly average number of persons issued food stamps (SNAP).xlsx` |
| **Topic** | social_services |
| **Why useful** | Monroe County SNAP participation over time |
| **Sheet** | `Kidscount Export` |
| **Columns** | `Location`, `TimeFrame`, `DataFormat`, `Data` |
| **Rows** | 34 Monroe Number rows (1990–2023) |
| **Selected?** | **Yes** |
| **Reason** | Clear Monroe filter; `Number` format gives participant counts |

### Skipped candidates

| File | Reason skipped |
|------|----------------|
| `Clinical Care.csv` | Valid health source, but SNAP chosen as social services indicator |
| `Children in foster care at some point.xlsx` | Different metric; SNAP is more continuous time series |
| `Monthly average number of families receiving TANF.xlsx` | Alternative; SNAP selected as primary safety-net indicator |
| `Mental-Health-Provider-Ratio.xlsx` | Provider ratio — not participation count |

---

## Summary

| Indicator | Selected source | ETL output base name |
|-----------|-----------------|----------------------|
| Poverty (Phase 3) | `Children in Poverty.csv` | `children_in_poverty` |
| Graduation | `High school graduation rate.xlsx` | `graduation_rate` |
| Unemployment | `STATSIN_asu*.xlsx` | `unemployment_rate` |
| Child population | `Child population by age group.xlsx` | `demographics_population` |
| SNAP | `Monthly average number of persons issued food stamps (SNAP).xlsx` | `social_services_indicator` |

**No fake data created.** Skipped files remain in `/data/raw/` untouched.
