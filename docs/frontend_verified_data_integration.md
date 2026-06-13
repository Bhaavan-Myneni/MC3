# Frontend Verified Data Integration

**Phase:** 5 — connect reproducible ETL output to the static website without breaking the existing dashboard.

---

## 1. Why Verified Data Was Added Separately

The original website reads pre-built JSON from `website/data/processed/`. Some summary metrics (e.g., **8.3 percentage-point** poverty reduction) do not match the confirmed source file.

Phase 5 adds a **parallel data path**:

```
ETL pipeline → data/processed/ → website/data/verified/ → new homepage section
```

The original dashboard JSON remains untouched so existing charts and pages keep working.

---

## 2. Why Existing Dashboard JSON Was Not Overwritten

| Reason | Detail |
|--------|--------|
| Safety | Existing Netlify deployment depends on current files |
| Comparison | Allows side-by-side review of old vs verified metrics |
| Governance | Follows project rule: do not delete or break working files |
| Rollback | Site works even if verified export fails |

**Unchanged:** `website/data/processed/*.json` (13 files)

---

## 3. Verified Files Exported from ETL

`etl/automated_pipeline.py` → `export_verified_json_for_website()` copies:

| File | Source |
|------|--------|
| `website/data/verified/children_in_poverty_clean.json` | `data/processed/children_in_poverty_clean.json` |
| `website/data/verified/poverty_metrics_verified.json` | `data/processed/poverty_metrics_verified.json` |
| `website/data/verified/metric_validation_report.json` | `data/processed/metric_validation_report.json` |

Regenerate:

```bash
cd etl
python automated_pipeline.py
```

---

## 4. How the Homepage Loads Verified Poverty Data

### JavaScript modules

| File | Role |
|------|------|
| `website/js/verified-data.js` | Fetch verified JSON; format helpers |
| `website/js/verified-poverty-chart.js` | Populate metrics; render Chart.js chart |

### Load sequence

1. `DOMContentLoaded` fires
2. `initVerifiedPovertySection()` runs
3. Parallel fetch of trend, metrics, and validation report
4. Metric text elements updated
5. Validation warning shown if 8.3pp mismatch detected
6. Chart.js line chart rendered

If verified files are missing, the section shows fallback text and **does not break** other dashboard scripts.

---

## 5. How the Chart Is Rendered

- **Canvas:** `#verifiedPovertyChart`
- **Data field:** `children_in_poverty_rate_pct` (fallback: `children_in_poverty` × 100)
- **Years:** 2014–2024
- **Library:** Chart.js (already on page via CDN)
- **Style:** Navy/gold MC3 palette consistent with existing portal

Function: `renderVerifiedPovertyChart()` in `verified-poverty-chart.js`

---

## 6. How the 6.2pp Metric Is Displayed

From `poverty_metrics_verified.json`:

| Element | Value |
|---------|-------|
| `#verified-start-rate` | 20.2% |
| `#verified-end-rate` | 14.0% |
| `#verified-pp-change` | 6.2 percentage points |
| `#verified-relative-change` | -30.69% |

These match the ETL calculation: `start_value_pct - end_value_pct = 20.2 - 14.0 = 6.2`.

---

## 7. Why the 8.3pp Claim Remains Flagged

`dashboard_summary.json` key finding: *"8.3 percentage point reduction in child poverty"*

ETL validation confirms **6.2 percentage points** from `Children in Poverty.csv`.

The verified section displays a **validation warning box** (not the 8.3 value as verified). The older Key Findings card still shows -8.3% for historical comparison — it was not removed to avoid breaking layout, but it is **not** presented as ETL-verified.

---

## 8. Portfolio Credibility

This integration demonstrates:

- Reproducible Python ETL → static JSON export
- Metric validation with discrepancy flagging
- Safe frontend integration without breaking production data
- Chart.js visualization from verified source
- Data governance (traceable source file, lineage metadata)

**Safe resume bullet:**

> Connected a reproducible Python ETL output to a static web dashboard by exporting verified JSON data and rendering a validated child poverty trend chart with JavaScript and Chart.js.

---

## 9. How to Test Locally

```bash
# 1. Run ETL (exports to website/data/verified/)
cd etl
python automated_pipeline.py

# 2. Serve website
cd ../website
python3 -m http.server 8000
```

Open: **http://localhost:8000**

### Checklist

- [ ] Verified section appears below Key Findings
- [ ] Badge shows "Verified by ETL"
- [ ] Metrics show 20.2%, 14.0%, 6.2 percentage points
- [ ] Line chart renders 2014–2024
- [ ] Validation warning mentions 8.3pp flagged
- [ ] Original hero stats and insight cards still load
- [ ] No console errors blocking existing `main.js`

---

## File Map

```
website/
├── data/
│   ├── processed/          # ORIGINAL dashboard JSON (unchanged)
│   └── verified/           # NEW ETL exports
├── js/
│   ├── verified-data.js    # NEW
│   ├── verified-poverty-chart.js  # NEW
│   ├── main.js             # unchanged
│   └── visualizations.js   # unchanged
├── css/style.css           # verified section styles added
└── index.html              # verified section added
```

---

## Related Documentation

- [`etl_pipeline.md`](etl_pipeline.md)
- [`metric_validation.md`](metric_validation.md)
- [`database_schema.md`](database_schema.md)
