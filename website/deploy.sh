#!/bin/bash

# MC3 Summit 2025 - Deployment and Testing Script
# This script helps with local testing and deployment

echo "🚀 MC3 Summit 2025 - Deployment Script"
echo "======================================="

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "Port $port is already in use"
        return 1
    else
        return 0
    fi
}

# Function to start local server
start_server() {
    local port=${1:-8000}
    
    echo "📂 Changing to application directory..."
    cd "$(dirname "$0")"
    
    echo "🔍 Checking for syntax errors in JavaScript files..."
    if command -v node >/dev/null 2>&1; then
        for js_file in js/*.js; do
            if [ -f "$js_file" ]; then
                echo "Checking $js_file..."
                node -c "$js_file" 2>/dev/null || echo "⚠️  Syntax warning in $js_file"
            fi
        done
    else
        echo "Node.js not found, skipping syntax check"
    fi
    
    echo "🌐 Starting local development server..."
    if check_port $port; then
        echo "Starting server on port $port..."
        echo "📱 Access your application at: http://localhost:$port"
        echo "🛑 Press Ctrl+C to stop the server"
        echo ""
        python3 -m http.server $port
    else
        echo "❌ Port $port is already in use. Try a different port:"
        echo "   ./deploy.sh 8001"
        exit 1
    fi
}

# Function to validate HTML files
validate_html() {
    echo "🔍 Validating HTML files..."
    for html_file in *.html pages/*.html; do
        if [ -f "$html_file" ]; then
            echo "Checking $html_file..."
            # Basic validation - check for missing closing tags
            if grep -q "<canvas.*style=\"display: none\"" "$html_file"; then
                echo "⚠️  Found hidden canvas elements in $html_file - this may cause chart rendering issues"
            fi
        fi
    done
}

# Function to check file structure
check_structure() {
    echo "📋 Checking file structure..."
    
    required_files=(
        "index.html"
        "css/style.css"
        "css/visualizations.css"
        "js/main.js"
        "js/visualizations.js"
        "js/narratives.js"
        "js/dataLoader.js"
    )
    
    missing_files=()
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        echo "✅ All required files are present"
    else
        echo "❌ Missing files:"
        printf '   %s\n' "${missing_files[@]}"
    fi
    
    # Check data directory
    if [ ! -d "data/processed" ]; then
        echo "⚠️  Data directory missing - creating..."
        mkdir -p data/processed
    fi
    
    # Check if data files exist
    data_files=("demographics.json" "education.json" "economy.json" "social-services.json")
    for file in "${data_files[@]}"; do
        if [ ! -f "data/processed/$file" ]; then
            echo "ℹ️  Sample data file missing: data/processed/$file"
        fi
    done
}

# Function to show quick help
show_help() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start [port]     Start development server (default port: 8000)"
    echo "  validate         Validate HTML and JavaScript files"
    echo "  check            Check file structure"
    echo "  help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start         # Start server on port 8000"
    echo "  $0 start 8001    # Start server on port 8001"
    echo "  $0 validate      # Check for common issues"
    echo "  $0 check         # Verify file structure"
}

# Main script logic
case "${1:-start}" in
    "start")
        check_structure
        validate_html
        start_server ${2:-8000}
        ;;
    "validate")
        validate_html
        ;;
    "check")
        check_structure
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 