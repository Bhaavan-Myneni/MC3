# Vercel Deployment Checklist - MC3 Summit 2025

## ✅ Pre-Deployment Checklist

### 1. File Structure Verification
- [x] `index.html` exists in root directory
- [x] `css/` directory with `style.css` and `visualizations.css`
- [x] `js/` directory with all JavaScript files
- [x] `pages/` directory with all HTML pages
- [x] `assets/` directory for images and other assets
- [x] `data/` directory for data files

### 2. Configuration Files
- [x] `vercel.json` - Vercel configuration
- [x] `package.json` - Project metadata
- [x] `build.sh` - Build script (optional)

### 3. File Paths
- [x] All CSS links use correct relative paths
- [x] All JavaScript links use correct relative paths
- [x] All internal navigation links work
- [x] All external links are valid

## 🚀 Vercel Deployment Steps

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository containing `MC3_Summit_2025_App`

### Step 2: Configure Project Settings
1. **Framework Preset**: Select "Other"
2. **Root Directory**: `MC3_Summit_2025_App` (if deploying from parent repo)
3. **Build Command**: Leave empty
4. **Output Directory**: Leave empty
5. **Install Command**: Leave empty

### Step 3: Environment Variables
- No environment variables needed for this static site

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Check the preview URL

## 🔧 Troubleshooting

### If you get 404 errors:
1. **Check Root Directory**: Ensure it's set to `MC3_Summit_2025_App`
2. **Verify index.html**: Must exist in the root directory
3. **Check vercel.json**: Ensure it's properly configured
4. **File Permissions**: Ensure all files are readable

### If assets don't load:
1. **Check File Paths**: Verify all relative paths are correct
2. **Case Sensitivity**: Ensure file names match exactly
3. **File Existence**: Verify all referenced files exist

### If routing doesn't work:
1. **SPA Configuration**: The `vercel.json` includes SPA routing
2. **Client-side Routing**: All routes serve `index.html`
3. **Navigation Links**: Verify all internal links work

## 📋 Post-Deployment Verification

### 1. Homepage
- [ ] Main page loads without errors
- [ ] Navigation menu works
- [ ] Statistics cards display data
- [ ] All links are functional

### 2. Sub-pages
- [ ] Demographics page loads
- [ ] Education page loads
- [ ] Economy page loads
- [ ] Social Services page loads
- [ ] Correlations page loads

### 3. Assets
- [ ] CSS files load correctly
- [ ] JavaScript files load correctly
- [ ] Images display properly
- [ ] Charts render correctly

### 4. Performance
- [ ] Page loads quickly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All interactive elements work

## 🎯 Success Criteria

The deployment is successful when:
- ✅ Homepage loads at the Vercel URL
- ✅ All navigation links work
- ✅ All assets (CSS, JS, images) load
- ✅ No 404 errors in browser console
- ✅ Site is fully functional and responsive

## 📞 Support

If issues persist:
1. Check Vercel deployment logs
2. Verify all configuration files are correct
3. Test locally first: `python3 -m http.server 8000`
4. Check browser console for errors 