import React, { useState } from 'react';

const StreamConfig = ({ defaultStreams, onStreamChange, currentStream }) => {
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleStreamSelect = (stream) => {
    onStreamChange(stream.url);
    setShowCustomInput(false);
    setCustomUrl('');
  };

  const handleCustomUrlSubmit = (e) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onStreamChange(customUrl.trim());
      setShowCustomInput(false);
      setCustomUrl('');
    }
  };

  const handleCustomUrlChange = (e) => {
    setCustomUrl(e.target.value);
  };

  const isCurrentStream = (url) => {
    return currentStream === url;
  };

  return (
    <div className="card mb-6">
      <h2 className="text-xl font-semibold text-white mb-4 text-center">
        Select Radio Stream
      </h2>

      {/* Predefined Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {defaultStreams.map((stream, index) => (
          <button
            key={index}
            onClick={() => handleStreamSelect(stream)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              isCurrentStream(stream.url)
                ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                : 'border-gray-600 hover:border-gray-500 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white'
            }`}
          >
            <div className="font-medium">{stream.name}</div>
            {stream.description && (
              <div className="text-sm text-gray-300 mt-1">
                {stream.description}
              </div>
            )}
            <div className="text-sm text-gray-400 mt-1 truncate">
              {stream.url}
            </div>
            {isCurrentStream(stream.url) && (
              <div className="text-primary-400 text-xs mt-2 flex items-center">
                <span className="w-2 h-2 bg-primary-400 rounded-full mr-2 animate-pulse"></span>
                Currently Selected
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Custom URL Input */}
      <div className="text-center">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="btn-secondary"
          >
            + Add Custom Stream URL
          </button>
        ) : (
          <form onSubmit={handleCustomUrlSubmit} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={customUrl}
                onChange={handleCustomUrlChange}
                placeholder="https://example.com/stream"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                Add Stream
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomUrl('');
              }}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>Supported formats: Icecast, Shoutcast, HTTP Live Streaming (HLS)</p>
        <p className="mt-1">The stream will automatically reconnect if the connection drops</p>
        <p className="mt-1 text-green-400">✅ Try the pre-configured streams above - they are tested and working!</p>
        
        {/* Troubleshooting Tips */}
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-yellow-400 font-medium mb-2">💡 Troubleshooting Tips:</p>
          <ul className="text-xs text-gray-300 text-left space-y-1">
            <li>• Try different stations if one doesn't load</li>
            <li>• Check your internet connection</li>
            <li>• Some streams may take 10-15 seconds to start</li>
            <li>• Lower bitrate streams (64k) load faster than high bitrate (128k+)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StreamConfig;
