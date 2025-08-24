const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../content/'); // Upload to content directory
    },
    filename: (req, file, cb) => {
        // Keep original filename
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Only allow audio files
        if (file.mimetype.startsWith('audio/') || 
            file.originalname.match(/\.(mp3|aac|ogg)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Get list of songs
app.get('/api/songs', async (req, res) => {
    try {
        const contentDir = path.join(__dirname, '../content');
        const files = await fs.readdir(contentDir);
        
        const songs = [];
        for (const file of files) {
            if (file.match(/\.(mp3|aac|ogg)$/i)) {
                const filePath = path.join(contentDir, file);
                const stats = await fs.stat(filePath);
                
                songs.push({
                    id: file,
                    name: file,
                    size: stats.size,
                    type: getMimeType(file),
                    uploadDate: stats.mtime
                });
            }
        }
        
        res.json(songs);
    } catch (error) {
        console.error('Error reading songs:', error);
        res.status(500).json({ error: 'Failed to read songs' });
    }
});

// Upload song
app.post('/api/upload', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        console.log(`File uploaded: ${req.file.originalname}`);
        
        // Update playlist automatically
        await updatePlaylist();
        
        res.json({ 
            message: 'File uploaded successfully',
            filename: req.file.originalname
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Delete song
app.delete('/api/songs/:id', async (req, res) => {
    try {
        const filename = req.params.id;
        const filePath = path.join(__dirname, '../content', filename);
        
        await fs.unlink(filePath);
        console.log(`File deleted: ${filename}`);
        
        // Update playlist automatically
        await updatePlaylist();
        
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Clear all songs
app.delete('/api/songs', async (req, res) => {
    try {
        const contentDir = path.join(__dirname, '../content');
        const files = await fs.readdir(contentDir);
        
        for (const file of files) {
            if (file.match(/\.(mp3|aac|ogg)$/i)) {
                const filePath = path.join(contentDir, file);
                await fs.unlink(filePath);
                console.log(`File deleted: ${file}`);
            }
        }
        
        // Clear playlist
        await updatePlaylist();
        
        res.json({ message: 'All songs cleared successfully' });
    } catch (error) {
        console.error('Clear error:', error);
        res.status(500).json({ error: 'Clear failed' });
    }
});

// Update playlist
app.post('/api/playlist', async (req, res) => {
    try {
        await updatePlaylist();
        res.json({ message: 'Playlist updated successfully' });
    } catch (error) {
        console.error('Playlist update error:', error);
        res.status(500).json({ error: 'Playlist update failed' });
    }
});

// Start stream
app.post('/api/stream/start', async (req, res) => {
    try {
        // This would integrate with your Shoutcast server
        console.log('Stream start requested');
        res.json({ message: 'Stream started' });
    } catch (error) {
        console.error('Stream start error:', error);
        res.status(500).json({ error: 'Failed to start stream' });
    }
});

// Stop stream
app.post('/api/stream/stop', async (req, res) => {
    try {
        // This would integrate with your Shoutcast server
        console.log('Stream stop requested');
        res.json({ message: 'Stream stopped' });
    } catch (error) {
        console.error('Stream stop error:', error);
        res.status(500).json({ error: 'Failed to stop stream' });
    }
});

// Get server stats
app.get('/api/stats', async (req, res) => {
    try {
        const contentDir = path.join(__dirname, '../content');
        const files = await fs.readdir(contentDir);
        const audioFiles = files.filter(f => f.match(/\.(mp3|aac|ogg)$/i));
        
        const stats = {
            status: 'online',
            totalSongs: audioFiles.length,
            currentSong: 'Auto-playing from playlist',
            listeners: 0, // This would come from Shoutcast
            uptime: '24/7'
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Helper function to update playlist
async function updatePlaylist() {
    try {
        const contentDir = path.join(__dirname, '../content');
        const files = await fs.readdir(contentDir);
        const audioFiles = files.filter(f => f.match(/\.(mp3|aac|ogg)$/i)).sort();
        
        const playlistPath = path.join(__dirname, '../content/playlist.txt');
        let playlistContent = '';
        
        for (const file of audioFiles) {
            playlistContent += `file 'content/${file}'\n`;
        }
        
        await fs.writeFile(playlistPath, playlistContent);
        console.log('Playlist updated with', audioFiles.length, 'songs');
    } catch (error) {
        console.error('Playlist update error:', error);
        throw error;
    }
}

// Helper function to get MIME type
function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.mp3': return 'audio/mpeg';
        case '.aac': return 'audio/aac';
        case '.ogg': return 'audio/ogg';
        default: return 'audio/mpeg';
    }
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎵 Shoutcast Manager Web Interface running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser`);
    console.log(`📁 Content directory: ${path.join(__dirname, '../content')}`);
});
