/**
 * MC3 Verified Data Loader
 * Loads ETL-generated JSON from /data/verified/ separately from original dashboard data.
 */

const VERIFIED_DATA_BASE = 'data/verified/';

/**
 * Fetch a verified JSON file with graceful error handling.
 * @param {string} filename
 * @returns {Promise<object|array|null>}
 */
async function fetchVerifiedJson(filename) {
    try {
        const response = await fetch(`${VERIFIED_DATA_BASE}${filename}`);
        if (!response.ok) {
            console.warn(
                `[MC3 Verified Data] Could not load ${filename} (HTTP ${response.status}). ` +
                'Verified section will use fallback text.'
            );
            return null;
        }
        return await response.json();
    } catch (error) {
        console.warn(
            `[MC3 Verified Data] Failed to fetch ${filename}:`,
            error.message
        );
        return null;
    }
}

/**
 * Load cleaned poverty trend records from ETL output.
 * @returns {Promise<Array|null>}
 */
async function loadVerifiedPovertyTrend() {
    const data = await fetchVerifiedJson('children_in_poverty_clean.json');
    if (!Array.isArray(data)) {
        return null;
    }
    return data
        .filter((row) => row.year != null)
        .sort((a, b) => a.year - b.year);
}

/**
 * Load verified poverty summary metrics.
 * @returns {Promise<object|null>}
 */
async function loadVerifiedPovertyMetrics() {
    return fetchVerifiedJson('poverty_metrics_verified.json');
}

/**
 * Load metric validation / discrepancy report.
 * @returns {Promise<object|null>}
 */
async function loadMetricValidationReport() {
    return fetchVerifiedJson('metric_validation_report.json');
}

/**
 * Format a value as a percentage string.
 * @param {number} value
 * @param {number} [decimals=1]
 * @returns {string}
 */
function formatPercentage(value, decimals = 1) {
    if (value == null || Number.isNaN(Number(value))) {
        return 'N/A';
    }
    return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format a percentage-point change.
 * @param {number} value
 * @param {number} [decimals=1]
 * @returns {string}
 */
function formatPercentagePointChange(value, decimals = 1) {
    if (value == null || Number.isNaN(Number(value))) {
        return 'N/A';
    }
    return `${Number(value).toFixed(decimals)} percentage points`;
}

// Export for module-style usage in other scripts
window.MC3VerifiedData = {
    loadVerifiedPovertyTrend,
    loadVerifiedPovertyMetrics,
    loadMetricValidationReport,
    formatPercentage,
    formatPercentagePointChange,
};
