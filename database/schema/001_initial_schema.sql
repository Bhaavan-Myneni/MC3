-- MC3 Summit 2025 — Initial PostgreSQL Schema
-- Source: data/processed/children_in_poverty_clean.csv (Phase 3 ETL output)
-- Verified metric: 6.2 percentage-point reduction (2014: 20.2% → 2024: 14.0%)

CREATE SCHEMA IF NOT EXISTS mc3;

-- ---------------------------------------------------------------------------
-- Drop existing objects (safe re-run)
-- ---------------------------------------------------------------------------
DROP VIEW IF EXISTS mc3.v_dashboard_metric_cards;
DROP VIEW IF EXISTS mc3.v_child_poverty_summary;
DROP VIEW IF EXISTS mc3.v_child_poverty_trend;

DROP TABLE IF EXISTS mc3.children_in_poverty;
DROP TABLE IF EXISTS mc3.data_sources;

-- ---------------------------------------------------------------------------
-- Data source registry
-- ---------------------------------------------------------------------------
CREATE TABLE mc3.data_sources (
    source_id     SERIAL PRIMARY KEY,
    source_name   TEXT NOT NULL,
    source_file   TEXT,
    source_type   TEXT,
    source_notes  TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE mc3.data_sources IS
    'Registry of raw data files copied into the portfolio /data/raw folder.';

-- ---------------------------------------------------------------------------
-- Children in poverty — cleaned ETL output
--
-- CSV column mapping:
--   county_id                  → county_id (source GEO ID)
--   county / county_name       → county_name
--   year                       → year
--   children_in_poverty        → children_in_poverty_proportion (0–1, source)
--   children_in_poverty_rate_pct → children_in_poverty_rate (0–100, derived)
--   children_in_poverty_ci_high → ci_high (converted to percent 0–100)
--   children_in_poverty_ci_low  → ci_low (converted to percent 0–100)
--   data_topic, indicator_name, source_file, etl_processed_at → lineage
--   value_type, verified       → lineage / quality flags
-- ---------------------------------------------------------------------------
CREATE TABLE mc3.children_in_poverty (
    poverty_id                    SERIAL PRIMARY KEY,
    county_id                     TEXT,
    county_fips                   TEXT NOT NULL,
    county_name                   TEXT NOT NULL,
    year                          INTEGER NOT NULL,
    children_in_poverty_proportion NUMERIC(8, 6),
    children_in_poverty_rate      NUMERIC(5, 1) NOT NULL,
    ci_high                       NUMERIC(5, 1),
    ci_low                        NUMERIC(5, 1),
    data_topic                    TEXT,
    indicator_name                TEXT,
    source_file                   TEXT,
    etl_processed_at              TIMESTAMP,
    value_type                    TEXT,
    verified                      BOOLEAN DEFAULT TRUE,
    source_id                     INTEGER REFERENCES mc3.data_sources(source_id),
    CONSTRAINT chk_children_poverty_year
        CHECK (year BETWEEN 1900 AND 2100),
    CONSTRAINT chk_children_poverty_rate
        CHECK (children_in_poverty_rate BETWEEN 0 AND 100),
    CONSTRAINT chk_children_poverty_ci_high
        CHECK (ci_high IS NULL OR ci_high BETWEEN 0 AND 100),
    CONSTRAINT chk_children_poverty_ci_low
        CHECK (ci_low IS NULL OR ci_low BETWEEN 0 AND 100),
    CONSTRAINT uq_children_poverty_county_year
        UNIQUE (county_fips, year, indicator_name)
);

COMMENT ON TABLE mc3.children_in_poverty IS
    'Verified Monroe County child poverty trend from Children in Poverty.csv ETL output.';

COMMENT ON COLUMN mc3.children_in_poverty.children_in_poverty_rate IS
    'Child poverty rate on percent scale (0–100). Matches children_in_poverty_rate_pct in ETL CSV.';

COMMENT ON COLUMN mc3.children_in_poverty.children_in_poverty_proportion IS
    'Original source proportion (0–1) from Children In Poverty column.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_children_poverty_county_fips
    ON mc3.children_in_poverty (county_fips);

CREATE INDEX idx_children_poverty_year
    ON mc3.children_in_poverty (year);

CREATE INDEX idx_children_poverty_indicator
    ON mc3.children_in_poverty (indicator_name);

CREATE INDEX idx_children_poverty_county_year
    ON mc3.children_in_poverty (county_fips, year);

-- ---------------------------------------------------------------------------
-- Seed data source record
-- ---------------------------------------------------------------------------
INSERT INTO mc3.data_sources (
    source_name,
    source_file,
    source_type,
    source_notes
) VALUES (
    'Children in Poverty.csv',
    'data/raw/misc/dataset_archive/Children in Poverty.csv',
    'csv',
    'Raw source copied into portfolio /data/raw. Monroe County child poverty rates 2014–2024. '
    'ETL verified 6.2 percentage-point reduction (20.2% to 14.0%). '
    'Do not use dashboard_summary.json claim of 8.3pp without separate source proof.'
);

-- ---------------------------------------------------------------------------
-- Seed poverty rows from verified ETL output
-- Confidence intervals stored on percent scale (proportion × 100).
-- ---------------------------------------------------------------------------
INSERT INTO mc3.children_in_poverty (
    county_id,
    county_fips,
    county_name,
    year,
    children_in_poverty_proportion,
    children_in_poverty_rate,
    ci_high,
    ci_low,
    data_topic,
    indicator_name,
    source_file,
    etl_processed_at,
    value_type,
    verified,
    source_id
)
SELECT
    v.county_id,
    v.county_fips,
    v.county_name,
    v.year,
    v.children_in_poverty_proportion,
    v.children_in_poverty_rate,
    v.ci_high,
    v.ci_low,
    v.data_topic,
    v.indicator_name,
    v.source_file,
    v.etl_processed_at::timestamp,
    v.value_type,
    v.verified,
    ds.source_id
FROM (
    VALUES
        ('05000US18105', '18105', 'Monroe County, IN', 2014, 0.202000007033348, 20.2, 24.3, 16.1, 'demographics', 'children_in_poverty', 'data/raw/misc/dataset_archive/Children in Poverty.csv', '2026-06-13T19:19:29.745465+00:00', 'rate_proportion', TRUE),
        ('05000US18105', '18105', 'Monroe County, IN', 2015, 0.1780000030994415, 17.8, 21.9, 13.7, 'demographics', 'children_in_poverty', 'data/raw/misc/dataset_archive/Children in Poverty.csv', '2026-06-13T19:19:29.745465+00:00', 'rate_proportion', TRUE),
        ('05000US18105', '18105', 'Monroe County, IN', 2016, 0.1899999976158142, 19.0, 23.2, 14.8, 'demographics', 'children_in_poverty', 'data/raw/misc/dataset_archive/Children in Poverty.csv', '2026-06-13T19:19:29.745465+00:00', 'rate_proportion', TRUE),
        ('05000US18105', '18105', 'Monroe County, IN', 2017, 0.181999996304512,  18.2, 22.0, 14.4, 'demographics', 'children_in_poverty', 'data/raw/misc/dataset_archive/Children in Poverty.csv', '2026-06-13T19:19:29.745465+00:00', 'rate_proportion', TRUE),
        ('05000US18105', '18105', 'Monroe County, IN', 2018, 0.1759999990463256,  17.6, 21.5, 13.7, 'demographics', 'children_in_poverty', 'data/raw/misc/dataset_archive/Children in Poverty.csv', '2026-06-13T19:19:29.745465+00:00', 'rate_proportion', TRUE),
        ('05000US18105', '18105', 'Monroe County, IN', 2019, 0.1720000058412552,  17.2, 20.8, 13.6, 'demographics', 'children_in_poverty', 'data/raw/misc/dataset_archive/Children in Poverty.csv', '2026-06-13T19:19:29.745465+00:00', 'rate_proportion', TRUE),
        ('05000US18105', '18105', 'Monroe County, IN', 2020, 0.1420000046491623,  14.2, 18.0, 10.4, 'demographics', 'children_in_poverty', 'data/raw/misc/dataset_archive/Children in Poverty.csv', '2026-06-13T19:19:29.745465+00:00', 'rate_proportion', TRUE),
        ('05000US18105', '18105', 'Monroe County, IN', 2021, 0.1500000059604644,  15.0, 18.9, 11.1, 'demographics', 'children_in_poverty', 'data/raw/misc/dataset_archive/Children in Poverty.csv', '2026-06-13T19:19:29.745465+00:00', 'rate_proportion', TRUE),
        ('05000US18105', '18105', 'Monroe County, IN', 2022, 0.1369999945163726,  13.7, 17.2, 10.2, 'demographics', 'children_in_poverty', 'data/raw/misc/dataset_archive/Children in Poverty.csv', '2026-06-13T19:19:29.745465+00:00', 'rate_proportion', TRUE),
        ('05000US18105', '18105', 'Monroe County, IN', 2023, 0.1439999938011169,  14.4, 18.7, 10.1, 'demographics', 'children_in_poverty', 'data/raw/misc/dataset_archive/Children in Poverty.csv', '2026-06-13T19:19:29.745465+00:00', 'rate_proportion', TRUE),
        ('05000US18105', '18105', 'Monroe County, IN', 2024, 0.1400000005960464,  14.0, 18.5,  9.5, 'demographics', 'children_in_poverty', 'data/raw/misc/dataset_archive/Children in Poverty.csv', '2026-06-13T19:19:29.745465+00:00', 'rate_proportion', TRUE)
) AS v (
    county_id,
    county_fips,
    county_name,
    year,
    children_in_poverty_proportion,
    children_in_poverty_rate,
    ci_high,
    ci_low,
    data_topic,
    indicator_name,
    source_file,
    etl_processed_at,
    value_type,
    verified
)
CROSS JOIN mc3.data_sources ds
WHERE ds.source_name = 'Children in Poverty.csv';
