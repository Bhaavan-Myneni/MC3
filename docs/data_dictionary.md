# MC3 Data Dictionary

A practical, interview-friendly reference for Monroe County Childhood Conditions Summit 2025 data fields.

**Important:** Fields marked **confirmed** were found in real project files. Fields marked **inferred / needs verification** are expected based on dashboard JSON or domain knowledge but are not yet validated against raw extracts.

**Inventory source:** `data/processed/data_inventory.json` (1,134 files cataloged)

---

## 1. Demographics

Population, poverty, race/ethnicity, and household composition for Monroe County, Indiana (FIPS `18105`).

### Confirmed raw fields

| Field name | Plain-English meaning | Example use in dashboard | Validation |
|------------|----------------------|--------------------------|------------|
| `County ID` | FIPS code for the county (e.g., `05000US18105`) | Filter to Monroe County rows | **Confirmed** — `Children in Poverty.csv` |
| `County` | County name string | Chart labels, source citations | **Confirmed** |
| `Year` | Observation year | Time-series x-axis | **Confirmed** |
| `Children In Poverty` | Share of children below poverty line (decimal proportion) | Child poverty rate KPI and trend line | **Confirmed** |
| `Children In Poverty CI High` | Upper bound of confidence interval | Error bars, data quality notes | **Confirmed** |
| `Children In Poverty CI Low` | Lower bound of confidence interval | Error bars, data quality notes | **Confirmed** |
| `GEO_ID` | Census geography identifier | Join ACS tables to county/tract | **Confirmed** — ACS S1701 tables |
| `NAME` | Geographic area name | Display labels on maps/tables | **Confirmed** |
| `S1701_C##_###E` | ACS estimate columns (poverty status) | Poverty by age, race, education | **Confirmed** — ACS naming convention |
| `S1701_C##_###M` | ACS margin of error columns | Statistical uncertainty | **Confirmed** |

### Inferred / needs verification

| Field name | Plain-English meaning | Example use in dashboard | Validation |
|------------|----------------------|--------------------------|------------|
| `county_fips` | Standardized 5-digit county FIPS (`18105`) | Database primary key | **Inferred** — derived from `County ID` |
| `county_name` | `Monroe County, Indiana` | Page headers, filters | **Inferred** |
| `total_population` | Total county population | Homepage KPI card | **Inferred** — `demographics.json` shows `139718`; trace to ACS |
| `child_population` | Population under 18 | Children demographics section | **Inferred** — `demographics.json` shows `28447` |
| `race_ethnicity` | Race/ethnicity breakdown | Demographics doughnut charts | **Inferred** — `byRace` object in JSON |
| `age_group` | Age brackets (0–4, 5–9, etc.) | Population pyramid | **Inferred** — `ageGroups` in JSON |
| `poverty_rate` | Percent of population in poverty | Trend charts, policy summaries | **Inferred** — may differ from `Children In Poverty` scope |

---

## 2. Education

School system outcomes for Monroe County public schools.

### Confirmed raw files

| File | Sheets / notes |
|------|----------------|
| `High school graduation rate.xlsx` | Sheet: `Kidscount Export` |
| `High school dropout rate.xlsx` | Kids Count export format |
| `Student enrollment.xlsx` | Enrollment counts |
| `Suspensions.xlsx` | Discipline data |
| `Public school students receiving free or reduced price lunches.xlsx` | Food security proxy |
| `school-enrollment-grade-2006-25.xlsx` | Grade-level enrollment time series |

### Confirmed / inferred fields

| Field name | Plain-English meaning | Example use in dashboard | Validation |
|------------|----------------------|--------------------------|------------|
| `school_year` | Academic year of record | X-axis on education trends | **Inferred / needs verification** — XLSX columns pending openpyxl parse |
| `district_name` | School district name | Filters, labels | **Inferred / needs verification** |
| `enrollment` | Student headcount | Enrollment trend chart | **Inferred** — file exists; columns not yet parsed |
| `graduation_rate` | High school graduation percentage | Homepage KPI (`95%` claim) | **Inferred / needs verification** — verify against `High school graduation rate.xlsx` |
| `attendance_rate` | Share of students attending regularly | Education health indicator | **Inferred / needs verification** |
| `test_score_metric` | Standardized test performance | Achievement gap analysis | **Inferred / needs verification** |
| `student_group` | Demographic subgroup (e.g., FRPL, race) | Equity breakdowns | **Inferred** — lunch program file suggests subgroup data |

