import React, { useState, useEffect } from 'react';
import configService from '../../lib/api/services/configService';
import { CURRENCIES, TIMEZONES } from '../../lib/utils/currencyAndTimezone';
import { useHospitalConfig } from '../../lib/contexts/HospitalConfigContext';
import generateInvoiceFooter from '../../lib/utils/invoiceFooterGenerator';

const ConfigurationManagement = ({ user }) => {
  const { refreshConfig } = useHospitalConfig();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const getDefaultFormData = () => {
    return {
      hospitalName: 'HMS Hospital',
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
      taxId: '',
      logoUrl: '',
      timezone: 'UTC',
      defaultLanguage: 'en',
      currency: 'USD',
      taxRate: 0,
      appointmentSlotDuration: 30,
      defaultDoctorConsultationDuration: 30,
      defaultPaymentMode: '',
      enableInsurance: false,
      medicineMarkupPercentage: 0,
      labTestsEnabled: true,
      ipdEnabled: true,
      billingEnabled: true,
      modulesEnabled: {
        billingSettings: {
          invoicePrefix: 'INV-',
          nextInvoiceNumber: 1,
          footerText: '',
          roundingRule: 'none',
          taxInclusive: false,
          paymentMethods: { cash: true, card: true, upi: true, bank: false },
          allowPartialPayments: true,
          invoiceFooter: {
            gstin: '',
            pan: '',
            tan: '',
            hospitalRegistrationNumber: '',
            registrationIssuedBy: '',
            bankName: '',
            bankBranch: '',
            accountNumber: '',
            ifscCode: '',
            upiId: '',
            paymentTerms: 'Net 15 days',
            jurisdictionCity: '',
            overdueInterestRate: '2% monthly',
            billingDepartmentContact: '',
            certifications: '',
            website: ''
          }
        }
      },
      workingHours: {
        workingDays: ['Mon','Tue','Wed','Thu','Fri'],
        startTime: '09:00',
        endTime: '17:00'
      }
    };
  };

  const [formData, setFormData] = useState(getDefaultFormData());

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
        allowPartialPayments: true,
        invoiceFooter: {
          gstin: '',
          pan: '',
          tan: '',
          hospitalRegistrationNumber: '',
          registrationIssuedBy: '',
          bankName: '',
          bankBranch: '',
          accountNumber: '',
          ifscCode: '',
          upiId: '',
          paymentTerms: 'Net 15 days',
          jurisdictionCity: '',
          overdueInterestRate: '2% monthly',
          billingDepartmentContact: '',
          certifications: '',
          website: ''
        }
      };
      const workingHours = cfg.workingHours || {
        workingDays: ['Mon','Tue','Wed','Thu','Fri'],
        startTime: '09:00',
        endTime: '17:00'
      };

      // Ensure workingDays is always an array when loading from database
      if (workingHours.workingDays && !Array.isArray(workingHours.workingDays)) {
        // If it's a string, convert to array
        if (typeof workingHours.workingDays === 'string') {
          workingHours.workingDays = workingHours.workingDays.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          workingHours.workingDays = ['Mon','Tue','Wed','Thu','Fri'];
        }
      }

      // Merge with defaults to ensure all fields are present
      const defaultData = getDefaultFormData();
      const mergedConfig = { 
        ...defaultData, 
        ...cfg, 
        modulesEnabled: { 
          ...defaultData.modulesEnabled, 
          ...modulesEnabled, 
          billingSettings: {
            ...defaultData.modulesEnabled.billingSettings,
            ...billingSettings
          }
        }, 
        workingHours: {
          ...defaultData.workingHours,
          ...workingHours,
          // Ensure workingDays is always an array
          workingDays: Array.isArray(workingHours.workingDays) 
            ? workingHours.workingDays 
            : defaultData.workingHours.workingDays
        }
      };
      
      setConfig(cfg);
      setFormData(mergedConfig);
      
      // Set logo preview if logoUrl exists
      if (mergedConfig.logoUrl) {
        // If it's already a full URL or data URL, use it directly
        if (mergedConfig.logoUrl.startsWith('http') || mergedConfig.logoUrl.startsWith('data:')) {
          setLogoPreview(mergedConfig.logoUrl);
        } else {
          // Otherwise, construct the full URL
          const baseUrl = window.location.origin;
          setLogoPreview(`${baseUrl}${mergedConfig.logoUrl.startsWith('/') ? '' : '/'}${mergedConfig.logoUrl}`);
        }
      }
    } catch (err) {
      console.error('Load config error:', err);
      setError('Failed to load configuration. You can still edit and save.');
      // Initialize with defaults even on error
      setFormData(getDefaultFormData());
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please select an image file (JPEG, PNG, GIF, WebP) or PDF.');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size too large. Please select a file smaller than 5MB.');
        return;
      }
      
      setLogoFile(file);
      setError('');
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setLogoPreview(null);
      }
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploadingLogo(true);
    setError('');
    setSuccess('');

    try {
      const result = await configService.uploadHospitalLogo(logoFile);
      setFormData(prev => ({ ...prev, logoUrl: result.logoUrl }));
      setConfig(result.config);
      
      // Refresh the global config context so all modules get updated logo
      await refreshConfig();
      
      // Update preview with the new logo URL
      const baseUrl = window.location.origin;
      const fullLogoUrl = result.logoUrl.startsWith('/') 
        ? `${baseUrl}${result.logoUrl}` 
        : `${baseUrl}/${result.logoUrl}`;
      setLogoPreview(fullLogoUrl);
      
      setLogoFile(null);
      setSuccess('Logo uploaded successfully! All modules will now display the updated logo.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Upload logo error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload logo';
      setError(`Failed to upload logo: ${errorMessage}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Ensure required fields have values and convert empty strings to defaults for numeric fields
      // Preserve all nested structures properly
      const dataToSubmit = {
        ...formData,
        hospitalName: formData.hospitalName || 'HMS Hospital',
        currency: formData.currency || 'USD',
        timezone: formData.timezone || 'UTC',
        taxRate: formData.taxRate === '' || formData.taxRate === null || formData.taxRate === undefined ? 0 : formData.taxRate,
        appointmentSlotDuration: formData.appointmentSlotDuration === '' || formData.appointmentSlotDuration === null || formData.appointmentSlotDuration === undefined ? 30 : formData.appointmentSlotDuration,
        // Ensure workingHours is included with proper array handling
        workingHours: {
          workingDays: Array.isArray(formData.workingHours?.workingDays) 
            ? formData.workingHours.workingDays 
            : (formData.workingHours?.workingDays 
                ? (typeof formData.workingHours.workingDays === 'string' 
                    ? formData.workingHours.workingDays.split(',').map(s => s.trim()).filter(Boolean)
                    : ['Mon','Tue','Wed','Thu','Fri'])
                : ['Mon','Tue','Wed','Thu','Fri']),
          startTime: formData.workingHours?.startTime || '09:00',
          endTime: formData.workingHours?.endTime || '17:00'
        },
        // Ensure modulesEnabled and billingSettings are fully included
        modulesEnabled: {
          ...(formData.modulesEnabled || {}),
          billingSettings: {
            invoicePrefix: formData.modulesEnabled?.billingSettings?.invoicePrefix || 'INV-',
            nextInvoiceNumber: formData.modulesEnabled?.billingSettings?.nextInvoiceNumber === '' || formData.modulesEnabled?.billingSettings?.nextInvoiceNumber === null || formData.modulesEnabled?.billingSettings?.nextInvoiceNumber === undefined 
              ? 1 
              : formData.modulesEnabled?.billingSettings?.nextInvoiceNumber,
            footerText: formData.modulesEnabled?.billingSettings?.footerText || '',
            roundingRule: formData.modulesEnabled?.billingSettings?.roundingRule || 'none',
            taxInclusive: formData.modulesEnabled?.billingSettings?.taxInclusive || false,
            paymentMethods: formData.modulesEnabled?.billingSettings?.paymentMethods || { cash: true, card: true, upi: true, bank: false },
            allowPartialPayments: formData.modulesEnabled?.billingSettings?.allowPartialPayments !== undefined ? formData.modulesEnabled.billingSettings.allowPartialPayments : true,
            invoiceFooter: formData.modulesEnabled?.billingSettings?.invoiceFooter || {
              gstin: '',
              pan: '',
              tan: '',
              hospitalRegistrationNumber: '',
              registrationIssuedBy: '',
              bankName: '',
              bankBranch: '',
              accountNumber: '',
              ifscCode: '',
              upiId: '',
              paymentTerms: 'Net 15 days',
              jurisdictionCity: '',
              overdueInterestRate: '2% monthly',
              billingDepartmentContact: '',
              certifications: '',
              website: ''
            }
          }
        },
        defaultPaymentMode: formData.defaultPaymentMode || ''
      };

      console.log('Submitting config data:', JSON.stringify(dataToSubmit, null, 2));
      
      const updated = await configService.updateHospitalConfig(dataToSubmit);
      console.log('Config updated successfully:', updated);
      
      // Reload config to get the latest from server
      await loadConfig();
      
      // Refresh the global config context so all modules get updated values
      await refreshConfig();
      
      setSuccess('Configuration updated successfully! All modules will now use the updated settings.');
      setTimeout(() => setSuccess(''), 5000);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Update config error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update configuration';
      setError(`Failed to update configuration: ${errorMessage}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      let newValue;
      if (type === 'checkbox') {
        newValue = checked;
      } else if (type === 'number') {
        // Allow empty string for numeric fields so users can clear the field
        if (value === '' || value === '-') {
          newValue = '';
        } else {
          const numValue = parseFloat(value);
          newValue = isNaN(numValue) ? '' : numValue;
        }
      } else {
        newValue = value;
      }
      return {
        ...prev,
        [name]: newValue
      };
    });
  };

  const updateNested = (path, value) => {
    setFormData(prev => {
      // Deep clone to ensure React detects the change
      const clone = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let node = clone;
      
      // Navigate to the parent of the target property
      for (let i = 0; i < keys.length - 1; i++) {
        // Ensure each level exists and is an object
        if (!node[keys[i]] || typeof node[keys[i]] !== 'object' || Array.isArray(node[keys[i]])) {
          node[keys[i]] = {};
        } else {
          // Clone the nested object to avoid mutation
          node[keys[i]] = { ...node[keys[i]] };
        }
        node = node[keys[i]];
      }
      
      // Set the final value
      node[keys[keys.length - 1]] = value;
      
      return clone;
    });
  };

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
      { style: { backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', padding: '24px', borderRadius: '8px' } },

      (error || success) && React.createElement(
        'div',
        {
          style: {
            backgroundColor: error ? '#FEF2F2' : '#D1FAE5',
            border: `1px solid ${error ? '#FECACA' : '#A7F3D0'}`,
            color: error ? '#DC2626' : '#065F46',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '14px',
            borderRadius: '6px',
            fontWeight: '500'
          }
        },
        error || success
      ),

      loading && !formData.hospitalName && React.createElement(
        'div',
        { style: { textAlign: 'center', padding: '40px', color: '#6B7280' } },
        'Loading configuration...'
      ),

      React.createElement('form', { onSubmit: handleSubmit, style: { opacity: loading && !formData.hospitalName ? 0.5 : 1 } },

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
          // logo upload
          React.createElement('div', { style: { gridColumn: 'span 2' } },
            React.createElement('label', { style: labelStyle }, 'Hospital Logo'),
            React.createElement('div', { style: { display: 'flex', gap: '16px', alignItems: 'flex-start' } },
              // Logo preview
              (logoPreview || formData.logoUrl) && React.createElement('div', { style: { flexShrink: 0 } },
                React.createElement('img', {
                  src: logoPreview || (() => {
                    const logoUrl = formData.logoUrl;
                    if (!logoUrl) return '';
                    if (logoUrl.startsWith('http') || logoUrl.startsWith('data:')) return logoUrl;
                    const baseUrl = window.location.origin;
                    return logoUrl.startsWith('/') ? `${baseUrl}${logoUrl}` : `${baseUrl}/${logoUrl}`;
                  })(),
                  alt: 'Hospital Logo Preview',
                  style: {
                    width: '120px',
                    height: '120px',
                    objectFit: 'contain',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    padding: '8px',
                    backgroundColor: '#F9FAFB'
                  },
                  onError: (e) => {
                    e.target.style.display = 'none';
                  }
                })
              ),
              // File input and upload button
              React.createElement('div', { style: { flex: 1 } },
                React.createElement('input', {
                  type: 'file',
                  accept: 'image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf',
                  onChange: handleLogoFileChange,
                  style: {
                    ...inputStyle,
                    padding: '6px',
                    marginBottom: '8px'
                  },
                  disabled: uploadingLogo
                }),
                React.createElement('div', { style: { fontSize: '12px', color: '#6B7280', marginBottom: '8px' } },
                  'Accepted formats: JPEG, PNG, GIF, WebP, PDF (Max 5MB)'
                ),
                logoFile && React.createElement('button', {
                  type: 'button',
                  onClick: handleLogoUpload,
                  disabled: uploadingLogo,
                  style: {
                    ...saveBtnStyle,
                    backgroundColor: '#10B981',
                    padding: '6px 12px',
                    fontSize: '13px',
                    cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                    opacity: uploadingLogo ? 0.5 : 1
                  }
                }, uploadingLogo ? 'Uploading...' : 'Upload Logo')
              )
            )
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
            React.createElement('label', { style: labelStyle }, 'Currency *'),
            React.createElement('select', {
              name: 'currency',
              value: formData.currency || 'USD',
              onChange: handleInputChange,
              style: inputStyle,
              required: true
            },
              CURRENCIES.map(currency => 
                React.createElement('option', { key: currency.code, value: currency.code },
                  `${currency.code} - ${currency.name} (${currency.symbol})`
                )
              )
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Timezone *'),
            React.createElement('select', {
              name: 'timezone',
              value: formData.timezone || 'UTC',
              onChange: handleInputChange,
              style: inputStyle,
              required: true
            },
              TIMEZONES.map(tz => 
                React.createElement('option', { key: tz.value, value: tz.value }, tz.label)
              )
            )
          )
        ),

        // Taxes
        React.createElement('h3', { style: sectionTitle }, 'Taxes'),
        React.createElement('div', { style: gridStyle },
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Default Tax Rate (%)'),
            React.createElement('input', { type: 'number', step: '0.01', name: 'taxRate', value: formData.taxRate ?? '', onChange: handleInputChange, style: inputStyle })
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
            React.createElement('input', { type: 'number', min: 1, value: formData.modulesEnabled?.billingSettings?.nextInvoiceNumber ?? '', onChange: (e) => {
              const val = e.target.value;
              if (val === '' || val === '-') {
                updateNested('modulesEnabled.billingSettings.nextInvoiceNumber', '');
              } else {
                const numVal = parseInt(val, 10);
                if (!isNaN(numVal) && numVal >= 1) {
                  updateNested('modulesEnabled.billingSettings.nextInvoiceNumber', numVal);
                }
              }
            }, style: inputStyle, placeholder: '1' })
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

        // Invoice Footer Configuration
        React.createElement('div', { style: { marginTop: '24px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' } },
          React.createElement('h3', { style: { ...sectionTitle, marginTop: 0 } }, 'Invoice Footer Configuration'),
          React.createElement('p', { style: { marginBottom: '20px', color: '#6b7280', fontSize: '14px' } },
            'Configure the footer text that will appear on all bills, invoices, and documents.'
          ),
          
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' } },
            // Tax Information Column
            React.createElement('div', null,
              React.createElement('h4', { style: { marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' } }, 'Tax Information'),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'GSTIN'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.gstin || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.gstin', e.target.value),
                  style: inputStyle,
                  placeholder: 'GST Number'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'PAN'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.pan || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.pan', e.target.value),
                  style: inputStyle,
                  placeholder: 'PAN Number'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'TAN'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.tan || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.tan', e.target.value),
                  style: inputStyle,
                  placeholder: 'TAN Number'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'Hospital Registration Number'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.hospitalRegistrationNumber || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.hospitalRegistrationNumber', e.target.value),
                  style: inputStyle,
                  placeholder: 'Registration Number'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'Registration Issued By'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.registrationIssuedBy || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.registrationIssuedBy', e.target.value),
                  style: inputStyle,
                  placeholder: 'Issuing Authority Name'
                })
              )
            ),
            
            // Payment Information Column
            React.createElement('div', null,
              React.createElement('h4', { style: { marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' } }, 'Payment Information'),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'Bank Name'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.bankName || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.bankName', e.target.value),
                  style: inputStyle,
                  placeholder: 'Bank Name'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'Branch Name'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.bankBranch || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.bankBranch', e.target.value),
                  style: inputStyle,
                  placeholder: 'Branch Name'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'Account Number'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.accountNumber || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.accountNumber', e.target.value),
                  style: inputStyle,
                  placeholder: 'Account Number'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'IFSC Code'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.ifscCode || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.ifscCode', e.target.value),
                  style: inputStyle,
                  placeholder: 'IFSC Code'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'UPI ID'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.upiId || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.upiId', e.target.value),
                  style: inputStyle,
                  placeholder: 'UPI ID'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'Payment Terms'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.paymentTerms || 'Net 15 days',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.paymentTerms', e.target.value),
                  style: inputStyle,
                  placeholder: 'e.g., Net 15 days'
                })
              )
            )
          ),
          
          // Legal Information & Other
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' } },
            React.createElement('div', null,
              React.createElement('h4', { style: { marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' } }, 'Legal Information'),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'Jurisdiction City'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.jurisdictionCity || formData.city || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.jurisdictionCity', e.target.value),
                  style: inputStyle,
                  placeholder: 'City for jurisdiction'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'Overdue Interest Rate'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.overdueInterestRate || '2% monthly',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.overdueInterestRate', e.target.value),
                  style: inputStyle,
                  placeholder: 'e.g., 2% monthly'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'Billing Department Contact'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.billingDepartmentContact || formData.phone || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.billingDepartmentContact', e.target.value),
                  style: inputStyle,
                  placeholder: 'Billing contact number/email'
                })
              )
            ),
            
            React.createElement('div', null,
              React.createElement('h4', { style: { marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' } }, 'Additional Information'),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'Website URL'),
                React.createElement('input', {
                  type: 'url',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.website || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.website', e.target.value),
                  style: inputStyle,
                  placeholder: 'https://www.hospital.com'
                })
              ),
              React.createElement('div', { style: { marginBottom: '12px' } },
                React.createElement('label', { style: labelStyle }, 'Certifications'),
                React.createElement('input', {
                  type: 'text',
                  value: formData.modulesEnabled?.billingSettings?.invoiceFooter?.certifications || '',
                  onChange: (e) => updateNested('modulesEnabled.billingSettings.invoiceFooter.certifications', e.target.value),
                  style: inputStyle,
                  placeholder: 'e.g., ISO 9001:2015, NABH Accredited, NABL Certified'
                })
              )
            )
          ),
          
          // Preview Section
          React.createElement('div', { style: { marginTop: '24px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' } },
            React.createElement('h4', { style: { marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#374151' } }, 'Footer Preview'),
            React.createElement('div', { 
              style: { 
                padding: '16px', 
                backgroundColor: 'white', 
                borderRadius: '4px', 
                border: '1px solid #d1d5db',
                fontFamily: 'monospace',
                fontSize: '10px',
                whiteSpace: 'pre-wrap',
                maxHeight: '400px',
                overflow: 'auto',
                lineHeight: '1.4'
              } 
            },
              generateInvoiceFooter({ ...formData, hospitalName: formData.hospitalName || '[HOSPITAL NAME]' })
            )
          )
        ),

        // Appointments
        React.createElement('h3', { style: sectionTitle }, 'Appointments'),
        React.createElement('div', { style: gridStyle },
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Slot Duration (minutes)'),
            React.createElement('input', { type: 'number', name: 'appointmentSlotDuration', value: formData.appointmentSlotDuration ?? '', onChange: handleInputChange, style: inputStyle, placeholder: '30' })
          ),
          React.createElement('div', null,
            React.createElement('label', { style: labelStyle }, 'Working Days (comma separated)'),
            React.createElement('input', { 
              type: 'text', 
              value: (() => {
                const days = formData.workingHours?.workingDays;
                if (Array.isArray(days)) {
                  return days.join(', ');
                }
                if (typeof days === 'string') {
                  return days;
                }
                return '';
              })(), 
              onChange: (e) => {
                const inputValue = e.target.value;
                console.log('Working days input changed:', inputValue);
                
                // Convert comma-separated string to array, handling empty values
                const daysArray = inputValue
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s.length > 0); // Only keep non-empty strings
                
                console.log('Working days array:', daysArray);
                
                // Ensure workingHours object exists
                setFormData(prev => {
                  const newData = {
                    ...prev,
                    workingHours: {
                      ...(prev.workingHours || {}),
                      workingDays: daysArray
                    }
                  };
                  console.log('Updated formData.workingHours:', newData.workingHours);
                  return newData;
                });
              }, 
              placeholder: 'Mon, Tue, Wed, Thu, Fri',
              style: inputStyle 
            })
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
          { 
            style: { 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end', 
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #E5E7EB',
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#FFFFFF',
              zIndex: 10
            } 
          },
          React.createElement(
            'button',
            {
              type: 'button',
              onClick: () => {
                if (window.confirm('Are you sure you want to reset all changes?')) {
                  loadConfig();
                }
              },
              disabled: loading,
              style: { 
                ...saveBtnStyle, 
                backgroundColor: '#6B7280',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }
            },
            'Reset'
          ),
          React.createElement(
            'button',
            {
              type: 'submit',
              disabled: loading,
              style: { 
                ...saveBtnStyle,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                minWidth: '150px'
              }
            },
            loading ? 'Saving...' : 'Save Configuration'
          )
        )
      )
    )
  );
};

const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '4px' };
const inputStyle = { 
  width: '100%', 
  padding: '8px 12px', 
  border: '1px solid #D1D5DB', 
  borderRadius: '4px', 
  fontSize: '14px', 
  backgroundColor: '#FFFFFF',
  boxSizing: 'border-box'
};
const textareaStyle = { 
  width: '100%', 
  padding: '8px 12px', 
  border: '1px solid #D1D5DB', 
  borderRadius: '4px', 
  fontSize: '14px', 
  backgroundColor: '#FFFFFF',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  resize: 'vertical'
};
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' };
const sectionTitle = { fontWeight: '600', margin: '16px 0 12px 0', fontSize: '16px', color: '#111827' };
const saveBtnStyle = { 
  backgroundColor: '#2563EB', 
  color: '#FFFFFF', 
  border: 'none', 
  padding: '10px 20px', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontSize: '14px', 
  fontWeight: '500',
  transition: 'background-color 0.2s'
};

export default ConfigurationManagement;

