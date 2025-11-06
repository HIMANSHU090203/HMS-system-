import React from 'react';

const Sidebar = ({ modules, activeModule, onModuleChange, collapsed, onToggle }) => {
  return React.createElement(
    'div',
    { 
      className: `bg-gray-800 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`
    },
    React.createElement(
      'div',
      { className: 'p-4' },
      React.createElement(
        'button',
        {
          onClick: onToggle,
          className: 'text-white hover:text-gray-300 focus:outline-none'
        },
        collapsed ? '☰' : '✕'
      )
    ),
    React.createElement(
      'nav',
      { className: 'mt-4' },
      Object.entries(modules).map(([key, module]) => {
        const isActive = activeModule === key;
        return React.createElement(
          'button',
          {
            key: key,
            onClick: () => onModuleChange(key),
            className: `w-full flex items-center px-4 py-3 text-left hover:bg-gray-700 transition-colors ${
              isActive ? 'bg-gray-700 border-r-4 border-blue-500' : ''
            }`
          },
          React.createElement(
            'span',
            { className: 'text-xl mr-3' },
            module.icon
          ),
          !collapsed && React.createElement(
            'span',
            { className: 'font-medium' },
            module.name
          )
        );
      })
    )
  );
};

export default Sidebar;
