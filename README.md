# Audio Streamer

A minimal, fast, and responsive single-page web application for streaming online radio stations. Built with React and Tailwind CSS, designed for easy integration into mobile apps via WebView.

## Features

- 🎵 **Stream Online Radio**: Support for Icecast, Shoutcast, and HTTP Live Streaming (HLS)
- 🎵 **Upload Your Own Audio**: Drag & drop or browse to upload MP3, WAV, AAC, OGG, FLAC files
- ▶️ **Play/Pause Controls**: Simple and intuitive audio controls
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🔄 **Auto-Reconnection**: Automatically reconnects if the stream drops
- 🎚️ **Volume Control**: Adjustable volume with visual feedback
- 📊 **Connection Status**: Real-time connection status indicators
- 🔧 **Configurable Streams**: Easy to add custom radio stream URLs
- 🚀 **Fast & Lightweight**: Optimized for performance and minimal resource usage
- 💾 **Local Storage**: Your audio files stay in your browser - no server uploads needed

## Tech Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Tailwind CSS for responsive design
- **Audio**: HTML5 Audio API with custom controls
- **Deployment**: Railway hosting platform
- **CI/CD**: GitHub Actions for automated deployment

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd audio-streamer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Configuration

### Stream URLs

The app comes with demo stream URLs that you can replace with your actual radio streams:

```javascript
// In src/App.js
const defaultStreams = [
  { name: 'Your Radio Station', url: 'https://your-stream-url.com/stream' },
  { name: 'Another Station', url: 'https://another-stream.com/audio' },
];
```

### Supported Stream Formats

- **Icecast**: `http://icecast.example.com:8000/stream`
- **Shoutcast**: `http://shoutcast.example.com:8000/`
- **HTTP Live Streaming (HLS)**: `https://example.com/playlist.m3u8`
- **Direct MP3/AAC**: `https://example.com/stream.mp3`

### Audio Upload Support

- **Formats**: MP3, WAV, AAC, OGG, FLAC
- **Features**: Drag & drop, file browser, duration detection, file size display
- **Storage**: Local browser storage - files never leave your device
- **Usage**: Perfect for personal music, podcasts, or custom audio content

## Deployment

### Railway Deployment

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Login to Railway**:
```bash
railway login
```

3. **Initialize Railway project**:
```bash
railway init
```

4. **Deploy**:
```bash
railway up
```

### GitHub Actions (Automated)

The repository includes a GitHub Actions workflow that automatically deploys to Railway on push to main/master branch.

**Required Secrets**:
- `RAILWAY_TOKEN`: Your Railway authentication token
- `RAILWAY_SERVICE`: Your Railway service ID

## Integration with Bib Kreyòl App

This web app is designed to be embedded in the Bib Kreyòl mobile app via WebView:

### iOS (WKWebView)
```swift
import WebKit

let webView = WKWebView()
let url = URL(string: "https://your-railway-app.railway.app")!
let request = URLRequest(url: url)
webView.load(request)
```

### Android (WebView)
```kotlin
import android.webkit.WebView

val webView = WebView(this)
webView.loadUrl("https://your-railway-app.railway.app")
```

## Performance & Scaling

### Bandwidth Analysis

For **10,000 weekly visitors**:

- **App Size**: ~500KB (gzipped)
- **Per Visit**: ~1-2MB (initial load + minimal updates)
- **Weekly Bandwidth**: ~10-20GB
- **Railway Free Tier**: 100GB/month ✅ **Sufficient**

### Optimization Features

- Lazy loading of components
- Minimal bundle size with React 18
- Efficient audio streaming (no local storage)
- Responsive images and CSS
- Service Worker ready for offline support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Project Structure

```
src/
├── components/
│   ├── RadioPlayer.js      # Main audio player component
│   └── StreamConfig.js     # Stream selection interface
├── App.js                  # Main application component
├── index.js                # React entry point
└── index.css               # Tailwind CSS styles
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Troubleshooting

### Common Issues

1. **Stream won't play**: Check if the stream URL is accessible and supports CORS
2. **Audio quality issues**: Ensure the stream source provides adequate bitrate
3. **Connection drops**: The app automatically attempts reconnection up to 5 times

### Debug Mode

Enable debug logging in the browser console:
```javascript
localStorage.setItem('debug', 'true')
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions:
- Create an issue in this repository
- Check the Railway documentation for deployment issues
- Review the React and Tailwind CSS documentation

---

**Built with ❤️ for the Bib Kreyòl community**
