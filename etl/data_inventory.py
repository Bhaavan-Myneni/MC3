#!/usr/bin/env python3
"""
MC3 Data Inventory Scanner
Recursively catalogs real data files in data/raw, data/processed, and website/data/processed.
"""

from __future__ import annotations

import csv
import json
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

try:
    import openpyxl

    HAS_OPENPYXL = True
except ImportError:
    HAS_OPENPYXL = False

try:
    import geopandas  # noqa: F401

    HAS_GEOPANDAS = True
except ImportError:
    HAS_GEOPANDAS = False

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SCAN_DIRS = [
    ("raw", PROJECT_ROOT / "data" / "raw"),
    ("processed", PROJECT_ROOT / "data" / "processed"),
    ("website_processed", PROJECT_ROOT / "website" / "data" / "processed"),
]

INVENTORY_FIELDS = [
    "file_name",
    "file_path",
    "extension",
    "file_size_kb",
    "parent_folder",
    "inferred_topic",
    "data_stage",
    "row_count",
    "column_count",
    "column_names",
    "sheet_names",
    "top_level_keys",
    "duplicate_locations",
    "notes",
]

TOPIC_KEYWORDS = {
    "demographics": [
        "demographic", "acs", "poverty", "population", "b01001", "b07009",
        "s1701", "s1702", "s1501", "s1401", "s1901", "s1902", "s1903",
        "s2201", "s2301", "b27007", "mobility", "attainment", "enrollment",
        "children in poverty", "child population",
    ],
    "education": [
        "education", "school", "graduation", "dropout", "suspension",
        "student", "enrollment", "lunch", "grade",
    ],
    "economy": [
        "econom", "unemployment", "employment", "income", "labor",
        "clinical care", "median income", "mean income",
    ],
    "social_services": [
        "social", "snap", "tanf", "foster", "wic", "juvenile", "chins",
        "food stamp", "child care", "child abuse", "collaborative care",
        "removed from household", "food insecurity",
    ],
    "geography": [
        "tract", "shapefile", "geographic", "tl_2010", "tl_2024", ".shp",
        "census_tract", "geojson",
    ],
    "housing": [
        "housing", "homeless", "rent", "homeowner", "eviction", "unstable",
    ],
    "health": [
        "health", "mental", "clinical", "medicaid", "provider", "safety",
    ],
    "correlations": [
        "correlation", "comprehensive", "cross", "resilience",
    ],
}

DATA_EXTENSIONS = {
    ".csv", ".xlsx", ".xls", ".json", ".shp", ".shx", ".dbf", ".prj",
    ".cpg", ".xml", ".pdf", ".txt",
}

SKIP_NAMES = {".ds_store"}


def infer_topic(path: Path, file_name: str) -> str:
    haystack = f"{path} {file_name}".lower()
    scores: dict[str, int] = defaultdict(int)
    for topic, keywords in TOPIC_KEYWORDS.items():
        for keyword in keywords:
            if keyword in haystack:
                scores[topic] += 1
    if scores:
        return max(scores, key=scores.get)
    if "processed" in haystack or path.suffix.lower() == ".json":
        return "correlations"
    if path.suffix.lower() in {".txt"} and "table-notes" in haystack:
        return "other"
    return "other"


def infer_data_stage(scan_label: str, path: Path) -> str:
    if scan_label == "raw":
        return "raw_source"
    if "existing_dashboard_json" in str(path):
        return "processed_dashboard_archive"
    if scan_label == "website_processed":
        return "processed_dashboard_active"
    if scan_label == "processed":
        if path.suffix.lower() == ".json":
            return "processed_inventory_or_dashboard"
        return "processed"
    return "unknown"


def read_csv_metadata(path: Path) -> dict:
    encodings = ["utf-8-sig", "utf-8", "latin-1", "cp1252"]
    last_error = None
    for encoding in encodings:
        try:
            with path.open("r", encoding=encoding, newline="") as handle:
                reader = csv.reader(handle)
                rows = []
                for idx, row in enumerate(reader):
                    rows.append(row)
                    if idx >= 5:
                        break
            if not rows:
                return {"notes": "empty csv file"}

            header_row = rows[0]
            data_start = 1
            if len(rows) > 1 and _looks_like_label_row(rows[1]):
                header_row = rows[1]
                data_start = 2

            row_count = _count_csv_rows(path, encoding, data_start)
            columns = [col.strip() for col in header_row if col is not None]
            return {
                "row_count": row_count,
                "column_count": len(columns),
                "column_names": "; ".join(columns[:25]) + ("; ..." if len(columns) > 25 else ""),
                "notes": f"csv encoding={encoding}",
            }
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
            continue
    return {"notes": f"csv unreadable: {last_error}"}


