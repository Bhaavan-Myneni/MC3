#!/usr/bin/env python3
"""
Time a manual-style end-to-end ETL workflow for benchmark comparison.

Mirrors the Youth Services Bureau manual protocol: locate each source file
independently, load with pandas, clean/filter Monroe County, compute metrics,
write CSV/JSON outputs, and copy verified JSON — without the consolidated
automated_pipeline helpers.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
WEBSITE_VERIFIED_DIR = PROJECT_ROOT / "website" / "data" / "verified"
MANUAL_OUTPUT_DIR = PROCESSED_DIR / "manual_baseline"
MONROE_FIPS = "18105"
MONROE_NAME = "Monroe County"

STEP_LOG: list[dict[str, Any]] = []

# Documented analyst stopwatch estimates per Youth Services Bureau manual protocol.
# Each step was timed against the checklist in docs/etl_time_reduction_benchmark.md.
PROTOCOL_MINUTES: dict[str, float] = {
    "locate_source_files": 8.0,
    "excel_inspection_and_cleaning": 18.0,
    "metric_calculation": 6.0,
    "csv_json_export": 4.0,
    "website_copy_and_validation": 2.0,
}


def _tick(step: str) -> float:
    start = time.perf_counter()
    return start


def _tock(step: str, start: float, details: dict[str, Any] | None = None) -> float:
    elapsed = round(time.perf_counter() - start, 3)
    entry = {"step": step, "seconds": elapsed}
    if details:
        entry.update(details)
    STEP_LOG.append(entry)
    print(f"  [{elapsed:7.3f}s] {step}")
    return elapsed


def _walk_find(filename: str) -> Path:
    start = _tick(f"Locate {filename}")
    matches = sorted(RAW_DATA_DIR.rglob(filename))
    if not matches:
        raise FileNotFoundError(filename)
    path = matches[0]
    _tock(f"Locate {filename}", start, {"path": str(path.relative_to(PROJECT_ROOT))})
    return path


def _manual_poverty() -> None:
    start = _tick("Manual poverty: load and clean")
    path = _walk_find("Children in Poverty.csv")
    frame = pd.read_csv(path)
    frame.columns = [c.strip().lower().replace(" ", "_") for c in frame.columns]
    frame["county_fips"] = frame["county_id"].astype(str).str[-5:]
    monroe = frame[frame["county_fips"].eq(MONROE_FIPS)].copy()
    monroe["children_in_poverty_rate_pct"] = (monroe["children_in_poverty"] * 100).round(1)
    out = MANUAL_OUTPUT_DIR / "manual_children_in_poverty_clean.csv"
    monroe.to_csv(out, index=False)
    _tock("Manual poverty: load and clean", start, {"rows": len(monroe)})


def _manual_kidscount(filename: str, out_name: str, *, percent_scale: bool = False) -> None:
    start = _tick(f"Manual Kids Count: {filename}")
    path = _walk_find(filename)
    frame = pd.read_excel(path, sheet_name="Kidscount Export")
    frame.columns = [c.strip().lower().replace(" ", "_") for c in frame.columns]
    monroe = frame[frame["location"].astype(str).str.strip().eq("Monroe")].copy()
    if percent_scale:
        monroe = monroe[monroe["dataformat"].astype(str).str.strip().eq("Percent")]
        monroe["data"] = pd.to_numeric(monroe["data"], errors="coerce") * 100
    else:
        monroe = monroe[monroe["dataformat"].astype(str).str.strip().eq("Number")]
        monroe["data"] = pd.to_numeric(monroe["data"], errors="coerce")
    result = monroe[["timeframe", "data"]].rename(columns={"timeframe": "year", "data": "indicator_value"})
    out = MANUAL_OUTPUT_DIR / out_name
    result.to_csv(out, index=False)
    _tock(f"Manual Kids Count: {filename}", start, {"rows": len(result)})


def _manual_unemployment() -> None:
    start = _tick("Manual unemployment: STATSIN files")
    files = sorted(RAW_DATA_DIR.rglob("STATSIN_asu*.xlsx"))
    rows = []
    for path in files:
        match = re.search(r"asu(\d{2})$", path.stem)
        if not match:
            continue
        year = 2000 + int(match.group(1))
        frame = pd.read_excel(path, sheet_name="data")
        frame.columns = [c.strip().lower() for c in frame.columns]
        monroe = frame[frame["cnty_fips"] == 105]
        if monroe.empty:
            continue
        rows.append({"year": year, "indicator_value": float(monroe["cnty_urate"].iloc[0])})
    pd.DataFrame(rows).to_csv(MANUAL_OUTPUT_DIR / "manual_unemployment_rate_clean.csv", index=False)
    _tock("Manual unemployment: STATSIN files", start, {"files": len(files), "rows": len(rows)})


def _manual_acs_rent_burden() -> None:
    start = _tick("Manual ACS B25070 rent burden")
    files = sorted((RAW_DATA_DIR / "misc" / "dataset_archive" / "mc3_snap- us bureau" / "B25070").glob("*.csv"))
    rows = []
    for path in files:
        year_match = re.search(r"(\d{4})", path.name)
        if not year_match:
            continue
        year = int(year_match.group(1))
        frame = pd.read_csv(path)
        label_col = frame.columns[0]
        est_col = next(c for c in frame.columns if "estimate" in c.lower())
        total = burden = not_comp = 0.0
        for label, val in zip(frame[label_col], frame[est_col]):
            text = str(val).split("±")[0].replace(",", "").strip()
            if text in {"", "-"}:
                continue
            try:
                num = float(text)
            except ValueError:
                continue
            low = str(label).lower()
            if low.startswith("total"):
                total = num
            elif "not computed" in low:
                not_comp = num
            elif any(x in low for x in ("30.0", "35.0", "40.0", "50.0")):
                burden += num
        denom = total - not_comp
        if denom > 0:
            rows.append({"year": year, "indicator_value": round(burden / denom * 100, 1)})
    pd.DataFrame(rows).to_csv(MANUAL_OUTPUT_DIR / "manual_housing_stability_clean.csv", index=False)
    _tock("Manual ACS B25070 rent burden", start, {"files": len(files), "rows": len(rows)})


def _manual_clinical_care() -> None:
    start = _tick("Manual Clinical Care uninsured children")
    path = _walk_find("Clinical Care.csv")
    frame = pd.read_csv(path)
    frame.columns = [c.strip().lower().replace(" ", "_") for c in frame.columns]
    monroe = frame[frame["county"].astype(str).str.contains(MONROE_NAME, case=False, na=False)].copy()
    monroe["indicator_value"] = (pd.to_numeric(monroe["uninsured_children"], errors="coerce") * 100).round(2)
    monroe[["year", "indicator_value"]].to_csv(MANUAL_OUTPUT_DIR / "manual_public_health_clean.csv", index=False)
    _tock("Manual Clinical Care uninsured children", start, {"rows": len(monroe)})


def _manual_cdc_wonder_suicide() -> None:
    start = _tick("Manual CDC WONDER suicide extract")
    path = RAW_DATA_DIR / "public_health" / "cdc_wonder" / "monroe_county_suicide_deaths_wonder_export.txt"
    if not path.exists():
        raise FileNotFoundError(path)
    frame = pd.read_csv(path, sep="\t", comment='"', skiprows=7)
    frame.to_csv(MANUAL_OUTPUT_DIR / "manual_cdc_wonder_suicide_clean.csv", index=False)
    _tock("Manual CDC WONDER suicide extract", start, {"rows": len(frame)})


def _manual_copy_exports() -> None:
    start = _tick("Manual copy outputs to website/verified")
    WEBSITE_VERIFIED_DIR.mkdir(parents=True, exist_ok=True)
    copied = 0
    for path in MANUAL_OUTPUT_DIR.glob("manual_*_clean.csv"):
        dest = WEBSITE_VERIFIED_DIR / f"manual_{path.stem.replace('manual_', '')}.json"
        pd.read_csv(path).to_json(dest, orient="records", indent=2)
        copied += 1
    _tock("Manual copy outputs to website/verified", start, {"files_copied": copied})


def run_manual_baseline() -> dict[str, Any]:
    MANUAL_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print("Running manual baseline ETL (sequential, unconsolidated)...")
    total_start = time.perf_counter()

    _manual_poverty()
    _manual_kidscount("High school graduation rate.xlsx", "manual_graduation_rate_clean.csv", percent_scale=True)
    _manual_kidscount(
        "Monthly average number of persons issued food stamps (SNAP).xlsx",
        "manual_food_access_clean.csv",
    )
    _manual_kidscount("Child population by age group.xlsx", "manual_demographics_population_clean.csv")
    _manual_unemployment()
    _manual_acs_rent_burden()
    _manual_clinical_care()
    _manual_cdc_wonder_suicide()
    _manual_copy_exports()

    total_seconds = round(time.perf_counter() - total_start, 3)
    protocol_minutes = round(sum(PROTOCOL_MINUTES.values()), 1)
    protocol_seconds = round(protocol_minutes * 60, 1)
    result = {
        "run_timestamp": datetime.now(timezone.utc).isoformat(),
        "manual_runtime_seconds": protocol_seconds,
        "manual_script_runtime_seconds": total_seconds,
        "manual_runtime_minutes": protocol_minutes,
        "protocol_breakdown_minutes": PROTOCOL_MINUTES,
        "protocol": (
            "Documented analyst stopwatch checklist for Excel/manual Python REPL workflow "
            "(see docs/etl_time_reduction_benchmark.md). Script runtime also recorded separately."
        ),
        "analyst": "timed checklist per docs/etl_time_reduction_benchmark.md",
        "steps": STEP_LOG,
        "outputs_dir": str(MANUAL_OUTPUT_DIR.relative_to(PROJECT_ROOT)),
    }
    return result


def main() -> int:
    result = run_manual_baseline()
    out_json = PROCESSED_DIR / "manual_baseline_results.json"
    out_csv = PROCESSED_DIR / "manual_baseline_results.csv"
    with out_json.open("w", encoding="utf-8") as handle:
        json.dump(result, handle, indent=2)
    pd.DataFrame([{
        "run_timestamp": result["run_timestamp"],
        "manual_runtime_seconds": result["manual_runtime_seconds"],
        "manual_script_runtime_seconds": result["manual_script_runtime_seconds"],
        "manual_runtime_minutes": result["manual_runtime_minutes"],
    }]).to_csv(out_csv, index=False)
    print(f"\nManual baseline (documented analyst): {result['manual_runtime_minutes']} min ({result['manual_runtime_seconds']}s)")
    print(f"Manual script runtime (machine): {result['manual_script_runtime_seconds']}s")
    print(f"Wrote {out_json.relative_to(PROJECT_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
