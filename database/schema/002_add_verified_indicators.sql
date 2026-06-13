-- MC3 Summit 2025 — Additional Verified Indicator Tables (Phase 6)
-- Depends on: database/schema/001_initial_schema.sql
-- Only includes indicators successfully verified by automated_pipeline.py

-- ---------------------------------------------------------------------------
-- Additional data source records
-- ---------------------------------------------------------------------------
INSERT INTO mc3.data_sources (source_name, source_file, source_type, source_notes)
VALUES
    (
        'High school graduation rate.xlsx',
        'data/raw/education/reference_repo/High school graduation rate.xlsx',
        'xlsx',
        'Kids Count export. Monroe County graduation rate (Percent rows). Latest verified year in file: 2017.'
    ),
    (
        'STATSIN unemployment estimates',
        'data/raw/economy/reference_repo/Unemployment_Estimates/STATSIN_asu*.xlsx',
        'xlsx',
        'County unemployment rate for Monroe County (cnty_fips 105) from annual STATSIN files.'
    ),
    (
        'Child population by age group.xlsx',
        'data/raw/social_services/reference_repo/Child population by age group.xlsx',
        'xlsx',
        'Kids Count export. Total child population estimated by summing age-group Number rows for Monroe County.'
    ),
    (
        'SNAP monthly average participants',
        'data/raw/social_services/reference_repo/Monthly average number of persons issued food stamps (SNAP).xlsx',
        'xlsx',
        'Kids Count export. Monroe County monthly average SNAP participants (Number rows).'
    );

-- ---------------------------------------------------------------------------
-- Generic indicator tables (Phase 6)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mc3.education_indicators (
    id              SERIAL PRIMARY KEY,
    county_fips     TEXT NOT NULL DEFAULT '18105',
    county_name     TEXT NOT NULL DEFAULT 'Monroe County, IN',
    year            INTEGER NOT NULL,
    indicator_name  TEXT NOT NULL,
    indicator_value NUMERIC NOT NULL,
    indicator_unit  TEXT NOT NULL,
    source_file     TEXT,
    etl_processed_at TIMESTAMP,
    source_id       INTEGER REFERENCES mc3.data_sources(source_id),
    CONSTRAINT chk_education_year CHECK (year BETWEEN 1900 AND 2100),
    CONSTRAINT uq_education_indicator UNIQUE (county_fips, year, indicator_name)
);

CREATE TABLE IF NOT EXISTS mc3.economic_indicators (
    id              SERIAL PRIMARY KEY,
    county_fips     TEXT NOT NULL DEFAULT '18105',
    county_name     TEXT NOT NULL DEFAULT 'Monroe County, IN',
    year            INTEGER NOT NULL,
    indicator_name  TEXT NOT NULL,
    indicator_value NUMERIC NOT NULL,
    indicator_unit  TEXT NOT NULL,
    source_file     TEXT,
    etl_processed_at TIMESTAMP,
    source_id       INTEGER REFERENCES mc3.data_sources(source_id),
    CONSTRAINT chk_economic_year CHECK (year BETWEEN 1900 AND 2100),
    CONSTRAINT uq_economic_indicator UNIQUE (county_fips, year, indicator_name)
);

CREATE TABLE IF NOT EXISTS mc3.demographic_indicators (
    id              SERIAL PRIMARY KEY,
    county_fips     TEXT NOT NULL DEFAULT '18105',
    county_name     TEXT NOT NULL DEFAULT 'Monroe County, IN',
    year            INTEGER NOT NULL,
    indicator_name  TEXT NOT NULL,
    indicator_value NUMERIC NOT NULL,
    indicator_unit  TEXT NOT NULL,
    source_file     TEXT,
    etl_processed_at TIMESTAMP,
    source_id       INTEGER REFERENCES mc3.data_sources(source_id),
    CONSTRAINT chk_demographic_year CHECK (year BETWEEN 1900 AND 2100),
    CONSTRAINT uq_demographic_indicator UNIQUE (county_fips, year, indicator_name)
);

CREATE TABLE IF NOT EXISTS mc3.social_service_indicators (
    id              SERIAL PRIMARY KEY,
    county_fips     TEXT NOT NULL DEFAULT '18105',
    county_name     TEXT NOT NULL DEFAULT 'Monroe County, IN',
    year            INTEGER NOT NULL,
    indicator_name  TEXT NOT NULL,
    indicator_value NUMERIC NOT NULL,
    indicator_unit  TEXT NOT NULL,
    source_file     TEXT,
    etl_processed_at TIMESTAMP,
    source_id       INTEGER REFERENCES mc3.data_sources(source_id),
    CONSTRAINT chk_social_year CHECK (year BETWEEN 1900 AND 2100),
    CONSTRAINT uq_social_indicator UNIQUE (county_fips, year, indicator_name)
);

CREATE INDEX IF NOT EXISTS idx_education_county_fips ON mc3.education_indicators (county_fips);
CREATE INDEX IF NOT EXISTS idx_education_year ON mc3.education_indicators (year);
CREATE INDEX IF NOT EXISTS idx_education_indicator_name ON mc3.education_indicators (indicator_name);
CREATE INDEX IF NOT EXISTS idx_education_county_year ON mc3.education_indicators (county_fips, year);

CREATE INDEX IF NOT EXISTS idx_economic_county_fips ON mc3.economic_indicators (county_fips);
CREATE INDEX IF NOT EXISTS idx_economic_year ON mc3.economic_indicators (year);
CREATE INDEX IF NOT EXISTS idx_economic_indicator_name ON mc3.economic_indicators (indicator_name);
CREATE INDEX IF NOT EXISTS idx_economic_county_year ON mc3.economic_indicators (county_fips, year);

CREATE INDEX IF NOT EXISTS idx_demographic_county_fips ON mc3.demographic_indicators (county_fips);
CREATE INDEX IF NOT EXISTS idx_demographic_year ON mc3.demographic_indicators (year);
CREATE INDEX IF NOT EXISTS idx_demographic_indicator_name ON mc3.demographic_indicators (indicator_name);
CREATE INDEX IF NOT EXISTS idx_demographic_county_year ON mc3.demographic_indicators (county_fips, year);

CREATE INDEX IF NOT EXISTS idx_social_county_fips ON mc3.social_service_indicators (county_fips);
CREATE INDEX IF NOT EXISTS idx_social_year ON mc3.social_service_indicators (year);
CREATE INDEX IF NOT EXISTS idx_social_indicator_name ON mc3.social_service_indicators (indicator_name);
CREATE INDEX IF NOT EXISTS idx_social_county_year ON mc3.social_service_indicators (county_fips, year);
