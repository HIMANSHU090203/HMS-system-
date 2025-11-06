// Wait for backend to be ready before starting desktop app
const http = require('http');

const MAX_RETRIES = 30; // 30 retries = 30 seconds
const RETRY_DELAY = 1000; // 1 second between retries
const BACKEND_URL = 'http://localhost:3000/health';

function checkBackend() {
  return new Promise((resolve, reject) => {
    const req = http.get(BACKEND_URL, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`Backend returned status ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(2000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function waitForBackend() {
  console.log('⏳ Waiting for backend server to be ready...');
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await checkBackend();
      console.log('✅ Backend server is ready!');
      return true;
    } catch (error) {
      if (i < MAX_RETRIES - 1) {
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error('\n❌ Backend server failed to start after 30 seconds');
        console.error('Please check backend logs for errors.');
        return false;
      }
    }
  }
  
  return false;
}

// Run the wait
waitForBackend().then(success => {
  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

