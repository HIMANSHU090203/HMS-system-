const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 HMS COMPLETE SYSTEM VALIDATION');
console.log('==================================');
console.log('Validating the entire role-based HMS system...\n');

// Configuration
const config = {
  backendPort: 3001,
  frontendPort: 3000,
  testTimeout: 30000,
  setupTimeout: 60000
};

let processes = [];

function cleanup() {
  console.log('\n🧹 Cleaning up processes...');
  processes.forEach(proc => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM');
    }
  });
  processes = [];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    
    server.on('error', () => resolve(false));
  });
}

async function waitForService(url, timeout = 30000) {
  const axios = require('axios');
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      await axios.get(url, { timeout: 5000 });
      return true;
    } catch (error) {
      await sleep(2000);
    }
  }
  return false;
}

async function setupDatabase() {
  console.log('📦 Setting up database...');
  
  return new Promise((resolve, reject) => {
    const setupProcess = spawn('node', ['scripts/complete-setup.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    let output = '';
    
    setupProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    setupProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });

    setupProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database setup completed');
        resolve(true);
      } else {
        console.log('❌ Database setup failed');
        reject(new Error('Database setup failed'));
      }
    });

    // Timeout for setup
    setTimeout(() => {
      setupProcess.kill('SIGTERM');
      reject(new Error('Database setup timeout'));
    }, config.setupTimeout);
  });
}

async function startBackend() {
  console.log('🚀 Starting backend server...');
  
  const backendAvailable = await checkPortAvailable(config.backendPort);
  if (!backendAvailable) {
    console.log(`⚠️  Port ${config.backendPort} is already in use`);
    return null;
  }

  return new Promise((resolve, reject) => {
    const backendProcess = spawn('npm', ['start'], {
      cwd: path.join(__dirname, '../backend'),
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'development' }
    });

    processes.push(backendProcess);

    let output = '';
    let started = false;

    backendProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      if (text.includes('Server running on') || text.includes('listening on')) {
        if (!started) {
          started = true;
          console.log('✅ Backend server started');
          resolve(backendProcess);
        }
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log('Backend error:', text);
    });

    backendProcess.on('close', (code) => {
      if (!started) {
        console.log('❌ Backend server failed to start');
        reject(new Error('Backend failed to start'));
      }
    });

    // Timeout for backend start
    setTimeout(() => {
      if (!started) {
        backendProcess.kill('SIGTERM');
        reject(new Error('Backend start timeout'));
      }
    }, 30000);
  });
}

async function runBackendTests() {
  console.log('\n🧪 Running backend tests...');
  
  // Wait for backend to be ready
  const backendReady = await waitForService(`http://localhost:${config.backendPort}/api/health`);
  if (!backendReady) {
    console.log('❌ Backend not ready for testing');
    return false;
  }

  return new Promise((resolve) => {
    const testProcess = spawn('node', ['test-role-based-system.js'], {
      cwd: path.join(__dirname, '../backend'),
      stdio: 'pipe'
    });

    let output = '';
    let success = false;

    testProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
      
      if (text.includes('✅ SYSTEM READY')) {
        success = true;
      }
    });

    testProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });

    testProcess.on('close', (code) => {
      console.log(`\n📊 Backend tests completed with code: ${code}`);
      resolve(success && code === 0);
    });

    // Timeout for tests
    setTimeout(() => {
      testProcess.kill('SIGTERM');
      console.log('⏰ Backend tests timed out');
      resolve(false);
    }, config.testTimeout);
  });
}

async function runFrontendTests() {
  console.log('\n🖥️  Running frontend tests...');
  
  return new Promise((resolve) => {
    const testProcess = spawn('node', ['test-frontend-roles.js'], {
      cwd: path.join(__dirname),
      stdio: 'pipe'
    });

    let output = '';
    let success = false;

    testProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
      
      if (text.includes('✅ ALL TESTS PASSED')) {
        success = true;
      }
    });

    testProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });

    testProcess.on('close', (code) => {
      console.log(`\n📊 Frontend tests completed with code: ${code}`);
      resolve(success && code === 0);
    });

    // Timeout for tests
    setTimeout(() => {
      testProcess.kill('SIGTERM');
      console.log('⏰ Frontend tests timed out');
      resolve(false);
    }, config.testTimeout);
  });
}

