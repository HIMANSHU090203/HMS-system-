import React, { useEffect, useMemo, useState } from 'react';
import InfoButton from '../common/InfoButton';
import { getInfoContent } from '../../lib/infoContent';
import patientService from '../../lib/api/services/patientService';
import consultationService from '../../lib/api/services/consultationService';
import labTestService from '../../lib/api/services/labTestService';
import prescriptionService from '../../lib/api/services/prescriptionService';
import medicineService from '../../lib/api/services/medicineService';
import configService from '../../lib/api/services/configService';
import InvoicePDFGenerator from '../../lib/utils/invoicePDFGenerator';

const BillingManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [items, setItems] = useState([]); // billable rows
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [globalDiscountPct, setGlobalDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);

  useEffect(() => {
    // load a short list of patients for selection
    (async () => {
      try {
        const res = await patientService.getPatients({ page: 1, limit: 200 });
        setPatients(res.patients || []);
      } catch (e) {
        console.error('Failed to load patients', e);
      }
    })();
  }, []);

  const inDateRange = (iso) => {
    if (!dateFrom && !dateTo) return true;
    if (!iso) return false;
    
    // Parse the date string (handles various formats)
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    
    // Parse dateFrom and dateTo (handles YYYY-MM-DD from HTML date input, MM/DD/YYYY, and ISO formats)
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      
      // Handle YYYY-MM-DD format (HTML date input)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr + 'T00:00:00');
      }
      
      // Handle MM/DD/YYYY format
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
      }
      
      // Handle ISO format or other formats
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      
      return null;
    };
    
    const fromDate = parseDate(dateFrom);
    const toDate = parseDate(dateTo);
    
    if (fromDate && d < fromDate) return false;
    if (toDate) {
      const toDateEnd = new Date(toDate);
      toDateEnd.setHours(23, 59, 59, 999);
      if (d > toDateEnd) return false;
    }
    return true;
  };

  const loadItems = async () => {
    if (!selectedPatientId) {
      setError('Please select a patient');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const rows = [];

      // Consultations
      try {
        const c = await consultationService.getConsultations({ patientId: selectedPatientId, page: 1, limit: 500 });
        const consultations = c.consultations || [];
        console.log(`📋 Loaded ${consultations.length} consultations for patient ${selectedPatientId}`);
        consultations.forEach((x) => {
          const consDate = x.consultationDate || x.createdAt || new Date().toISOString();
          if (!inDateRange(consDate)) {
            console.log(`⏭️ Consultation ${x.id} skipped - date ${consDate} not in range`);
            return;
          }
          const fee = Number(x.fee || 0);
          // Even if fee is 0, include it so user can set a price
          rows.push({
            id: `CONS-${x.id}`,
            source: 'Consultation',
            date: consDate,
            description: x.diagnosis ? `Consultation - ${x.diagnosis.substring(0, 60)}` : 'Consultation',
            qty: 1,
            price: fee,
            data: x,
          });
        });
        console.log(`✅ Added ${consultations.filter(x => inDateRange(x.consultationDate || x.createdAt)).length} consultations to billable items`);
      } catch (e) {
        console.error('❌ Consultations fetch failed:', e);
        setError(`Failed to load consultations: ${e.message || 'Unknown error'}`);
      }

      // Lab tests
      try {
        const lt = await labTestService.getLabTests({ patientId: selectedPatientId, page: 1, limit: 500 });
        const labTests = lt.labTests || lt.tests || [];
        console.log(`🧪 Loaded ${labTests.length} lab tests for patient ${selectedPatientId}`);
        labTests.forEach((t) => {
          const testDate = t.orderedAt || t.createdAt || t.updatedAt || new Date().toISOString();
          if (!inDateRange(testDate)) {
            console.log(`⏭️ Lab test ${t.id} skipped - date ${testDate} not in range`);
            return;
          }
          const price = Number(t.price || 0);
          rows.push({
            id: `LAB-${t.id}`,
            source: 'Lab Test',
            date: testDate,
            description: t.testName || 'Lab Test',
            qty: 1,
            price: price,
            data: t,
          });
        });
        console.log(`✅ Added ${labTests.filter(t => inDateRange(t.orderedAt || t.createdAt || t.updatedAt)).length} lab tests to billable items`);
      } catch (e) {
        console.error('❌ Lab tests fetch failed:', e);
        setError(`Failed to load lab tests: ${e.message || 'Unknown error'}`);
      }

      // Prescriptions (which contain medicines)
      try {
        const presRes = await prescriptionService.getPrescriptions({ 
          patientId: selectedPatientId, 
          page: 1, 
          limit: 500 
        });
        const prescriptions = presRes.prescriptions || [];
        prescriptions.forEach((pres) => {
          const presDate = pres.createdAt || pres.updatedAt || new Date().toISOString();
          if (!inDateRange(presDate)) return;
          
          // Add prescription as a billable item
          if (pres.items && pres.items.length > 0) {
            // If prescription has items, add each medicine separately
            pres.items.forEach((item, idx) => {
              const medName = item.medicine?.name || item.medicineName || 'Medicine';
              const medPrice = Number(item.medicine?.price || item.price || 0);
              const qty = Number(item.quantity || 1);
              
              rows.push({
                id: `PRES-${pres.id}-${idx}`,
                source: 'Prescription',
                date: presDate,
                description: `${medName} (${item.dosage || 'N/A'})`,
                qty: qty,
                price: medPrice,
                data: { prescription: pres, item },
              });
            });
          } else {
            // If no items, add prescription itself (if it has a fee)
            const fee = Number(pres.fee || 0);
            if (fee > 0) {
              rows.push({
                id: `PRES-${pres.id}`,
                source: 'Prescription',
                date: presDate,
                description: 'Prescription Fee',
                qty: 1,
                price: fee,
                data: pres,
              });
            }
          }
        });
      } catch (e) {
        console.warn('Prescriptions fetch failed (continuing)', e);
        console.error('Prescription error details:', e);
      }

      // Preselect all rows by default
      const idSet = new Set(rows.map((r) => r.id));
      console.log(`✅ Total billable items loaded: ${rows.length}`);
      console.log(`📊 Items by type:`, {
        consultations: rows.filter(r => r.source === 'Consultation').length,
        labTests: rows.filter(r => r.source === 'Lab Test').length,
        prescriptions: rows.filter(r => r.source === 'Prescription').length,
      });
      
      if (rows.length === 0) {
        setError('No billable items found for the selected patient and date range. Please check the dates or ensure the patient has consultations, lab tests, or prescriptions.');
      } else {
        setError(''); // Clear any previous errors
      }
      
      setItems(rows);
      setSelectedIds(idSet);
    } catch (e) {
      console.error('❌ Error loading billable items:', e);
      setError(`Failed to load billable items: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    const selected = items.filter((r) => selectedIds.has(r.id));
    const subTotal = selected.reduce((sum, r) => sum + r.price * r.qty, 0);
    const discount = Math.max(0, Math.min(100, Number(globalDiscountPct || 0)));
    const afterDiscount = subTotal * (1 - discount / 100);
    const tax = Math.max(0, Number(taxPct || 0));
    const taxAmount = afterDiscount * (tax / 100);
    const grand = afterDiscount + taxAmount;
    return { count: selected.length, subTotal, discountPct: discount, afterDiscount, taxPct: tax, taxAmount, grand };
  }, [items, selectedIds, globalDiscountPct, taxPct]);

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const printInvoice = async () => {
    try {
      setLoading(true);
      const patient = patients.find((p) => p.id === selectedPatientId);
      const selected = items.filter((r) => selectedIds.has(r.id));

      if (selected.length === 0) {
        setError('Please select at least one item to generate invoice');
        return;
      }

      // Fetch hospital config
      const configResponse = await configService.getHospitalConfig();
      const hospitalConfig = configResponse.config || {};

      // Get billing settings for footer text
      const billingSettings = hospitalConfig.modulesEnabled?.billingSettings || {};
      const footerText = billingSettings.footerText || '';

      // Format items for invoice
      const invoiceItems = selected.map(r => ({
        description: r.description,
        quantity: r.qty,
        unitPrice: r.price,
        price: r.price * r.qty
      }));

      // Prepare invoice data
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
          insuranceValidityNote: hospitalConfig.insuranceValidityNote || 'This Receipt is valid for an employer or insurer, who contractually obligated to reimburse the medical expenses covered by MediSave and/or MediShield.',
          footerText: footerText
        },
        billNumber: `BILL-${new Date().getTime()}`,
        billDate: new Date().toISOString(),
        patient: {
          id: patient?.id || '',
          name: patient?.name || 'N/A',
          address: patient?.address || 'N/A',
          phone: patient?.phone || ''
        },
        items: invoiceItems,
        subtotal: totals.subTotal,
        discount: totals.subTotal - totals.afterDiscount,
        tax: totals.taxAmount,
        totalAmount: totals.grand
      };

      // Generate invoice PDF
      InvoicePDFGenerator.generateOPDBillPDF(invoiceData);
      setError('');
    } catch (err) {
      setError('Failed to generate invoice');
      console.error('Error generating invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'min-h-screen bg-gray-50 p-6' },

    // Header
    React.createElement(
      'div',
      { className: 'mb-6' },
      React.createElement(
        'div',
        { className: 'flex items-center gap-3' },
        React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, '💰 Billing Management'),
        React.createElement(InfoButton, { title: getInfoContent('billing').title, content: getInfoContent('billing').content, size: 'md', variant: 'info' })
      )
    ),

    // Filters
    React.createElement(
      'div',
      { className: 'bg-white rounded-lg shadow p-6 mb-6' },
      React.createElement(
        'div',
        { className: 'grid grid-cols-1 md:grid-cols-4 gap-4' },
        // Patient
        React.createElement(
          'div',
          null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'Patient *'),
          React.createElement(
            'select',
            {
              className: 'w-full px-3 py-2 border border-gray-300 rounded-lg',
              value: selectedPatientId,
              onChange: (e) => setSelectedPatientId(e.target.value)
            },
            React.createElement('option', { value: '' }, 'Select patient'),
            ...patients.map((p) => React.createElement('option', { key: p.id, value: p.id }, p.name))
          )
        ),
        // Date from
        React.createElement(
          'div',
          null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'From'),
          React.createElement('input', { type: 'date', className: 'w-full px-3 py-2 border border-gray-300 rounded-lg', value: dateFrom, onChange: (e) => setDateFrom(e.target.value) })
        ),
        // Date to
        React.createElement(
          'div',
          null,
          React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-1' }, 'To'),
          React.createElement('input', { type: 'date', className: 'w-full px-3 py-2 border border-gray-300 rounded-lg', value: dateTo, onChange: (e) => setDateTo(e.target.value) })
        ),
        // Load button
        React.createElement(
          'div',
          { className: 'flex items-end' },
          React.createElement(
            'button',
            { onClick: loadItems, className: 'w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700' },
            loading ? 'Loading…' : 'Load Items'
          )
        )
      ),
      error && React.createElement('div', { className: 'text-red-600 mt-3' }, error)
    ),

    // Aggregated items
    React.createElement(
      'div',
      { className: 'bg-white rounded-lg shadow overflow-hidden' },
      React.createElement(
        'div',
        { className: 'px-6 py-4 border-b border-gray-200 flex items-center justify-between' },
        React.createElement('h2', { className: 'text-lg font-medium text-gray-900' }, `Items (${items.length})`),
        React.createElement(
          'div',
          { className: 'flex items-center gap-3' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs text-gray-500' }, 'Discount %'),
            React.createElement('input', { type: 'number', min: 0, max: 100, value: globalDiscountPct, onChange: (e) => setGlobalDiscountPct(e.target.value), className: 'w-24 px-2 py-1 border border-gray-300 rounded' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-xs text-gray-500' }, 'Tax %'),
            React.createElement('input', { type: 'number', min: 0, value: taxPct, onChange: (e) => setTaxPct(e.target.value), className: 'w-24 px-2 py-1 border border-gray-300 rounded' })
          ),
          React.createElement(
            'button',
            { onClick: printInvoice, className: 'bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700' },
            'Print Invoice'
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'overflow-x-auto' },
        React.createElement(
          'table',
          { className: 'min-w-full divide-y divide-gray-200 text-sm' },
          React.createElement(
            'thead',
            { className: 'bg-gray-50' },
            React.createElement(
              'tr',
              null,
              React.createElement('th', { className: 'px-4 py-2 text-left' }, ''),
              React.createElement('th', { className: 'px-4 py-2 text-left' }, 'Date'),
              React.createElement('th', { className: 'px-4 py-2 text-left' }, 'Type'),
              React.createElement('th', { className: 'px-4 py-2 text-left' }, 'Description'),
              React.createElement('th', { className: 'px-4 py-2 text-right' }, 'Qty'),
              React.createElement('th', { className: 'px-4 py-2 text-right' }, 'Price'),
              React.createElement('th', { className: 'px-4 py-2 text-right' }, 'Amount')
            )
          ),
          React.createElement(
            'tbody',
            { className: 'bg-white divide-y divide-gray-200' },
            ...items.map((r) => React.createElement(
              'tr',
              { key: r.id, className: selectedIds.has(r.id) ? 'bg-blue-50' : '' },
              React.createElement('td', { className: 'px-4 py-2' },
                React.createElement('input', { type: 'checkbox', checked: selectedIds.has(r.id), onChange: () => toggleRow(r.id) })
              ),
              React.createElement('td', { className: 'px-4 py-2' }, new Date(r.date).toLocaleString()),
              React.createElement('td', { className: 'px-4 py-2' }, r.source),
              React.createElement('td', { className: 'px-4 py-2' }, r.description),
              React.createElement('td', { className: 'px-4 py-2 text-right' }, r.qty),
              React.createElement('td', { className: 'px-4 py-2 text-right' }, r.price.toFixed(2)),
              React.createElement('td', { className: 'px-4 py-2 text-right' }, (r.price * r.qty).toFixed(2))
            ))
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'px-6 py-4 border-t border-gray-200 flex justify-end' },
        React.createElement(
          'div',
          { className: 'text-sm' },
          React.createElement('div', { className: 'flex justify-between gap-12' },
            React.createElement('div', null, 'Selected Items:'),
            React.createElement('div', null, `${totals.count}`)
          ),
          React.createElement('div', { className: 'flex justify-between gap-12' },
            React.createElement('div', null, 'Subtotal:'),
            React.createElement('div', null, totals.subTotal.toFixed(2))
          ),
          React.createElement('div', { className: 'flex justify-between gap-12' },
            React.createElement('div', null, `Discount (${totals.discountPct}%)`),
            React.createElement('div', null, (totals.subTotal - totals.afterDiscount).toFixed(2))
          ),
          React.createElement('div', { className: 'flex justify-between gap-12' },
            React.createElement('div', null, `Tax (${totals.taxPct}%)`),
            React.createElement('div', null, totals.taxAmount.toFixed(2))
          ),
          React.createElement('div', { className: 'flex justify-between gap-12 font-semibold border-t mt-2 pt-2' },
            React.createElement('div', null, 'Total'),
            React.createElement('div', null, totals.grand.toFixed(2))
          )
        )
      )
    )
  );
};

export default BillingManagement;
