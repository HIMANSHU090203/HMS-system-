import React, { useState } from 'react';

const LoginForm = ({ onLogin, isLoading }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await onLogin(formData);
    if (!result.success) {
      setError(result.message);
    }
  };

  return React.createElement(
    'div',
    { className: 'max-w-md w-full space-y-8' },
    React.createElement(
      'div',
      { className: 'text-center' },
      React.createElement(
        'h2',
        { className: 'mt-6 text-3xl font-extrabold text-gray-900' },
        '🏥 HMS Desktop'
      ),
      React.createElement(
        'p',
        { className: 'mt-2 text-sm text-gray-600' },
        'Sign in to your account'
      )
    ),
    React.createElement(
      'form',
      { className: 'mt-8 space-y-6', onSubmit: handleSubmit },
      React.createElement(
        'div',
        { className: 'space-y-4' },
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            { htmlFor: 'username', className: 'block text-sm font-medium text-gray-700' },
            'Username'
          ),
          React.createElement(
            'input',
            {
              id: 'username',
              name: 'username',
              type: 'text',
              required: true,
              value: formData.username,
              onChange: handleInputChange,
              className: 'mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm',
              placeholder: 'Enter your username'
            }
          )
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'label',
            { htmlFor: 'password', className: 'block text-sm font-medium text-gray-700' },
            'Password'
          ),
          React.createElement(
            'input',
            {
              id: 'password',
              name: 'password',
              type: 'password',
              required: true,
              value: formData.password,
              onChange: handleInputChange,
              className: 'mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm',
              placeholder: 'Enter your password'
            }
          )
        )
      ),
      error && React.createElement(
        'div',
        { className: 'text-red-600 text-sm text-center' },
        error
      ),
      React.createElement(
        'div',
        null,
        React.createElement(
          'button',
          {
            type: 'submit',
            disabled: isLoading,
            className: `group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`
          },
          isLoading ? 'Signing in...' : 'Sign in'
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'mt-6 text-center' },
      React.createElement(
        'p',
        { className: 'text-xs text-gray-500' },
        'Default credentials: admin / admin123'
      )
    )
  );
};

export default LoginForm;
