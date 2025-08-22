# 🚂 Railway Deployment Guide for Audio Streamer

## Prerequisites
- Railway account (free tier available)
- GitHub repository connected to Railway
- Node.js 18+ support

## 🚀 Quick Deploy

### 1. Connect to Railway
1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your AudioStreamer repository

### 2. Configure Environment Variables
In your Railway project dashboard, add these environment variables:

```
REACT_APP_SERVER_URL=https://your-railway-app.railway.app
NODE_ENV=production
```

**Important**: Replace `your-railway-app.railway.app` with your actual Railway domain.

### 3. Deploy
- Railway will automatically detect the configuration
- The build process will:
  1. Install dependencies
  2. Build the React app
  3. Copy build files to server directory
  4. Start the Express server

## 🔧 Manual Configuration

### Build Command
```bash
npm run build:railway
```

### Start Command
```bash
cd server && npm install && npm start
```

### Health Check
- **Path**: `/api/health`
- **Timeout**: 100ms

## 📁 File Structure After Build
```
server/
├── build/          # React build files
├── uploads/        # Audio uploads
├── server.js       # Express server
└── package.json    # Server dependencies
```

## 🌐 Access Points

- **Frontend**: Your Railway domain (e.g., `https://yourapp.railway.app`)
- **API Health**: `https://yourapp.railway.app/api/health`
- **File Uploads**: `https://yourapp.railway.app/api/upload`
- **Audio Streaming**: `https://yourapp.railway.app/api/stream/filename`

## 🚨 Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Verify all dependencies are in package.json
- Check Railway logs for specific errors

### Frontend Not Loading
- Verify React build completed successfully
- Check if build files are copied to server directory
- Ensure static file serving is working

### API Endpoints Not Working
- Check server logs in Railway dashboard
- Verify environment variables are set
- Test health endpoint: `/api/health`

### File Upload Issues
- Check upload directory permissions
- Verify file size limits
- Check CORS configuration

## 🔄 Updates and Redeployment

1. Push changes to GitHub
2. Railway automatically redeploys
3. Monitor build logs for any issues
4. Test the application after deployment

## 📊 Monitoring

- **Health Checks**: Automatic health monitoring
- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: Monitor resource usage and performance
- **Restarts**: Automatic restart on failures (max 3 retries)

## 💡 Tips

- Use Railway's free tier for testing
- Monitor resource usage to avoid hitting limits
- Set up custom domains for production use
- Enable automatic deployments from main branch
- Use environment variables for configuration

