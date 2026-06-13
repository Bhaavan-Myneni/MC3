-- MC3 Summit 2025 — Poverty Reporting Views
-- Depends on: database/schema/001_initial_schema.sql
-- Verified: 6.2 percentage-point reduction (20.2% in 2014 → 14.0% in 2024)

-- ---------------------------------------------------------------------------
-- Trend view — one row per year for charting
-- Feeds: Chart.js, Tableau, Power BI, frontend line charts
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW mc3.v_child_poverty_trend AS
SELECT
    county_fips,
    county_name,
    year,
    children_in_poverty_rate,
    ci_high,
    ci_low,
    indicator_name,
    source_file
FROM mc3.children_in_poverty
WHERE indicator_name = 'children_in_poverty'
ORDER BY year;

COMMENT ON VIEW mc3.v_child_poverty_trend IS
    'Year-by-year child poverty trend for Monroe County. Use for line charts and time-series exports.';

-- ---------------------------------------------------------------------------
-- Summary view — first-to-last year metrics
-- Verified percentage_point_change = start_rate - end_rate = 20.2 - 14.0 = 6.2
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW mc3.v_child_poverty_summary AS
WITH ordered AS (
    SELECT
        county_fips,
        county_name,
        year,
        children_in_poverty_rate,
        ROW_NUMBER() OVER (PARTITION BY county_fips ORDER BY year ASC)  AS rn_asc,
        ROW_NUMBER() OVER (PARTITION BY county_fips ORDER BY year DESC) AS rn_desc
    FROM mc3.children_in_poverty
    WHERE indicator_name = 'children_in_poverty'
),
bounds AS (
    SELECT
        county_fips,
        county_name,
        MAX(CASE WHEN rn_asc = 1  THEN year END)                      AS start_year,
        MAX(CASE WHEN rn_asc = 1  THEN children_in_poverty_rate END) AS start_rate,
        MAX(CASE WHEN rn_desc = 1 THEN year END)                      AS end_year,
        MAX(CASE WHEN rn_desc = 1 THEN children_in_poverty_rate END) AS end_rate
    FROM ordered
    GROUP BY county_fips, county_name
),
stats AS (
    SELECT
        county_fips,
        MIN(children_in_poverty_rate) AS min_rate,
        MAX(children_in_poverty_rate) AS max_rate,
        COUNT(DISTINCT year)          AS number_of_years
    FROM mc3.children_in_poverty
    WHERE indicator_name = 'children_in_poverty'
    GROUP BY county_fips
)
SELECT
    b.county_fips,
    b.county_name,
    b.start_year,
    b.end_year,
    b.start_rate,
    b.end_rate,
    ROUND(b.start_rate - b.end_rate, 1) AS percentage_point_change,
    ROUND(
        ((b.end_rate - b.start_rate) / NULLIF(b.start_rate, 0)) * 100,
        2
    ) AS relative_percent_change,
    s.min_rate,
    s.max_rate,
    s.number_of_years
FROM bounds b
JOIN stats s ON b.county_fips = s.county_fips;

COMMENT ON VIEW mc3.v_child_poverty_summary IS
    'Verified poverty change metrics. percentage_point_change = start_rate - end_rate (6.2pp for 2014–2024).';

-- ---------------------------------------------------------------------------
-- Dashboard metric cards — safe, verified KPI language
-- Does NOT include unverified "children impacted" counts
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW mc3.v_dashboard_metric_cards AS
WITH summary AS (
    SELECT * FROM mc3.v_child_poverty_summary
),
latest AS (
    SELECT
        county_fips,
        children_in_poverty_rate AS latest_rate,
        year AS latest_year
    FROM mc3.children_in_poverty
    WHERE indicator_name = 'children_in_poverty'
    ORDER BY year DESC
    LIMIT 1
)
SELECT
    'Latest Child Poverty Rate' AS metric_name,
    l.latest_rate::TEXT AS metric_value,
    'percent' AS metric_unit,
    'Most recent verified child poverty rate for Monroe County (' || l.latest_year || ').' AS metric_description,
    'mc3.v_child_poverty_trend' AS source_view
FROM latest l

UNION ALL

SELECT
    'Verified Poverty Rate Improvement',
    s.percentage_point_change::TEXT,
    'percentage_points',
    'Verified change from ' || s.start_year || ' (' || s.start_rate || '%) to '
        || s.end_year || ' (' || s.end_rate || '%). Do not use 8.3pp from dashboard_summary.json.',
    'mc3.v_child_poverty_summary'
FROM summary s

UNION ALL

SELECT
    'Reporting Years Covered',
    s.number_of_years::TEXT,
    'years',
    'Distinct years with verified child poverty observations (' || s.start_year || '–' || s.end_year || ').',
    'mc3.v_child_poverty_summary'
FROM summary s

UNION ALL

SELECT
    'Minimum Poverty Rate Observed',
    s.min_rate::TEXT,
    'percent',
    'Lowest verified child poverty rate in the reporting period.',
    'mc3.v_child_poverty_summary'
FROM summary s;

COMMENT ON VIEW mc3.v_dashboard_metric_cards IS
    'Dashboard-ready KPI cards using verified metrics only. Safe for portfolio and policy summaries.';
