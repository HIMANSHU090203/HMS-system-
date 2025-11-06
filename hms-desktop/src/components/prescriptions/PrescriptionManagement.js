import React, { useState, useEffect } from 'react';
import prescriptionService from '../../lib/api/services/prescriptionService';
import medicineService from '../../lib/api/services/medicineService';
import patientService from '../../lib/api/services/patientService';
import userService from '../../lib/api/services/userService';
import safetyService from '../../lib/api/services/safetyService';
import auditService from '../../lib/api/services/auditService';
import configService from '../../lib/api/services/configService';
import consultationService from '../../lib/api/services/consultationService';
import MedicineSearchAutocomplete from '../common/MedicineSearchAutocomplete';
import SafetyWarning from '../common/SafetyWarning';
import PrescriptionTemplates from './PrescriptionTemplates';
import PrescriptionPDFGenerator from '../../lib/utils/prescriptionPDFGenerator';
import AuditLogs from '../common/AuditLogs';
import InfoButton from '../common/InfoButton';
import { getInfoContent } from '../../lib/infoContent';

const PrescriptionManagement = ({ user, isAuthenticated, onBack }) => {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'stats'
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [stats, setStats] = useState(null);
  const [safetyWarnings, setSafetyWarnings] = useState([]);
  const [safetyRecommendations, setSafetyRecommendations] = useState([]);
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [selectedPrescriptionForAudit, setSelectedPrescriptionForAudit] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentId: '',
    consultationId: '',
    notes: '',
    items: []
  });

  // Debug form data changes
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, currentPage, searchTerm, statusFilter, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('❌ User not authenticated. Please log in.');
        return;
      }

      console.log('Loading data for user:', user);
      console.log('Token exists:', !!token);

      await Promise.all([
        loadPrescriptions(),
        loadPatients(),
        loadMedicines(),
        loadDoctors()
      ]);
      
      if (activeTab === 'stats') {
        await loadStats();
      }
    } catch (err) {
      setError('❌ Failed to load data: ' + (err.response?.data?.message || err.message));
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrescriptions = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
      };
      
      const response = await prescriptionService.getPrescriptions(params);
      setPrescriptions(response.prescriptions || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error loading prescriptions:', err);
      setPrescriptions([]);
      setTotalPages(1);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients({ limit: 100 });
      setPatients(response.patients || []);
    } catch (err) {
      console.error('Error loading patients:', err);
      if (err.response?.status === 403) {
        setError('❌ Access denied. You may not have permission to view patients.');
      }
    }
  };

  const loadMedicines = async () => {
    try {
      const response = await medicineService.getMedicines({ limit: 100 });
      setMedicines(response.medicines || response.data?.medicines || []);
    } catch (err) {
      console.error('Error loading medicines:', err);
      if (err.response?.status === 403) {
        setError('❌ Access denied. You may not have permission to view medicines.');
      }
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await userService.getUsers({ role: 'DOCTOR', limit: 100 });
      setDoctors(response.users || []);
    } catch (err) {
      console.error('Error loading doctors:', err);
      if (err.response?.status === 403) {
        setError('❌ Access denied. You may not have permission to view users.');
      }
    }
  };

  const loadStats = async () => {
    try {
      const response = await prescriptionService.getPrescriptionStats();
      setStats(response || {});
    } catch (err) {
      console.error('Error loading stats:', err);
      if (err.response?.status === 403) {
        setError('❌ Access denied. You may not have permission to view prescription statistics.');
      }
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    console.log('Creating prescription with data:', formData);
    
    if (formData.items.length === 0) {
      setError('Please add at least one medicine to the prescription');
      return;
    }

    if (!formData.patientId) {
      setError('Please select a patient');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Sending prescription data to API:', formData);
      const response = await prescriptionService.createPrescription(formData);
      console.log('Prescription creation response:', response);
      
      if (response.prescription) {
        setSuccess('✅ Prescription created successfully!');
        
        // Immediately export the newly created prescription
        try {
          const prescriptionId = response.prescription.id;
          await handlePrintPrescription(prescriptionId);
        } catch (exportError) {
          console.warn('Could not export prescription immediately:', exportError);
          // Don't fail the creation if export fails
        }
        
        setFormData({
          patientId: '',
          appointmentId: '',
          consultationId: '',
          notes: '',
          items: []
        });
        setShowCreateForm(false);
        setActiveTab('list');
        await loadPrescriptions();
      } else {
        setError('Failed to create prescription - no prescription data returned');
      }
    } catch (err) {
      console.error('Error creating prescription:', err);
      setError(err.response?.data?.message || err.message || 'Error creating prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleDispensePrescription = async (prescriptionId) => {
    if (window.confirm('Are you sure you want to dispense this prescription?')) {
      try {
        await prescriptionService.dispensePrescription(prescriptionId);
        setSuccess('✅ Prescription dispensed successfully!');
        await loadPrescriptions();
      } catch (err) {
        setError('❌ Failed to dispense prescription');
        console.error('Error dispensing prescription:', err);
      }
    }
  };

  const handleCancelPrescription = async (prescriptionId) => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (reason && reason.trim() !== '') {
      try {
        setLoading(true);
        setError('');
        console.log('Cancelling prescription:', prescriptionId, 'with reason:', reason);
        
        const response = await prescriptionService.cancelPrescription(prescriptionId, reason);
        console.log('Cancel response:', response);
        
        setSuccess('✅ Prescription cancelled successfully!');
        await loadPrescriptions();
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Error cancelling prescription:', err);
        setError('❌ Failed to cancel prescription: ' + (err.response?.data?.message || err.message || 'Unknown error'));
        
        // Auto-hide error message after 5 seconds
        setTimeout(() => setError(''), 5000);
      } finally {
        setLoading(false);
      }
    } else if (reason !== null) {
      // User clicked OK but didn't enter a reason
      setError('❌ Cancellation reason is required');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm('⚠️ Are you sure you want to permanently delete this prescription? This action cannot be undone!')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      console.log('Deleting prescription:', prescriptionId);
      
      await prescriptionService.deletePrescription(prescriptionId);
      console.log('Prescription deleted successfully');
      
      setSuccess('✅ Prescription deleted successfully!');
      await loadPrescriptions();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting prescription:', err);
      setError('❌ Failed to delete prescription: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const addPrescriptionItem = () => {
    console.log('Adding prescription item');
    setFormData({
      ...formData,
      items: [...formData.items, {
        medicineId: '',
        quantity: 1,
        frequency: '',
        duration: 7,
        instructions: '',
        dosage: '',
        withFood: '',
        startDate: '',
        endDate: ''
      }]
    });
  };

  const removePrescriptionItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const updatePrescriptionItem = (index, field, value) => {
    console.log(`Updating prescription item ${index}, field: ${field}, value:`, value);
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const handlePreviewPrescription = async () => {
    if (formData.items.length === 0) {
      setError('Please add at least one medicine to preview');
      return;
    }

    // Check safety before preview
    await checkPrescriptionSafety();

    const selectedPatient = patients.find(p => p.id === formData.patientId);
    const itemsWithDetails = formData.items.map(item => {
      const medicine = medicines.find(m => m.id === item.medicineId);
      return {
        ...item,
        medicine: medicine
      };
    });

    setPreviewData({
      patient: selectedPatient,
      items: itemsWithDetails,
      notes: formData.notes
    });
    setShowPreviewModal(true);
  };

  const checkPrescriptionSafety = async () => {
    if (!formData.patientId || formData.items.length === 0) {
      return;
    }

    try {
      const medicineIds = formData.items
        .filter(item => item.medicineId)
        .map(item => item.medicineId);

      if (medicineIds.length === 0) {
        return;
      }

      const safetyReport = await safetyService.getSafetyReport(formData.patientId, medicineIds);
      
      setSafetyWarnings(safetyReport.warnings);
      setSafetyRecommendations(safetyReport.recommendations);
      
      if (safetyReport.warnings.length > 0) {
        setShowSafetyWarning(true);
      }
    } catch (error) {
      console.error('Error checking prescription safety:', error);
    }
  };

  const handleSelectTemplate = (template) => {
    const templateItems = template.templateData.map(item => ({
      medicineId: item.medicineId,
      quantity: item.quantity,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions,
      dosage: item.dosage,
      withFood: item.withFood || '',
      startDate: '',
      endDate: ''
    }));

    setFormData({
      ...formData,
      items: templateItems,
      notes: template.description
    });

    setSuccess(`Template "${template.name}" applied successfully!`);
  };

  const handlePrintPrescription = async (prescriptionId) => {
    try {
      setLoading(true);
      // Fetch prescription, hospital config, and patient consultation history in parallel
      const [prescriptionResponse, configResponse] = await Promise.all([
        prescriptionService.getPrescriptionById(prescriptionId),
        configService.getHospitalConfig()
      ]);
      
      const prescription = prescriptionResponse.prescription;
      const hospitalConfig = configResponse.config || {};
      const patientId = prescription.patient?.id;
      
      // Fetch patient consultation history (excluding current consultation if linked)
      let consultationHistory = [];
      if (patientId) {
        try {
          console.log('📋 Fetching consultation history for patient:', patientId);
          console.log('📋 Current prescription consultation ID:', prescription.consultationId);
          
          // Use getConsultations with patientId and higher limit to get all consultations
          const historyResponse = await consultationService.getConsultations({ 
            patientId, 
            limit: 50, // Get more consultations to ensure we have history
            page: 1 
          });
          
          console.log('📋 Consultation history API response:', historyResponse);
          console.log('📋 Response type:', typeof historyResponse);
          console.log('📋 Has consultations property:', 'consultations' in historyResponse);
          
          // Extract consultations from response (handles paginated response structure)
          let consultations = [];
          if (historyResponse && typeof historyResponse === 'object') {
            if (Array.isArray(historyResponse)) {
              // If response is directly an array
              consultations = historyResponse;
            } else if (historyResponse.consultations && Array.isArray(historyResponse.consultations)) {
              // If response has consultations property (paginated response)
              consultations = historyResponse.consultations;
            } else if (historyResponse.data && Array.isArray(historyResponse.data)) {
              // If response has data property
              consultations = historyResponse.data;
            }
          }
          
          console.log('📋 Extracted consultations:', consultations);
          console.log('📋 Number of consultations found:', consultations.length);
          
          // Filter out the current consultation if it exists
          consultationHistory = consultations.filter(
            cons => {
              const isCurrent = cons.id === prescription.consultationId;
              if (isCurrent) {
                console.log('📋 Filtering out current consultation:', cons.id);
              }
              return !isCurrent;
            }
          );
          
          console.log('📋 After filtering current consultation:', consultationHistory.length);
          
          // Sort by date descending (most recent first) and limit to last 10 consultations
          consultationHistory = consultationHistory
            .sort((a, b) => {
              const dateA = new Date(a.consultationDate || a.createdAt || 0);
              const dateB = new Date(b.consultationDate || b.createdAt || 0);
              return dateB - dateA;
            })
            .slice(0, 10);
          
          console.log('📋 Final processed consultation history:', consultationHistory);
          console.log('📋 History items count:', consultationHistory.length);
          
          // Log each history item for debugging
          consultationHistory.forEach((cons, index) => {
            console.log(`📋 History ${index + 1}:`, {
              id: cons.id,
              date: cons.consultationDate || cons.createdAt,
              diagnosis: cons.diagnosis,
              notes: cons.notes,
              doctor: cons.doctor?.fullName
            });
          });
        } catch (err) {
          console.error('❌ Failed to fetch consultation history:', err);
          console.error('❌ Error name:', err.name);
          console.error('❌ Error message:', err.message);
          console.error('❌ Error stack:', err.stack);
          if (err.response) {
            console.error('❌ Error response status:', err.response.status);
            console.error('❌ Error response data:', err.response.data);
          }
          // Continue without history if fetch fails
        }
      } else {
        console.warn('⚠️ No patient ID available for fetching consultation history');
      }
      
      // Prepare prescription data for PDF generation
      // Map prescriptionItems to items for the PDF generator
      const items = (prescription.prescriptionItems || []).map(item => ({
        ...item,
        medicine: item.medicine || item.medicineCatalog || {}
      }));

      // Build hospital address from config
      const addressParts = [
        hospitalConfig.address,
        hospitalConfig.city,
        hospitalConfig.state,
        hospitalConfig.postalCode,
        hospitalConfig.country
      ].filter(Boolean);
      const hospitalAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Address not specified';

      // Prepare prescription data for PDF generation with all available data
      const prescriptionData = {
        prescriptionNumber: prescription.prescriptionNumber || 'N/A',
        patient: {
          id: prescription.patient?.id || 'N/A',
          name: prescription.patient?.name || 'N/A',
          age: prescription.patient?.age || '',
          gender: prescription.patient?.gender || 'M',
          phone: prescription.patient?.phone || 'N/A',
          address: prescription.patient?.address || 'N/A',
          bloodGroup: prescription.patient?.bloodGroup || ''
        },
        doctor: {
          id: prescription.doctor?.id || 'N/A',
          fullName: prescription.doctor?.fullName || 'Doctor Name',
          qualifications: prescription.doctor?.qualifications || 'M.B.B.S., M.D.',
          registrationNumber: prescription.doctor?.registrationNumber || 'N/A',
          phone: prescription.doctor?.phone || 'N/A',
          email: prescription.doctor?.email || 'N/A',
          role: prescription.doctor?.role || 'DOCTOR'
        },
        items: items,
        notes: prescription.notes || '',
        status: prescription.status || 'ACTIVE',
        totalAmount: prescription.totalAmount || 0,
        createdAt: prescription.createdAt || new Date().toISOString(),
        // Use hospital config from database
        hospitalName: hospitalConfig.hospitalName || 'Hospital Management System',
        hospitalAddress: hospitalAddress,
        hospitalPhone: hospitalConfig.phone || 'N/A',
        hospitalEmail: hospitalConfig.email || 'N/A',
        workingHours: hospitalConfig.workingHours || null,
        // Include consultation data if available
        consultation: prescription.consultation || null,
        // Temperature and BP from consultation (now available for OPD patients)
        temperature: prescription.consultation?.temperature ? String(prescription.consultation.temperature) : '',
        bloodPressure: prescription.consultation?.bloodPressure || '',
        followUpDate: prescription.consultation?.followUpDate || '',
        // Include consultation history
        consultationHistory: consultationHistory || []
      };

      console.log('Prescription data for PDF:', prescriptionData);
      console.log('Consultation History in PDF data:', prescriptionData.consultationHistory);
      console.log('Consultation History length:', prescriptionData.consultationHistory?.length || 0);

      PrescriptionPDFGenerator.generatePrescriptionPDF(prescriptionData);
    } catch (error) {
      setError('Failed to generate prescription PDF');
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPrescriptions = () => {
    try {
      const prescriptionsList = prescriptions || [];
      console.log('Exporting prescriptions:', prescriptionsList.length);
      
      // Check if popup blocker is blocking
      const printWindow = window.open('', '_blank');
      if (!printWindow || printWindow.closed || typeof printWindow.closed == 'undefined') {
        setError('❌ Failed to export: Please allow popups for this site and try again');
        return;
      }
      printWindow.close();
      
      // Now generate the PDF
      PrescriptionPDFGenerator.generatePrescriptionsListPDF(prescriptionsList);
      setSuccess(prescriptionsList.length > 0 
        ? '✅ Prescriptions exported as PDF successfully! Check your new window/tab.' 
        : '✅ Blank prescription template exported as PDF successfully!');
    } catch (error) {
      setError('❌ Failed to export prescriptions: ' + (error.message || 'Unknown error'));
      console.error('Error exporting prescriptions:', error);
    }
  };

  const handleViewAuditLogs = (prescriptionId) => {
    setSelectedPrescriptionForAudit(prescriptionId);
    setShowAuditLogs(true);
  };

  const handleViewPrescription = async (prescriptionId) => {
    try {
      setLoading(true);
      setError('');
      console.log('Viewing prescription:', prescriptionId);
      
      const response = await prescriptionService.getPrescriptionById(prescriptionId);
      console.log('Prescription response:', response);
      
      // The response contains a 'prescription' property
      const prescription = response.prescription || response;
      console.log('Prescription data:', prescription);
      
      if (!prescription) {
        throw new Error('Prescription data not found');
      }
      
      // Set preview data to show prescription details
      setPreviewData({
        patient: prescription.patient,
        items: prescription.prescriptionItems || [],
        notes: prescription.notes,
        prescription: prescription
      });
      setShowPreviewModal(true);
    } catch (err) {
      console.error('Error viewing prescription:', err);
      setError('Failed to load prescription details: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'text-blue-600 bg-blue-100';
      case 'DISPENSED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      case 'EXPIRED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderPrescriptionList = () => (
    React.createElement(
      'div',
      { className: 'space-y-6' },
      // Header with search and filters
      React.createElement(
        'div',
        { className: 'flex flex-col md:flex-row gap-4 items-center justify-between' },
        React.createElement(
          'div',
          { className: 'flex flex-col md:flex-row gap-4 flex-1' },
          React.createElement(
            'input',
            {
              type: 'text',
              placeholder: 'Search prescriptions...',
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: 'px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            }
          ),
          React.createElement(
            'select',
            {
              value: statusFilter,
              onChange: (e) => setStatusFilter(e.target.value),
              className: 'px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            },
            React.createElement('option', { value: '' }, 'All Status'),
            React.createElement('option', { value: 'ACTIVE' }, 'Active'),
            React.createElement('option', { value: 'DISPENSED' }, 'Dispensed'),
            React.createElement('option', { value: 'CANCELLED' }, 'Cancelled'),
            React.createElement('option', { value: 'EXPIRED' }, 'Expired')
          )
        ),
        React.createElement(
          'button',
          {
            onClick: () => {
              setShowCreateForm(true);
            },
            className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center'
          },
          React.createElement('span', { className: 'mr-2' }, '➕'),
          'New Prescription'
        ),
        React.createElement(
          'button',
          {
            onClick: () => setShowTemplates(true),
            className: 'px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center'
          },
          React.createElement('span', { className: 'mr-2' }, '📋'),
          'Templates'
        ),
        React.createElement(
          'button',
          {
            onClick: handleExportPrescriptions,
            className: 'px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center'
          },
          React.createElement('span', { className: 'mr-2' }, '📊'),
          'Export'
        )
      ),

      // Prescriptions table
      React.createElement(
        'div',
        { className: 'bg-white rounded-lg shadow overflow-hidden' },
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
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Prescription #'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Patient'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Doctor'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Date'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Status'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Amount'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Actions')
              )
            ),
            React.createElement(
              'tbody',
              { className: 'bg-white divide-y divide-gray-200' },
              prescriptions.map(prescription => React.createElement(
                'tr',
                { key: prescription.id, className: 'hover:bg-gray-50' },
                React.createElement(
                  'td',
                  { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900' },
                  prescription.prescriptionNumber
                ),
                React.createElement(
                  'td',
                  { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
                  prescription.patient?.name || 'N/A'
                ),
                React.createElement(
                  'td',
                  { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
                  prescription.doctor?.fullName || 'N/A'
                ),
                React.createElement(
                  'td',
                  { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
                  formatDate(prescription.createdAt)
                ),
                React.createElement(
                  'td',
                  { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement(
                    'span',
                    { className: `px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(prescription.status)}` },
                    prescription.status
                  )
                ),
                React.createElement(
                  'td',
                  { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' },
                  formatCurrency(Number(prescription.totalAmount))
                ),
                React.createElement(
                  'td',
                  { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium' },
                  React.createElement(
                    'div',
                    { className: 'flex space-x-2' },
                    React.createElement(
                      'button',
                      {
                        onClick: () => handleViewPrescription(prescription.id),
                        className: 'text-blue-600 hover:text-blue-900'
                      },
                      'View'
                    ),
                    React.createElement(
                      'button',
                      {
                        onClick: () => handlePrintPrescription(prescription.id),
                        className: 'text-purple-600 hover:text-purple-900'
                      },
                      'Print'
                    ),
                    React.createElement(
                      'button',
                      {
                        onClick: () => handleViewAuditLogs(prescription.id),
                        className: 'text-gray-600 hover:text-gray-900'
                      },
                      'Audit'
                    ),
                    prescription.status === 'ACTIVE' && React.createElement(
                      'button',
                      {
                        onClick: () => handleDispensePrescription(prescription.id),
                        className: 'text-green-600 hover:text-green-900'
                      },
                      'Dispense'
                    ),
                    prescription.status === 'ACTIVE' && React.createElement(
                      'button',
                      {
                        onClick: () => handleCancelPrescription(prescription.id),
                        className: 'text-orange-600 hover:text-orange-900'
                      },
                      'Cancel'
                    ),
                    user?.role === 'ADMIN' && React.createElement(
                      'button',
                      {
                        onClick: () => handleDeletePrescription(prescription.id),
                        className: 'text-red-600 hover:text-red-900 font-bold'
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

      // Pagination
      totalPages > 1 && React.createElement(
        'div',
        { className: 'flex justify-center items-center space-x-2' },
        React.createElement(
          'button',
          {
            onClick: () => setCurrentPage(Math.max(1, currentPage - 1)),
            disabled: currentPage === 1,
            className: `px-3 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`
          },
          'Previous'
        ),
        React.createElement(
          'span',
          { className: 'px-4 py-2 text-gray-700' },
          `Page ${currentPage} of ${totalPages}`
        ),
        React.createElement(
          'button',
          {
            onClick: () => setCurrentPage(Math.min(totalPages, currentPage + 1)),
            disabled: currentPage === totalPages,
            className: `px-3 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`
          },
          'Next'
        )
      )
    )
  );

  const renderCreateForm = () => (
    React.createElement(
      'div',
      { className: 'space-y-6 mt-6' },
      React.createElement(
        'form',
        { onSubmit: handleCreatePrescription },
        // Patient selection
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement(
            'h3',
            { className: 'text-lg font-medium text-gray-900 mb-4' },
            'Patient Information'
          ),
          React.createElement(
            'div',
            { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
            React.createElement(
              'div',
              null,
              React.createElement(
                'label',
                { className: 'block text-sm font-medium text-gray-700 mb-2' },
                'Patient *'
              ),
              React.createElement(
                'select',
                {
                  value: formData.patientId,
                  onChange: (e) => setFormData({ ...formData, patientId: e.target.value }),
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  required: true
                },
                React.createElement('option', { value: '' }, 'Select Patient'),
                ...patients.map(patient => React.createElement(
                  'option',
                  { key: patient.id, value: patient.id },
                  `${patient.name} (${patient.age} years, ${patient.gender})`
                ))
              )
            ),
            React.createElement(
              'div',
              null,
              React.createElement(
                'label',
                { className: 'block text-sm font-medium text-gray-700 mb-2' },
                'Appointment ID (Optional)'
              ),
              React.createElement(
                'input',
                {
                  type: 'text',
                  value: formData.appointmentId,
                  onChange: (e) => setFormData({ ...formData, appointmentId: e.target.value }),
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }
              )
            )
          )
        ),

        // Medicine items
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement(
            'div',
            { className: 'flex justify-between items-center mb-4' },
            React.createElement(
              'h3',
              { className: 'text-lg font-medium text-gray-900' },
              'Prescription Items'
            ),
            React.createElement(
              'div',
              { className: 'flex space-x-2' },
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: addPrescriptionItem,
                  className: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                },
                '+ Add Medicine'
              ),
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: () => setShowTemplates(true),
                  className: 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
                },
                '📋 Use Template'
              )
            )
          ),
          formData.items.length === 0 ? React.createElement(
            'div',
            { className: 'text-center py-8 text-gray-500' },
            'No medicines added yet. Click "Add Medicine" to start.'
          ) : React.createElement(
            'div',
            { className: 'space-y-4' },
            ...formData.items.map((item, index) => React.createElement(
              'div',
              { key: index, className: 'border border-gray-200 rounded-lg p-4' },
              React.createElement(
                'div',
                { className: 'flex justify-between items-center mb-3' },
                React.createElement(
                  'h4',
                  { className: 'text-sm font-medium text-gray-700' },
                  `Medicine ${index + 1}`
                ),
                React.createElement(
                  'button',
                  {
                    type: 'button',
                    onClick: () => removePrescriptionItem(index),
                    className: 'text-red-600 hover:text-red-900'
                  },
                  'Remove'
                )
              ),
              React.createElement(
                'div',
                { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
                React.createElement(
                  'div',
                  null,
                  React.createElement(
                    'label',
                    { className: 'block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2' },
                    'Medicine *',
                    React.createElement(InfoButton, {
                      title: getInfoContent('prescriptions', null, 'medicine').title,
                      content: getInfoContent('prescriptions', null, 'medicine').content,
                      size: 'xs'
                    })
                  ),
                  React.createElement(
                    MedicineSearchAutocomplete,
                    {
                      onSelect: (medicine) => updatePrescriptionItem(index, 'medicineId', medicine.id),
                      placeholder: 'Search medicine by name, manufacturer, or category...',
                      className: 'w-full'
                    }
                  )
                ),
                React.createElement(
                  'div',
                  null,
                  React.createElement(
                    'label',
                    { className: 'block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2' },
                    'Quantity *',
                    React.createElement(InfoButton, {
                      title: getInfoContent('prescriptions', null, 'quantity').title,
                      content: getInfoContent('prescriptions', null, 'quantity').content,
                      size: 'xs'
                    })
                  ),
                  React.createElement(
                    'input',
                    {
                      type: 'number',
                      min: 1,
                      value: item.quantity,
                      onChange: (e) => updatePrescriptionItem(index, 'quantity', parseInt(e.target.value) || 1),
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
                    { className: 'block text-sm font-medium text-gray-700 mb-1' },
                    'Frequency *'
                  ),
                  React.createElement(
                    'select',
                    {
                      value: item.frequency,
                      onChange: (e) => updatePrescriptionItem(index, 'frequency', e.target.value),
                      className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                      required: true
                    },
                    React.createElement('option', { value: '' }, 'Select Frequency'),
                    React.createElement('option', { value: '1-0-0' }, 'Once daily (1-0-0)'),
                    React.createElement('option', { value: '1-0-1' }, 'Twice daily (1-0-1)'),
                    React.createElement('option', { value: '1-1-1' }, 'Three times daily (1-1-1)'),
                    React.createElement('option', { value: 'QID' }, 'Four times daily (QID)'),
                    React.createElement('option', { value: 'BD' }, 'Twice daily (BD)'),
                    React.createElement('option', { value: 'TID' }, 'Three times daily (TID)'),
                    React.createElement('option', { value: 'HS' }, 'At bedtime (HS)'),
                    React.createElement('option', { value: 'PRN' }, 'As needed (PRN)')
                  )
                ),
                React.createElement(
                  'div',
                  null,
                  React.createElement(
                    'label',
                    { className: 'block text-sm font-medium text-gray-700 mb-1' },
                    'Duration (days) *'
                  ),
                  React.createElement(
                    'input',
                    {
                      type: 'number',
                      min: 1,
                      value: item.duration,
                      onChange: (e) => updatePrescriptionItem(index, 'duration', parseInt(e.target.value) || 7),
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
                    { className: 'block text-sm font-medium text-gray-700 mb-1' },
                    'Dosage'
                  ),
                  React.createElement(
                    'input',
                    {
                      type: 'text',
                      value: item.dosage,
                      onChange: (e) => updatePrescriptionItem(index, 'dosage', e.target.value),
                      placeholder: 'e.g., 500mg, 10ml',
                      className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }
                  )
                ),
                React.createElement(
                  'div',
                  null,
                  React.createElement(
                    'label',
                    { className: 'block text-sm font-medium text-gray-700 mb-1' },
                    'With Food'
                  ),
                  React.createElement(
                    'select',
                    {
                      value: item.withFood,
                      onChange: (e) => updatePrescriptionItem(index, 'withFood', e.target.value),
                      className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    },
                    React.createElement('option', { value: '' }, 'Select timing'),
                    React.createElement('option', { value: 'With meal' }, 'With meal'),
                    React.createElement('option', { value: 'Before meal' }, 'Before meal'),
                    React.createElement('option', { value: 'After meal' }, 'After meal'),
                    React.createElement('option', { value: 'Empty stomach' }, 'Empty stomach'),
                    React.createElement('option', { value: 'Bedtime' }, 'Bedtime')
                  )
                )
              ),
              React.createElement(
                'div',
                { className: 'mt-3' },
                React.createElement(
                  'label',
                  { className: 'block text-sm font-medium text-gray-700 mb-1' },
                  'Special Instructions'
                ),
                React.createElement(
                  'textarea',
                  {
                    value: item.instructions,
                    onChange: (e) => updatePrescriptionItem(index, 'instructions', e.target.value),
                    placeholder: 'Additional instructions for this medicine...',
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    rows: 2
                  }
                )
              )
            ))
          )
        ),

        // Safety warnings
        showSafetyWarning && React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement(
            SafetyWarning,
            {
              warnings: safetyWarnings,
              recommendations: safetyRecommendations,
              onDismiss: () => setShowSafetyWarning(false)
            }
          )
        ),

        // Notes
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement(
            'h3',
            { className: 'text-lg font-medium text-gray-900 mb-4' },
            'Prescription Notes'
          ),
          React.createElement(
            'textarea',
            {
              value: formData.notes,
              onChange: (e) => setFormData({ ...formData, notes: e.target.value }),
              placeholder: 'General notes for this prescription...',
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              rows: 3
            }
          )
        ),

        // Action buttons
        React.createElement(
          'div',
          { className: 'flex justify-end space-x-4' },
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: () => setShowCreateForm(false),
              className: 'px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300'
            },
            'Cancel'
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: handlePreviewPrescription,
              className: 'px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700'
            },
            'Preview'
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: checkPrescriptionSafety,
              disabled: !formData.patientId || formData.items.length === 0,
              className: `px-6 py-2 rounded-lg font-medium ${
                !formData.patientId || formData.items.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`
            },
            'Check Safety'
          ),
          React.createElement(
            'button',
            {
              type: 'submit',
              disabled: loading || formData.items.length === 0,
              className: `px-6 py-2 rounded-lg font-medium ${
                loading || formData.items.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`
            },
            loading ? 'Creating...' : 'Create Prescription'
          )
        )
      )
    )
  );

  const renderPreviewModal = () => (
    showPreviewModal && previewData && React.createElement(
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
            'Prescription Preview'
          ),
          React.createElement(
            'button',
            {
              onClick: () => setShowPreviewModal(false),
              className: 'text-gray-400 hover:text-gray-600'
            },
            React.createElement(
              'svg',
              { className: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
              React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'space-y-6' },
          // Patient info
          React.createElement(
            'div',
            { className: 'border-b pb-4' },
            React.createElement(
              'h3',
              { className: 'text-lg font-semibold text-gray-900 mb-2' },
              'Patient Information'
            ),
            React.createElement(
              'div',
              { className: 'grid grid-cols-2 gap-4' },
              React.createElement('p', { className: 'text-gray-600' }, `Name: ${previewData?.patient?.name || 'N/A'}`),
              React.createElement('p', { className: 'text-gray-600' }, `Age: ${previewData?.patient?.age || 'N/A'} years`),
              React.createElement('p', { className: 'text-gray-600' }, `Gender: ${previewData?.patient?.gender || 'N/A'}`),
              React.createElement('p', { className: 'text-gray-600' }, `Phone: ${previewData?.patient?.phone || 'N/A'}`)
            )
          ),
          // Prescription items
          React.createElement(
            'div',
            { className: 'border-b pb-4' },
            React.createElement(
              'h3',
              { className: 'text-lg font-semibold text-gray-900 mb-4' },
              'Prescription Items'
            ),
            React.createElement(
              'div',
              { className: 'space-y-4' },
              ...(previewData?.items || []).map((item, index) => React.createElement(
                'div',
                { key: index, className: 'border border-gray-200 rounded-lg p-4' },
                React.createElement(
                  'div',
                  { className: 'grid grid-cols-2 gap-4 mb-2' },
                  React.createElement('p', { className: 'font-medium' }, `Medicine: ${item.medicine?.name || 'N/A'}`),
                  React.createElement('p', { className: 'font-medium' }, `Manufacturer: ${item.medicine?.manufacturer || 'Generic'}`),
                  React.createElement('p', { className: 'text-gray-600' }, `Quantity: ${item.quantity}`),
                  React.createElement('p', { className: 'text-gray-600' }, `Frequency: ${item.frequency}`),
                  React.createElement('p', { className: 'text-gray-600' }, `Duration: ${item.duration} days`),
                  React.createElement('p', { className: 'text-gray-600' }, `Dosage: ${item.dosage || 'As directed'}`),
                  React.createElement('p', { className: 'text-gray-600' }, `With Food: ${item.withFood || 'Not specified'}`)
                ),
                item.instructions && React.createElement(
                  'p',
                  { className: 'text-gray-600 mt-2' },
                  `Instructions: ${item.instructions}`
                )
              ))
            )
          ),
          // Notes
          previewData.notes && React.createElement(
            'div',
            { className: 'border-b pb-4' },
            React.createElement(
              'h3',
              { className: 'text-lg font-semibold text-gray-900 mb-2' },
              'Notes'
            ),
            React.createElement(
              'p',
              { className: 'text-gray-600' },
              previewData.notes
            )
          ),
          // Action buttons
          React.createElement(
            'div',
            { className: 'flex justify-end space-x-4' },
            React.createElement(
              'button',
              {
                onClick: () => setShowPreviewModal(false),
                className: 'px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300'
              },
              'Close'
            ),
            React.createElement(
              'button',
              {
                onClick: () => {
                  setShowPreviewModal(false);
                  handleCreatePrescription({ preventDefault: () => {} });
                },
                className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
              },
              'Create Prescription'
            )
          )
        )
      )
    )
  );

  const renderStats = () => (
    React.createElement(
      'div',
      { className: 'space-y-6' },
      React.createElement(
        'h2',
        { className: 'text-2xl font-bold text-gray-900' },
        'Prescription Statistics'
      ),
      stats && React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement(
            'h3',
            { className: 'text-lg font-medium text-gray-900 mb-2' },
            'Total Prescriptions'
          ),
          React.createElement(
            'p',
            { className: 'text-3xl font-bold text-blue-600' },
            stats.totalPrescriptions || 0
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement(
            'h3',
            { className: 'text-lg font-medium text-gray-900 mb-2' },
            'Active Prescriptions'
          ),
          React.createElement(
            'p',
            { className: 'text-3xl font-bold text-yellow-600' },
            stats.activePrescriptions || 0
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement(
            'h3',
            { className: 'text-lg font-medium text-gray-900 mb-2' },
            'Dispensed Prescriptions'
          ),
          React.createElement(
            'p',
            { className: 'text-3xl font-bold text-green-600' },
            stats.dispensedPrescriptions || 0
          )
        ),
        React.createElement(
          'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement(
            'h3',
            { className: 'text-lg font-medium text-gray-900 mb-2' },
            'Cancelled Prescriptions'
          ),
          React.createElement(
            'p',
            { className: 'text-3xl font-bold text-red-600' },
            stats.cancelledPrescriptions || 0
          )
        ),
        React.createElement(
    'div',
    { className: 'bg-white rounded-lg shadow p-6' },
    React.createElement(
            'h3',
            { className: 'text-lg font-medium text-gray-900 mb-2' },
            'Recent Prescriptions (7 days)'
          ),
          React.createElement(
            'p',
            { className: 'text-3xl font-bold text-purple-600' },
            stats.recentPrescriptions || 0
          )
    ),
    React.createElement(
      'div',
          { className: 'bg-white rounded-lg shadow p-6' },
          React.createElement(
            'h3',
            { className: 'text-lg font-medium text-gray-900 mb-2' },
            'Total Revenue'
          ),
          React.createElement(
            'p',
            { className: 'text-3xl font-bold text-green-600' },
            formatCurrency(Number(stats.totalRevenue) || 0)
          )
        )
      )
    )
  );

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50 py-8 px-4' },
    React.createElement(
      'div',
      { className: 'max-w-7xl mx-auto' },
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
          'Back to Dashboard'
        ),
        React.createElement(
          'div',
          { className: 'flex items-center gap-3' },
          React.createElement(
            'h1',
            { className: 'text-3xl font-bold text-gray-900' },
            '💊 Prescription Management'
          ),
          React.createElement(InfoButton, {
            title: getInfoContent('prescriptions').title,
            content: getInfoContent('prescriptions').content,
            size: 'md',
            variant: 'info'
          })
        )
      ),

      // Error/Success messages
      error && React.createElement(
        'div',
        { className: 'mb-6 p-4 bg-red-50 border border-red-200 rounded-lg' },
        React.createElement(
          'p',
          { className: 'text-red-800' },
          error
        )
      ),

      success && React.createElement(
        'div',
        { className: 'mb-6 p-4 bg-green-50 border border-green-200 rounded-lg' },
      React.createElement(
        'p',
          { className: 'text-green-800' },
          success
        )
      ),

      // Tabs
      React.createElement(
        'div',
        { className: 'mb-6' },
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
              'All Prescriptions'
            ),
            React.createElement(
              'button',
              {
                onClick: () => setActiveTab('stats'),
                className: `py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              },
              'Statistics'
            )
          )
        )
      ),

      // Tab content
      activeTab === 'list' && (
        React.createElement(
          'div',
          null,
          renderPrescriptionList(),
          showCreateForm && renderCreateForm()
        )
      ),
      activeTab === 'stats' && renderStats(),

      // Preview modal
      renderPreviewModal(),

      // Templates modal
      showTemplates && React.createElement(
        PrescriptionTemplates,
        {
          onSelectTemplate: handleSelectTemplate,
          onClose: () => setShowTemplates(false)
        }
      ),

      // Audit logs modal
      showAuditLogs && React.createElement(
        AuditLogs,
        {
          prescriptionId: selectedPrescriptionForAudit,
          onClose: () => {
            setShowAuditLogs(false);
            setSelectedPrescriptionForAudit(null);
          }
        }
      )
    )
  );
};

export default PrescriptionManagement;