#!/bin/bash

echo "🎵 Starting Audio Streamer Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

# Check if server directory exists
if [ ! -d "server" ]; then
    echo "❌ Server directory not found. Please run this from the project root."
    exit 1
fi

# Navigate to server directory
cd server

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
fi

# Start the server
echo "🚀 Starting server on port 3001..."
echo "📁 Upload directory: $(pwd)/uploads"
echo "🌐 Server will be available at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
