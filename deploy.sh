#!/bin/bash

# Deployment script for City Hygiene Risk Monitor
# This script helps prepare your application for deployment

echo "🚀 City Hygiene Risk Monitor - Deployment Preparation"
echo "=================================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "   Please create .env.local with your environment variables"
    echo "   See env.example for reference"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Run build to check for errors
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Push your code to GitHub:"
    echo "      git init"
    echo "      git add ."
    echo "      git commit -m 'Ready for deployment'"
    echo "      git push"
    echo ""
    echo "   2. Deploy to Vercel:"
    echo "      - Visit https://vercel.com"
    echo "      - Import your repository"
    echo "      - Add environment variables"
    echo "      - Deploy!"
    echo ""
    echo "   See DEPLOYMENT.md for detailed instructions"
else
    echo ""
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

