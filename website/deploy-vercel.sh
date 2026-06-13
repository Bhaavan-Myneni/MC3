#!/bin/bash

echo "========================================"
echo "MC3 Summit 2025 - Vercel Deployment"
echo "========================================"
echo ""
echo "This will deploy your website to Vercel."
echo "Make sure you have Vercel CLI installed:"
echo "  npm install -g vercel"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""
echo "Deploying to Vercel..."
vercel --prod
echo ""
echo "Deployment complete!"
echo "Share the URL provided above with others."




