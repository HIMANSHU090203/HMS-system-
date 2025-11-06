import React, { useState, useEffect } from 'react';
import admissionService from '../../lib/api/services/admissionService';
import dailyRoundService from '../../lib/api/services/dailyRoundService';
import vitalSignService from '../../lib/api/services/vitalSignService';
import userService from '../../lib/api/services/userService';
import { UserRole } from '../../lib/api/types';

const PatientCare = ({ onBack, isAuthenticated, user }) => {
  const [currentAdmissions, setCurrentAdmissions] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [dailyRounds, setDailyRounds] = useState([]);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('vital-signs'); // 'vital-signs' or 'daily-rounds'
  const [showVitalSignForm, setShowVitalSignForm] = useState(false);
  const [showDailyRoundForm, setShowDailyRoundForm] = useState(false);
  const [editingVitalSign, setEditingVitalSign] = useState(null);
  const [editingDailyRound, setEditingDailyRound] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const [vitalSignForm, setVitalSignForm] = useState({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    notes: '',
  });

  const [dailyRoundForm, setDailyRoundForm] = useState({
    doctorId: user?.role === 'DOCTOR' ? user.id : '',
    roundDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    notes: '',
    nextRoundDate: '',
    isCompleted: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadCurrentAdmissions();
      loadDoctors();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedAdmission) {
      loadAdmissionData();
    }
  }, [selectedAdmission]);

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

  const loadDoctors = async () => {
    try {
      const doctorsData = await userService.getActiveDoctors();
      const ipdDoctors = []; // IPD handled by regular DOCTOR role
      setDoctors([...doctorsData, ...ipdDoctors]);
    } catch (err) {
      console.error('Error loading doctors:', err);
    }
  };

  const loadAdmissionData = async () => {
    if (!selectedAdmission) return;
    setLoading(true);
    try {
      const [roundsData, vitalData] = await Promise.all([
        dailyRoundService.getAdmissionDailyRounds(selectedAdmission.id),
        vitalSignService.getAdmissionVitalSigns(selectedAdmission.id),
      ]);
      setDailyRounds(roundsData);
      setVitalSigns(vitalData);
      setError('');
    } catch (err) {
      setError('Failed to load patient care data');
      console.error('Error loading admission data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVitalSignInputChange = (e) => {
    const { name, value } = e.target;
    setVitalSignForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDailyRoundInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDailyRoundForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitVitalSign = async (e) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    setLoading(true);
    setError('');

    try {
      const vitalSignData = {
        admissionId: selectedAdmission.id,
        recordedBy: user.id,
        temperature: vitalSignForm.temperature ? parseFloat(vitalSignForm.temperature) : null,
        bloodPressure: vitalSignForm.bloodPressure || null,
        heartRate: vitalSignForm.heartRate ? parseInt(vitalSignForm.heartRate) : null,
        respiratoryRate: vitalSignForm.respiratoryRate ? parseInt(vitalSignForm.respiratoryRate) : null,
        oxygenSaturation: vitalSignForm.oxygenSaturation ? parseFloat(vitalSignForm.oxygenSaturation) : null,
        weight: vitalSignForm.weight ? parseFloat(vitalSignForm.weight) : null,
        height: vitalSignForm.height ? parseFloat(vitalSignForm.height) : null,
        notes: vitalSignForm.notes || null,
      };

      if (editingVitalSign) {
        await vitalSignService.updateVitalSign(editingVitalSign.id, vitalSignData);
      } else {
        await vitalSignService.createVitalSign(vitalSignData);
      }

      await loadAdmissionData();
      setShowVitalSignForm(false);
      setEditingVitalSign(null);
      setVitalSignForm({
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: '',
        notes: '',
      });
      setError('');
    } catch (err) {
      setError('Failed to save vital sign');
      console.error('Error saving vital sign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDailyRound = async (e) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    setLoading(true);
    setError('');

    try {
      const roundData = {
        admissionId: selectedAdmission.id,
        doctorId: dailyRoundForm.doctorId,
        roundDate: dailyRoundForm.roundDate,
        diagnosis: dailyRoundForm.diagnosis,
        treatment: dailyRoundForm.treatment,
        notes: dailyRoundForm.notes || null,
        nextRoundDate: dailyRoundForm.nextRoundDate || null,
        isCompleted: dailyRoundForm.isCompleted,
      };

      if (editingDailyRound) {
        await dailyRoundService.updateDailyRound(editingDailyRound.id, roundData);
      } else {
        await dailyRoundService.createDailyRound(roundData);
      }

      await loadAdmissionData();
      setShowDailyRoundForm(false);
      setEditingDailyRound(null);
      setDailyRoundForm({
        doctorId: user?.role === 'DOCTOR' ? user.id : '',
        roundDate: new Date().toISOString().split('T')[0],
        diagnosis: '',
        treatment: '',
        notes: '',
        nextRoundDate: '',
        isCompleted: false,
      });
      setError('');
    } catch (err) {
      setError('Failed to save daily round');
      console.error('Error saving daily round:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditVitalSign = (vitalSign) => {
    setEditingVitalSign(vitalSign);
    setVitalSignForm({
      temperature: vitalSign.temperature?.toString() || '',
      bloodPressure: vitalSign.bloodPressure || '',
      heartRate: vitalSign.heartRate?.toString() || '',
      respiratoryRate: vitalSign.respiratoryRate?.toString() || '',
      oxygenSaturation: vitalSign.oxygenSaturation?.toString() || '',
      weight: vitalSign.weight?.toString() || '',
      height: vitalSign.height?.toString() || '',
      notes: vitalSign.notes || '',
    });
    setShowVitalSignForm(true);
  };

  const handleEditDailyRound = (round) => {
    setEditingDailyRound(round);
    setDailyRoundForm({
      doctorId: round.doctorId,
      roundDate: new Date(round.roundDate).toISOString().split('T')[0],
      diagnosis: round.diagnosis,
      treatment: round.treatment,
      notes: round.notes || '',
      nextRoundDate: round.nextRoundDate ? new Date(round.nextRoundDate).toISOString().split('T')[0] : '',
      isCompleted: round.isCompleted,
    });
    setShowDailyRoundForm(true);
  };

  const handleDeleteVitalSign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vital sign record?')) return;

    setLoading(true);
    try {
      await vitalSignService.deleteVitalSign(id);
      await loadAdmissionData();
      setError('');
    } catch (err) {
      setError('Failed to delete vital sign');
      console.error('Error deleting vital sign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDailyRound = async (id) => {
    if (!window.confirm('Are you sure you want to delete this daily round?')) return;

    setLoading(true);
    try {
      await dailyRoundService.deleteDailyRound(id);
      await loadAdmissionData();
      setError('');
    } catch (err) {
      setError('Failed to delete daily round');
      console.error('Error deleting daily round:', err);
    } finally {
      setLoading(false);
    }
  };

  const canManageRounds = ['ADMIN', 'DOCTOR'].includes(user?.role);
  const canManageVitalSigns = ['ADMIN', 'DOCTOR', 'NURSE', 'WARD_MANAGER'].includes(user?.role);

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
          '🏥 Patient Care Management'
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
            ),
            React.createElement(
              'div',
              { style: { fontSize: '12px', color: '#666' } },
              `Admitted: ${new Date(admission.admissionDate).toLocaleDateString()}`
            )
          ))
        )
      ),

      // Right Panel - Patient Care Data
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
              ),
              React.createElement(
                'div',
                { style: { fontSize: '14px', color: '#666', marginTop: '5px' } },
                `Age: ${selectedAdmission.patient?.age || 'N/A'} | Gender: ${selectedAdmission.patient?.gender || 'N/A'}`
              )
            ),
            React.createElement(
              'button',
              {
                onClick: loadAdmissionData,
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

        // Tabs
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              borderBottom: '2px solid #dee2e6'
            }
          },
          React.createElement(
            'button',
            {
              onClick: () => setActiveTab('vital-signs'),
              style: {
                padding: '10px 20px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'vital-signs' ? '2px solid #007bff' : '2px solid transparent',
                color: activeTab === 'vital-signs' ? '#007bff' : '#666',
                cursor: 'pointer',
                fontWeight: activeTab === 'vital-signs' ? 'bold' : 'normal'
              }
            },
            '📊 Vital Signs'
          ),
          React.createElement(
            'button',
            {
              onClick: () => setActiveTab('daily-rounds'),
              style: {
                padding: '10px 20px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'daily-rounds' ? '2px solid #007bff' : '2px solid transparent',
                color: activeTab === 'daily-rounds' ? '#007bff' : '#666',
                cursor: 'pointer',
                fontWeight: activeTab === 'daily-rounds' ? 'bold' : 'normal'
              }
            },
            '👨‍⚕️ Daily Rounds'
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

        // Vital Signs Tab
        activeTab === 'vital-signs' && React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }
            },
            React.createElement(
              'h4',
              { style: { margin: 0 } },
              'Vital Signs Records'
            ),
            canManageVitalSigns && React.createElement(
              'button',
              {
                onClick: () => {
                  setShowVitalSignForm(true);
                  setEditingVitalSign(null);
                  setVitalSignForm({
                    temperature: '',
                    bloodPressure: '',
                    heartRate: '',
                    respiratoryRate: '',
                    oxygenSaturation: '',
                    weight: '',
                    height: '',
                    notes: '',
                  });
                },
                style: {
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }
              },
              '+ Add Vital Sign'
            )
          ),

          // Vital Signs Form
          showVitalSignForm && React.createElement(
            'form',
            {
              onSubmit: handleSubmitVitalSign,
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
              editingVitalSign ? 'Edit Vital Sign' : 'Add New Vital Sign'
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
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Temperature (°C)'),
                React.createElement('input', {
                  type: 'number',
                  name: 'temperature',
                  value: vitalSignForm.temperature,
                  onChange: handleVitalSignInputChange,
                  step: '0.1',
                  min: '30',
                  max: '45',
                  style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Blood Pressure'),
                React.createElement('input', {
                  type: 'text',
                  name: 'bloodPressure',
                  value: vitalSignForm.bloodPressure,
                  onChange: handleVitalSignInputChange,
                  placeholder: 'e.g., 120/80',
                  style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Heart Rate (bpm)'),
                React.createElement('input', {
                  type: 'number',
                  name: 'heartRate',
                  value: vitalSignForm.heartRate,
                  onChange: handleVitalSignInputChange,
                  min: '0',
                  max: '300',
                  style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Respiratory Rate'),
                React.createElement('input', {
                  type: 'number',
                  name: 'respiratoryRate',
                  value: vitalSignForm.respiratoryRate,
                  onChange: handleVitalSignInputChange,
                  min: '0',
                  max: '100',
                  style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'O2 Saturation (%)'),
                React.createElement('input', {
                  type: 'number',
                  name: 'oxygenSaturation',
                  value: vitalSignForm.oxygenSaturation,
                  onChange: handleVitalSignInputChange,
                  min: '0',
                  max: '100',
                  step: '0.1',
                  style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Weight (kg)'),
                React.createElement('input', {
                  type: 'number',
                  name: 'weight',
                  value: vitalSignForm.weight,
                  onChange: handleVitalSignInputChange,
                  min: '0',
                  step: '0.1',
                  style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Height (cm)'),
                React.createElement('input', {
                  type: 'number',
                  name: 'height',
                  value: vitalSignForm.height,
                  onChange: handleVitalSignInputChange,
                  min: '0',
                  step: '0.1',
                  style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
                })
              )
            ),
            React.createElement(
              'div',
              { style: { marginTop: '15px' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Notes'),
              React.createElement('textarea', {
                name: 'notes',
                value: vitalSignForm.notes,
                onChange: handleVitalSignInputChange,
                rows: 3,
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
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
                    setShowVitalSignForm(false);
                    setEditingVitalSign(null);
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

          // Vital Signs Table
          React.createElement(
            'div',
            { style: { overflowX: 'auto' } },
            vitalSigns.length === 0 ? React.createElement(
              'div',
              { style: { textAlign: 'center', padding: '40px', color: '#666' } },
              'No vital signs recorded yet'
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
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Recorded At'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Temp (°C)'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'BP'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'HR'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'RR'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'O2 Sat (%)'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Recorded By'),
                  canManageVitalSigns && React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Actions')
                )
              ),
              React.createElement(
                'tbody',
                null,
                ...vitalSigns.map((vs, idx) => React.createElement(
                  'tr',
                  {
                    key: vs.id,
                    style: {
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa'
                    }
                  },
                  React.createElement('td', { style: { padding: '12px' } }, new Date(vs.recordedAt).toLocaleString()),
                  React.createElement('td', { style: { padding: '12px' } }, vs.temperature?.toString() || '-'),
                  React.createElement('td', { style: { padding: '12px' } }, vs.bloodPressure || '-'),
                  React.createElement('td', { style: { padding: '12px' } }, vs.heartRate?.toString() || '-'),
                  React.createElement('td', { style: { padding: '12px' } }, vs.respiratoryRate?.toString() || '-'),
                  React.createElement('td', { style: { padding: '12px' } }, vs.oxygenSaturation?.toString() || '-'),
                  React.createElement('td', { style: { padding: '12px' } }, vs.recordedByUser?.fullName || '-'),
                  canManageVitalSigns && React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'div',
                      { style: { display: 'flex', gap: '5px' } },
                      React.createElement(
                        'button',
                        {
                          onClick: () => handleEditVitalSign(vs),
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
                          onClick: () => handleDeleteVitalSign(vs.id),
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
        ),

        // Daily Rounds Tab
        activeTab === 'daily-rounds' && React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }
            },
            React.createElement(
              'h4',
              { style: { margin: 0 } },
              'Daily Rounds'
            ),
            canManageRounds && React.createElement(
              'button',
              {
                onClick: () => {
                  setShowDailyRoundForm(true);
                  setEditingDailyRound(null);
                  setDailyRoundForm({
                    doctorId: user?.role === 'DOCTOR' ? user.id : '',
                    roundDate: new Date().toISOString().split('T')[0],
                    diagnosis: '',
                    treatment: '',
                    notes: '',
                    nextRoundDate: '',
                    isCompleted: false,
                  });
                },
                style: {
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }
              },
              '+ Add Daily Round'
            )
          ),

          // Daily Round Form
          showDailyRoundForm && React.createElement(
            'form',
            {
              onSubmit: handleSubmitDailyRound,
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
              editingDailyRound ? 'Edit Daily Round' : 'Add New Daily Round'
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
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Doctor'),
                React.createElement('select', {
                  name: 'doctorId',
                  value: dailyRoundForm.doctorId,
                  onChange: handleDailyRoundInputChange,
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
                null,
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Round Date'),
                React.createElement('input', {
                  type: 'date',
                  name: 'roundDate',
                  value: dailyRoundForm.roundDate,
                  onChange: handleDailyRoundInputChange,
                  required: true,
                  style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
                })
              ),
              React.createElement(
                'div',
                { style: { gridColumn: 'span 2' } },
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Diagnosis'),
                React.createElement('textarea', {
                  name: 'diagnosis',
                  value: dailyRoundForm.diagnosis,
                  onChange: handleDailyRoundInputChange,
                  required: true,
                  rows: 3,
                  style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
                })
              ),
              React.createElement(
                'div',
                { style: { gridColumn: 'span 2' } },
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Treatment'),
                React.createElement('textarea', {
                  name: 'treatment',
                  value: dailyRoundForm.treatment,
                  onChange: handleDailyRoundInputChange,
                  required: true,
                  rows: 4,
                  style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
                })
              ),
              React.createElement(
                'div',
                null,
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Next Round Date'),
                React.createElement('input', {
                  type: 'date',
                  name: 'nextRoundDate',
                  value: dailyRoundForm.nextRoundDate,
                  onChange: handleDailyRoundInputChange,
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
                  checked: dailyRoundForm.isCompleted,
                  onChange: handleDailyRoundInputChange,
                  id: 'isCompleted'
                }),
                React.createElement('label', { htmlFor: 'isCompleted', style: { margin: 0 } }, 'Round Completed')
              ),
              React.createElement(
                'div',
                { style: { gridColumn: 'span 2' } },
                React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Notes'),
                React.createElement('textarea', {
                  name: 'notes',
                  value: dailyRoundForm.notes,
                  onChange: handleDailyRoundInputChange,
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
                    setShowDailyRoundForm(false);
                    setEditingDailyRound(null);
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

          // Daily Rounds Table
          React.createElement(
            'div',
            { style: { overflowX: 'auto' } },
            dailyRounds.length === 0 ? React.createElement(
              'div',
              { style: { textAlign: 'center', padding: '40px', color: '#666' } },
              'No daily rounds recorded yet'
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
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Doctor'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Diagnosis'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Treatment'),
                  React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Status'),
                  canManageRounds && React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Actions')
                )
              ),
              React.createElement(
                'tbody',
                null,
                ...dailyRounds.map((round, idx) => React.createElement(
                  'tr',
                  {
                    key: round.id,
                    style: {
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa'
                    }
                  },
                  React.createElement('td', { style: { padding: '12px' } }, new Date(round.roundDate).toLocaleDateString()),
                  React.createElement('td', { style: { padding: '12px' } }, round.doctor?.fullName || '-'),
                  React.createElement('td', { style: { padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, round.diagnosis),
                  React.createElement('td', { style: { padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, round.treatment),
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
                          backgroundColor: round.isCompleted ? '#28a74520' : '#ffc10720',
                          color: round.isCompleted ? '#28a745' : '#ffc107'
                        }
                      },
                      round.isCompleted ? 'Completed' : 'Pending'
                    )
                  ),
                  canManageRounds && React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'div',
                      { style: { display: 'flex', gap: '5px' } },
                      React.createElement(
                        'button',
                        {
                          onClick: () => handleEditDailyRound(round),
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
                          onClick: () => handleDeleteDailyRound(round.id),
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
        'Please select a patient admission to view care data'
      )
    )
  );
};

export default PatientCare;

