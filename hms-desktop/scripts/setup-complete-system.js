const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 HMS Complete System Setup');
console.log('============================\n');

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

async function setupSystem() {
  try {
    const backendDir = path.join(__dirname, '../backend');
    
    console.log('🔧 Step 1: Installing backend dependencies...');
    await runCommand('npm', ['install'], backendDir, 'Backend Dependencies');
    
    console.log('🗄️ Step 2: Running database migrations...');
    await runCommand('npm', ['run', 'prisma:migrate'], backendDir, 'Database Migration');
    
    console.log('🌱 Step 3: Seeding database with initial data...');
    await runCommand('npm', ['run', 'prisma:seed'], backendDir, 'Database Seeding');
    
    console.log('👨‍⚕️ Step 4: Adding sample doctors and users...');
    await runCommand('node', ['src/scripts/addSampleUsers.js'], backendDir, 'Sample Users');
    
    console.log('🎉 System setup completed successfully!');
    console.log('\n📋 What\'s been set up:');
    console.log('✅ Backend dependencies installed');
    console.log('✅ Database schema created and migrated');
    console.log('✅ Initial data seeded (admin user, medicines, test catalog)');
    console.log('✅ Sample doctors and staff added');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Start the backend server:');
    console.log('   cd backend && npm run dev');
    console.log('');
    console.log('2. In another terminal, start the frontend:');
    console.log('   npm start');
    console.log('');
    console.log('3. Test the API endpoints:');
    console.log('   node backend/test-appointment-workflow.js');
    
    console.log('\n🔑 Login Credentials:');
    console.log('👨‍💼 Admin: admin / admin123');
    console.log('👨‍⚕️ Doctors: dr.smith, dr.johnson, dr.williams, dr.brown, dr.davis / doctor123');
    console.log('👩‍💼 Staff: receptionist, lab_tech, pharmacist / doctor123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running on localhost:5432');
    console.log('2. Check that the database "hms_database" exists');
    console.log('3. Verify the backend/.env file exists with correct credentials');
    console.log('4. Try running setup steps manually:');
    console.log('   cd backend');
    console.log('   npm install');
    console.log('   npm run prisma:migrate');
    console.log('   npm run prisma:seed');
    console.log('   node src/scripts/addSampleUsers.js');
  }
}

// Run the setup
setupSystem();