### Confirmed processed JSON fields (`education.json`)

| Field name | Meaning | Validation |
|------------|---------|------------|
| `metadata.source` | Data provenance string | **Confirmed** in JSON |
| `education.graduationRate` | Graduation rate for charts | **Inferred / needs verification** — trace to XLSX |
| `timeSeries.years` | Array of years | **Confirmed** in JSON structure |

---

## 3. Economy

Employment, income, and labor market conditions.

### Confirmed raw files

| File | Notes |
|------|-------|
| `STATSIN_asu20.xlsx` – `STATSIN_asu24.xlsx` | Sheets: `data`, `fields`, `alternate` — census tract unemployment |
| ACS `S2301_Employment_Status/` | Employment status estimates |
| ACS `S1901_Income/`, `S1903_Median_Income/` | Income distributions |

### Fields

| Field name | Plain-English meaning | Example use in dashboard | Validation |
|------------|----------------------|--------------------------|------------|
| `unemployment_rate` | Share of labor force unemployed | Economy KPI (`3.9%` in summary) | **Inferred / needs verification** — extract from `STATSIN_asu*.xlsx` |
| `median_income` | Median household income | Economic well-being chart | **Inferred** — ACS S1903 tables |
| `poverty_rate` | General population poverty | Cross-topic comparison | **Confirmed** — ACS S1701 |
| `labor_force` | Civilians in labor force | Denominator for unemployment | **Inferred** — ACS S2301 |
| `household_income` | Income by bracket | Income distribution charts | **Inferred** — ACS S1901 |

### Confirmed processed JSON (`economy.json`, `economic_indicators.json`)

| Field name | Meaning | Validation |
|------------|---------|------------|
| `economy.unemploymentRate` | Unemployment for KPI cards | **Inferred / needs verification** |
| `timeSeries` | Year-over-year economic trends | **Confirmed** structure |

---

## 4. Social Services

Safety-net program participation and child welfare indicators.

### Confirmed raw files

| File | Topic |
|------|-------|
| `Monthly average number of persons issued food stamps (SNAP).xlsx` | SNAP participation |
| `Monthly average number of families receiving TANF.xlsx` | TANF caseloads |
| `Children in foster care at some point.xlsx` | Foster care |
| `Juvenile case filings by type.xlsx` | Juvenile justice |
| `Women, infants, and children (WIC) participants.xlsx` | WIC nutrition |
| `Child care cost-to-income ratio.xlsx` | Childcare affordability |

### Fields

| Field name | Plain-English meaning | Example use in dashboard | Validation |
|------------|----------------------|--------------------------|------------|
| `service_type` | Program name (SNAP, TANF, WIC, etc.) | Category filters | **Inferred** — from filenames |
| `provider` | Administering agency | Source attribution | **Inferred** |
| `utilization_count` | Monthly/annual participants | Bar charts, trend lines | **Inferred / needs verification** |
| `eligibility_group` | Target population (families, children) | Subgroup analysis | **Inferred / needs verification** |
| `referral_count` | Service referrals (e.g., CHINS) | Social services demand | **Inferred** — `Children in need of services (CHINS) active cases.xlsx` |

---

## 5. Housing / Stability

Housing cost burden and student housing instability.

### Confirmed raw files

| File | Topic |
|------|-------|
| `Homeless or housing unstable students.xlsx` | Student housing instability |

### Fields

| Field name | Plain-English meaning | Example use in dashboard | Validation |
|------------|----------------------|--------------------------|------------|
| `housing_cost_burden_rate` | Share of income spent on housing | Stability indicator | **Inferred / needs verification** |
| `severe_housing_cost_burden_rate` | Share spending 50%+ on housing | High-risk households | **Inferred / needs verification** |
| `renter_households` | Count of renting households | Housing tenure analysis | **Inferred** — may be in ACS |
| `homeownership_rate` | Share of owner-occupied homes | Economic stability | **Inferred** |
| `eviction_or_instability_indicator` | Homeless/unstable student count | Education + housing crossover | **Inferred** — `Homeless or housing unstable students.xlsx` |

---

## 6. Health / Well-Being

Clinical access and health outcome proxies.

### Confirmed raw fields (`Clinical Care.csv`)

