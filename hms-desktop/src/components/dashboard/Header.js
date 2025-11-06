import React, { useState } from 'react';

const Header = ({ user, onLogout, onToggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return React.createElement(
    'header',
    { className: 'bg-white shadow-sm border-b border-gray-200' },
    React.createElement(
      'div',
      { className: 'flex items-center justify-between px-6 py-4' },
      React.createElement(
        'div',
        { className: 'flex items-center' },
        React.createElement(
          'button',
          {
            onClick: onToggleSidebar,
            className: 'text-gray-500 hover:text-gray-700 focus:outline-none mr-4'
          },
          '☰'
        ),
        React.createElement(
          'h1',
          { className: 'text-xl font-semibold text-gray-900' },
          '🏥 HMS Desktop'
        )
      ),
      React.createElement(
        'div',
        { className: 'relative' },
        React.createElement(
          'button',
          {
            onClick: () => setShowUserMenu(!showUserMenu),
            className: 'flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none'
          },
          React.createElement(
            'div',
            { className: 'w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold' },
            user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'
          ),
          React.createElement(
            'span',
            { className: 'hidden md:block' },
            user?.fullName || user?.username || 'User'
          ),
          React.createElement(
            'span',
            { className: 'text-gray-400' },
            '▼'
          )
        ),
        showUserMenu && React.createElement(
          'div',
          { className: 'absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200' },
          React.createElement(
            'div',
            { className: 'px-4 py-2 text-sm text-gray-700 border-b border-gray-200' },
            React.createElement(
              'p',
              { className: 'font-medium' },
              user?.fullName || user?.username || 'User'
            ),
            React.createElement(
              'p',
              { className: 'text-gray-500' },
              user?.role || 'User'
            )
          ),
          React.createElement(
            'button',
            {
              onClick: onLogout,
              className: 'w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
            },
            'Sign out'
          )
        )
      )
    )
  );
};

export default Header;
