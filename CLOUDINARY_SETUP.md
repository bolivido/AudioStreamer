# ☁️ Cloudinary Setup for Audio Streamer

## Why Cloudinary?

Railway's free tier uses **ephemeral storage**, which means uploaded files disappear when the container restarts. Cloudinary provides **persistent cloud storage** for your audio files.

## 🚀 Quick Setup

### 1. Create Free Cloudinary Account
1. Go to [Cloudinary.com](https://cloudinary.com)
2. Click "Sign Up For Free"
3. Create your account (no credit card required)

### 2. Get Your Credentials
After signing up, you'll find your credentials in the Dashboard:
- **Cloud Name**
- **API Key**
- **API Secret**

### 3. Add to Railway Environment Variables
In your Railway project dashboard, add these environment variables:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Deploy
Railway will automatically redeploy and use Cloudinary for file storage.

## ✅ Benefits

- **Persistent storage** - Files never disappear
- **Global CDN** - Fast audio streaming worldwide
- **Free tier** - 25GB storage, 25GB bandwidth/month
- **Automatic optimization** - Audio files optimized for streaming
- **No server restarts** - Files stay available

## 🔧 How It Works

1. **Upload audio file** → Stored in Cloudinary cloud
2. **Get streaming URL** → Direct link to audio file
3. **Auto-play works** → Files persist between deployments
4. **Global access** → Fast streaming from anywhere

## 📊 Free Tier Limits

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Perfect for** audio streaming apps

## 🎵 Audio Support

Cloudinary supports all major audio formats:
- MP3, WAV, AAC, OGG, FLAC
- Automatic format optimization
- Streaming-ready URLs

## 🔍 Testing

After setup, upload a file and check:
1. **Server logs** should show "☁️ Using Cloudinary cloud storage"
2. **Upload response** should include a `url` field
3. **Files persist** after container restarts
4. **Auto-play works** with persistent files

## 💡 Alternative Solutions

If you prefer not to use Cloudinary:
1. **Railway Pro** - Persistent volumes included
2. **Local development** - Run on your computer
3. **Other cloud storage** - AWS S3, Google Cloud Storage, etc.
