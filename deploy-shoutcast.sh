#!/bin/bash

# 🚀 Railway Shoutcast Server Deployment Script
# Deploys your custom Shoutcast server to Railway

echo "🎵 Deploying Railway Shoutcast Server..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

# Build and deploy
echo "🏗️  Building Docker image..."
docker build -t shoutcast-server .

echo "📤 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your Shoutcast server should be available at:"
echo "   Stream: https://your-railway-app.railway.app:8000/"
echo "   Web Interface: https://your-railway-app.railway.app:8001/"
echo ""
echo "🔑 Default passwords:"
echo "   Admin: admin123"
echo "   Stream: changeme"
echo ""
echo "📱 Next steps:"
echo "   1. Add your test audio files to the content/ directory"
echo "   2. Start broadcasting to your Railway server"
echo "   3. Test metadata parsing in AudioStreamer"
echo ""
echo "🎵 Happy testing!"
