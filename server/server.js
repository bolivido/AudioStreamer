const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3001;

// Railway-specific configuration
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
console.log(`🚂 Railway environment detected: ${isRailway ? 'YES' : 'NO'} - Cloudinary Ready!`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Port: ${PORT}`);

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

// Configure storage based on environment
let storage;
let useCloudStorage = false;

// Debug Cloudinary environment variables
console.log(`🔍 Cloudinary Environment Check:`);
console.log(`   CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET'}`);
console.log(`   CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`   CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'}`);
console.log(`   CLOUDINARY_URL: ${process.env.CLOUDINARY_URL ? 'SET' : 'NOT SET'}`);

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  try {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    console.log(`☁️  Cloudinary configured successfully`);
    
    // Cloudinary storage
    const cloudinaryStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'audio-streamer',
        resource_type: 'auto',
        allowed_formats: ['mp3', 'wav', 'aac', 'ogg', 'flac'],
        transformation: [{ quality: 'auto' }]
      }
    });
    storage = cloudinaryStorage;
    useCloudStorage = true;
    console.log(`☁️  Using Cloudinary cloud storage`);
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  } catch (error) {
    console.error(`❌ Cloudinary configuration error:`, error);
    // Fallback to local storage
    storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
      }
    });
    useCloudStorage = false;
    console.log(`📁 Falling back to local storage due to Cloudinary error`);
  }
} else {
  // Local storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  console.log(`📁 Using local storage`);
}

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
  } else {
    console.log(`⚠️  WARNING: Upload directory is empty!`);
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      console.log(`☁️  Files will be stored in Cloudinary cloud storage`);
    } else {
      console.log(`⚠️  This is normal for Railway's ephemeral storage.`);
      console.log(`⚠️  Files will be lost when container restarts.`);
      console.log(`💡 Consider using Cloudinary for persistent storage.`);
    }
  }
} catch (error) {
  console.error(`❌ Error setting up upload directory: ${error.message}`);
  console.error(`📁 Attempted path: ${UPLOAD_DIR}`);
}

// Configure multer for file uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    console.log(`🔍 File filter check: ${file.originalname} (${file.mimetype})`);
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      console.log(`✅ File type allowed: ${file.mimetype}`);
      cb(null, true);
    } else {
      console.log(`❌ File type rejected: ${file.mimetype}`);
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  }
}).single('audio');

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }
    return res.status(400).json({ error: 'File upload error: ' + error.message });
  } else if (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
  next();
});

