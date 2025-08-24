#!/bin/bash

# 🎵 Content Management Script for Railway Shoutcast Server
# Helps you add, organize, and broadcast your audio content

CONTENT_DIR="content"
PLAYLIST_FILE="$CONTENT_DIR/playlist.txt"

echo "🎵 AudioStreamer Content Manager"
echo "================================"

# Function to add audio files
add_content() {
    echo "📁 Adding audio files to content directory..."
    
    if [ $# -eq 0 ]; then
        echo "❌ Please specify files to add"
        echo "Usage: $0 add file1.mp3 file2.mp3"
        exit 1
    fi
    
    for file in "$@"; do
        if [ -f "$file" ]; then
            cp "$file" "$CONTENT_DIR/"
            echo "✅ Added: $file"
            
            # Add to playlist
            echo "content/$(basename "$file")" >> "$PLAYLIST_FILE"
            echo "📝 Added to playlist"
        else
            echo "❌ File not found: $file"
        fi
    done
}

# Function to list content
list_content() {
    echo "📋 Current content in $CONTENT_DIR/:"
    echo "--------------------------------"
    
    if [ -z "$(ls -A "$CONTENT_DIR" 2>/dev/null)" ]; then
        echo "📭 No content found"
        return
    fi
    
    for file in "$CONTENT_DIR"/*.mp3 "$CONTENT_DIR"/*.aac "$CONTENT_DIR"/*.ogg; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            size=$(du -h "$file" | cut -f1)
            echo "🎵 $filename ($size)"
        fi
    done
    
    echo ""
    echo "📊 Total files: $(find "$CONTENT_DIR" -name "*.mp3" -o -name "*.aac" -o -name "*.ogg" 2>/dev/null | wc -l 2>/dev/null || echo "0")"
}

# Function to create playlist
create_playlist() {
    echo "📝 Creating playlist from content directory..."
    
    # Clear existing playlist
    > "$PLAYLIST_FILE"
    
    # Add all audio files to playlist
    find "$CONTENT_DIR" -name "*.mp3" -o -name "*.aac" -o -name "*.ogg" 2>/dev/null | sort | while read -r file; do
        echo "file '$file'" >> "$PLAYLIST_FILE"
        echo "➕ Added to playlist: $(basename "$file")"
    done
    
    echo "✅ Playlist created with $(wc -l < "$PLAYLIST_FILE") entries"
}

# Function to start broadcasting
start_broadcast() {
    echo "📡 Starting Shoutcast broadcast..."
    
    if [ ! -f "$PLAYLIST_FILE" ] || [ ! -s "$PLAYLIST_FILE" ]; then
        echo "❌ No playlist found or playlist is empty"
        echo "Add some content first with: $0 add file.mp3"
        exit 1
    fi
    
    echo "🎵 Broadcasting from playlist..."
    echo "🔗 Stream URL: http://localhost:8000"
    echo "🔑 Password: changeme"
    echo ""
    echo "Press Ctrl+C to stop broadcasting"
    
    # Create a temporary playlist file for FFmpeg
    temp_playlist=$(mktemp)
    while IFS= read -r line; do
        if [[ $line != \#* ]] && [[ -n $line ]]; then
            echo "file '$line'" >> "$temp_playlist"
        fi
    done < "$PLAYLIST_FILE"
    
    ffmpeg -re -f concat -safe 0 -i "$temp_playlist" -acodec libmp3lame -ab 128k -f mp3 http://localhost:8000/changeme
    
    # Cleanup
    rm "$temp_playlist"
}

# Function to show help
show_help() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  add <files...>    Add audio files to content directory"
    echo "  list              List all content files"
    echo "  playlist          Create playlist from content directory"
    echo "  broadcast         Start broadcasting to Shoutcast server"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 add song1.mp3 song2.mp3"
    echo "  $0 list"
    echo "  $0 playlist"
    echo "  $0 broadcast"
}

# Main script logic
case "${1:-help}" in
    "add")
        add_content "${@:2}"
        ;;
    "list")
        list_content
        ;;
    "playlist")
        create_playlist
        ;;
    "broadcast")
        start_broadcast
        ;;
    "help"|*)
        show_help
        ;;
esac
