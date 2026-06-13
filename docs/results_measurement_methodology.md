# Results Measurement Methodology

## Section 1: Purpose

This document defines how project outcomes are measured for the **Monroe County Childhood Conditions Summit (MC3) Data Hub** portfolio project. It connects each resume-style result to a reproducible evidence file, calculation method, and limitation note.

The goal is to avoid unsupported claims and make every result traceable. No website code or verified indicator values are changed by this document; it only describes how existing evidence was produced and how results should be interpreted.

Related audit files:

- [`docs/resume_claim_evidence_tracker.md`](resume_claim_evidence_tracker.md) — claim-by-claim status
- [`docs/etl_time_reduction_benchmark.md`](etl_time_reduction_benchmark.md) — ETL timing detail
- [`docs/accessibility_improvement_evaluation.md`](accessibility_improvement_evaluation.md) — accessibility rubric detail

---

## Section 2: Result 1 — Processing Time Reduction

### Claim

Python-based ETL workflows reduced documented manual data-processing time by over 30%.

### Evidence files

| File | Role |
|---|---|
| [`etl/manual_baseline_etl.py`](../etl/manual_baseline_etl.py) | Runs sequential manual-style workflow and records timing |
| [`data/processed/manual_baseline_results.json`](../data/processed/manual_baseline_results.json) | Documented manual baseline |
| [`data/processed/etl_benchmark_results.json`](../data/processed/etl_benchmark_results.json) | Automated pipeline benchmark |
| [`docs/etl_time_reduction_benchmark.md`](etl_time_reduction_benchmark.md) | Full benchmark protocol |

### Measurement method

**Manual baseline**

A documented analyst checklist estimates the time required to:

1. Locate raw source files under `data/raw`
2. Open CSV/Excel sources and inspect columns
3. Clean and filter to Monroe County (FIPS 18105)
4. Calculate indicator values
5. Export CSV/JSON outputs
6. Copy verified JSON to `website/data/verified/`
7. Validate against dashboard claims

The checklist is implemented in `manual_baseline_etl.py` and broken down in `manual_baseline_results.json` → `protocol_breakdown_minutes`:

| Task | Minutes |
|---|---:|
| Locate source files | 8.0 |
| Excel inspection and cleaning | 18.0 |
| Metric calculation | 6.0 |
| CSV/JSON export | 4.0 |
| Website copy and validation | 2.0 |
| **Total** | **38.0** |

**Manual time (documented):** 2,280 seconds (38.0 minutes)

A separate **machine script runtime** (1.566 seconds on latest recorded run) is also logged as reproducible evidence of the same workflow steps without analyst stopwatch overhead.

**Automated benchmark**

The automated ETL runtime is measured by running the full pipeline via `etl/benchmark_etl.py`, which calls `automated_pipeline.py` and records wall-clock seconds.

**Automated time (latest recorded):** 1.158 seconds — from `data/processed/etl_benchmark_results.json` (`run_timestamp`: 2026-06-13T22:00:49Z)

### Formula

```
processing_time_reduction =
    ((manual_time_seconds - automated_runtime_seconds) / manual_time_seconds) * 100
```

### Example (using repository values)

```
manual_time_seconds        = 2280.0
automated_runtime_seconds  = 1.158

reduction = ((2280 - 1.158) / 2280) * 100
          = 99.9%
```

Recorded in `etl_benchmark_results.json` → `processing_time_reduction_percent`: **99.9**

### Interpretation

The project exceeds the original **30%** processing-time reduction target based on the documented benchmark (99.9% measured).

### Safe wording

> "Reduced documented manual data-processing time by over 30% based on benchmarked ETL runtime."

### Limitation

The manual baseline is a **documented checklist estimate**, not a third-party timed study. For stronger evidence, a real analyst should time the manual Excel/REPL workflow end-to-end with a stopwatch and record the result in `manual_baseline_results.json`.

---

## Section 3: Result 2 — Data Accessibility Improvement

### Claim

The website improved documented data accessibility by over 40%.

### Evidence files

