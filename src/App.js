import React, { useState, useEffect } from 'react';
import RadioPlayer from './components/RadioPlayer';
import StreamConfig from './components/StreamConfig';
import AudioUploader from './components/AudioUploader';
import ServerDashboard from './components/ServerDashboard';
import config from './config';

function App() {
  const [streamUrl, setStreamUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlaying, setNowPlaying] = useState('Radio Stream');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [uploadedAudios, setUploadedAudios] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioMode, setAudioMode] = useState('stream'); // 'stream', 'upload', or 'server'
  const [serverUrl] = useState(config.serverUrl);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);

  // Working radio stream URLs - optimized for reliability
  const defaultStreams = config.defaultStreams;

  // Auto-load songs from server when page loads
  useEffect(() => {
    const loadServerSongs = async () => {
      try {
        console.log('🎵 Loading songs from server...');
        setIsLoadingSongs(true);
        const response = await fetch(`${serverUrl}/api/audio`);
        if (response.ok) {
          const serverAudios = await response.json();
          console.log(`🎵 Found ${serverAudios.length} songs on server`);
          
          if (serverAudios.length > 0) {
            // Convert server audio format to match our local format
            const formattedAudios = serverAudios.map(audio => ({
              id: audio.name,
              name: audio.name,
              url: `${serverUrl}/api/stream/${audio.name}`,
              type: audio.mimetype || 'audio/mpeg',
              size: audio.size || 0,
              duration: audio.duration || 0
            }));
            
            setUploadedAudios(formattedAudios);
            
            // Auto-play the first song if auto-play is enabled
            if (config.autoPlay.enabled && formattedAudios.length > 0) {
              console.log('🎵 Auto-playing first song from server');
              handleAutoPlay(formattedAudios[0]);
            }
          }
        }
      } catch (error) {
        console.log('🎵 No songs found on server or server not accessible');
      } finally {
        setIsLoadingSongs(false);
      }
    };

    loadServerSongs();
  }, [serverUrl]); // eslint-disable-line react-hooks/exhaustive-deps


  const handlePlayStateChange = (playing) => {
    setIsPlaying(playing);
    setConnectionStatus(playing ? 'connected' : 'disconnected');
  };

  const handleNowPlayingChange = (title) => {
    setNowPlaying(title);
  };

  const handleConnectionStatusChange = (status) => {
    setConnectionStatus(status);
  };



  const handleAudioRemove = (audioId) => {
    setUploadedAudios(prev => prev.filter(audio => audio.id !== audioId));
    if (currentAudio && currentAudio.id === audioId) {
      setCurrentAudio(null);
      setStreamUrl('');
      setIsPlaying(false);
    }
  };

  const handleAudioSelect = (audio) => {
    setCurrentAudio(audio);
    setStreamUrl(audio.url);
    setAudioMode('upload');
    setIsPlaying(false);
    setConnectionStatus('disconnected');
    setNowPlaying(audio.name);
  };

  const handleAutoPlay = (audio) => {
    console.log(`🎵 Auto-play triggered for: ${audio.name}`);
    console.log(`🎵 Audio URL: ${audio.url}`);
    console.log(`🎵 Current state before auto-play:`, {
      isPlaying,
      connectionStatus,
      streamUrl,
      audioMode
    });
    
    setCurrentAudio(audio);
    setStreamUrl(audio.url);
    setAudioMode('upload');
    setNowPlaying(audio.name);
    
    // Start playing after a short delay
    setTimeout(() => {
      console.log(`🎵 Setting playback state to true`);
      setIsPlaying(true);
      setConnectionStatus('connected');
      
      // Force the RadioPlayer to start playing
      if (audio.url) {
        console.log(`🎵 Starting playback of: ${audio.url}`);
        // The RadioPlayer will automatically start playing when streamUrl changes and isPlaying is true
      }
    }, config.autoPlay.delay);
  };

  const handleStreamSelect = (url) => {
    setStreamUrl(url);
    setCurrentAudio(null);
    setAudioMode('stream');
    setIsPlaying(false);
    setConnectionStatus('disconnected');
    setNowPlaying('Radio Stream');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Audio Streamer
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Stream your favorite online radio stations with a minimal, fast, and responsive interface
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Mode Switcher */}
          <div className="text-center mb-6">
            <div className="inline-flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button
                onClick={() => setAudioMode('stream')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  audioMode === 'stream'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🌐 Online Radio
              </button>
              <button
                onClick={() => setAudioMode('upload')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  audioMode === 'upload'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🎵 Upload Audio
              </button>
              <button
                onClick={() => setAudioMode('server')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  audioMode === 'server'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ⚙️ Server Management
              </button>
            </div>
          </div>

          {/* Audio Uploader */}
          {audioMode === 'upload' && (
            <>
              {/* Loading Indicator */}
              {isLoadingSongs && (
                <div className="mb-4 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg text-center">
                  <div className="inline-flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span className="text-blue-300">Loading songs from server...</span>
                  </div>
                </div>
              )}
              
              <AudioUploader
                onAudioSelect={handleAudioSelect}
                onAudioRemove={handleAudioRemove}
                uploadedAudios={uploadedAudios}
                serverUrl={serverUrl}
                onAutoPlay={handleAutoPlay}
              />
            </>
          )}

          {/* Server Dashboard */}
          {audioMode === 'server' && (
            <ServerDashboard serverUrl={serverUrl} />
          )}

          {/* Stream Configuration */}
          {audioMode === 'stream' && (
            <StreamConfig 
              defaultStreams={defaultStreams}
              onStreamChange={handleStreamSelect}
              currentStream={streamUrl}
            />
          )}

          {/* Radio Player */}
          {streamUrl && (
            <RadioPlayer
              streamUrl={streamUrl}
              onPlayStateChange={handlePlayStateChange}
              onNowPlayingChange={handleNowPlayingChange}
              onConnectionStatusChange={handleConnectionStatusChange}
              isPlaying={isPlaying}
              nowPlaying={nowPlaying}
              connectionStatus={connectionStatus}
              audioMode={audioMode}
              currentAudio={currentAudio}
            />
          )}

          {/* Audio Status Debug */}
          {currentAudio && (
            <div className="mt-4 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">�� Current Audio</h3>
              <div className="text-sm text-blue-200 space-y-1">
                <p><strong>Name:</strong> {currentAudio.name}</p>
                <p><strong>URL:</strong> {currentAudio.url}</p>
                <p><strong>Mode:</strong> {audioMode}</p>
                <p><strong>Playing:</strong> {isPlaying ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Status:</strong> {connectionStatus}</p>
                <p><strong>Stream URL:</strong> {streamUrl}</p>
              </div>
            </div>
          )}

                  {/* Status Display */}
        <div className="mt-6 text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-800 border border-gray-700">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-300 capitalize">
              {connectionStatus}
            </span>
          </div>
          
          {!streamUrl && (
            <div className="text-sm text-gray-400">
              Select a radio stream above to start listening
            </div>
          )}
        </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-400">
          <p className="text-sm">
            Designed for Bib Kreyòl app integration • Built with React & Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
