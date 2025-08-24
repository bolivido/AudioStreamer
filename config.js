// AudioStreamer Configuration - Shoutcast Focused
export const config = {
  // App settings
  appName: 'AudioStreamer',
  appDescription: 'Stream live Shoutcast radio stations with real-time metadata',
  
  // Shoutcast radio stream URLs
  defaultStreams: [
    { 
      name: '🎵 Radio Paradise', 
      url: 'https://stream.radioparadise.com/aac-64',
      description: 'Eclectic mix with rich Shoutcast metadata'
    },
    { 
      name: '📻 SomaFM Groove Salad', 
      url: 'https://ice1.somafm.com/groovesalad-64-mp3',
      description: 'Ambient beats with live metadata'
    },
    { 
      name: '🎧 SomaFM Drone Zone', 
      url: 'https://ice1.somafm.com/dronezone-64-mp3',
      description: 'Atmospheric textures and ambient music'
    },
    { 
      name: '🌿 SomaFM Lush', 
      url: 'https://ice1.somafm.com/lush-64-mp3',
      description: 'Female vocals and indie music'
    },
    { 
      name: '🇬🇧 NTS Radio 1', 
      url: 'https://stream.nts.live/nts1',
      description: 'London-based independent radio'
    },
    { 
      name: '🇫🇷 FIP Radio', 
      url: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      description: 'French eclectic music station'
    },
    { 
      name: '🚀 Railway Shoutcast Server', 
      url: 'https://your-railway-app.railway.app:8000/;',
      description: 'Your custom Shoutcast server for testing metadata parsing'
    }
  ],
  
  // Audio settings
  audio: {
    defaultVolume: 0.7,
    fadeInDuration: 500,
    fadeOutDuration: 500,
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
  supportedFormats: ['mp3', 'aac', 'ogg'],
  
  // Shoutcast specific settings
  shoutcast: {
    metadataEnabled: true,
    icyHeaders: true,
    currentSongEndpoint: true,
    userAgent: 'AudioStreamer/1.0'
  }
};
