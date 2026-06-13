#!/usr/bin/env python3
"""
MC3 Summit 2025 — Reproducible ETL Pipeline

Processes confirmed raw source files from /data/raw and writes validated
outputs to /data/processed. Does not overwrite existing dashboard JSON.
"""

from __future__ import annotations

import json
import logging
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
WEBSITE_PROCESSED_DIR = PROJECT_ROOT / "website" / "data" / "processed"

CHILDREN_IN_POVERTY_FILENAME = "Children in Poverty.csv"
REQUIRED_POVERTY_COLUMNS = [
    "County ID",
    "County",
    "Year",
    "Children In Poverty",
    "Children In Poverty CI High",
    "Children In Poverty CI Low",
]

MONROE_COUNTY_FIPS = "18105"
MONROE_COUNTY_NAME = "Monroe County"


def setup_logging() -> logging.Logger:
    """Configure readable terminal logs."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )
    return logging.getLogger("mc3_etl")


logger = setup_logging()


def find_file_by_name(filename: str, search_root: Path | None = None) -> Path | None:
    """Search /data/raw recursively for a file name."""
    root = search_root or RAW_DATA_DIR
    if not root.exists():
        logger.warning("Search root does not exist: %s", root)
        return None

    matches = sorted(root.rglob(filename))
    if not matches:
        return None

    preferred = [
        m for m in matches
        if "reference_repo" in m.as_posix() and "misc" not in m.as_posix()
    ]
    if preferred:
        return preferred[0]
    return matches[0]


def clean_column_names(columns: list[str]) -> list[str]:
    """Convert raw column names to snake_case."""
    cleaned: list[str] = []
    for column in columns:
        name = str(column).strip().lower()
        name = re.sub(r"[^a-z0-9]+", "_", name)
        name = re.sub(r"_+", "_", name).strip("_")
        cleaned.append(name)
    return cleaned


def validate_required_columns(
    frame: pd.DataFrame,
    required_columns: list[str],
    context: str,
) -> None:
    """Confirm that required fields exist before cleaning."""
    missing = [col for col in required_columns if col not in frame.columns]
    if missing:
        raise ValueError(
            f"{context}: missing required columns: {', '.join(missing)}"
        )


def _extract_county_fips(county_id: str) -> str | None:
    if not isinstance(county_id, str):
        county_id = str(county_id)
    digits = re.sub(r"\D", "", county_id)
    if len(digits) >= 5:
        return digits[-5:]
    return None


def clean_children_in_poverty() -> pd.DataFrame:
    """
    Load and clean the confirmed Children in Poverty.csv file.

    Reads from /data/raw, standardizes columns, filters Monroe County,
    and adds lineage metadata.
    """
    source_path = find_file_by_name(CHILDREN_IN_POVERTY_FILENAME)
    if source_path is None:
        raise FileNotFoundError(
            f"Could not find {CHILDREN_IN_POVERTY_FILENAME} under {RAW_DATA_DIR}"
        )

    logger.info("Loading source file: %s", source_path.relative_to(PROJECT_ROOT))
    frame = pd.read_csv(source_path)
    validate_required_columns(frame, REQUIRED_POVERTY_COLUMNS, "Children in Poverty")

    frame.columns = clean_column_names(list(frame.columns))
    frame = frame.rename(
        columns={
            "children_in_poverty_ci_high": "children_in_poverty_ci_high",
            "children_in_poverty_ci_low": "children_in_poverty_ci_low",
        }
    )

    frame["year"] = pd.to_numeric(frame["year"], errors="coerce").astype("Int64")
    frame["children_in_poverty"] = pd.to_numeric(
        frame["children_in_poverty"], errors="coerce"
    )
    frame["children_in_poverty_ci_high"] = pd.to_numeric(
        frame["children_in_poverty_ci_high"], errors="coerce"
    )
    frame["children_in_poverty_ci_low"] = pd.to_numeric(
        frame["children_in_poverty_ci_low"], errors="coerce"
    )

    frame["county_fips"] = frame["county_id"].apply(_extract_county_fips)
    frame["county_name"] = frame["county"].astype(str).str.strip()

    monroe_mask = (
        frame["county_fips"].eq(MONROE_COUNTY_FIPS)
        | frame["county_name"].str.contains(MONROE_COUNTY_NAME, case=False, na=False)
    )
    frame = frame.loc[monroe_mask].copy()

    if frame.empty:
        raise ValueError("No Monroe County rows found after filtering.")

    frame["children_in_poverty_rate_pct"] = (
        frame["children_in_poverty"] * 100
    ).round(1)
    frame["data_topic"] = "demographics"
    frame["indicator_name"] = "children_in_poverty"
    frame["source_file"] = source_path.relative_to(PROJECT_ROOT).as_posix()
    frame["etl_processed_at"] = datetime.now(timezone.utc).isoformat()
    frame["value_type"] = "rate_proportion"
    frame["verified"] = True

    frame = frame.sort_values("year").reset_index(drop=True)
    return frame


def calculate_poverty_metrics(frame: pd.DataFrame) -> dict[str, Any]:
    """
    Calculate verified metrics from the cleaned poverty DataFrame.

    The source field is a rate proportion (0–1), so change is reported as a
    percentage-point change on the percent scale.
    """
    if frame.empty:
        raise ValueError("Cannot calculate metrics from an empty DataFrame.")

    ordered = frame.sort_values("year")
    start_row = ordered.iloc[0]
    end_row = ordered.iloc[-1]

    start_year = int(start_row["year"])
    end_year = int(end_row["year"])
    start_value = float(start_row["children_in_poverty"])
    end_value = float(end_row["children_in_poverty"])
    start_value_pct = round(start_value * 100, 1)
    end_value_pct = round(end_value * 100, 1)

    absolute_change = end_value - start_value
    percentage_point_change = start_value_pct - end_value_pct
    percent_change = (
        ((end_value - start_value) / start_value) * 100 if start_value else None
    )

    return {
        "indicator_name": "children_in_poverty",
        "value_type": "rate_proportion",
        "county_fips": MONROE_COUNTY_FIPS,
        "county_name": str(start_row["county_name"]),
        "start_year": start_year,
        "end_year": end_year,
        "number_of_years": end_year - start_year,
        "start_value": start_value,
        "end_value": end_value,
        "start_value_pct": start_value_pct,
        "end_value_pct": end_value_pct,
        "absolute_change": round(absolute_change, 6),
        "percentage_point_change": round(percentage_point_change, 1),
        "percent_change_relative": round(percent_change, 2) if percent_change is not None else None,
        "min_value": float(ordered["children_in_poverty"].min()),
        "max_value": float(ordered["children_in_poverty"].max()),
        "min_value_pct": round(float(ordered["children_in_poverty"].min()) * 100, 1),
        "max_value_pct": round(float(ordered["children_in_poverty"].max()) * 100, 1),
        "verified": True,
        "calculated_at": datetime.now(timezone.utc).isoformat(),
        "source_file": str(start_row["source_file"]),
        "notes": (
            "Values are child poverty rates stored as proportions in the source CSV. "
            "percentage_point_change is calculated on the percent scale "
            "(start_value_pct - end_value_pct)."
        ),
    }


def _load_json_if_exists(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def compare_existing_dashboard_metrics(
    cleaned: pd.DataFrame,
    verified_metrics: dict[str, Any],
) -> dict[str, Any]:
    """
    Compare ETL-generated poverty trend metrics with existing dashboard JSON.

    Reads website copies only for comparison — does not modify them.
    """
    report: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "sources_compared": [],
        "matches": [],
        "warnings": [],
        "unverified_dashboard_fields": [],
    }

    poverty_trend_path = WEBSITE_PROCESSED_DIR / "poverty_trend.json"
    dashboard_summary_path = WEBSITE_PROCESSED_DIR / "dashboard_summary.json"

    etl_rates = cleaned.set_index("year")["children_in_poverty_rate_pct"].to_dict()
    etl_pp_change = verified_metrics["percentage_point_change"]

    poverty_trend = _load_json_if_exists(poverty_trend_path)
    if poverty_trend:
        report["sources_compared"].append(poverty_trend_path.relative_to(PROJECT_ROOT).as_posix())
        years = poverty_trend.get("data", {}).get("years", [])
        rates = poverty_trend.get("data", {}).get("poverty_rates", [])
        dashboard_pp = poverty_trend.get("data", {}).get("improvement")
        dashboard_impacted = poverty_trend.get("data", {}).get("total_children_impacted")

        mismatched_years = []
        for year, rate in zip(years, rates):
            etl_rate = etl_rates.get(int(year))
            if etl_rate is None:
                mismatched_years.append({"year": year, "issue": "missing in ETL output"})
            elif float(etl_rate) != float(rate):
                mismatched_years.append(
                    {
                        "year": year,
                        "dashboard_rate_pct": rate,
                        "etl_rate_pct": etl_rate,
                        "difference": round(float(rate) - float(etl_rate), 2),
                    }
                )

        if mismatched_years:
            report["warnings"].append(
                {
                    "type": "rate_mismatch",
                    "file": poverty_trend_path.name,
                    "details": mismatched_years,
                }
            )
        else:
            report["matches"].append(
                "poverty_trend.json poverty_rates match ETL cleaned values for all years."
            )

        if dashboard_pp is not None:
            dashboard_pp_rounded = round(float(dashboard_pp), 1)
            if dashboard_pp_rounded != etl_pp_change:
                report["warnings"].append(
                    {
                        "type": "percentage_point_change_mismatch",
                        "file": poverty_trend_path.name,
                        "dashboard_value": dashboard_pp_rounded,
                        "etl_verified_value": etl_pp_change,
                        "message": (
                            f"poverty_trend.json improvement ({dashboard_pp_rounded}) "
                            f"does not match ETL verified change ({etl_pp_change})."
                        ),
                    }
                )
            else:
                report["matches"].append(
                    "poverty_trend.json improvement matches ETL percentage_point_change."
                )

        if dashboard_impacted is not None:
            report["unverified_dashboard_fields"].append(
                {
                    "field": "total_children_impacted",
                    "file": poverty_trend_path.name,
                    "dashboard_value": dashboard_impacted,
                    "status": "unverified",
                    "reason": (
                        "No child population denominator is available in "
                        "Children in Poverty.csv to reproduce this count."
                    ),
                }
            )

    dashboard_summary = _load_json_if_exists(dashboard_summary_path)
    if dashboard_summary:
        report["sources_compared"].append(
            dashboard_summary_path.relative_to(PROJECT_ROOT).as_posix()
        )
        findings = dashboard_summary.get("key_findings", [])
        for finding in findings:
            if "8.3 percentage point reduction" in finding.lower():
                report["warnings"].append(
                    {
                        "type": "summary_claim_mismatch",
                        "file": dashboard_summary_path.name,
                        "dashboard_claim": finding,
                        "etl_verified_value": etl_pp_change,
                        "message": (
                            "dashboard_summary.json claims 8.3 percentage-point reduction, "
                            f"but ETL verified change from Children in Poverty.csv is "
                            f"{etl_pp_change} percentage points."
                        ),
                    }
                )
            if "graduation" in finding.lower() or "unemployment" in finding.lower():
                report["unverified_dashboard_fields"].append(
                    {
                        "field": finding,
                        "file": dashboard_summary_path.name,
                        "status": "unverified",
                        "reason": "Not validated in Phase 3 poverty ETL pipeline.",
                    }
                )

    report["etl_verified_metrics"] = verified_metrics
    return report


def save_processed_outputs(
    cleaned: pd.DataFrame,
    verified_metrics: dict[str, Any],
    validation_report: dict[str, Any],
) -> dict[str, Path]:
    """Save cleaned and verified outputs to /data/processed."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    outputs = {
        "children_in_poverty_clean.csv": PROCESSED_DIR / "children_in_poverty_clean.csv",
        "children_in_poverty_clean.json": PROCESSED_DIR / "children_in_poverty_clean.json",
        "poverty_metrics_verified.json": PROCESSED_DIR / "poverty_metrics_verified.json",
        "metric_validation_report.json": PROCESSED_DIR / "metric_validation_report.json",
    }

    cleaned.to_csv(outputs["children_in_poverty_clean.csv"], index=False)
    cleaned.to_json(
        outputs["children_in_poverty_clean.json"],
        orient="records",
        indent=2,
    )

    with outputs["poverty_metrics_verified.json"].open("w", encoding="utf-8") as handle:
        json.dump(verified_metrics, handle, indent=2)

    with outputs["metric_validation_report.json"].open("w", encoding="utf-8") as handle:
        json.dump(validation_report, handle, indent=2)

    return outputs


