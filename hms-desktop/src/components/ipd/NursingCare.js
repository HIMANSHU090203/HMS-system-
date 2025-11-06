import React, { useState, useEffect } from 'react';
import admissionService from '../../lib/api/services/admissionService';
import nursingShiftService, { ShiftType } from '../../lib/api/services/nursingShiftService';
import userService from '../../lib/api/services/userService';
import { UserRole } from '../../lib/api/types';

const NursingCare = ({ onBack, isAuthenticated, user }) => {
  const [currentAdmissions, setCurrentAdmissions] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [nursingShifts, setNursingShifts] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [filterShiftType, setFilterShiftType] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('');

  const [shiftForm, setShiftForm] = useState({
    nurseId: user?.role === 'NURSE' ? user.id : '',
    shiftType: 'MORNING',
    shiftDate: new Date().toISOString().split('T')[0],
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    notes: '',
    medications: [],
    isCompleted: false,
  });

  const shiftTypes = [
    { value: 'MORNING', label: 'Morning Shift', icon: '🌅' },
    { value: 'AFTERNOON', label: 'Afternoon Shift', icon: '☀️' },
    { value: 'NIGHT', label: 'Night Shift', icon: '🌙' },
    { value: 'GENERAL', label: 'General Shift', icon: '⏰' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadCurrentAdmissions();
      loadNurses();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedAdmission) {
      loadNursingShifts();
    }
  }, [selectedAdmission, filterShiftType, filterCompleted]);

  const loadCurrentAdmissions = async () => {
    setLoading(true);
    try {
      const admissions = await admissionService.getCurrentAdmissions();
      setCurrentAdmissions(admissions);
      if (admissions.length > 0 && !selectedAdmission) {
        setSelectedAdmission(admissions[0]);
      }
      setError('');
    } catch (err) {
      setError('Failed to load admissions');
      console.error('Error loading admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNurses = async () => {
    try {
      const nursesData = await userService.getUsersByRole(UserRole.NURSE);
      setNurses(nursesData);
    } catch (err) {
      console.error('Error loading nurses:', err);
    }
  };

  const loadNursingShifts = async () => {
    if (!selectedAdmission) return;
    setLoading(true);
    try {
      const params = {
        admissionId: selectedAdmission.id,
        ...(filterShiftType && { shiftType: filterShiftType }),
        ...(filterCompleted !== '' && { isCompleted: filterCompleted === 'true' }),
      };
      const response = await nursingShiftService.getNursingShifts(params);
      setNursingShifts(response.nursingShifts || []);
      setError('');
    } catch (err) {
      setError('Failed to load nursing shifts');
      console.error('Error loading nursing shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShiftInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShiftForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitShift = async (e) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    setLoading(true);
    setError('');

    try {
      const shiftData = {
        admissionId: selectedAdmission.id,
        nurseId: shiftForm.nurseId,
        shiftType: shiftForm.shiftType,
        shiftDate: shiftForm.shiftDate,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime || null,
        notes: shiftForm.notes || null,
        medications: shiftForm.medications,
        isCompleted: shiftForm.isCompleted,
      };

      if (editingShift) {
        await nursingShiftService.updateNursingShift(editingShift.id, shiftData);
      } else {
        await nursingShiftService.createNursingShift(shiftData);
      }

      await loadNursingShifts();
      setShowShiftForm(false);
      setEditingShift(null);
      resetShiftForm();
      setError('');
    } catch (err) {
      setError('Failed to save nursing shift');
      console.error('Error saving nursing shift:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetShiftForm = () => {
    setShiftForm({
      nurseId: user?.role === 'NURSE' ? user.id : '',
      shiftType: 'MORNING',
      shiftDate: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString().slice(0, 16),
      endTime: '',
      notes: '',
      medications: [],
      isCompleted: false,
    });
  };

  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setShiftForm({
      nurseId: shift.nurseId,
      shiftType: shift.shiftType,
      shiftDate: new Date(shift.shiftDate).toISOString().split('T')[0],
      startTime: new Date(shift.startTime).toISOString().slice(0, 16),
      endTime: shift.endTime ? new Date(shift.endTime).toISOString().slice(0, 16) : '',
      notes: shift.notes || '',
      medications: shift.medications || [],
      isCompleted: shift.isCompleted,
    });
    setShowShiftForm(true);
  };

  const handleDeleteShift = async (id) => {
    if (!window.confirm('Are you sure you want to delete this nursing shift?')) return;

    setLoading(true);
    try {
      await nursingShiftService.deleteNursingShift(id);
      await loadNursingShifts();
      setError('');
    } catch (err) {
      setError('Failed to delete nursing shift');
      console.error('Error deleting nursing shift:', err);
    } finally {
      setLoading(false);
    }
  };

  const canManageShifts = ['ADMIN', 'WARD_MANAGER', 'NURSE', 'NURSING_SUPERVISOR'].includes(user?.role);

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
        { style: { display: 'flex', alignItems: 'center', gap: '15px' } },
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
              cursor: 'pointer'
            }
          },
          '← Back'
        ),
        React.createElement(
          'span',
          { style: { fontSize: '24px', fontWeight: 'bold', color: '#333' } },
          '👩‍⚕️ Nursing Care Management'
        )
      )
    ),

    // Content
    React.createElement(
      'div',
      { style: { padding: '20px', display: 'flex', gap: '20px', height: 'calc(100vh - 100px)' } },
      
      // Left Panel - Patient Selection
      React.createElement(
        'div',
        {
          style: {
            width: '350px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflowY: 'auto'
          }
        },
        React.createElement(
          'h3',
          { style: { marginTop: 0, marginBottom: '15px', color: '#333' } },
          'Current Admissions'
        ),
        loading ? React.createElement('div', { style: { textAlign: 'center', padding: '20px' } }, 'Loading...') :
        currentAdmissions.length === 0 ? React.createElement(
          'div',
          { style: { textAlign: 'center', padding: '20px', color: '#666' } },
          'No current admissions'
        ) :
        React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
          ...currentAdmissions.map(admission => React.createElement(
            'div',
            {
              key: admission.id,
              onClick: () => setSelectedAdmission(admission),
              style: {
                padding: '15px',
                border: selectedAdmission?.id === admission.id ? '2px solid #007bff' : '1px solid #dee2e6',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedAdmission?.id === admission.id ? '#e7f3ff' : 'white',
                transition: 'all 0.2s'
              }
            },
            React.createElement(
              'div',
              { style: { fontWeight: 'bold', color: '#333', marginBottom: '5px' } },
              admission.patient?.name || 'Unknown Patient'
            ),
            React.createElement(
              'div',
              { style: { fontSize: '12px', color: '#666' } },
              `Ward: ${admission.ward?.name || 'N/A'} | Bed: ${admission.bed?.bedNumber || 'N/A'}`
            )
          ))
        )
      ),

      // Right Panel - Nursing Shifts
      selectedAdmission ? React.createElement(
        'div',
        {
          style: {
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }
        },
        // Patient Info Header
        React.createElement(
          'div',
          {
            style: {
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              marginBottom: '20px'
            }
          },
          React.createElement(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            React.createElement(
              'div',
              null,
              React.createElement(
                'h3',
                { style: { margin: 0, color: '#333' } },
                `${selectedAdmission.patient?.name || 'Unknown'} - ${selectedAdmission.ward?.name || 'N/A'} / Bed ${selectedAdmission.bed?.bedNumber || 'N/A'}`
              )
            ),
            React.createElement(
              'button',
              {
                onClick: loadNursingShifts,
                disabled: loading,
                style: {
                  backgroundColor: loading ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }
              },
              loading ? '🔄 Refreshing...' : '🔄 Refresh'
            )
          )
        ),

        // Filters and Add Button
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              gap: '15px'
            }
          },
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '10px', flex: 1 } },
            React.createElement(
              'select',
              {
                value: filterShiftType,
                onChange: (e) => setFilterShiftType(e.target.value),
                style: {
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  flex: 1
                }
              },
              React.createElement('option', { value: '' }, 'All Shift Types'),
              ...shiftTypes.map(st => React.createElement('option', { key: st.value, value: st.value }, st.label))
            ),
            React.createElement(
              'select',
              {
                value: filterCompleted,
                onChange: (e) => setFilterCompleted(e.target.value),
                style: {
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  flex: 1
                }
              },
              React.createElement('option', { value: '' }, 'All Status'),
              React.createElement('option', { value: 'true' }, 'Completed'),
              React.createElement('option', { value: 'false' }, 'Pending')
            )
          ),
          canManageShifts && React.createElement(
            'button',
            {
              onClick: () => {
                setShowShiftForm(true);
                setEditingShift(null);
                resetShiftForm();
              },
              style: {
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }
            },
            '+ Add Shift'
          )
        ),

        // Error Message
        error && React.createElement(
          'div',
          {
            style: {
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px'
            }
          },
          error
        ),

        // Shift Form
        showShiftForm && React.createElement(
          'form',
          {
            onSubmit: handleSubmitShift,
            style: {
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '6px',
              marginBottom: '20px'
            }
          },
          React.createElement(
            'h5',
            { style: { marginTop: 0 } },
            editingShift ? 'Edit Nursing Shift' : 'Add New Nursing Shift'
          ),
          React.createElement(
            'div',
            {
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '15px'
              }
            },
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Nurse'),
              React.createElement('select', {
                name: 'nurseId',
                value: shiftForm.nurseId,
                onChange: handleShiftInputChange,
                required: true,
                disabled: user?.role === 'NURSE',
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              },
                React.createElement('option', { value: '' }, 'Select Nurse'),
                ...nurses.map(nurse => React.createElement('option', { key: nurse.id, value: nurse.id }, nurse.fullName))
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Shift Type'),
              React.createElement('select', {
                name: 'shiftType',
                value: shiftForm.shiftType,
                onChange: handleShiftInputChange,
                required: true,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              },
                ...shiftTypes.map(st => React.createElement('option', { key: st.value, value: st.value }, st.label))
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Shift Date'),
              React.createElement('input', {
                type: 'date',
                name: 'shiftDate',
                value: shiftForm.shiftDate,
                onChange: handleShiftInputChange,
                required: true,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Start Time'),
              React.createElement('input', {
                type: 'datetime-local',
                name: 'startTime',
                value: shiftForm.startTime,
                onChange: handleShiftInputChange,
                required: true,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'End Time'),
              React.createElement('input', {
                type: 'datetime-local',
                name: 'endTime',
                value: shiftForm.endTime,
                onChange: handleShiftInputChange,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }
              },
              React.createElement('input', {
                type: 'checkbox',
                name: 'isCompleted',
                checked: shiftForm.isCompleted,
                onChange: handleShiftInputChange,
                id: 'isCompleted'
              }),
              React.createElement('label', { htmlFor: 'isCompleted', style: { margin: 0 } }, 'Shift Completed')
            ),
            React.createElement(
              'div',
              { style: { gridColumn: 'span 2' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Notes'),
              React.createElement('textarea', {
                name: 'notes',
                value: shiftForm.notes,
                onChange: handleShiftInputChange,
                rows: 3,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            )
          ),
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                gap: '10px',
                marginTop: '15px'
              }
            },
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
              loading ? 'Saving...' : 'Save'
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: () => {
                  setShowShiftForm(false);
                  setEditingShift(null);
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
            )
          )
        ),

        // Nursing Shifts Table
        React.createElement(
          'div',
          { style: { overflowX: 'auto' } },
          nursingShifts.length === 0 ? React.createElement(
            'div',
            { style: { textAlign: 'center', padding: '40px', color: '#666' } },
            'No nursing shifts recorded yet'
          ) :
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
              null,
              React.createElement(
                'tr',
                { style: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' } },
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Date'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Nurse'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Shift Type'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Start Time'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'End Time'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Status'),
                canManageShifts && React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Actions')
              )
            ),
            React.createElement(
              'tbody',
              null,
              ...nursingShifts.map((shift, idx) => React.createElement(
                'tr',
                {
                  key: shift.id,
                  style: {
                    borderBottom: '1px solid #dee2e6',
                    backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa'
                  }
                },
                React.createElement('td', { style: { padding: '12px' } }, new Date(shift.shiftDate).toLocaleDateString()),
                React.createElement('td', { style: { padding: '12px' } }, shift.nurse?.fullName || '-'),
                React.createElement('td', { style: { padding: '12px' } }, shiftTypes.find(st => st.value === shift.shiftType)?.label || shift.shiftType),
                React.createElement('td', { style: { padding: '12px' } }, new Date(shift.startTime).toLocaleString()),
                React.createElement('td', { style: { padding: '12px' } }, shift.endTime ? new Date(shift.endTime).toLocaleString() : '-'),
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
                        backgroundColor: shift.isCompleted ? '#28a74520' : '#ffc10720',
                        color: shift.isCompleted ? '#28a745' : '#ffc107'
                      }
                    },
                    shift.isCompleted ? 'Completed' : 'Pending'
                  )
                ),
                canManageShifts && React.createElement(
                  'td',
                  { style: { padding: '12px' } },
                  React.createElement(
                    'div',
                    { style: { display: 'flex', gap: '5px' } },
                    React.createElement(
                      'button',
                      {
                        onClick: () => handleEditShift(shift),
                        style: {
                          backgroundColor: '#ffc107',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }
                      },
                      'Edit'
                    ),
                    React.createElement(
                      'button',
                      {
                        onClick: () => handleDeleteShift(shift.id),
                        style: {
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }
                      },
                      'Delete'
                    )
                  )
                )
              ))
            )
          )
        )
      ) :
      React.createElement(
        'div',
        {
          style: {
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            color: '#666'
          }
        },
        'Please select a patient admission to view nursing shifts'
      )
    )
  );
};

export default NursingCare;

