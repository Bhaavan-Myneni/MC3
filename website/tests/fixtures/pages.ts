/**
 * Central list of every page in the site, used to drive parameterized
 * tests instead of duplicating a spec per page.
 */
export interface SiteRoute {
  /** Human-readable name for test titles */
  name: string;
  /** Path relative to the site root (baseURL) */
  path: string;
  /** Exact expected <title> text */
  title: string;
  /** Canvas element ids expected to render a Chart.js chart on this page */
  chartIds: string[];
}

export const routes: SiteRoute[] = [
  {
    name: 'Home',
    path: '/index.html',
    title: 'MC3 Summit 2025 - Monroe County Childhood Conditions',
    chartIds: [
      'verifiedPovertyMiniChart',
      'verifiedGraduationMiniChart',
      'verifiedUnemploymentMiniChart',
      'verifiedChildPopulationMiniChart',
      'verifiedSnapMiniChart',
      'verifiedPovertyChart',
    ],
  },
  {
    name: 'Demographics',
    path: '/pages/demographics.html',
    title: 'Demographics - MC3 Summit 2025',
    chartIds: ['populationChart', 'incomeChart', 'educationAttainmentChart'],
  },
  {
    name: 'Education',
    path: '/pages/education.html',
    title: 'Education Outcomes - MC3 Summit 2025',
    chartIds: ['graduationChart', 'enrollmentChart', 'achievementChart'],
  },
  {
    name: 'Economy',
    path: '/pages/economy.html',
    title: 'Economic Factors - MC3 Summit 2025',
    chartIds: ['employmentChart', 'incomeChart', 'housingChart'],
  },
  {
    name: 'Social Services',
    path: '/pages/social-services.html',
    title: 'Social Services - MC3 Summit 2025',
    chartIds: ['foodAssistanceChart', 'housingAssistanceChart', 'childcareChart'],
  },
  {
    name: 'Correlations',
    path: '/pages/correlations.html',
    title: 'Data Correlations - MC3 Summit 2025',
    chartIds: ['educationEconomicsChart', 'healthServicesChart', 'multiFactorChart'],
  },
];

/** The 6 nav links present in the header of every page, in order. */
export const navLinks = [
  { label: 'Home', path: '/index.html' },
  { label: 'Demographics', path: '/pages/demographics.html' },
  { label: 'Education', path: '/pages/education.html' },
  { label: 'Economy', path: '/pages/economy.html' },
  { label: 'Social Services', path: '/pages/social-services.html' },
  { label: 'Correlations', path: '/pages/correlations.html' },
];
