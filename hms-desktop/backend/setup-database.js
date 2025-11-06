const readline = require('readline');
const fs = require('fs');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🏥 HMS Database Setup Helper');
console.log('============================');
console.log('This script will help you configure the database connection.\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function testDatabaseConnection(databaseUrl) {
  return new Promise((resolve) => {
    // Create a temporary test script
    const testScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: '${databaseUrl}'
    }
  }
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
`;

    fs.writeFileSync('temp-db-test.js', testScript);
    
    exec('node temp-db-test.js', (error, stdout, stderr) => {
      fs.unlinkSync('temp-db-test.js'); // Clean up
      
      if (error) {
        console.log(stdout);
        console.log(stderr);
        resolve(false);
      } else {
        console.log(stdout);
        resolve(true);
      }
    });
  });
}

async function setupDatabase() {
  console.log('Let\'s configure your PostgreSQL database connection:\n');
  
  // Get database details
  const host = await askQuestion('Database host (default: localhost): ') || 'localhost';
  const port = await askQuestion('Database port (default: 5432): ') || '5432';
  const database = await askQuestion('Database name (default: hms_database): ') || 'hms_database';
  const username = await askQuestion('Database username (default: postgres): ') || 'postgres';
  const password = await askQuestion('Database password: ');
  
  // Construct database URL
  const databaseUrl = password 
    ? `postgresql://${username}:${password}@${host}:${port}/${database}`
    : `postgresql://${username}@${host}:${port}/${database}`;
  
  console.log(`\n🔍 Testing connection: ${databaseUrl.replace(/:([^:@]+)@/, ':****@')}`);
  
  const isConnected = await testDatabaseConnection(databaseUrl);
  
  if (isConnected) {
    // Create .env file
    const envContent = `# Database Configuration
DATABASE_URL="${databaseUrl}"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"

# Bcrypt Configuration
BCRYPT_ROUNDS="12"

# Server Configuration
NODE_ENV="development"
PORT="3000"

# Hospital Configuration
HOSPITAL_NAME="Your Hospital Name"
HOSPITAL_ADDRESS="123 Hospital Street, City, State"
HOSPITAL_PHONE="+1-234-567-8900"
HOSPITAL_EMAIL="info@yourhospital.com"
`;

    fs.writeFileSync('.env', envContent);
    console.log('\n✅ .env file created successfully!');
    console.log('\n🚀 You can now start the server with: npm start');
    console.log('📝 Or run migrations with: npm run prisma:migrate');
    
  } else {
    console.log('\n❌ Database connection failed. Please check your credentials and try again.');
    console.log('\nCommon issues:');
    console.log('- Make sure PostgreSQL is running');
    console.log('- Check if the database exists');
    console.log('- Verify username and password');
    console.log('- Ensure the user has access to the database');
  }
  
  rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Setup cancelled by user');
  rl.close();
  process.exit(0);
});

setupDatabase().catch(error => {
  console.error('❌ Setup error:', error);
  rl.close();
  process.exit(1);
});