def _add_lineage_fields(
    frame: pd.DataFrame,
    *,
    data_topic: str,
    indicator_name: str,
    source_file: str,
    value_type: str,
) -> pd.DataFrame:
    """Append standard ETL lineage columns."""
    frame = frame.copy()
    frame["data_topic"] = data_topic
    frame["indicator_name"] = indicator_name
    frame["source_file"] = source_file
    frame["etl_processed_at"] = datetime.now(timezone.utc).isoformat()
    frame["value_type"] = value_type
    frame["verified"] = True
    frame["county_fips"] = MONROE_COUNTY_FIPS
    frame["county_name"] = MONROE_COUNTY_NAME
    return frame


def _load_kidscount_monroe(
    filename: str,
    *,
    data_format: str = "Percent",
    location: str = "Monroe",
) -> tuple[pd.DataFrame, Path]:
    """Load a Kids Count export XLSX and filter to Monroe County rows."""
    source_path = find_file_by_name(filename)
    if source_path is None:
        raise FileNotFoundError(f"Could not find {filename} under {RAW_DATA_DIR}")

    frame = pd.read_excel(source_path, sheet_name="Kidscount Export")
    frame.columns = clean_column_names(list(frame.columns))
    validate_required_columns(
        frame,
        ["location", "timeframe", "dataformat", "data"],
        filename,
    )

    filtered = frame[
        frame["location"].astype(str).str.strip().eq(location)
        & frame["dataformat"].astype(str).str.strip().eq(data_format)
    ].copy()
    if filtered.empty:
        raise ValueError(f"No Monroe County {data_format} rows found in {filename}")

    filtered["year"] = pd.to_numeric(filtered["timeframe"], errors="coerce").astype("Int64")
    filtered["indicator_value"] = pd.to_numeric(filtered["data"], errors="coerce")
    filtered = filtered.dropna(subset=["year", "indicator_value"])
    filtered["year"] = filtered["year"].astype(int)
    return filtered.sort_values("year"), source_path


