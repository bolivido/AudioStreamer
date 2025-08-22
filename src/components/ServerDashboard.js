import React, { useState, useEffect } from 'react';
import config from '../config';

const ServerDashboard = ({ serverUrl = config.serverUrl }) => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [audioFiles, setAudioFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    fetchStorageInfo();
    fetchAudioFiles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStorageInfo = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/storage`);
      if (response.ok) {
        const data = await response.json();
        setStorageInfo(data);
      } else {
        throw new Error('Failed to fetch storage info');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAudioFiles = async () => {
    try {
      const response = await fetch(`${serverUrl}/api/audio`);
      if (response.ok) {
        const data = await response.json();
        setAudioFiles(data);
      }
    } catch (err) {
      console.warn('Failed to fetch audio files:', err);
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm(`Are you sure you want to delete files older than ${cleanupDays} days? This action cannot be undone.`)) {
      return;
    }

    setCleanupLoading(true);
    try {
      const response = await fetch(`${serverUrl}/api/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: cleanupDays }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Cleanup completed! Deleted ${result.deletedFiles} files and freed ${result.freedSpaceFormatted} of space.`);
        fetchStorageInfo();
        fetchAudioFiles();
      } else {
        throw new Error('Cleanup failed');
      }
    } catch (err) {
      alert('Cleanup failed: ' + err.message);
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleDeleteFile = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${serverUrl}/api/audio/${filename}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('File deleted successfully!');
        fetchStorageInfo();
        fetchAudioFiles();
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-400">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center text-red-400">
          <p className="text-lg mb-2">⚠️ Server Connection Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchStorageInfo}
            className="mt-3 btn-primary"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4 text-center">
          📊 Server Storage Overview
        </h2>
        
        {storageInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-primary-400">{storageInfo.totalFiles}</div>
              <div className="text-sm text-gray-400">Total Files</div>
            </div>
            <div className="text-center p-4 bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{storageInfo.totalSizeFormatted}</div>
              <div className="text-sm text-gray-400">Total Size</div>
            </div>
            <div className="text-center p-4 bg-gray-700/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{storageInfo.maxFileSizeFormatted}</div>
              <div className="text-sm text-gray-400">Max File Size</div>
            </div>
          </div>
        )}

        {/* Cleanup Section */}
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-white mb-3">🧹 Storage Cleanup</h3>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">Delete files older than:</label>
              <input
                type="number"
                min="1"
                max="365"
                value={cleanupDays}
                onChange={(e) => setCleanupDays(parseInt(e.target.value))}
                className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
              />
              <span className="text-sm text-gray-300">days</span>
            </div>
            <button
              onClick={handleCleanup}
              disabled={cleanupLoading}
              className="btn-secondary"
            >
              {cleanupLoading ? 'Cleaning...' : 'Clean Up Old Files'}
            </button>
          </div>
        </div>
      </div>

      {/* Server Audio Library */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          🎵 Server Audio Library ({audioFiles.length})
        </h2>
        
        {audioFiles.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-gray-400 mb-4">No audio files uploaded yet.</p>
            <p className="text-gray-400 mb-6">Upload files to see them here.</p>
            
            {/* Railway Storage Notice */}
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-4">
              <h3 className="text-yellow-300 font-semibold mb-2">⚠️ Railway Storage Notice</h3>
              <p className="text-yellow-200 text-sm mb-2">
                Railway's free tier uses ephemeral storage. Files may disappear when the container restarts.
              </p>
              <p className="text-yellow-200 text-sm">
                For persistent storage, consider upgrading to Railway Pro or using cloud storage.
              </p>
            </div>
            
            <button
              onClick={() => window.location.href = '/#upload'}
              className="btn-primary"
            >
              🎵 Upload Audio Files
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {audioFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{file.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                    <span>{file.sizeFormatted}</span>
                    <span>{formatDate(file.uploadDate)}</span>
                    <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                      {file.filename.split('.').pop().toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={`${serverUrl}${file.streamUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    Stream
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.filename)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Server Info */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4 text-center">
          ⚙️ Server Information
        </h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Server URL:</span>
            <span className="text-white font-mono">{serverUrl}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className="text-green-400">🟢 Online</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Supported Formats:</span>
            <span className="text-white">MP3, WAV, AAC, OGG, FLAC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Rate Limit:</span>
            <span className="text-white">10 uploads per 15 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerDashboard;
