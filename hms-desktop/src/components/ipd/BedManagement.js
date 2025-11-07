import React, { useState, useEffect } from 'react';
import bedService from '../../lib/api/services/bedService';
import wardService from '../../lib/api/services/wardService';

const BedManagement = ({ onBack, isAuthenticated }) => {
  const [beds, setBeds] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWard, setFilterWard] = useState('');
  const [filterBedType, setFilterBedType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    wardId: '',
    bedNumber: '',
    bedType: 'GENERAL',
    notes: ''
  });

  const bedTypes = [
    { value: 'GENERAL', label: 'General Bed', icon: '🛏️' },
    { value: 'ICU', label: 'ICU Bed', icon: '🚨' },
    { value: 'PRIVATE', label: 'Private Bed', icon: '🏠' },
    { value: 'SEMI_PRIVATE', label: 'Semi-Private Bed', icon: '🏘️' },
    { value: 'ISOLATION', label: 'Isolation Bed', icon: '🦠' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadWards();
      loadBeds();
    } else {
      setError('Please login to access bed management');
    }
  }, [isAuthenticated, searchTerm, filterWard, filterBedType, filterStatus]);

  const loadWards = async () => {
    try {
      const response = await wardService.getWards({ page: 1, limit: 100 });
      setWards(response.wards || []);
    } catch (err) {
      console.error('Error loading wards:', err);
    }
  };

  const loadBeds = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100,
        ...(filterWard && { wardId: filterWard }),
        ...(filterBedType && { bedType: filterBedType }),
        ...(filterStatus && { 
          isOccupied: filterStatus === 'occupied' ? true : filterStatus === 'available' ? false : undefined,
          isActive: filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined
        })
      };
      
      console.log('🛏️ Loading beds with params:', params);
      const response = await bedService.getBeds(params);
      console.log('🛏️ Bed service response:', response);
      
      // Handle different response structures
      let bedsList = [];
      if (response && response.beds) {
        bedsList = Array.isArray(response.beds) ? response.beds : [];
      } else if (response && response.data && response.data.beds) {
        bedsList = Array.isArray(response.data.beds) ? response.data.beds : [];
      } else if (Array.isArray(response)) {
        bedsList = response;
      }
      
      console.log(`✅ Loaded ${bedsList.length} beds`);
      setBeds(bedsList);
      setError('');
    } catch (err) {
      console.error('❌ Error loading beds:', err);
      console.error('❌ Error response:', err.response?.data);
      if (err.response?.status === 401) {
        setError('Authentication required. Please login first.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load beds';
        setError(`❌ ${errorMsg}`);
      }
      setBeds([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.wardId) {
      setError('❌ Please select a ward');
      setLoading(false);
      return;
    }
    if (!formData.bedNumber || formData.bedNumber.trim() === '') {
      setError('❌ Please enter a bed number');
      setLoading(false);
      return;
    }

    try {
      console.log('📝 Submitting bed data:', {
        wardId: formData.wardId,
        bedNumber: formData.bedNumber,
        bedType: formData.bedType,
        notes: formData.notes?.substring(0, 50) || ''
      });

      const bedData = {
        wardId: formData.wardId.trim(),
        bedNumber: formData.bedNumber.trim(),
        bedType: formData.bedType,
        notes: formData.notes?.trim() || undefined
      };

      if (showEditForm && editingBed) {
        const updated = await bedService.updateBed(editingBed.id, bedData);
        console.log('✅ Bed updated:', updated);
        setShowEditForm(false);
        setEditingBed(null);
        setError('✅ Bed updated successfully!');
      } else {
        const created = await bedService.createBed(bedData);
        console.log('✅ Bed created:', created);
        setShowAddForm(false);
        setError('✅ Bed created successfully!');
      }

      // Reload all data
      await Promise.all([
        loadBeds(),
        loadWards()
      ]);

      // Reset form
      setFormData({
        wardId: '',
        bedNumber: '',
        bedType: 'GENERAL',
        notes: ''
      });

    } catch (err) {
      console.error('❌ Error saving bed:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        errors: err.response?.data?.errors,
        data: err.response?.data?.data
      });
      
      if (err.response?.status === 401) {
        setError('Authentication required. Please login first.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else if (err.response?.data?.message) {
        // Show detailed error message
        let errorMsg = err.response.data.message;
        
        // Add validation errors if present
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          const validationErrors = err.response.data.errors
            .map(e => `${e.path?.join('.') || 'Field'}: ${e.message}`)
            .join(', ');
          if (validationErrors) {
            errorMsg += ` (${validationErrors})`;
          }
        }
        
        setError(`❌ ${errorMsg}`);
      } else if (err.message) {
        setError(`❌ ${err.message}`);
      } else {
        setError('❌ Failed to save bed. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bed) => {
    setEditingBed(bed);
    setFormData({
      wardId: bed.wardId || '',
      bedNumber: bed.bedNumber || '',
      bedType: bed.bedType || 'GENERAL',
      notes: bed.notes || ''
    });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleDelete = async (bedId) => {
    if (!window.confirm('Are you sure you want to delete this bed? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await bedService.deleteBed(bedId);
      await loadBeds();
      setError('✅ Bed deleted successfully!');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication required. Please login first.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else {
        setError('❌ Failed to delete bed. Please try again.');
      }
      console.error('Error deleting bed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (bedId) => {
    setLoading(true);
    try {
      const bed = beds.find(b => b.id === bedId);
      if (bed) {
        await bedService.updateBed(bedId, { isActive: !bed.isActive });
        await loadBeds();
        setError('✅ Bed status updated successfully!');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Authentication required. Please login first.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } else {
        setError('❌ Failed to update bed status. Please try again.');
      }
      console.error('Error updating bed status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBedTypeInfo = (type) => {
    return bedTypes.find(t => t.value === type) || { value: type, label: type, icon: '🛏️' };
  };

  const getWardName = (wardId) => {
    const ward = wards.find(w => w.id === wardId);
    return ward ? ward.name : 'Unknown Ward';
  };

  const filteredBeds = beds.filter(bed => {
    const matchesSearch = bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bed.notes && bed.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         getWardName(bed.wardId).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const stats = {
    totalBeds: beds.length,
    occupiedBeds: beds.filter(b => b.isOccupied).length,
    availableBeds: beds.filter(b => !b.isOccupied && b.isActive).length,
    activeBeds: beds.filter(b => b.isActive).length,
    inactiveBeds: beds.filter(b => !b.isActive).length
  };

  return React.createElement(
    'div',
    { style: { minHeight: '100vh', backgroundColor: '#f8f9fa' } },
    
    // Header
    React.createElement(
      'div',
      {
        style: {
          backgroundColor: 'white',
          padding: '20px',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      },
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center' } },
        React.createElement(
          'button',
          {
            onClick: onBack,
            style: {
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '15px'
            }
          },
          '← Back to Dashboard'
        ),
        React.createElement(
          'span',
          { style: { fontSize: '24px', fontWeight: 'bold', color: '#333' } },
          '🛏️ Bed Management'
        )
      ),
      React.createElement(
        'button',
        {
          onClick: () => setShowAddForm(true),
          style: {
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }
        },
        '➕ Add New Bed'
      )
    ),

    // Content
    React.createElement(
      'div',
      { style: { padding: '20px' } },

      // Statistics Cards
      React.createElement(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }
        },
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { fontSize: '24px', marginBottom: '8px' } },
            '🛏️'
          ),
          React.createElement(
            'div',
            { style: { fontSize: '28px', fontWeight: 'bold', color: '#007bff' } },
            stats.totalBeds
          ),
          React.createElement(
            'div',
            { style: { color: '#666', fontSize: '14px' } },
            'Total Beds'
          )
        ),
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { fontSize: '24px', marginBottom: '8px' } },
            '👥'
          ),
          React.createElement(
            'div',
            { style: { fontSize: '28px', fontWeight: 'bold', color: '#dc3545' } },
            stats.occupiedBeds
          ),
          React.createElement(
            'div',
            { style: { color: '#666', fontSize: '14px' } },
            'Occupied Beds'
          )
        ),
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { fontSize: '24px', marginBottom: '8px' } },
            '🆓'
          ),
          React.createElement(
            'div',
            { style: { fontSize: '28px', fontWeight: 'bold', color: '#28a745' } },
            stats.availableBeds
          ),
          React.createElement(
            'div',
            { style: { color: '#666', fontSize: '14px' } },
            'Available Beds'
          )
        ),
        React.createElement(
          'div',
          {
            style: {
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }
          },
          React.createElement(
            'div',
            { style: { fontSize: '24px', marginBottom: '8px' } },
            '✅'
          ),
          React.createElement(
            'div',
            { style: { fontSize: '28px', fontWeight: 'bold', color: '#17a2b8' } },
            stats.activeBeds
          ),
          React.createElement(
            'div',
            { style: { color: '#666', fontSize: '14px' } },
            'Active Beds'
          )
        )
      ),

      // Search and Filters
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              alignItems: 'end'
            }
          },
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } },
              'Search Beds'
            ),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Search by bed number, ward, or notes...',
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              style: {
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }
            })
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } },
              'Filter by Ward'
            ),
            React.createElement(
              'select',
              {
                value: filterWard,
                onChange: (e) => setFilterWard(e.target.value),
                style: {
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }
              },
              React.createElement('option', { value: '' }, 'All Wards'),
              ...wards.map(ward => React.createElement(
                'option',
                { key: ward.id, value: ward.id },
                ward.name
              ))
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } },
              'Filter by Bed Type'
            ),
            React.createElement(
              'select',
              {
                value: filterBedType,
                onChange: (e) => setFilterBedType(e.target.value),
                style: {
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }
              },
              React.createElement('option', { value: '' }, 'All Types'),
              ...bedTypes.map(type => React.createElement(
                'option',
                { key: type.value, value: type.value },
                `${type.icon} ${type.label}`
              ))
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement(
              'label',
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } },
              'Filter by Status'
            ),
            React.createElement(
              'select',
              {
                value: filterStatus,
                onChange: (e) => setFilterStatus(e.target.value),
                style: {
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }
              },
              React.createElement('option', { value: '' }, 'All Status'),
              React.createElement('option', { value: 'occupied' }, 'Occupied'),
              React.createElement('option', { value: 'available' }, 'Available'),
              React.createElement('option', { value: 'active' }, 'Active'),
              React.createElement('option', { value: 'inactive' }, 'Inactive')
            )
          )
        )
      ),

      // Error/Success Message
      error && React.createElement(
        'div',
        {
          style: {
            backgroundColor: error.includes('✅') ? '#d4edda' : '#f8d7da',
            color: error.includes('✅') ? '#155724' : '#721c24',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            border: `1px solid ${error.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }
        },
        error
      ),

      // Beds Table
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        },
        React.createElement(
          'div',
          {
            style: {
              padding: '20px',
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }
          },
          React.createElement(
            'h3',
            { style: { margin: '0', color: '#333' } },
            `Beds (${filteredBeds.length})`
          ),
          loading && React.createElement(
            'div',
            { style: { color: '#007bff' } },
            'Loading...'
          )
        ),
        React.createElement(
          'div',
          { style: { overflowX: 'auto' } },
          React.createElement(
            'table',
            {
              style: {
                width: '100%',
                borderCollapse: 'collapse'
              }
            },
            React.createElement(
              'thead',
              {
                style: {
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #dee2e6'
                }
              },
              React.createElement(
                'tr',
                null,
                React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: 'bold' } }, 'Bed Number'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: 'bold' } }, 'Ward'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: 'bold' } }, 'Bed Type'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: 'bold' } }, 'Status'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: 'bold' } }, 'Occupancy'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left', fontWeight: 'bold' } }, 'Notes'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'center', fontWeight: 'bold' } }, 'Actions')
              )
            ),
            React.createElement(
              'tbody',
              null,
              filteredBeds.length === 0 ? React.createElement(
                'tr',
                null,
                React.createElement(
                  'td',
                  { colSpan: 7, style: { padding: '40px', textAlign: 'center', color: '#666' } },
                  'No beds found matching your criteria.'
                )
              ) : filteredBeds.map((bed, index) => {
                const typeInfo = getBedTypeInfo(bed.bedType);
                const wardName = getWardName(bed.wardId);
                
                return React.createElement(
                  'tr',
                  {
                    key: bed.id,
                    style: {
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'
                    }
                  },
                  React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'div',
                      { style: { fontWeight: 'bold', color: '#333' } },
                      bed.bedNumber
                    )
                  ),
                  React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'span',
                      {
                        style: {
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          backgroundColor: '#e7f3ff',
                          color: '#0066cc',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }
                      },
                      `🏥 ${wardName}`
                    )
                  ),
                  React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'span',
                      {
                        style: {
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          backgroundColor: '#f8f9fa',
                          color: '#495057',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }
                      },
                      `${typeInfo.icon} ${typeInfo.label}`
                    )
                  ),
                  React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'span',
                      {
                        style: {
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: bed.isActive ? '#d4edda' : '#f8d7da',
                          color: bed.isActive ? '#155724' : '#721c24'
                        }
                      },
                      bed.isActive ? '✅ Active' : '❌ Inactive'
                    )
                  ),
                  React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'span',
                      {
                        style: {
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: bed.isOccupied ? '#f8d7da' : '#d4edda',
                          color: bed.isOccupied ? '#721c24' : '#155724'
                        }
                      },
                      bed.isOccupied ? '👥 Occupied' : '🆓 Available'
                    )
                  ),
                  React.createElement(
                    'td',
                    { style: { padding: '12px', maxWidth: '200px' } },
                    bed.notes ? React.createElement(
                      'div',
                      { 
                        style: { 
                          fontSize: '12px', 
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        },
                        title: bed.notes
                      },
                      bed.notes
                    ) : '-'
                  ),
                  React.createElement(
                    'td',
                    { style: { padding: '12px', textAlign: 'center' } },
                    React.createElement(
                      'div',
                      {
                        style: {
                          display: 'flex',
                          gap: '5px',
                          justifyContent: 'center',
                          flexWrap: 'wrap'
                        }
                      },
                      React.createElement(
                        'button',
                        {
                          onClick: () => handleEdit(bed),
                          style: {
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }
                        },
                        '✏️ Edit'
                      ),
                      React.createElement(
                        'button',
                        {
                          onClick: () => handleToggleStatus(bed.id),
                          style: {
                            backgroundColor: bed.isActive ? '#dc3545' : '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }
                        },
                        bed.isActive ? '❌ Deactivate' : '✅ Activate'
                      ),
                      React.createElement(
                        'button',
                        {
                          onClick: () => handleDelete(bed.id),
                          style: {
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }
                        },
                        '🗑️ Delete'
                      )
                    )
                  )
                );
              })
            )
          )
        )
      )
    ),

    // Add/Edit Bed Modal
    (showAddForm || showEditForm) && React.createElement(
      'div',
      {
        style: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }
      },
      React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }
        },
        // Close button
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () => {
              setShowAddForm(false);
              setShowEditForm(false);
              setEditingBed(null);
              setFormData({
                bedNumber: '',
                wardId: '',
                bedType: 'GENERAL',
                status: 'AVAILABLE',
                notes: ''
              });
            },
            style: { 
              position: 'absolute', 
              top: '16px', 
              right: '16px', 
              backgroundColor: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '4px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: '4px', 
              transition: 'background-color 0.2s',
              zIndex: 10
            },
            onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; },
            onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
          },
          React.createElement(
            'svg',
            { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: '#6B7280', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
            React.createElement('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
            React.createElement('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
          )
        ),
        React.createElement(
          'h3',
          { style: { margin: '0 0 20px 0', color: '#333', paddingRight: '32px' } },
          showEditForm ? '✏️ Edit Bed' : '➕ Add New Bed'
        ),
        React.createElement(
          'form',
          { onSubmit: handleSubmit },
          React.createElement(
            'div',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '15px'
              }
            },
            React.createElement(
              'div',
              null,
              React.createElement(
                'label',
                { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } },
                'Ward *'
              ),
              React.createElement(
                'select',
                {
                  name: 'wardId',
                  required: true,
                  value: formData.wardId,
                  onChange: handleInputChange,
                  style: {
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }
                },
                React.createElement('option', { value: '' }, 'Select Ward'),
                ...wards.map(ward => React.createElement(
                  'option',
                  { key: ward.id, value: ward.id },
                  ward.name
                ))
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'label',
                { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } },
                'Bed Number *'
              ),
              React.createElement('input', {
                type: 'text',
                name: 'bedNumber',
                required: true,
                value: formData.bedNumber,
                onChange: handleInputChange,
                style: {
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }
              })
            )
          ),
          React.createElement(
            'div',
            { style: { marginBottom: '15px' } },
            React.createElement(
              'label',
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } },
              'Bed Type *'
            ),
            React.createElement(
              'select',
              {
                name: 'bedType',
                required: true,
                value: formData.bedType,
                onChange: handleInputChange,
                style: {
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }
              },
              ...bedTypes.map(type => React.createElement(
                'option',
                { key: type.value, value: type.value },
                `${type.icon} ${type.label}`
              ))
            )
          ),
          React.createElement(
            'div',
            { style: { marginBottom: '20px' } },
            React.createElement(
              'label',
              { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } },
              'Notes'
            ),
            React.createElement('textarea', {
              name: 'notes',
              rows: 3,
              value: formData.notes,
              onChange: handleInputChange,
              style: {
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                resize: 'vertical'
              }
            })
          ),
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end'
              }
            },
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: () => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  setEditingBed(null);
                  setFormData({
                    wardId: '',
                    bedNumber: '',
                    bedType: 'GENERAL',
                    notes: ''
                  });
                },
                style: {
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }
              },
              'Cancel'
            ),
            React.createElement(
              'button',
              {
                type: 'submit',
                disabled: loading,
                style: {
                  backgroundColor: loading ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }
              },
              loading ? 'Saving...' : (showEditForm ? 'Update Bed' : 'Create Bed')
            )
          )
        )
      )
    )
  );
};

export default BedManagement;
