#!/bin/bash

# ATLAS Multi-Agent System - Development Server
# Start script for local development

set -e  # Exit on any error

echo "🚀 Starting ATLAS Multi-Agent System..."
echo "=================================================="

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    echo "   Required variables:"
    echo "   - GOOGLE_API_KEY=your_google_api_key_here"
    exit 1
fi

# Check if Google API key is set
if ! grep -q "GOOGLE_API_KEY=.*[^[:space:]]" .env; then
    echo "❌ GOOGLE_API_KEY not set in .env file"
    echo "   Please add your Google Generative AI API key to .env"
    exit 1
fi

# Kill any existing process on port 3999 or 8888
echo "🔧 Checking for existing processes..."
if lsof -i :3999 &> /dev/null; then
    echo "   Killing process on port 3999..."
    lsof -ti :3999 | xargs kill -9 2>/dev/null || true
fi

if lsof -i :8888 &> /dev/null; then
    echo "   Killing process on port 8888..."
    lsof -ti :8888 | xargs kill -9 2>/dev/null || true
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🎯 Starting Netlify development server..."
echo "   Local server: http://localhost:8888"
echo "   Functions: http://localhost:8888/.netlify/functions/"
echo ""
echo "💡 Available endpoints:"
echo "   • Process Inquiry: http://localhost:8888/.netlify/functions/process_inquiry"
echo "   • Health Check: http://localhost:8888/.netlify/functions/process_inquiry (GET)"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo "=================================================="
echo ""

# Start the server
netlify dev