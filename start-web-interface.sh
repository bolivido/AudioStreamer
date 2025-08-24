#!/bin/bash

# 🎵 Start Shoutcast Web Interface
# Provides a beautiful web interface for managing your music

echo "🎵 Starting Shoutcast Web Interface..."
echo "====================================="

# Check if we're in the right directory
if [ ! -d "web-interface" ]; then
    echo "❌ web-interface directory not found"
    echo "💡 Make sure you're in the AudioStreamer project root"
    exit 1
fi

# Navigate to web interface directory
cd web-interface

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the web interface
echo "🚀 Starting web interface on http://localhost:3000"
echo "📱 Open your browser and go to: http://localhost:3000"
echo ""
echo "🎵 Features:"
echo "   • Drag & drop song uploads"
echo "   • Real-time playlist management"
echo "   • Server status monitoring"
echo "   • Song deletion and management"
echo ""
echo "⏹️  Press Ctrl+C to stop the web interface"
echo ""

npm start
