#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 HMS Complete System Setup & Fix');
console.log('===================================\n');

// Function to run a command and wait for completion
function runCommand(command, args, cwd, name) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Running: ${name}...`);
    const process = spawn(command, args, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${name} completed successfully\n`);
        resolve();
      } else {
        console.log(`❌ ${name} failed with code ${code}\n`);
        reject(new Error(`${name} failed`));
      }
    });
  });
}

// Function to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

// Function to create .env file if it doesn't exist
function createEnvFile(backendDir) {
  const envPath = path.join(backendDir, '.env');
  
  if (!fileExists(envPath)) {
    console.log('📝 Creating .env file...');
    const envContent = `# Database Configuration
DATABASE_URL="postgresql://postgres:Himanshu@123@localhost:5432/hms_database"
DATABASE_USER="postgres"
DATABASE_PASSWORD="Himanshu@123"
DATABASE_HOST="localhost"
DATABASE_PORT="5432"
DATABASE_NAME="hms_database"

# JWT Configuration
JWT_SECRET="hms_jwt_secret_key_2024_secure_random_string_12345"
JWT_REFRESH_SECRET="hms_refresh_secret_key_2024_secure_random_string_67890"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT="3000"
NODE_ENV="development"
API_BASE_URL="http://localhost:3000/api"

# Application Configuration
APP_NAME="HMS Desktop"
APP_VERSION="1.0.0"
HOSPITAL_NAME="Your Hospital Name"
HOSPITAL_ADDRESS="Your Hospital Address"

# Security Configuration
BCRYPT_ROUNDS="12"
CORS_ORIGIN="http://localhost:3000"
SESSION_SECRET="hms_session_secret_2024_secure_random_string"

# File Upload Configuration
MAX_FILE_SIZE="10MB"
UPLOAD_PATH="./uploads"

# Logging Configuration
LOG_LEVEL="info"
LOG_FILE_PATH="./logs/hms.log"

# System Configuration
DEFAULT_PAGE_SIZE="20"
MAX_PAGE_SIZE="100"
DEFAULT_TAX_RATE="18"

# Development Configuration
DEBUG="true"
ENABLE_SWAGGER="true"
ENABLE_LOGGING="true"
`;

    try {
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created successfully\n');
    } catch (error) {
      console.log('❌ Failed to create .env file:', error.message);
    }
  } else {
    console.log('✅ .env file already exists\n');
  }
}

async function setupCompleteSystem() {
  try {
    const backendDir = path.join(__dirname, '../backend');
    
    console.log('🔧 Step 1: Checking backend directory...');
    if (!fileExists(backendDir)) {
      throw new Error('Backend directory not found');
    }
    console.log('✅ Backend directory found\n');
    
    console.log('🔧 Step 2: Creating environment file...');
    createEnvFile(backendDir);
    
    console.log('🔧 Step 3: Installing backend dependencies...');
    await runCommand('npm', ['install'], backendDir, 'Backend Dependencies');
    
    console.log('🔧 Step 4: Generating Prisma client...');
    await runCommand('npm', ['run', 'prisma:generate'], backendDir, 'Prisma Client Generation');
    
    console.log('🔧 Step 5: Running database migrations...');
    await runCommand('npm', ['run', 'prisma:migrate'], backendDir, 'Database Migration');
    
    console.log('🔧 Step 6: Seeding database with initial data...');
    await runCommand('npm', ['run', 'prisma:seed'], backendDir, 'Database Seeding');
    
    console.log('🔧 Step 7: Adding sample users (doctors, staff)...');
    await runCommand('node', ['src/scripts/addSampleUsers.js'], backendDir, 'Sample Users');
    
    console.log('🔧 Step 8: Installing frontend dependencies...');
    await runCommand('npm', ['install'], path.join(__dirname, '..'), 'Frontend Dependencies');
    
    console.log('🎉 Complete system setup finished successfully!\n');
    
    console.log('📋 What has been set up:');
    console.log('✅ Backend dependencies installed');
    console.log('✅ Database schema created and migrated');
    console.log('✅ Initial data seeded (admin user, medicines, test catalog)');
    console.log('✅ Sample doctors and staff added');
    console.log('✅ Frontend dependencies installed');
    console.log('✅ Environment configuration created');
    
    console.log('\n🚀 How to start the system:');
    console.log('');
    console.log('Terminal 1 - Start Backend:');
    console.log('  cd hms-desktop/backend');
    console.log('  npm run dev');
    console.log('');
    console.log('Terminal 2 - Start Frontend:');
    console.log('  cd hms-desktop');
    console.log('  npm start');
    console.log('');
    console.log('🧪 Test the system:');
    console.log('  node hms-desktop/backend/test-system-diagnostic.js');
    
    console.log('\n🔑 Login Credentials:');
    console.log('👨‍💼 Admin: admin / admin123');
    console.log('👨‍⚕️ Doctors: dr.smith, dr.johnson, dr.williams, dr.brown, dr.davis / doctor123');
    console.log('👩‍💼 Staff: receptionist, lab_tech, pharmacist / doctor123');
    
    console.log('\n📊 Available Modules:');
    console.log('✅ Authentication (Login/Logout)');
    console.log('✅ Patient Management (Create, View, Search, Edit)');
    console.log('✅ Appointment Management (Book, View, Filter)');
    console.log('✅ Consultation Management (Create, View, Search)');
    console.log('🔄 Prescription Management (Coming Next)');
    console.log('🔄 Lab Test Management (Coming Next)');
    console.log('🔄 Pharmacy Management (Coming Next)');
    console.log('🔄 Billing Management (Coming Next)');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running on localhost:5432');
    console.log('2. Check that you have the correct database credentials');
    console.log('3. Ensure Node.js and npm are installed');
    console.log('4. Try running individual commands:');
    console.log('   cd hms-desktop/backend');
    console.log('   npm install');
    console.log('   npm run prisma:generate');
    console.log('   npm run prisma:migrate');
    console.log('   npm run prisma:seed');
    console.log('   node src/scripts/addSampleUsers.js');
    
    console.log('\n🆘 Common Issues:');
    console.log('• Database connection failed: Check PostgreSQL service');
    console.log('• Migration failed: Drop and recreate the database');
    console.log('• Permission errors: Run as administrator/sudo');
    console.log('• Port conflicts: Change PORT in .env file');
  }
}

// Run the setup
setupCompleteSystem();
