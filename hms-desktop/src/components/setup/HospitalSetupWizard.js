import React, { useState } from 'react';
import configService from '../../lib/api/services/configService';
import { CURRENCIES, TIMEZONES } from '../../lib/utils/currencyAndTimezone';

const HospitalSetupWizard = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    hospitalName: '',
    hospitalCode: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    emergencyContact: '',
    hospitalLicenseNumber: '',
    timezone: 'UTC',
    defaultLanguage: 'en',
    currency: 'USD',
    taxRate: 0,
    medicineMarkupPercentage: 0,
    appointmentSlotDuration: 30,
    defaultDoctorConsultationDuration: 30,
    defaultPaymentTerms: 'net30',
    operatingHours: {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '09:00', end: '13:00', enabled: false },
      sunday: { start: '09:00', end: '13:00', enabled: false }
    },
    labTestsEnabled: true,
    ipdEnabled: true,
    billingEnabled: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await configService.updateHospitalConfig(formData);
      onComplete();
    } catch (err) {
      console.error('Setup failed:', err);
      setError(err.response?.data?.message || 'Failed to setup hospital profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      setError('');
    }
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: field === 'enabled' ? value : value
        }
      }
    }));
  };

  return React.createElement(
    'div',
    {
      style: {
        minHeight: '100vh',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }
    },
    
    React.createElement(
      'div',
      {
        style: {
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '4px',
          padding: '32px'
        }
      },
      
      // Header
      React.createElement(
        'div',
        { style: { marginBottom: '24px' } },
        React.createElement(
          'h1',
          { style: { fontSize: '24px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' } },
          '🏥 Hospital Setup'
        ),
        React.createElement(
          'p',
          { style: { fontSize: '14px', color: '#6B7280', margin: '0' } },
          'Configure your hospital profile to get started'
        )
      ),

      // Error message
      error && React.createElement(
        'div',
        {
          style: {
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px'
          }
        },
        error
      ),

      // Form
      React.createElement(
        'form',
        { onSubmit: handleSubmit },
        
        // Hospital Name & Code
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '12px', marginBottom: '16px' } },
          React.createElement(
            'div',
            { style: { flex: 2 } },
            React.createElement(
              'label',
              { htmlFor: 'hospitalName', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Hospital Name *'
            ),
            React.createElement(
              'input',
              {
                type: 'text',
                id: 'hospitalName',
                name: 'hospitalName',
                value: formData.hospitalName,
                onChange: handleInputChange,
                required: true,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'hospitalCode', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Hospital Code'
            ),
            React.createElement(
              'input',
              {
                type: 'text',
                id: 'hospitalCode',
                name: 'hospitalCode',
                value: formData.hospitalCode,
                onChange: handleInputChange,
                placeholder: 'e.g., HMS001',
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          )
        ),

        // Hospital Logo Upload
        React.createElement(
          'div',
          { style: { marginBottom: '16px' } },
          React.createElement(
            'label',
            { htmlFor: 'logo', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
            'Hospital Logo'
          ),
          React.createElement(
            'input',
            {
              type: 'file',
              id: 'logo',
              name: 'logo',
              accept: 'image/*',
              onChange: handleFileChange,
              style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
            }
          ),
          logoFile && React.createElement(
            'p',
            { style: { margin: '4px 0 0 0', fontSize: '12px', color: '#6B7280' } },
            `Selected: ${logoFile.name}`
          )
        ),

        // Address (Full)
        React.createElement(
          'div',
          { style: { marginBottom: '16px' } },
          React.createElement(
            'label',
            { htmlFor: 'address', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
            'Street Address'
          ),
          React.createElement(
            'input',
            {
              type: 'text',
              id: 'address',
              name: 'address',
              value: formData.address,
              onChange: handleInputChange,
              style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
            }
          )
        ),

        // City, State, Postal Code, Country
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '12px', marginBottom: '16px' } },
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'city', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'City'
            ),
            React.createElement(
              'input',
              {
                type: 'text',
                id: 'city',
                name: 'city',
                value: formData.city,
                onChange: handleInputChange,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'state', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'State/Province'
            ),
            React.createElement(
              'input',
              {
                type: 'text',
                id: 'state',
                name: 'state',
                value: formData.state,
                onChange: handleInputChange,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'postalCode', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Postal Code'
            ),
            React.createElement(
              'input',
              {
                type: 'text',
                id: 'postalCode',
                name: 'postalCode',
                value: formData.postalCode,
                onChange: handleInputChange,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'country', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Country'
            ),
            React.createElement(
              'input',
              {
                type: 'text',
                id: 'country',
                name: 'country',
                value: formData.country,
                onChange: handleInputChange,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          )
        ),

        // Phone, Email, Emergency Contact
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '12px', marginBottom: '16px' } },
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'phone', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Phone'
            ),
            React.createElement(
              'input',
              {
                type: 'tel',
                id: 'phone',
                name: 'phone',
                value: formData.phone,
                onChange: handleInputChange,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'email', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Email'
            ),
            React.createElement(
              'input',
              {
                type: 'email',
                id: 'email',
                name: 'email',
                value: formData.email,
                onChange: handleInputChange,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'emergencyContact', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Emergency Contact'
            ),
            React.createElement(
              'input',
              {
                type: 'tel',
                id: 'emergencyContact',
                name: 'emergencyContact',
                value: formData.emergencyContact,
                onChange: handleInputChange,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          )
        ),

        // Hospital License Number
        React.createElement(
          'div',
          { style: { marginBottom: '16px' } },
          React.createElement(
            'label',
            { htmlFor: 'hospitalLicenseNumber', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
            'Hospital License Number'
          ),
          React.createElement(
            'input',
            {
              type: 'text',
              id: 'hospitalLicenseNumber',
              name: 'hospitalLicenseNumber',
              value: formData.hospitalLicenseNumber,
              onChange: handleInputChange,
              placeholder: 'e.g., HL-2024-001',
              style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
            }
          )
        ),

        // Timezone & Language
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '12px', marginBottom: '16px' } },
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'timezone', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Timezone'
            ),
            React.createElement(
              'select',
              {
                id: 'timezone',
                name: 'timezone',
                value: formData.timezone,
                onChange: handleInputChange,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              },
              TIMEZONES.map(tz => 
                React.createElement('option', { key: tz.value, value: tz.value }, tz.label)
              )
            )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'defaultLanguage', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Default Language'
            ),
            React.createElement(
              'select',
              {
                id: 'defaultLanguage',
                name: 'defaultLanguage',
                value: formData.defaultLanguage,
                onChange: handleInputChange,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              },
              React.createElement('option', { value: 'en' }, 'English'),
              React.createElement('option', { value: 'es' }, 'Spanish'),
              React.createElement('option', { value: 'fr' }, 'French'),
              React.createElement('option', { value: 'de' }, 'German'),
              React.createElement('option', { value: 'hi' }, 'Hindi'),
              React.createElement('option', { value: 'zh' }, 'Chinese')
            )
          )
        ),

        // Currency & Tax Rate
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '12px', marginBottom: '16px' } },
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'currency', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Currency'
            ),
            React.createElement(
              'select',
              {
                id: 'currency',
                name: 'currency',
                value: formData.currency,
                onChange: handleInputChange,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              },
              CURRENCIES.map(currency => 
                React.createElement('option', { key: currency.code, value: currency.code },
                  `${currency.code} - ${currency.name} (${currency.symbol})`
                )
              )
            )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'taxRate', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Tax Rate (%)'
            ),
            React.createElement(
              'input',
              {
                type: 'number',
                id: 'taxRate',
                name: 'taxRate',
                value: formData.taxRate,
                onChange: handleInputChange,
                min: 0,
                max: 100,
                step: 0.01,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'medicineMarkupPercentage', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Medicine Price Markup (%)'
            ),
            React.createElement(
              'input',
              {
                type: 'number',
                id: 'medicineMarkupPercentage',
                name: 'medicineMarkupPercentage',
                value: formData.medicineMarkupPercentage,
                onChange: handleInputChange,
                min: 0,
                max: 1000,
                step: 0.1,
                placeholder: 'e.g., 20 for 20% markup',
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          )
        ),

        // Appointment Settings
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '12px', marginBottom: '16px' } },
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'appointmentSlotDuration', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Appointment Slot Duration (minutes)'
            ),
            React.createElement(
              'input',
              {
                type: 'number',
                id: 'appointmentSlotDuration',
                name: 'appointmentSlotDuration',
                value: formData.appointmentSlotDuration,
                onChange: handleInputChange,
                min: 10,
                max: 120,
                step: 5,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'label',
              { htmlFor: 'defaultDoctorConsultationDuration', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
              'Default Doctor Consultation Duration (minutes)'
            ),
            React.createElement(
              'input',
              {
                type: 'number',
                id: 'defaultDoctorConsultationDuration',
                name: 'defaultDoctorConsultationDuration',
                value: formData.defaultDoctorConsultationDuration,
                onChange: handleInputChange,
                min: 10,
                max: 120,
                step: 5,
                style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
              }
            )
          )
        ),

        // Payment Terms
        React.createElement(
          'div',
          { style: { marginBottom: '16px' } },
          React.createElement(
            'label',
            { htmlFor: 'defaultPaymentTerms', style: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
            'Default Payment Terms'
          ),
          React.createElement(
            'select',
            {
              id: 'defaultPaymentTerms',
              name: 'defaultPaymentTerms',
              value: formData.defaultPaymentTerms,
              onChange: handleInputChange,
              style: { width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px' }
            },
            React.createElement('option', { value: 'net15' }, 'Net 15 days'),
            React.createElement('option', { value: 'net30' }, 'Net 30 days'),
            React.createElement('option', { value: 'net45' }, 'Net 45 days'),
            React.createElement('option', { value: 'net60' }, 'Net 60 days'),
            React.createElement('option', { value: 'due_on_receipt' }, 'Due on Receipt'),
            React.createElement('option', { value: 'insurance' }, 'Insurance Processing')
          )
        ),

        // Operating Hours
        React.createElement(
          'div',
          { style: { marginBottom: '16px' } },
          React.createElement(
            'label',
            { style: { display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
            'Operating Hours'
          ),
          React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            Object.entries(formData.operatingHours).map(([day, hours]) => 
              React.createElement(
                'div',
                { key: day, style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                React.createElement(
                  'label',
                  { style: { display: 'flex', alignItems: 'center', cursor: 'pointer', minWidth: '100px' } },
                  React.createElement(
                    'input',
                    {
                      type: 'checkbox',
                      checked: hours.enabled,
                      onChange: (e) => handleOperatingHoursChange(day, 'enabled', e.target.checked),
                      style: { marginRight: '8px' }
                    }
                  ),
                  React.createElement('span', { style: { fontSize: '14px', color: '#374151', textTransform: 'capitalize' } }, day)
                ),
                React.createElement(
                  'input',
                  {
                    type: 'time',
                    value: hours.start,
                    onChange: (e) => handleOperatingHoursChange(day, 'start', e.target.value),
                    disabled: !hours.enabled,
                    style: { padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px', opacity: hours.enabled ? 1 : 0.5 }
                  }
                ),
                React.createElement('span', { style: { fontSize: '12px', color: '#6B7280' } }, 'to'),
                React.createElement(
                  'input',
                  {
                    type: 'time',
                    value: hours.end,
                    onChange: (e) => handleOperatingHoursChange(day, 'end', e.target.value),
                    disabled: !hours.enabled,
                    style: { padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '12px', opacity: hours.enabled ? 1 : 0.5 }
                  }
                )
              )
            )
          )
        ),

        // Module checkboxes
        React.createElement(
          'div',
          { style: { marginBottom: '24px' } },
          React.createElement(
            'label',
            { style: { display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '500', color: '#374151' } },
            'Enable Modules'
          ),
          React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            React.createElement(
              'label',
              { style: { display: 'flex', alignItems: 'center', cursor: 'pointer' } },
              React.createElement(
                'input',
                {
                  type: 'checkbox',
                  name: 'labTestsEnabled',
                  checked: formData.labTestsEnabled,
                  onChange: handleInputChange,
                  style: { marginRight: '8px' }
                }
              ),
              React.createElement('span', { style: { fontSize: '14px', color: '#374151' } }, 'Lab Tests')
            ),
            React.createElement(
              'label',
              { style: { display: 'flex', alignItems: 'center', cursor: 'pointer' } },
              React.createElement(
                'input',
                {
                  type: 'checkbox',
                  name: 'ipdEnabled',
                  checked: formData.ipdEnabled,
                  onChange: handleInputChange,
                  style: { marginRight: '8px' }
                }
              ),
              React.createElement('span', { style: { fontSize: '14px', color: '#374151' } }, 'IPD (Inpatient Department)')
            ),
            React.createElement(
              'label',
              { style: { display: 'flex', alignItems: 'center', cursor: 'pointer' } },
              React.createElement(
                'input',
                {
                  type: 'checkbox',
                  name: 'billingEnabled',
                  checked: formData.billingEnabled,
                  onChange: handleInputChange,
                  style: { marginRight: '8px' }
                }
              ),
              React.createElement('span', { style: { fontSize: '14px', color: '#374151' } }, 'Billing')
            )
          )
        ),

        // Submit button
        React.createElement(
          'button',
          {
            type: 'submit',
            disabled: loading,
            style: {
              width: '100%',
              padding: '10px',
              backgroundColor: loading ? '#9CA3AF' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }
          },
          loading ? 'Saving...' : 'Complete Setup'
        )
      )
    )
  );
};

export default HospitalSetupWizard;

