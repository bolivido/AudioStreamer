const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for development
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from React build
const buildPath = path.join(__dirname, 'build');
let hasBuildFiles = false;

if (fs.existsSync(buildPath)) {
  try {
    const buildFiles = fs.readdirSync(buildPath);
    if (buildFiles.length > 0) {
      console.log(`📁 Serving React build from: ${buildPath}`);
      console.log(`📦 Build contains ${buildFiles.length} files/directories`);
      console.log(`📋 Build files: ${buildFiles.join(', ')}`);
      app.use(express.static(buildPath));
      hasBuildFiles = true;
    } else {
      console.log(`⚠️  Build directory is empty: ${buildPath}`);
    }
  } catch (error) {
    console.log(`⚠️  Error reading build directory: ${error.message}`);
  }
} else {
  console.log(`⚠️  React build not found at: ${buildPath}`);
  console.log(`📂 Current directory: ${__dirname}`);
  try {
    const currentFiles = fs.readdirSync(__dirname);
    console.log(`📂 Current directory contents: ${currentFiles.join(', ')}`);
  } catch (error) {
    console.log(`⚠️  Could not read current directory: ${error.message}`);
  }
}

// Rate limiting for uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: 'Too many uploads from this IP, please try again later.'
});

// Storage configuration
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/flac'];

// Ensure upload directory exists and log its location
try {
  fs.ensureDirSync(UPLOAD_DIR);
  console.log(`📁 Upload directory created/verified: ${UPLOAD_DIR}`);
  console.log(`📂 Upload directory absolute path: ${path.resolve(UPLOAD_DIR)}`);
  
  // Check if directory is writable
  const testFile = path.join(UPLOAD_DIR, '.test-write');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log(`✅ Upload directory is writable`);
  
  // List current contents
  const currentFiles = fs.readdirSync(UPLOAD_DIR);
  console.log(`📦 Current upload directory contents: ${currentFiles.length} files`);
  if (currentFiles.length > 0) {
    console.log(`📋 Files: ${currentFiles.join(', ')}`);
  }
} catch (error) {
  console.error(`❌ Error setting up upload directory: ${error.message}`);
  console.error(`📁 Attempted path: ${UPLOAD_DIR}`);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  }
});

// Get server storage information
app.get('/api/storage', async (req, res) => {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    let totalSize = 0;
    const fileDetails = [];

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
      
      fileDetails.push({
        name: file,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        uploadDate: stats.birthtime,
        lastModified: stats.mtime
      });
    }

    const storageInfo = {
      totalFiles: files.length,
      totalSize: totalSize,
      totalSizeFormatted: formatBytes(totalSize),
      maxFileSize: MAX_FILE_SIZE,
      maxFileSizeFormatted: formatBytes(MAX_FILE_SIZE),
      allowedTypes: ALLOWED_TYPES,
      files: fileDetails.sort((a, b) => b.uploadDate - a.uploadDate)
    };

    res.json(storageInfo);
  } catch (error) {
    console.error('Error getting storage info:', error);
    res.status(500).json({ error: 'Failed to get storage information' });
  }
});

