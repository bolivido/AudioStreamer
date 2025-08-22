// Environment configuration for Audio Streamer
const config = {
  // Server URL - automatically detect Railway domain or use localhost for development
  serverUrl: process.env.REACT_APP_SERVER_URL || 
             (window.location.hostname === 'localhost' ? 'http://localhost:3001' : `https://${window.location.hostname}`),
  
  // API endpoints
  apiEndpoints: {
    upload: '/api/upload',
    audio: '/api/audio',
    stream: '/api/stream',
    storage: '/api/storage',
    cleanup: '/api/cleanup',
    health: '/api/health'
  },
  
  // File upload settings
  upload: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/flac']
  },
  
  // Auto-play settings
  autoPlay: {
    enabled: true,
    delay: 1000, // 1 second delay after upload
    volume: 0.7, // Default volume
    fadeIn: true // Smooth volume fade-in
  },
  
  // Radio streams
  defaultStreams: [
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
  ]
};

export default config;
