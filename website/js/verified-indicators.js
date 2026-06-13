/**
 * MC3 Verified Multi-Indicator Dashboard
 * Loads verified JSON files, renders cards, mini trend charts, and story context.
 */

const VERIFIED_INDICATOR_CONFIG = [
    {
        id: 'poverty',
        file: 'children_in_poverty_clean.json',
        metricsFile: 'poverty_metrics_verified.json',
        indicatorName: 'children_in_poverty',
        valueField: 'children_in_poverty_rate_pct',
        title: 'Child Poverty',
        canvasId: 'verifiedPovertyMiniChart',
        noteId: 'verifiedPovertyMiniChart-note',
        cardValueId: 'card-poverty-value',
        cardTrendId: 'card-poverty-trend',
        cardStoryId: 'card-poverty-story',
        cardWhyId: 'card-poverty-why',
        cardSourceId: 'card-poverty-source',
        cardLimitationId: 'card-poverty-limitation',
        formatValue: (v) => `${Number(v).toFixed(1)}%`,
        chartLabel: 'Child Poverty Rate (%)',
        chartColor: '#2E86AB',
        topic: 'demographics',
        storyConnection:
            'Child poverty is one way to understand economic pressure surrounding children and families. ' +
            'The verified data shows improvement over time, but the latest rate still signals that many ' +
            'families may need continued support.',
        whyItMatters:
            'Economic hardship can affect housing stability, food access, school support needs, health, and family stress.',
        limitation:
            'This trend shows change over time, but it does not explain what caused the decline.',
        trendLabel: null,
    },
    {
        id: 'graduation',
        file: 'graduation_rate_clean.json',
        indicatorName: 'high_school_graduation_rate',
        valueField: 'indicator_value',
        title: 'Graduation Rate',
        canvasId: 'verifiedGraduationMiniChart',
        noteId: 'verifiedGraduationMiniChart-note',
        cardValueId: 'card-graduation-value',
        cardTrendId: 'card-graduation-trend',
        cardStoryId: 'card-graduation-story',
        cardWhyId: 'card-graduation-why',
        cardSourceId: 'card-graduation-source',
        cardLimitationId: 'card-graduation-limitation',
        formatValue: (v) => `${Number(v).toFixed(2)}%`,
        chartLabel: 'Graduation Rate (%)',
        chartColor: '#003366',
        topic: 'education',
        storyConnection:
            'Graduation reflects one part of the learning environment surrounding youth. It can help describe ' +
            'educational opportunity, but the currently verified source ends in 2017.',
        whyItMatters:
            'Graduation is connected to long-term opportunity, workforce readiness, college access, and youth development.',
        limitation:
            'Do not use newer graduation claims until a newer verified source is processed.',
        trendLabel: 'Verified source ends in 2017',
    },
    {
        id: 'unemployment',
        file: 'unemployment_rate_clean.json',
        indicatorName: 'county_unemployment_rate',
        valueField: 'indicator_value',
        title: 'Unemployment Rate',
        canvasId: 'verifiedUnemploymentMiniChart',
        noteId: 'verifiedUnemploymentMiniChart-note',
        cardValueId: 'card-unemployment-value',
        cardTrendId: 'card-unemployment-trend',
        cardStoryId: 'card-unemployment-story',
        cardWhyId: 'card-unemployment-why',
        cardSourceId: 'card-unemployment-source',
        cardLimitationId: 'card-unemployment-limitation',
        formatValue: (v) => `${Number(v).toFixed(1)}%`,
        chartLabel: 'Unemployment Rate (%)',
        chartColor: '#FFB500',
        topic: 'economy',
        storyConnection:
            'Employment conditions shape the economic environment around families. County-level unemployment ' +
            'can affect income stability, housing security, transportation, childcare, and household stress.',
        whyItMatters:
            'Labor-market conditions help explain the broader environment surrounding families.',
        limitation:
            'This is a county-level context indicator, not a direct measure of child well-being.',
        trendLabel: null,
    },
    {
        id: 'population',
        file: 'demographics_population_clean.json',
        indicatorName: 'total_child_population',
        valueField: 'indicator_value',
        title: 'Child Population',
        canvasId: 'verifiedChildPopulationMiniChart',
        noteId: 'verifiedChildPopulationMiniChart-note',
        cardValueId: 'card-population-value',
        cardTrendId: 'card-population-trend',
        cardStoryId: 'card-population-story',
        cardWhyId: 'card-population-why',
        cardSourceId: 'card-population-source',
        cardLimitationId: 'card-population-limitation',
        formatValue: (v) => Number(v).toLocaleString(),
        chartLabel: 'Child Population',
        chartColor: '#4A7C59',
        topic: 'demographics',
        storyConnection:
            'Child population helps community partners understand the scale of need. Schools, youth programs, ' +
            'healthcare providers, food programs, and family services all depend on knowing how many children ' +
            'may need support.',
        whyItMatters:
            'Population size helps with planning capacity, staffing, funding, and service coverage.',
        limitation:
            'This value is summed across age groups and should be reviewed before policy use.',
        trendLabel: null,
    },
    {
        id: 'snap',
        file: 'social_services_indicator_clean.json',
        indicatorName: 'snap_participants_monthly_avg',
        valueField: 'indicator_value',
        title: 'SNAP Participants',
        canvasId: 'verifiedSnapMiniChart',
        noteId: 'verifiedSnapMiniChart-note',
        cardValueId: 'card-snap-value',
        cardTrendId: 'card-snap-trend',
        cardStoryId: 'card-snap-story',
        cardWhyId: 'card-snap-why',
        cardSourceId: 'card-snap-source',
        cardLimitationId: 'card-snap-limitation',
        formatValue: (v) => Number(v).toLocaleString(),
        chartLabel: 'SNAP Participants',
        chartColor: '#8B4513',
        topic: 'social_services',
        storyConnection:
            'SNAP participation helps describe food assistance demand and household economic pressure. It can ' +
            'support conversations about food access, benefits navigation, and coordination between schools, ' +
            'nonprofits, and county services.',
        whyItMatters:
            'Food assistance participation can help identify household support needs and service demand.',
        limitation:
            'SNAP participation reflects program use, not the full level of food insecurity.',
        trendLabel: null,
    },
];

