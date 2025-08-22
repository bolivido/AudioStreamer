# Manual GitHub Secrets Setup

## 🚀 Quick Setup for Railway Auto-Deploy

Since automated setup had issues, here's the manual way to get your auto-deploy working:

## 📋 **Step 1: Go to GitHub Repository Settings**

1. Open: `https://github.com/bolivido/AudioStreamer`
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**

## 🔑 **Step 2: Add These Two Secrets**

### **Secret 1: RAILWAY_TOKEN**
- **Name**: `RAILWAY_TOKEN`
- **Value**: `rw_Fe26.2**d854e397842efe87affd2c86474bac8656efca54801cfdeb07490e4595447373*VhUn-rJUlIMUWbZPtyFIFw*Gw9v6RXN_NiZuvVWd7607lYscnlAsVnd2_OefzyDw8H3pCcUSjeTBOAg_AM1STZ0PvOrmG0PUHEz205fH4gU4Q*1758412359056*8b813f40bb69ce3a7e6c4c661b9207b0d8dbc73ebeeb5907b3f0ea306a64acb4*2BwlTPTYX3y6btmqbSIMQw634cZstvNIidD3JkZKS-o`

### **Secret 2: RAILWAY_SERVICE**
- **Name**: `RAILWAY_SERVICE`
- **Value**: `a637405e-92ad-4d0e-9223-9f486e749975`

## 🧪 **Step 3: Test Auto-Deploy**

Once you've added both secrets, make any small change and push:

```bash
# Add a test comment
echo "# Auto-deploy test - $(date)" >> README.md

# Commit and push
git add README.md
git commit -m "Test auto-deploy setup"
git push origin main
```

## ✅ **What Happens Next**

1. **GitHub Actions** will automatically trigger
2. **Build process** will start (install deps, build React app)
3. **Railway deployment** will begin
4. **Your app** will be live on Railway!

## 🔍 **Monitor Progress**

- **GitHub**: Go to Actions tab to see deployment progress
- **Railway**: Check your dashboard for deployment status

## 🎯 **Expected Result**

Your AudioStreamer app will automatically deploy to Railway every time you push to the main branch!

---

**Need help?** Check the Actions tab in GitHub for any error messages.
