import React, { useState, useEffect, useRef } from 'react';
import medicineService from '../../lib/api/services/medicineService';

const MedicineSearchAutocomplete = ({ onSelect, placeholder = "Search medicines...", className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.atcCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered.slice(0, 10)); // Limit to 10 results
      setIsOpen(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setFilteredMedicines([]);
      setIsOpen(false);
    }
  }, [searchTerm, medicines]);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const response = await medicineService.getMedicines({ limit: 1000 });
      setMedicines(response.data.medicines || []);
    } catch (error) {
      console.error('Error loading medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMedicineSelect = (medicine) => {
    setSearchTerm(medicine.name);
    setIsOpen(false);
    onSelect(medicine);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredMedicines.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredMedicines.length) {
          handleMedicineSelect(filteredMedicines[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = (e) => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  const getStockStatusColor = (medicine) => {
    if (medicine.stockQuantity <= medicine.lowStockThreshold) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-green-600 bg-green-100';
  };

  const getStockStatus = (medicine) => {
    if (medicine.stockQuantity <= medicine.lowStockThreshold) {
      return 'Low Stock';
    }
    return 'In Stock';
  };

  return React.createElement(
    'div',
    { className: `relative ${className}`, ref: dropdownRef },
    // Input field
    React.createElement(
      'input',
      {
        ref: inputRef,
        type: 'text',
        value: searchTerm,
        onChange: handleInputChange,
        onKeyDown: handleKeyDown,
        onBlur: handleBlur,
        onFocus: () => {
          if (filteredMedicines.length > 0) {
            setIsOpen(true);
          }
        },
        placeholder: placeholder,
        className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        autoComplete: 'off'
      }
    ),

    // Loading indicator
    loading && React.createElement(
      'div',
      { className: 'absolute right-3 top-3' },
      React.createElement(
        'div',
        { className: 'animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600' }
      )
    ),

    // Dropdown
    isOpen && filteredMedicines.length > 0 && React.createElement(
      'div',
      { 
        className: 'absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto',
        style: { top: '100%' }
      },
      ...filteredMedicines.map((medicine, index) => React.createElement(
        'div',
        {
          key: medicine.id,
          onClick: () => handleMedicineSelect(medicine),
          className: `px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
            index === selectedIndex ? 'bg-blue-50' : ''
          }`,
        },
        React.createElement(
          'div',
          { className: 'flex justify-between items-start' },
          React.createElement(
            'div',
            { className: 'flex-1' },
            React.createElement(
              'div',
              { className: 'flex items-center space-x-2' },
              React.createElement(
                'span',
                { className: 'font-medium text-gray-900' },
                medicine.name
              ),
              React.createElement(
                'span',
                { className: `px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(medicine)}` },
                getStockStatus(medicine)
              )
            ),
            medicine.genericName && React.createElement(
              'p',
              { className: 'text-sm text-gray-600 mt-1' },
              `Generic: ${medicine.genericName}`
            ),
            React.createElement(
              'div',
              { className: 'flex items-center space-x-4 mt-1 text-xs text-gray-500' },
              medicine.manufacturer && React.createElement(
                'span',
                null,
                `Manufacturer: ${medicine.manufacturer}`
              ),
              medicine.category && React.createElement(
                'span',
                null,
                `Category: ${medicine.category}`
              ),
              React.createElement(
                'span',
                { className: 'font-medium text-green-600' },
                `₹${medicine.price}`
              )
            ),
            medicine.atcCode && React.createElement(
              'p',
              { className: 'text-xs text-gray-400 mt-1' },
              `ATC Code: ${medicine.atcCode}`
            )
          )
        )
      ))
    ),

    // No results message
    isOpen && searchTerm.length >= 2 && filteredMedicines.length === 0 && !loading && React.createElement(
      'div',
      { className: 'absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg' },
      React.createElement(
        'div',
        { className: 'px-4 py-3 text-center text-gray-500' },
        'No medicines found matching your search'
      )
    )
  );
};

export default MedicineSearchAutocomplete;
