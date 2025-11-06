// Check existing users using mock token
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function checkUsersWithMock() {
  try {
    console.log('🔍 Checking users with mock token...\n');

    // Use mock token to get users
    const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: 'Bearer mock-admin-token' }
    });

    if (usersResponse.data.success) {
      console.log('✅ Users retrieved successfully!');
      console.log('Users:', JSON.stringify(usersResponse.data.data.users, null, 2));
    } else {
      console.log('❌ Failed to get users:', usersResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkUsersWithMock();