// Upload audio file
app.post('/api/upload', uploadLimiter, upload.single('audio'), async (req, res) => {
  try {
    console.log(`📤 Upload request received`);
    console.log(`📁 Request body:`, req.body);
    console.log(`📁 Request file:`, req.file);
    
    if (!req.file) {
      console.log(`❌ No file in request`);
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📁 File details:`, {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });

    // Verify file was actually saved
    if (fs.existsSync(req.file.path)) {
      console.log(`✅ File successfully saved to: ${req.file.path}`);
      const fileStats = fs.statSync(req.file.path);
      console.log(`📊 File stats:`, fileStats);
    } else {
      console.log(`❌ File not found at expected path: ${req.file.path}`);
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      sizeFormatted: formatBytes(req.file.size),
      mimetype: req.file.mimetype,
      uploadDate: new Date(),
      path: req.file.path
    };

    console.log('File uploaded:', fileInfo);
    
    // List all files in upload directory after upload
    try {
      const allFiles = fs.readdirSync(UPLOAD_DIR);
      console.log(`📦 Total files in upload directory: ${allFiles.length}`);
      console.log(`📋 Files: ${allFiles.join(', ')}`);
    } catch (listError) {
      console.log(`⚠️  Could not list upload directory: ${listError.message}`);
    }
    
    res.json({
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Stream audio file
app.get('/api/stream/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mime.lookup(filename) || 'audio/mpeg',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': mime.lookup(filename) || 'audio/mpeg',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// Get list of available audio files
app.get('/api/audio', async (req, res) => {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const audioFiles = [];

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = await fs.stat(filePath);
      
      audioFiles.push({
        id: file,
        name: file.replace(/\.[^/.]+$/, ""), // Remove extension
        filename: file,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        uploadDate: stats.birthtime,
        streamUrl: `/api/stream/${file}`
      });
    }

    res.json(audioFiles.sort((a, b) => b.uploadDate - a.uploadDate));
  } catch (error) {
    console.error('Error getting audio files:', error);
    res.status(500).json({ error: 'Failed to get audio files' });
  }
});

// Delete audio file
app.delete('/api/audio/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    await fs.remove(filePath);
    console.log('File deleted:', filename);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Cleanup old files (older than specified days)
app.post('/api/cleanup', async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const files = await fs.readdir(UPLOAD_DIR);
    let deletedCount = 0;
    let freedSpace = 0;

    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (stats.birthtime < cutoffDate) {
        await fs.remove(filePath);
        deletedCount++;
        freedSpace += stats.size;
        console.log('Cleaned up old file:', file);
      }
    }

    res.json({
      message: 'Cleanup completed',
      deletedFiles: deletedCount,
      freedSpace: freedSpace,
      freedSpaceFormatted: formatBytes(freedSpace),
      cutoffDate: cutoffDate
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

// Utility function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Server startup validation
function validateServerStartup() {
  try {
    // Check if upload directory can be created
    fs.ensureDirSync(UPLOAD_DIR);
    console.log(`✅ Upload directory ready: ${UPLOAD_DIR}`);
    
    // Check if we can write to upload directory
    const testFile = path.join(UPLOAD_DIR, '.test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log(`✅ Upload directory is writable`);
    
    // Check build status
    if (hasBuildFiles) {
      console.log(`✅ React frontend ready`);
    } else {
      console.log(`⚠️  React frontend not available - API only mode`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Server validation failed: ${error.message}`);
    return false;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint for storage troubleshooting
app.get('/api/debug/storage', (req, res) => {
  try {
    const debugInfo = {
      uploadDir: UPLOAD_DIR,
      uploadDirAbsolute: path.resolve(UPLOAD_DIR),
      uploadDirExists: fs.existsSync(UPLOAD_DIR),
      currentWorkingDir: process.cwd(),
      serverDir: __dirname,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    if (fs.existsSync(UPLOAD_DIR)) {
      try {
        const files = fs.readdirSync(UPLOAD_DIR);
        debugInfo.fileCount = files.length;
        debugInfo.files = files;
        debugInfo.isWritable = true;
        
        // Test write permission
        const testFile = path.join(UPLOAD_DIR, '.debug-test');
        fs.writeFileSync(testFile, 'debug test');
        fs.unlinkSync(testFile);
        debugInfo.writeTest = 'passed';
      } catch (error) {
        debugInfo.readError = error.message;
        debugInfo.isWritable = false;
      }
    }

    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for any non-API routes (client-side routing)
app.get('*', (req, res) => {
  if (hasBuildFiles) {
    res.sendFile(path.join(buildPath, 'index.html'));
  } else {
    // Fallback when React build is not available
    res.status(200).json({
      message: 'Audio Streamer API Server',
      status: 'running',
      frontend: 'not available',
      api: {
        health: '/api/health',
        upload: '/api/upload',
        audio: '/api/audio',
        stream: '/api/stream',
        storage: '/api/storage'
      },
      note: 'React frontend build not found. Server running in API-only mode.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Audio Streamer Server starting on port ${PORT}`);
  
  // Validate server startup
  if (validateServerStartup()) {
    console.log(`✅ Server validation successful`);
    console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
    console.log(`💾 Max file size: ${formatBytes(MAX_FILE_SIZE)}`);
    if (hasBuildFiles) {
      console.log(`🌐 React frontend served from: ${buildPath}`);
    } else {
      console.log(`⚠️  React frontend build not found at: ${buildPath}`);
      console.log(`🔧 Server running in API-only mode`);
    }
    console.log(`🚀 Audio Streamer Server ready on port ${PORT}`);
  } else {
    console.error(`❌ Server validation failed - shutting down`);
    process.exit(1);
  }
});
