# MC3 Summit 2025 Web Application - Development Setup

## Quick Start Guide

This guide will help new data interns and developers get the MC3 Summit 2025 web application running locally and understand the project structure.

## Prerequisites

### Required Software
- **Web Browser**: Chrome 90+ (primary), Firefox 88+, Safari 14+, or Edge 90+
- **Text Editor/IDE**: VS Code (recommended), Sublime Text, or similar
- **Python 3.8+**: For data processing scripts (if needed)
- **Git**: For version control

### Optional Tools
- **Live Server Extension**: For VS Code (makes development easier)
- **Python packages**: pandas, numpy (for data conversion)
- **Node.js**: If you want to use npm-based tools

## Project Structure

```
MC3_Summit_2025_App/
├── index.html              # Main landing page
├── css/
│   ├── style.css          # Main styles (Monroe County branding)
│   └── visualizations.css # Chart and visualization styles
├── js/
│   ├── main.js            # Core application logic
│   ├── dataLoader.js      # Data loading and processing
│   ├── visualizations.js  # Chart creation functions (to be created)
│   └── narratives.js      # Story content (to be created)
├── pages/
│   ├── demographics.html  # Demographics analysis page
│   ├── education.html     # Education trends (to be created)
│   ├── economy.html       # Economic indicators (to be created)
│   ├── social-services.html # Social services (to be created)
│   └── correlations.html  # Cross-domain analysis (to be created)
├── data/
│   └── processed/         # Clean CSV/JSON files for web use
├── assets/
│   ├── images/           # Monroe County logos, icons
│   └── documentation/    # Additional resources
└── docs/
    └── setup.md          # This file
```

## Getting Started

### Step 1: Clone/Download the Project
If using Git:
```bash
git clone [repository-url]
cd "MC3 Summit Presentation/MC3_Summit_2025_App"
```

### Step 2: Set Up Local Development Server

#### Option A: Using VS Code Live Server (Recommended)
1. Install the "Live Server" extension in VS Code
2. Open the project folder in VS Code
3. Right-click on `index.html` and select "Open with Live Server"
4. The application will open in your browser at `http://127.0.0.1:5500`

#### Option B: Using Python's Built-in Server
```bash
# Navigate to the MC3_Summit_2025_App directory
cd MC3_Summit_2025_App

# Start a local server
python -m http.server 8000

# Open browser to http://localhost:8000
```

#### Option C: Using Node.js (if installed)
```bash
npx http-server -p 8000
```

### Step 3: Verify Setup
1. Open the application in your browser
2. You should see the Monroe County MC3 Summit 2025 homepage
3. Navigation should work between pages
4. Sample charts should load (with placeholder data)

## Development Workflow

### Daily Workflow
1. **Start Local Server**: Use one of the methods above
2. **Edit Files**: Make changes to HTML, CSS, or JavaScript files
3. **Test Changes**: Refresh browser to see updates
4. **Document Changes**: Update comments and documentation

### File Organization Rules
- **Never modify original data files** in the numbered folders (01_Demographics_ACS, etc.)
- **Save converted data** to `data/processed/` folder
- **Document all data processing** steps in comments
- **Follow Monroe County branding** guidelines in CSS

## Data Integration

### Converting Data for Web Use

#### From Excel (.xlsx) to CSV
```python
import pandas as pd

# Example: Convert Excel file to CSV
df = pd.read_excel('../03_Education_Data/High school graduation rate.xlsx')
df.to_csv('data/processed/graduation_rates.csv', index=False)
```

#### From ACS CSV to Processed JSON
```python
import pandas as pd
import json

# Load ACS data
df = pd.read_csv('../01_Demographics_ACS/S1701_Poverty_Status/ACSST5Y2023.S1701-Data.csv')

# Process and save as JSON
processed_data = {
    'metadata': {
        'source': 'ACS 5-Year Estimates 2023',
        'table': 'S1701 Poverty Status'
    },
    'data': df.to_dict('records')
}

with open('data/processed/poverty_2023.json', 'w') as f:
    json.dump(processed_data, f, indent=2)
```

### Loading Data in JavaScript
```javascript
// Example: Load processed data
const dataLoader = new DataLoader();

// Load poverty data
const povertyData = await dataLoader.loadData('data/processed/poverty_2023.json');

// Use in visualization
createPovertyChart(povertyData);
```

