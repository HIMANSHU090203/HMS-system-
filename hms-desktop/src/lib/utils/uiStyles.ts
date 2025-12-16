// Standardized UI Styles for HMS Desktop Application
// Based on Appointment Management UI pattern

import React from 'react';

export const uiStyles = {
  // Main container styles
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#F0F0F0',
    padding: '8px',
    minHeight: '100vh'
  },

  // White card container
  cardContainer: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #C8C8C8',
    padding: '8px 12px'
  },

  // Header section with title and action button
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: '1px solid #C8C8C8'
  },

  // Page title
  pageTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#000000',
    margin: 0
  },

  // Primary action button (blue)
  primaryButton: {
    backgroundColor: '#0078D4',
    color: '#FFFFFF',
    border: '1px solid #005A9E',
    padding: '4px 12px',
    borderRadius: '2px',
    fontSize: '13px',
    fontWeight: '400',
    cursor: 'pointer',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
  },

  primaryButtonHover: {
    backgroundColor: '#005A9E'
  },

  // Secondary button (gray)
  secondaryButton: {
    backgroundColor: '#F3F3F3',
    color: '#000000',
    border: '1px solid #C8C8C8',
    padding: '4px 12px',
    borderRadius: '2px',
    fontSize: '13px',
    fontWeight: '400',
    cursor: 'pointer',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)'
  },

  secondaryButtonHover: {
    backgroundColor: '#E8E8E8'
  },

  // Success button (green)
  successButton: {
    backgroundColor: '#28A745',
    color: '#FFFFFF',
    border: '1px solid #1E7E34',
    padding: '4px 12px',
    borderRadius: '2px',
    fontSize: '13px',
    fontWeight: '400',
    cursor: 'pointer',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
  },

  successButtonHover: {
    backgroundColor: '#1E7E34'
  },

  // Danger button (red)
  dangerButton: {
    backgroundColor: '#DC3545',
    color: '#FFFFFF',
    border: '1px solid #C82333',
    padding: '4px 12px',
    borderRadius: '2px',
    fontSize: '13px',
    fontWeight: '400',
    cursor: 'pointer',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
  },

  dangerButtonHover: {
    backgroundColor: '#C82333'
  },

  // Search/Filter button (gray)
  searchButton: {
    backgroundColor: '#6C757D',
    color: '#FFFFFF',
    border: '1px solid #5A6268',
    padding: '4px 12px',
    borderRadius: '2px',
    fontSize: '13px',
    fontWeight: '400',
    cursor: 'pointer',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
  },

  searchButtonHover: {
    backgroundColor: '#5A6268'
  },

  // Input field styles
  inputField: {
    width: '100%',
    padding: '4px 8px',
    border: '1px solid #C8C8C8',
    borderRadius: '2px',
    fontSize: '13px',
    backgroundColor: '#FFFFFF',
    boxShadow: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },

  // Select/Dropdown styles
  selectField: {
    width: '100%',
    padding: '4px 8px',
    border: '1px solid #C8C8C8',
    borderRadius: '2px',
    fontSize: '13px',
    backgroundColor: '#FFFFFF',
    boxShadow: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },

  // Label styles
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#000000',
    marginBottom: '4px'
  },

  // Filter row container
  filterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    marginBottom: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #C8C8C8',
    padding: '6px 8px'
  },

  // Form section title
  formSectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#000000',
    margin: 0,
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: '1px solid #C8C8C8'
  },

  // Table container
  tableContainer: {
    overflowX: 'auto'
  },

  // Table styles (using Tailwind classes for consistency)
  table: 'min-w-full divide-y divide-gray-200',
  tableHead: 'bg-gray-50',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableBody: 'bg-white divide-y divide-gray-200',
  tableRow: 'hover:bg-gray-50',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
  tableCellBold: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900',

  // Empty state message
  emptyState: {
    textAlign: 'center',
    color: '#6B7280',
    padding: '40px 20px',
    fontSize: '14px'
  },

  // Error message
  errorMessage: {
    backgroundColor: '#FEE2E2',
    border: '1px solid #FECACA',
    color: '#991B1B',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '8px',
    fontSize: '13px'
  },

  // Success message
  successMessage: {
    backgroundColor: '#D1FAE5',
    border: '1px solid #A7F3D0',
    color: '#065F46',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '8px',
    fontSize: '13px'
  },

  // Loading spinner container
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px'
  }
};

// Helper function to create button with hover effects
export const createButton = (type: 'primary' | 'secondary' | 'success' | 'danger' | 'search', text: string, onClick: () => void, disabled?: boolean) => {
  const buttonStyles = {
    primary: uiStyles.primaryButton,
    secondary: uiStyles.secondaryButton,
    success: uiStyles.successButton,
    danger: uiStyles.dangerButton,
    search: uiStyles.searchButton
  };

  const hoverStyles = {
    primary: uiStyles.primaryButtonHover,
    secondary: uiStyles.secondaryButtonHover,
    success: uiStyles.successButtonHover,
    danger: uiStyles.dangerButtonHover,
    search: uiStyles.searchButtonHover
  };

  return React.createElement(
    'button',
    {
      onClick: disabled ? undefined : onClick,
      disabled: disabled,
      style: {
        ...buttonStyles[type],
        ...(disabled && { opacity: 0.6, cursor: 'not-allowed' })
      },
      onMouseOver: disabled ? undefined : (e: any) => {
        e.target.style.backgroundColor = hoverStyles[type].backgroundColor;
      },
      onMouseOut: disabled ? undefined : (e: any) => {
        e.target.style.backgroundColor = buttonStyles[type].backgroundColor;
      }
    },
    text
  );
};

// Import React for the helper function
import React from 'react';

