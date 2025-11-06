import React, { useState, useEffect } from 'react';
import admissionService from '../../lib/api/services/admissionService';
import inpatientBillService from '../../lib/api/services/inpatientBillService';
import configService from '../../lib/api/services/configService';
import InvoicePDFGenerator from '../../lib/utils/invoicePDFGenerator';
import { PaymentStatus, PaymentMode } from '../../lib/api/types';

const IPDBilling = ({ onBack, isAuthenticated, user }) => {
  const [admissions, setAdmissions] = useState([]);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [inpatientBills, setInpatientBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBillForm, setShowBillForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const [billForm, setBillForm] = useState({
    roomCharges: '0',
    procedureCharges: '0',
    medicineCharges: '0',
    labCharges: '0',
    otherCharges: '0',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    status: 'PAID',
    paymentMode: 'CASH',
    paidAmount: '',
  });

  const paymentModes = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CARD', label: 'Card' },
    { value: 'UPI', label: 'UPI' },
    { value: 'NET_BANKING', label: 'Net Banking' },
    { value: 'INSURANCE', label: 'Insurance' },
  ];

  const paymentStatuses = [
    { value: 'PENDING', label: 'Pending', color: '#ffc107' },
    { value: 'PAID', label: 'Paid', color: '#28a745' },
    { value: 'PARTIAL', label: 'Partial', color: '#17a2b8' },
    { value: 'REFUNDED', label: 'Refunded', color: '#6c757d' },
    { value: 'CANCELLED', label: 'Cancelled', color: '#dc3545' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadAdmissions();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedAdmission) {
      loadInpatientBills();
    }
  }, [selectedAdmission, filterStatus]);

  const loadAdmissions = async () => {
    setLoading(true);
    try {
      const response = await admissionService.getAdmissions({ page: 1, limit: 200 });
      setAdmissions(response.admissions || []);
      setError('');
    } catch (err) {
      setError('Failed to load admissions');
      console.error('Error loading admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInpatientBills = async () => {
    if (!selectedAdmission) return;
    setLoading(true);
    try {
      const params = {
        admissionId: selectedAdmission.id,
        ...(filterStatus && { status: filterStatus }),
      };
      const response = await inpatientBillService.getInpatientBills(params);
      setInpatientBills(response.inpatientBills || []);
      setError('');
    } catch (err) {
      setError('Failed to load inpatient bills');
      console.error('Error loading inpatient bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBillInputChange = (e) => {
    const { name, value } = e.target;
    setBillForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    const room = parseFloat(billForm.roomCharges) || 0;
    const procedure = parseFloat(billForm.procedureCharges) || 0;
    const medicine = parseFloat(billForm.medicineCharges) || 0;
    const lab = parseFloat(billForm.labCharges) || 0;
    const other = parseFloat(billForm.otherCharges) || 0;
    return room + procedure + medicine + lab + other;
  };

  const handleSubmitBill = async (e) => {
    e.preventDefault();
    if (!selectedAdmission) return;

    setLoading(true);
    setError('');

    try {
      const billData = {
        admissionId: selectedAdmission.id,
        roomCharges: parseFloat(billForm.roomCharges) || 0,
        procedureCharges: parseFloat(billForm.procedureCharges) || 0,
        medicineCharges: parseFloat(billForm.medicineCharges) || 0,
        labCharges: parseFloat(billForm.labCharges) || 0,
        otherCharges: parseFloat(billForm.otherCharges) || 0,
        notes: billForm.notes || null,
      };

      if (editingBill) {
        await inpatientBillService.updateInpatientBill(editingBill.id, billData);
      } else {
        await inpatientBillService.createInpatientBill(billData);
      }

      await loadInpatientBills();
      setShowBillForm(false);
      setEditingBill(null);
      resetBillForm();
      setError('');
    } catch (err) {
      setError('Failed to save bill');
      console.error('Error saving bill:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (billId) => {
    if (!paymentForm.paidAmount || parseFloat(paymentForm.paidAmount) <= 0) {
      setError('Please enter a valid paid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await inpatientBillService.updateInpatientBill(billId, {
        status: paymentForm.status,
        paymentMode: paymentForm.paymentMode,
        paidAmount: parseFloat(paymentForm.paidAmount),
      });

      await loadInpatientBills();
      setPaymentForm({
        status: 'PAID',
        paymentMode: 'CASH',
        paidAmount: '',
      });
      setError('');
    } catch (err) {
      setError('Failed to update payment');
      console.error('Error updating payment:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetBillForm = () => {
    setBillForm({
      roomCharges: '0',
      procedureCharges: '0',
      medicineCharges: '0',
      labCharges: '0',
      otherCharges: '0',
      notes: '',
    });
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setBillForm({
      roomCharges: bill.roomCharges.toString(),
      procedureCharges: bill.procedureCharges.toString(),
      medicineCharges: bill.medicineCharges.toString(),
      labCharges: bill.labCharges.toString(),
      otherCharges: bill.otherCharges.toString(),
      notes: bill.notes || '',
    });
    setShowBillForm(true);
  };

  const canManageBills = ['ADMIN', 'WARD_MANAGER', 'RECEPTIONIST'].includes(user?.role);

  const handlePrintBill = async (bill) => {
    try {
      setLoading(true);
      setError('');

      // Fetch full bill details with admission and patient info
      const billDetails = await inpatientBillService.getInpatientBillById(bill.id);
      
      // Fetch hospital config
      const configResponse = await configService.getHospitalConfig();
      const hospitalConfig = configResponse.config || {};

      // Prepare invoice data for IPD bill
      const invoiceData = {
        hospitalConfig: {
          hospitalName: hospitalConfig.hospitalName || 'Hospital Management System',
          tagline: hospitalConfig.tagline || '',
          address: hospitalConfig.address,
          city: hospitalConfig.city,
          state: hospitalConfig.state,
          postalCode: hospitalConfig.postalCode,
          country: hospitalConfig.country,
          phone: hospitalConfig.phone,
          email: hospitalConfig.email,
          emergencyContact: hospitalConfig.emergencyContact || '1066',
          billingEmail: hospitalConfig.email || '',
          insuranceValidityNote: hospitalConfig.insuranceValidityNote || 'This Receipt is valid for an employer or insurer, who contractually obligated to reimburse the medical expenses covered by MediSave and/or MediShield.'
        },
        billNumber: billDetails.id || bill.id,
        billDate: billDetails.createdAt || new Date().toISOString(),
        ipNumber: billDetails.admission?.id || selectedAdmission?.id || '',
        idNumber: billDetails.patient?.id || selectedAdmission?.patient?.id || '',
        patient: {
          id: billDetails.patient?.id || selectedAdmission?.patient?.id || '',
          name: billDetails.patient?.name || selectedAdmission?.patient?.name || 'N/A',
          address: billDetails.patient?.address || selectedAdmission?.patient?.address || 'N/A',
          phone: billDetails.patient?.phone || selectedAdmission?.patient?.phone || ''
        },
        admission: {
          admissionDate: billDetails.admission?.admissionDate || selectedAdmission?.admissionDate,
          dischargeDate: billDetails.admission?.dischargeDate || selectedAdmission?.dischargeDate
        },
        roomCharges: billDetails.roomCharges || 0,
        procedureCharges: billDetails.procedureCharges || 0,
        medicineCharges: billDetails.medicineCharges || 0,
        labCharges: billDetails.labCharges || 0,
        otherCharges: billDetails.otherCharges || 0,
        consultationCharges: 0, // Can be added if consultation charges are tracked separately
        totalAmount: billDetails.totalAmount || 0
      };

      // Generate IPD bill PDF
      InvoicePDFGenerator.generateIPDBillPDF(invoiceData);
    } catch (err) {
      setError('Failed to generate bill PDF');
      console.error('Error generating bill PDF:', err);
    } finally {
      setLoading(false);
    }
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
          '💰 IPD Billing'
        )
      )
    ),

    // Content
    React.createElement(
      'div',
      { style: { padding: '20px', display: 'flex', gap: '20px', minHeight: 'calc(100vh - 100px)' } },
      
      // Left Panel - Admissions
      React.createElement(
        'div',
        {
          style: {
            width: '350px',
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
          'All Admissions'
        ),
        loading ? React.createElement('div', { style: { textAlign: 'center', padding: '20px' } }, 'Loading...') :
        admissions.length === 0 ? React.createElement(
          'div',
          { style: { textAlign: 'center', padding: '20px', color: '#666' } },
          'No admissions found'
        ) :
        React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
          ...admissions.map(admission => React.createElement(
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
              `Status: ${admission.status}`
            )
          ))
        )
      ),

      // Right Panel - Billing
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
            `${selectedAdmission.patient?.name || 'Unknown'} - IPD Billing`
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
            'select',
            {
              value: filterStatus,
              onChange: (e) => setFilterStatus(e.target.value),
              style: {
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                flex: 1,
                maxWidth: '300px'
              }
            },
            React.createElement('option', { value: '' }, 'All Payment Status'),
            ...paymentStatuses.map(ps => React.createElement('option', { key: ps.value, value: ps.value }, ps.label))
          ),
          canManageBills && React.createElement(
            'button',
            {
              onClick: () => {
                setShowBillForm(true);
                setEditingBill(null);
                resetBillForm();
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
            '+ Create Bill'
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

        // Bill Form
        showBillForm && React.createElement(
          'form',
          {
            onSubmit: handleSubmitBill,
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
            editingBill ? 'Edit Bill' : 'Create New Bill'
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
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Room Charges *'),
              React.createElement('input', {
                type: 'number',
                name: 'roomCharges',
                value: billForm.roomCharges,
                onChange: handleBillInputChange,
                required: true,
                min: '0',
                step: '0.01',
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Procedure Charges'),
              React.createElement('input', {
                type: 'number',
                name: 'procedureCharges',
                value: billForm.procedureCharges,
                onChange: handleBillInputChange,
                min: '0',
                step: '0.01',
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Medicine Charges'),
              React.createElement('input', {
                type: 'number',
                name: 'medicineCharges',
                value: billForm.medicineCharges,
                onChange: handleBillInputChange,
                min: '0',
                step: '0.01',
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Lab Charges'),
              React.createElement('input', {
                type: 'number',
                name: 'labCharges',
                value: billForm.labCharges,
                onChange: handleBillInputChange,
                min: '0',
                step: '0.01',
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              null,
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Other Charges'),
              React.createElement('input', {
                type: 'number',
                name: 'otherCharges',
                value: billForm.otherCharges,
                onChange: handleBillInputChange,
                min: '0',
                step: '0.01',
                style: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #dee2e6' }
              })
            ),
            React.createElement(
              'div',
              { style: { gridColumn: 'span 2' } },
              React.createElement(
                'div',
                {
                  style: {
                    padding: '10px',
                    backgroundColor: '#e7f3ff',
                    borderRadius: '4px',
                    textAlign: 'right'
                  }
                },
                React.createElement(
                  'strong',
                  { style: { fontSize: '18px' } },
                  `Total: ₹${calculateTotal().toFixed(2)}`
                )
              )
            ),
            React.createElement(
              'div',
              { style: { gridColumn: 'span 2' } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Notes'),
              React.createElement('textarea', {
                name: 'notes',
                value: billForm.notes,
                onChange: handleBillInputChange,
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
              loading ? 'Saving...' : 'Save Bill'
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: () => {
                  setShowBillForm(false);
                  setEditingBill(null);
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

        // Bills Table
        React.createElement(
          'div',
          { style: { overflowX: 'auto' } },
          inpatientBills.length === 0 ? React.createElement(
            'div',
            { style: { textAlign: 'center', padding: '40px', color: '#666' } },
            'No bills found for this admission'
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
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Created'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Room'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Procedures'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Medicines'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Lab'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Other'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'right' } }, 'Total'),
                React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Status'),
                canManageBills && React.createElement('th', { style: { padding: '12px', textAlign: 'left' } }, 'Actions')
              )
            ),
            React.createElement(
              'tbody',
              null,
              ...inpatientBills.map((bill, idx) => {
                const statusInfo = paymentStatuses.find(ps => ps.value === bill.status) || paymentStatuses[0];
                return React.createElement(
                  'tr',
                  {
                    key: bill.id,
                    style: {
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa'
                    }
                  },
                  React.createElement('td', { style: { padding: '12px' } }, new Date(bill.createdAt).toLocaleDateString()),
                  React.createElement('td', { style: { padding: '12px' } }, `₹${bill.roomCharges.toFixed(2)}`),
                  React.createElement('td', { style: { padding: '12px' } }, `₹${bill.procedureCharges.toFixed(2)}`),
                  React.createElement('td', { style: { padding: '12px' } }, `₹${bill.medicineCharges.toFixed(2)}`),
                  React.createElement('td', { style: { padding: '12px' } }, `₹${bill.labCharges.toFixed(2)}`),
                  React.createElement('td', { style: { padding: '12px' } }, `₹${bill.otherCharges.toFixed(2)}`),
                  React.createElement('td', { style: { padding: '12px', textAlign: 'right', fontWeight: 'bold' } }, `₹${bill.totalAmount.toFixed(2)}`),
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
                          backgroundColor: statusInfo.color + '20',
                          color: statusInfo.color
                        }
                      },
                      statusInfo.label
                    )
                  ),
                  canManageBills && React.createElement(
                    'td',
                    { style: { padding: '12px' } },
                    React.createElement(
                      'div',
                      { style: { display: 'flex', flexDirection: 'column', gap: '5px' } },
                      React.createElement(
                        'button',
                        {
                          onClick: () => handlePrintBill(bill),
                          style: {
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            marginBottom: '5px',
                            width: '100%'
                          }
                        },
                        'Print Bill'
                      ),
                      React.createElement(
                        'button',
                        {
                          onClick: () => handleEditBill(bill),
                          style: {
                            backgroundColor: '#ffc107',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            width: '100%'
                          }
                        },
                        'Edit'
                      ),
                      bill.status !== 'PAID' && React.createElement(
                        'div',
                        {
                          style: {
                            padding: '10px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            marginTop: '5px'
                          }
                        },
                        React.createElement('input', {
                          type: 'number',
                          placeholder: 'Paid Amount',
                          value: paymentForm.paidAmount,
                          onChange: (e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value }),
                          style: { width: '100%', padding: '5px', marginBottom: '5px', borderRadius: '4px', border: '1px solid #dee2e6' }
                        }),
                        React.createElement('select', {
                          value: paymentForm.paymentMode,
                          onChange: (e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value }),
                          style: { width: '100%', padding: '5px', marginBottom: '5px', borderRadius: '4px', border: '1px solid #dee2e6' }
                        },
                          ...paymentModes.map(pm => React.createElement('option', { key: pm.value, value: pm.value }, pm.label))
                        ),
                        React.createElement('select', {
                          value: paymentForm.status,
                          onChange: (e) => setPaymentForm({ ...paymentForm, status: e.target.value }),
                          style: { width: '100%', padding: '5px', marginBottom: '5px', borderRadius: '4px', border: '1px solid #dee2e6' }
                        },
                          ...paymentStatuses.map(ps => React.createElement('option', { key: ps.value, value: ps.value }, ps.label))
                        ),
                        React.createElement(
                          'button',
                          {
                            onClick: () => handleUpdatePayment(bill.id),
                            style: {
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              width: '100%'
                            }
                          },
                          'Update Payment'
                        )
                      )
                    )
                  )
                );
              })
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
        'Please select an admission to view bills'
      )
    )
  );
};

export default IPDBilling;