async function generateReport(results) {
  console.log('\n📋 GENERATING SYSTEM VALIDATION REPORT');
  console.log('======================================');

  const report = {
    timestamp: new Date().toISOString(),
    system: 'HMS Role-Based Access Control',
    version: '1.0.0',
    results: results,
    summary: {
      totalTests: Object.keys(results).length,
      passedTests: Object.values(results).filter(r => r).length,
      overallSuccess: Object.values(results).every(r => r)
    }
  };

  // Create detailed report
  const reportText = `
# HMS System Validation Report

**Generated:** ${report.timestamp}
**System:** ${report.system}
**Version:** ${report.version}

## Test Results Summary

- **Total Test Suites:** ${report.summary.totalTests}
- **Passed:** ${report.summary.passedTests}
- **Failed:** ${report.summary.totalTests - report.summary.passedTests}
- **Success Rate:** ${((report.summary.passedTests / report.summary.totalTests) * 100).toFixed(1)}%

## Detailed Results

### Database Setup
Status: ${results.databaseSetup ? '✅ PASS' : '❌ FAIL'}

### Backend Server
Status: ${results.backendStart ? '✅ PASS' : '❌ FAIL'}

### Backend Tests
Status: ${results.backendTests ? '✅ PASS' : '❌ FAIL'}

### Frontend Tests
Status: ${results.frontendTests ? '✅ PASS' : '❌ FAIL'}

## System Status

${report.summary.overallSuccess ? `
🎉 **SYSTEM VALIDATION SUCCESSFUL**

The HMS role-based access control system has passed all validation tests:

- ✅ Database is properly configured and seeded
- ✅ Backend server starts and runs correctly
- ✅ Role-based API endpoints work as expected
- ✅ Frontend role permissions are properly implemented
- ✅ User management functionality is operational
- ✅ Authentication and authorization work correctly

The system is ready for production use.
` : `
⚠️ **SYSTEM VALIDATION ISSUES FOUND**

Some components of the HMS system have validation issues:

${!results.databaseSetup ? '- ❌ Database setup failed' : ''}
${!results.backendStart ? '- ❌ Backend server failed to start' : ''}
${!results.backendTests ? '- ❌ Backend tests failed' : ''}
${!results.frontendTests ? '- ❌ Frontend tests failed' : ''}

Please review the test output above and fix the identified issues.
`}

## Next Steps

${report.summary.overallSuccess ? `
1. Deploy the system to your production environment
2. Configure production database connections
3. Set up monitoring and logging
4. Train users on the role-based system
5. Begin using the HMS for hospital management
` : `
1. Review the failed test results above
2. Fix the identified issues
3. Re-run the validation tests
4. Ensure all tests pass before deployment
`}

---
*Report generated by HMS System Validation Suite*
`;

  // Save report to file
  const reportPath = path.join(__dirname, '../validation-report.md');
  fs.writeFileSync(reportPath, reportText);
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return report;
}

async function runCompleteValidation() {
  console.log('Starting complete system validation...\n');
  
  const results = {
    databaseSetup: false,
    backendStart: false,
    backendTests: false,
    frontendTests: false
  };

  try {
    // Setup database
    results.databaseSetup = await setupDatabase();
    
    if (!results.databaseSetup) {
      throw new Error('Database setup failed');
    }

    // Start backend
    const backendProcess = await startBackend();
    results.backendStart = backendProcess !== null;
    
    if (!results.backendStart) {
      throw new Error('Backend failed to start');
    }

    // Wait for backend to be fully ready
    await sleep(5000);
    
    // Run backend tests
    results.backendTests = await runBackendTests();
    
    // Run frontend tests
    results.frontendTests = await runFrontendTests();

  } catch (error) {
    console.log('❌ Validation error:', error.message);
  } finally {
    cleanup();
  }

  // Generate comprehensive report
  const report = await generateReport(results);
  
  console.log('\n🎯 FINAL VALIDATION SUMMARY');
  console.log('===========================');
  console.log(`Database Setup: ${results.databaseSetup ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend Server: ${results.backendStart ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend Tests: ${results.backendTests ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Tests: ${results.frontendTests ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallSuccess = report.summary.overallSuccess;
  console.log(`\n🏆 SYSTEM STATUS: ${overallSuccess ? '✅ READY FOR PRODUCTION' : '❌ NEEDS ATTENTION'}`);
  
  if (overallSuccess) {
    console.log('\n🎉 Congratulations! Your HMS role-based system is fully validated and ready to use!');
  } else {
    console.log('\n⚠️  Please address the issues identified in the validation report.');
  }
  
  process.exit(overallSuccess ? 0 : 1);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Validation interrupted by user');
  cleanup();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  cleanup();
  process.exit(1);
});

// Run the complete validation
runCompleteValidation();
