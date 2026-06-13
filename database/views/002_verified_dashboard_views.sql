-- MC3 Summit 2025 — Verified Dashboard Views (Phase 6)
-- Depends on: database/schema/002_add_verified_indicators.sql
-- Poverty views from Phase 4 remain unchanged.

CREATE OR REPLACE VIEW mc3.v_verified_education_trend AS
SELECT
    county_fips,
    county_name,
    year,
    indicator_name,
    indicator_value AS graduation_rate_pct,
    indicator_unit,
    source_file
FROM mc3.education_indicators
WHERE indicator_name = 'high_school_graduation_rate'
ORDER BY year;

CREATE OR REPLACE VIEW mc3.v_verified_economic_trend AS
SELECT
    county_fips,
    county_name,
    year,
    indicator_name,
    indicator_value AS unemployment_rate_pct,
    indicator_unit,
    source_file
FROM mc3.economic_indicators
WHERE indicator_name = 'county_unemployment_rate'
ORDER BY year;

CREATE OR REPLACE VIEW mc3.v_verified_demographic_trend AS
SELECT
    county_fips,
    county_name,
    year,
    indicator_name,
    indicator_value AS total_child_population,
    indicator_unit,
    source_file
FROM mc3.demographic_indicators
WHERE indicator_name = 'total_child_population'
ORDER BY year;

CREATE OR REPLACE VIEW mc3.v_verified_social_services_trend AS
SELECT
    county_fips,
    county_name,
    year,
    indicator_name,
    indicator_value AS snap_participants_monthly_avg,
    indicator_unit,
    source_file
FROM mc3.social_service_indicators
WHERE indicator_name = 'snap_participants_monthly_avg'
ORDER BY year;

-- Combined feed of available verified indicators by year
CREATE OR REPLACE VIEW mc3.v_mc3_verified_dashboard_feed AS
SELECT year, 'education' AS topic, indicator_name, indicator_value, indicator_unit, source_file
FROM mc3.education_indicators
UNION ALL
SELECT year, 'economy', indicator_name, indicator_value, indicator_unit, source_file
FROM mc3.economic_indicators
UNION ALL
SELECT year, 'demographics', indicator_name, indicator_value, indicator_unit, source_file
FROM mc3.demographic_indicators
UNION ALL
SELECT year, 'social_services', indicator_name, indicator_value, indicator_unit, source_file
FROM mc3.social_service_indicators
ORDER BY topic, year;

COMMENT ON VIEW mc3.v_mc3_verified_dashboard_feed IS
    'Combined verified indicator feed for dashboard cards and exports. Poverty remains in mc3.v_child_poverty_trend.';
