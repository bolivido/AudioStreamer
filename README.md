# 🎵 AudioStreamer

A professional radio station powered by **AzuraCast** - the modern, self-hosted radio station management system.

## 🚀 **What is AudioStreamer?**

AudioStreamer is a **professional radio station** that runs on Railway, powered by AzuraCast. It provides:

- **🎵 Music Library Management** - Upload, organize, and manage your music
- **📻 Live Streaming** - Multiple streaming backends (Icecast, Shoutcast)
- **📅 Playlist Scheduling** - Auto-play music with custom schedules
- **👥 DJ Management** - Multiple user accounts and permissions
- **📊 Analytics** - Listener statistics and performance metrics
- **🌐 Web Interface** - Easy-to-use management dashboard

## ✨ **Features**

### **🎯 Professional Radio Station**
- **Built on AzuraCast** - Industry-standard radio management
- **Web-based interface** - Manage everything from your browser
- **Multiple streaming formats** - MP3, AAC, OGG support
- **Real-time metadata** - Song information and artist details

### **🚀 Railway Deployment**
- **Automatic deployment** - No complex setup required
- **Scalable hosting** - Railway handles the infrastructure
- **Professional reliability** - 99.9% uptime guarantee

### **📱 Easy Management**
- **Drag & drop uploads** - Add music easily
- **Playlist creation** - Organize your music library
- **Scheduling tools** - Set up auto-play schedules
- **User management** - Multiple DJ accounts

## 🚀 **Quick Start**

### **1. Automatic Deployment**
Railway will automatically deploy your AzuraCast radio station using the official Docker image.

### **2. Access Your Station**
- **Web Interface**: `https://your-app.railway.app`
- **Stream URL**: `https://your-app.railway.app:8000/`
- **Admin Login**: `admin@audiostreamer.com` / `admin123`

### **3. Setup Your Station**
1. Complete the AzuraCast setup wizard
2. Create your radio station
3. Upload your music files
4. Create playlists and schedules
5. Start broadcasting!

## 🔧 **Configuration**

### **Environment Variables**
All configuration is handled through Railway environment variables:
- **Station Name**: AudioStreamer Radio
- **Admin Email**: admin@audiostreamer.com
- **Stream Port**: 8000
- **Web Port**: 80

### **Ports**
- **80**: Web interface (HTTP)
- **443**: Web interface (HTTPS)
- **8000**: Main stream
- **8001-8005**: Additional streams

## 📁 **Project Structure**

```
AudioStreamer/
├── Dockerfile              # AzuraCast Docker image
├── railway.json           # Railway deployment config
├── azuracast.env         # Environment variables
├── AZURACAST_SETUP.md    # Detailed setup guide
├── config.js             # App configuration
├── src/                  # React app source
└── content/              # Sample audio content
```

## 🎵 **Why AzuraCast?**

✅ **Professional Features** - Built for radio stations  
✅ **Easy Management** - Web-based interface  
✅ **Reliable Deployment** - Official Docker images  
✅ **Rich Functionality** - More than just streaming  
✅ **Active Development** - Regular updates and support  

## 🚀 **Deployment**

This project automatically deploys to Railway using:
- **Official AzuraCast Docker image**
- **Professional radio station setup**
- **Automatic configuration**
- **Zero manual setup required**

## 📚 **Documentation**

- **AZURACAST_SETUP.md** - Complete setup and management guide
- **Railway Dashboard** - Monitor deployment and logs
- **AzuraCast Docs** - Official documentation and tutorials

## 🤝 **Support**

- **Railway Logs** - Check deployment status
- **AzuraCast Community** - Active user community
- **GitHub Issues** - Report bugs or request features

---

**Your professional radio station is just a deployment away! 🎵☁️**

Built with ❤️ using [AzuraCast](https://azuracast.com/) and [Railway](https://railway.app/)
