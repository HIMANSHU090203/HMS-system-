import React, { useEffect, useMemo, useState } from 'react';
import InfoButton from '../common/InfoButton';
import { getInfoContent } from '../../lib/infoContent';
import patientService from '../../lib/api/services/patientService';
import consultationService from '../../lib/api/services/consultationService';
import labTestService from '../../lib/api/services/labTestService';
import prescriptionService from '../../lib/api/services/prescriptionService';
import configService from '../../lib/api/services/configService';
import InvoicePDFGenerator from '../../lib/utils/invoicePDFGenerator';

const BillingManagement = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Section-wise items storage
  const [sections, setSections] = useState({
    consultation: { items: [], subtotal: 0 },
    pharmacy: { items: [], subtotal: 0 },
    labTests: { items: [], subtotal: 0 },
    other: { items: [], subtotal: 0 }
  });

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [globalDiscountPct, setGlobalDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);
  const [activeSection, setActiveSection] = useState('consultation');
  const [showManualEntry, setShowManualEntry] = useState(false);

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
    
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return new Date(dateStr + 'T00:00:00');
      }
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
      }
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
      const newSections = {
        consultation: { items: [], subtotal: 0 },
        pharmacy: { items: [], subtotal: 0 },
        labTests: { items: [], subtotal: 0 },
        other: { items: [], subtotal: 0 }
      };

      // Consultations
      try {
        const c = await consultationService.getConsultations({ patientId: selectedPatientId, page: 1, limit: 500 });
        const consultations = c.consultations || [];
        console.log(`📋 Loaded ${consultations.length} consultations`);
        consultations.forEach((x) => {
          const consDate = x.consultationDate || x.createdAt || new Date().toISOString();
          if (!inDateRange(consDate)) return;
          const fee = Number(x.fee || 0);
          newSections.consultation.items.push({
            id: `CONS-${x.id}`,
            date: consDate,
            description: x.diagnosis ? `Consultation - ${x.diagnosis.substring(0, 60)}` : 'Consultation',
            quantity: 1,
            unitPrice: fee,
            amount: fee,
            data: x,
          });
        });
      } catch (e) {
        console.error('❌ Consultations fetch failed:', e);
      }

      // Lab tests
      try {
        const lt = await labTestService.getLabTests({ patientId: selectedPatientId, page: 1, limit: 500 });
        const labTests = lt.labTests || lt.tests || [];
        console.log(`🧪 Loaded ${labTests.length} lab tests`);
        labTests.forEach((t) => {
          const testDate = t.orderedAt || t.createdAt || t.updatedAt || new Date().toISOString();
          if (!inDateRange(testDate)) return;
          const price = Number(t.price || 0);
          newSections.labTests.items.push({
            id: `LAB-${t.id}`,
            date: testDate,
            description: t.testName || 'Lab Test',
            quantity: 1,
            unitPrice: price,
            amount: price,
            data: t,
          });
        });
      } catch (e) {
        console.error('❌ Lab tests fetch failed:', e);
      }

      // Prescriptions (medicines)
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
          
          if (pres.items && pres.items.length > 0) {
            pres.items.forEach((item, idx) => {
              const medName = item.medicine?.name || item.medicineName || 'Medicine';
              const medPrice = Number(item.medicine?.price || item.price || 0);
              const qty = Number(item.quantity || 1);
              const amount = medPrice * qty;
              
              newSections.pharmacy.items.push({
                id: `PRES-${pres.id}-${idx}`,
                date: presDate,
                description: `${medName} (${item.dosage || 'N/A'})`,
                quantity: qty,
                unitPrice: medPrice,
                amount: amount,
                data: { prescription: pres, item },
              });
            });
          }
        });
      } catch (e) {
        console.warn('Prescriptions fetch failed (continuing)', e);
      }

      // Calculate subtotals
      Object.keys(newSections).forEach(key => {
        newSections[key].subtotal = newSections[key].items.reduce(
          (sum, item) => sum + item.amount, 0
        );
      });

      // Preselect all items
      const allIds = new Set();
      Object.values(newSections).forEach(section => {
        section.items.forEach(item => allIds.add(item.id));
      });

      const totalItems = Object.values(newSections).reduce((sum, s) => sum + s.items.length, 0);
      if (totalItems === 0) {
        setError('No billable items found for the selected patient and date range.');
      } else {
        setError('');
      }
      
      setSections(newSections);
      setSelectedIds(allIds);
    } catch (e) {
      console.error('❌ Error loading billable items:', e);
      setError(`Failed to load billable items: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const addManualItem = (section) => {
    setSections(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: [...prev[section].items, {
          id: `MANUAL-${section}-${Date.now()}-${Math.random()}`,
          date: new Date().toISOString(),
          description: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0,
          manual: true
        }]
      }
    }));
  };

  const updateManualItem = (section, id, field, value) => {
    setSections(prev => {
      const newItems = prev[section].items.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = (updated.quantity || 0) * (updated.unitPrice || 0);
        }
        return updated;
      });
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      return {
        ...prev,
        [section]: { items: newItems, subtotal }
      };
    });
  };

  const removeItem = (section, id) => {
    setSections(prev => {
      const newItems = prev[section].items.filter(item => item.id !== id);
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      return {
        ...prev,
        [section]: { items: newItems, subtotal }
      };
    });
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const totals = useMemo(() => {
    let subTotal = 0;
    let count = 0;
    
    Object.values(sections).forEach(section => {
      section.items.forEach(item => {
        if (selectedIds.has(item.id)) {
          subTotal += item.amount;
          count++;
        }
      });
    });

    const discount = Math.max(0, Math.min(100, Number(globalDiscountPct || 0)));
    const afterDiscount = subTotal * (1 - discount / 100);
    const tax = Math.max(0, Number(taxPct || 0));
    const taxAmount = afterDiscount * (tax / 100);
    const grand = afterDiscount + taxAmount;
    
    return { count, subTotal, discountPct: discount, afterDiscount, taxPct: tax, taxAmount, grand };
  }, [sections, selectedIds, globalDiscountPct, taxPct]);

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const printInvoice = async (printType = 'all') => {
    try {
      setLoading(true);
      const patient = patients.find((p) => p.id === selectedPatientId);

      if (!patient) {
        setError('Please select a patient');
        return;
      }

      // Get selected items based on print type
      let selectedSections = {};
      
      if (printType === 'current') {
        // Only current section
        selectedSections = {
          consultation: { items: [], subtotal: 0 },
          pharmacy: { items: [], subtotal: 0 },
          labTests: { items: [], subtotal: 0 },
          other: { items: [], subtotal: 0 }
        };
        selectedSections[activeSection] = {
          items: sections[activeSection].items.filter(item => selectedIds.has(item.id)),
          subtotal: 0
        };
      } else if (printType === 'selected') {
        // All selected items from all sections
        selectedSections = {
          consultation: {
            items: sections.consultation.items.filter(item => selectedIds.has(item.id)),
            subtotal: 0
          },
          pharmacy: {
            items: sections.pharmacy.items.filter(item => selectedIds.has(item.id)),
            subtotal: 0
          },
          labTests: {
            items: sections.labTests.items.filter(item => selectedIds.has(item.id)),
            subtotal: 0
          },
          other: {
            items: sections.other.items.filter(item => selectedIds.has(item.id)),
            subtotal: 0
          }
        };
      } else {
        // All items from all sections
        selectedSections = {
          consultation: { items: sections.consultation.items, subtotal: 0 },
          pharmacy: { items: sections.pharmacy.items, subtotal: 0 },
          labTests: { items: sections.labTests.items, subtotal: 0 },
          other: { items: sections.other.items, subtotal: 0 }
        };
      }

      // Calculate section subtotals
      Object.keys(selectedSections).forEach(key => {
        selectedSections[key].subtotal = selectedSections[key].items.reduce(
          (sum, item) => sum + item.amount, 0
        );
      });

      const hasSelectedItems = Object.values(selectedSections).some(s => s.items.length > 0);
      if (!hasSelectedItems) {
        setError('No items to print. Please select at least one item.');
        return;
      }

      // Calculate totals for selected items
      let printSubTotal = 0;
      Object.values(selectedSections).forEach(section => {
        printSubTotal += section.subtotal;
      });

      const discount = Math.max(0, Math.min(100, Number(globalDiscountPct || 0)));
      const afterDiscount = printSubTotal * (1 - discount / 100);
      const tax = Math.max(0, Number(taxPct || 0));
      const taxAmount = afterDiscount * (tax / 100);
      const grand = afterDiscount + taxAmount;

      // Fetch hospital config
      const configResponse = await configService.getHospitalConfig();
      const hospitalConfig = configResponse.config || {};

      // Prepare invoice data with section-wise items
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
          currency: hospitalConfig.currency || 'USD',
          modulesEnabled: hospitalConfig.modulesEnabled || {}
        },
        billNumber: `BILL-${new Date().getTime()}`,
        billDate: new Date().toISOString(),
        patient: {
          id: patient?.id || '',
          name: patient?.name || 'N/A',
          address: patient?.address || 'N/A',
          phone: patient?.phone || ''
        },
        items: selectedSections, // Section-wise items
        subtotal: printSubTotal,
        discount: printSubTotal - afterDiscount,
        tax: taxAmount,
        totalAmount: grand
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

  const getSectionTitle = (section) => {
    const titles = {
      consultation: 'Consultation',
      pharmacy: 'Pharmacy',
      labTests: 'Lab Tests',
      other: 'Other'
    };
    return titles[section] || section;
  };

  const getSectionIcon = (section) => {
    const icons = {
      consultation: '👨‍⚕️',
      pharmacy: '💊',
      labTests: '🔬',
      other: '📌'
    };
    return icons[section] || '📋';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">💰 Billing Management</h1>
          <InfoButton 
            title={getInfoContent('billing').title} 
            content={getInfoContent('billing').content} 
            size="md" 
            variant="info" 
          />
        </div>
      </div>


      {/* Section-wise Items Display */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        {/* Header with title */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Billable Items (Section-wise)
          </h2>
        </div>

        {/* Section Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {Object.keys(sections).map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === section
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {getSectionIcon(section)} {getSectionTitle(section)} ({sections[section].items.length})
              </button>
            ))}
          </div>
        </div>

        {/* Active Section Content */}
        <div className="p-6">
          {/* Filters - Shown in every section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Patient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              {/* Date from */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                  value={dateFrom} 
                  onChange={(e) => setDateFrom(e.target.value)} 
                />
              </div>
              {/* Date to */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                  value={dateTo} 
                  onChange={(e) => setDateTo(e.target.value)} 
                />
              </div>
              {/* Load button */}
              <div className="flex items-end">
                <button 
                  onClick={loadItems} 
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Loading…' : 'Load Items'}
                </button>
              </div>
              {/* Manual entry toggle */}
              <div className="flex items-end">
                <button 
                  onClick={() => setShowManualEntry(!showManualEntry)} 
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  {showManualEntry ? 'Hide Manual' : '+ Add Manual'}
                </button>
              </div>
            </div>
            {error && <div className="text-red-600 mt-3">{error}</div>}
          </div>

          {/* Discount, Tax and Print Controls */}
          <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Discount %</label>
                <input 
                  type="number" 
                  min={0} 
                  max={100} 
                  value={globalDiscountPct === 0 ? '' : globalDiscountPct} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '-') {
                      setGlobalDiscountPct(0);
                    } else {
                      const numVal = parseFloat(val);
                      if (!isNaN(numVal) && numVal >= 0 && numVal <= 100) {
                        setGlobalDiscountPct(numVal);
                      }
                    }
                  }} 
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tax %</label>
                <input 
                  type="number" 
                  min={0} 
                  value={taxPct === 0 ? '' : taxPct} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '-') {
                      setTaxPct(0);
                    } else {
                      const numVal = parseFloat(val);
                      if (!isNaN(numVal) && numVal >= 0) {
                        setTaxPct(numVal);
                      }
                    }
                  }} 
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
              </div>
            </div>
            
            {/* Print Options */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => printInvoice('all')} 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                🖨️ Print All Sections
              </button>
              <button 
                onClick={() => printInvoice('current')} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                📄 Print {getSectionTitle(activeSection)}
              </button>
              <button 
                onClick={() => printInvoice('selected')} 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                ✓ Print Selected Only
              </button>
            </div>
          </div>

          {sections[activeSection].items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No items in {getSectionTitle(activeSection)} section</p>
              {showManualEntry && (
                <button
                  onClick={() => addManualItem(activeSection)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Add Item
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left w-12"></th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      {showManualEntry && <th className="px-4 py-2 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sections[activeSection].items.map((item) => (
                      <tr key={item.id} className={selectedIds.has(item.id) ? 'bg-blue-50' : ''}>
                        <td className="px-4 py-2">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.has(item.id)} 
                            onChange={() => toggleRow(item.id)} 
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-2">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          {item.manual && showManualEntry ? (
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateManualItem(activeSection, item.id, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              placeholder="Description"
                            />
                          ) : (
                            item.description
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {item.manual && showManualEntry ? (
                            <input
                              type="number"
                              value={item.quantity === 0 ? '' : item.quantity}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || val === '-') {
                                  updateManualItem(activeSection, item.id, 'quantity', 0);
                                } else {
                                  const numVal = parseInt(val);
                                  if (!isNaN(numVal) && numVal >= 0) {
                                    updateManualItem(activeSection, item.id, 'quantity', numVal);
                                  }
                                }
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                              min="0"
                              placeholder="0"
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {item.manual && showManualEntry ? (
                            <input
                              type="number"
                              value={item.unitPrice === 0 ? '' : item.unitPrice}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || val === '-') {
                                  updateManualItem(activeSection, item.id, 'unitPrice', 0);
                                } else {
                                  const numVal = parseFloat(val);
                                  if (!isNaN(numVal) && numVal >= 0) {
                                    updateManualItem(activeSection, item.id, 'unitPrice', numVal);
                                  }
                                }
                              }}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                            />
                          ) : (
                            item.unitPrice.toFixed(2)
                          )}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">{item.amount.toFixed(2)}</td>
                        {showManualEntry && (
                          <td className="px-4 py-2 text-center">
                            {item.manual && (
                              <button
                                onClick={() => removeItem(activeSection, item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                🗑️
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {showManualEntry && (
                <button
                  onClick={() => addManualItem(activeSection)}
                  className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Add Item to {getSectionTitle(activeSection)}
                </button>
              )}

              {/* Section Subtotal */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                <div className="text-right">
                  <span className="text-sm text-gray-600">Section Subtotal: </span>
                  <span className="text-lg font-bold">{sections[activeSection].subtotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Total Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Selected Items:</span>
            <span className="font-medium">{totals.count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{totals.subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Discount ({totals.discountPct}%):</span>
            <span>-{(totals.subTotal - totals.afterDiscount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-blue-600">
            <span>Tax ({totals.taxPct}%):</span>
            <span>+{totals.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t-2 border-gray-200 pt-2 mt-2">
            <span>Grand Total:</span>
            <span className="text-green-600">{totals.grand.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingManagement;
