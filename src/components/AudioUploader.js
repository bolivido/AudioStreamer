import React, { useState, useRef, useEffect } from 'react';
import config from '../config';

const AudioUploader = ({ onAudioSelect, onAudioRemove, uploadedAudios, serverUrl = config.serverUrl, onAutoPlay }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // Auto-play uploaded song
  const autoPlaySong = (audioData) => {
    if (config.autoPlay.enabled && onAutoPlay) {
      setTimeout(() => {
        onAutoPlay(audioData);
      }, config.autoPlay.delay);
    }
  };

  // Auto-discover songs from music folder
  const discoverMusicFolder = async () => {
    try {
      console.log(`🔍 Discovering music folder at: ${serverUrl}/api/audio`);
      const response = await fetch(`${serverUrl}/api/audio`);
      if (response.ok) {
        const songs = await response.json();
        console.log(`🎵 Found ${songs.length} songs on server:`, songs);
        
        if (songs.length > 0 && !uploadedAudios.length) {
          // Auto-play first song if no songs are currently loaded
          const firstSong = songs[0];
          console.log(`🎵 Auto-playing first song:`, firstSong);
          
          const audioData = {
            id: firstSong.id,
            name: firstSong.name,
            url: `${serverUrl}${firstSong.streamUrl}`,
            filename: firstSong.filename,
            size: firstSong.size,
            sizeFormatted: firstSong.sizeFormatted,
            uploadDate: firstSong.uploadDate,
            serverUrl: serverUrl
          };
          
          console.log(`🎵 Created audio data for auto-play:`, audioData);
          onAudioSelect(audioData);
          autoPlaySong(audioData);
        } else if (songs.length > 0) {
          console.log(`🎵 Songs found but already have uploaded audios, not auto-playing`);
        } else {
          console.log(`🎵 No songs found on server`);
        }
      } else {
        console.log(`❌ Failed to fetch songs: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Error discovering music folder:', error);
    }
  };

  // Discover music on component mount
  useEffect(() => {
    discoverMusicFolder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    
    try {
      for (let file of files) {
        if (file.type.startsWith('audio/')) {
          // Upload to server
          const formData = new FormData();
          formData.append('audio', file);
          
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          
          try {
            const response = await fetch(`${serverUrl}/api/upload`, {
              method: 'POST',
              body: formData,
            });
            
            if (response.ok) {
              const result = await response.json();
              
              // Create audio data from server response
              const audioData = {
                id: result.file.filename,
                name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                url: `${serverUrl}/api/stream/${result.file.filename}`,
                filename: result.file.filename,
                size: result.file.size,
                sizeFormatted: result.file.sizeFormatted,
                type: result.file.mimetype,
                uploadDate: result.file.uploadDate,
                serverUrl: serverUrl
              };
              
              console.log(`🎵 Created audio data:`, audioData);
              console.log(`🎵 Stream URL: ${audioData.url}`);
              
              onAudioSelect(audioData);
              setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
              autoPlaySong(audioData); // Auto-play the song
            } else {
              throw new Error('Upload failed');
            }
          } catch (err) {
            console.error('Upload error for', file.name, ':', err);
            setUploadProgress(prev => ({ ...prev, [file.name]: -1 })); // Error state
          }
        }
      }
    } catch (err) {
      console.error('Error processing files:', err);
    } finally {
      setUploading(false);
      // Clear progress after a delay
      setTimeout(() => setUploadProgress({}), 3000);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold text-white mb-4 text-center">
        Upload Your Own Audio
      </h2>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary-500 bg-primary-500/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Upload Audio Files</h3>
          {config.autoPlay.enabled && (
            <div className="mb-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
              <p className="text-green-400 text-sm">
                🎵 Auto-play enabled - Songs will automatically start playing after upload
              </p>
            </div>
          )}
          <p className="text-gray-400 mb-6">
            Drag and drop audio files here, or click to browse
          </p>
          <div className="space-y-3">
            <button
              onClick={openFileDialog}
              disabled={uploading}
              className="btn-primary"
            >
              {uploading ? 'Uploading...' : 'Choose Audio Files'}
            </button>
            
            <button
              onClick={discoverMusicFolder}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              🔍 Discover Music on Server
            </button>
          </div>
        </div>
        
        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="text-sm">
                <div className="flex justify-between text-gray-300 mb-1">
                  <span className="truncate">{filename}</span>
                  <span>{progress === -1 ? '❌' : progress === 100 ? '✅' : `${progress}%`}</span>
                </div>
                {progress >= 0 && progress < 100 && (
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-4">
          Supported formats: MP3, WAV, AAC, OGG, FLAC
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Uploaded Audio List */}
      {uploadedAudios.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-white mb-3">
            Your Audio Library ({uploadedAudios.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedAudios.map((audio) => (
              <div
                key={audio.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{audio.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{formatFileSize(audio.size)}</span>
                    <span>{formatDuration(audio.duration)}</span>
                    <span className="text-xs">{audio.type.split('/')[1].toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAudioSelect(audio)}
                    className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors"
                  >
                    Play
                  </button>
                  <button
                    onClick={() => onAudioRemove(audio.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 text-center text-sm text-gray-400">
        <p className="text-green-400 mb-2">✅ Files are uploaded to the server for live streaming to all users</p>
        <p>Perfect for creating a shared radio experience where everyone listens to the same music</p>
      </div>
    </div>
  );
};

export default AudioUploader;
