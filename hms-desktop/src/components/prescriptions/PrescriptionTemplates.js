import React, { useState, useEffect } from 'react';
import prescriptionService from '../../lib/api/services/prescriptionService';
import userService from '../../lib/api/services/userService';

const PrescriptionTemplates = ({ onSelectTemplate, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    templateData: []
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // This would be implemented when we add template API endpoints
      // For now, we'll use mock data
      const mockTemplates = [
        {
          id: '1',
          name: 'Common Cold',
          description: 'Standard prescription for common cold symptoms',
          templateData: [
            {
              medicineId: 'med1',
              medicineName: 'Paracetamol',
              quantity: 10,
              frequency: '1-0-1',
              duration: 5,
              dosage: '500mg',
              instructions: 'Take with food'
            },
            {
              medicineId: 'med2',
              medicineName: 'Cetirizine',
              quantity: 10,
              frequency: '1-0-0',
              duration: 5,
              dosage: '10mg',
              instructions: 'Take at bedtime'
            }
          ],
          isPublic: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Hypertension',
          description: 'Standard prescription for hypertension management',
          templateData: [
            {
              medicineId: 'med3',
              medicineName: 'Amlodipine',
              quantity: 30,
              frequency: '1-0-0',
              duration: 30,
              dosage: '5mg',
              instructions: 'Take in the morning'
            }
          ],
          isPublic: true,
          createdAt: new Date().toISOString()
        }
      ];
      setTemplates(mockTemplates);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (newTemplate.name.trim() === '') {
      setError('Template name is required');
      return;
    }

    setLoading(true);
    try {
      // This would be implemented when we add template API endpoints
      console.log('Creating template:', newTemplate);
      setShowCreateForm(false);
      setNewTemplate({ name: '', description: '', templateData: [] });
      await loadTemplates();
    } catch (err) {
      setError('Failed to create template');
      console.error('Error creating template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
          'Prescription Templates'
        ),
        React.createElement(
          'div',
          { className: 'flex space-x-2' },
          React.createElement(
            'button',
            {
              onClick: () => setShowCreateForm(true),
              className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
            },
            'Create Template'
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

      // Create template form
      showCreateForm && React.createElement(
        'div',
        { className: 'mb-6 p-4 bg-gray-50 rounded-lg' },
        React.createElement(
          'h3',
          { className: 'text-lg font-semibold text-gray-900 mb-4' },
          'Create New Template'
        ),
        React.createElement(
          'form',
          { onSubmit: handleCreateTemplate },
          React.createElement(
            'div',
            { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4' },
            React.createElement(
              'div',
              null,
              React.createElement(
                'label',
                { className: 'block text-sm font-medium text-gray-700 mb-2' },
                'Template Name *'
              ),
              React.createElement(
                'input',
                {
                  type: 'text',
                  value: newTemplate.name,
                  onChange: (e) => setNewTemplate({ ...newTemplate, name: e.target.value }),
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  required: true
                }
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'label',
                { className: 'block text-sm font-medium text-gray-700 mb-2' },
                'Description'
              ),
              React.createElement(
                'input',
                {
                  type: 'text',
                  value: newTemplate.description,
                  onChange: (e) => setNewTemplate({ ...newTemplate, description: e.target.value }),
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }
              )
            )
          ),
          React.createElement(
            'div',
            { className: 'flex justify-end space-x-3' },
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: () => setShowCreateForm(false),
                className: 'px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300'
              },
              'Cancel'
            ),
            React.createElement(
              'button',
              {
                type: 'submit',
                disabled: loading,
                className: `px-4 py-2 rounded-lg font-medium ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`
              },
              loading ? 'Creating...' : 'Create Template'
            )
          )
        )
      ),

      // Templates list
      loading ? React.createElement(
        'div',
        { className: 'flex justify-center py-8' },
        React.createElement(
          'div',
          { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' }
        )
      ) : templates.length === 0 ? React.createElement(
        'div',
        { className: 'text-center py-8 text-gray-500' },
        'No templates available'
      ) : React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
        ...templates.map(template => React.createElement(
          'div',
          {
            key: template.id,
            className: 'border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer',
            onClick: () => handleSelectTemplate(template)
          },
          React.createElement(
            'div',
            { className: 'flex justify-between items-start mb-3' },
            React.createElement(
              'h3',
              { className: 'text-lg font-semibold text-gray-900' },
              template.name
            ),
            React.createElement(
              'span',
              { className: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800' },
              template.isPublic ? 'Public' : 'Private'
            )
          ),
          React.createElement(
            'p',
            { className: 'text-gray-600 mb-3' },
            template.description || 'No description available'
          ),
          React.createElement(
            'div',
            { className: 'space-y-2' },
            React.createElement(
              'h4',
              { className: 'text-sm font-medium text-gray-700' },
              'Medicines:'
            ),
            ...template.templateData.map((item, index) => React.createElement(
              'div',
              { key: index, className: 'text-sm text-gray-600 bg-gray-50 p-2 rounded' },
              React.createElement(
                'div',
                { className: 'flex justify-between' },
                React.createElement('span', { className: 'font-medium' }, item.medicineName),
                React.createElement('span', null, `${item.quantity} units`)
              ),
              React.createElement(
                'div',
                { className: 'text-xs text-gray-500 mt-1' },
                `${item.frequency} for ${item.duration} days - ${item.dosage}`
              )
            ))
          ),
          React.createElement(
            'div',
            { className: 'mt-3 pt-3 border-t border-gray-100' },
            React.createElement(
              'p',
              { className: 'text-xs text-gray-500' },
              `Created: ${formatDate(template.createdAt)}`
            )
          )
        ))
      )
    )
  );
};

export default PrescriptionTemplates;
