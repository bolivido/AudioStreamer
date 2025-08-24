import React, { useState, useEffect, useRef } from 'react';

const RadioPlayer = ({ 
  streamUrl, 
  onPlayStateChange, 
  onNowPlayingChange, 
  onConnectionStatusChange,
  isPlaying,
  nowPlaying,
  connectionStatus,
  audioMode,
  currentAudio
}) => {
  // 🚨 ALL HOOKS MUST BE CALLED FIRST (React Rules)
  const audioRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const metadataIntervalRef = useRef(null);
  
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [metadata, setMetadata] = useState({});
  const [networkStatus, setNetworkStatus] = useState('online');

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000; // 3 seconds

  // 🚨 ALL useEffect HOOKS MUST BE CALLED FIRST TOO
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Auto-play when isPlaying becomes true and we have a streamUrl
  useEffect(() => {
    if (isPlaying && streamUrl && audioRef.current) {
      console.log(`🎵 Auto-play triggered for: ${streamUrl}`);
      // Ensure audio element is properly initialized
      audioRef.current.crossOrigin = 'anonymous';
      audioRef.current.preload = 'auto';
      handlePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, streamUrl]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
    };
  }, []);

  // 🛡️ SAFETY CHECK AFTER ALL HOOKS
  if (!audioMode || (audioMode === 'upload' && (!currentAudio || !currentAudio.type || !currentAudio.size))) {
    console.log('🛡️ RadioPlayer Safety: Invalid props, showing fallback', {
      audioMode,
      hasCurrentAudio: !!currentAudio,
      currentAudioType: currentAudio?.type,
      currentAudioSize: currentAudio?.size,
      streamUrl
    });
    return (
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">Radio Player</h2>
          <p className="text-lg text-gray-300">Stream Mode (Safe Fallback)</p>
          <p className="text-sm text-gray-400 mt-2">
            {audioMode === 'upload' ? 'Upload mode - waiting for audio data...' : 'Stream mode active'}
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-6">
          <button
            onClick={() => console.log('Fallback play clicked')}
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800 bg-primary-600 hover:bg-primary-700 text-white"
          >
            ▶️
          </button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Stream Source</p>
            <p className="text-sm text-gray-400 font-mono break-all max-w-xs">
              {streamUrl || 'No stream selected'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🚨 ADDITIONAL SAFETY: Double-check before rendering
  if (audioMode === 'upload' && (!currentAudio || !currentAudio.type || !currentAudio.size)) {
    console.error('🚨 CRITICAL: RadioPlayer about to crash! Forcing fallback render');
    return (
      <div className="card bg-red-900/20 border-red-500">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-red-300 mb-2">⚠️ Safety Mode</h2>
          <p className="text-lg text-red-200">Audio data incomplete - preventing crash</p>
          <p className="text-sm text-red-300 mt-2">
            Mode: {audioMode} | Has Audio: {!!currentAudio} | Has Type: {!!currentAudio?.type} | Has Size: {!!currentAudio?.size}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-red-400">
            Please select a complete audio file from the list above
          </p>
        </div>
      </div>
    );
  }

  const handlePlay = async () => {
    if (!streamUrl || !audioRef.current) {
      console.log(`🎵 Cannot play: missing streamUrl or audio element`);
      return;
    }
    
    // Additional safety check for upload mode
    if (audioMode === 'upload' && (!currentAudio || !currentAudio.type)) {
      console.log(`🎵 Cannot play: incomplete audio data for upload mode`);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      onConnectionStatusChange('connecting');
      
      console.log(`🎵 handlePlay called with streamUrl: ${streamUrl}`);
      
      // Set the audio source
      audioRef.current.src = streamUrl;
      console.log(`🎵 Audio element src set to: ${streamUrl}`);
      
      // Wait for audio to be ready to play
      await new Promise((resolve, reject) => {
        const audio = audioRef.current;
        
        const onCanPlay = () => {
          console.log(`🎵 Audio can play - ready to start playback`);
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          clearTimeout(timeoutId);
          resolve();
        };
        
        const onError = (event) => {
          console.log(`🎵 Audio loading error:`, event);
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          clearTimeout(timeoutId);
          reject(new Error('Audio failed to load'));
        };
        
        // Set a longer timeout for loading (30 seconds for large files)
        const timeoutId = setTimeout(() => {
          console.log(`🎵 Audio loading timeout reached`);
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(new Error('Audio loading timeout'));
        }, 30000); // Increased to 30 seconds for large audio files
        
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('error', onError);
      });
      
      // Try to play
      console.log(`🎵 Attempting to play audio`);
      await audioRef.current.play();
      console.log(`🎵 Audio playback started successfully`);
      onPlayStateChange(true);
      onConnectionStatusChange('connected');
      startMetadataPolling();
    } catch (err) {
      console.error('Play error:', err);
      
      let errorMessage = 'Failed to start stream. ';
      if (err.message.includes('timeout')) {
        errorMessage += 'Stream is taking too long to load. Try a different station or check your connection.';
      } else if (err.message.includes('Audio failed to load')) {
        errorMessage += 'Stream URL may be invalid or inaccessible.';
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      onConnectionStatusChange('disconnected');
      
      // Only attempt reconnection for timeout errors
      if (err.message.includes('timeout')) {
        handleReconnect();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      onPlayStateChange(false);
      onConnectionStatusChange('disconnected');
      stopMetadataPolling();
      console.log(`🎵 Audio paused`);
    }
  };

  const handleError = (event) => {
    console.error('Audio error:', event);
    
    let errorMessage = 'Stream error occurred. ';
    const error = event.target.error;
    
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage += 'Network error - check your connection.';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage += 'Audio format not supported.';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage += 'Stream format not supported.';
          break;
        default:
          errorMessage += 'Unknown error occurred.';
      }
    } else {
      errorMessage += 'Attempting to reconnect...';
    }
    
    setError(errorMessage);
    onConnectionStatusChange('disconnected');
    onPlayStateChange(false); // Ensure play state is set to false on error
    stopMetadataPolling();
    
    // Only attempt reconnection for network errors
    if (!error || error.code === MediaError.MEDIA_ERR_NETWORK) {
      handleReconnect();
    }
  };

  const handleReconnect = () => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setReconnectAttempts(prev => prev + 1);
      onConnectionStatusChange('connecting');
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          handlePlay();
        }
      }, RECONNECT_DELAY);
    } else {
      setError('Maximum reconnection attempts reached. Please try again later.');
      onConnectionStatusChange('disconnected');
    }
  };

  const startMetadataPolling = () => {
    // Poll for metadata every 10 seconds
    metadataIntervalRef.current = setInterval(async () => {
      try {
        if (audioRef.current && !audioRef.current.paused && streamUrl) {
          // Try to fetch real metadata from Shoutcast/Icecast streams
          await fetchShoutcastMetadata(streamUrl);
        }
      } catch (err) {
        console.warn('Metadata fetch failed:', err);
      }
    }, 10000);
  };

  const fetchShoutcastMetadata = async (streamUrl) => {
    try {
      // Create a new request to get metadata headers
      const response = await fetch(streamUrl, {
        method: 'HEAD',
        headers: {
          'Icy-MetaData': '1', // Request metadata from Shoutcast
          'User-Agent': 'AudioStreamer/1.0'
        }
      });

      if (response.ok) {
        // Extract Shoutcast metadata headers
        const icyName = response.headers.get('icy-name');
        const icyGenre = response.headers.get('icy-genre');
        const icyUrl = response.headers.get('icy-url');
        const icyBitrate = response.headers.get('icy-br');
        const icyDescription = response.headers.get('icy-description');

        // Try to get current track info if available
        let currentTrack = null;
        try {
          // Some Shoutcast servers support current track info
          const trackResponse = await fetch(`${streamUrl.replace('/;', '')}/currentsong`, {
            headers: { 'User-Agent': 'AudioStreamer/1.0' }
          });
          if (trackResponse.ok) {
            const trackText = await trackResponse.text();
            if (trackText && trackText.trim() && !trackText.includes('<!DOCTYPE')) {
              currentTrack = trackText.trim();
            }
          }
        } catch (trackError) {
          console.log('Track info not available:', trackError.message);
        }

        // Parse track info if available
        let title = 'Live Stream';
        let artist = 'Radio Station';
        let album = '';

        if (currentTrack) {
          // Parse common track formats: "Artist - Title" or "Title - Artist"
          if (currentTrack.includes(' - ')) {
            const parts = currentTrack.split(' - ');
            if (parts.length >= 2) {
              // Try to determine which is artist vs title
              if (parts[0].length < parts[1].length) {
                // First part is likely artist
                artist = parts[0].trim();
                title = parts[1].trim();
              } else {
                // First part is likely title
                title = parts[0].trim();
                artist = parts[1].trim();
              }
            }
          } else {
            title = currentTrack;
          }
        }

        // Create metadata object
        const realMetadata = {
          title: title,
          artist: artist,
          album: album,
          station: icyName || 'Unknown Station',
          genre: icyGenre || 'Unknown Genre',
          url: icyUrl || '',
          bitrate: icyBitrate ? `${icyBitrate}kbps` : 'Unknown',
          description: icyDescription || ''
        };

        console.log('🎵 Real Shoutcast metadata:', realMetadata);
        setMetadata(realMetadata);
        onNowPlayingChange(realMetadata.title);

        // Update now playing with station info if no track info
        if (!currentTrack && icyName) {
          onNowPlayingChange(`${icyName} - Live`);
        }
      }
    } catch (error) {
      console.log('📻 Shoutcast metadata fetch failed, using fallback:', error.message);
      // Fallback to basic metadata
      const fallbackMetadata = {
        title: 'Live Stream',
        artist: 'Radio Station',
        album: 'Live Broadcast'
      };
      setMetadata(fallbackMetadata);
      onNowPlayingChange('Live Radio Stream');
    }
  };

  const stopMetadataPolling = () => {
    if (metadataIntervalRef.current) {
      clearInterval(metadataIntervalRef.current);
      metadataIntervalRef.current = null;
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };



  // Safety check: if we're in upload mode but currentAudio is incomplete, fall back to stream mode




  // 🛡️ FINAL SAFETY: Wrap the render in try-catch to prevent any unexpected crashes
  try {
    return (
      <div className="card">
        {/* Now Playing Display */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">
            {isPlaying ? 'Now Playing' : audioMode === 'upload' ? 'Audio Player' : 'Radio Player'}
          </h2>
          <p className="text-lg text-gray-300">
            {nowPlaying}
          </p>
          {audioMode === 'upload' && currentAudio && (
            <div className="text-sm text-gray-400 mt-1 space-y-1">
              {(() => {
                try {
                  // 🛡️ COMPREHENSIVE SAFETY: Multiple layers of protection
                  const fileType = currentAudio?.type;
                  const fileSize = currentAudio?.size;
                  const fileDuration = currentAudio?.duration;
                  
                  // Validate all properties exist and are valid
                  if (!fileType || !fileSize || typeof fileSize !== 'number') {
                    console.warn('⚠️ RadioPlayer: Invalid audio properties:', { fileType, fileSize, fileDuration });
                    return (
                      <>
                        <p>AUDIO • {Math.round((fileSize || 0) / 1024)} KB</p>
                        {fileDuration && fileDuration > 0 && (
                          <p>Duration: {Math.floor(fileDuration / 60)}:{Math.floor(fileDuration % 60).toString().padStart(2, '0')}</p>
                        )}
                      </>
                    );
                  }
                  
                  // Safe type extraction with fallback
                  let typeDisplay = 'AUDIO';
                  try {
                    if (fileType && typeof fileType === 'string' && fileType.includes('/')) {
                      const typeParts = fileType.split('/');
                      if (typeParts.length > 1 && typeParts[1]) {
                        typeDisplay = typeParts[1].toUpperCase();
                      }
                    }
                  } catch (typeError) {
                    console.warn('⚠️ RadioPlayer: Error parsing file type:', typeError);
                    typeDisplay = 'AUDIO';
                  }
                  
                  // Safe size calculation
                  let sizeDisplay = '0 KB';
                  try {
                    if (fileSize && !isNaN(fileSize) && fileSize > 0) {
                      sizeDisplay = `${Math.round(fileSize / 1024)} KB`;
                    }
                  } catch (sizeError) {
                    console.warn('⚠️ RadioPlayer: Error calculating file size:', sizeError);
                    sizeDisplay = '0 KB';
                  }
                  
                  // Safe duration calculation
                  let durationDisplay = null;
                  try {
                    if (fileDuration && !isNaN(fileDuration) && fileDuration > 0) {
                      const minutes = Math.floor(fileDuration / 60);
                      const seconds = Math.floor(fileDuration % 60);
                      durationDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    }
                  } catch (durationError) {
                    console.warn('⚠️ RadioPlayer: Error calculating duration:', durationError);
                    durationDisplay = null;
                  }
                  
                  return (
                    <>
                      <p>{typeDisplay} • {sizeDisplay}</p>
                      {durationDisplay && (
                        <p>Duration: {durationDisplay}</p>
                      )}
                    </>
                  );
                  
                } catch (error) {
                  console.error('🚨 RadioPlayer: Critical error in audio info display:', error);
                  // Return safe fallback UI
                  return (
                    <>
                      <p>AUDIO • 0 KB</p>
                      <p className="text-red-400 text-xs">⚠️ Error displaying audio info</p>
                    </>
                  );
                }
              })()}
            </div>
          )}
                  {audioMode === 'stream' && (
          <div className="text-sm text-gray-400 mt-1 space-y-1">
            {metadata.artist && metadata.artist !== 'Radio Station' && (
              <p>{metadata.artist} • {metadata.album || 'Live Stream'}</p>
            )}
            {metadata.station && metadata.station !== 'Unknown Station' && (
              <p className="text-xs text-blue-400">
                📻 {metadata.station}
                {metadata.genre && metadata.genre !== 'Unknown Genre' && ` • ${metadata.genre}`}
                {metadata.bitrate && metadata.bitrate !== 'Unknown' && ` • ${metadata.bitrate}`}
              </p>
            )}
          </div>
        )}
        </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onError={handleError}
        onEnded={handleError}
        preload="none"
        style={{ display: 'none' }}
      />

      {/* Controls */}
      <div className="flex flex-col items-center space-y-6">
        {/* Play/Pause Button */}
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={isLoading}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
            isLoading 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : isPlaying 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          ) : isPlaying ? (
            '⏸️'
          ) : (
            '▶️'
          )}
        </button>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-gray-400 w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Source Display */}
        <div className="text-center">
          {audioMode === 'upload' ? (
            <>
              <p className="text-xs text-gray-500 mb-1">Audio File</p>
                              <p className="text-sm text-gray-400 font-medium">
                  {currentAudio?.name || 'Unknown File'}
                </p>
              <p className="text-xs text-gray-500 mt-1">
                Local file • No connection needed
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-1">Stream Source</p>
              <p className="text-sm text-gray-400 font-mono break-all max-w-xs">
                {streamUrl}
              </p>
              
              {/* Connection Test Button */}
              <button
                onClick={handlePlay}
                disabled={isLoading || isPlaying}
                className="mt-3 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isLoading ? 'Testing...' : 'Test Connection'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm text-center">{error}</p>
          {reconnectAttempts > 0 && (
            <p className="text-red-300 text-xs text-center mt-2">
              Reconnection attempt {reconnectAttempts}/{MAX_RECONNECT_ATTEMPTS}
            </p>
          )}
        </div>
      )}

      {/* Status Display */}
      <div className="mt-6 text-center space-y-2">
                  {audioMode === 'upload' ? (
          <div className="inline-flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-400">
              Local Audio • No Connection Required
            </span>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse-slow' :
                'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-400 capitalize">
                {connectionStatus}
              </span>
            </div>
            
            {/* Network Status */}
            <div className="inline-flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                networkStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-400 capitalize">
                Network: {networkStatus}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
    );
  } catch (error) {
    console.error('🚨 RadioPlayer render error:', error);
    // Return a safe fallback UI if rendering fails
    return (
      <div className="card bg-red-900/20 border-red-500">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-red-300 mb-2">⚠️ Error</h2>
          <p className="text-lg text-red-200">Something went wrong while rendering the player</p>
          <p className="text-sm text-red-300 mt-2">
            Please refresh the page or try again
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-red-400">
            Error: {error.message}
          </p>
        </div>
      </div>
    );
  }
};

export default RadioPlayer;
