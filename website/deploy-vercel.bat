@echo off
echo ========================================
echo MC3 Summit 2025 - Vercel Deployment
echo ========================================
echo.
echo This will deploy your website to Vercel.
echo Make sure you have Vercel CLI installed:
echo   npm install -g vercel
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul
echo.
echo Deploying to Vercel...
vercel --prod
echo.
echo Deployment complete!
echo Share the URL provided above with others.
echo.
pause




