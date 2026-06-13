# Vercel Deployment Guide - MC3 Summit 2025

## Project Overview
This is a static HTML/CSS/JavaScript website for the Monroe County Childhood Conditions Summit 2025. It's designed to be deployed as a static site without any build process.

## Vercel Configuration

### 1. Project Settings
- **Framework Preset**: Other
- **Build Command**: Leave empty (no build required)
- **Output Directory**: Leave empty (serves from root)
- **Install Command**: Leave empty (no dependencies)

### 2. File Structure
```
MC3_Summit_2025_App/
├── index.html              # Main homepage
├── pages/                  # Additional pages
│   ├── demographics.html
│   ├── education.html
│   ├── economy.html
│   ├── social-services.html
│   └── correlations.html
├── css/                    # Stylesheets
│   ├── style.css
│   └── visualizations.css
├── js/                     # JavaScript files
│   ├── main.js
│   ├── visualizations.js
│   ├── narratives.js
│   └── dataLoader.js
├── assets/                 # Static assets
├── data/                   # Data files
├── vercel.json            # Vercel configuration
└── package.json           # Project metadata
```

### 3. Key Configuration Files

#### vercel.json
- Configures static file serving
- Sets up SPA routing (all routes serve index.html)
- Adds caching headers for CSS/JS files

#### package.json
- Defines project metadata
- No build dependencies required
- Static site configuration

## Deployment Steps

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Project**:
   - Framework: Other
   - Root Directory: `MC3_Summit_2025_App` (if deploying from parent repo)
   - Build Command: Leave empty
   - Output Directory: Leave empty
3. **Deploy**: Vercel will automatically detect and serve the static files

## Troubleshooting

### 404 Errors
- Ensure `index.html` exists in the root directory
- Check that `vercel.json` is properly configured
- Verify all file paths are correct

### Routing Issues
- The `vercel.json` includes SPA routing configuration
- All routes will serve `index.html` for client-side routing

### File Not Found
- Ensure all referenced files exist in the correct directories
- Check file permissions and case sensitivity

## Local Testing
Before deploying, test locally:
```bash
cd MC3_Summit_2025_App
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Performance Optimization
- CSS and JS files have long-term caching headers
- Static assets are served efficiently
- No build process required for faster deployments 