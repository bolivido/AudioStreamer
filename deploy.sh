#!/bin/bash

# Audio Streamer Deployment Script
echo "🚀 Deploying Audio Streamer to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy to Railway
echo "🚂 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app should be available at: https://your-app-name.railway.app"
else
    echo "❌ Deployment failed!"
    exit 1
fi
