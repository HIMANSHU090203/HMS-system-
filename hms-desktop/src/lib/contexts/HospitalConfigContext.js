import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import configService from '../api/services/configService';
import { formatCurrency as formatCurrencyUtil, formatDate as formatDateUtil, formatDateTime as formatDateTimeUtil, formatDateOnly as formatDateOnlyUtil, getCurrencySymbol } from '../utils/currencyAndTimezone';

const HospitalConfigContext = createContext(null);

// Default config values
const defaultConfig = {
  currency: 'USD',
  timezone: 'UTC',
  hospitalName: 'Hospital Management System',
  hospitalCode: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
  email: '',
  emergencyContact: '',
  logoUrl: '',
  modulesEnabled: {
    billingSettings: {
      invoicePrefix: 'INV-',
      nextInvoiceNumber: 1,
      footerText: '',
    }
  }
};

export const HospitalConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = useCallback(async () => {
    try {
      setError(null);
      const data = await configService.getHospitalConfig();
      setConfig(data.config || defaultConfig);
    } catch (error) {
      console.error('Failed to load hospital config:', error);
      setError('Failed to load hospital configuration. Using default values.');
      // Set defaults if config fails to load
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
    
    // Set up auto-refresh: listen for config changes
    // Refresh every 30 seconds to pick up changes
    const refreshInterval = setInterval(() => {
      loadConfig();
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [loadConfig]);

  const refreshConfig = useCallback(async () => {
    setLoading(true);
    await loadConfig();
  }, [loadConfig]);

  // Extract commonly used values with defaults
  const currency = config?.currency || defaultConfig.currency;
  const timezone = config?.timezone || defaultConfig.timezone;
  const hospitalName = config?.hospitalName || defaultConfig.hospitalName;
  const logoUrl = config?.logoUrl || defaultConfig.logoUrl;
  const billingSettings = config?.modulesEnabled?.billingSettings || defaultConfig.modulesEnabled.billingSettings;
  const invoicePrefix = billingSettings?.invoicePrefix || defaultConfig.modulesEnabled.billingSettings.invoicePrefix;
  const footerText = billingSettings?.footerText || defaultConfig.modulesEnabled.billingSettings.footerText;

  const value = {
    config,
    loading,
    error,
    // Common fields
    currency,
    timezone,
    hospitalName,
    logoUrl,
    invoicePrefix,
    footerText,
    // Address fields
    address: config?.address || defaultConfig.address,
    city: config?.city || defaultConfig.city,
    state: config?.state || defaultConfig.state,
    postalCode: config?.postalCode || defaultConfig.postalCode,
    country: config?.country || defaultConfig.country,
    // Contact fields
    phone: config?.phone || defaultConfig.phone,
    email: config?.email || defaultConfig.email,
    emergencyContact: config?.emergencyContact || defaultConfig.emergencyContact,
    // Billing settings
    billingSettings,
    // Utility functions
    refreshConfig,
    formatCurrency: (amount) => formatCurrencyUtil(amount, currency),
    formatDate: (date, options) => formatDateUtil(date, timezone, options),
    formatDateTime: (date) => formatDateTimeUtil(date, timezone),
    formatDateOnly: (date) => formatDateOnlyUtil(date, timezone),
    getCurrencySymbol: () => getCurrencySymbol(currency),
  };

  return React.createElement(
    HospitalConfigContext.Provider,
    { value: value },
    children
  );
};

export const useHospitalConfig = () => {
  const context = useContext(HospitalConfigContext);
  if (!context) {
    // Return defaults if context is not available (fallback)
    return {
      config: defaultConfig,
      loading: false,
      error: null,
      currency: defaultConfig.currency,
      timezone: defaultConfig.timezone,
      hospitalName: defaultConfig.hospitalName,
      logoUrl: defaultConfig.logoUrl,
      invoicePrefix: defaultConfig.modulesEnabled.billingSettings.invoicePrefix,
      footerText: defaultConfig.modulesEnabled.billingSettings.footerText,
      address: defaultConfig.address,
      city: defaultConfig.city,
      state: defaultConfig.state,
      postalCode: defaultConfig.postalCode,
      country: defaultConfig.country,
      phone: defaultConfig.phone,
      email: defaultConfig.email,
      emergencyContact: defaultConfig.emergencyContact,
      billingSettings: defaultConfig.modulesEnabled.billingSettings,
      refreshConfig: async () => {},
      formatCurrency: (amount) => formatCurrencyUtil(amount, defaultConfig.currency),
      formatDate: (date, options) => formatDateUtil(date, defaultConfig.timezone, options),
      formatDateTime: (date) => formatDateTimeUtil(date, defaultConfig.timezone),
      formatDateOnly: (date) => formatDateOnlyUtil(date, defaultConfig.timezone),
      getCurrencySymbol: () => getCurrencySymbol(defaultConfig.currency),
    };
  }
  return context;
};

