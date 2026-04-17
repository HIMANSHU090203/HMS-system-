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
function checkBackendReady(attemptNumber = 0) {
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
          const isReady = res.statusCode === 200 && json.success === true;
          
          // Log success on first successful check
          if (isReady && attemptNumber === 0) {
            console.log(`\n✅ Health check successful! Status: ${res.statusCode}, Success: ${json.success}`);
          }
          
          resolve(isReady);
        } catch (e) {
          // If status is 200 but not JSON, still consider it ready
          if (res.statusCode === 200) {
            console.log(`⚠️  Health check returned 200 but invalid JSON. Response: ${data.substring(0, 100)}`);
            resolve(true);
          } else {
            // Log non-200 status codes for debugging
            if (attemptNumber % 10 === 0) { // Log every 10th attempt to avoid spam
              console.log(`\n⚠️  Health check returned status ${res.statusCode} (attempt ${attemptNumber + 1})`);
            }
            resolve(false);
          }
        }
      });
    });

    req.on('error', (err) => {
      // ECONNREFUSED is expected when server isn't ready yet
      // Log error details every 10th attempt to avoid spam
      if (attemptNumber % 10 === 0) {
        const errorType = err.code || err.message;
        if (errorType === 'ECONNREFUSED') {
          // This is expected, don't log every time
          if (attemptNumber === 0) {
            console.log(`\n🔍 Waiting for backend to start (connection refused is normal at this stage)...`);
          }
        } else {
          // Log unexpected errors
          console.log(`\n⚠️  Health check error (attempt ${attemptNumber + 1}): ${err.code || err.message}`);
        }
      }
      resolve(false);
    });

    req.setTimeout(5000, () => {
      // Increased timeout to 5 seconds for slower systems
      if (attemptNumber % 10 === 0) {
        console.log(`\n⏱️  Health check timeout (attempt ${attemptNumber + 1})`);
      }
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
    const isReady = await checkBackendReady(checkCount);
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
  console.log(`\n🔍 Diagnostic information:`);
  console.log(`   - Health check URL: ${BACKEND_URL}`);
  console.log(`   - Total attempts: ${checkCount}`);
  console.log(`   - Elapsed time: ${Math.round((Date.now() - startTime) / 1000)}s`);
  console.log(`\n💡 Troubleshooting steps:`);
  console.log(`   1. Check if backend process is still running`);
  console.log(`   2. Verify backend is listening on port 3000: curl http://localhost:3000/health`);
  console.log(`   3. Check for TypeScript compilation errors in backend logs`);
  console.log(`   4. Ensure database is running and accessible`);
  return false;
}

// Start backend
function startBackend() {
  console.log('🚀 Starting backend server...');
  const backendDir = path.join(__dirname, '..', 'hms-desktop', 'backend');
  
  console.log(`   Backend directory: ${backendDir}`);
  console.log(`   Command: npm run dev`);
  
  backendProcess = spawn('npm', ['run', 'dev'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  backendProcess.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
    console.error('   Error details:', error);
    process.exit(1);
  });

  backendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n❌ Backend process exited with code ${code}`);
      console.error('   This usually indicates a compilation error or runtime crash.');
      console.error('   Check the backend logs above for details.');
    }
  });

  // Log when backend process starts
  console.log('   Backend process started (PID: ' + backendProcess.pid + ')');
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

