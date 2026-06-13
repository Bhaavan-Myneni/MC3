#!/usr/bin/env python3
"""
Time the MC3 automated ETL pipeline and record benchmark metrics.

Outputs:
  data/processed/etl_benchmark_results.json
  data/processed/etl_benchmark_results.csv
"""

from __future__ import annotations

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
sys.path.insert(0, str(PROJECT_ROOT / "etl"))

from automated_pipeline import run_pipeline  # noqa: E402


def count_processed_outputs() -> tuple[int, int]:
    """Return (file_count, indicator_json_count) under data/processed."""
    if not PROCESSED_DIR.exists():
        return 0, 0
    files = list(PROCESSED_DIR.glob("*"))
    indicator_files = [
        path
        for path in files
        if path.suffix == ".json"
        and path.name.endswith("_clean.json")
        and path.name != "children_in_poverty_clean.json"
    ]
    return len(files), len(indicator_files) + 1  # include poverty indicator


def run_benchmark() -> dict:
    start = time.perf_counter()
    exit_code = run_pipeline()
    elapsed = round(time.perf_counter() - start, 3)
    files_processed, indicators_processed = count_processed_outputs()

    manual_path = PROCESSED_DIR / "manual_baseline_results.json"
    manual_runtime = None
    reduction_percent = None
    if manual_path.exists():
        manual_data = json.loads(manual_path.read_text(encoding="utf-8"))
        manual_runtime = manual_data.get("manual_runtime_seconds")
        if manual_runtime and manual_runtime > 0:
            reduction_percent = round(((manual_runtime - elapsed) / manual_runtime) * 100, 1)

    result = {
        "run_timestamp": datetime.now(timezone.utc).isoformat(),
        "automated_runtime_seconds": elapsed,
        "pipeline_exit_code": exit_code,
        "files_processed": files_processed,
        "indicators_processed": indicators_processed,
        "outputs_created": sorted(
            path.name for path in PROCESSED_DIR.glob("*") if path.is_file()
        ),
        "manual_baseline_recorded": manual_path.exists(),
        "manual_runtime_seconds": manual_runtime,
        "processing_time_reduction_percent": reduction_percent,
        "notes": (
            "30% reduction is supported when manual_baseline_results.json exists and "
            "processing_time_reduction_percent >= 30."
            if reduction_percent is not None and reduction_percent >= 30
            else "Run etl/manual_baseline_etl.py before benchmark to record manual timing."
        ),
    }
    return result


def save_benchmark(result: dict) -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    json_path = PROCESSED_DIR / "etl_benchmark_results.json"
    csv_path = PROCESSED_DIR / "etl_benchmark_results.csv"

    with json_path.open("w", encoding="utf-8") as handle:
        json.dump(result, handle, indent=2)

    pd.DataFrame([result]).to_csv(csv_path, index=False)
    print(f"Wrote {json_path.relative_to(PROJECT_ROOT)}")
    print(f"Wrote {csv_path.relative_to(PROJECT_ROOT)}")
    print(f"Automated runtime: {result['automated_runtime_seconds']} seconds")


if __name__ == "__main__":
    result = run_benchmark()
    save_benchmark(result)
    sys.exit(result["pipeline_exit_code"])
