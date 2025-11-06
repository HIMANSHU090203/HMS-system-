// Start backend first, wait for it to be ready, then start desktop
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const BACKEND_URL = 'http://localhost:3000/health';
const MAX_WAIT_TIME = 60000; // 60 seconds (increased for ts-node compilation)
const CHECK_INTERVAL = 2000; // Check every 2 seconds
const INITIAL_DELAY = 5000; // Wait 5 seconds before first check (give ts-node time to start)

let backendProcess = null;
let desktopProcess = null;

// Check if backend is ready
function checkBackendReady() {
  return new Promise((resolve) => {
    const req = http.get(BACKEND_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        // Check if response is valid JSON with success: true
        try {
          const json = JSON.parse(data);
          resolve(res.statusCode === 200 && json.success === true);
        } catch (e) {
          resolve(res.statusCode === 200);
        }
      });
    });

    req.on('error', (err) => {
      // ECONNREFUSED is expected when server isn't ready yet
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Wait for backend to be ready
async function waitForBackend() {
  console.log('⏳ Waiting for backend server to be ready...');
  console.log(`   (This may take up to ${MAX_WAIT_TIME / 1000} seconds for TypeScript compilation)`);
  
  // Give the backend process time to start compiling
  await new Promise(resolve => setTimeout(resolve, INITIAL_DELAY));
  
  const startTime = Date.now();
  let checkCount = 0;

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    const isReady = await checkBackendReady();
    if (isReady) {
      console.log(`\n✅ Backend server is ready! (took ${Math.round((Date.now() - startTime) / 1000)}s)`);
      return true;
    }
    checkCount++;
    if (checkCount % 5 === 0) {
      // Show progress every 10 seconds
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      process.stdout.write(` (${elapsed}s)`);
    } else {
      process.stdout.write('.');
    }
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }

  console.log(`\n❌ Backend server did not start within ${MAX_WAIT_TIME / 1000} seconds`);
  console.log('   Check the backend logs above for compilation errors.');
  return false;
}

// Start backend
function startBackend() {
  console.log('🚀 Starting backend server...');
  const backendDir = path.join(__dirname, '..', 'hms-desktop', 'backend');
  
  backendProcess = spawn('npm', ['run', 'dev'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true
  });

  backendProcess.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
  });

  backendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ Backend process exited with code ${code}`);
    }
  });
}

// Start desktop
function startDesktop() {
  console.log('🖥️  Starting desktop application...');
  const desktopDir = path.join(__dirname, '..', 'hms-desktop');
  
  desktopProcess = spawn('npm', ['run', 'start:desktop-only'], {
    cwd: desktopDir,
    stdio: 'inherit',
    shell: true
  });

  desktopProcess.on('error', (error) => {
    console.error('❌ Failed to start desktop:', error.message);
    if (backendProcess) {
      backendProcess.kill();
    }
    process.exit(1);
  });

  desktopProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`Desktop process exited with code ${code}`);
    }
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  if (backendProcess) backendProcess.kill();
  if (desktopProcess) desktopProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  if (backendProcess) backendProcess.kill();
  if (desktopProcess) desktopProcess.kill();
  process.exit(0);
});

// Main execution
async function main() {
  try {
    // Start backend first
    startBackend();

    // Wait for backend to be ready
    const backendReady = await waitForBackend();
    
    if (!backendReady) {
      console.error('❌ Failed to start backend. Exiting...');
      if (backendProcess) backendProcess.kill();
      process.exit(1);
    }

    // Start desktop after backend is ready
    startDesktop();

    console.log('\n✅ Both services are running!');
    console.log('   - Backend: http://localhost:3000');
    console.log('   - Desktop: Electron app window');
    console.log('\nPress Ctrl+C to stop both services.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (backendProcess) backendProcess.kill();
    if (desktopProcess) desktopProcess.kill();
    process.exit(1);
  }
}

main();

