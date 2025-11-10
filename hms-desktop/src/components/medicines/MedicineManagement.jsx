import React, { useState, useEffect } from 'react';
import medicineService from '../../lib/api/services/medicineService';
import InfoButton from '../common/InfoButton';
import { getInfoContent } from '../../lib/infoContent';
import OrderManagement from './OrderManagement';
import ImportCatalogWizard from './ImportCatalogWizard';
import { useHospitalConfig } from '../../lib/contexts/HospitalConfigContext';

const MedicineManagement = ({ user, isAuthenticated, onBack }) => {
  const { formatCurrency } = useHospitalConfig();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('list');
  
  // Inventory Management State
  const [stats, setStats] = useState(null);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(1);
  const [showStockUpdateModal, setShowStockUpdateModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [stockUpdateForm, setStockUpdateForm] = useState({
    operation: 'add',
    quantity: '',
    reason: ''
  });
  
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    category: '',
    price: '',
    quantity: '',
    lowStockThreshold: '',
    code: '',
    description: '',
    therapeuticClass: '',
    atcCode: '',
    dosageForm: '',
    strength: '',
    unit: '',
    expiryDate: '',
    supplier: '',
    batchNumber: '',
    storageConditions: '',
    prescriptionRequired: true
  });

  useEffect(() => {
    loadMedicines();
    if (activeTab === 'inventory') {
      loadInventoryData();
    }
  }, [currentPage, searchTerm, filterCategory, activeTab]);

  useEffect(() => {
    if (activeTab === 'inventory' && transactionsPage) {
      loadTransactions();
    }
  }, [transactionsPage]);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const response = await medicineService.getMedicines({
        page: currentPage,
        search: searchTerm,
        category: filterCategory
      });
      if (response.success) {
        setMedicines(response.data.medicines);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (err) {
      setError('Failed to load medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await medicineService.createMedicine(formData);
      if (response.success) {
        setShowAddForm(false);
        setFormData({
          name: '',
          genericName: '',
          manufacturer: '',
          category: '',
          price: '',
          quantity: '',
          lowStockThreshold: '',
          code: '',
          description: '',
          therapeuticClass: '',
          atcCode: '',
          dosageForm: '',
          strength: '',
          unit: '',
          expiryDate: '',
          supplier: '',
          batchNumber: '',
          storageConditions: '',
          prescriptionRequired: true
        });
        loadMedicines();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to create medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Inventory Management Functions
  const loadInventoryData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadLowStockMedicines(),
        loadTransactions()
      ]);
    } catch (err) {
      setError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await medicineService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadLowStockMedicines = async () => {
    try {
      const response = await medicineService.getLowStockMedicines();
      if (response.success) {
        setLowStockMedicines(response.data.medicines || []);
      }
    } catch (err) {
      console.error('Failed to load low stock medicines:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await medicineService.getTransactions(undefined, transactionsPage, 10);
      if (response.success) {
        setTransactions(response.data.transactions || []);
        setTransactionsTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const handleOpenStockUpdate = (medicine) => {
    setSelectedMedicine(medicine);
    setStockUpdateForm({
      operation: 'add',
      quantity: '',
      reason: ''
    });
    setShowStockUpdateModal(true);
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    if (!selectedMedicine) return;

    setLoading(true);
    try {
      const response = await medicineService.updateStock(selectedMedicine.id, {
        operation: stockUpdateForm.operation,
        quantity: parseInt(stockUpdateForm.quantity),
        reason: stockUpdateForm.reason || undefined
      });

      if (response.success) {
        setShowStockUpdateModal(false);
        setSelectedMedicine(null);
        setStockUpdateForm({ operation: 'add', quantity: '', reason: '' });
        // Reload all inventory data
        await loadInventoryData();
        await loadMedicines();
        setError('');
      } else {
        setError(response.message || 'Failed to update stock');
      }
    } catch (err) {
      setError('Failed to update stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdateFormChange = (e) => {
    const { name, value } = e.target;
    setStockUpdateForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isAuthenticated) {
    return React.createElement(
      'div',
      { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
      React.createElement(
        'div',
        { className: 'text-center' },
        React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 mb-4' }, 'Access Denied'),
        React.createElement('p', { className: 'text-gray-600' }, 'Please log in to access this page.')
      )
    );
  }

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50 p-6' },
    // Header
    React.createElement(
      'div',
      { className: 'mb-6' },
      React.createElement(
        'button',
        {
          onClick: onBack,
          className: 'text-blue-600 hover:text-blue-800 mb-4 flex items-center'
        },
        React.createElement('span', { className: 'mr-2' }, '←'),
        'Back to Dashboard'
      ),
      React.createElement(
        'div',
        { className: 'flex items-center gap-3' },
        React.createElement(
          'h1',
          { className: 'text-3xl font-bold text-gray-900' },
          '💊 Medicine Management'
        ),
        React.createElement(InfoButton, {
          title: getInfoContent('medicines').title,
          content: getInfoContent('medicines').content,
          size: 'md',
          variant: 'info'
        })
      )
    ),

    // Error/Success messages
    error && React.createElement(
      'div',
      { className: 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4' },
      error
    ),

    // Tabs
    React.createElement(
      'div',
      { className: 'bg-white rounded-lg shadow mb-6' },
      React.createElement(
        'div',
        { className: 'border-b border-gray-200' },
        React.createElement(
          'nav',
          { className: '-mb-px flex space-x-8' },
          React.createElement(
            'button',
            {
              onClick: () => setActiveTab('list'),
              className: `py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            },
            'Medicine List'
          ),
          React.createElement(
            'button',
            {
              onClick: () => setActiveTab('add'),
              className: `py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'add' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            },
            'Add Medicine'
          ),
          React.createElement(
            'button',
            {
              onClick: () => setActiveTab('inventory'),
              className: `py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inventory' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            },
            'Inventory Management'
          ),
          React.createElement(
            'button',
            {
              onClick: () => setActiveTab('orders'),
              className: `py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            },
            'Order Management'
          ),
          React.createElement(
            'button',
            {
              onClick: () => setActiveTab('import'),
              className: `py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'import' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            },
            'Import Catalog'
          )
        )
      )
    ),

    // Tab Content
    activeTab === 'list' && React.createElement(
      'div',
      { className: 'space-y-6' },
      // Search and Filters
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow p-6' },
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { className: 'block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2' },
              'Search Medicines',
              React.createElement(InfoButton, {
                title: 'Search Function',
                content: 'Search medicines by name, generic name, manufacturer, or category.',
                size: 'xs'
              })
            ),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Search medicines...',
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { className: 'block text-sm font-medium text-gray-700 mb-2' },
              'Category Filter'
            ),
            React.createElement(
              'select',
              {
                value: filterCategory,
                onChange: (e) => setFilterCategory(e.target.value),
                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              },
              React.createElement('option', { value: '' }, 'All Categories'),
              React.createElement('option', { value: 'Antibiotic' }, 'Antibiotic'),
              React.createElement('option', { value: 'Painkiller' }, 'Painkiller'),
              React.createElement('option', { value: 'Vitamin' }, 'Vitamin'),
              React.createElement('option', { value: 'Other' }, 'Other')
            )
          ),
          React.createElement(
            'div',
            { className: 'flex items-end' },
            React.createElement(
              'button',
              {
                onClick: loadMedicines,
                className: 'w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              },
              'Search'
            )
          )
        )
      ),

      // Medicine List
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow overflow-hidden' },
        React.createElement(
          'div',
          { className: 'px-6 py-4 border-b border-gray-200' },
          React.createElement(
            'h3',
            { className: 'text-lg font-medium text-gray-900' },
            'Medicine Inventory'
          )
        ),
        React.createElement(
          'div',
          { className: 'overflow-x-auto' },
          React.createElement(
            'table',
            { className: 'min-w-full divide-y divide-gray-200' },
            React.createElement(
              'thead',
              { className: 'bg-gray-50' },
              React.createElement(
                'tr',
                null,
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Name'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Generic Name'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Category'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Price'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Stock'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Status'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Actions')
              )
            ),
            React.createElement(
              'tbody',
              { className: 'bg-white divide-y divide-gray-200' },
              medicines.map(medicine => {
                const stockQuantity = medicine.stockQuantity || medicine.quantity || 0;
                const lowStockThreshold = medicine.lowStockThreshold || 10;
                const stockStatus = medicine.stockStatus || (stockQuantity <= lowStockThreshold ? 'LOW' : 'OK');
                return React.createElement(
                  'tr',
                  { key: medicine.id, className: 'hover:bg-gray-50' },
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900' }, medicine.name),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, medicine.genericName || '-'),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, medicine.category || '-'),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, 
                    medicine.sellingPrice 
                      ? formatCurrency(parseFloat(medicine.sellingPrice || 0))
                      : formatCurrency(parseFloat(medicine.price || 0))
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, medicine.stockQuantity || medicine.quantity || 0),
                  React.createElement(
                    'td',
                    { className: 'px-6 py-4 whitespace-nowrap text-sm' },
                    React.createElement(
                      'span',
                      { className: `px-2 py-1 text-xs font-medium rounded-full ${stockStatus === 'LOW' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}` },
                      stockStatus
                    )
                  ),
                  React.createElement(
                    'td',
                    { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium' },
                    React.createElement(
                      'button',
                      {
                        onClick: () => handleOpenStockUpdate(medicine),
                        className: 'text-blue-600 hover:text-blue-900 mr-3'
                      },
                      'Update Stock'
                    ),
                    React.createElement(
                      'button',
                      {
                        className: 'text-gray-600 hover:text-gray-900 mr-3'
                      },
                      'Edit'
                    ),
                    React.createElement(
                      'button',
                      {
                        className: 'text-red-600 hover:text-red-900'
                      },
                      'Delete'
                    )
                  )
                );
              })
            )
          )
        )
      )
    ),

    // Add Medicine Form
    activeTab === 'add' && React.createElement(
      'div',
      { className: 'space-y-6' },
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow p-6' },
        React.createElement(
          'h3',
          { className: 'text-lg font-medium text-gray-900 mb-6' },
          'Add New Medicine'
        ),
        React.createElement(
          'form',
          { onSubmit: handleSubmit, className: 'space-y-6' },
          // Basic Information
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement(
              'h4',
              { className: 'text-md font-medium text-gray-800 flex items-center gap-2' },
              'Basic Information',
              React.createElement(InfoButton, {
                title: getInfoContent('medicines', 'overview').title,
                content: getInfoContent('medicines', 'overview').content,
                size: 'sm'
              })
            ),
            React.createElement(
              'div',
              { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
              React.createElement(
                'div',
                null,
                React.createElement(
                  'label',
                  { className: 'block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2' },
                  'Brand Name (Medicine Name) *',
                  React.createElement(InfoButton, {
                    title: 'Brand Name',
                    content: 'Enter the commercial/brand name of the medicine (e.g., "Crocin", "Dolo 650"). This is the name patients will see.',
                    size: 'xs'
                  })
                ),
                React.createElement('input', {
                  type: 'text',
                  name: 'name',
                  required: true,
                  value: formData.name,
                  onChange: handleInputChange,
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement(
                  'label',
                  { className: 'block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2' },
                  'Generic Name (Salt) *',
                  React.createElement(InfoButton, {
                    title: 'Generic Name / Salt',
                    content: 'Enter the generic/salt name of the medicine (e.g., "Paracetamol", "Acetaminophen"). This is the active pharmaceutical ingredient.',
                    size: 'xs'
                  })
                ),
                React.createElement('input', {
                  type: 'text',
                  name: 'genericName',
                  required: true,
                  value: formData.genericName,
                  onChange: handleInputChange,
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement(
                  'label',
                  { className: 'block text-sm font-medium text-gray-700 mb-2' },
                  'Manufacturer *'
                ),
                React.createElement('input', {
                  type: 'text',
                  name: 'manufacturer',
                  required: true,
                  value: formData.manufacturer,
                  onChange: handleInputChange,
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement(
                  'label',
                  { className: 'block text-sm font-medium text-gray-700 mb-2' },
                  'Category *'
                ),
                React.createElement(
                  'select',
                  {
                    name: 'category',
                    required: true,
                    value: formData.category,
                    onChange: handleInputChange,
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  },
                  React.createElement('option', { value: '' }, 'Select Category'),
                  React.createElement('option', { value: 'Antibiotic' }, 'Antibiotic'),
                  React.createElement('option', { value: 'Painkiller' }, 'Painkiller'),
                  React.createElement('option', { value: 'Vitamin' }, 'Vitamin'),
                  React.createElement('option', { value: 'Other' }, 'Other')
                )
              )
            )
          ),

          // Pricing and Inventory
          React.createElement(
            'div',
            { className: 'space-y-4' },
            React.createElement(
              'h4',
              { className: 'text-md font-medium text-gray-800 flex items-center gap-2' },
              'Pricing & Inventory',
              React.createElement(InfoButton, {
                title: getInfoContent('medicines', 'inventory').title,
                content: getInfoContent('medicines', 'inventory').content,
                size: 'sm'
              })
            ),
            React.createElement(
              'div',
              { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
              React.createElement(
                'div',
                null,
                React.createElement(
                  'label',
                  { className: 'block text-sm font-medium text-gray-700 mb-2' },
                  'Price *'
                ),
                React.createElement('input', {
                  type: 'number',
                  name: 'price',
                  required: true,
                  min: '0',
                  step: '0.01',
                  value: formData.price,
                  onChange: handleInputChange,
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement(
                  'label',
                  { className: 'block text-sm font-medium text-gray-700 mb-2' },
                  'Stock Quantity *'
                ),
                React.createElement('input', {
                  type: 'number',
                  name: 'quantity',
                  required: true,
                  min: '0',
                  value: formData.quantity,
                  onChange: handleInputChange,
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement(
                  'label',
                  { className: 'block text-sm font-medium text-gray-700 mb-2' },
                  'Low Stock Alert *'
                ),
                React.createElement('input', {
                  type: 'number',
                  name: 'lowStockThreshold',
                  required: true,
                  min: '0',
                  value: formData.lowStockThreshold,
                  onChange: handleInputChange,
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                })
              )
            )
          ),

          // Submit Button
          React.createElement(
            'div',
            { className: 'flex justify-end space-x-3' },
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: () => setActiveTab('list'),
                className: 'px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
              },
              'Cancel'
            ),
            React.createElement(
              'button',
              {
                type: 'submit',
                disabled: loading,
                className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
              },
              loading ? 'Adding...' : 'Add Medicine'
            )
          )
        )
      )
    ),

    // Inventory Management Tab
    activeTab === 'inventory' && React.createElement(
      'div',
      { className: 'space-y-6' },
      // Statistics Dashboard
      stats && React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-4 gap-4' },
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('div', { className: 'text-sm font-medium text-gray-500 mb-1' }, 'Total Medicines'),
          React.createElement('div', { className: 'text-2xl font-bold text-gray-900' }, stats.totalMedicines || 0)
        ),
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('div', { className: 'text-sm font-medium text-gray-500 mb-1' }, 'Low Stock Items'),
          React.createElement('div', { className: 'text-2xl font-bold text-red-600' }, stats.lowStockMedicines || 0)
        ),
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('div', { className: 'text-sm font-medium text-gray-500 mb-1' }, 'Total Inventory Value'),
          React.createElement('div', { className: 'text-2xl font-bold text-green-600' }, formatCurrency(parseFloat(stats.totalInventoryValue || 0)))
        ),
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement('div', { className: 'text-sm font-medium text-gray-500 mb-1' }, 'Total Quantity'),
          React.createElement('div', { className: 'text-2xl font-bold text-blue-600' }, stats.totalQuantity || 0)
        )
      ),

      // Low Stock Alerts
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow' },
        React.createElement(
          'div',
          { className: 'px-6 py-4 border-b border-gray-200' },
          React.createElement(
            'div',
            { className: 'flex items-center justify-between' },
            React.createElement('h3', { className: 'text-lg font-medium text-gray-900' }, '⚠️ Low Stock Alerts'),
            React.createElement(
              'span',
              { className: `px-3 py-1 rounded-full text-sm font-medium ${lowStockMedicines.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}` },
              `${lowStockMedicines.length} item${lowStockMedicines.length !== 1 ? 's' : ''}`
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'overflow-x-auto' },
          lowStockMedicines.length > 0 ? React.createElement(
            'table',
            { className: 'min-w-full divide-y divide-gray-200' },
            React.createElement(
              'thead',
              { className: 'bg-gray-50' },
              React.createElement(
                'tr',
                null,
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase' }, 'Medicine'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase' }, 'Current Stock'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase' }, 'Threshold'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase' }, 'Price'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase' }, 'Actions')
              )
            ),
            React.createElement(
              'tbody',
              { className: 'bg-white divide-y divide-gray-200' },
              lowStockMedicines.map(medicine => React.createElement(
                'tr',
                { key: medicine.id, className: 'hover:bg-gray-50' },
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900' }, medicine.name),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold' }, medicine.quantity),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, medicine.lowStockThreshold),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, formatCurrency(parseFloat(medicine.price || 0))),
                React.createElement(
                  'td',
                  { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium' },
                  React.createElement(
                    'button',
                    {
                      onClick: () => handleOpenStockUpdate(medicine),
                      className: 'text-blue-600 hover:text-blue-900'
                    },
                    'Update Stock'
                  )
                )
              ))
            )
          ) : React.createElement(
            'div',
            { className: 'px-6 py-8 text-center text-gray-500' },
            '✅ No low stock items. All medicines are well stocked!'
          )
        )
      ),

      // Stock Update Modal
      showStockUpdateModal && selectedMedicine && React.createElement(
        'div',
        { className: 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50' },
        React.createElement(
          'div',
          { className: 'relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white' },
          React.createElement(
            'div',
            { className: 'mt-3' },
            React.createElement(
              'h3',
              { className: 'text-lg font-medium text-gray-900 mb-4' },
              `Update Stock: ${selectedMedicine.name}`
            ),
            React.createElement(
              'p',
              { className: 'text-sm text-gray-500 mb-4' },
              `Current Stock: ${selectedMedicine.quantity} | Threshold: ${selectedMedicine.lowStockThreshold}`
            ),
            React.createElement(
              'form',
              { onSubmit: handleStockUpdate, className: 'space-y-4' },
              React.createElement(
                'div',
                null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Operation *'),
                React.createElement(
                  'select',
                  {
                    name: 'operation',
                    value: stockUpdateForm.operation,
                    onChange: handleStockUpdateFormChange,
                    required: true,
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  },
                  React.createElement('option', { value: 'add' }, 'Add Stock'),
                  React.createElement('option', { value: 'subtract' }, 'Subtract Stock'),
                  React.createElement('option', { value: 'set' }, 'Set Stock')
                )
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Quantity *'),
                React.createElement('input', {
                  type: 'number',
                  name: 'quantity',
                  value: stockUpdateForm.quantity,
                  onChange: handleStockUpdateFormChange,
                  required: true,
                  min: '1',
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Reason (Optional)'),
                React.createElement('textarea', {
                  name: 'reason',
                  value: stockUpdateForm.reason,
                  onChange: handleStockUpdateFormChange,
                  rows: 3,
                  placeholder: 'e.g., New shipment received, Damaged items removed, etc.',
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                })
              ),
              React.createElement(
                'div',
                { className: 'flex justify-end space-x-3 pt-4' },
                React.createElement(
                  'button',
                  {
                    type: 'button',
                    onClick: () => {
                      setShowStockUpdateModal(false);
                      setSelectedMedicine(null);
                    },
                    className: 'px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
                  },
                  'Cancel'
                ),
                React.createElement(
                  'button',
                  {
                    type: 'submit',
                    disabled: loading,
                    className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
                  },
                  loading ? 'Updating...' : 'Update Stock'
                )
              )
            )
          )
        )
      ),

      // Transaction History
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow' },
        React.createElement(
          'div',
          { className: 'px-6 py-4 border-b border-gray-200' },
          React.createElement('h3', { className: 'text-lg font-medium text-gray-900' }, '📋 Transaction History')
        ),
        React.createElement(
          'div',
          { className: 'overflow-x-auto' },
          transactions.length > 0 ? React.createElement(
            'table',
            { className: 'min-w-full divide-y divide-gray-200' },
            React.createElement(
              'thead',
              { className: 'bg-gray-50' },
              React.createElement(
                'tr',
                null,
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase' }, 'Date'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase' }, 'Medicine'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase' }, 'Quantity'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase' }, 'Patient'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase' }, 'Dispensed By')
              )
            ),
            React.createElement(
              'tbody',
              { className: 'bg-white divide-y divide-gray-200' },
              transactions.map(transaction => React.createElement(
                'tr',
                { key: transaction.id, className: 'hover:bg-gray-50' },
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, new Date(transaction.dispensedAt).toLocaleDateString()),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900' }, transaction.medicine?.name || 'N/A'),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, transaction.quantityDispensed),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, transaction.prescription?.patient?.name || 'N/A'),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, transaction.dispensedByUser?.fullName || 'N/A')
              ))
            )
          ) : React.createElement(
            'div',
            { className: 'px-6 py-8 text-center text-gray-500' },
            'No transactions found'
          )
        ),
        transactions.length > 0 && React.createElement(
          'div',
          { className: 'px-6 py-4 border-t border-gray-200 flex items-center justify-between' },
          React.createElement(
            'button',
            {
              onClick: () => setTransactionsPage(p => Math.max(1, p - 1)),
              disabled: transactionsPage === 1,
              className: 'px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            },
            'Previous'
          ),
          React.createElement(
            'span',
            { className: 'text-sm text-gray-700' },
            `Page ${transactionsPage} of ${transactionsTotalPages}`
          ),
          React.createElement(
            'button',
            {
              onClick: () => setTransactionsPage(p => p + 1),
              disabled: transactionsPage >= transactionsTotalPages,
              className: 'px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            },
            'Next'
          )
        )
      ),

      // Quick Actions
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow p-6' },
        React.createElement('h3', { className: 'text-lg font-medium text-gray-900 mb-4' }, '⚡ Quick Actions'),
        React.createElement(
          'div',
          { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
          React.createElement(
            'button',
            {
              onClick: loadInventoryData,
              disabled: loading,
              className: 'px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center'
            },
            React.createElement('span', { className: 'mr-2' }, '🔄'),
            loading ? 'Refreshing...' : 'Refresh Inventory'
          ),
          React.createElement(
            'button',
            {
              onClick: () => {
                setFilterCategory('');
                setSearchTerm('');
                setActiveTab('list');
              },
              className: 'px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center'
            },
            React.createElement('span', { className: 'mr-2' }, '📦'),
            'View All Medicines'
          ),
          React.createElement(
            'button',
            {
              onClick: () => {
                setActiveTab('add');
              },
              className: 'px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center'
            },
            React.createElement('span', { className: 'mr-2' }, '➕'),
            'Add New Medicine'
          )
        )
      )
    ),

    // Order Management Tab
    activeTab === 'orders' && React.createElement(
      OrderManagement,
      {
        onBack: () => setActiveTab('list')
      }
    ),

    // Import Catalog Tab
    activeTab === 'import' && React.createElement(
      ImportCatalogWizard,
      {
        onBack: () => setActiveTab('list'),
        onSuccess: () => {
          loadMedicines(); // Reload medicines after successful import
          setActiveTab('list'); // Switch back to list view
        }
      }
    )
  );
};

export default MedicineManagement;