def clean_graduation_rate() -> pd.DataFrame:
    """Clean Monroe County high school graduation rate from Kids Count export."""
    filtered, source_path = _load_kidscount_monroe(
        "High school graduation rate.xlsx",
        data_format="Percent",
    )
    filtered["indicator_value"] = (filtered["indicator_value"] * 100).round(2)
    result = filtered[["year", "indicator_value"]].copy()
    result["indicator_unit"] = "percent"
    return _add_lineage_fields(
        result,
        data_topic="education",
        indicator_name="high_school_graduation_rate",
        source_file=source_path.relative_to(PROJECT_ROOT).as_posix(),
        value_type="rate_percent",
    )


def clean_unemployment_rate() -> pd.DataFrame:
    """Clean Monroe County unemployment rates from STATSIN annual files."""
    search_dir = RAW_DATA_DIR / "economy" / "reference_repo" / "Unemployment_Estimates"
    if not search_dir.exists():
        search_dir = RAW_DATA_DIR

    files = sorted(search_dir.rglob("STATSIN_asu*.xlsx"))
    if not files:
        raise FileNotFoundError("No STATSIN_asu*.xlsx unemployment files found.")

    rows: list[dict[str, Any]] = []
    source_files: list[str] = []
    for path in files:
        match = re.search(r"asu(\d{2})$", path.stem)
        if not match:
            continue
        year = 2000 + int(match.group(1))
        frame = pd.read_excel(path, sheet_name="data")
        frame.columns = clean_column_names(list(frame.columns))
        monroe = frame[frame["cnty_fips"] == 105]
        if monroe.empty:
            continue
        rate = float(monroe["cnty_urate"].iloc[0])
        rows.append({"year": year, "indicator_value": round(rate, 1)})
        source_files.append(path.relative_to(PROJECT_ROOT).as_posix())

    if not rows:
        raise ValueError("No Monroe County unemployment rows found in STATSIN files.")

    result = pd.DataFrame(rows).sort_values("year").reset_index(drop=True)
    result["indicator_unit"] = "percent"
    return _add_lineage_fields(
        result,
        data_topic="economy",
        indicator_name="county_unemployment_rate",
        source_file="; ".join(sorted(set(source_files))),
        value_type="rate_percent",
    )


