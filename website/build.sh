#!/bin/bash

# MC3 Summit 2025 - Vercel Build Script
# This script prepares the static site for deployment

echo "🚀 Building MC3 Summit 2025 for Vercel deployment..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Create necessary directories if they don't exist
mkdir -p data/processed
mkdir -p assets/images

# Copy all files to the current directory (Vercel will serve from here)
echo "📁 Preparing static files..."

# Ensure all required files are present
required_files=(
    "index.html"
    "css/style.css"
    "css/visualizations.css"
    "js/main.js"
    "js/visualizations.js"
    "js/narratives.js"
    "js/dataLoader.js"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
        exit 1
    fi
done

echo "✅ All required files are present"

# Create a simple index file for the root if needed
if [ ! -f "index.html" ]; then
    echo "❌ index.html not found in root directory"
    exit 1
fi

echo "🎉 Build completed successfully!"
echo "📂 Static files ready for deployment"
echo "🌐 Vercel will serve from the current directory" 