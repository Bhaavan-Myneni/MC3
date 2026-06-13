/**
 * MC3 Verified Poverty Chart
 * Renders the ETL-verified child poverty trend without modifying existing charts.
 */

let verifiedPovertyChartInstance = null;

/**
 * Render Chart.js line chart for verified poverty trend.
 * @param {HTMLCanvasElement} canvas
 * @param {Array} trendRecords
 */
function renderVerifiedPovertyChart(canvas, trendRecords) {
    if (!canvas || !trendRecords || trendRecords.length === 0) {
        return;
    }

    const years = trendRecords.map((row) => row.year);
    const rates = trendRecords.map((row) => {
        if (row.children_in_poverty_rate_pct != null) {
            return Number(row.children_in_poverty_rate_pct);
        }
        if (row.children_in_poverty != null) {
            return Number(row.children_in_poverty) * 100;
        }
        return null;
    });

    if (verifiedPovertyChartInstance) {
        verifiedPovertyChartInstance.destroy();
    }

    verifiedPovertyChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Child Poverty Rate (%)',
                    data: rates,
                    borderColor: '#2E86AB',
                    backgroundColor: 'rgba(46, 134, 171, 0.15)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#003366',
                    fill: true,
                    tension: 0.2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label(context) {
                            return ` ${context.parsed.y}% child poverty rate`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Child Poverty Rate (%)',
                    },
                    beginAtZero: false,
                    ticks: {
                        callback(value) {
                            return `${value}%`;
                        },
                    },
                },
            },
        },
    });
}

/**
 * Populate verified metric text elements when present.
 * @param {object|null} metrics
 */
function populateVerifiedMetricCards(metrics) {
    if (!metrics) {
        return;
    }

    const mappings = [
        ['verified-latest-rate', metrics.end_value_pct, (v) => MC3VerifiedData.formatPercentage(v)],
        ['verified-start-rate', metrics.start_value_pct, (v) => MC3VerifiedData.formatPercentage(v)],
        ['verified-end-rate', metrics.end_value_pct, (v) => MC3VerifiedData.formatPercentage(v)],
        ['verified-pp-change', metrics.percentage_point_change, (v) => MC3VerifiedData.formatPercentagePointChange(v)],
        ['verified-relative-change', metrics.percent_change_relative, (v) => `${Number(v).toFixed(2)}%`],
        ['verified-start-year', metrics.start_year, (v) => String(v)],
        ['verified-end-year', metrics.end_year, (v) => String(v)],
    ];

    mappings.forEach(([id, value, formatter]) => {
        const element = document.getElementById(id);
        if (element && value != null) {
            element.textContent = formatter(value);
        }
    });
}

/**
 * Show validation warning if discrepancy exists in report.
 * @param {object|null} report
 */
function displayValidationWarning(report) {
    const warningBox = document.getElementById('verified-validation-warning');
    if (!warningBox || !report) {
        return;
    }

    const warnings = report.warnings || [];
    const summaryMismatch = warnings.find((w) => w.type === 'summary_claim_mismatch');

    if (summaryMismatch) {
        warningBox.hidden = false;
        warningBox.innerHTML = `
            <strong>Validation note:</strong>
            The previous 8.3 percentage-point claim in <code>dashboard_summary.json</code>
            is flagged for review. The verified value from
            <code>Children in Poverty.csv</code> is
            <strong>${summaryMismatch.etl_verified_value} percentage points</strong>.
        `;
    }
}

/**
 * Initialize the verified poverty section on the homepage.
 */
async function initVerifiedPovertySection() {
    const section = document.getElementById('verified-poverty-section');
    if (!section) {
        return;
    }

    const fallback = document.getElementById('verified-chart-fallback');
    const canvas = document.getElementById('verifiedPovertyChart');

    try {
        const [trend, metrics, report] = await Promise.all([
            MC3VerifiedData.loadVerifiedPovertyTrend(),
            MC3VerifiedData.loadVerifiedPovertyMetrics(),
            MC3VerifiedData.loadMetricValidationReport(),
        ]);

        populateVerifiedMetricCards(metrics);
        displayValidationWarning(report);

        if (trend && canvas && typeof Chart !== 'undefined') {
            renderVerifiedPovertyChart(canvas, trend);
            if (fallback) {
                fallback.hidden = true;
            }
        } else if (fallback) {
            fallback.hidden = false;
            fallback.textContent =
                'Verified poverty chart could not be loaded. Run the ETL pipeline to export data to data/verified/.';
        }
    } catch (error) {
        console.warn('[MC3 Verified Poverty] Initialization failed:', error.message);
        if (fallback) {
            fallback.hidden = false;
            fallback.textContent =
                'Verified poverty data is temporarily unavailable. The rest of the dashboard continues to work.';
        }
    }
}

document.addEventListener('DOMContentLoaded', initVerifiedPovertySection);

window.MC3VerifiedPovertyChart = {
    renderVerifiedPovertyChart,
    initVerifiedPovertySection,
};