def _looks_like_label_row(row: list[str]) -> bool:
    if not row:
        return False
    sample = " ".join(row[:5]).lower()
    return "estimate" in sample or "margin of error" in sample or "geography" in sample


def _count_csv_rows(path: Path, encoding: str, data_start: int) -> int | None:
    try:
        with path.open("r", encoding=encoding, newline="") as handle:
            total = sum(1 for _ in handle)
        return max(total - data_start, 0)
    except Exception:  # noqa: BLE001
        return None


def read_xlsx_sheet_names_zip(path: Path) -> list[str]:
    try:
        with zipfile.ZipFile(path) as archive:
            with archive.open("xl/workbook.xml") as workbook_xml:
                tree = ET.parse(workbook_xml)
                root = tree.getroot()
                ns = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
                return [
                    sheet.attrib.get("name", "Sheet")
                    for sheet in root.findall(".//main:sheet", ns)
                ]
    except Exception:  # noqa: BLE001
        return []


def read_xlsx_metadata(path: Path) -> dict:
    if HAS_OPENPYXL:
        try:
            workbook = openpyxl.load_workbook(path, read_only=True, data_only=True)
            sheet_names = workbook.sheetnames
            first_sheet = workbook[sheet_names[0]]
            rows = []
            for idx, row in enumerate(first_sheet.iter_rows(values_only=True)):
                rows.append(["" if cell is None else str(cell) for cell in row])
                if idx >= 2:
                    break
            workbook.close()
            columns = rows[0] if rows else []
            notes = f"xlsx sheets={len(sheet_names)} via openpyxl"
            return {
                "sheet_names": "; ".join(sheet_names),
                "column_count": len(columns),
                "column_names": "; ".join(columns[:25]) + ("; ..." if len(columns) > 25 else ""),
                "notes": notes,
            }
        except Exception as exc:  # noqa: BLE001
            fallback = {"notes": f"xlsx openpyxl error: {exc}"}
    else:
        fallback = {"notes": "xlsx columns unavailable (openpyxl not installed)"}

    sheet_names = read_xlsx_sheet_names_zip(path)
    if sheet_names:
        fallback["sheet_names"] = "; ".join(sheet_names)
        fallback["notes"] = fallback.get("notes", "") + "; sheet names read via zip/xml"
    return fallback


def read_json_metadata(path: Path) -> dict:
    try:
        with path.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except json.JSONDecodeError as exc:
        return {"notes": f"json decode error: {exc}"}
    except Exception as exc:  # noqa: BLE001
        return {"notes": f"json unreadable: {exc}"}

    if isinstance(payload, dict):
        keys = list(payload.keys())
        return {
            "top_level_keys": "; ".join(keys[:30]) + ("; ..." if len(keys) > 30 else ""),
            "row_count": len(payload) if keys else 0,
            "notes": "json object",
        }
    if isinstance(payload, list):
        sample_keys = []
        if payload and isinstance(payload[0], dict):
            sample_keys = list(payload[0].keys())
        return {
            "row_count": len(payload),
            "top_level_keys": "; ".join(sample_keys[:30]) + ("; ..." if len(sample_keys) > 30 else ""),
            "notes": "json array",
        }
    return {"notes": f"json type={type(payload).__name__}"}


def read_shapefile_metadata(path: Path) -> dict:
    stem = path.stem
    parent = path.parent
    components = sorted(
        p.name for p in parent.glob(f"{stem}.*")
        if p.suffix.lower() in {".shp", ".shx", ".dbf", ".prj", ".cpg", ".xml"}
    )
    notes = f"shapefile components: {', '.join(components)}"
    if HAS_GEOPANDAS and path.suffix.lower() == ".shp":
        try:
            import geopandas as gpd

            frame = gpd.read_file(path)
            return {
                "row_count": len(frame),
                "column_count": len(frame.columns),
                "column_names": "; ".join(frame.columns[:25]) + ("; ..." if len(frame.columns) > 25 else ""),
                "notes": notes + "; geometry read via geopandas",
            }
        except Exception as exc:  # noqa: BLE001
            notes += f"; geopandas error: {exc}"
    return {"notes": notes}