def clean_demographics_population() -> pd.DataFrame:
    """Clean Monroe County total child population by summing age-group counts."""
    filename = "Child population by age group.xlsx"
    source_path = find_file_by_name(filename)
    if source_path is None:
        raise FileNotFoundError(f"Could not find {filename} under {RAW_DATA_DIR}")

    frame = pd.read_excel(source_path, sheet_name="Kidscount Export")
    frame.columns = clean_column_names(list(frame.columns))
    validate_required_columns(
        frame,
        ["location", "timeframe", "dataformat", "data", "age_group"],
        filename,
    )

    filtered = frame[
        frame["location"].astype(str).str.strip().eq("Monroe")
        & frame["dataformat"].astype(str).str.strip().eq("Number")
    ].copy()
    if filtered.empty:
        raise ValueError(f"No Monroe County Number rows found in {filename}")

    filtered["year"] = pd.to_numeric(filtered["timeframe"], errors="coerce").astype("Int64")
    filtered["indicator_value"] = pd.to_numeric(filtered["data"], errors="coerce")
    filtered = filtered.dropna(subset=["year", "indicator_value"])
    result = (
        filtered.groupby("year", as_index=False)["indicator_value"]
        .sum()
        .astype({"year": int, "indicator_value": float})
        .sort_values("year")
        .reset_index(drop=True)
    )
    result["indicator_unit"] = "count"
    return _add_lineage_fields(
        result,
        data_topic="demographics",
        indicator_name="total_child_population",
        source_file=source_path.relative_to(PROJECT_ROOT).as_posix(),
        value_type="population_count",
    )


def clean_social_services_indicator() -> pd.DataFrame:
    """Clean Monroe County SNAP participation from Kids Count export."""
    filtered, source_path = _load_kidscount_monroe(
        "Monthly average number of persons issued food stamps (SNAP).xlsx",
        data_format="Number",
    )
    result = filtered[["year", "indicator_value"]].copy()
    result["indicator_unit"] = "count"
    return _add_lineage_fields(
        result,
        data_topic="social_services",
        indicator_name="snap_participants_monthly_avg",
        source_file=source_path.relative_to(PROJECT_ROOT).as_posix(),
        value_type="service_count",
    )


def save_indicator_outputs(base_name: str, frame: pd.DataFrame) -> dict[str, Path]:
    """Save cleaned indicator CSV and JSON without overwriting poverty outputs."""
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    outputs = {
        f"{base_name}_clean.csv": PROCESSED_DIR / f"{base_name}_clean.csv",
        f"{base_name}_clean.json": PROCESSED_DIR / f"{base_name}_clean.json",
    }
    frame.to_csv(outputs[f"{base_name}_clean.csv"], index=False)
    frame.to_json(outputs[f"{base_name}_clean.json"], orient="records", indent=2)
    return outputs


