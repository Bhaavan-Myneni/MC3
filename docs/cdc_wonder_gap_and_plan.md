# CDC WONDER Gap and Plan

## Finding

**No confirmed CDC WONDER extract was found** in the current `data/raw` inventory.

Searches covered:

- Filenames and paths containing: `CDC`, `WONDER`, `wonder`
- Public health themes: mortality, injury, behavioral health, youth mental health
- Existing data inventory under `data/raw/` and `DATASET-*/`

## What Exists Instead

The project currently supports **public health / clinical care access** through:

| Source | Location | Indicator |
|---|---|---|
| `Clinical Care.csv` | `data/raw/misc/dataset_archive/Clinical Care.csv` | Uninsured children rate (Monroe County, 2014–2022) |

This file is processed by `clean_public_health_or_mental_health()` in `etl/automated_pipeline.py`.

**Important:** This is **not** CDC WONDER data and **not** a youth mental health indicator.

## Resume Claim Guidance

| Claim | Status |
|---|---|
| "CDC WONDER integration" | **Do not claim** until a real CDC WONDER export is added and processed |
| "Public health indicators from county source files" | **Safe** with `Clinical Care.csv` evidence |
| "Youth mental health analysis" | **Do not claim** — no verified mental health source in repo |

## Future Improvement Plan

If CDC WONDER integration is needed:

1. **Download** a documented query from [CDC WONDER](https://wonder.cdc.gov/) (e.g. youth injury mortality, drug overdose, or other Monroe County–filterable outcome).
2. **Store raw export** under `data/raw/public_health/cdc_wonder/` with query metadata (date, parameters, URL).
3. **Add ETL function** `clean_cdc_wonder_<topic>()` following existing lineage patterns.
4. **Update** `docs/public_health_source_integration.md` and `docs/resume_claim_evidence_tracker.md`.
5. **Re-run** `python automated_pipeline.py` and `python final_validation.py`.

Until those steps are completed, CDC WONDER remains a **planned improvement**, not a verified integration.
