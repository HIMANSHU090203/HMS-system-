import React, { useState, useEffect } from 'react';
import configService from '../../lib/api/services/configService';

const ConfigurationManagement = ({ user }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await configService.getHospitalConfig();
      const cfg = data.config || {};

      // Ensure nested defaults for new JSON sections
      const modulesEnabled = cfg.modulesEnabled || {};
      const billingSettings = modulesEnabled.billingSettings || {
        invoicePrefix: 'INV-',
        nextInvoiceNumber: 1,
        footerText: '',
        roundingRule: 'none', // none|nearest_1|nearest_0_5
        taxInclusive: false,
        paymentMethods: { cash: true, card: true, upi: true, bank: false },
        allowPartialPayments: true
      };
      const workingHours = cfg.workingHours || {
        workingDays: ['Mon','Tue','Wed','Thu','Fri'],
        startTime: '09:00',
        endTime: '17:00'
      };

      setConfig(cfg);
      setFormData({ ...cfg, modulesEnabled: { ...modulesEnabled, billingSettings }, workingHours });
    } catch (err) {
      console.error('Load config error:', err);
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updated = await configService.updateHospitalConfig(formData);
      setConfig(updated.config);
      setSuccess('Configuration updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Update config error:', err);
      setError('Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseFloat(value)) : value)
    }));
  };

  const updateNested = (path, value) => {
    setFormData(prev => {
      const clone = { ...prev };
      const keys = path.split('.');
      let node = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        node[keys[i]] = node[keys[i]] ?? {};
        node = node[keys[i]];
      }
      node[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  if (loading && !config) {
    return React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' } },
      'Loading configuration...'
    );
  }

  return React.createElement(
    'div',
    { style: { padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' } },

    React.createElement(
      'h1',
      { style: { fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '24px' } },
      'Hospital Configuration'
    ),

    React.createElement(
      'div',
      { style: { backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px' } },

      (error || success) && React.createElement(
        'div',
        {
          style: {
            backgroundColor: error ? '#FEF2F2' : '#D1FAE5',
            border: `1px solid ${error ? '#FECACA' : '#A7F3D0'}`,
            color: error ? '#DC2626' : '#065F46',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '14px'
          }
        },
        error || success
      ),

      config && React.createElement('form', { onSubmit: handleSubmit },

        // Identity
        React.createElement('h3', { style: { fontWeight: '600', margin: '8px 0 12px 0' } }, 'Identity'),
        React.createElement(
          'div',
          { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' } },
          // name
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Hospital Name *'),
            React.createElement('input', { type: 'text', name: 'hospitalName', value: formData.hospitalName || '', onChange: handleInputChange, required: true, style: inputStyle })
          ),
          // logo
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Logo URL'),
            React.createElement('input', { type: 'text', value: (formData.logoUrl || ''), onChange: (e) => updateNested('logoUrl', e.target.value), style: inputStyle })
          ),
          // address
          React.createElement('div', { style: { gridColumn: 'span 2' } },
            React.createElement('label', { style: labelStyle }, 'Address'),
            React.createElement('input', { type: 'text', name: 'address', value: formData.address || '', onChange: handleInputChange, style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'City'),
            React.createElement('input', { type: 'text', name: 'city', value: formData.city || '', onChange: handleInputChange, style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'State'),
            React.createElement('input', { type: 'text', name: 'state', value: formData.state || '', onChange: handleInputChange, style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Postal Code'),
            React.createElement('input', { type: 'text', name: 'postalCode', value: formData.postalCode || '', onChange: handleInputChange, style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Country'),
            React.createElement('input', { type: 'text', name: 'country', value: formData.country || '', onChange: handleInputChange, style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Phone'),
            React.createElement('input', { type: 'text', name: 'phone', value: formData.phone || '', onChange: handleInputChange, style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Email'),
            React.createElement('input', { type: 'email', name: 'email', value: formData.email || '', onChange: handleInputChange, style: inputStyle })
          )
        ),

        // Localization
        React.createElement('h3', { style: sectionTitle }, 'Localization'),
        React.createElement('div', { style: gridStyle },
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Currency (e.g., INR, USD)'),
            React.createElement('input', { type: 'text', name: 'currency', value: formData.currency || 'USD', onChange: handleInputChange, style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Timezone (IANA, e.g., Asia/Kolkata)'),
            React.createElement('input', { type: 'text', name: 'timezone', value: formData.timezone || 'UTC', onChange: handleInputChange, style: inputStyle })
          )
        ),

        // Taxes
        React.createElement('h3', { style: sectionTitle }, 'Taxes'),
        React.createElement('div', { style: gridStyle },
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Default Tax Rate (%)'),
            React.createElement('input', { type: 'number', step: '0.01', name: 'taxRate', value: formData.taxRate || 0, onChange: handleInputChange, style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Tax Inclusive Pricing'),
            React.createElement('input', { type: 'checkbox', checked: !!formData.modulesEnabled?.billingSettings?.taxInclusive, onChange: (e) => updateNested('modulesEnabled.billingSettings.taxInclusive', e.target.checked) })
          )
        ),

        // Billing
        React.createElement('h3', { style: sectionTitle }, 'Billing'),
        React.createElement('div', { style: gridStyle },
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Invoice Prefix'),
            React.createElement('input', { type: 'text', value: formData.modulesEnabled?.billingSettings?.invoicePrefix || '', onChange: (e) => updateNested('modulesEnabled.billingSettings.invoicePrefix', e.target.value), style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Next Invoice Number'),
            React.createElement('input', { type: 'number', min: 1, value: formData.modulesEnabled?.billingSettings?.nextInvoiceNumber ?? 1, onChange: (e) => updateNested('modulesEnabled.billingSettings.nextInvoiceNumber', parseInt(e.target.value || '1', 10)), style: inputStyle })
          ),
          React.createElement('div', { style: { gridColumn: 'span 2' } },
            React.createElement('label', { style: labelStyle }, 'Invoice Footer Text'),
            React.createElement('textarea', { rows: 3, value: formData.modulesEnabled?.billingSettings?.footerText || '', onChange: (e) => updateNested('modulesEnabled.billingSettings.footerText', e.target.value), style: textareaStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Rounding Rule'),
            React.createElement('select', { value: formData.modulesEnabled?.billingSettings?.roundingRule || 'none', onChange: (e) => updateNested('modulesEnabled.billingSettings.roundingRule', e.target.value), style: inputStyle },
              React.createElement('option', { value: 'none' }, 'No Rounding'),
              React.createElement('option', { value: 'nearest_1' }, 'Nearest 1.00'),
              React.createElement('option', { value: 'nearest_0_5' }, 'Nearest 0.50')
            )
          )
        ),

        // Payments
        React.createElement('h3', { style: sectionTitle }, 'Payments'),
        React.createElement('div', { style: gridStyle },
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Enabled Methods'),
            React.createElement('div', { style: { display: 'flex', gap: '16px', alignItems: 'center' } },
              ['cash','card','upi','bank'].map((m) => React.createElement('label', { key: m, style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                React.createElement('input', { type: 'checkbox', checked: !!formData.modulesEnabled?.billingSettings?.paymentMethods?.[m], onChange: (e) => updateNested(`modulesEnabled.billingSettings.paymentMethods.${m}`, e.target.checked) }),
                m.toUpperCase()
              ))
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Allow Partial Payments'),
            React.createElement('input', { type: 'checkbox', checked: !!formData.modulesEnabled?.billingSettings?.allowPartialPayments, onChange: (e) => updateNested('modulesEnabled.billingSettings.allowPartialPayments', e.target.checked) })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Default Payment Mode'),
            React.createElement('select', { name: 'defaultPaymentMode', value: formData.defaultPaymentMode || '', onChange: handleInputChange, style: inputStyle },
              React.createElement('option', { value: '' }, '—'),
              React.createElement('option', { value: 'CASH' }, 'Cash'),
              React.createElement('option', { value: 'CARD' }, 'Card'),
              React.createElement('option', { value: 'UPI' }, 'UPI'),
              React.createElement('option', { value: 'BANK' }, 'Bank Transfer')
            )
          )
        ),

        // Appointments
        React.createElement('h3', { style: sectionTitle }, 'Appointments'),
        React.createElement('div', { style: gridStyle },
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Slot Duration (minutes)'),
            React.createElement('input', { type: 'number', name: 'appointmentSlotDuration', value: formData.appointmentSlotDuration || 30, onChange: handleInputChange, style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Working Days (comma separated)'),
            React.createElement('input', { type: 'text', value: (formData.workingHours?.workingDays || []).join(', '), onChange: (e) => updateNested('workingHours.workingDays', e.target.value.split(',').map(s => s.trim()).filter(Boolean)), style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Start Time (HH:MM)'),
            React.createElement('input', { type: 'time', value: formData.workingHours?.startTime || '09:00', onChange: (e) => updateNested('workingHours.startTime', e.target.value), style: inputStyle })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'End Time (HH:MM)'),
            React.createElement('input', { type: 'time', value: formData.workingHours?.endTime || '17:00', onChange: (e) => updateNested('workingHours.endTime', e.target.value), style: inputStyle })
          )
        ),

        React.createElement(
          'div',
          { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' } },
          React.createElement(
            'button',
            {
              type: 'submit',
              disabled: loading,
              style: saveBtnStyle
            },
            loading ? 'Saving...' : 'Save Configuration'
          )
        )
      )
    )
  );
};

const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px', backgroundColor: '#FFFFFF' };
const textareaStyle = { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px', backgroundColor: '#FFFFFF' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' };
const sectionTitle = { fontWeight: '600', margin: '16px 0 12px 0' };
const saveBtnStyle = { backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' };

export default ConfigurationManagement;

