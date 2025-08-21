#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Utility function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get storage information
async function getStorageInfo() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      console.log('📁 Upload directory does not exist yet.');
      return;
    }

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

    console.log('\n📊 Server Storage Information:');
    console.log('================================');
    console.log(`📁 Total Files: ${files.length}`);
    console.log(`💾 Total Size: ${formatBytes(totalSize)}`);
    console.log(`📅 Oldest File: ${fileDetails.length > 0 ? fileDetails[fileDetails.length - 1].uploadDate.toLocaleDateString() : 'N/A'}`);
    console.log(`📅 Newest File: ${fileDetails.length > 0 ? fileDetails[0].uploadDate.toLocaleDateString() : 'N/A'}`);

    if (fileDetails.length > 0) {
      console.log('\n📋 File Details:');
      console.log('----------------');
      fileDetails.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name}`);
        console.log(`   Size: ${file.sizeFormatted} | Upload: ${file.uploadDate.toLocaleDateString()}`);
      });
    }

    return { totalSize, fileDetails };
  } catch (error) {
    console.error('❌ Error getting storage info:', error);
  }
}

// Cleanup old files
async function cleanupOldFiles(days = 30) {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      console.log('📁 Upload directory does not exist yet.');
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    console.log(`\n🧹 Cleaning up files older than ${days} days...`);
    console.log(`📅 Cutoff date: ${cutoffDate.toLocaleDateString()}`);

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
        console.log(`🗑️  Deleted: ${file} (${formatBytes(stats.size)})`);
      }
    }

    if (deletedCount > 0) {
      console.log(`\n✅ Cleanup completed!`);
      console.log(`🗑️  Files deleted: ${deletedCount}`);
      console.log(`💾 Space freed: ${formatBytes(freedSpace)}`);
    } else {
      console.log(`\n✅ No old files found to clean up.`);
    }

    return { deletedCount, freedSpace };
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Delete specific file
async function deleteFile(filename) {
  try {
    const filePath = path.join(UPLOAD_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filename}`);
      return;
    }

    const stats = await fs.stat(filePath);
    await fs.remove(filePath);
    
    console.log(`✅ File deleted: ${filename}`);
    console.log(`💾 Space freed: ${formatBytes(stats.size)}`);
    
    return stats.size;
  } catch (error) {
    console.error('❌ Error deleting file:', error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🎵 Audio Streamer Server - Storage Management');
  console.log('============================================');

  switch (command) {
    case 'info':
      await getStorageInfo();
      break;
      
    case 'cleanup':
      const days = parseInt(args[1]) || 30;
      await cleanupOldFiles(days);
      break;
      
    case 'delete':
      const filename = args[1];
      if (!filename) {
        console.log('❌ Please specify a filename to delete');
        console.log('Usage: node cleanup.js delete <filename>');
        return;
      }
      await deleteFile(filename);
      break;
      
    case 'help':
    default:
      console.log('\n📖 Available Commands:');
      console.log('----------------------');
      console.log('node cleanup.js info                    - Show storage information');
      console.log('node cleanup.js cleanup [days]          - Clean up old files (default: 30 days)');
      console.log('node cleanup.js delete <filename>       - Delete specific file');
      console.log('node cleanup.js help                    - Show this help message');
      console.log('\n💡 Examples:');
      console.log('node cleanup.js cleanup 7               - Clean up files older than 7 days');
      console.log('node cleanup.js delete audio-123.mp3    - Delete specific audio file');
      break;
  }

  // Always show storage info after operations
  if (command !== 'info' && command !== 'help') {
    await getStorageInfo();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getStorageInfo, cleanupOldFiles, deleteFile };
