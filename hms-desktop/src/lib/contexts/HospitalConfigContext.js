import React, { createContext, useContext, useState, useEffect } from 'react';
import configService from '../api/services/configService';
import { formatCurrency as formatCurrencyUtil, formatDate as formatDateUtil, formatDateTime as formatDateTimeUtil, formatDateOnly as formatDateOnlyUtil } from '../utils/currencyAndTimezone';

const HospitalConfigContext = createContext(null);

export const HospitalConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await configService.getHospitalConfig();
      setConfig(data.config);
    } catch (error) {
      console.error('Failed to load hospital config:', error);
      // Set defaults if config fails to load
      setConfig({
        currency: 'USD',
        timezone: 'UTC',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshConfig = async () => {
    await loadConfig();
  };

  const currency = config?.currency || 'USD';
  const timezone = config?.timezone || 'UTC';

  const value = {
    config,
    loading,
    currency,
    timezone,
    refreshConfig,
    formatCurrency: (amount) => formatCurrencyUtil(amount, currency),
    formatDate: (date, options) => formatDateUtil(date, timezone, options),
    formatDateTime: (date) => formatDateTimeUtil(date, timezone),
    formatDateOnly: (date) => formatDateOnlyUtil(date, timezone),
  };

  return (
    <HospitalConfigContext.Provider value={value}>
      {children}
    </HospitalConfigContext.Provider>
  );
};

export const useHospitalConfig = () => {
  const context = useContext(HospitalConfigContext);
  if (!context) {
    // Return defaults if context is not available (fallback)
    return {
      config: null,
      loading: false,
      currency: 'USD',
      timezone: 'UTC',
      refreshConfig: async () => {},
      formatCurrency: (amount) => formatCurrencyUtil(amount, 'USD'),
      formatDate: (date, options) => formatDateUtil(date, 'UTC', options),
      formatDateTime: (date) => formatDateTimeUtil(date, 'UTC'),
      formatDateOnly: (date) => formatDateOnlyUtil(date, 'UTC'),
    };
  }
  return context;
};

