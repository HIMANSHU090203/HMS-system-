import React, { useState, useEffect } from 'react';
import auditService from '../../lib/api/services/auditService';

const AuditLogs = ({ prescriptionId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (prescriptionId) {
      loadAuditLogs();
    }
  }, [prescriptionId]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await auditService.getPrescriptionAuditLogs(prescriptionId);
      setLogs(response.logs || []);
    } catch (err) {
      setError('Failed to load audit logs');
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATED': return 'text-green-600 bg-green-100';
      case 'UPDATED': return 'text-blue-600 bg-blue-100';
      case 'DISPENSED': return 'text-purple-600 bg-purple-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATED': return '➕';
      case 'UPDATED': return '✏️';
      case 'DISPENSED': return '💊';
      case 'CANCELLED': return '❌';
      default: return '📝';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatChanges = (changes) => {
    if (!changes) return 'No changes recorded';
    
    try {
      const parsed = typeof changes === 'string' ? JSON.parse(changes) : changes;
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch {
      return changes;
    }
  };

  return React.createElement(
    'div',
    { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
    React.createElement(
      'div',
      { className: 'bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto' },
      React.createElement(
        'div',
        { className: 'flex justify-between items-center mb-6' },
        React.createElement(
          'h2',
          { className: 'text-2xl font-bold text-gray-900' },
          'Prescription Audit Trail'
        ),
        React.createElement(
          'button',
          {
            onClick: onClose,
            className: 'text-gray-400 hover:text-gray-600'
          },
          React.createElement(
            'svg',
            { className: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
          )
        )
      ),

      // Error message
      error && React.createElement(
        'div',
        { className: 'mb-4 p-4 bg-red-50 border border-red-200 rounded-lg' },
        React.createElement(
          'p',
          { className: 'text-red-800' },
          error
        )
      ),

      // Audit logs
      loading ? React.createElement(
        'div',
        { className: 'flex justify-center py-8' },
        React.createElement(
          'div',
          { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' }
        )
      ) : logs.length === 0 ? React.createElement(
        'div',
        { className: 'text-center py-8 text-gray-500' },
        'No audit logs found'
      ) : React.createElement(
        'div',
        { className: 'space-y-4' },
        ...logs.map(log => React.createElement(
          'div',
          {
            key: log.id,
            className: 'border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
          },
          React.createElement(
            'div',
            { className: 'flex items-start justify-between' },
            React.createElement(
              'div',
              { className: 'flex items-center space-x-3' },
              React.createElement(
                'span',
                { className: 'text-2xl' },
                getActionIcon(log.action)
              ),
              React.createElement(
                'div',
                null,
                React.createElement(
                  'div',
                  { className: 'flex items-center space-x-2' },
                  React.createElement(
                    'span',
                    { className: `px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}` },
                    log.action
                  ),
                  React.createElement(
                    'span',
                    { className: 'text-sm text-gray-600' },
                    formatDate(log.performedAt)
                  )
                ),
                React.createElement(
                  'p',
                  { className: 'text-sm text-gray-700 mt-1' },
                  `Performed by: ${log.user?.fullName || 'Unknown User'} (${log.user?.role || 'Unknown Role'})`
                )
              )
            )
          ),
          log.changes && React.createElement(
            'div',
            { className: 'mt-3 pt-3 border-t border-gray-100' },
            React.createElement(
              'h4',
              { className: 'text-sm font-medium text-gray-700 mb-1' },
              'Changes:'
            ),
            React.createElement(
              'p',
              { className: 'text-sm text-gray-600 bg-gray-50 p-2 rounded' },
              formatChanges(log.changes)
            )
          ),
          log.notes && React.createElement(
            'div',
            { className: 'mt-3 pt-3 border-t border-gray-100' },
            React.createElement(
              'h4',
              { className: 'text-sm font-medium text-gray-700 mb-1' },
              'Notes:'
            ),
            React.createElement(
              'p',
              { className: 'text-sm text-gray-600' },
              log.notes
            )
          )
        ))
      )
    )
  );
};

export default AuditLogs;
