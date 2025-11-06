import React, { useState, useEffect } from 'react';
import admissionService from '../../lib/api/services/admissionService';
import dischargeService from '../../lib/api/services/dischargeService';
import userService from '../../lib/api/services/userService';
import { UserRole } from '../../lib/api/types';

const DischargeManagement = ({ onBack, isAuthenticated, user }) => {
  const [dischargedAdmissions, setDischargedAdmissions] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [dischargeSummary, setDischargeSummary] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const [editingSummary, setEditingSummary] = useState(null);

  const [summaryForm, setSummaryForm] = useState({
    doctorId: user?.role === 'DOCTOR' ? user.id : '',
    diagnosis: '',
    treatmentGiven: '',
    proceduresPerformed: '',
    medicationsPrescribed: '',
    followUpInstructions: '',
    nextAppointmentDate: '',
    notes: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadDischargedAdmissions();
      loadDoctors();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedAdmission) {
      loadDischargeSummary();
    }
  }, [selectedAdmission]);

  const loadDischargedAdmissions = async () => {
    setLoading(true);
    try {
      const response = await admissionService.getAdmissions({ status: 'DISCHARGED', page: 1, limit: 100 });
      setDischargedAdmissions(response.admissions || []);
      setError('');
    } catch (err) {
      setError('Failed to load discharged admissions');
      console.error('Error loading admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const doctorsData = await userService.getActiveDoctors();
      const ipdDoctors = []; // IPD handled by regular DOCTOR role
      setDoctors([...doctorsData, ...ipdDoctors]);
    } catch (err) {
      console.error('Error loading doctors:', err);
    }
  };

  const loadDischargeSummary = async () => {
    if (!selectedAdmission) return;
    setLoading(true);
    try {
      const summary = await dischargeService.getDischargeSummaryByAdmission(selectedAdmission.id);
      setDischargeSummary(summary);
      if (summary) {
        setSummaryForm({
          doctorId: summary.doctorId,
          diagnosis: summary.diagnosis,
          treatmentGiven: summary.treatmentGiven,
          proceduresPerformed: summary.proceduresPerformed || '',
          medicationsPrescribed: summary.medicationsPrescribed || '',
          followUpInstructions: summary.followUpInstructions || '',
          nextAppointmentDate: summary.nextAppointmentDate ? new Date(summary.nextAppointmentDate).toISOString().split('T')[0] : '',
          notes: summary.notes || '',
        });
      } else {
        setSummaryForm({
          doctorId: user?.role === 'DOCTOR' ? user.id : '',
          diagnosis: '',
          treatmentGiven: '',
          proceduresPerformed: '',
          medicationsPrescribed: '',
          followUpInstructions: '',
          nextAppointmentDate: '',
          notes: '',
        });
      }
      setError('');
    } catch (err) {
      setError('Failed to load discharge summary');
      console.error('Error loading discharge summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryInputChange = (e) => {
    const { name, value } = e.target;
    setSummaryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitSummary = async (e) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    setLoading(true);
    setError('');

    try {
      const summaryData = {
        admissionId: selectedAdmission.id,
        doctorId: summaryForm.doctorId,
        diagnosis: summaryForm.diagnosis,
        treatmentGiven: summaryForm.treatmentGiven,
        proceduresPerformed: summaryForm.proceduresPerformed || null,
        medicationsPrescribed: summaryForm.medicationsPrescribed || null,
        followUpInstructions: summaryForm.followUpInstructions || null,
        nextAppointmentDate: summaryForm.nextAppointmentDate || null,
        notes: summaryForm.notes || null,
      };

      if (editingSummary || dischargeSummary) {
        await dischargeService.updateDischargeSummary(dischargeSummary?.id || editingSummary.id, summaryData);
      } else {
        await dischargeService.createDischargeSummary(summaryData);
      }

      await loadDischargeSummary();
      setShowSummaryForm(false);
      setEditingSummary(null);
      setError('');
    } catch (err) {
      setError('Failed to save discharge summary');
      console.error('Error saving discharge summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const canManageSummary = ['ADMIN', 'DOCTOR'].includes(user?.role);

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
          '📋 Discharge Management'
        )
      )
    ),

    // Content
    React.createElement(
      'div',
      { style: { padding: '20px', display: 'flex', gap: '20px', minHeight: 'calc(100vh - 100px)' } },
      
      // Left Panel - Discharged Admissions
      React.createElement(
        'div',
        {
          style: {
            width: '400px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 140px)'
          }
        },
        React.createElement(
          'h3',
          { style: { marginTop: 0, marginBottom: '15px', color: '#333' } },
          'Discharged Patients'
        ),
        loading ? React.createElement('div', { style: { textAlign: 'center', padding: '20px' } }, 'Loading...') :
        dischargedAdmissions.length === 0 ? React.createElement(
          'div',
          { style: { textAlign: 'center', padding: '20px', color: '#666' } },
          'No discharged patients found'
        ) :
        React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
          ...dischargedAdmissions.map(admission => React.createElement(
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
              { style: { fontSize: '12px', color: '#666', marginBottom: '3px' } },
              `Admitted: ${new Date(admission.admissionDate).toLocaleDateString()}`
            ),
            React.createElement(
              'div',
              { style: { fontSize: '12px', color: '#666' } },
              `Discharged: ${admission.dischargeDate ? new Date(admission.dischargeDate).toLocaleDateString() : 'N/A'}`
            )
          ))
        )
      ),

      // Right Panel - Discharge Summary
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
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 140px)'
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
            'h3',
            { style: { margin: 0, color: '#333' } },
            `${selectedAdmission.patient?.name || 'Unknown'} - Discharge Summary`
          ),
          React.createElement(
            'div',
            { style: { fontSize: '14px', color: '#666', marginTop: '5px' } },
            `Admitted: ${new Date(selectedAdmission.admissionDate).toLocaleDateString()} | Discharged: ${selectedAdmission.dischargeDate ? new Date(selectedAdmission.dischargeDate).toLocaleDateString() : 'N/A'}`
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

        // Summary Form or View
        (showSummaryForm || !dischargeSummary) && canManageSummary ? React.createElement(
          'form',
          {
            onSubmit: handleSubmitSummary,
            style: {
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '6px'
            }
          },
          React.createElement(
            'h4',
            { style: { marginTop: 0 } },
            dischargeSummary || editingSummary ? 'Edit Discharge Summary' : 'Create Discharge Summary'
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
              { style: { gridColumn: 'span 2' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Doctor'),
              React.createElement('select', {
                name: 'doctorId',
                value: summaryForm.doctorId,
                onChange: handleSummaryInputChange,
                required: true,
                disabled: user?.role === 'DOCTOR' || user?.role === 'IPD_DOCTOR',
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              },
                React.createElement('option', { value: '' }, 'Select Doctor'),
                ...doctors.map(doctor => React.createElement('option', { key: doctor.id, value: doctor.id }, doctor.fullName))
              )
            ),
            React.createElement(
              'div',
              { style: { gridColumn: 'span 2' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Diagnosis *'),
              React.createElement('textarea', {
                name: 'diagnosis',
                value: summaryForm.diagnosis,
                onChange: handleSummaryInputChange,
                required: true,
                rows: 3,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              { style: { gridColumn: 'span 2' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Treatment Given *'),
              React.createElement('textarea', {
                name: 'treatmentGiven',
                value: summaryForm.treatmentGiven,
                onChange: handleSummaryInputChange,
                required: true,
                rows: 4,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              { style: { gridColumn: 'span 2' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Procedures Performed'),
              React.createElement('textarea', {
                name: 'proceduresPerformed',
                value: summaryForm.proceduresPerformed,
                onChange: handleSummaryInputChange,
                rows: 3,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              { style: { gridColumn: 'span 2' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Medications Prescribed'),
              React.createElement('textarea', {
                name: 'medicationsPrescribed',
                value: summaryForm.medicationsPrescribed,
                onChange: handleSummaryInputChange,
                rows: 3,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              { style: { gridColumn: 'span 2' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Follow-up Instructions'),
              React.createElement('textarea', {
                name: 'followUpInstructions',
                value: summaryForm.followUpInstructions,
                onChange: handleSummaryInputChange,
                rows: 3,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Next Appointment Date'),
              React.createElement('input', {
                type: 'date',
                name: 'nextAppointmentDate',
                value: summaryForm.nextAppointmentDate,
                onChange: handleSummaryInputChange,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              { style: { gridColumn: 'span 2' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Additional Notes'),
              React.createElement('textarea', {
                name: 'notes',
                value: summaryForm.notes,
                onChange: handleSummaryInputChange,
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
              loading ? 'Saving...' : 'Save Summary'
            ),
            dischargeSummary && React.createElement(
              'button',
              {
                type: 'button',
                onClick: () => {
                  setShowSummaryForm(false);
                  setEditingSummary(null);
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
        ) :
        dischargeSummary ? React.createElement(
          'div',
          { style: { backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '6px' } },
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }
            },
            React.createElement('h4', { style: { margin: 0 } }, 'Discharge Summary'),
            canManageSummary && React.createElement(
              'button',
              {
                onClick: () => {
                  setShowSummaryForm(true);
                  setEditingSummary(dischargeSummary);
                },
                style: {
                  backgroundColor: '#ffc107',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }
              },
              'Edit Summary'
            )
          ),
          React.createElement(
            'div',
            { style: { display: 'grid', gap: '15px' } },
            React.createElement(
              'div',
              null,
              React.createElement('strong', null, 'Doctor: '),
              dischargeSummary.doctor?.fullName || 'N/A'
            ),
            React.createElement(
              'div',
              null,
              React.createElement('strong', null, 'Diagnosis: '),
              React.createElement('div', { style: { marginTop: '5px', whiteSpace: 'pre-wrap' } }, dischargeSummary.diagnosis)
            ),
            React.createElement(
              'div',
              null,
              React.createElement('strong', null, 'Treatment Given: '),
              React.createElement('div', { style: { marginTop: '5px', whiteSpace: 'pre-wrap' } }, dischargeSummary.treatmentGiven)
            ),
            dischargeSummary.proceduresPerformed && React.createElement(
              'div',
              null,
              React.createElement('strong', null, 'Procedures Performed: '),
              React.createElement('div', { style: { marginTop: '5px', whiteSpace: 'pre-wrap' } }, dischargeSummary.proceduresPerformed)
            ),
            dischargeSummary.medicationsPrescribed && React.createElement(
              'div',
              null,
              React.createElement('strong', null, 'Medications Prescribed: '),
              React.createElement('div', { style: { marginTop: '5px', whiteSpace: 'pre-wrap' } }, dischargeSummary.medicationsPrescribed)
            ),
            dischargeSummary.followUpInstructions && React.createElement(
              'div',
              null,
              React.createElement('strong', null, 'Follow-up Instructions: '),
              React.createElement('div', { style: { marginTop: '5px', whiteSpace: 'pre-wrap' } }, dischargeSummary.followUpInstructions)
            ),
            dischargeSummary.nextAppointmentDate && React.createElement(
              'div',
              null,
              React.createElement('strong', null, 'Next Appointment: '),
              new Date(dischargeSummary.nextAppointmentDate).toLocaleDateString()
            ),
            dischargeSummary.notes && React.createElement(
              'div',
              null,
              React.createElement('strong', null, 'Notes: '),
              React.createElement('div', { style: { marginTop: '5px', whiteSpace: 'pre-wrap' } }, dischargeSummary.notes)
            )
          )
        ) :
        React.createElement(
          'div',
          { style: { textAlign: 'center', padding: '40px', color: '#666' } },
          'No discharge summary found. Only doctors can create discharge summaries.'
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
        'Please select a discharged patient to view discharge summary'
      )
    )
  );
};

export default DischargeManagement;

