import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import configService from '../api/services/configService';
import { formatCurrencySync, formatDate as formatDateUtil, formatDateTime as formatDateTimeUtil, formatDateOnly as formatDateOnlyUtil, getCurrencySymbol } from '../utils/currencyAndTimezone';

const HospitalConfigContext = createContext(null);

// Default config values - Application uses INR only
const defaultConfig = {
  currency: 'INR',
  displayCurrency: 'INR',
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
      setLoading(true);
      const data = await configService.getHospitalConfig();
      const loadedConfig = data.config || defaultConfig;
      setConfig(loadedConfig);
    } catch (error) {
      console.error('[HospitalConfig] Failed to load hospital config:', error);
      setError('Failed to load hospital configuration. Using default values.');
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const refreshConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await configService.getHospitalConfig();
      const loadedConfig = data.config || defaultConfig;
      setConfig(loadedConfig);
      setLoading(false);
    } catch (error) {
      console.error('[HospitalConfig] refreshConfig failed:', error);
      setError('Failed to refresh configuration');
      setLoading(false);
    }
  }, []);

  // Extract commonly used values with defaults
  // Application uses INR only - no currency conversion needed
  const timezone = config?.timezone || defaultConfig.timezone;
  const hospitalName = config?.hospitalName || defaultConfig.hospitalName;
  const logoUrl = config?.logoUrl || defaultConfig.logoUrl;
  const billingSettings = config?.modulesEnabled?.billingSettings || defaultConfig.modulesEnabled.billingSettings;
  const invoicePrefix = billingSettings?.invoicePrefix || defaultConfig.modulesEnabled.billingSettings.invoicePrefix;
  const footerText = billingSettings?.footerText || defaultConfig.modulesEnabled.billingSettings.footerText;
  
  // Application uses INR only - always set to INR
  const safeBaseCurrency = 'INR';
  const safeDisplayCurrency = 'INR';
  
  const value = {
    config,
    loading,
    error,
    // Common fields
    currency: 'INR', // Always INR
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
    // Currency info - Always INR, no conversion needed
    baseCurrency: 'INR',
    displayCurrency: 'INR',
    // Utility functions
    refreshConfig,
    formatCurrency: (amount: number) => {
      // Always format with INR - no conversion needed
      return formatCurrencySync(amount, 'INR');
    },
    formatDate: (date, options) => formatDateUtil(date, timezone, options),
    formatDateTime: (date) => formatDateTimeUtil(date, timezone),
    formatDateOnly: (date) => formatDateOnlyUtil(date, timezone),
    getCurrencySymbol: () => getCurrencySymbol('INR'),
  };

  // Log whenever the context value changes
  React.useEffect(() => {
    console.log('[HospitalConfig] 📦 Context value updated (Currency: INR only)');
  }, [value.config]);

  return React.createElement(
    HospitalConfigContext.Provider,
    { value: value },
    children
  );
};

export const useHospitalConfig = () => {
  const context = useContext(HospitalConfigContext);
  if (!context) {
    // Return defaults if context is not available (fallback) - Always INR
    return {
      config: defaultConfig,
      loading: false,
      error: null,
      currency: 'INR',
      baseCurrency: 'INR',
      displayCurrency: 'INR',
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
      formatCurrency: (amount) => formatCurrencySync(amount, 'INR'),
      formatDate: (date, options) => formatDateUtil(date, defaultConfig.timezone, options),
      formatDateTime: (date) => formatDateTimeUtil(date, defaultConfig.timezone),
      formatDateOnly: (date) => formatDateOnlyUtil(date, defaultConfig.timezone),
      getCurrencySymbol: () => getCurrencySymbol('INR'),
    };
  }
  
  // Application uses INR only - always return INR
  return {
    ...context,
    currency: 'INR',
    baseCurrency: 'INR',
    displayCurrency: 'INR',
  };
};

