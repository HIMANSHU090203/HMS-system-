import React from 'react';

const SystemConfig = () => {
  return React.createElement(
    'div',
    { className: 'bg-white rounded-lg shadow p-6' },
    React.createElement(
      'h1',
      { className: 'text-2xl font-bold text-gray-900 mb-6' },
      '⚙️ System Configuration'
    ),
    React.createElement(
      'div',
      { className: 'text-center py-8' },
      React.createElement(
        'p',
        { className: 'text-gray-500' },
        'System configuration features coming soon!'
      )
    )
  );
};

export default SystemConfig;