def inspect_file(scan_label: str, path: Path) -> dict | None:
    if path.name.lower() in SKIP_NAMES:
        return None

    extension = path.suffix.lower()
    if extension not in DATA_EXTENSIONS:
        return None

    if extension in {".shx", ".dbf", ".prj", ".cpg"}:
        return None

    rel_path = path.relative_to(PROJECT_ROOT).as_posix()
    size_kb = round(path.stat().st_size / 1024, 2)
    record = {
        "file_name": path.name,
        "file_path": rel_path,
        "extension": extension.lstrip("."),
        "file_size_kb": size_kb,
        "parent_folder": path.parent.relative_to(PROJECT_ROOT).as_posix(),
        "inferred_topic": infer_topic(path, path.name),
        "data_stage": infer_data_stage(scan_label, path),
        "row_count": "",
        "column_count": "",
        "column_names": "",
        "sheet_names": "",
        "top_level_keys": "",
        "duplicate_locations": "",
        "notes": "",
    }

    if path.stat().st_size == 0:
        record["notes"] = "empty file"
        return record

    try:
        if extension == ".csv":
            record.update(read_csv_metadata(path))
        elif extension == ".xlsx":
            record.update(read_xlsx_metadata(path))
        elif extension == ".json":
            record.update(read_json_metadata(path))
        elif extension == ".shp":
            record.update(read_shapefile_metadata(path))
        elif extension == ".txt":
            record["notes"] = "documentation or metadata text file"
        elif extension == ".xml":
            record["notes"] = "xml metadata file"
        elif extension == ".pdf":
            record["notes"] = "pdf documentation"
        else:
            record["notes"] = "unsupported structured read; cataloged by filename"
    except Exception as exc:  # noqa: BLE001
        record["notes"] = f"inspection error: {exc}"

    return record


def scan_directory(scan_label: str, directory: Path) -> list[dict]:
    records: list[dict] = []
    if not directory.exists():
        print(f"  Warning: missing directory {directory}")
        return records

    for path in sorted(directory.rglob("*")):
        if not path.is_file():
            continue
        record = inspect_file(scan_label, path)
        if record:
            records.append(record)
    return records


def annotate_duplicates(records: list[dict]) -> None:
    groups: dict[tuple[str, float], list[str]] = defaultdict(list)
    for record in records:
        key = (record["file_name"].lower(), float(record["file_size_kb"]))
        groups[key].append(record["file_path"])

    for record in records:
        key = (record["file_name"].lower(), float(record["file_size_kb"]))
        paths = groups[key]
        if len(paths) > 1:
            others = [p for p in paths if p != record["file_path"]]
            record["duplicate_locations"] = "; ".join(others)


def save_csv(records: list[dict], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=INVENTORY_FIELDS)
        writer.writeheader()
        writer.writerows(records)


def save_json(records: list[dict], output_path: Path, summary: dict) -> None:
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "project_root": str(PROJECT_ROOT),
        "openpyxl_available": HAS_OPENPYXL,
        "geopandas_available": HAS_GEOPANDAS,
        "summary": summary,
        "records": records,
    }
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)


def build_summary(records: list[dict]) -> dict:
    by_type = Counter(record["extension"] for record in records)
    by_topic = Counter(record["inferred_topic"] for record in records)
    by_stage = Counter(record["data_stage"] for record in records)
    duplicates = [r for r in records if r["duplicate_locations"]]
    unreadable = [
        r for r in records
        if any(token in r.get("notes", "").lower() for token in ["unreadable", "error", "decode"])
    ]
    return {
        "total_files": len(records),
        "by_type": dict(sorted(by_type.items())),
        "by_topic": dict(sorted(by_topic.items())),
        "by_stage": dict(sorted(by_stage.items())),
        "duplicate_file_records": len(duplicates),
        "unreadable_or_error_records": len(unreadable),
    }


def main() -> int:
    print("Starting data inventory scan...")
    all_records: list[dict] = []

    print("Scanning raw data...")
    all_records.extend(scan_directory("raw", SCAN_DIRS[0][1]))

    print("Scanning processed dashboard JSON...")
    all_records.extend(scan_directory("processed", SCAN_DIRS[1][1]))
    all_records.extend(scan_directory("website_processed", SCAN_DIRS[2][1]))

    annotate_duplicates(all_records)
    summary = build_summary(all_records)

    csv_path = PROJECT_ROOT / "data" / "processed" / "data_inventory.csv"
    json_path = PROJECT_ROOT / "data" / "processed" / "data_inventory.json"
    save_csv(all_records, csv_path)
    save_json(all_records, json_path, summary)

    print(f"Inventory saved to {csv_path.relative_to(PROJECT_ROOT)}")
    print(f"Inventory saved to {json_path.relative_to(PROJECT_ROOT)}")
    print("Data inventory completed successfully.")
    print(f"Total files cataloged: {summary['total_files']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
