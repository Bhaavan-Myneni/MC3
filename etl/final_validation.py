#!/usr/bin/env python3
"""Validate Phase 8 resume-claim evidence artifacts."""

from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = PROJECT_ROOT / "docs"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
README = PROJECT_ROOT / "README.md"


def check_exists(path: Path, label: str, results: list[dict]) -> None:
    results.append(
        {
            "check": label,
            "path": str(path.relative_to(PROJECT_ROOT)),
            "passed": path.exists(),
        }
    )


def check_readme_section(results: list[dict]) -> None:
    text = README.read_text(encoding="utf-8") if README.exists() else ""
    passed = "## Resume Claim Evidence" in text
    results.append(
        {
            "check": "README Resume Claim Evidence section",
            "path": "README.md",
            "passed": passed,
        }
    )


def main() -> int:
    results: list[dict] = []

    required_docs = [
        ("resume_claim_evidence_tracker.md", "Resume claim evidence tracker"),
        ("acs_source_integration.md", "ACS source integration doc"),
        ("theme_coverage_matrix.md", "Theme coverage matrix"),
        ("policy_recommendations.md", "Policy recommendations"),
        ("etl_time_reduction_benchmark.md", "ETL time reduction benchmark doc"),
        ("accessibility_improvement_evaluation.md", "Accessibility evaluation doc"),
        ("tableau_claim_check.md", "Tableau claim check"),
    ]
    for filename, label in required_docs:
        check_exists(DOCS_DIR / filename, label, results)

    public_health_doc = DOCS_DIR / "public_health_source_integration.md"
    cdc_gap_doc = DOCS_DIR / "cdc_wonder_gap_and_plan.md"
    cdc_integration_doc = DOCS_DIR / "cdc_wonder_source_integration.md"
    if cdc_integration_doc.exists() or public_health_doc.exists() or cdc_gap_doc.exists():
        doc = cdc_integration_doc if cdc_integration_doc.exists() else (
            public_health_doc if public_health_doc.exists() else cdc_gap_doc
        )
        results.append(
            {
                "check": "Public health or CDC WONDER documentation",
                "path": str(doc.relative_to(PROJECT_ROOT)),
                "passed": True,
            }
        )
    else:
        results.append(
            {
                "check": "Public health or CDC WONDER documentation",
                "path": "docs/public_health_source_integration.md or docs/cdc_wonder_gap_and_plan.md",
                "passed": False,
            }
        )

    processed_outputs = [
        "etl_benchmark_results.json",
        "manual_baseline_results.json",
        "acs_housing_demographics_clean.json",
        "housing_stability_clean.json",
        "food_access_clean.json",
        "public_health_mental_health_clean.json",
        "cdc_wonder_suicide_clean.json",
        "mental_health_clean.json",
        "phase8_theme_validation_report.json",
        "accessibility_audit_summary.json",
    ]
    for filename in processed_outputs:
        check_exists(PROCESSED_DIR / filename, f"Processed output: {filename}", results)

    tableau_workbook = PROJECT_ROOT / "tableau" / "mc3_child_poverty_trends.twb"
    check_exists(tableau_workbook, "Tableau workbook (.twb)", results)
    check_exists(RAW_DATA_DIR / "public_health" / "cdc_wonder" / "monroe_county_suicide_deaths_wonder_export.txt", "CDC WONDER raw extract", results)
    check_exists(AUDIT_DIR := DOCS_DIR / "accessibility_audits", "Accessibility audits directory", results)
    check_readme_section(results)

    report = {
        "generated_at": Path(__file__).stat().st_mtime,
        "checks": results,
        "passed": sum(1 for item in results if item["passed"]),
        "failed": sum(1 for item in results if not item["passed"]),
        "total": len(results),
    }

    report_path = PROCESSED_DIR / "final_validation_report.json"
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    with report_path.open("w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)

    print(f"Validation: {report['passed']}/{report['total']} checks passed")
    for item in results:
        status = "PASS" if item["passed"] else "FAIL"
        print(f"  [{status}] {item['check']} ({item['path']})")

    return 0 if report["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
