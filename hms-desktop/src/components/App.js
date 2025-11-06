import React, { useState, useEffect } from 'react';
import { config } from '../config/environment';
import authService from '../lib/api/services/authService';
import configService from '../lib/api/services/configService';
import { hasModuleAccess } from '../lib/utils/rolePermissions';
import LoginForm from './auth/LoginForm';
import RoleBasedDashboard from './dashboard/RoleBasedDashboard';
import PatientManagement from './patients/PatientManagement';
import AppointmentManagement from './appointments/AppointmentManagement';
import ConsultationManagement from './consultations/ConsultationManagement';
import UserManagement from './users/UserManagement';
import PrescriptionManagement from './prescriptions/PrescriptionManagement';
import LabTestManagement from './labTests/LabTestManagement';
import LoadingSpinner from './common/LoadingSpinner';
import ConfigurationManagement from './config/ConfigurationManagement';
import CatalogManagement from './config/CatalogManagement';
import HospitalSetupWizard from './setup/HospitalSetupWizard';
import UserOnboardingWizard from './setup/UserOnboardingWizard';
import InfoButton from './common/InfoButton';
import { getInfoContent } from '../lib/infoContent';
import MedicineManagement from './medicines/MedicineManagement.jsx';
import BillingManagement from './billing/BillingManagement';
import IPDManagement from './ipd/IPDManagement';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [currentAction, setCurrentAction] = useState(null);
  const [setupState, setSetupState] = useState(null); // null, 'checking', 'hospitalSetup', 'userOnboarding', 'ready', 'backendOffline'
  const [backendRetryCount, setBackendRetryCount] = useState(0);
  const [retryIntervalId, setRetryIntervalId] = useState(null);

  useEffect(() => {
    checkSetupState();
  }, []);

  // Separate effect for auto-retry when backend is offline
  useEffect(() => {
    if (setupState === 'backendOffline') {
      console.log('🔄 Setting up automatic retry for backend connection...');
      
      const intervalId = setInterval(() => {
        console.log('🔄 Auto-retrying backend connection...');
        checkSetupState();
      }, 3000); // Retry every 3 seconds
      
      setRetryIntervalId(intervalId);
      
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    } else {
      // Clear interval when backend is connected
      if (retryIntervalId) {
        clearInterval(retryIntervalId);
        setRetryIntervalId(null);
      }
    }
    // Note: checkSetupState is stable and doesn't need to be in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setupState]);

  const checkSetupState = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Checking backend connection...');
      console.log('API URL:', config.API_URL);
      
      // Add timeout to prevent hanging (reduced to 3 seconds for faster retries)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Setup check timeout - Backend not responding')), 3000)
      );
      
      const statusPromise = configService.checkSetupStatus();
      const status = await Promise.race([statusPromise, timeoutPromise]);
      
      console.log('✅ Backend connection successful');
      console.log('Setup status:', status);
      
      // Reset retry count on successful connection
      setBackendRetryCount(0);
      
      // If no hospital config, show hospital setup wizard
      if (!status.hasHospitalConfig) {
        setSetupState('hospitalSetup');
      }
      // If hospital config exists but no users, show user onboarding wizard
      else if (status.hasUsers === false) {
        setSetupState('userOnboarding');
      }
      // Everything is set up, check authentication
      else {
        setSetupState('ready');
        checkAuthStatus();
      }
    } catch (error) {
      const isNetworkError = error.code === 'ERR_NETWORK' || 
          error.message?.includes('Network Error') || 
          error.message?.includes('ERR_CONNECTION_REFUSED') ||
          error.message?.includes('timeout') ||
          error.message?.includes('Backend not responding') ||
          error.message?.includes('fetch failed') ||
          error.code === 'ECONNREFUSED';
      
      // Check if it's a network/connection error
      if (isNetworkError) {
        const newRetryCount = backendRetryCount + 1;
        setBackendRetryCount(newRetryCount);
        
        console.warn(`⚠️ Backend appears to be offline (Retry ${newRetryCount})`);
        console.warn('Error details:', {
          message: error.message,
          code: error.code,
        });
        
        // Only show offline message if we've tried a few times (to avoid flashing during restarts)
        if (newRetryCount >= 2) {
          setSetupState('backendOffline');
        }
        setIsLoading(false);
        return;
      }
      
      // For other errors, log but don't show offline message
      console.error('❌ Setup check failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Fallback to normal authentication flow if setup check fails
      console.log('⚠️ Setup check failed, falling back to auth check');
      setSetupState('ready');
      checkAuthStatus();
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Quick validation: JWT tokens have 3 parts separated by dots
        const tokenParts = token.trim().split('.');
        if (tokenParts.length !== 3) {
          // Invalid token format, clear it without calling API
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return;
        }
        
        // Verify token with backend
        const response = await authService.getCurrentUser();
        if (response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (error) {
      // Check if it's a network error (backend might be restarting)
      const isNetworkError = error.code === 'ERR_NETWORK' || 
          error.message?.includes('Network Error') || 
          error.message?.includes('ERR_CONNECTION_REFUSED') ||
          error.message?.includes('timeout') ||
          error.code === 'ECONNREFUSED';
      
      if (isNetworkError) {
        // Backend might be restarting, don't clear tokens - just wait for retry
        console.warn('⚠️ Backend connection failed during auth check, will retry...');
        return;
      }
      
      // Silently handle expected auth failures (invalid/expired tokens)
      const isAuthError = error.response?.status === 401;
      
      if (isAuthError) {
        // Expected: token is invalid/expired, just clear it silently
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Don't log this as an error - it's expected behavior when tokens expire
        return;
      }
      
      // Only log unexpected errors
      console.error('Auth check failed:', error);
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.user && response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: 'Login failed' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentModule('dashboard');
    setCurrentAction(null);
  };

  const handleNavigation = (module, action = null) => {
    // Check if user has access to the module
    if (user && hasModuleAccess(user.role, module)) {
      setCurrentModule(module);
      setCurrentAction(action);
    } else {
      console.warn(`Access denied to module: ${module}`);
    }
  };

  const renderCurrentModule = () => {
    if (!user) return null;

    // Check access before rendering
    if (currentModule !== 'dashboard' && !hasModuleAccess(user.role, currentModule)) {
      return React.createElement(
        'div',
        { className: 'p-6 bg-red-50 border border-red-200 rounded-lg' },
        React.createElement(
          'h2',
          { className: 'text-xl font-semibold text-red-800 mb-2' },
          '🚫 Access Denied'
        ),
        React.createElement(
          'p',
          { className: 'text-red-700' },
          `You don't have permission to access the ${currentModule} module.`
        ),
        React.createElement(
          'button',
          {
            onClick: () => handleNavigation('dashboard'),
            className: 'mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700'
          },
          'Go to Dashboard'
        )
      );
    }

    switch (currentModule) {
      case 'dashboard':
        return React.createElement(RoleBasedDashboard, { 
          user, 
          onNavigate: handleNavigation,
          onLogout: handleLogout,
          currentModule: currentModule
        });
      case 'patients':
        return React.createElement(PatientManagement, { user, isAuthenticated });
      case 'appointments':
        return React.createElement(AppointmentManagement, { user, isAuthenticated, onNavigate: handleNavigation });
      case 'consultations':
        return React.createElement(ConsultationManagement, { user, isAuthenticated, onBack: () => handleNavigation('dashboard'), appointmentData: currentAction });
      case 'users':
        return React.createElement(UserManagement, { user, isAuthenticated });
      case 'prescriptions':
        return React.createElement(PrescriptionManagement, { user, isAuthenticated, onBack: () => handleNavigation('dashboard') });
      case 'labTests':
        return React.createElement(LabTestManagement, { 
          user, 
          isAuthenticated, 
          onBack: () => handleNavigation('dashboard') 
        });
      case 'medicines':
        return React.createElement(MedicineManagement, { user, isAuthenticated, onBack: () => handleNavigation('dashboard') });
      case 'billing':
        return React.createElement(BillingManagement, { user, isAuthenticated, onBack: () => handleNavigation('dashboard') });
      case 'ipd':
        return React.createElement(IPDManagement, { user, isAuthenticated, onBack: () => handleNavigation('dashboard') });
      case 'config':
        return React.createElement(ConfigurationManagement, { user });
      case 'catalog':
        return React.createElement(CatalogManagement, { user });
      default:
        return React.createElement(RoleBasedDashboard, { 
          user, 
          onNavigate: handleNavigation,
          currentModule: currentModule
        });
    }
  };

  const renderNavigation = () => {
    if (!user || currentModule === 'dashboard') return null;

    return React.createElement(
      'div',
      { style: { backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '12px 24px' } },
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        React.createElement(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          React.createElement(
            'button',
            {
              onClick: () => handleNavigation('dashboard'),
              style: { color: '#2563EB', fontSize: '14px', fontWeight: '500', cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }
            },
            'Dashboard'
          ),
          React.createElement(
            'span',
            { style: { color: '#6B7280', fontSize: '14px' } },
            '/'
          ),
          React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            React.createElement(
              'span',
              { style: { color: '#111827', fontSize: '14px', fontWeight: '500' } },
              currentModule.replace(/([A-Z])/g, ' $1').trim()
            ),
            React.createElement(InfoButton, {
              title: getInfoContent(currentModule).title,
              content: getInfoContent(currentModule).content,
              size: 'xs',
              variant: 'info'
            })
          )
        ),
        React.createElement(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
          React.createElement(
            'span',
            { style: { fontSize: '14px', color: '#6B7280' } },
            `${user.fullName} (${user.role})`
          ),
          React.createElement(
            'button',
            {
              onClick: handleLogout,
              style: { color: '#EF4444', fontSize: '14px', fontWeight: '500', cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }
            },
            'Logout'
          )
        )
      )
    );
  };

  // Show loading spinner during initial setup check
  if (isLoading || setupState === null) {
    return React.createElement(
      'div',
      { 
        className: 'min-h-screen bg-gray-100 flex items-center justify-center',
        style: { minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }
      },
      React.createElement(LoadingSpinner)
    );
  }

  // Show backend offline message if backend server is not running
  if (setupState === 'backendOffline') {
    return React.createElement(
      'div',
      { 
        className: 'min-h-screen bg-gray-100 flex items-center justify-center p-4',
        style: { minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
      },
      React.createElement(
        'div',
        { className: 'max-w-2xl w-full bg-white rounded-lg shadow-lg p-8' },
        React.createElement(
          'div',
          { className: 'text-center mb-6' },
          React.createElement(
            'div',
            { className: 'text-6xl mb-4' },
            '⚠️'
          ),
          React.createElement(
            'h1',
            { className: 'text-3xl font-bold text-gray-800 mb-2' },
            'Backend Server Not Running'
          ),
          React.createElement(
            'p',
            { className: 'text-gray-600 mb-4' },
            'The backend API server is not accessible. Please start the backend server to continue.'
          ),
          React.createElement(
            'div',
            { 
              className: 'bg-gray-50 border border-gray-200 rounded-lg p-4 text-left',
              style: { fontFamily: 'monospace', fontSize: '12px' }
            },
            React.createElement('p', { className: 'font-semibold mb-2' }, 'API URL:', React.createElement('span', { className: 'text-blue-600' }, config.API_URL)),
            React.createElement('p', { className: 'text-gray-600' }, 'Expected backend: http://localhost:3000')
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6' },
          React.createElement(
            'h2',
            { className: 'text-xl font-semibold text-blue-800 mb-4' },
            'How to Start the Backend Server:'
          ),
          React.createElement(
            'ol',
            { className: 'list-decimal list-inside space-y-3 text-gray-700' },
            React.createElement(
              'li',
              null,
              React.createElement(
                'span',
                { className: 'font-semibold' },
                'Open a new terminal/command prompt'
              )
            ),
            React.createElement(
              'li',
              null,
              'Navigate to the backend directory:',
              React.createElement(
                'code',
                { className: 'block mt-2 bg-gray-100 p-2 rounded font-mono text-sm' },
                'cd hms-desktop/backend'
              )
            ),
            React.createElement(
              'li',
              null,
              'Start the backend server:',
              React.createElement(
                'code',
                { className: 'block mt-2 bg-gray-100 p-2 rounded font-mono text-sm' },
                'npm run dev'
              )
            ),
            React.createElement(
              'li',
              null,
              'Wait for the message: ',
              React.createElement(
                'code',
                { className: 'bg-green-100 px-2 py-1 rounded text-sm' },
                '🚀 HMS Backend Server running on port 3000'
              )
            ),
            React.createElement(
              'li',
              null,
              React.createElement(
                'button',
                {
                  onClick: () => {
                    setBackendRetryCount(0);
                    setSetupState(null);
                    checkSetupState();
                  },
                  className: 'mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-semibold'
                },
                'Refresh - Backend is Running'
              ),
              React.createElement(
                'div',
                { className: 'mt-4 text-sm text-gray-600 italic' },
                '💡 The app will automatically retry connecting every 3 seconds. You can continue working while the backend restarts.'
              ),
              React.createElement(
                'div',
                { className: 'mt-2 text-xs text-gray-500' },
                '🔄 Retry attempts: ' + String(backendRetryCount)
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-yellow-50 border border-yellow-200 rounded-lg p-4' },
          React.createElement(
            'p',
            { className: 'text-sm text-yellow-800' },
            React.createElement(
              'strong',
              null,
              'Note: '
            ),
            'Make sure PostgreSQL database is running and the backend can connect to it. Check the backend console for any database connection errors.'
          )
        )
      )
    );
  }

  // Show hospital setup wizard if no hospital config exists
  if (setupState === 'hospitalSetup') {
    return React.createElement(HospitalSetupWizard, {
      onComplete: () => {
        setSetupState('userOnboarding');
      }
    });
  }

  // Show user onboarding wizard if no users exist
  if (setupState === 'userOnboarding') {
    return React.createElement(UserOnboardingWizard, {
      onComplete: () => {
        setSetupState('ready');
        checkAuthStatus();
      }
    });
  }

  // Normal authentication flow
  if (setupState === 'ready' && !isAuthenticated) {
    return React.createElement(
      'div',
      { 
        className: 'min-h-screen bg-gray-100 flex items-center justify-center',
        style: { minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }
      },
      React.createElement(LoginForm, { onLogin: handleLogin, isLoading })
    );
  }

  // Render main application if authenticated
  if (setupState === 'ready' && isAuthenticated) {
    return React.createElement(
      'div',
      { style: { minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', flexDirection: 'column' } },
      renderNavigation(),
      React.createElement(
        'div',
        { style: { flex: 1, padding: '0' } },
        renderCurrentModule()
      )
    );
  }

  // Fallback - should not reach here, but ensure something renders
  return React.createElement(
    'div',
    { style: { minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' } },
    React.createElement(
      'div',
      { style: { textAlign: 'center' } },
      React.createElement('h1', { style: { fontSize: '24px', marginBottom: '10px', color: '#333' } }, 'HMS - Hospital Management System'),
      React.createElement('p', { style: { color: '#666' } }, 'Initializing application...')
    )
  );
};

export default App;
