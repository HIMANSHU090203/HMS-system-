// Test JWT token generation and validation
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

async function testJWT() {
  try {
    console.log('🧪 Testing JWT token generation and validation...\n');

    // Generate a token
    const payload = {
      userId: 'cmhcxf7za0005wuyk46pfdx49',
      username: 'mohit',
      role: 'ADMIN'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    console.log('✅ Token generated:', token);

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified:', decoded);

    // Test with the actual login response
    console.log('\n🔍 Testing with actual login...');
    
    const axios = require('axios');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'mohit',
      password: '123456'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful, full response:', JSON.stringify(loginResponse.data, null, 2));
      
      const receivedToken = loginResponse.data.data?.accessToken;
      console.log('✅ Received token:', receivedToken);

      if (receivedToken) {
        // Verify the received token
        try {
          const decodedReceived = jwt.verify(receivedToken, JWT_SECRET);
          console.log('✅ Received token verified:', decodedReceived);
        } catch (verifyError) {
          console.log('❌ Received token verification failed:', verifyError.message);
        }
      } else {
        console.log('❌ No accessToken found in response');
      }
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testJWT();