// Check environment variables
app.get('/api/env-check', (req, res) => {
  res.json({
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET',
      url: process.env.CLOUDINARY_URL ? 'SET' : 'NOT SET'
    },
    useCloudStorage: useCloudStorage,
    timestamp: new Date().toISOString()
  });
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
app.post('/api/upload', uploadLimiter, upload, async (req, res) => {
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
      path: req.file.path,
      url: req.file.url
    });

    // Handle different storage types
    let fileInfo;
    if (useCloudStorage && req.file.url) {
      // Cloudinary storage
      fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        sizeFormatted: formatBytes(req.file.size),
        mimetype: req.file.mimetype,
        uploadDate: new Date(),
        url: req.file.url,
        cloudStorage: true
      };
      console.log(`☁️  File uploaded to Cloudinary: ${req.file.url}`);
    } else {
      // Local storage
      // Verify file was actually saved
      if (fs.existsSync(req.file.path)) {
        console.log(`✅ File successfully saved to: ${req.file.path}`);
        const fileStats = fs.statSync(req.file.path);
        console.log(`📊 File stats:`, fileStats);
      } else {
        console.log(`❌ File not found at expected path: ${req.file.path}`);
      }

      fileInfo = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        sizeFormatted: formatBytes(req.file.size),
        mimetype: req.file.mimetype,
        uploadDate: new Date(),
        path: req.file.path,
        cloudStorage: false
      };
    }

    console.log('File uploaded:', fileInfo);
    
    // List all files in upload directory after upload (for local storage)
    if (!useCloudStorage) {
      try {
        const allFiles = fs.readdirSync(UPLOAD_DIR);
        console.log(`📦 Total files in upload directory: ${allFiles.length}`);
        console.log(`📋 Files: ${allFiles.join(', ')}`);
      } catch (listError) {
        console.log(`⚠️  Could not list upload directory: ${listError.message}`);
      }
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

// Simplified server startup
const startServer = () => {
  try {
    console.log(`🚀 Starting Audio Streamer Server...`);
    console.log(`📁 Working directory: ${process.cwd()}`);
    console.log(`📁 Server directory: ${__dirname}`);
    
    // Basic validation
    if (!validateServerStartup()) {
      console.error(`❌ Server validation failed - exiting`);
      process.exit(1);
    }
    
    // Start the server
    const server = app.listen(PORT, () => {
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
      
      // Start keep-alive mechanism
      startKeepAlive();
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error(`❌ Server error: ${error.message}`);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      }
      process.exit(1);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log(`🛑 Received SIGTERM - shutting down gracefully`);
      server.close(() => {
        console.log(`✅ Server closed`);
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log(`🛑 Received SIGINT - shutting down gracefully`);
      server.close(() => {
        console.log(`✅ Server closed`);
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error(`❌ Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

// Keep-alive mechanism to prevent Railway from killing the container
const startKeepAlive = () => {
  console.log(`💓 Starting keep-alive mechanism...`);
  
  // Send periodic health checks (more frequent for Railway free tier)
  setInterval(() => {
    try {
      const healthStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        uploadDir: UPLOAD_DIR,
        uploadDirExists: fs.existsSync(UPLOAD_DIR),
        hasBuildFiles: hasBuildFiles,
        port: PORT
      };
      console.log(`💓 Keep-alive: Server running for ${Math.floor(process.uptime())}s`);
      
      // Also log to stderr to ensure Railway sees activity
      console.error(`💓 Keep-alive: Server active at ${new Date().toISOString()}`);
    } catch (error) {
      console.log(`⚠️  Keep-alive error: ${error.message}`);
    }
  }, 15000); // Every 15 seconds (more frequent)
  
  // Log memory usage periodically
  setInterval(() => {
    const memUsage = process.memoryUsage();
    console.log(`📊 Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
    console.error(`📊 Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB used`);
  }, 30000); // Every 30 seconds
  
  // Additional activity to keep Railway happy
  setInterval(() => {
    console.log(`🎵 Audio Streamer Server - Active and serving requests`);
    console.error(`🎵 Server heartbeat: ${new Date().toISOString()}`);
  }, 10000); // Every 10 seconds
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      uploadDir: UPLOAD_DIR,
      uploadDirExists: fs.existsSync(UPLOAD_DIR),
      hasBuildFiles: hasBuildFiles,
      port: PORT,
      railway: isRailway
    };
    
    // Check if upload directory is accessible
    if (fs.existsSync(UPLOAD_DIR)) {
      try {
        const files = fs.readdirSync(UPLOAD_DIR);
        healthStatus.fileCount = files.length;
        healthStatus.isWritable = true;
      } catch (error) {
        healthStatus.isWritable = false;
        healthStatus.readError = error.message;
      }
    }
    
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Simple ping endpoint for Railway
app.get('/ping', (req, res) => {
  res.json({ 
    pong: true, 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint for Railway health checks
app.get('/', (req, res) => {
  res.json({ 
    message: 'Audio Streamer Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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

// Process monitoring and error handling
process.on('uncaughtException', (error) => {
  console.error(`❌ Uncaught Exception: ${error.message}`);
  console.error(`📚 Stack trace: ${error.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`❌ Unhandled Rejection at: ${promise}`);
  console.error(`📚 Reason: ${reason}`);
  process.exit(1);
});

process.on('warning', (warning) => {
  console.warn(`⚠️  Process warning: ${warning.name}`);
  console.warn(`📚 Message: ${warning.message}`);
  console.warn(`📚 Stack: ${warning.stack}`);
});

// Monitor system resources
setInterval(() => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  console.log(`📊 System Status:`);
  console.log(`   Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB used / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB total`);
  console.log(`   CPU: ${Math.round(cpuUsage.user / 1000)}ms user / ${Math.round(cpuUsage.system / 1000)}ms system`);
  console.log(`   Uptime: ${Math.floor(process.uptime())}s`);
}, 120000); // Every 2 minutes

startServer();
