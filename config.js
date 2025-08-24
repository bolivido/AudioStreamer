// Audio Streamer Configuration
export const config = {
  // App settings
  appName: 'Audio Streamer',
  appDescription: 'Stream your favorite online radio stations',
  
  // Working radio stream URLs - optimized for reliability
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
    },
    { 
      name: 'DI.FM Chillout', 
      url: 'https://ice1.somafm.com/dronezone-64-mp3',
      description: 'Chillout music - Shoutcast compatible'
    },
    { 
      name: 'Groove Salad Classic', 
      url: 'https://ice1.somafm.com/groovesalad-64-mp3',
      description: 'Classic ambient - metadata rich'
    },
    { 
      name: '🔄 My Test Shoutcast Server', 
      url: 'http://localhost:8000/;',
      description: 'Local Shoutcast server for testing metadata parsing'
    }
  ],
  
  // Audio settings
  audio: {
    defaultVolume: 0.7,
    fadeInDuration: 500,
    fadeOutDuration: 500,
  },
  
  // Auto-play settings
  autoPlay: {
    enabled: false, // Set to true to auto-play first song
    delay: 1000, // Delay before starting playback (ms)
  },
  
  // Reconnection settings
  reconnection: {
    maxAttempts: 5,
    delay: 3000, // 3 seconds
    backoffMultiplier: 1.5,
  },
  
  // Metadata polling
  metadata: {
    pollInterval: 10000, // 10 seconds
    enabled: true,
  },
  
  // UI settings
  ui: {
    theme: 'dark',
    animations: true,
    showStreamUrl: true,
    showConnectionStatus: true,
  },
  
  // Supported stream formats
  supportedFormats: [
    'icecast',
    'shoutcast', 
    'hls',
    'mp3',
    'aac',
    'ogg'
  ],
  
  // CORS settings for development
  cors: {
    mode: 'cors',
    credentials: 'omit',
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  config.ui.showStreamUrl = true;
  config.metadata.enabled = true;
}

export default config;
