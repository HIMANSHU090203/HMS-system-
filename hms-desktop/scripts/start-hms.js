#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🏥 HMS - Hospital Management System');
console.log('=====================================');
console.log('Starting all services...\n');

// Function to run a command
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Main startup function
async function startHMS() {
  try {
    console.log('📋 Available commands:');
    console.log('  npm start          - Start backend + desktop together');
    console.log('  npm run backend    - Start backend only');
    console.log('  npm run desktop    - Start desktop only');
    console.log('  npm run dev        - Alias for npm start');
    console.log('');

    // Check if backend directory exists
    const backendPath = path.join(__dirname, '..', 'backend');
    const fs = require('fs');
    
    if (!fs.existsSync(backendPath)) {
      console.log('❌ Backend directory not found!');
      console.log('Please make sure the backend folder exists.');
      process.exit(1);
    }

    console.log('✅ Backend directory found');
    console.log('🚀 Starting HMS services...\n');

    // Start the services using concurrently
    await runCommand('npm', ['run', 'start']);

  } catch (error) {
    console.error('❌ Error starting HMS:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down HMS services...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down HMS services...');
  process.exit(0);
});

// Start the application
startHMS();
