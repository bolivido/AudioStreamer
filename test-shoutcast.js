#!/usr/bin/env node

/**
 * 🎵 Shoutcast Server Test Script
 * Tests your local Shoutcast server before using it with AudioStreamer
 */

const http = require('http');
const https = require('https');

// Configuration
const SHOUTCAST_HOST = 'localhost';
const SHOUTCAST_PORT = 8000;
const WEB_PORT = 8001;

console.log('🎵 Testing Shoutcast Server Setup...\n');

// Test 1: Check if Shoutcast server is running
async function testShoutcastServer() {
  console.log('1️⃣ Testing Shoutcast Server Connection...');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: SHOUTCAST_HOST,
      port: SHOUTCAST_PORT,
      path: '/',
      method: 'HEAD',
      headers: {
        'Icy-MetaData': '1',
        'User-Agent': 'AudioStreamer-Test/1.0'
      }
    }, (res) => {
      console.log(`   ✅ Server responded with status: ${res.statusCode}`);
      
      // Check for Shoutcast headers
      const icyName = res.headers['icy-name'];
      const icyGenre = res.headers['icy-genre'];
      const icyBitrate = res.headers['icy-br'];
      const icyDescription = res.headers['icy-description'];
      
      if (icyName) {
        console.log(`   📻 Station Name: ${icyName}`);
      } else {
        console.log('   ⚠️  No ICY-NAME header found (not a Shoutcast server?)');
      }
      
      if (icyGenre) {
        console.log(`   🎭 Genre: ${icyGenre}`);
      }
      
      if (icyBitrate) {
        console.log(`   🔊 Bitrate: ${icyBitrate}kbps`);
      }
      
      if (icyDescription) {
        console.log(`   📝 Description: ${icyDescription}`);
      }
      
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Connection failed: ${err.message}`);
      console.log('   💡 Make sure your Shoutcast server is running on port 8000');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('   ⏰ Connection timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test 2: Check web interface
async function testWebInterface() {
  console.log('\n2️⃣ Testing Web Interface...');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: SHOUTCAST_HOST,
      port: WEB_PORT,
      path: '/',
      method: 'GET'
    }, (res) => {
      console.log(`   ✅ Web interface accessible: ${res.statusCode}`);
      console.log(`   🌐 Open http://localhost:${WEB_PORT} in your browser`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Web interface not accessible: ${err.message}`);
      console.log('   💡 Check if web=1 and webport=8001 in your sc_serv.conf');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('   ⏰ Web interface timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test 3: Test current song endpoint
async function testCurrentSong() {
  console.log('\n3️⃣ Testing Current Song Endpoint...');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: SHOUTCAST_HOST,
      port: SHOUTCAST_PORT,
      path: '/currentsong',
      method: 'GET',
      headers: {
        'User-Agent': 'AudioStreamer-Test/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && data.trim()) {
          console.log(`   ✅ Current song: "${data.trim()}"`);
        } else {
          console.log('   ⚠️  No current song info available');
        }
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Current song endpoint failed: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('   ⏰ Current song timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test 4: Test stream playback
async function testStreamPlayback() {
  console.log('\n4️⃣ Testing Stream Playback...');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: SHOUTCAST_HOST,
      port: SHOUTCAST_PORT,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'AudioStreamer-Test/1.0'
      }
    }, (res) => {
      if (res.statusCode === 200) {
        console.log('   ✅ Stream is accessible for playback');
        console.log(`   🎵 Stream URL: http://localhost:${SHOUTCAST_PORT}/;`);
      } else {
        console.log(`   ⚠️  Stream returned status: ${res.statusCode}`);
      }
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Stream playback test failed: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('   ⏰ Stream playback timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Shoutcast Server Tests...\n');
  
  const results = await Promise.all([
    testShoutcastServer(),
    testWebInterface(),
    testCurrentSong(),
    testStreamPlayback()
  ]);
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your Shoutcast server is ready for AudioStreamer testing.');
    console.log('\n📱 Next Steps:');
    console.log('   1. Open your AudioStreamer app');
    console.log('   2. Select "🔄 My Test Shoutcast Server" from the radio list');
    console.log('   3. Watch real metadata appear in the player!');
  } else {
    console.log('⚠️  Some tests failed. Check the issues above and fix them.');
    console.log('\n🔧 Common Solutions:');
    console.log('   - Ensure Shoutcast server is running');
    console.log('   - Check firewall settings');
    console.log('   - Verify configuration in sc_serv.conf');
  }
  
  console.log('\n📚 For detailed setup instructions, see SHOUTCAST_SETUP.md');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
