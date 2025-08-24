#!/bin/bash

# 🎵 Auto-Play Script for Railway Shoutcast Server
# Automatically plays songs continuously in rotation

CONTENT_DIR="content"
PLAYLIST_FILE="$CONTENT_DIR/playlist.txt"
STREAM_URL="http://localhost:8000"
STREAM_PASSWORD="changeme"
LOG_FILE="auto-play.log"

echo "🎵 Auto-Play Continuous Stream Started"
echo "====================================="
echo "📁 Content Directory: $CONTENT_DIR"
echo "📡 Stream URL: $STREAM_URL"
echo "📝 Log File: $LOG_FILE"
echo ""

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if content exists
check_content() {
    if [ ! -d "$CONTENT_DIR" ]; then
        log_message "❌ Content directory not found: $CONTENT_DIR"
        exit 1
    fi
    
    local file_count=$(find "$CONTENT_DIR" -name "*.mp3" -o -name "*.aac" -o -name "*.ogg" 2>/dev/null | wc -l)
    
    if [ "$file_count" -eq 0 ]; then
        log_message "❌ No audio files found in $CONTENT_DIR"
        log_message "💡 Add some MP3 files and try again"
        exit 1
    fi
    
    log_message "✅ Found $file_count audio files"
}

# Function to create playlist from content directory
create_playlist() {
    log_message "📝 Creating playlist from content directory..."
    
    # Clear existing playlist
    > "$PLAYLIST_FILE"
    
    # Add all audio files to playlist
    find "$CONTENT_DIR" -name "*.mp3" -o -name "*.aac" -o -name "*.ogg" 2>/dev/null | sort | while read -r file; do
        echo "file '$file'" >> "$PLAYLIST_FILE"
        log_message "➕ Added to playlist: $(basename "$file")"
    done
    
    log_message "✅ Playlist created with $(wc -l < "$PLAYLIST_FILE") entries"
}

# Function to start continuous streaming
start_streaming() {
    log_message "🚀 Starting continuous stream..."
    
    # Check if FFmpeg is available
    if ! command -v ffmpeg &> /dev/null; then
        log_message "❌ FFmpeg not found. Please install FFmpeg first."
        log_message "💡 On macOS: brew install ffmpeg"
        log_message "💡 On Ubuntu: sudo apt install ffmpeg"
        exit 1
    fi
    
    log_message "🎵 Starting infinite loop playback..."
    log_message "🔄 Songs will play continuously until stopped"
    log_message "⏹️  Press Ctrl+C to stop streaming"
    
    # Start infinite loop streaming
    while true; do
        log_message "🔄 Starting new playlist cycle..."
        
        # Stream the entire playlist
        ffmpeg -re -f concat -safe 0 -i "$PLAYLIST_FILE" \
               -acodec libmp3lame -ab 128k -f mp3 \
               "$STREAM_URL/$STREAM_PASSWORD" \
               2>> "$LOG_FILE"
        
        # Check if FFmpeg exited normally
        if [ $? -eq 0 ]; then
            log_message "✅ Playlist completed, starting over..."
        else
            log_message "⚠️  FFmpeg exited with error, restarting in 5 seconds..."
            sleep 5
        fi
        
        # Small delay before restarting
        sleep 2
    done
}

# Function to show status
show_status() {
    echo "📊 Auto-Play Status"
    echo "=================="
    echo "📁 Content Directory: $CONTENT_DIR"
    echo "📝 Playlist File: $PLAYLIST_FILE"
    echo "📡 Stream URL: $STREAM_URL"
    echo "📊 Audio Files: $(find "$CONTENT_DIR" -name "*.mp3" -o -name "*.aac" -o -name "*.ogg" 2>/dev/null | wc -l)"
    echo "📋 Playlist Entries: $(wc -l < "$PLAYLIST_FILE" 2>/dev/null || echo "0")"
    echo "📝 Log File: $LOG_FILE"
    
    if [ -f "$LOG_FILE" ]; then
        echo ""
        echo "📋 Recent Log Entries:"
        echo "----------------------"
        tail -10 "$LOG_FILE" 2>/dev/null || echo "No log entries yet"
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start continuous streaming"
    echo "  status    Show current status"
    echo "  playlist  Recreate playlist from content"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start      # Start continuous streaming"
    echo "  $0 status     # Check current status"
    echo "  $0 playlist   # Recreate playlist"
}

# Main script logic
case "${1:-help}" in
    "start")
        check_content
        create_playlist
        start_streaming
        ;;
    "status")
        show_status
        ;;
    "playlist")
        check_content
        create_playlist
        ;;
    "help"|*)
        show_help
        ;;
esac
