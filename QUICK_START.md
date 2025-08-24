# 🚀 Quick Start: Railway Shoutcast Server

## ⚡ **5-Minute Setup**

### **1. Add Test Audio Files**
```bash
# Add your MP3 files to the content/ directory
cp your-song.mp3 content/
```

### **2. Deploy to Railway**
```bash
# Run the deployment script
./deploy-shoutcast.sh
```

### **3. Start Broadcasting**
```bash
# Using FFmpeg (replace with your file)
ffmpeg -re -i "content/your-song.mp3" -acodec libmp3lame -ab 128k -f mp3 http://localhost:8000/changeme
```

### **4. Test in AudioStreamer**
- Open your app
- Select "🚀 Railway Shoutcast Server"
- Watch real metadata appear!

## 🔧 **Configuration Files Created**

- **`Dockerfile`** - Container setup
- **`sc_serv.conf`** - Shoutcast configuration
- **`railway.json`** - Railway deployment config
- **`deploy-shoutcast.sh`** - Deployment script

## 📡 **Default Settings**

- **Stream Port**: 8000
- **Web Interface**: 8001
- **Admin Password**: admin123
- **Stream Password**: changeme
- **Station Name**: AudioStreamer Test Radio

## 🎵 **Expected Results**

✅ **Real song titles** in the player  
✅ **Actual artist names** displayed  
✅ **Live metadata updates** every 10 seconds  
✅ **Console logs** showing Shoutcast parsing  
✅ **Professional radio experience**  

## 🚨 **Troubleshooting**

### **Server Won't Start:**
- Check Railway logs: `railway logs`
- Verify ports are available
- Check configuration syntax

### **No Metadata:**
- Ensure `icy=1` in config
- Check audio files have ID3 tags
- Verify broadcasting is active

### **Connection Issues:**
- Check Railway URL is correct
- Verify ports are exposed
- Test with curl: `curl -I your-url:8000/`

## 🔄 **Next Steps**

1. **Customize station info** in `sc_serv.conf`
2. **Add more audio content** to `content/` directory
3. **Test different metadata formats**
4. **Scale up for production use**

---

**Your Railway Shoutcast server is ready! 🎵☁️**
