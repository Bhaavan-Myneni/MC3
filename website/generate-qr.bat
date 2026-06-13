@echo off
echo ========================================
echo MC3 Summit 2025 - QR Code Generator
echo ========================================
echo.
echo This will generate a QR code for your website.
echo.
echo IMPORTANT: Your website must be deployed online first!
echo (Use Netlify Drop, GitHub Pages, or Vercel)
echo.
echo Options:
echo   1. Use Web Interface (Easiest - Opens in browser)
echo   2. Use Python Script (Requires Python and qrcode library)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Opening QR code generator in your browser...
    start generate-qr.html
    echo.
    echo The web page will open in your browser.
    echo Paste your website URL and click "Generate QR Code"
    pause
    exit
)

if "%choice%"=="2" (
    echo.
    echo Checking if Python is installed...
    python --version >nul 2>&1
    if errorlevel 1 (
        echo.
        echo ERROR: Python is not installed!
        echo Please install Python from https://www.python.org/
        echo.
        pause
        exit
    )
    
    echo.
    echo Checking if qrcode library is installed...
    python -c "import qrcode" >nul 2>&1
    if errorlevel 1 (
        echo.
        echo Installing qrcode library...
        pip install qrcode[pil]
        echo.
    )
    
    echo.
    set /p url="Enter your website URL: "
    if "%url%"=="" (
        echo.
        echo ERROR: URL is required!
        pause
        exit
    )
    
    echo.
    echo Generating QR code...
    python generate_qr_code.py "%url%"
    echo.
    echo.
    pause
    exit
)

echo.
echo Invalid choice!
pause



