# Data-Informed Policy Recommendations

Six recommendations for Monroe County youth and family policy discussions (e.g. 2025 MC3 Summit). Wording is intentionally cautious — these **may help** inform priorities and **should be validated** with Youth Services Bureau and community stakeholders.

---

## 1. Reduce Renter Cost Burden Through Housing Support

**Problem signal:** A large share of Monroe County renter households pay ≥30% of income on gross rent (ACS B25070-derived metric).

**Data indicator used:** `renters_cost_burden_30_plus_pct`

**Source / processed file:** `data/processed/housing_stability_clean.json` (from ACS B25070 in `data/raw/misc/dataset_archive/mc3_snap- us bureau/B25070/`)

**Suggested action:** Expand renter assistance outreach, emergency rental aid navigation, and partnerships with local housing counselors to target cost-burdened families with children.

**Potential partners:** Monroe County housing nonprofits, Indiana Housing & Community Development Authority, city/county human services, legal aid clinics.

**Expected benefit:** Could support housing stability for families facing rent stress, which may reduce downstream child well-being risks.

**Limitation / caution:** Rent burden is a proxy, not eviction risk or homelessness counts. ACS estimates have margins of error. Actions should be validated with local housing providers.

---

## 2. Strengthen SNAP and Food Assistance Navigation

**Problem signal:** SNAP participation levels provide a measurable food assistance access signal for Monroe County households.

**Data indicator used:** `snap_monthly_avg_food_access` (SNAP monthly average participants)

**Source / processed file:** `data/processed/food_access_clean.json` (from `Monthly average number of persons issued food stamps (SNAP).xlsx`)

**Suggested action:** Improve SNAP eligibility outreach at schools, clinics, and libraries; simplify referral pathways for families not yet enrolled.

**Potential partners:** Indiana FSSA, school family liaisons, food banks, pediatric clinics, MC3 summit community organizations.

**Expected benefit:** May help more eligible families access nutrition support, which can inform food security programming.

**Limitation / caution:** SNAP counts measure program participation, not total food insecurity. No free/reduced lunch file was verified in this repo.

---

## 3. Suicide Mortality Signal and Behavioral Health Coordination

**Problem signal:** Monroe County suicide deaths ranged from 17–20 per year (2019–2023) per NCHS vital statistics.

**Data indicator used:** `suicide_deaths_mental_health_signal`

**Source / processed file:** `data/processed/mental_health_clean.json` (from CDC WONDER / NCHS extract in `data/raw/public_health/cdc_wonder/`)

**Suggested action:** Coordinate school-based crisis response, 988 outreach, and cross-sector behavioral health referrals in years with elevated county suicide counts.

**Potential partners:** School districts, Centerstone, 988 Suicide & Crisis Lifeline regional partners, Youth Services Bureau.

**Expected benefit:** May help focus prevention resources during years with higher county suicide counts.

**Limitation / caution:** County suicide deaths are an all-ages mortality signal, not youth mental health survey data. Rates with counts under 20 are statistically unstable per IDOH guidance.

---

## 4. Sustain Education Completion Supports

**Problem signal:** Verified graduation rate data ends in 2017 at 90.77%, below some public dashboard claims.

**Data indicator used:** `high_school_graduation_rate`

**Source / processed file:** `data/processed/graduation_rate_clean.json`

**Suggested action:** Refresh local graduation and chronic absenteeism data; target re-engagement programs for students at risk of not completing high school.

**Potential partners:** MCCSC and RBB school districts, Boys & Girls Clubs, Ivy Tech, youth employment programs.

**Expected benefit:** Could support improved educational attainment if paired with current school-level data and program evaluation.

**Limitation / caution:** ETL-verified graduation series is stale (2017). Any policy target should use updated school corporation reports.

---

## 5. Family Economic Stability and Child Poverty Reduction

**Problem signal:** Child poverty in Monroe County decreased from 20.2% (2014) to 14.0% (2024) per verified ETL, but remains a core childhood conditions concern.

**Data indicator used:** `children_in_poverty_rate`; `median_household_income` (ACS S1903); `county_unemployment_rate`

**Source / processed files:** `children_in_poverty_clean.json`, `acs_housing_demographics_clean.json`, `unemployment_rate_clean.json`

**Suggested action:** Coordinate earned income tax credit outreach, workforce pathways for caregivers, and child care access investments in high-poverty neighborhoods.

**Potential partners:** United Way, Chamber workforce programs, DWD, early childhood coalitions, employers with living-wage hiring goals.

**Expected benefit:** May help sustain poverty reduction trends and buffer families from economic shocks.

**Limitation / caution:** Poverty and income indicators measure association, not causation. Unemployment is county-level and may mask neighborhood variation.

---

## 6. Cross-Sector Data Sharing and Metric Validation

**Problem signal:** Original dashboard JSON contained metrics that diverged from source files (e.g. 8.3pp poverty change, 95% graduation, 3.9% unemployment claims flagged in validation reports).

**Data indicator used:** ETL validation outputs across poverty, education, economy, and Phase 8 themes

**Source / processed file:** `children_in_poverty_validation_report.json`, `phase6_indicator_validation_report.json`, `phase8_theme_validation_report.json`

**Suggested action:** Establish a shared indicator dictionary with source file paths, refresh cadence, and limitation notes before MC3 summit materials are published.

**Potential partners:** Youth Services Bureau, IU research partners, county GIS/analytics staff, MC3 communications team.

**Expected benefit:** Can inform more trustworthy public storytelling and reduce risk of overstated resume or policy claims.

**Limitation / caution:** Validation improves transparency but does not by itself change outcomes. Stakeholder agreement on definitions is still required.

---

## Count

**6 recommendations** documented (housing, food access, mental health gap, education, economic stability, data validation).

## Usage at MC3 Summit

These recommendations are suitable for **discussion prompts**, not as proven policy outcomes. Pair each with the cited processed file when presenting.
