-- MC3 Summit 2025 — Example Poverty Queries
-- Run: psql "$DATABASE_URL" -f database/queries/example_poverty_queries.sql
--
-- Prerequisites:
--   database/schema/001_initial_schema.sql
--   database/views/001_poverty_views.sql

\echo '=== 1. Full child poverty trend ==='
-- Shows every year in the verified trend table.
-- Use this to build a line chart or export to CSV for Chart.js.
SELECT
    county_fips,
    county_name,
    year,
    children_in_poverty_rate,
    ci_low,
    ci_high
FROM mc3.v_child_poverty_trend
ORDER BY year;

\echo ''
\echo '=== 2. Latest poverty rate ==='
-- Returns the most recent verified child poverty rate.
SELECT
    year,
    children_in_poverty_rate AS latest_child_poverty_rate_pct
FROM mc3.v_child_poverty_trend
ORDER BY year DESC
LIMIT 1;

\echo ''
\echo '=== 3. First-to-last year improvement (verified) ==='
-- Calculates the verified 6.2 percentage-point change (20.2% - 14.0%).
-- This matches poverty_metrics_verified.json from the ETL pipeline.
SELECT
    start_year,
    end_year,
    start_rate,
    end_rate,
    percentage_point_change,
    relative_percent_change
FROM mc3.v_child_poverty_summary;

\echo ''
\echo '=== 4. Best and worst poverty years ==='
-- Identifies the lowest and highest child poverty rates in the series.
SELECT
    year,
    children_in_poverty_rate,
    CASE
        WHEN children_in_poverty_rate = (SELECT MIN(children_in_poverty_rate) FROM mc3.v_child_poverty_trend)
            THEN 'best (lowest rate)'
        WHEN children_in_poverty_rate = (SELECT MAX(children_in_poverty_rate) FROM mc3.v_child_poverty_trend)
            THEN 'worst (highest rate)'
        ELSE 'other'
    END AS year_label
FROM mc3.v_child_poverty_trend
WHERE children_in_poverty_rate IN (
    (SELECT MIN(children_in_poverty_rate) FROM mc3.v_child_poverty_trend),
    (SELECT MAX(children_in_poverty_rate) FROM mc3.v_child_poverty_trend)
)
ORDER BY year;

\echo ''
\echo '=== 5. Dashboard metric cards ==='
-- Returns KPI values safe for portfolio materials and dashboard cards.
SELECT
    metric_name,
    metric_value,
    metric_unit,
    metric_description
FROM mc3.v_dashboard_metric_cards
ORDER BY metric_name;

\echo ''
\echo '=== 6. Check for missing years ==='
-- Finds gaps in the annual time series between min and max year.
WITH year_span AS (
    SELECT
        MIN(year) AS min_year,
        MAX(year) AS max_year
    FROM mc3.children_in_poverty
),
expected AS (
    SELECT generate_series(min_year, max_year) AS year
    FROM year_span
),
actual AS (
    SELECT DISTINCT year
    FROM mc3.children_in_poverty
)
SELECT e.year AS missing_year
FROM expected e
LEFT JOIN actual a ON e.year = a.year
WHERE a.year IS NULL
ORDER BY e.year;

\echo ''
\echo '=== 7. Validate rates are between 0 and 100 ==='
-- Should return zero rows if constraints and ETL output are correct.
SELECT
    poverty_id,
    year,
    children_in_poverty_rate
FROM mc3.children_in_poverty
WHERE children_in_poverty_rate < 0
   OR children_in_poverty_rate > 100;

\echo ''
\echo '=== 8. Data source lineage ==='
-- Shows which raw file each poverty row came from.
SELECT
    ds.source_name,
    ds.source_file,
    ds.source_type,
    COUNT(p.poverty_id) AS row_count
FROM mc3.data_sources ds
LEFT JOIN mc3.children_in_poverty p ON ds.source_id = p.source_id
GROUP BY ds.source_id, ds.source_name, ds.source_file, ds.source_type;