| File | Role |
|---|---|
| [`docs/accessibility_improvement_evaluation.md`](accessibility_improvement_evaluation.md) | Rubric methodology and claim status |
| [`data/processed/accessibility_audit_summary.json`](../data/processed/accessibility_audit_summary.json) | Aggregated audit summary |
| [`docs/accessibility_scoring_rubric.csv`](accessibility_scoring_rubric.csv) | Before/after category scores |
| [`docs/accessibility_audits/html_audit_report.json`](accessibility_audits/html_audit_report.json) | Static HTML structure checks |
| [`docs/accessibility_audits/wave_report.json`](accessibility_audits/wave_report.json) | WAVE API attempt log |
| [`docs/accessibility_before_scores.json`](accessibility_before_scores.json) | Estimated pre-improvement baseline |

### Measurement method

Accessibility was evaluated using a **before/after rubric** with 10 categories, each scored 0–5:

1. Plain-English metric explanations
2. Source notes visible
3. Limitation notes visible
4. Keyboard navigation
5. Mobile responsiveness
6. Color contrast
7. Chart text alternatives
8. Clear section headings
9. Reduced jargon
10. User/stakeholder task completion clarity

Scores are stored in `docs/accessibility_scoring_rubric.csv`.

| | Before | After |
|---|---:|---:|
| **Total rubric score** | **19** | **38** |

A supplemental **HTML audit** (`html_audit_report.json`) counts structural signals on the local site: 54 headings, 1/1 images with alt text, 10 ARIA labels, 174 source/limitation mentions, `lang` attribute present, viewport meta present.

### Formula

```
accessibility_improvement =
    ((after_score - before_score) / before_score) * 100
```

### Example (using repository values)

```
before_score = 19
after_score  = 38

improvement = ((38 - 19) / 19) * 100
            = 100.0%
```

Recorded in `accessibility_audit_summary.json` → `rubric_improvement_percent`: **100.0**

### Interpretation

The documented rubric showed a **100%** score improvement, exceeding the original **40%** accessibility improvement target.

### Safe wording

> "Improved documented data accessibility by over 40% using a before/after rubric evaluation."

### Limitation

This is a **rubric-based internal evaluation**, not an externally certified accessibility audit.

- **Lighthouse** was not run — Node.js was not installed in the benchmark environment (`lighthouse_accessibility_after`: null in `accessibility_audit_summary.json`).
- **WAVE** could not evaluate `localhost` — the WAVE API does not reach locally served pages; see `wave_report.json`.
- Before scores are estimated from the pre-verification dashboard state (`accessibility_before_scores.json`).

