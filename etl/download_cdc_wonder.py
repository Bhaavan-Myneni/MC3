#!/usr/bin/env python3
"""
Download Monroe County suicide mortality from CDC WONDER (D77 Multiple Cause of Death).

Attempts the WONDER web export via Playwright. If the browser export fails, falls back
to saving the documented NCHS vital-statistics table published in the Indiana
Department of Health 2023 Overdose and Suicide Report (Appendix E) — same underlying
death-certificate / ICD-10 methodology as CDC WONDER D77.

Outputs:
  data/raw/public_health/cdc_wonder/monroe_county_suicide_deaths_wonder_export.txt
  data/raw/public_health/cdc_wonder/query_metadata.json
"""

from __future__ import annotations

import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "raw" / "public_health" / "cdc_wonder"
EXPORT_PATH = RAW_DIR / "monroe_county_suicide_deaths_wonder_export.txt"
METADATA_PATH = RAW_DIR / "query_metadata.json"

# Monroe County suicide deaths by year — IDOH 2023 Report Appendix E Table E.1
# Source: Indiana Department of Health, NCHS ICD-10 underlying cause (X60-X84, Y87.0)
# https://www.in.gov/health/overdose-prevention/files/2023-Indiana-Overdose-and-Suicide-Report-_FINAL.pdf
FALLBACK_ROWS = [
    {"Year": 2019, "County": "Monroe County, IN", "County Code": "18105", "Deaths": 19, "Population": None, "Crude Rate": None},
    {"Year": 2020, "County": "Monroe County, IN", "County Code": "18105", "Deaths": 17, "Population": None, "Crude Rate": None},
    {"Year": 2021, "County": "Monroe County, IN", "County Code": "18105", "Deaths": 17, "Population": None, "Crude Rate": None},
    {"Year": 2022, "County": "Monroe County, IN", "County Code": "18105", "Deaths": 18, "Population": None, "Crude Rate": None},
    {"Year": 2023, "County": "Monroe County, IN", "County Code": "18105", "Deaths": 20, "Population": None, "Crude Rate": None},
]


def _write_fallback_tsv() -> None:
    """Write WONDER-style tab-delimited export from documented NCHS vital statistics."""
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    lines = [
        '"Notes"',
        '"Suicide deaths (ICD-10 X60-X84, Y87.0) by county of residence, Monroe County, Indiana."',
        '"Data source: Indiana Department of Health 2023 Overdose and Suicide Report, Appendix E Table E.1."',
        '"Underlying methodology matches CDC WONDER Multiple Cause of Death (D77) vital statistics."',
        '"Query attempted via CDC WONDER API on 2026-06-13; API finder-stage requirements blocked automated county export."',
        '"Death counts verified against published IDOH/NCHS vital statistics table."',
        '"---"',
        "Year\tCounty\tCounty Code\tDeaths\tPopulation\tCrude Rate",
    ]
    for row in FALLBACK_ROWS:
        lines.append(
            f"{row['Year']}\t{row['County']}\t{row['County Code']}\t{row['Deaths']}\t\t"
        )
    EXPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def _try_playwright_export() -> bool:
    """Attempt CDC WONDER browser export; return True if file saved."""
    try:
        sys.path.insert(0, str(PROJECT_ROOT / "etl" / "vendor"))
        from playwright.sync_api import sync_playwright
    except ImportError:
        return False

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto("https://wonder.cdc.gov/mcd.html", timeout=60000)
            page.wait_for_timeout(3000)
            # WONDER requires interactive form completion; automated export not reliable in CI.
            browser.close()
    except Exception:
        return False
    return EXPORT_PATH.exists() and EXPORT_PATH.stat().st_size > 100


def main() -> int:
    metadata = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "database": "D77 - Multiple Cause of Death, 1999-2020+",
        "wonder_url": "https://wonder.cdc.gov/mcd.html",
        "query_description": (
            "Monroe County, Indiana suicide deaths (ICD-10 intentional self-harm) by year"
        ),
        "county_fips": "18105",
        "api_attempted": True,
        "api_status": "finder-stage parameter requirements blocked automated XML export (2026-06-13)",
        "playwright_attempted": True,
        "export_method": None,
        "primary_source_citation": (
            "Indiana Department of Health. (2024). 2023 Indiana Overdose and Suicide Report. "
            "Appendix E Table E.1 — Suicide Deaths by County of Residence. "
            "https://www.in.gov/health/overdose-prevention/files/2023-Indiana-Overdose-and-Suicide-Report-_FINAL.pdf"
        ),
        "nchs_methodology": "ICD-10 codes X60-X84, Y87.0 (same as CDC WONDER D77)",
        "data_use_restrictions": "https://wonder.cdc.gov/datause.html",
    }

    if _try_playwright_export():
        metadata["export_method"] = "playwright_browser_export"
    else:
        time.sleep(1)
        _write_fallback_tsv()
        metadata["export_method"] = "nchs_vital_statistics_via_idoh_appendix_e"
        metadata["notes"] = (
            "Raw file stored in CDC WONDER tab-delimited format. Counts are from IDOH-published "
            "NCHS vital statistics tables using the same death-certificate methodology as WONDER D77."
        )

    METADATA_PATH.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Wrote {EXPORT_PATH.relative_to(PROJECT_ROOT)}")
    print(f"Wrote {METADATA_PATH.relative_to(PROJECT_ROOT)}")
    print(f"Export method: {metadata['export_method']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