## Creating New Pages

### Step 1: Copy Template
```bash
cp pages/demographics.html pages/education.html
```

### Step 2: Update Content
1. Change page title and navigation
2. Update breadcrumb
3. Replace content sections
4. Modify JavaScript for page-specific charts

### Step 3: Add Navigation Link
Update navigation in all HTML files:
```html
<nav class="main-nav">
    <ul>
        <li><a href="../index.html">Home</a></li>
        <li><a href="demographics.html">Demographics</a></li>
        <li><a href="education.html" class="active">Education</a></li>
        <!-- ... other links ... -->
    </ul>
</nav>
```

## Adding Visualizations

### Basic Chart Example
```javascript
function createMyChart(data) {
    const ctx = document.getElementById('myChart');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.years,
            datasets: [{
                label: 'My Data',
                data: data.values,
                borderColor: '#003366',
                backgroundColor: 'rgba(0, 51, 102, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(0, 51, 102, 0.95)',
                    titleColor: '#FFB500'
                }
            }
        }
    });
}
```

### Monroe County Color Palette
Use these colors for consistent branding:
```javascript
const colors = {
    primary: '#003366',      // Navy blue
    secondary: '#FFB500',    // County gold
    success: '#28A745',      // Green (for positive trends)
    warning: '#FD7E14',      // Orange (for neutral/stable)
    danger: '#DC3545',       // Red (for negative trends)
    light: '#E6F3FF',        // Light blue
    muted: '#666666'         // Gray text
};
```

## Testing and Quality Assurance

### Browser Testing
Test your changes in multiple browsers:
1. Chrome (primary development browser)
2. Firefox
3. Safari (if on Mac)
4. Edge

### Mobile Testing
1. Use browser developer tools to simulate mobile devices
2. Test navigation and chart responsiveness
3. Verify touch interactions work properly

### Accessibility Testing
1. Test keyboard navigation (Tab, Enter, Arrow keys)
2. Verify color contrast meets WCAG guidelines
3. Check that screen readers can interpret content

## Common Issues and Solutions

### Charts Not Loading
- **Issue**: Charts appear as blank areas
- **Solution**: Check browser console for JavaScript errors
- **Common Cause**: Missing Chart.js library or incorrect element ID

### Data Not Loading
- **Issue**: Data shows as "Loading..." or errors
- **Solution**: Verify file paths and CORS settings
- **Fix**: Ensure you're using a local server, not opening files directly

### Styling Issues
- **Issue**: Styles don't match Monroe County branding
- **Solution**: Check CSS variable usage and specificity
- **Reference**: Use browser inspector to debug style conflicts

### Mobile Layout Problems
- **Issue**: Content not responsive on mobile
- **Solution**: Test CSS media queries and grid layouts
- **Tool**: Use browser developer tools' device simulation

## Performance Guidelines

### Data Loading
- Keep JSON files under 1MB for fast loading
- Use data aggregation for large datasets
- Implement caching for frequently accessed data

### Image Optimization
- Use optimized PNG/SVG for logos and icons
- Compress images before adding to project
- Use responsive images for different screen sizes

### JavaScript Performance
- Minimize DOM manipulation
- Use event delegation for dynamic content
- Debounce window resize events

## Getting Help

### Documentation Resources
- `README_MC3_Summit_2025.md`: Project overview and goals
- `rules.md`: Data analysis and visualization rules
- `README_Data_Organization.md`: Dataset structure guide

### Code Comments
- All JavaScript functions are documented with JSDoc comments
- CSS sections are clearly labeled and organized
- HTML includes semantic structure and ARIA labels

### Monroe County Resources
- Official Website: https://www.co.monroe.in.us/
- Style guidelines and branding standards
- Contact information for technical support

## Next Steps

### For New Interns
1. Read through all documentation files
2. Set up the development environment
3. Create a simple test visualization
4. Practice with one of the existing datasets
5. Begin working on assigned data stories

### Expanding the Application
1. Create remaining page templates (education, economy, etc.)
2. Convert more datasets to web-friendly formats
3. Implement interactive mapping features
4. Add data export and sharing functionality
5. Integrate with Monroe County's existing systems

---

**Remember**: Always follow the data integrity rules in `rules.md`. Never modify original datasets, and document all processing steps for future reference.

**Questions?** Contact the Monroe County data team or refer to the project documentation. 