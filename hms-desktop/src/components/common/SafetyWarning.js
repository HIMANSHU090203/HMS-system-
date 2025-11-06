import React from 'react';

const SafetyWarning = ({ warnings, recommendations, onDismiss }) => {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  const getSeverityColor = (warning) => {
    if (warning.includes('HIGH RISK') || warning.includes('SEVERE ALLERGY')) {
      return 'bg-red-50 border-red-200 text-red-800';
    } else if (warning.includes('MODERATE RISK') || warning.includes('MODERATE ALLERGY')) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  const getSeverityIcon = (warning) => {
    if (warning.includes('HIGH RISK') || warning.includes('SEVERE ALLERGY')) {
      return '🚨';
    } else if (warning.includes('MODERATE RISK') || warning.includes('MODERATE ALLERGY')) {
      return '⚠️';
    }
    return 'ℹ️';
  };

  return React.createElement(
    'div',
    { className: 'space-y-4' },
    React.createElement(
      'div',
      { className: 'flex justify-between items-center' },
      React.createElement(
        'h3',
        { className: 'text-lg font-semibold text-gray-900' },
        'Safety Warnings'
      ),
      onDismiss && React.createElement(
        'button',
        {
          onClick: onDismiss,
          className: 'text-gray-400 hover:text-gray-600'
        },
        React.createElement(
          'svg',
          { className: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
        )
      )
    ),
    
    // Warnings
    React.createElement(
      'div',
      { className: 'space-y-3' },
      ...warnings.map((warning, index) => React.createElement(
        'div',
        {
          key: index,
          className: `p-4 rounded-lg border ${getSeverityColor(warning)}`
        },
        React.createElement(
          'div',
          { className: 'flex items-start' },
          React.createElement(
            'span',
            { className: 'mr-3 text-lg' },
            getSeverityIcon(warning)
          ),
          React.createElement(
            'div',
            { className: 'flex-1' },
            React.createElement(
              'p',
              { className: 'font-medium' },
              warning
            )
          )
        )
      ))
    ),

    // Recommendations
    recommendations && recommendations.length > 0 && React.createElement(
      'div',
      { className: 'mt-4' },
      React.createElement(
        'h4',
        { className: 'text-md font-semibold text-gray-900 mb-2' },
        'Recommendations'
      ),
      React.createElement(
        'div',
        { className: 'space-y-2' },
        ...recommendations.map((recommendation, index) => React.createElement(
          'div',
          {
            key: index,
            className: 'p-3 bg-green-50 border border-green-200 rounded-lg'
          },
          React.createElement(
            'div',
            { className: 'flex items-start' },
            React.createElement(
              'span',
              { className: 'mr-2 text-green-600' },
              '💡'
            ),
            React.createElement(
              'p',
              { className: 'text-green-800' },
              recommendation
            )
          )
        ))
      )
    ),

    // Action buttons
    React.createElement(
      'div',
      { className: 'flex justify-end space-x-3 mt-6' },
      React.createElement(
        'button',
        {
          onClick: onDismiss,
          className: 'px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300'
        },
        'Acknowledge'
      ),
      React.createElement(
        'button',
        {
          onClick: () => {
            // This would typically open a dialog to modify the prescription
            console.log('Modify prescription clicked');
          },
          className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        },
        'Modify Prescription'
      )
    )
  );
};

export default SafetyWarning;
