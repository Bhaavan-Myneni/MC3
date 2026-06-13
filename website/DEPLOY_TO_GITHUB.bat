@echo off
echo ========================================
echo MC3 Summit 2025 - Deploy to GitHub
echo ========================================
echo.
echo This script will help you deploy to GitHub Pages.
echo.
echo STEP 1: Create a GitHub repository first
echo   1. Go to https://github.com
echo   2. Click "New repository"
echo   3. Name it (e.g., "mc3-summit-2025")
echo   4. Make it PUBLIC
echo   5. Click "Create repository"
echo.
echo STEP 2: Copy your repository URL
echo   It will look like: https://github.com/YOUR-USERNAME/YOUR-REPO.git
echo.
pause
echo.
set /p REPO_URL="Paste your GitHub repository URL here: "
echo.
echo Initializing Git repository...
git init
echo.
echo Adding all files...
git add .
echo.
echo Creating commit...
git commit -m "Initial commit - MC3 Summit 2025 Website"
echo.
echo Setting up main branch...
git branch -M main
echo.
echo Connecting to GitHub...
git remote add origin %REPO_URL%
echo.
echo Uploading to GitHub...
git push -u origin main
echo.
echo ========================================
echo Upload complete!
echo ========================================
echo.
echo Now enable GitHub Pages:
echo   1. Go to your repository on GitHub
echo   2. Click "Settings" ^> "Pages"
echo   3. Select "main" branch
echo   4. Click "Save"
echo   5. Wait 1-2 minutes
echo   6. Your site will be at: https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
echo.
pause



