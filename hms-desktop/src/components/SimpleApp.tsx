import React, { useState } from 'react';

const SimpleApp = () => {
  const [message, setMessage] = useState('HMS System Loading...');

  const testLogin = () => {
    setMessage('Login test clicked! System is working.');
  };

  return React.createElement(
    'div',
    { 
      style: { 
        padding: '40px', 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      } 
    },
    
    // Header
    React.createElement(
      'div',
      { 
        style: { 
          backgroundColor: '#007bff', 
          color: 'white', 
          padding: '20px 40px', 
          borderRadius: '10px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        } 
      },
      React.createElement(
        'h1',
        { style: { margin: '0', fontSize: '2.5em' } },
        '🏥 HMS - Hospital Management System'
      ),
      React.createElement(
        'p',
        { style: { margin: '10px 0 0 0', fontSize: '1.2em', opacity: '0.9' } },
        'Role-Based Access Control System'
      )
    ),

    // Status Card
    React.createElement(
      'div',
      { 
        style: { 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center'
        } 
      },
      React.createElement(
        'h2',
        { style: { color: '#28a745', marginBottom: '20px', fontSize: '1.8em' } },
        '✅ System Status: Online'
      ),
      React.createElement(
        'p',
        { style: { marginBottom: '20px', fontSize: '1.1em', color: '#666' } },
        message
      ),
      React.createElement(
        'div',
        { style: { marginBottom: '30px' } },
        React.createElement(
          'button',
          {
            style: {
              backgroundColor: '#007bff',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1.1em',
              marginRight: '10px'
            },
            onClick: testLogin
          },
          '🔑 Test Login System'
        ),
        React.createElement(
          'button',
          {
            style: {
              backgroundColor: '#28a745',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1.1em'
            },
            onClick: () => setMessage('Backend connection test - checking API...')
          },
          '🔗 Test Backend'
        )
      )
    ),

    // Login Form
    React.createElement(
      'div',
      { 
        style: { 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          marginTop: '20px'
        } 
      },
      React.createElement(
        'h3',
        { style: { textAlign: 'center', marginBottom: '20px', color: '#333' } },
        '🔐 Quick Login Test'
      ),
      React.createElement(
        'div',
        { style: { marginBottom: '15px' } },
        React.createElement(
          'label',
          { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } },
          'Username:'
        ),
        React.createElement('input', {
          type: 'text',
          placeholder: 'admin',
          style: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1em'
          }
        })
      ),
      React.createElement(
        'div',
        { style: { marginBottom: '20px' } },
        React.createElement(
          'label',
          { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } },
          'Password:'
        ),
        React.createElement('input', {
          type: 'password',
          placeholder: 'admin123',
          style: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1em'
          }
        })
      ),
      React.createElement(
        'button',
        {
          style: {
            width: '100%',
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1.1em'
          },
          onClick: () => setMessage('Login form is working! Ready to implement full authentication.')
        },
        '🚀 Login (Test)'
      )
    ),

    // Footer
    React.createElement(
      'div',
      { 
        style: { 
          marginTop: '40px', 
          textAlign: 'center', 
          color: '#666',
          fontSize: '0.9em'
        } 
      },
      React.createElement(
        'p',
        null,
        'If you can see this interface, React and the frontend are working correctly.'
      ),
      React.createElement(
        'p',
        null,
        'Next step: Connect to the role-based authentication system.'
      )
    )
  );
};

export default SimpleApp;
