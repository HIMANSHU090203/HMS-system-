import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return React.createElement(
    'div',
    { className: 'flex flex-col items-center justify-center space-y-4' },
    React.createElement(
      'div',
      {
        className: `animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`
      }
    ),
    text && React.createElement(
      'p',
      { className: 'text-gray-600 text-sm' },
      text
    )
  );
};

export default LoadingSpinner;
