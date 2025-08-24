# 🚀 Railway-Hosted Shoutcast Server Setup

## 🎯 **Purpose**
Set up a Shoutcast server directly on Railway to test AudioStreamer's metadata parsing with your own content.

## ☁️ **Railway Deployment Approach**

### **Method 1: Docker Container (Recommended)**

Create a `Dockerfile` in your project:

```dockerfile
FROM ubuntu:20.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    libssl1.1 \
    && rm -rf /var/lib/apt/lists/*

# Download Shoutcast DNAS
WORKDIR /opt/shoutcast
RUN wget -O shoutcast.zip "https://download.nullsoft.com/shoutcast/tools/win32/sc_serv2_linux_x64-latest.tar.gz" \
    && tar -xzf shoutcast.zip \
    && chmod +x sc_serv

# Create configuration
COPY sc_serv.conf /opt/shoutcast/sc_serv.conf

# Expose ports
EXPOSE 8000 8001

# Start server
CMD ["./sc_serv", "sc_serv.conf"]
```

### **Method 2: Railway Service**

Add to your `railway.json`:

```json
{
  "services": [
    {
      "name": "shoutcast-server",
      "type": "docker",
      "ports": [8000, 8001],
      "environment": {
        "SHOUTCAST_PORT": "8000",
        "WEB_PORT": "8001"
      }
    }
  ]
}
```

## ⚙️ **Shoutcast Configuration for Railway**

Create `sc_serv.conf`:

```ini
# Railway Shoutcast Configuration
portbase=8000
maxuser=50
server_name=AudioStreamer Test Radio
server_genre=Test
server_url=https://your-railway-app.railway.app
server_description=Testing AudioStreamer metadata parsing on Railway
adminpassword=admin123
password=changeme
icy=1
metainterval=8192
web=1
webport=8001

# Railway-specific settings
publicserver=always
streamauthhash=your_auth_hash_here
```

## 🎵 **Content Management**

### **Option A: Static Audio Files**
- Upload MP3 files to Railway
- Use FFmpeg to stream them
- Update metadata via API

### **Option B: Live Streaming**
- Stream from your local machine to Railway
- Use OBS Studio or similar
- Real-time metadata updates

### **Option C: Playlist Rotation**
- Create a playlist of test songs
- Rotate through them automatically
- Update metadata for each song

## 🔧 **Railway Environment Variables**

Set these in your Railway dashboard:

```bash
SHOUTCAST_PORT=8000
WEB_PORT=8001
ADMIN_PASSWORD=admin123
STREAM_PASSWORD=changeme
STATION_NAME="AudioStreamer Test Radio"
STATION_GENRE="Test"
```

## 🧪 **Testing Your Railway Shoutcast Server**

### **1. Deploy to Railway**
```bash
railway up
```

### **2. Test Server**
```bash
# Test from your local machine
curl -I https://your-railway-app.railway.app:8000/
```

### **3. Test with AudioStreamer**
- Add your Railway stream URL to the config
- Test metadata parsing
- Verify real-time updates

## 📱 **AudioStreamer Integration**

Update your `config.js`:

```javascript
{ 
  name: '🚀 Railway Shoutcast Server', 
  url: 'https://your-railway-app.railway.app:8000/;',
  description: 'Railway-hosted Shoutcast server for testing'
}
```

## 🎯 **Benefits of Railway Hosting**

✅ **No local setup required**  
✅ **Always accessible** for testing  
✅ **Scalable** for multiple listeners  
✅ **Integrated** with your existing Railway app  
✅ **Professional** testing environment  

## 🔄 **Alternative: Use Existing Streams**

If Railway setup is too complex, test with existing Shoutcast streams:

- **Radio Paradise**: Rich metadata, reliable
- **SomaFM**: Multiple genres, good metadata
- **NTS Radio**: Independent stations, varied content

## 📊 **Testing Results to Expect**

With real Shoutcast streams, you should see:

- **Real station names** in the player
- **Actual song titles** updating live
- **Genre and bitrate** information
- **Console logs** showing metadata parsing
- **Professional radio experience**

---

**Choose the approach that fits your needs! 🎵☁️**