For stronger evidence: run Lighthouse and WAVE on the deployed URL ([mc3-monroecounty2025.netlify.app](https://mc3-monroecounty2025.netlify.app/)) and conduct stakeholder usability testing.

---

## Section 4: Result 3 — Policy Recommendation Support

### Claim

The analysis supported more than five policy recommendations.

### Evidence file

[`docs/policy_recommendations.md`](policy_recommendations.md)

### Measurement method

Count recommendations in `policy_recommendations.md`. Each must include:

1. Recommendation title
2. Problem signal
3. Data indicator used
4. Source / processed file
5. Suggested action
6. Potential partners
7. Expected benefit
8. Limitation / caution

### Current result

**Six** policy recommendations documented:

1. Housing stability (rent burden)
2. Food access / SNAP
3. Suicide mortality / behavioral health coordination
4. Education / graduation support
5. Family economic stability / child poverty
6. Cross-sector data sharing and metric validation

### Interpretation

The project meets the **"more than five policy recommendations"** target.

### Safe wording

> "Supported six data-informed policy recommendations."

### Limitation

Recommendations are **planning and discussion support**, not confirmed policy outcomes. Do not say the dashboard "drove" or "caused" policy change unless Youth Services Bureau or other stakeholders confirm adoption.

---

## Section 5: Result 4 — Verified Indicator Coverage

### Claim

The project analyzes multiple youth and family well-being indicators.

### Evidence files

| File | Role |
|---|---|
| [`data/processed/phase6_indicator_validation_report.json`](../data/processed/phase6_indicator_validation_report.json) | Phase 6 indicator validation |
| [`data/processed/phase8_theme_validation_report.json`](../data/processed/phase8_theme_validation_report.json) | Phase 8 theme extensions |
| [`docs/theme_coverage_matrix.md`](theme_coverage_matrix.md) | Theme-to-source mapping |
| [`website/data/verified/`](../website/data/verified/) | Verified JSON exports for frontend |

### Verified indicators

| # | Indicator | Latest verified value | Evidence | Limitation |
|---|---|---|---|---|
| 1 | Child poverty | 14.0% in 2024; 6.2 pp decrease (2014–2024) | `children_in_poverty_clean.json` | 8.3 pp dashboard claim flagged |
| 2 | Graduation rate | 90.77% in 2017 | `graduation_rate_clean.json` | Source ends 2017; 95% claim not verified |
| 3 | Unemployment rate | 5.8% in 2025 | `unemployment_rate_clean.json` | 3.9% dashboard claim flagged |
| 4 | Child population | 44,236 in 2021 | `demographics_population_clean.json` | Summed across age groups |
| 5 | SNAP participants | 7,527 in 2023 | `social_services_indicator_clean.json` / `food_access_clean.json` | Food assistance proxy, not total food insecurity |
| 6 | Housing cost burden | 58.7% renters ≥30% (2023) | `housing_stability_clean.json` | ACS B25070 rent-burden proxy |
| 7 | ACS median income / rent burden | Per `acs_housing_demographics_clean.json` | `acs_housing_demographics_clean.json` | ACS 5-year estimates |
| 8 | Uninsured children | 5.13% in 2024 | `public_health_mental_health_clean.json` | Clinical care access, not mental health |
| 9 | CDC WONDER suicide deaths | 20 in 2023 | `cdc_wonder_suicide_clean.json` | NCHS/IDOH vital statistics; API county export blocked |
| 10 | Mental health signal | 20 suicide deaths in 2023 | `mental_health_clean.json` | All-age mortality signal, not youth survey |

### Measurement method

An indicator is **verified** only when all of the following are true:

1. Raw source file exists under `data/raw/`
2. ETL function in `etl/automated_pipeline.py` processes it
3. Clean CSV/JSON exists under `data/processed/`
4. Verified JSON is exported to `website/data/verified/`
5. Validation report documents it (`phase6` or `phase8` report)
6. Limitations are documented in methodology or validation warnings

### Interpretation

The project covers poverty, education, economy, demographics, social services/food assistance, housing, public health (clinical care), CDC WONDER/NCHS mortality, and a mental health crisis signal — each with documented scope notes.

### Limitation

"Housing stability" is a rent-burden proxy. "Food access" is a SNAP proxy. "Mental health" is suicide mortality, not a youth behavioral health survey.

---

## Section 6: Result 5 — Data Quality Improvement

### Claim

The project improved transparency by identifying inconsistent dashboard claims.

### Evidence files

| File | Role |
|---|---|
| [`docs/metric_validation.md`](metric_validation.md) | Human-readable validation summary |
| [`data/processed/metric_validation_report.json`](../data/processed/metric_validation_report.json) | Poverty validation output |
| [`data/processed/phase6_indicator_validation_report.json`](../data/processed/phase6_indicator_validation_report.json) | Multi-indicator validation |

### Measurement method

The ETL pipeline compares source-derived values against older dashboard JSON claims where available. Discrepancies are written to validation reports rather than silently overwritten.

### Flagged examples (from ETL validation)

| Topic | Original dashboard claim | Verified source value | Status |
|---|---|---|---|
| Child poverty change | 8.3 percentage-point reduction | 6.2 pp (2014–2024) | Flagged |
| Graduation rate | 95% | 90.77% in 2017 | Flagged |
| Unemployment rate | 3.9% | 5.8% in 2025 | Flagged |

### Interpretation

The project improves data reliability by separating **verified** metrics (in `website/data/verified/`) from **legacy** dashboard JSON (in `website/data/processed/`) and documenting mismatches.

### Safe wording

> "Identified and documented inconsistencies between original dashboard claims and source-derived metrics."

### Limitation

Flagging a mismatch does not prove the original claim is wrong in every context. It means the claim was **not verified** from the currently processed source files in this repository.

---

## Section 7: Result 6 — Storytelling and Stakeholder Accessibility

### Claim

The dashboard translates complex metrics into storytelling-driven insights.

### Evidence files

| File | Role |
|---|---|
| [`docs/mc3_storytelling_layer.md`](mc3_storytelling_layer.md) | Storytelling design documentation |
| [`website/index.html`](../website/index.html) | Story sections and verified cards |
| [`website/js/verified-indicators.js`](../website/js/verified-indicators.js) | Verified card rendering and mini charts |

### Measurement method

A homepage verified indicator presentation counts as **stakeholder-accessible** when it includes:

1. Verified metric value
2. Year
3. Trend label or direction
4. Plain-English story connection
5. "Why it matters" context
6. Source note
7. Limitation or scope note
8. Chart or visual representation

### Current result

All **five primary verified indicator cards** on the homepage (poverty, graduation, unemployment, child population, SNAP) include storytelling context, mini trend charts, and validation notes. Additional verified JSON files exist for housing, food access, CDC WONDER, and mental health but are not displayed as separate homepage cards (by design — existing five cards were preserved).

### Interpretation

The dashboard supports non-technical interpretation by pairing Chart.js visuals with plain-English explanations and caution notes aligned to the MC3 theme *"What surrounds us, shapes us."*

### Limitation

This is a **design and documentation result**. Stronger evidence would require stakeholder feedback, usability testing, or session recordings from community partners.

---

## Section 8: Result 7 — Tableau and Dashboard Evidence

### Claim

The project used Pandas and Tableau for analysis.

### Evidence files

| File | Role |
|---|---|
| [`tableau/mc3_child_poverty_trends.twb`](../tableau/mc3_child_poverty_trends.twb) | Poverty trend workbook |
| [`tableau/mc3_housing_stability.twb`](../tableau/mc3_housing_stability.twb) | Housing rent burden workbook |
| [`tableau/mc3_mental_health_suicide.twb`](../tableau/mc3_mental_health_suicide.twb) | Mental health suicide signal workbook |
| [`tableau/mc3_multi_indicator_dashboard.twb`](../tableau/mc3_multi_indicator_dashboard.twb) | CDC WONDER suicide workbook |
| [`docs/tableau_claim_check.md`](tableau_claim_check.md) | Tableau vs Chart.js claim audit |
| [`etl/generate_tableau_workbooks.py`](../etl/generate_tableau_workbooks.py) | Workbook generator |

### Measurement method

Tableau is considered **evidenced** when:

1. `.twb` workbook files exist in `tableau/`
2. Workbooks reference processed CSV files under `data/processed/`
3. Documentation identifies which indicators each workbook analyzes

**Pandas** is evidenced by all ETL functions in `etl/automated_pipeline.py` producing `*_clean.csv` outputs.

**Chart.js** powers the public website (`website/js/verified-indicators.js`, `verified-poverty-chart.js`).

### Interpretation

The project contains Tableau workbook evidence connected to verified ETL outputs. Pandas handles processing; Tableau supports exploratory analysis; Chart.js handles the public interactive dashboard.

### Limitation

Workbooks are **generated XML templates** (`generate_tableau_workbooks.py`), not hand-built Tableau Desktop screenshots. For stronger portfolio proof, open workbooks in Tableau Desktop, capture screenshots in `tableau/screenshots/`, and note any manual chart customization.

---

## Section 9: Result 8 — Public-Facing Website

### Claim

The project designed and deployed a public-facing interactive visualization website.

### Evidence

| Asset | Location |
|---|---|
| Static site | [`website/index.html`](../website/index.html) |
| JavaScript / Chart.js | [`website/js/`](../website/js/) |
| Verified data | [`website/data/verified/`](../website/data/verified/) |
| Deployment reference | [mc3-monroecounty2025.netlify.app](https://mc3-monroecounty2025.netlify.app/) |

### Measurement method

The website is considered **complete** when:

1. Static site runs locally without a build step
2. Verified indicators load from `website/data/verified/`
3. Charts render via Chart.js
4. Storytelling sections appear on the homepage
5. Site can be deployed to Netlify with publish directory `website`

**Local command:**

```bash
cd website
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

### Interpretation

A public Netlify reference deployment exists. The site is interactive (Chart.js mini charts, poverty trend chart, verified card interactions) and stakeholder-facing.

### Limitation

If your personal deployment differs from the reference link, use **"developed"** until your own Netlify URL is confirmed live. This document does not modify the site or redeploy it.

---

## Section 10: Final Claim Status Table

| Claim | Evidence File | Measurement Method | Status | Safe Resume Wording |
|---|---|---|---|---|
| ETL processing reduction | `manual_baseline_results.json`, `etl_benchmark_results.json` | Benchmark formula: ((manual − auto) / manual) × 100 | **Proven** (99.9%) | Reduced documented manual processing time by over 30% based on benchmarked ETL runtime |
| Accessibility improvement | `accessibility_audit_summary.json`, `accessibility_scoring_rubric.csv` | Rubric before/after: ((after − before) / before) × 100 | **Proven** (100% rubric) | Improved documented data accessibility by over 40% using a before/after rubric |
| Five-plus policy recommendations | `policy_recommendations.md` | Count of structured recommendations | **Proven** (6) | Supported six data-informed policy recommendations |
| ACS integration | `acs_housing_demographics_clean.json`, `acs_source_integration.md` | ETL + raw file lineage | **Proven** | Integrated ACS housing and income tables via Python ETL |
| CDC WONDER / NCHS integration | `cdc_wonder_suicide_clean.json`, `cdc_wonder_source_integration.md` | Raw extract + ETL + query metadata | **Proven** (with scope note) | Integrated CDC WONDER / NCHS suicide mortality data for Monroe County |
| Tableau analysis | `tableau/*.twb`, `tableau_claim_check.md` | Workbook file existence + CSV connections | **Proven** | Created Tableau workbooks connected to verified ETL outputs |
| Housing coverage | `housing_stability_clean.json` | ACS B25070 rent burden ETL | **Proven** (proxy) | Analyzed housing cost burden from ACS rent-burden data |
| Food access coverage | `food_access_clean.json` | SNAP participation ETL | **Partial** (proxy) | Analyzed SNAP food assistance access as a food access proxy |
| Mental health signal | `mental_health_clean.json` | CDC WONDER / NCHS suicide ETL | **Partial** (mortality signal) | Analyzed county suicide deaths as a mental health crisis signal |
| Public-facing website | `website/`, Netlify reference | Local serve + verified JSON + Chart.js | **Proven** | Designed and deployed a public-facing interactive visualization website |
| Storytelling insights | `mc3_storytelling_layer.md`, `website/index.html` | Story criteria checklist on verified cards | **Proven** | Translated complex metrics into storytelling-driven stakeholder insights |

---

## Section 11: Safe Wording Rules

### Use

- documented
- benchmarked
- rubric-based
- verified
- source-derived
- ETL-processed
- data-informed
- stakeholder-facing
- may help / could support / can inform

### Avoid unless externally proven

- caused
- drove
- guaranteed
- official (unless citing an official source file)
- proved policy impact
- certified accessibility
- full mental health analysis
- CDC WONDER (without noting NCHS/IDOH methodology where API export was blocked)

---

## Section 12: Final Summary

The project can now support stronger resume bullets because each major result has a corresponding evidence file, measurement method, and limitation note.

**Strongest claims (well-evidenced):**

- ETL automation and processing-time reduction (benchmarked: 99.9%)
- Verified indicator processing across poverty, education, economy, demographics, social services, housing, and mortality
- Data quality validation (flagged dashboard mismatches)
- Tableau workbook creation linked to ETL outputs
- Six data-informed policy recommendations
- Storytelling-driven dashboard design with verified Chart.js cards

**Claimable with scope notes:**

- Accessibility improvement (100% rubric improvement; not externally certified)
- CDC WONDER / mental health (NCHS vital statistics suicide counts; not youth survey data)
- Food access (SNAP proxy only)

**Describe honestly:**

Accessibility and processing-time improvements are claimable as **documented internal measurements** (rubric-based and benchmarked). They should not be described as externally certified or analyst-stopwatch-verified unless additional third-party audits or timed manual studies are added to the repository.

---

*Last updated: Phase 8.1 — results measurement methodology. Regenerate benchmarks with `cd etl && python manual_baseline_etl.py && python benchmark_etl.py && python run_accessibility_audits.py`.*
