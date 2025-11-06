// Check existing users in the database
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users...\n');

    // Try to get setup status
    const setupResponse = await axios.get(`${API_BASE_URL}/config/setup-status`);
    console.log('Setup status:', JSON.stringify(setupResponse.data, null, 2));

    // Try different admin credentials
    const credentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'admin', password: 'admin' },
      { username: 'administrator', password: 'admin123' },
      { username: 'system', password: 'admin123' }
    ];

    for (const cred of credentials) {
      try {
        console.log(`\nTrying login with: ${cred.username}/${cred.password}`);
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, cred);
        
        if (loginResponse.data.success) {
          console.log('✅ Login successful!');
          console.log('User data:', JSON.stringify(loginResponse.data.data.user, null, 2));
          return;
        }
      } catch (err) {
        console.log('❌ Login failed:', err.response?.data?.message || err.message);
      }
    }

    console.log('\n❌ No valid credentials found');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkUsers();