const miniChartInstances = {};

async function loadVerifiedFile(filename) {
    try {
        const response = await fetch(`data/verified/${filename}`);
        if (!response.ok) {
            console.warn(`[MC3 Verified] Missing file: ${filename} (HTTP ${response.status})`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.warn(`[MC3 Verified] Failed to load ${filename}:`, error.message);
        return null;
    }
}

function normalizeRecords(data, config) {
    if (!Array.isArray(data)) {
        return [];
    }
    return data
        .filter((row) => {
            if (config.indicatorName && row.indicator_name) {
                return row.indicator_name === config.indicatorName;
            }
            return true;
        })
        .map((row) => ({
            year: Number(row.year),
            value: Number(row[config.valueField] ?? row.indicator_value),
            source_file: row.source_file || '',
        }))
        .filter((row) => !Number.isNaN(row.year) && !Number.isNaN(row.value))
        .sort((a, b) => a.year - b.year);
}

function shortSourceName(path) {
    if (!path) {
        return '';
    }
    const first = path.split(';')[0].trim();
    const parts = first.split('/');
    return parts[parts.length - 1] || first;
}

function setElementText(id, text, hiddenWhenEmpty = false) {
    if (!id) {
        return;
    }
    const el = document.getElementById(id);
    if (!el) {
        return;
    }
    if (!text) {
        if (hiddenWhenEmpty) {
            el.hidden = true;
        }
        return;
    }
    el.textContent = text;
    el.hidden = false;
}

function populateStoryFields(config) {
    setElementText(config.cardStoryId, config.storyConnection);
    setElementText(config.cardWhyId, `Why it matters: ${config.whyItMatters}`);
    setElementText(config.cardLimitationId, `Limitation: ${config.limitation}`);
}

function buildTrendLabel(config, records, metrics) {
    if (config.id === 'poverty' && metrics?.percentage_point_change != null) {
        return `Down ${metrics.percentage_point_change} percentage points from ${metrics.start_year} to ${metrics.end_year}`;
    }

    if (config.trendLabel) {
        return config.trendLabel;
    }

    if (records.length >= 2) {
        const first = records[0];
        const last = records[records.length - 1];
        const change = last.value - first.value;
        const direction = change < 0 ? 'Down' : change > 0 ? 'Up' : 'No change';
        if (change === 0) {
            return `No change from ${first.year} to ${last.year}`;
        }
        const formatted =
            config.id === 'population' || config.id === 'snap'
                ? Math.abs(change).toLocaleString()
                : `${Math.abs(change).toFixed(config.id === 'graduation' ? 2 : 1)}${config.id === 'population' || config.id === 'snap' ? '' : '%'}`;
        return `${direction} ${formatted} from ${first.year} to ${last.year}`;
    }

    return '';
}

function updateCard(config, records, metrics) {
    const valueEl = document.getElementById(config.cardValueId);
    const sourceEl = document.getElementById(config.cardSourceId);
    const panel = document.querySelector(`[data-indicator="${config.id}"]`);

    populateStoryFields(config);

    if (!records.length) {
        if (valueEl) {
            valueEl.textContent = 'Data unavailable';
        }
        if (panel) {
            panel.classList.add('verified-indicator-missing');
        }
        return null;
    }

    const latest = records[records.length - 1];
    if (valueEl) {
        const valueText =
            config.id === 'snap'
                ? `${config.formatValue(latest.value)} average monthly participants in ${latest.year}`
                : `${config.formatValue(latest.value)} in ${latest.year}`;
        valueEl.textContent = valueText;
    }
    if (sourceEl) {
        sourceEl.textContent = `ETL-verified source: ${shortSourceName(latest.source_file)}`;
    }

    const trendLabel = buildTrendLabel(config, records, metrics);
    setElementText(config.cardTrendId, trendLabel, true);

    return latest;
}

function renderMiniChart(config, records) {
    const canvas = document.getElementById(config.canvasId);
    const noteEl = document.getElementById(config.noteId);

    if (!canvas) {
        return;
    }

    if (miniChartInstances[config.canvasId]) {
        miniChartInstances[config.canvasId].destroy();
        delete miniChartInstances[config.canvasId];
    }

    if (records.length < 2) {
        canvas.style.display = 'none';
        if (noteEl) {
            noteEl.hidden = false;
            noteEl.textContent = 'Trend not available from selected source.';
        }
        return;
    }

    canvas.style.display = 'block';
    if (noteEl) {
        noteEl.hidden = true;
    }

    if (typeof Chart === 'undefined') {
        if (noteEl) {
            noteEl.hidden = false;
            noteEl.textContent = 'Chart.js unavailable — showing latest value only.';
        }
        return;
    }

    miniChartInstances[config.canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
            labels: records.map((r) => r.year),
            datasets: [
                {
                    label: config.chartLabel,
                    data: records.map((r) => r.value),
                    borderColor: config.chartColor,
                    backgroundColor: `${config.chartColor}22`,
                    borderWidth: 2,
                    pointRadius: 2,
                    fill: true,
                    tension: 0.2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
            },
            scales: {
                x: {
                    ticks: { maxTicksLimit: 6, font: { size: 10 } },
                },
                y: {
                    ticks: { font: { size: 10 } },
                },
            },
        },
    });
}

function showMultiValidationWarnings(report) {
    const warningBox = document.getElementById('verified-multi-warning');
    if (!warningBox || !report) {
        return;
    }

    const warnings = report.validation_warnings || [];
    if (!warnings.length) {
        return;
    }

    warningBox.hidden = false;
    warningBox.innerHTML = `
        <strong>Validation notes:</strong>
        <ul>${warnings.map((w) => `<li>${w.message}</li>`).join('')}</ul>
    `;
}

async function initVerifiedCommunityIndicators() {
    const dashboard = document.getElementById('verified-indicators-dashboard');
    if (!dashboard) {
        return;
    }

    const validationReport = await loadVerifiedFile('phase6_indicator_validation_report.json');
    const povertyMetrics = await loadVerifiedFile('poverty_metrics_verified.json');

    for (const config of VERIFIED_INDICATOR_CONFIG) {
        try {
            const raw = await loadVerifiedFile(config.file);
            const records = normalizeRecords(raw, config);
            updateCard(config, records, povertyMetrics);
            renderMiniChart(config, records);
        } catch (error) {
            console.warn(`[MC3 Verified] Error loading ${config.id}:`, error.message);
            const panel = document.querySelector(`[data-indicator="${config.id}"]`);
            if (panel) {
                panel.classList.add('verified-indicator-error');
            }
        }
    }

    showMultiValidationWarnings(validationReport);
}

document.addEventListener('DOMContentLoaded', initVerifiedCommunityIndicators);

window.MC3VerifiedIndicators = {
    initVerifiedCommunityIndicators,
    VERIFIED_INDICATOR_CONFIG,
};
