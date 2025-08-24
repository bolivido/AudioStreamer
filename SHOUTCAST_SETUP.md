# 🎵 Shoutcast Server Setup Guide for AudioStreamer Testing

## 🎯 **Purpose**
Set up your own Shoutcast server to test the real metadata parsing we implemented in AudioStreamer.

## 📥 **Step 1: Download Shoutcast DNAS**

### **From the Shoutcast Page:**
- Go to `radiomanager.shoutcast.com`
- Click "YOUR PLAN" → "Download Shoutcast Server Software (2.6.1)"
- Download the appropriate version for your OS:
  - **Windows**: `WINDOWS 64` or `WINDOWS 32`
  - **Linux**: `LINUX 64` or `LINUX 32`

### **Alternative Download:**
- Visit: https://www.shoutcast.com/downloads
- Download "Shoutcast DNAS" for your platform

## 🖥️ **Step 2: Installation**

### **Windows:**
1. Extract the downloaded ZIP file
2. Run `sc_serv.exe` (or `sc_serv2.exe` for v2)
3. The server will create a `sc_serv.conf` configuration file

### **Linux:**
1. Extract the downloaded tar.gz file
2. Make executable: `chmod +x sc_serv`
3. Run: `./sc_serv`
4. Configuration file will be created automatically

## ⚙️ **Step 3: Basic Configuration**

### **Create/Edit `sc_serv.conf`:**
```ini
# Basic Shoutcast Server Configuration
# Port for the server to listen on
portbase=8000

# Maximum number of listeners
maxuser=10

# Server name (will appear in ICY headers)
server_name=My Test Radio

# Server genre
server_genre=Test

# Server URL
server_url=http://localhost:8000

# Server description
server_description=Testing AudioStreamer metadata parsing

# Admin password (for web interface)
adminpassword=admin123

# Stream password (for broadcasting)
password=changeme

# Enable metadata
icy=1

# Metadata interval (seconds)
metainterval=8192

# Enable web interface
web=1

# Web interface port
webport=8001
```

## 🎵 **Step 4: Prepare Test Audio Files**

### **Audio Requirements:**
- **Format**: MP3, AAC, OGG, or WAV
- **Quality**: 128kbps or higher recommended
- **Metadata**: Ensure files have proper ID3 tags

### **Test Content Suggestions:**
1. **Song 1**: "Test Artist - Test Song 1"
2. **Song 2**: "Demo Band - Demo Track 2"  
3. **Song 3**: "Sample Group - Sample Music 3"

## 📡 **Step 5: Start Broadcasting**

### **Using Winamp (Windows):**
1. Install Winamp
2. Install Shoutcast DSP plugin
3. Configure with your server details:
   - **Address**: `localhost`
   - **Port**: `8000`
   - **Password**: `changeme`
4. Select audio source and start broadcasting

### **Using VLC (Cross-platform):**
1. Install VLC Media Player
2. Go to Media → Stream
3. Add your audio files
4. Stream to: `http://localhost:8000`
5. Use password: `changeme`

### **Using FFmpeg (Advanced):**
```bash
ffmpeg -re -i "audio.mp3" -acodec libmp3lame -ab 128k -f mp3 http://localhost:8000/changeme
```

## 🌐 **Step 6: Test Your Server**

### **Web Interface:**
- Open: `http://localhost:8001`
- Login with password: `admin123`
- View current listeners and stream status

### **Stream URL:**
- **Direct Stream**: `http://localhost:8000/`
- **Web Player**: `http://localhost:8000/;`

## 🧪 **Step 7: Test with AudioStreamer**

### **Add Your Server to AudioStreamer:**
1. Open your AudioStreamer app
2. Go to "🌐 Online Radio" tab
3. Click "Custom URL" or add to config
4. Enter: `http://localhost:8000/;`
5. Click "Test Connection"

### **Expected Results:**
- **Station Name**: "My Test Radio"
- **Genre**: "Test"
- **Current Track**: Your test song titles
- **Metadata Updates**: Every 10 seconds

## 🔍 **Step 8: Verify Metadata Parsing**

### **Check Browser Console:**
Look for logs like:
```
🎵 Real Shoutcast metadata: {
  title: "Test Song 1",
  artist: "Test Artist", 
  album: "",
  station: "My Test Radio",
  genre: "Test",
  bitrate: "128kbps"
}
```

### **Visual Verification:**
- **Now Playing**: Should show real song titles
- **Station Info**: Should display "My Test Radio"
- **Genre/Bitrate**: Should show actual values

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Port Already in Use**: Change `portbase` in config
2. **Firewall Blocking**: Allow ports 8000-8001
3. **No Metadata**: Ensure `icy=1` in config
4. **Connection Refused**: Check server is running

### **Debug Commands:**
```bash
# Check if server is running
netstat -an | grep 8000

# Test stream connection
curl -I http://localhost:8000/

# Check server logs
tail -f sc_serv.log
```

## 🎉 **Success Indicators**

✅ **Server starts without errors**  
✅ **Web interface accessible at port 8001**  
✅ **Stream plays in media players**  
✅ **AudioStreamer connects successfully**  
✅ **Real metadata appears in the app**  
✅ **Console shows Shoutcast metadata logs**  

## 🔄 **Next Steps**

1. **Test with different audio files**
2. **Experiment with metadata formats**
3. **Try different bitrates and formats**
4. **Test with multiple listeners**
5. **Verify metadata updates in real-time**

## 📚 **Additional Resources**

- **Shoutcast Documentation**: https://www.shoutcast.com/docs
- **DNAS Configuration**: https://www.shoutcast.com/docs/DNAS_Server_Configuration
- **Broadcasting Tools**: https://www.shoutcast.com/broadcast

---

**Happy Testing! 🎵📻**
