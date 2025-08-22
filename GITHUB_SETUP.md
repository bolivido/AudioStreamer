# GitHub Auto-Deploy Setup Guide

## 🚀 Automated Deployment to Railway

This project is now configured to automatically deploy to Railway whenever you push code to the `main` or `master` branch!

## 📋 Setup Steps

### 1. Push the Current Changes
```bash
git add .
git commit -m "Add GitHub Actions auto-deploy workflow"
git push origin main
```

### 2. Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these two secrets:

#### **RAILWAY_TOKEN**
- Get this from [Railway Dashboard](https://railway.app/dashboard) → **Account** → **Tokens**
- Click **Create Token** and copy the token

#### **RAILWAY_SERVICE**
- Get this from [Railway Dashboard](https://railway.app/dashboard) → **Your Project** → **Settings**
- Copy the **Service ID** (looks like: `clxxxxxxxxxxxxxxxxxxxxxx`)

### 3. Test the Auto-Deploy

1. Make any small change to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub to watch the deployment
4. Check Railway dashboard for deployment status

## 🔧 How It Works

- **Trigger**: Every push to `main`/`master` branch
- **Build**: Installs dependencies and builds React app
- **Deploy**: Uses Railway CLI to deploy the built app
- **Result**: Your app automatically updates on Railway!

## 📁 Files Added

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `railway.json` - Railway deployment configuration
- `package.json` - Updated with serve package and engines

## 🎯 Benefits

✅ **No manual deployment needed**  
✅ **Automatic builds on every push**  
✅ **Consistent deployment process**  
✅ **Easy rollbacks via Git**  
✅ **Deployment history in GitHub Actions**

## 🚨 Troubleshooting

If deployment fails:
1. Check **Actions** tab for error logs
2. Verify Railway secrets are correct
3. Ensure Railway service exists and is accessible
4. Check if build process completes successfully

---

**You're all set for automated deployment! 🎉**

