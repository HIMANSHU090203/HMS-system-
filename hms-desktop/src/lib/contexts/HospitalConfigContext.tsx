import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import configService from '../api/services/configService';
import currencyService from '../api/services/currencyService';
import { formatCurrencySync, formatDate as formatDateUtil, formatDateTime as formatDateTimeUtil, formatDateOnly as formatDateOnlyUtil, getCurrencySymbol } from '../utils/currencyAndTimezone';

const HospitalConfigContext = createContext(null);

// Default config values
const defaultConfig = {
  currency: 'USD',
  displayCurrency: 'USD', // Add displayCurrency to defaults
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
      console.log('[HospitalConfig] Loading config from backend...');
      const data = await configService.getHospitalConfig();
      const loadedConfig = data.config || defaultConfig;
      
      // Debug: Log all currency-related fields - ALWAYS log this
      console.log('[HospitalConfig] ✅ Loaded config from backend:', {
        currency: loadedConfig.currency,
        displayCurrency: loadedConfig.displayCurrency,
        display_currency: (loadedConfig as any).display_currency,
        hasConfig: !!loadedConfig,
        configKeys: Object.keys(loadedConfig),
        allCurrencyFields: {
          currency: loadedConfig.currency,
          displayCurrency: loadedConfig.displayCurrency,
          display_currency: (loadedConfig as any).display_currency,
          rawConfig: JSON.stringify(loadedConfig).substring(0, 500) // First 500 chars for debugging
        }
      });
      setConfig(loadedConfig);
      console.log('[HospitalConfig] ✅ Config state updated with displayCurrency:', loadedConfig.displayCurrency);
      
      // Force a re-render by logging the extracted values
      const extractedDisplayCurrency = loadedConfig.displayCurrency 
        ? (typeof loadedConfig.displayCurrency === 'string' ? loadedConfig.displayCurrency.trim().toUpperCase() : null)
        : null;
      console.log('[HospitalConfig] 📊 Extracted displayCurrency will be:', extractedDisplayCurrency || 'FALLBACK TO BASE');
    } catch (error) {
      console.error('[HospitalConfig] ❌ Failed to load hospital config:', error);
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
    // Refresh every 10 seconds to pick up changes more quickly (no manual refresh needed)
    const refreshInterval = setInterval(() => {
      console.log('[HospitalConfig] 🔄 Auto-refreshing config (every 10 seconds)...');
      loadConfig();
    }, 10000); // 10 seconds - more frequent to catch changes faster

    return () => clearInterval(refreshInterval);
  }, [loadConfig]);

  const refreshConfig = useCallback(async () => {
    console.log('[HospitalConfig] 🔄 refreshConfig called - reloading config...');
    setLoading(true);
    setError(null);
    try {
      // Fetch fresh config directly from backend
      console.log('[HospitalConfig] 📥 Fetching fresh config from backend...');
      const data = await configService.getHospitalConfig();
      const loadedConfig = data.config || defaultConfig;
      
      console.log('[HospitalConfig] ✅ Loaded fresh config from backend:', {
        currency: loadedConfig.currency,
        displayCurrency: loadedConfig.displayCurrency,
        displayCurrencyType: typeof loadedConfig.displayCurrency,
        displayCurrencyValue: loadedConfig.displayCurrency,
        hasDisplayCurrency: !!loadedConfig.displayCurrency,
        configKeys: Object.keys(loadedConfig),
        rawDisplayCurrency: JSON.stringify(loadedConfig.displayCurrency)
      });
      
      // CRITICAL: Verify displayCurrency is actually in the loaded config
      if (!loadedConfig.displayCurrency && loadedConfig.currency) {
        console.warn('[HospitalConfig] ⚠️ displayCurrency is missing in loaded config, but currency exists:', loadedConfig.currency);
        console.warn('[HospitalConfig] ⚠️ This might mean displayCurrency is null in database. Check database directly.');
      }
      
      // CRITICAL: Use functional update to ensure we're working with the latest state
      // This avoids stale closure issues
      setConfig((previousConfig) => {
        console.log('[HospitalConfig] 🔄 Updating config state...');
        console.log('[HospitalConfig] Previous config displayCurrency:', previousConfig?.displayCurrency);
        console.log('[HospitalConfig] New config displayCurrency:', loadedConfig.displayCurrency);
        
        // Verify the config actually changed
        if (loadedConfig?.displayCurrency && previousConfig?.displayCurrency !== loadedConfig.displayCurrency) {
          console.log('[HospitalConfig] 🎉 DisplayCurrency changed from', previousConfig?.displayCurrency, 'to', loadedConfig.displayCurrency);
        } else if (loadedConfig?.displayCurrency === previousConfig?.displayCurrency) {
          console.log('[HospitalConfig] ℹ️ DisplayCurrency unchanged:', loadedConfig.displayCurrency);
        }
        
        return loadedConfig;
      });
      
      setLoading(false);
      console.log('[HospitalConfig] ✅ Config state updated with displayCurrency:', loadedConfig.displayCurrency);
      
      // Force a small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('[HospitalConfig] ✅ refreshConfig complete - config should be updated');
    } catch (error) {
      console.error('[HospitalConfig] ❌ refreshConfig failed:', error);
      setError('Failed to refresh configuration');
      setLoading(false);
    }
  }, []); // Empty dependency array - function doesn't depend on any props or state

  // Extract commonly used values with defaults
  // Handle both camelCase and snake_case field names from backend
  // Always ensure we have valid currency values, even if config is null
  const baseCurrencyRaw = config?.currency;
  const baseCurrency = (baseCurrencyRaw && typeof baseCurrencyRaw === 'string' && baseCurrencyRaw.trim()) 
    ? baseCurrencyRaw.trim() 
    : (defaultConfig.currency || 'USD');
  
  // Try multiple ways to get displayCurrency (handle both camelCase and snake_case)
  // IMPORTANT: Only fall back to baseCurrency if displayCurrency is explicitly null/undefined
  // If displayCurrency is set to the same as baseCurrency, that's valid and should be used
  const displayCurrencyRaw = config?.displayCurrency !== undefined && config?.displayCurrency !== null
    ? config.displayCurrency
    : ((config as any)?.display_currency !== undefined && (config as any).display_currency !== null
      ? (config as any).display_currency
      : null);
  
  // IMPORTANT: If displayCurrency is not explicitly set, use baseCurrency
  // But if it IS set (even if same as baseCurrency), use it
  // CRITICAL: Always check config first, don't fall back too quickly
  let displayCurrency: string;
  if (displayCurrencyRaw && typeof displayCurrencyRaw === 'string' && displayCurrencyRaw.trim()) {
    displayCurrency = displayCurrencyRaw.trim().toUpperCase(); // Normalize to uppercase
  } else if (config?.displayCurrency && typeof config.displayCurrency === 'string' && config.displayCurrency.trim()) {
    // Double-check config.displayCurrency directly
    displayCurrency = config.displayCurrency.trim().toUpperCase();
  } else {
    // Only fall back to baseCurrency if displayCurrency is truly not set
    displayCurrency = (baseCurrency || defaultConfig.currency || 'USD').toUpperCase();
  }
  
  // Enhanced debug logging - ALWAYS log to help diagnose
  // This runs every time the component re-renders with new config
  console.log('[HospitalConfig] 🔍 Currency extraction details:', {
    configExists: !!config,
    configCurrency: config?.currency,
    configDisplayCurrency: config?.displayCurrency,
    configDisplayCurrencyType: typeof config?.displayCurrency,
    configDisplayCurrencyIsNull: config?.displayCurrency === null,
    configDisplayCurrencyIsUndefined: config?.displayCurrency === undefined,
    configDisplayCurrencyValue: config?.displayCurrency,
    configDisplay_currency: (config as any)?.display_currency,
    baseCurrencyRaw,
    baseCurrency,
    displayCurrencyRaw,
    displayCurrency,
    finalBaseCurrency: baseCurrency,
    finalDisplayCurrency: displayCurrency,
    willUseBaseCurrency: !displayCurrencyRaw || displayCurrencyRaw === baseCurrency,
    currenciesMatch: baseCurrency === displayCurrency,
    shouldConvert: baseCurrency !== displayCurrency && !!baseCurrency && !!displayCurrency,
    timestamp: new Date().toISOString()
  });
  const currency = displayCurrency; // Use display currency for formatting
  
  // Debug logging - always log to help diagnose
  if (!config || !config.currency) {
    console.warn('[HospitalConfig] Config missing or incomplete:', {
      configExists: !!config,
      configCurrency: config?.currency,
      configDisplayCurrency: config?.displayCurrency || config?.display_currency || (config && (config as any).displayCurrency),
      baseCurrency,
      displayCurrency,
      configKeys: config ? Object.keys(config) : 'config is null',
      defaultCurrency: defaultConfig.currency,
      usingDefaults: !config || !config.currency
    });
  } else {
    console.log('[HospitalConfig] Currency extraction:', {
      baseCurrency,
      displayCurrency,
      configCurrency: config.currency,
      configDisplayCurrency: config.displayCurrency || config.display_currency
    });
  }
  const timezone = config?.timezone || defaultConfig.timezone;
  const hospitalName = config?.hospitalName || defaultConfig.hospitalName;
  const logoUrl = config?.logoUrl || defaultConfig.logoUrl;
  const billingSettings = config?.modulesEnabled?.billingSettings || defaultConfig.modulesEnabled.billingSettings;
  const invoicePrefix = billingSettings?.invoicePrefix || defaultConfig.modulesEnabled.billingSettings.invoicePrefix;
  const footerText = billingSettings?.footerText || defaultConfig.modulesEnabled.billingSettings.footerText;
  
  // Currency conversion cache
  const [conversionCache, setConversionCache] = useState<Record<string, number>>({});

  // Ensure currencies are always defined (never undefined or null)
  // CRITICAL: Use the extracted displayCurrency value, don't fall back to defaults if config has it
  const safeBaseCurrency = (baseCurrency && typeof baseCurrency === 'string' && baseCurrency.trim()) 
    ? baseCurrency.trim().toUpperCase()
    : (defaultConfig.currency || 'USD').toUpperCase();
  
  // IMPORTANT: Always prefer the extracted displayCurrency over defaults
  // Only fall back if displayCurrency is truly not available
  let safeDisplayCurrency: string;
  if (displayCurrency && typeof displayCurrency === 'string' && displayCurrency.trim()) {
    safeDisplayCurrency = displayCurrency.trim().toUpperCase();
  } else if (config?.displayCurrency && typeof config.displayCurrency === 'string' && config.displayCurrency.trim()) {
    // Double-check config directly as fallback
    safeDisplayCurrency = config.displayCurrency.trim().toUpperCase();
  } else {
    // Only use defaults if displayCurrency is truly not set
    safeDisplayCurrency = (defaultConfig.displayCurrency || safeBaseCurrency || defaultConfig.currency || 'USD').toUpperCase();
  }
  
  // Debug: Log if we're using a fallback when config has displayCurrency
  if (config?.displayCurrency && safeDisplayCurrency !== config.displayCurrency.toUpperCase()) {
    console.warn('[HospitalConfig] ⚠️ Using fallback displayCurrency instead of config value:', {
      configDisplayCurrency: config.displayCurrency,
      safeDisplayCurrency,
      extractedDisplayCurrency: displayCurrency
    });
  }
  
  // Final safety check - should never happen but ensures we always have valid values
  if (!safeBaseCurrency || !safeDisplayCurrency) {
    console.error('[HospitalConfig] CRITICAL: Currency values are still undefined after all fallbacks!', {
      baseCurrency,
      displayCurrency,
      safeBaseCurrency,
      safeDisplayCurrency,
      defaultConfig
    });
  }
  
  const value = {
    config,
    loading,
    error,
    // Common fields
    currency: safeDisplayCurrency,
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
    // Currency info - ALWAYS defined, never undefined
    baseCurrency: safeBaseCurrency,
    displayCurrency: safeDisplayCurrency,
    // Utility functions
    refreshConfig,
    formatCurrency: (amount: number) => {
      // Format with display currency symbol
      // Note: Amount should already be converted if needed
      // CRITICAL: Log what currency we're using for debugging
      if (amount > 0 && amount < 1000) { // Only log for small amounts to avoid spam
        console.log('[HospitalConfig] formatCurrency called:', {
          amount,
          safeDisplayCurrency,
          displayCurrency,
          configDisplayCurrency: config?.displayCurrency,
          willFormatWith: safeDisplayCurrency
        });
      }
      return formatCurrencySync(amount, safeDisplayCurrency);
    },
    formatCurrencyWithConversion: async (amount: number) => {
      // Async formatting with conversion if baseCurrency differs from displayCurrency
      if (safeBaseCurrency === safeDisplayCurrency) {
        return formatCurrencySync(amount, safeDisplayCurrency);
      }
      
      // Check cache first
      const cacheKey = `${safeBaseCurrency}_${safeDisplayCurrency}_${amount}`;
      if (conversionCache[cacheKey]) {
        return formatCurrencySync(conversionCache[cacheKey], safeDisplayCurrency);
      }
      
      try {
        const converted = await currencyService.convertCurrency(amount, safeBaseCurrency, safeDisplayCurrency);
        setConversionCache(prev => ({ ...prev, [cacheKey]: converted }));
        return formatCurrencySync(converted, safeDisplayCurrency);
      } catch (error) {
        console.warn('Currency conversion failed, using original amount:', error);
        return formatCurrencySync(amount, safeDisplayCurrency);
      }
    },
    convertCurrency: async (amount: number) => {
      // Convert amount from base to display currency
      if (safeBaseCurrency === safeDisplayCurrency) {
        console.log(`[Currency Conversion] Base and display currencies are the same (${safeBaseCurrency}), no conversion needed`);
        return amount;
      }
      
      if (!safeBaseCurrency || !safeDisplayCurrency) {
        console.warn(`[Currency Conversion] Missing currency info. Base: ${safeBaseCurrency}, Display: ${safeDisplayCurrency}`);
        return amount;
      }
      
      try {
        console.log(`[Currency Conversion] Calling API to convert ${amount} from ${safeBaseCurrency} to ${safeDisplayCurrency}`);
        const converted = await currencyService.convertCurrency(amount, safeBaseCurrency, safeDisplayCurrency);
        console.log(`[Currency Conversion] API returned: ${converted} (original: ${amount})`);
        return converted;
      } catch (error) {
        console.error('[Currency Conversion] API call failed:', error);
        console.warn('Currency conversion failed, using original amount:', error);
        return amount;
      }
    },
    formatDate: (date, options) => formatDateUtil(date, timezone, options),
    formatDateTime: (date) => formatDateTimeUtil(date, timezone),
    formatDateOnly: (date) => formatDateOnlyUtil(date, timezone),
    getCurrencySymbol: () => getCurrencySymbol(displayCurrency),
  };

  // Log whenever the context value changes (especially currency changes)
  React.useEffect(() => {
    console.log('[HospitalConfig] 📦 Context value updated:', {
      baseCurrency: value.baseCurrency,
      displayCurrency: value.displayCurrency,
      configDisplayCurrency: value.config?.displayCurrency,
      configCurrency: value.config?.currency,
      timestamp: new Date().toISOString()
    });
  }, [value.baseCurrency, value.displayCurrency, value.config?.displayCurrency, value.config?.currency]);

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
    const fallbackBaseCurrency = defaultConfig.currency || 'USD';
    const fallbackDisplayCurrency = defaultConfig.displayCurrency || defaultConfig.currency || 'USD';
    return {
      config: defaultConfig,
      loading: false,
      error: null,
      currency: fallbackDisplayCurrency,
      baseCurrency: fallbackBaseCurrency,
      displayCurrency: fallbackDisplayCurrency,
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
      formatCurrency: (amount) => formatCurrencySync(amount, fallbackDisplayCurrency),
      formatDate: (date, options) => formatDateUtil(date, defaultConfig.timezone, options),
      formatDateTime: (date) => formatDateTimeUtil(date, defaultConfig.timezone),
      formatDateOnly: (date) => formatDateOnlyUtil(date, defaultConfig.timezone),
      getCurrencySymbol: () => getCurrencySymbol(fallbackDisplayCurrency),
      convertCurrency: async (amount: number) => amount, // No conversion in fallback
    };
  }
  
  // Ensure baseCurrency and displayCurrency are always defined
  // CRITICAL: Always prefer config.displayCurrency if available, even if context.displayCurrency is different
  const safeBaseCurrency = context.baseCurrency || defaultConfig.currency || 'USD';
  
  // IMPORTANT: Check config.displayCurrency FIRST, then fall back to context.displayCurrency
  // This ensures we always use the latest saved value from the database
  let safeDisplayCurrency: string;
  if (context.config?.displayCurrency && typeof context.config.displayCurrency === 'string' && context.config.displayCurrency.trim()) {
    // Use config.displayCurrency directly - this is the source of truth from database
    safeDisplayCurrency = context.config.displayCurrency.trim().toUpperCase();
    console.log('[HospitalConfig] ✅ useHospitalConfig: Using config.displayCurrency from database:', safeDisplayCurrency);
  } else if (context.displayCurrency && typeof context.displayCurrency === 'string' && context.displayCurrency.trim()) {
    safeDisplayCurrency = context.displayCurrency.trim().toUpperCase();
    console.log('[HospitalConfig] ⚠️ useHospitalConfig: Using context.displayCurrency (config.displayCurrency not available):', safeDisplayCurrency);
  } else {
    safeDisplayCurrency = (defaultConfig.displayCurrency || defaultConfig.currency || 'USD').toUpperCase();
    console.log('[HospitalConfig] ⚠️ useHospitalConfig: Using default currency:', safeDisplayCurrency);
  }
  
  // Debug: Log what we're actually using
  console.log('[HospitalConfig] 📊 useHospitalConfig currency resolution:', {
    configDisplayCurrency: context.config?.displayCurrency,
    contextDisplayCurrency: context.displayCurrency,
    safeDisplayCurrency,
    willUse: safeDisplayCurrency
  });
  
  return {
    ...context,
    baseCurrency: safeBaseCurrency,
    displayCurrency: safeDisplayCurrency, // Use the safe value that prefers config
  };
};