| Field name | Plain-English meaning | Example use in dashboard | Validation |
|------------|----------------------|--------------------------|------------|
| `County ID` | FIPS code | County filter | **Confirmed** |
| `Year` | Observation year | Trend x-axis | **Confirmed** |
| `Uninsured Children` | Proportion of uninsured children | Health access KPI | **Confirmed** |
| `Uninsured Children CI High` | CI upper bound | Uncertainty display | **Confirmed** |
| `Uninsured Children CI Low` | CI lower bound | Uncertainty display | **Confirmed** |

### Inferred fields

| Field name | Plain-English meaning | Example use in dashboard | Validation |
|------------|----------------------|--------------------------|------------|
| `indicator_name` | Health metric label | Chart titles | **Inferred** |
| `indicator_category` | Grouping (access, outcomes) | Dashboard sections | **Inferred** |
| `indicator_value` | Numeric measurement | KPI values | **Inferred** |
| `age_group` | Age bracket | Child vs. adult health | **Inferred** |
| `geography` | County or tract | Spatial filters | **Inferred** |

Additional file: `Mental-Health-Provider-Ratio.xlsx` — provider access (**inferred / needs verification**).

---

## 7. Geography

Spatial boundaries for Monroe County census tracts.

### Confirmed files

| File set | Components | Validation |
|----------|------------|------------|
| `tl_2010_18105_tract10` | `.shp`, `.shx`, `.dbf`, `.prj` | **Confirmed** — 2010 tract boundaries |
| `tl_2024_18_tract` | `.shp`, `.shx`, `.dbf`, `.prj` | **Confirmed** — 2024 tract boundaries |

### Fields

| Field name | Plain-English meaning | Example use in dashboard | Validation |
|------------|----------------------|--------------------------|------------|
| `tract` | Census tract GEOID | Map coloring, joins | **Inferred** — in shapefile DBF; needs geopandas parse |
| `county_fips` | `18105` for Monroe County | Spatial filter | **Confirmed** — embedded in tract IDs |
| `geometry` | Polygon boundaries | Choropleth maps | **Inferred** — `.shp` geometry column |
| `latitude` | Centroid latitude | Map centering | **Inferred / needs verification** |
| `longitude` | Centroid longitude | Map centering | **Inferred / needs verification** |
| `area_name` | Human-readable tract label | Map tooltips | **Inferred** — ACS `NAME` field pattern |

**Note:** Two boundary vintages (2010 and 2024) exist. Temporal analysis must account for tract boundary changes.

---

## 8. Processed Dashboard JSON Schema (Confirmed Structures)

These structures are **confirmed** in `website/data/processed/`:

### `poverty_trend.json`

| Field | Type | Meaning |
|-------|------|---------|
| `data.years` | array | Years 2014–2024 |
| `data.poverty_rates` | array | Annual child poverty rates (percent) |
| `data.improvement` | number | Point change over period |
| `data.total_children_impacted` | number | Derived impact estimate — **needs verification** |

### `demographics.json`

| Field | Type | Meaning |
|-------|------|---------|
| `metadata.source` | string | `"U.S. Census Bureau ACS 5-Year Estimates"` |
| `demographics.totalPopulation` | number | County population |
| `demographics.children.total` | number | Child population |
| `demographics.children.ageGroups` | object | Age breakdown |
| `timeSeries.childrenInPoverty` | array | Poverty trend overlay |

### `dashboard_summary.json`

| Field | Type | Meaning |
|-------|------|---------|
| `summary.data_sources` | array | Listed source files |
| `key_findings` | array | Executive bullet points — **each needs raw verification** |

---

## Validation Priority for Phase 3 ETL

1. Trace `poverty_trend.json` rates to `Children in Poverty.csv` (straightforward — confirmed columns match)
2. Parse `High school graduation rate.xlsx` to verify `95%` claim
3. Extract unemployment from `STATSIN_asu*.xlsx` to verify `3.9%` claim
4. Reconcile `8.3pp` vs `6.2pp` poverty reduction discrepancy in summary vs. trend files
5. Document `total_children_impacted` calculation methodology or remove until verified

---

## Related Documentation

- [`data_inventory.md`](data_inventory.md) — full file catalog
- [`data_lineage.md`](data_lineage.md) — source-to-dashboard flow
- [`../data/processed/data_inventory.csv`](../data/processed/data_inventory.csv) — machine-readable inventory
