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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

  const handlePlay = async () => {
    try {
      setIsLoading(true);
      setError(null);
      onConnectionStatusChange('connecting');

      if (audioRef.current) {
        // Set up audio element with better error handling
        audioRef.current.src = streamUrl;
        audioRef.current.crossOrigin = 'anonymous';
        
        // Wait for audio to be ready
        await new Promise((resolve, reject) => {
          const audio = audioRef.current;
          
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            resolve();
          };
          
          const onError = (e) => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            reject(new Error('Audio failed to load'));
          };
          
          audio.addEventListener('canplay', onCanPlay);
          audio.addEventListener('error', onError);
          
          // Set a timeout for loading
          setTimeout(() => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            reject(new Error('Audio loading timeout'));
          }, 15000); // 15 second timeout - increased for slower connections
        });
        
        // Try to play
        await audioRef.current.play();
        onPlayStateChange(true);
        onConnectionStatusChange('connected');
        startMetadataPolling();
      }
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
    onPlayStateChange(false);
    
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
        // Try to fetch metadata from the stream
        // This is a simplified approach - real implementation might need
        // to parse Icecast/Shoutcast metadata
        if (audioRef.current && !audioRef.current.paused) {
          // For demo purposes, we'll simulate metadata updates
          const mockMetadata = {
            title: `Track ${Math.floor(Math.random() * 100)}`,
            artist: 'Radio Station',
            album: 'Live Stream'
          };
          setMetadata(mockMetadata);
          onNowPlayingChange(mockMetadata.title);
        }
      } catch (err) {
        console.warn('Metadata fetch failed:', err);
      }
    }, 10000);
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
            <p>{currentAudio.type.split('/')[1].toUpperCase()} • {Math.round(currentAudio.size / 1024)} KB</p>
            {currentAudio.duration > 0 && (
              <p>Duration: {Math.floor(currentAudio.duration / 60)}:{Math.floor(currentAudio.duration % 60).toString().padStart(2, '0')}</p>
            )}
          </div>
        )}
        {audioMode === 'stream' && metadata.artist && (
          <p className="text-sm text-gray-400 mt-1">
            {metadata.artist} • {metadata.album}
          </p>
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
};

export default RadioPlayer;
