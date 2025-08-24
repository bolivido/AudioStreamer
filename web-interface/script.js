// 🎵 Shoutcast Server Manager - JavaScript Backend
// Handles file uploads, server control, and real-time updates

class ShoutcastManager {
    constructor() {
        this.serverUrl = 'http://localhost:8001'; // Shoutcast web interface port
        this.apiUrl = '/api'; // API endpoint for file management
        this.currentStatus = 'offline';
        this.songList = [];
        this.uploadQueue = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.startStatusPolling();
    }

    setupEventListeners() {
        // File upload handling
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            this.handleFileUpload(files);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFileUpload(files);
        });

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
    }

    async handleFileUpload(files) {
        const audioFiles = files.filter(file => 
            file.type.startsWith('audio/') || 
            file.name.match(/\.(mp3|aac|ogg)$/i)
        );

        if (audioFiles.length === 0) {
            this.showAlert('No valid audio files selected', 'error');
            return;
        }

        this.showAlert(`Uploading ${audioFiles.length} file(s)...`, 'success');
        this.showUploadProgress();

        for (let i = 0; i < audioFiles.length; i++) {
            const file = audioFiles[i];
            try {
                await this.uploadFile(file, i, audioFiles.length);
            } catch (error) {
                console.error('Upload failed:', error);
                this.showAlert(`Failed to upload ${file.name}`, 'error');
            }
        }

        this.hideUploadProgress();
        this.showAlert('Upload completed!', 'success');
        this.refreshSongList();
        this.updatePlaylist();
    }

    async uploadFile(file, index, total) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('audio', file);

            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = ((index + e.loaded / e.total) / total) * 100;
                    this.updateUploadProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error'));
            });

            // Upload to our API endpoint
            xhr.open('POST', `${this.apiUrl}/upload`);
            xhr.send(formData);
        });
    }

    showUploadProgress() {
        document.getElementById('uploadProgress').style.display = 'block';
    }

    hideUploadProgress() {
        document.getElementById('uploadProgress').style.display = 'none';
    }

    updateUploadProgress(percent) {
        document.getElementById('progressFill').style.width = `${percent}%`;
    }

    async loadInitialData() {
        await Promise.all([
            this.refreshStatus(),
            this.refreshSongList(),
            this.updateStatistics()
        ]);
    }

    async refreshStatus() {
        try {
            const response = await fetch(`${this.serverUrl}/stats`);
            if (response.ok) {
                const stats = await response.json();
                this.updateStatusDisplay(stats);
            }
        } catch (error) {
            console.error('Failed to fetch status:', error);
            this.updateStatusDisplay({ status: 'offline' });
        }
    }

    updateStatusDisplay(stats) {
        const statusElement = document.getElementById('serverStatus');
        const statusText = document.getElementById('statusText');
        const currentSong = document.getElementById('currentSong');
        const listenerCount = document.getElementById('listenerCount');

        if (stats.status === 'online') {
            statusElement.className = 'status-indicator status-online';
            statusText.textContent = 'Online';
            currentSong.textContent = stats.currentSong || 'No song playing';
            listenerCount.textContent = stats.listeners || '0';
        } else {
            statusElement.className = 'status-indicator status-offline';
            statusText.textContent = 'Offline';
            currentSong.textContent = 'Server offline';
            listenerCount.textContent = '0';
        }
    }

    async refreshSongList() {
        try {
            const response = await fetch(`${this.apiUrl}/songs`);
            if (response.ok) {
                this.songList = await response.json();
                this.displaySongList();
                this.updateStatistics();
            }
        } catch (error) {
            console.error('Failed to fetch songs:', error);
            this.showAlert('Failed to load song list', 'error');
        }
    }

    displaySongList() {
        const songListElement = document.getElementById('songList');
        
        if (this.songList.length === 0) {
            songListElement.innerHTML = '<p style="text-align: center; color: #6c757d;">No songs found</p>';
            return;
        }

        songListElement.innerHTML = this.songList.map(song => `
            <div class="song-item">
                <div class="song-info">
                    <div class="song-title">${this.escapeHtml(song.name)}</div>
                    <div class="song-details">
                        ${this.formatFileSize(song.size)} • ${song.type || 'audio/mpeg'}
                    </div>
                </div>
                <div class="song-actions">
                    <button class="btn" onclick="shoutcastManager.playSong('${song.id}')">▶️</button>
                    <button class="btn btn-danger" onclick="shoutcastManager.deleteSong('${song.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    async updatePlaylist() {
        try {
            const response = await fetch(`${this.apiUrl}/playlist`, { method: 'POST' });
            if (response.ok) {
                this.showAlert('Playlist updated successfully!', 'success');
            } else {
                this.showAlert('Failed to update playlist', 'error');
            }
        } catch (error) {
            console.error('Failed to update playlist:', error);
            this.showAlert('Failed to update playlist', 'error');
        }
    }

    async deleteSong(songId) {
        if (!confirm('Are you sure you want to delete this song?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/songs/${songId}`, { method: 'DELETE' });
            if (response.ok) {
                this.showAlert('Song deleted successfully!', 'success');
                this.refreshSongList();
                this.updatePlaylist();
            } else {
                this.showAlert('Failed to delete song', 'error');
            }
        } catch (error) {
            console.error('Failed to delete song:', error);
            this.showAlert('Failed to delete song', 'error');
        }
    }

    async clearAllSongs() {
        if (!confirm('Are you sure you want to delete ALL songs? This cannot be undone!')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/songs`, { method: 'DELETE' });
            if (response.ok) {
                this.showAlert('All songs cleared!', 'success');
                this.refreshSongList();
                this.updatePlaylist();
            } else {
                this.showAlert('Failed to clear songs', 'error');
            }
        } catch (error) {
            console.error('Failed to clear songs:', error);
            this.showAlert('Failed to clear songs', 'error');
        }
    }

    async startStream() {
        try {
            const response = await fetch(`${this.apiUrl}/stream/start`, { method: 'POST' });
            if (response.ok) {
                this.showAlert('Stream started!', 'success');
                this.refreshStatus();
            } else {
                this.showAlert('Failed to start stream', 'error');
            }
        } catch (error) {
            console.error('Failed to start stream:', error);
            this.showAlert('Failed to start stream', 'error');
        }
    }

    async stopStream() {
        try {
            const response = await fetch(`${this.apiUrl}/stream/stop`, { method: 'POST' });
            if (response.ok) {
                this.showAlert('Stream stopped!', 'success');
                this.refreshStatus();
            } else {
                this.showAlert('Failed to stop stream', 'error');
            }
        } catch (error) {
            console.error('Failed to stop stream:', error);
            this.showAlert('Failed to stop stream', 'error');
        }
    }

    async updateStatistics() {
        const totalSongs = this.songList.length;
        const totalSize = this.songList.reduce((sum, song) => sum + (song.size || 0), 0);
        
        document.getElementById('totalSongs').textContent = totalSongs;
        document.getElementById('totalSize').textContent = this.formatFileSize(totalSize);
        
        // These would come from the server in a real implementation
        document.getElementById('streamUptime').textContent = '0h 0m';
        document.getElementById('totalPlays').textContent = '0';
    }

    startStatusPolling() {
        setInterval(() => {
            this.refreshStatus();
        }, 10000); // Update every 10 seconds
    }

    showAlert(message, type) {
        const alertElement = document.getElementById(`alert${type.charAt(0).toUpperCase() + type.slice(1)}`);
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}

// Global functions for button clicks
function refreshSongList() {
    shoutcastManager.refreshSongList();
}

function updatePlaylist() {
    shoutcastManager.updatePlaylist();
}

function clearAllSongs() {
    shoutcastManager.clearAllSongs();
}

function startStream() {
    shoutcastManager.startStream();
}

function stopStream() {
    shoutcastManager.stopStream();
}

function refreshStatus() {
    shoutcastManager.refreshStatus();
}

// Initialize the manager when page loads
let shoutcastManager;
document.addEventListener('DOMContentLoaded', () => {
    shoutcastManager = new ShoutcastManager();
});
