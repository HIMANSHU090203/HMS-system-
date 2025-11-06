import { authService, patientService, appointmentService } from './index';
import { config } from '../../config/environment';

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing API connection to:', config.API_URL);
    
    // Test health endpoint
    const response = await fetch(`${config.API_URL.replace('/api', '')}/health`);
    const healthData = await response.json();
    
    console.log('Health check response:', healthData);
    
    if (healthData.status === 'OK') {
      console.log('✅ API connection successful');
      return true;
    } else {
      console.log('❌ API health check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};

// Test authentication
export const testAuthentication = async (): Promise<boolean> => {
  try {
    console.log('Testing authentication...');
    
    // Try to login with default admin credentials
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    const result = await authService.login(loginData);
    
    if (result.accessToken) {
      console.log('✅ Authentication successful');
      console.log('User:', result.user);
      
      // Store tokens
      authService.storeTokens(result.accessToken, result.refreshToken);
      
      return true;
    } else {
      console.log('❌ Authentication failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return false;
  }
};

// Test patient service
export const testPatientService = async (): Promise<boolean> => {
  try {
    console.log('Testing patient service...');
    
    // Get patients
    const patients = await patientService.getPatients({ limit: 5 });
    console.log('✅ Patient service working');
    console.log('Patients:', patients);
    
    return true;
  } catch (error) {
    console.error('❌ Patient service test failed:', error);
    return false;
  }
};

// Test appointment service
export const testAppointmentService = async (): Promise<boolean> => {
  try {
    console.log('Testing appointment service...');
    
    // Get appointments
    const appointments = await appointmentService.getAppointments({ limit: 5 });
    console.log('✅ Appointment service working');
    console.log('Appointments:', appointments);
    
    return true;
  } catch (error) {
    console.error('❌ Appointment service test failed:', error);
    return false;
  }
};

// Run all tests
export const runApiTests = async (): Promise<void> => {
  console.log('🚀 Starting API integration tests...');
  
  const tests = [
    { name: 'API Connection', test: testApiConnection },
    { name: 'Authentication', test: testAuthentication },
    { name: 'Patient Service', test: testPatientService },
    { name: 'Appointment Service', test: testAppointmentService },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, test } of tests) {
    console.log(`\n📋 Testing ${name}...`);
    const result = await test();
    
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('🎉 All API tests passed! Integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the backend server and configuration.');
  }
};
