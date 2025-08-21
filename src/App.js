import React, { useState } from 'react';
import RadioPlayer from './components/RadioPlayer';
import StreamConfig from './components/StreamConfig';
import AudioUploader from './components/AudioUploader';
import ServerDashboard from './components/ServerDashboard';

function App() {
  const [streamUrl, setStreamUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlaying, setNowPlaying] = useState('Radio Stream');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [uploadedAudios, setUploadedAudios] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioMode, setAudioMode] = useState('stream'); // 'stream', 'upload', or 'server'
  const [serverUrl] = useState('http://localhost:3001');

  // Working radio stream URLs - optimized for reliability
  const defaultStreams = [
    { 
      name: 'Radio Paradise (Fast)', 
      url: 'https://stream.radioparadise.com/aac-64',
      description: 'Eclectic mix - optimized for speed'
    },
    { 
      name: 'SomaFM Groove Salad', 
      url: 'https://ice1.somafm.com/groovesalad-64-mp3',
      description: 'Ambient beats - faster loading'
    },
    { 
      name: 'SomaFM Drone Zone', 
      url: 'https://ice1.somafm.com/dronezone-64-mp3',
      description: 'Atmospheric textures - optimized'
    },
    { 
      name: 'SomaFM Lush', 
      url: 'https://ice1.somafm.com/lush-64-mp3',
      description: 'Female vocals - faster stream'
    },
    { 
      name: 'NTS Radio 1', 
      url: 'https://stream.nts.live/nts1',
      description: 'London-based independent radio'
    },
    { 
      name: 'FIP Radio', 
      url: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      description: 'French eclectic music station'
    }
  ];



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
            <AudioUploader
              onAudioSelect={handleAudioSelect}
              onAudioRemove={handleAudioRemove}
              uploadedAudios={uploadedAudios}
              serverUrl={serverUrl}
            />
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
