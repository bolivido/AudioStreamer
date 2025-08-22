#!/bin/bash

# GitHub Auto-Deploy Secrets Setup Script
echo "🚀 Setting up GitHub secrets for Railway auto-deployment..."

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Installing..."
    brew install gh
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 Please authenticate with GitHub..."
    echo "1. Copy the one-time code that appears"
    echo "2. Press Enter to open the browser"
    echo "3. Complete the authentication"
    gh auth login --web
fi

# Set the secrets
echo "🔑 Adding Railway token to GitHub secrets..."
gh secret set RAILWAY_TOKEN --body "rw_Fe26.2**d854e397842efe87affd2c86474bac8656efca54801cfdeb07490e4595447373*VhUn-rJUlIMUWbZPtyFIFw*Gw9v6RXN_NiZuvVWd7607lYscnlAsVnd2_OefzyDw8H3pCcUSjeTBOAg_AM1STZ0PvOrmG0PUHEz205fH4gU4Q*1758412359056*8b813f40bb69ce3a7e6c4c661b9207b0d8dbc73ebeeb5907b3f0ea306a64acb4*2BwlTPTYX3y6btmqbSIMQw634cZstvNIidD3JkZKS-o"

echo "🔑 Adding Railway service ID to GitHub secrets..."
gh secret set RAILWAY_SERVICE --body "a637405e-92ad-4d0e-9223-9f486e749975"

echo "✅ GitHub secrets configured successfully!"
echo "🎉 Your app will now auto-deploy to Railway on every push to main!"

# Test the deployment
echo "🧪 Testing the deployment..."
echo "Making a small change to trigger deployment..."

# Add a comment to README to test deployment
echo "" >> README.md
echo "# Auto-deploy test - $(date)" >> README.md

# Commit and push
git add README.md
git commit -m "Test auto-deploy setup"
git push origin main

echo "🚀 Test deployment triggered! Check the Actions tab in GitHub."
echo "🌐 Your app should deploy to Railway automatically!"

