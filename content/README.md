# 🎵 Shoutcast Content Directory

## 📁 **What to Add Here:**

### **Test Audio Files:**
- **MP3 files** with proper ID3 tags
- **AAC files** for better quality
- **OGG files** for open format testing

### **Recommended Test Content:**
1. **test-song-1.mp3** - "Test Artist - Test Song 1"
2. **test-song-2.mp3** - "Demo Band - Demo Track 2"
3. **test-song-3.mp3** - "Sample Group - Sample Music 3"

## 🏷️ **ID3 Tag Requirements:**

### **Essential Tags:**
- **Title**: Song name
- **Artist**: Artist/band name
- **Album**: Album name (optional)
- **Genre**: Music genre
- **Year**: Release year

### **Example ID3 Tags:**
```
Title: Test Song 1
Artist: Test Artist
Album: Test Album
Genre: Test
Year: 2024
```

## 📡 **Broadcasting Instructions:**

### **Using VLC:**
1. Open VLC Media Player
2. Go to Media → Stream
3. Add files from this directory
4. Stream to: `http://localhost:8000`
5. Password: `changeme`

### **Using FFmpeg:**
```bash
ffmpeg -re -i "test-song-1.mp3" -acodec libmp3lame -ab 128k -f mp3 http://localhost:8000/changeme
```

### **Using Winamp:**
1. Install Winamp + Shoutcast DSP
2. Configure server: `localhost:8000`
3. Password: `changeme`
4. Select audio source and start

## 🔄 **Metadata Testing:**

### **Expected Results in AudioStreamer:**
- **Real song titles** instead of "Live Stream"
- **Actual artist names** instead of "Radio Station"
- **Live metadata updates** every 10 seconds
- **Console logs** showing Shoutcast parsing

### **Console Logs to Look For:**
```
🎵 Real Shoutcast metadata: {
  title: "Test Song 1",
  artist: "Test Artist",
  album: "Test Album",
  station: "AudioStreamer Test Radio",
  genre: "Test"
}
```

## 📊 **Content Rotation:**

### **Manual Rotation:**
- Change files in this directory
- Restart broadcasting software
- Metadata updates automatically

### **Automated Rotation:**
- Use playlist software
- Schedule content changes
- Maintain consistent metadata

## 🚨 **Important Notes:**

- **File formats**: MP3, AAC, OGG supported
- **Quality**: 128kbps or higher recommended
- **Metadata**: ID3 tags are essential
- **Updates**: Changes require restarting broadcast
- **Testing**: Always verify in AudioStreamer first

---

**Add your test content here and start broadcasting! 🎵📻**
