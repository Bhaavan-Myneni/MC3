# MC3 Interview Guide

Use this guide to explain the project in portfolio reviews, recruiter screens, and technical interviews. Stick to **verified** claims only.

---

## 30-Second Elevator Pitch

> I upgraded a Monroe County childhood conditions dashboard into a full data engineering portfolio. I cataloged 1,100+ real source files, built a Python ETL pipeline that validates five community indicators, exported verified JSON to a static website, and documented where the original dashboard numbers didn't match the source files. The site also includes an MC3 storytelling layer connecting indicators to the theme "what surrounds us, shapes us."

---

## 2-Minute Technical Walkthrough

1. **Problem:** Community indicators were spread across CSV, Excel, JSON, and GIS files. Dashboard metrics were hard to verify.
2. **Inventory:** Automated scan of 1,134 files → `data_inventory.csv/json`.
3. **ETL:** `automated_pipeline.py` cleans five indicators from real source files.
4. **Validation:** Compares ETL output to original dashboard JSON; flags mismatches (8.3pp vs 6.2pp poverty, 95% vs 90.77% graduation, 3.9% vs 5.8% unemployment).
5. **Export:** Verified JSON → `website/data/verified/` (separate from original `processed/` JSON).
6. **Frontend:** Static HTML/JS dashboard with five verified cards, mini charts, storytelling, and a detailed poverty trend.
7. **Database (optional):** PostgreSQL schema + views for SQL reporting; site works without it.

---

## Verified Indicators (Memorize These)

| Indicator | Verified value | Source |
|-----------|---------------|--------|
| Child poverty | 14.0% in 2024; down 6.2pp from 2014 | `Children in Poverty.csv` |
| Graduation | 90.77% in 2017 | `High school graduation rate.xlsx` |
| Unemployment | 5.8% in 2025 | `STATSIN_asu20–25.xlsx` |
| Child population | 44,236 in 2021 | `Child population by age group.xlsx` |
| SNAP | 7,527 avg monthly in 2023 | Monthly average SNAP xlsx |

---

## Claims to Avoid

| Do NOT say | Say instead |
|------------|-------------|
| "Poverty fell 8.3 percentage points" | "Verified decrease is 6.2pp; 8.3pp claim is flagged" |
| "95% graduation rate" | "Verified rate is 90.77% in 2017; source ends there" |
| "3.9% unemployment" | "Verified county rate is 5.8% in 2025" |
| "Improved accessibility 40%" | "Not benchmarked — not claimed" |
| "Reduced ETL time 30%" | "Not benchmarked — not claimed" |
| "This caused poverty to fall" | "The trend shows improvement; we don't claim causation" |

---

## Common Interview Questions

### "What was the hardest part?"

Tracing dashboard numbers back to source files and deciding to **flag discrepancies publicly** instead of hiding them. That strengthens credibility.

### "Why separate `verified/` from `processed/` JSON?"

The original dashboard JSON powers legacy subpage charts. Verified exports come from the ETL pipeline. Keeping them separate prevents overwriting unvalidated data and makes the validation story clear.

### "Why is PostgreSQL optional?"

The portfolio demonstrates that ETL + static JSON can serve a public dashboard without a live database. PostgreSQL shows I can model data for SQL reporting when needed.

### "How does the storytelling layer work?"

Phase 6.6 connected verified indicators to MC3's theme and CDC Essentials for Childhood. Each card has story context, why it matters, and a limitation note. Cross-indicator reading and policy-use sections avoid causal overclaiming.

### "What would you do next?"

- Verify newer graduation data beyond 2017
- Complete end-to-end PostgreSQL Docker testing
- Extend ETL to additional indicators (health, housing)
- Deploy to Netlify with screenshots for README

### "How do you ensure data quality?"

Reproducible ETL, source file attribution, validation reports, limitation notes on every card, and explicit flags when dashboard claims diverge from sources.

---

## Resume Bullets (Safe to Use)

- Built a reproducible Python ETL pipeline validating five Monroe County community indicators from real CSV/Excel sources with automated validation reports.
- Designed a verified multi-indicator static dashboard with Chart.js trend charts and ETL-generated JSON exports separate from legacy dashboard data.
- Documented metric discrepancies between original dashboard claims and source-derived values to strengthen data quality and portfolio credibility.
- Added a public-sector storytelling layer connecting verified indicators to the MC3 theme "what surrounds us, shapes us" and CDC Essentials for Childhood concepts.
- Designed PostgreSQL schema and reporting views for optional SQL analytics on verified ETL output.

---

## Demo Script (5 Minutes)

1. Open homepage → scroll to **What Surrounds Us, Shapes Us**
2. Show **Verified Community Indicators** — five cards with ETL values
3. Point out limitation notes and validation warning box
4. Show mini charts and **Reading the Indicators Together**
5. Open detailed poverty chart — explain 6.2pp vs flagged 8.3pp
6. Run ETL live: `cd etl && python automated_pipeline.py`
7. Show `website/data/verified/children_in_poverty_clean.json`
8. Mention PostgreSQL schema exists but static site doesn't need it

---

## Files to Know Cold

| File | Purpose |
|------|---------|
| `etl/automated_pipeline.py` | Main ETL |
| `etl/data_inventory.py` | File catalog |
| `website/js/verified-indicators.js` | Verified dashboard UI |
| `website/data/verified/` | ETL exports for website |
| `database/schema/002_add_verified_indicators.sql` | Multi-indicator tables |
| `docs/metric_validation.md` | Discrepancy documentation |

---

## Related Docs

- [`final_project_audit.md`](final_project_audit.md)
- [`deployment_guide.md`](deployment_guide.md)
- [`metric_validation.md`](metric_validation.md)
- [`mc3_storytelling_layer.md`](mc3_storytelling_layer.md)
