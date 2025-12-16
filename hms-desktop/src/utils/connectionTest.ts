// Connection test utility for debugging backend connectivity
import apiClient from '../lib/api/config';
import { config } from '../config/environment';

export const testBackendConnection = async () => {
  const results = {
    apiUrl: config.API_URL,
    backendHealth: null,
    setupStatus: null,
    errors: []
  };

  try {
    console.log('🔍 Testing backend connection...');
    console.log('📍 API URL:', config.API_URL);

    // Test 1: Health endpoint (no auth required)
    try {
      const healthResponse = await fetch(`${config.API_URL.replace('/api', '')}/health`);
      results.backendHealth = {
        status: healthResponse.status,
        ok: healthResponse.ok,
        data: await healthResponse.json().catch(() => null)
      };
      console.log('✅ Health check:', results.backendHealth);
    } catch (error) {
      results.errors.push({ test: 'health', error: error.message });
      console.error('❌ Health check failed:', error);
    }

    // Test 2: Setup status endpoint (no auth required)
    try {
      const setupResponse = await apiClient.get('/config/setup-status');
      results.setupStatus = {
        status: setupResponse.status,
        data: setupResponse.data
      };
      console.log('✅ Setup status check:', results.setupStatus);
    } catch (error) {
      results.errors.push({ 
        test: 'setup-status', 
        error: error.message,
        code: error.code,
        response: error.response?.data
      });
      console.error('❌ Setup status check failed:', error);
    }

  } catch (error) {
    results.errors.push({ test: 'general', error: error.message });
    console.error('❌ Connection test failed:', error);
  }

  return results;
};

export default testBackendConnection;
