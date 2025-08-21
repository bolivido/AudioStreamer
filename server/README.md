# Audio Streamer Server

A Node.js server that handles audio file uploads, storage management, and live streaming for the Audio Streamer application.

## Features

- 🎵 **Audio File Uploads**: Support for MP3, WAV, AAC, OGG, FLAC files
- 💾 **Server Storage**: Centralized storage for shared audio access
- 🌐 **Live Streaming**: HTTP range requests for efficient audio streaming
- 🧹 **Storage Management**: Automatic cleanup and manual file deletion
- 📊 **Storage Monitoring**: Real-time storage usage and file information
- 🔒 **Security**: Rate limiting, file validation, and CORS support

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Install server dependencies**:
```bash
cd server
npm install
```

2. **Start the server**:
```bash
npm start
```

Or use the startup script from the project root:
```bash
./start-server.sh
```

The server will start on port 3001 by default.

## API Endpoints

### File Management

- `GET /api/storage` - Get server storage information
- `GET /api/audio` - List all uploaded audio files
- `POST /api/upload` - Upload audio file
- `DELETE /api/audio/:filename` - Delete specific audio file
- `POST /api/cleanup` - Clean up old files

### Streaming

- `GET /api/stream/:filename` - Stream audio file with range support
- `GET /api/health` - Server health check

## Storage Management

### Automatic Cleanup

The server includes a cleanup script to remove old files:

```bash
# Clean up files older than 30 days (default)
node cleanup.js cleanup

# Clean up files older than 7 days
node cleanup.js cleanup 7

# Show storage information
node cleanup.js info

# Delete specific file
node cleanup.js delete filename.mp3

# Show help
node cleanup.js help
```

### Manual Cleanup via API

```bash
# Clean up files older than 14 days
curl -X POST http://localhost:3001/api/cleanup \
  -H "Content-Type: application/json" \
  -d '{"days": 14}'
```

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3001)
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: 100MB)

### File Limits

- **Maximum file size**: 100MB
- **Supported formats**: MP3, WAV, AAC, OGG, FLAC
- **Rate limit**: 10 uploads per 15 minutes per IP

## Storage Structure

```
server/
├── uploads/           # Audio file storage
├── server.js          # Main server file
├── cleanup.js         # Cleanup utility
└── package.json       # Dependencies
```

## Security Features

- **File validation**: Only audio files allowed
- **Rate limiting**: Prevents upload spam
- **CORS support**: Configurable cross-origin access
- **Helmet**: Security headers
- **File size limits**: Prevents large file abuse

## Monitoring

### Storage Dashboard

Access the storage dashboard in the web app:
1. Switch to "⚙️ Server Management" mode
2. View real-time storage information
3. Monitor file uploads and deletions
4. Perform cleanup operations

### Health Check

```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Deployment

### Railway Deployment

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Deploy server**:
```bash
cd server
railway up
```

### Environment Variables for Production

Set these in your Railway dashboard:
- `PORT` - Railway will set this automatically
- `NODE_ENV=production`

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT environment variable
2. **File upload fails**: Check file size and format
3. **Storage full**: Use cleanup script to free space
4. **CORS errors**: Verify CORS configuration

### Logs

The server logs all operations:
- File uploads and deletions
- Cleanup operations
- Error messages
- Storage statistics

## Performance

### Optimizations

- **Range requests**: Efficient audio streaming
- **File streaming**: No memory buffering for large files
- **Async operations**: Non-blocking file operations
- **Rate limiting**: Prevents server overload

### Scaling Considerations

- **File storage**: Consider cloud storage for large deployments
- **CDN**: Use CDN for global audio distribution
- **Load balancing**: Multiple server instances for high traffic
- **Database**: Add metadata storage for large libraries

## Development

### Development Mode

```bash
npm run dev
```

Uses nodemon for automatic restart on file changes.

### Testing

Test the server endpoints:

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test storage info
curl http://localhost:3001/api/storage

# Test audio list
curl http://localhost:3001/api/audio
```

## License

This server is part of the Audio Streamer project and follows the same license terms.

---

**Ready for production deployment! 🚀**
