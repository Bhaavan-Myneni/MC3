#!/usr/bin/env python3
"""Calculate accessibility improvement percentage from rubric CSV."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RUBRIC_PATH = PROJECT_ROOT / "docs" / "accessibility_scoring_rubric.csv"
OUTPUT_PATH = PROJECT_ROOT / "data" / "processed" / "accessibility_score_summary.json"


def calculate() -> dict:
    if not RUBRIC_PATH.exists():
        raise FileNotFoundError(f"Rubric not found: {RUBRIC_PATH}")

    frame = pd.read_csv(RUBRIC_PATH)
    required = {"category", "before_score", "after_score"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"Rubric missing columns: {sorted(missing)}")

    before_total = float(frame["before_score"].sum())
    after_total = float(frame["after_score"].sum())
    if before_total <= 0:
        improvement = None
    else:
        improvement = round(((after_total - before_total) / before_total) * 100, 1)

    return {
        "categories_scored": int(len(frame)),
        "before_total_score": before_total,
        "after_total_score": after_total,
        "max_possible_score": int(len(frame) * 5),
        "accessibility_improvement_percent": improvement,
        "claimable_40_percent": improvement is not None and improvement >= 40,
        "rubric_file": str(RUBRIC_PATH.relative_to(PROJECT_ROOT)),
    }


def main() -> int:
    summary = calculate()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2)

    print(json.dumps(summary, indent=2))
    if summary["accessibility_improvement_percent"] is None:
        print("Accessibility improvement is not yet calculable.")
        return 1
    if not summary["claimable_40_percent"]:
        print(
            f"Improvement is {summary['accessibility_improvement_percent']}%; "
            "40% claim is not supported."
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
