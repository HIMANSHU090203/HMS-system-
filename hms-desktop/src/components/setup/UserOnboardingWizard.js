import React, { useState } from 'react';
import authService from '../../lib/api/services/authService';

const UserOnboardingWizard = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    
    try {
      await authService.registerFirstAdmin({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName
      });
      setSuccess('Admin account created successfully! Redirecting...');
      
      // Redirect to login after short delay
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      console.error('Admin creation failed:', err);
      setError(err.response?.data?.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return React.createElement(
    'div',
    {
      style: {
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }
    },
    
    React.createElement(
      'div',
      {
        style: {
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '4px',
          padding: '32px'
        }
      },
      
      // Header
      React.createElement(
        'div',
        { style: { marginBottom: '24px', textAlign: 'center' } },
        React.createElement(
          'h1',
          { style: { fontSize: '24px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' } },
          '👤 Create Admin Account'
        ),
        React.createElement(
          'p',
          { style: { fontSize: '14px', color: '#6B7280', margin: '0' } },
          'Set up your first administrator account'
        )
      ),

      // Error message
      error && React.createElement(
        'div',
        {
          style: {
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px'
          }
        },
        error
      ),

      // Success message
      success && React.createElement(
        'div',
        {
          style: {
            backgroundColor: '#D1FAE5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px'
          }
        },
        success
      ),

      // Form
      React.createElement(
        'form',
        { onSubmit: handleSubmit },
        
        // Full Name
        React.createElement(
          'div',
          { style: { marginBottom: '16px' } },
          React.createElement(
            'label',
            { htmlFor: 'fullName', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
            'Full Name *'
          ),
          React.createElement(
            'input',
            {
              type: 'text',
              id: 'fullName',
              name: 'fullName',
              value: formData.fullName,
              onChange: handleInputChange,
              required: true,
              style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
            }
          )
        ),

        // Username
        React.createElement(
          'div',
          { style: { marginBottom: '16px' } },
          React.createElement(
            'label',
            { htmlFor: 'username', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
            'Username *'
          ),
          React.createElement(
            'input',
            {
              type: 'text',
              id: 'username',
              name: 'username',
              value: formData.username,
              onChange: handleInputChange,
              required: true,
              minLength: 3,
              style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
            }
          ),
          React.createElement(
            'p',
            { style: { margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' } },
            'Minimum 3 characters'
          )
        ),

        // Password
        React.createElement(
          'div',
          { style: { marginBottom: '16px' } },
          React.createElement(
            'label',
            { htmlFor: 'password', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
            'Password *'
          ),
          React.createElement(
            'input',
            {
              type: 'password',
              id: 'password',
              name: 'password',
              value: formData.password,
              onChange: handleInputChange,
              required: true,
              minLength: 6,
              style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
            }
          ),
          React.createElement(
            'p',
            { style: { margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' } },
            'Minimum 6 characters'
          )
        ),

        // Confirm Password
        React.createElement(
          'div',
          { style: { marginBottom: '24px' } },
          React.createElement(
            'label',
            { htmlFor: 'confirmPassword', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
            'Confirm Password *'
          ),
          React.createElement(
            'input',
            {
              type: 'password',
              id: 'confirmPassword',
              name: 'confirmPassword',
              value: formData.confirmPassword,
              onChange: handleInputChange,
              required: true,
              minLength: 6,
              style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
            }
          )
        ),

        // Submit button
        React.createElement(
          'button',
          {
            type: 'submit',
            disabled: loading || success,
            style: {
              width: '100%',
              padding: '10px',
              backgroundColor: (loading || success) ? '#9CA3AF' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: (loading || success) ? 'not-allowed' : 'pointer'
            }
          },
          loading ? 'Creating...' : success ? 'Success!' : 'Create Admin Account'
        )
      )
    )
  );
};

export default UserOnboardingWizard;

