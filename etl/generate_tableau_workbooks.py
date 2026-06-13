#!/usr/bin/env python3
"""Generate Tableau .twb workbook XML files pointing to processed CSV outputs."""

from __future__ import annotations

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TABLEAU_DIR = PROJECT_ROOT / "tableau"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

WORKBOOKS = [
    {
        "filename": "mc3_child_poverty_trends.twb",
        "name": "MC3 Child Poverty",
        "csv": "children_in_poverty_clean.csv",
        "columns": [
            ("year", "integer"),
            ("children_in_poverty_rate_pct", "real"),
        ],
        "worksheet": "Poverty Trend",
    },
    {
        "filename": "mc3_housing_stability.twb",
        "name": "MC3 Housing Stability",
        "csv": "housing_stability_clean.csv",
        "columns": [
            ("year", "integer"),
            ("indicator_value", "real"),
        ],
        "worksheet": "Rent Burden Trend",
    },
    {
        "filename": "mc3_mental_health_suicide.twb",
        "name": "MC3 Mental Health Signal",
        "csv": "mental_health_clean.csv",
        "columns": [
            ("year", "integer"),
            ("indicator_value", "integer"),
        ],
        "worksheet": "Suicide Deaths Trend",
    },
    {
        "filename": "mc3_multi_indicator_dashboard.twb",
        "name": "MC3 Multi Indicator",
        "csv": "cdc_wonder_suicide_clean.csv",
        "columns": [
            ("year", "integer"),
            ("indicator_value", "integer"),
        ],
        "worksheet": "CDC WONDER Suicide",
    },
]


def _column_xml(name: str, datatype: str, ordinal: int) -> str:
    return f'<column datatype="{datatype}" name="{name}" ordinal="{ordinal}" />'


def build_workbook(spec: dict) -> str:
    csv_path = (PROCESSED_DIR / spec["csv"]).resolve()
    table_name = f"[{spec['csv']}#csv]"
    columns_xml = "\n".join(
        _column_xml(name, dtype, idx) for idx, (name, dtype) in enumerate(spec["columns"])
    )
    return f"""<?xml version='1.0' encoding='utf-8'?>
<workbook source-build='2024.1.0' version='18.1' xmlns:user='http://www.tableausoftware.com/xml/user'>
  <preferences />
  <datasources>
    <datasource caption='{spec["name"]}' inline='true' name='{spec["name"]}' version='18.1'>
      <connection class='textscan' directory='{csv_path.parent}' filename='{csv_path.name}' />
      <relation name='{spec["csv"]}' table='{table_name}' type='table'>
        <columns header='yes' separator=','>
{columns_xml}
        </columns>
      </relation>
    </datasource>
  </datasources>
  <worksheets>
    <worksheet name='{spec["worksheet"]}' />
  </worksheets>
</workbook>
"""


def main() -> int:
    TABLEAU_DIR.mkdir(parents=True, exist_ok=True)
    for spec in WORKBOOKS:
        path = TABLEAU_DIR / spec["filename"]
        path.write_text(build_workbook(spec), encoding="utf-8")
        print(f"Wrote {path.relative_to(PROJECT_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