def run_phase6_indicators() -> tuple[dict[str, Any], dict[str, Path]]:
    """
    Attempt to clean additional verified indicators.

    Skips indicators when source files or columns are not confidently identified.
    """
    report: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "indicators_attempted": [],
        "indicators_processed": [],
        "indicators_skipped": [],
        "source_files_used": [],
        "metrics_calculated": {},
        "validation_warnings": [],
        "missing_methodology_notes": [],
    }
    outputs: dict[str, Path] = {}

    indicator_jobs = [
        (
            "graduation_rate",
            "High school graduation rate",
            clean_graduation_rate,
            "education",
        ),
        (
            "unemployment_rate",
            "County unemployment rate (STATSIN)",
            clean_unemployment_rate,
            "economy",
        ),
        (
            "demographics_population",
            "Total child population by age group",
            clean_demographics_population,
            "demographics",
        ),
        (
            "social_services_indicator",
            "SNAP monthly average participants",
            clean_social_services_indicator,
            "social_services",
        ),
    ]

    for base_name, label, cleaner, topic in indicator_jobs:
        report["indicators_attempted"].append({"name": base_name, "label": label})
        try:
            logger.info("Cleaning %s...", label)
            frame = cleaner()
            indicator_outputs = save_indicator_outputs(base_name, frame)
            outputs.update(indicator_outputs)
            latest = frame.sort_values("year").iloc[-1]
            earliest = frame.sort_values("year").iloc[0]
            report["indicators_processed"].append(
                {
                    "name": base_name,
                    "label": label,
                    "rows": len(frame),
                    "year_range": [int(earliest["year"]), int(latest["year"])],
                    "latest_value": float(latest["indicator_value"]),
                    "indicator_unit": str(latest["indicator_unit"]),
                }
            )
            report["source_files_used"].append(str(latest["source_file"]))
            report["metrics_calculated"][base_name] = {
                "latest_year": int(latest["year"]),
                "latest_value": float(latest["indicator_value"]),
                "indicator_unit": str(latest["indicator_unit"]),
                "indicator_name": str(latest["indicator_name"]),
            }
            for path in indicator_outputs.values():
                logger.info("  wrote %s", path.relative_to(PROJECT_ROOT))
        except Exception as exc:  # noqa: BLE001
            logger.warning("Skipped %s: %s", label, exc)
            report["indicators_skipped"].append(
                {"name": base_name, "label": label, "reason": str(exc)}
            )

    report["validation_warnings"].append(
        {
            "type": "dashboard_graduation_claim",
            "message": (
                "dashboard_summary.json claims 95% high school graduation rate. "
                "Verified Kids Count source shows 90.77% for Monroe County in 2017 "
                "(latest year in file). Do not use 95% unless traced to a newer source."
            ),
        }
    )
    report["validation_warnings"].append(
        {
            "type": "dashboard_unemployment_claim",
            "message": (
                "dashboard_summary.json claims 3.9% unemployment rate. "
                "Verified STATSIN county rates for Monroe range from 5.4% to 6.4% "
                "in available files. Do not use 3.9% unless traced to a matching source."
            ),
        }
    )
    report["missing_methodology_notes"].append(
        "Child population is summed across age groups; overlapping age definitions should be reviewed before policy use."
    )

    report_path = PROCESSED_DIR / "phase6_indicator_validation_report.json"
    with report_path.open("w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)
    outputs["phase6_indicator_validation_report.json"] = report_path
    logger.info("  wrote %s", report_path.relative_to(PROJECT_ROOT))

    return report, outputs


WEBSITE_VERIFIED_DIR = PROJECT_ROOT / "website" / "data" / "verified"

PHASE5_WEBSITE_FILES = [
    "children_in_poverty_clean.json",
    "poverty_metrics_verified.json",
    "metric_validation_report.json",
]

PHASE6_WEBSITE_FILES = [
    "graduation_rate_clean.json",
    "unemployment_rate_clean.json",
    "demographics_population_clean.json",
    "social_services_indicator_clean.json",
    "phase6_indicator_validation_report.json",
]

PHASE8_WEBSITE_FILES = [
    "acs_housing_demographics_clean.json",
    "housing_stability_clean.json",
    "food_access_clean.json",
    "public_health_mental_health_clean.json",
    "cdc_wonder_suicide_clean.json",
    "mental_health_clean.json",
    "phase8_theme_validation_report.json",
]

RENT_BURDEN_30_PLUS_LABELS = (
    "30.0 to 34.9 percent",
    "35.0 to 39.9 percent",
    "40.0 to 49.9 percent",
    "50.0 percent or more",
)


def _parse_acs_estimate_number(value: Any) -> float | None:
    """Parse ACS estimate cells that may include commas or margin-of-error symbols."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    text = str(value).split("±")[0].strip()
    text = text.replace(",", "")
    if text in {"", "-", "(X)", "N", "**"}:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def _extract_acs_year_from_filename(path: Path) -> int | None:
    match = re.search(r"(\d{4})", path.name)
    return int(match.group(1)) if match else None


def _load_acs_b25070_rent_burden_rows() -> list[dict[str, Any]]:
    """Parse ACS B25070 gross rent as % of household income files for Monroe County."""
    search_roots = [
        RAW_DATA_DIR / "misc" / "dataset_archive" / "mc3_snap- us bureau" / "B25070",
        RAW_DATA_DIR,
    ]
    files: list[Path] = []
    for root in search_roots:
        if root.exists():
            files.extend(sorted(root.rglob("B25070*.csv")))
            files.extend(sorted(root.rglob("*B25070*.csv")))
    files = sorted({path.resolve() for path in files})

    rows: list[dict[str, Any]] = []
    source_files: list[str] = []
    for path in files:
        year = _extract_acs_year_from_filename(path)
        if year is None:
            continue
        frame = pd.read_csv(path)
        if frame.shape[1] < 2:
            continue
        label_col = frame.columns[0]
        estimate_col = next(
            (col for col in frame.columns if "estimate" in str(col).lower()),
            frame.columns[1],
        )
        labels = frame[label_col].astype(str).str.strip()
        estimates = frame[estimate_col].apply(_parse_acs_estimate_number)

        total = None
        not_computed = None
        burden_30_plus = 0.0
        for label, estimate in zip(labels, estimates):
            if estimate is None:
                continue
            normalized = label.lower()
            if normalized.startswith("total"):
                total = estimate
            elif "not computed" in normalized:
                not_computed = estimate
            elif any(token in normalized for token in ("30.0", "35.0", "40.0", "50.0")):
                burden_30_plus += estimate

        if total is None:
            continue
        denominator = total - (not_computed or 0.0)
        if denominator <= 0:
            continue
        pct = round((burden_30_plus / denominator) * 100, 1)
        rel = path.relative_to(PROJECT_ROOT).as_posix()
        source_files.append(rel)
        rows.append(
            {
                "year": year,
                "indicator_name": "renters_gross_rent_30_plus_pct",
                "indicator_value": pct,
                "indicator_unit": "percent",
                "data_topic": "housing",
                "value_type": "rate_percent",
                "source_file": rel,
                "burden_household_count_30_plus": int(round(burden_30_plus)),
                "renter_households_with_computed_rent": int(round(denominator)),
            }
        )

    if not rows:
        raise FileNotFoundError("No ACS B25070 rent burden files could be parsed.")

    for row in rows:
        row["source_file"] = "; ".join(sorted(set(source_files)))
    return rows


def _load_acs_s1903_median_income_rows() -> list[dict[str, Any]]:
    """Extract Monroe County median household income from ACS S1903 files."""
    income_dir = RAW_DATA_DIR / "acs" / "reference_repo" / "S1903_Median_Income"
    if not income_dir.exists():
        raise FileNotFoundError(f"ACS S1903 directory not found: {income_dir}")

    rows: list[dict[str, Any]] = []
    source_files: list[str] = []
    for path in sorted(income_dir.glob("ACSST5Y*.S1903-Data.csv")):
        year = _extract_acs_year_from_filename(path)
        if year is None:
            continue
        frame = pd.read_csv(path, low_memory=False)
        if "GEO_ID" not in frame.columns:
            continue
        county = frame[frame["GEO_ID"].astype(str).eq(f"0500000US{MONROE_COUNTY_FIPS}")]
        if county.empty:
            continue
        income_col = "S1903_C03_001E"
        if income_col not in county.columns:
            continue
        value = _parse_acs_estimate_number(county.iloc[0][income_col])
        if value is None:
            continue
        rel = path.relative_to(PROJECT_ROOT).as_posix()
        source_files.append(rel)
        rows.append(
            {
                "year": year,
                "indicator_name": "median_household_income",
                "indicator_value": value,
                "indicator_unit": "dollars",
                "data_topic": "demographics",
                "value_type": "currency",
                "source_file": rel,
            }
        )

    if not rows:
        raise ValueError("No Monroe County median household income rows found in S1903 files.")

    for row in rows:
        row["source_file"] = "; ".join(sorted(set(source_files)))
    return rows


def clean_acs_housing_or_demographics() -> pd.DataFrame:
    """Clean ACS housing cost burden and median household income indicators."""
    rent_rows = _load_acs_b25070_rent_burden_rows()
    income_rows = _load_acs_s1903_median_income_rows()
    combined = pd.DataFrame(rent_rows + income_rows).sort_values(
        ["indicator_name", "year"]
    ).reset_index(drop=True)
    combined["etl_processed_at"] = datetime.now(timezone.utc).isoformat()
    combined["verified"] = True
    combined["county_fips"] = MONROE_COUNTY_FIPS
    combined["county_name"] = MONROE_COUNTY_NAME
    return combined


def clean_housing_stability() -> pd.DataFrame:
    """Derive housing stability indicator from ACS B25070 rent burden categories."""
    rent_rows = _load_acs_b25070_rent_burden_rows()
    result = pd.DataFrame(rent_rows)[
        ["year", "indicator_value", "burden_household_count_30_plus", "renter_households_with_computed_rent"]
    ].copy()
    result.rename(columns={"indicator_value": "renters_cost_burden_30_plus_pct"}, inplace=True)
    result["indicator_value"] = result["renters_cost_burden_30_plus_pct"]
    result["indicator_unit"] = "percent"
    result["indicator_name"] = "renters_cost_burden_30_plus_pct"
    return _add_lineage_fields(
        result.drop(columns=["renters_cost_burden_30_plus_pct"]),
        data_topic="housing",
        indicator_name="renters_cost_burden_30_plus_pct",
        source_file=rent_rows[0]["source_file"],
        value_type="rate_percent",
    )


def clean_food_access() -> pd.DataFrame:
    """Tag SNAP participation as a food access proxy indicator."""
    snap = clean_social_services_indicator().copy()
    snap["indicator_name"] = "snap_monthly_avg_food_access"
    snap["data_topic"] = "food_access"
    snap["value_type"] = "service_count"
    snap["notes"] = (
        "Food access proxy derived from verified SNAP monthly average participation. "
        "Does not measure total food insecurity."
    )
    return snap


def clean_public_health_clinical_care() -> pd.DataFrame:
    """
    Clean uninsured children rate from Clinical Care.csv.

    Clinical care access indicator — not CDC WONDER and not mental health.
    """
    filename = "Clinical Care.csv"
    source_path = find_file_by_name(filename)
    if source_path is None:
        raise FileNotFoundError(f"Could not find {filename} under {RAW_DATA_DIR}")

    frame = pd.read_csv(source_path)
    validate_required_columns(
        frame,
        [
            "County ID",
            "County",
            "Year",
            "Uninsured Children",
            "Uninsured Children CI High",
            "Uninsured Children CI Low",
        ],
        "Clinical Care",
    )
    frame.columns = clean_column_names(list(frame.columns))
    frame["year"] = pd.to_numeric(frame["year"], errors="coerce").astype("Int64")
    frame["uninsured_children"] = pd.to_numeric(frame["uninsured_children"], errors="coerce")
    frame["county_fips"] = frame["county_id"].apply(_extract_county_fips)
    frame["county_name"] = frame["county"].astype(str).str.strip()
    monroe_mask = (
        frame["county_fips"].eq(MONROE_COUNTY_FIPS)
        | frame["county_name"].str.contains(MONROE_COUNTY_NAME, case=False, na=False)
    )
    frame = frame.loc[monroe_mask].copy()
    if frame.empty:
        raise ValueError("No Monroe County rows found in Clinical Care.csv")

    frame["indicator_value"] = (frame["uninsured_children"] * 100).round(2)
    result = frame[["year", "indicator_value"]].copy()
    result["indicator_unit"] = "percent"
    return _add_lineage_fields(
        result,
        data_topic="public_health",
        indicator_name="uninsured_children_rate",
        source_file=source_path.relative_to(PROJECT_ROOT).as_posix(),
        value_type="rate_percent",
    )


def clean_public_health_or_mental_health() -> pd.DataFrame:
    """Backward-compatible alias for clinical care public health indicator."""
    return clean_public_health_clinical_care()


def clean_cdc_wonder_suicide() -> pd.DataFrame:
    """Clean Monroe County suicide deaths from CDC WONDER-format raw export."""
    source_path = (
        RAW_DATA_DIR
        / "public_health"
        / "cdc_wonder"
        / "monroe_county_suicide_deaths_wonder_export.txt"
    )
    if not source_path.exists():
        raise FileNotFoundError(
            f"CDC WONDER export not found: {source_path}. Run etl/download_cdc_wonder.py first."
        )

    frame = pd.read_csv(source_path, sep="\t", comment='"', skiprows=7)
    frame.columns = clean_column_names(list(frame.columns))
    if "deaths" not in frame.columns or "year" not in frame.columns:
        raise ValueError("CDC WONDER export missing required Year/Deaths columns")

    frame["year"] = pd.to_numeric(frame["year"], errors="coerce").astype("Int64")
    frame["indicator_value"] = pd.to_numeric(frame["deaths"], errors="coerce")
    frame = frame.dropna(subset=["year", "indicator_value"]).astype({"year": int})
    result = frame[["year", "indicator_value"]].sort_values("year").reset_index(drop=True)
    result["indicator_unit"] = "count"
    return _add_lineage_fields(
        result,
        data_topic="cdc_wonder",
        indicator_name="suicide_deaths_county_residence",
        source_file=source_path.relative_to(PROJECT_ROOT).as_posix(),
        value_type="mortality_count",
    )


def clean_mental_health() -> pd.DataFrame:
    """
    Mental health crisis indicator from CDC WONDER suicide mortality extract.

    County suicide deaths are a behavioral health mortality signal. This is not
    youth-only mental health survey data.
    """
    wonder = clean_cdc_wonder_suicide().copy()
    wonder["indicator_name"] = "suicide_deaths_mental_health_signal"
    wonder["data_topic"] = "mental_health"
    wonder["notes"] = (
        "Mental health crisis signal derived from CDC WONDER / NCHS suicide mortality "
        "for Monroe County. County-level deaths, not youth-only survey data."
    )
    return wonder


def run_phase8_theme_extensions() -> tuple[dict[str, Any], dict[str, Path]]:
    """Process ACS, housing, food access, public health, CDC WONDER, and mental health."""
    report: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "indicators_attempted": [
            {"name": "acs_housing_demographics", "label": "ACS housing and demographics"},
            {"name": "housing_stability", "label": "Housing stability (rent burden)"},
            {"name": "food_access", "label": "Food access (SNAP proxy)"},
            {"name": "public_health", "label": "Public health (uninsured children)"},
            {"name": "cdc_wonder", "label": "CDC WONDER suicide mortality"},
            {"name": "mental_health", "label": "Mental health (suicide mortality signal)"},
        ],
        "indicators_processed": [],
        "indicators_skipped": [],
        "cdc_wonder_status": "processed_from_raw_export",
        "mental_health_status": "verified_suicide_mortality_signal",
        "validation_warnings": [],
    }
    outputs: dict[str, Path] = {}

    processors = [
        ("acs_housing_demographics", "ACS housing and demographics", clean_acs_housing_or_demographics, "housing"),
        ("housing_stability", "Housing stability (rent burden)", clean_housing_stability, "housing"),
        ("food_access", "Food access (SNAP proxy)", clean_food_access, "food_access"),
        ("public_health_mental_health", "Public health (uninsured children)", clean_public_health_clinical_care, "public_health"),
        ("cdc_wonder_suicide", "CDC WONDER suicide mortality", clean_cdc_wonder_suicide, "cdc_wonder"),
        ("mental_health", "Mental health (suicide mortality signal)", clean_mental_health, "mental_health"),
    ]

    for base_name, label, func, topic in processors:
        try:
            logger.info("Cleaning %s...", label)
            frame = func()
            saved = save_indicator_outputs(base_name, frame)
            outputs.update(saved)
            latest = frame.sort_values("year").iloc[-1]
            report["indicators_processed"].append(
                {
                    "name": base_name,
                    "label": label,
                    "rows": int(len(frame)),
                    "year_range": [int(frame["year"].min()), int(frame["year"].max())],
                    "latest_value": float(latest["indicator_value"]),
                    "indicator_unit": str(latest.get("indicator_unit", "")),
                    "data_topic": topic,
                }
            )
        except Exception as exc:
            logger.warning("Skipped %s: %s", label, exc)
            report["indicators_skipped"].append(
                {"name": base_name, "label": label, "reason": str(exc)}
            )

    report["validation_warnings"].append(
        {
            "type": "public_health_scope",
            "message": (
                "public_health_mental_health_clean.json contains uninsured children rates "
                "from Clinical Care.csv. This is clinical care access, not mental health."
            ),
        }
    )
    report["validation_warnings"].append(
        {
            "type": "mental_health_scope",
            "message": (
                "mental_health_clean.json uses county suicide deaths from CDC WONDER / NCHS "
                "mortality data. This is a behavioral health mortality signal, not youth survey data."
            ),
        }
    )
    report["validation_warnings"].append(
        {
            "type": "food_access_scope",
            "message": (
                "food_access_clean.json is derived from SNAP participation and should be "
                "described as a food assistance access proxy, not total food insecurity."
            ),
        }
    )

    report_path = PROCESSED_DIR / "phase8_theme_validation_report.json"
    with report_path.open("w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)
    outputs["phase8_theme_validation_report.json"] = report_path
    logger.info("  wrote %s", report_path.relative_to(PROJECT_ROOT))
    return report, outputs


def export_verified_json_for_website(
    poverty_outputs: dict[str, Path],
    phase6_outputs: dict[str, Path] | None = None,
    phase8_outputs: dict[str, Path] | None = None,
) -> None:
    """
    Export verified ETL JSON to website/data/verified/ for frontend consumption.

    Does not modify website/data/processed/ existing dashboard files.
    """
    website_dir = PROJECT_ROOT / "website"
    if not website_dir.exists():
        logger.warning(
            "Website export skipped because /website directory was not found."
        )
        return

    WEBSITE_VERIFIED_DIR.mkdir(parents=True, exist_ok=True)

    import shutil

    filenames = list(PHASE5_WEBSITE_FILES)
    if phase6_outputs:
        for name in PHASE6_WEBSITE_FILES:
            if name in phase6_outputs:
                filenames.append(name)
    if phase8_outputs:
        for name in PHASE8_WEBSITE_FILES:
            if name in phase8_outputs:
                filenames.append(name)

    for filename in filenames:
        source = (
            (phase8_outputs or {}).get(filename)
            or (phase6_outputs or {}).get(filename)
            or poverty_outputs.get(filename)
            or (PROCESSED_DIR / filename)
        )
        if not source or not Path(source).exists():
            logger.warning("Verified export skipped — missing %s", filename)
            continue
        destination = WEBSITE_VERIFIED_DIR / filename
        shutil.copy2(source, destination)
        logger.info(
            "  exported %s",
            destination.relative_to(PROJECT_ROOT),
        )

    logger.info("Verified website JSON exports updated.")


def _prepare_postgres_frame(cleaned: pd.DataFrame) -> pd.DataFrame:
    """Map ETL CSV columns to mc3.children_in_poverty table columns."""
    frame = cleaned.copy()
    db_frame = pd.DataFrame(
        {
            "county_id": frame["county_id"],
            "county_fips": frame["county_fips"],
            "county_name": frame["county_name"],
            "year": frame["year"].astype(int),
            "children_in_poverty_proportion": frame["children_in_poverty"],
            "children_in_poverty_rate": frame["children_in_poverty_rate_pct"],
            "ci_high": (frame["children_in_poverty_ci_high"] * 100).round(1),
            "ci_low": (frame["children_in_poverty_ci_low"] * 100).round(1),
            "data_topic": frame["data_topic"],
            "indicator_name": frame["indicator_name"],
            "source_file": frame["source_file"],
            "etl_processed_at": pd.to_datetime(frame["etl_processed_at"], utc=True),
            "value_type": frame["value_type"],
            "verified": frame["verified"].astype(bool),
        }
    )
    return db_frame


def load_to_postgres(cleaned: pd.DataFrame) -> None:
    """
    Optionally load cleaned outputs to PostgreSQL using DATABASE_URL.

    Loads into mc3.children_in_poverty when the schema exists.
    Skips gracefully when DATABASE_URL is not set or schema is missing.
    """
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.info("PostgreSQL load skipped because DATABASE_URL was not provided.")
        return

    try:
        from sqlalchemy import create_engine, text
        from sqlalchemy.exc import SQLAlchemyError

        engine = create_engine(database_url)
        db_frame = _prepare_postgres_frame(cleaned)

        with engine.begin() as connection:
            schema_exists = connection.execute(
                text("SELECT 1 FROM information_schema.schemata WHERE schema_name = 'mc3'")
            ).scalar()
            if not schema_exists:
                logger.warning(
                    "PostgreSQL load skipped because schema 'mc3' was not found. "
                    "Run database/schema/001_initial_schema.sql first."
                )
                return

            source_id = connection.execute(
                text(
                    "SELECT source_id FROM mc3.data_sources "
                    "WHERE source_name = :source_name LIMIT 1"
                ),
                {"source_name": "Children in Poverty.csv"},
            ).scalar()

            if source_id is None:
                connection.execute(
                    text(
                        "INSERT INTO mc3.data_sources "
                        "(source_name, source_file, source_type, source_notes) "
                        "VALUES (:name, :file, :type, :notes)"
                    ),
                    {
                        "name": "Children in Poverty.csv",
                        "file": str(db_frame["source_file"].iloc[0]),
                        "type": "csv",
                        "notes": (
                            "Loaded by automated_pipeline.py from verified ETL output."
                        ),
                    },
                )
                source_id = connection.execute(
                    text(
                        "SELECT source_id FROM mc3.data_sources "
                        "WHERE source_name = :source_name LIMIT 1"
                    ),
                    {"source_name": "Children in Poverty.csv"},
                ).scalar()

            db_frame["source_id"] = source_id

            connection.execute(
                text(
                    "DELETE FROM mc3.children_in_poverty "
                    "WHERE indicator_name = :indicator_name"
                ),
                {"indicator_name": "children_in_poverty"},
            )

            db_frame.to_sql(
                "children_in_poverty",
                connection,
                schema="mc3",
                if_exists="append",
                index=False,
                method="multi",
            )

        logger.info(
            "Loaded %s rows to PostgreSQL table mc3.children_in_poverty.",
            len(db_frame),
        )
    except SQLAlchemyError as exc:
        logger.warning("PostgreSQL load failed: %s", exc)
    except ImportError as exc:
        logger.warning("PostgreSQL dependencies unavailable: %s", exc)


def run_pipeline() -> int:
    """Run the full ETL process."""
    logger.info("Starting MC3 ETL pipeline...")
    logger.info("Searching for %s...", CHILDREN_IN_POVERTY_FILENAME)

    source_path = find_file_by_name(CHILDREN_IN_POVERTY_FILENAME)
    if source_path is None:
        logger.error("Source file not found under %s", RAW_DATA_DIR)
        return 1

    logger.info("Found source file at %s", source_path.relative_to(PROJECT_ROOT))
    logger.info("Cleaning poverty data...")
    cleaned = clean_children_in_poverty()

    logger.info("Calculating verified poverty metrics...")
    verified_metrics = calculate_poverty_metrics(cleaned)

    logger.info("Comparing against existing dashboard metrics...")
    validation_report = compare_existing_dashboard_metrics(cleaned, verified_metrics)

    logger.info("Saving processed outputs...")
    outputs = save_processed_outputs(cleaned, verified_metrics, validation_report)
    for name, path in outputs.items():
        logger.info("  wrote %s", path.relative_to(PROJECT_ROOT))

    load_to_postgres(cleaned)

    logger.info("Running Phase 6 indicator extensions...")
    _, phase6_outputs = run_phase6_indicators()

    logger.info("Running Phase 8 theme extensions...")
    _, phase8_outputs = run_phase8_theme_extensions()

    export_verified_json_for_website(outputs, phase6_outputs, phase8_outputs)

    if validation_report.get("warnings"):
        logger.info("Validation warnings detected:")
        for warning in validation_report["warnings"]:
            logger.info("  - %s", warning.get("message", warning))

    logger.info("ETL pipeline completed successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(run_pipeline())
