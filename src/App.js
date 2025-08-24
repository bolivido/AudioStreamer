import React, { useState } from 'react';
import RadioPlayer from './components/RadioPlayer';
import StreamConfig from './components/StreamConfig';
import config from './config';

function App() {
  const [streamUrl, setStreamUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlaying, setNowPlaying] = useState('Select a Shoutcast Stream');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Shoutcast radio stream URLs
  const defaultStreams = config.defaultStreams;

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

  const handleStreamSelect = (stream) => {
    setStreamUrl(stream.url);
    setNowPlaying(stream.name);
    setIsPlaying(false);
    setConnectionStatus('disconnected');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎵 AudioStreamer
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Shoutcast Radio Streaming
          </p>
          <p className="text-gray-400">
            Stream live radio stations with real-time metadata
          </p>
        </div>

        {/* Stream Selection */}
        <div className="mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              📻 Available Shoutcast Streams
            </h2>
            <p className="text-gray-400 mb-6">
              Choose from our curated selection of live radio stations
            </p>
          </div>
        </div>

        {/* Stream Configuration */}
        <StreamConfig 
          defaultStreams={defaultStreams}
          onStreamChange={handleStreamSelect}
          currentStream={streamUrl}
        />

        {/* Radio Player - Only render when we have a stream URL */}
        {streamUrl && (
          <RadioPlayer
            streamUrl={streamUrl}
            onPlayStateChange={handlePlayStateChange}
            onNowPlayingChange={handleNowPlayingChange}
            onConnectionStatusChange={handleConnectionStatusChange}
            isPlaying={isPlaying}
            nowPlaying={nowPlaying}
            connectionStatus={connectionStatus}
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
              Select a Shoutcast stream above to start listening
            </div>
          )}
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
