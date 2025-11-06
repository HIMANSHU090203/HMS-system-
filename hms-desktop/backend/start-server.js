// Simple server startup script
console.log('Starting HMS Backend Server...');

try {
  // Load environment variables
  require('dotenv').config();
  console.log('✅ Environment variables loaded');
  
  // Test database connection
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  console.log('Testing database connection...');
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connected successfully');
      return prisma.$disconnect();
    })
    .then(() => {
      console.log('✅ Database disconnected successfully');
      console.log('🚀 Starting Express server...');
      
      // Start the actual server using ts-node
      const { spawn } = require('child_process');
      const server = spawn('npx', ['ts-node', 'src/index.ts'], { 
        stdio: 'inherit',
        shell: true 
      });
      
      server.on('error', (err) => {
        console.error('❌ Server process error:', err.message);
      });
      
      server.on('exit', (code) => {
        console.log(`Server process exited with code ${code}`);
      });
    })
    .catch(err => {
      console.error('❌ Database connection failed:', err.message);
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ Server startup failed:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}
