#!/bin/bash

# 🚀 Railway Auto-Start Script for Continuous Streaming
# This script runs automatically when Railway starts the container

set -e  # Exit on any error

echo "🎵 Railway AudioStreamer Auto-Start Script"
echo "=========================================="
echo "⏰ Started at: $(date)"
echo "🌐 Environment: $RAILWAY_ENVIRONMENT"
echo "👤 Running as user: $(whoami)"
echo "📁 Current directory: $(pwd)"
echo "🔍 Checking system..."
echo ""

# Check if content directory exists
CONTENT_DIR="/opt/shoutcast/content"
if [ ! -d "$CONTENT_DIR" ]; then
    echo "❌ Content directory not found: $CONTENT_DIR"
    echo "📁 Creating content directory..."
    mkdir -p "$CONTENT_DIR"
fi

# Check if logs directory exists
LOGS_DIR="/opt/shoutcast/logs"
if [ ! -d "$LOGS_DIR" ]; then
    echo "📁 Creating logs directory..."
    mkdir -p "$LOGS_DIR"
fi

# Start streaming server in background
echo "🚀 Starting streaming server..."
icecast2 -c /opt/shoutcast/icecast.xml &
SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for streaming server to start..."
sleep 15

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Streaming server failed to start"
    echo "📋 Checking server logs..."
    if [ -f "$LOGS_DIR/icecast.log" ]; then
        tail -20 "$LOGS_DIR/icecast.log"
    fi
    echo "🔄 Starting fallback loop..."
    while true; do 
        echo "[$(date)] Container alive, waiting for manual intervention..."
        sleep 60
    done
fi

echo "✅ Streaming server started (PID: $SERVER_PID)"

# Count audio files
AUDIO_COUNT=$(find "$CONTENT_DIR" -name "*.mp3" -o -name "*.aac" -o -name "*.ogg" 2>/dev/null | wc -l)

if [ "$AUDIO_COUNT" -eq 0 ]; then
    echo "❌ No audio files found in $CONTENT_DIR"
    echo "💡 Add some MP3 files to the content directory"
    echo "🔄 Streaming server will run without content"
    echo "📡 Stream URL: http://localhost:8000/stream"
    echo "🌐 Web Interface: http://localhost:8001/"
    echo ""
    # Keep the script running to maintain the container
    while true; do 
        echo "[$(date)] Container alive, waiting for content..."
        sleep 60
    done
fi

echo "✅ Found $AUDIO_COUNT audio files"
echo "🎵 Starting continuous stream..."

# Create playlist file in a writable location
PLAYLIST_FILE="/tmp/auto-playlist.txt"
echo "📝 Creating playlist..."

# Clear and populate playlist
> "$PLAYLIST_FILE"
find "$CONTENT_DIR" -name "*.mp3" -o -name "*.aac" -o -name "*.ogg" 2>/dev/null | sort | while read -r file; do
    echo "file '$file'" >> "$PLAYLIST_FILE"
    echo "➕ Added to playlist: $(basename "$file")"
done

echo "✅ Playlist created with $(wc -l < "$PLAYLIST_FILE") entries"

# Start infinite loop streaming
echo "🚀 Starting infinite loop playback..."
echo "🔄 Songs will play continuously until stopped"
echo "📡 Stream URL: http://localhost:8000/stream"
echo "🌐 Web Interface: http://localhost:8001/"
echo "🔑 Password: changeme"
echo ""

# Log file for debugging
LOG_FILE="/tmp/auto-play.log"

# Start continuous streaming
while true; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Starting new playlist cycle..." | tee -a "$LOG_FILE"
    
    # Stream the entire playlist
    ffmpeg -re -f concat -safe 0 -i "$PLAYLIST_FILE" \
           -acodec libmp3lame -ab 128k -f mp3 \
           "icecast://source:changeme@localhost:8000/stream" \
           2>> "$LOG_FILE"
    
    # Check if FFmpeg exited normally
    if [ $? -eq 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Playlist completed, starting over..." | tee -a "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  FFmpeg exited with error, restarting in 5 seconds..." | tee -a "$LOG_FILE"
        sleep 5
    fi
    
    # Small delay before restarting
    sleep 2
done
