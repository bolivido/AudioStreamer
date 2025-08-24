import React, { useState, useEffect, useRef, useCallback } from 'react';

const RadioPlayer = ({ 
  streamUrl, 
  onPlayStateChange, 
  onNowPlayingChange, 
  onConnectionStatusChange,
  isPlaying,
  nowPlaying,
  connectionStatus
}) => {
  const audioRef = useRef(null);
  const metadataIntervalRef = useRef(null);
  
  const [volume, setVolume] = useState(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
    };
  }, []);

  const fetchShoutcastMetadata = useCallback(async (streamUrl) => {
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
  }, [onNowPlayingChange]);

  const stopMetadataPolling = useCallback(() => {
    if (metadataIntervalRef.current) {
      clearInterval(metadataIntervalRef.current);
      metadataIntervalRef.current = null;
    }
  }, []);

  const startMetadataPolling = useCallback(() => {
    // Poll for Shoutcast metadata every 10 seconds
    metadataIntervalRef.current = setInterval(async () => {
      try {
        if (audioRef.current && !audioRef.current.paused && streamUrl) {
          await fetchShoutcastMetadata(streamUrl);
        }
      } catch (err) {
        console.warn('Metadata fetch failed:', err);
      }
    }, 10000);
  }, [streamUrl, fetchShoutcastMetadata]);

  const handlePlay = useCallback(async () => {
    if (!streamUrl || !audioRef.current) return;

    try {
      setIsLoading(true);
      setError(null);
      onConnectionStatusChange('connecting');

      // Set up audio element
      audioRef.current.src = streamUrl;
      audioRef.current.crossOrigin = 'anonymous';
      
      // Start playback
      await audioRef.current.play();
      
      onPlayStateChange(true);
      onConnectionStatusChange('connected');
      startMetadataPolling();
      
      console.log(`🎵 Stream started: ${streamUrl}`);
    } catch (err) {
      console.error('Play error:', err);
      setError('Failed to start stream. Please check the URL and try again.');
      onConnectionStatusChange('disconnected');
      onPlayStateChange(false);
    } finally {
      setIsLoading(false);
    }
  }, [streamUrl, onPlayStateChange, onConnectionStatusChange, startMetadataPolling]);

  // Auto-play when isPlaying becomes true and we have a streamUrl
  useEffect(() => {
    if (isPlaying && streamUrl && audioRef.current) {
      console.log(`🎵 Auto-play triggered for: ${streamUrl}`);
      audioRef.current.crossOrigin = 'anonymous';
      audioRef.current.preload = 'auto';
      handlePlay();
    }
  }, [isPlaying, streamUrl, handlePlay]);

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
    setError('Stream error occurred. Please check your connection and try again.');
    onConnectionStatusChange('disconnected');
    onPlayStateChange(false);
    stopMetadataPolling();
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // 🛡️ FINAL SAFETY: Wrap the render in try-catch to prevent any unexpected crashes
  try {
    return (
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">🎵 Shoutcast Radio Player</h2>
          <p className="text-lg text-gray-300">Streaming Live Radio</p>
          <p className="text-sm text-gray-400 mt-2">
            {nowPlaying || 'Select a stream to start listening'}
          </p>
        </div>

        {/* Now Playing Display */}
        {metadata.title && (
          <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">🎵 Now Playing</h3>
            <div className="text-center">
              <p className="text-xl text-white font-medium">{metadata.title}</p>
              {metadata.artist && metadata.artist !== 'Radio Station' && (
                <p className="text-lg text-gray-300">{metadata.artist}</p>
              )}
              {metadata.album && (
                <p className="text-sm text-gray-400">{metadata.album}</p>
              )}
            </div>
            
            {/* Stream Information */}
            <div className="text-sm text-gray-400 mt-3 space-y-1">
              {metadata.station && metadata.station !== 'Unknown Station' && (
                <p className="text-xs text-blue-400">
                  📻 {metadata.station}
                  {metadata.genre && metadata.genre !== 'Unknown Genre' && ` • ${metadata.genre}`}
                  {metadata.bitrate && metadata.bitrate !== 'Unknown' && ` • ${metadata.bitrate}`}
                </p>
              )}
            </div>
          </div>
        )}

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

          {/* Stream Source Display */}
          <div className="text-center">
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
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Status Display */}
        <div className="mt-6 text-center space-y-2">
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
