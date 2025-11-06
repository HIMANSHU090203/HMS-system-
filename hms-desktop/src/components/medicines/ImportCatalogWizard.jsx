import React, { useState } from 'react';
import medicineService from '../../lib/api/services/medicineService';

const ImportCatalogWizard = ({ onBack, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid file (PDF, Excel, or Word document)');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await medicineService.importCatalog(file);
      
      if (response.success) {
        setSuccess(`Successfully imported ${response.data.imported.length} medicines`);
        if (response.data.errors && response.data.errors.length > 0) {
          setError(`Some errors occurred: ${response.data.errors.join(', ')}`);
        }
        
        // Call success callback after a delay to show the message
        setTimeout(() => {
          onSuccess && onSuccess(response.data);
        }, 2000);
      } else {
        setError(response.message || 'Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err.response?.data?.message || 'Error importing catalog');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50 py-8 px-4' },
    React.createElement(
      'div',
      { className: 'max-w-2xl mx-auto' },
      // Header
      React.createElement(
        'div',
        { className: 'mb-8' },
        React.createElement(
          'button',
          {
            onClick: onBack,
            className: 'text-blue-600 hover:text-blue-800 mb-4 flex items-center'
          },
          React.createElement('span', { className: 'mr-2' }, '←'),
          'Back to Medicine Management'
        ),
        React.createElement(
          'h1',
          { className: 'text-3xl font-bold text-gray-900' },
          'Import Medicine Catalog'
        ),
        React.createElement(
          'p',
          { className: 'text-gray-600 mt-2' },
          'Upload a file containing medicine information to bulk import medicines into the system.'
        )
      ),

      // Form
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow-md p-6' },
        React.createElement(
          'form',
          { onSubmit: handleSubmit },
          // File upload section
          React.createElement(
            'div',
            { className: 'mb-6' },
            React.createElement(
              'label',
              { className: 'block text-sm font-medium text-gray-700 mb-2' },
              'Select File'
            ),
            React.createElement(
              'div',
              { className: 'border-2 border-dashed border-gray-300 rounded-lg p-6 text-center' },
              React.createElement(
                'input',
                {
                  type: 'file',
                  onChange: handleFileChange,
                  accept: '.pdf,.xlsx,.xls,.doc,.docx',
                  className: 'hidden',
                  id: 'file-upload'
                }
              ),
              React.createElement(
                'label',
                {
                  htmlFor: 'file-upload',
                  className: 'cursor-pointer'
                },
                React.createElement(
                  'div',
                  { className: 'text-gray-500' },
                  React.createElement(
                    'svg',
                    {
                      className: 'mx-auto h-12 w-12 text-gray-400',
                      stroke: 'currentColor',
                      fill: 'none',
                      viewBox: '0 0 48 48'
                    },
                    React.createElement(
                      'path',
                      {
                        d: 'M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02',
                        strokeWidth: 2,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round'
                      }
                    )
                  ),
                  React.createElement(
                    'p',
                    { className: 'mt-2' },
                    file ? file.name : 'Click to upload or drag and drop'
                  ),
                  React.createElement(
                    'p',
                    { className: 'text-xs text-gray-400 mt-1' },
                    'PDF, Excel, or Word documents up to 10MB'
                  )
                )
              )
            )
          ),

          // File format instructions
          React.createElement(
            'div',
            { className: 'mb-6 p-4 bg-blue-50 rounded-lg' },
            React.createElement(
              'h3',
              { className: 'text-sm font-medium text-blue-800 mb-2' },
              'Expected File Format'
            ),
            React.createElement(
              'div',
              { className: 'text-sm text-blue-700' },
              React.createElement('p', { className: 'mb-1' }, 'For Excel files, include these columns:'),
              React.createElement('ul', { className: 'list-disc list-inside ml-4' },
                React.createElement('li', null, 'Medicine Name (required)'),
                React.createElement('li', null, 'Generic Name'),
                React.createElement('li', null, 'Manufacturer'),
                React.createElement('li', null, 'Category'),
                React.createElement('li', null, 'ATC Code'),
                React.createElement('li', null, 'Price'),
                React.createElement('li', null, 'Stock Quantity'),
                React.createElement('li', null, 'Low Stock Threshold'),
                React.createElement('li', null, 'Expiry Date')
              )
            )
          ),

          // Error/Success messages
          error && React.createElement(
            'div',
            { className: 'mb-4 p-4 bg-red-50 border border-red-200 rounded-lg' },
            React.createElement(
              'p',
              { className: 'text-red-800' },
              error
            )
          ),

          success && React.createElement(
            'div',
            { className: 'mb-4 p-4 bg-green-50 border border-green-200 rounded-lg' },
            React.createElement(
              'p',
              { className: 'text-green-800' },
              success
            )
          ),

          // Submit button
          React.createElement(
            'div',
            { className: 'flex justify-end space-x-4' },
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: onBack,
                className: 'px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300'
              },
              'Cancel'
            ),
            React.createElement(
              'button',
              {
                type: 'submit',
                disabled: !file || loading,
                className: `px-6 py-2 rounded-lg font-medium ${
                  !file || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`
              },
              loading ? 'Importing...' : 'Import Catalog'
            )
          )
        )
      )
    )
  );
};

export default ImportCatalogWizard;
