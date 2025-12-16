import { useState, useEffect, useCallback } from 'react';
import { useHospitalConfig } from '../contexts/HospitalConfigContext';
import currencyService from '../api/services/currencyService';
import { formatCurrencySync } from '../utils/currencyAndTimezone';

/**
 * Hook for currency conversion with caching
 * Automatically converts amounts from base currency to display currency
 */
export function useCurrencyConversion() {
  const { baseCurrency, displayCurrency, convertCurrency: contextConvertCurrency } = useHospitalConfig();
  const [conversionCache, setConversionCache] = useState<Record<string, number>>({});
  const [isConverting, setIsConverting] = useState(false);

  // Clear cache when currencies change
  useEffect(() => {
    setConversionCache({});
  }, [baseCurrency, displayCurrency]);

  /**
   * Convert and format currency amount
   */
  const formatCurrency = useCallback(async (amount: number): Promise<string> => {
    if (baseCurrency === displayCurrency) {
      return formatCurrencySync(amount, displayCurrency);
    }

    const cacheKey = `${baseCurrency}_${displayCurrency}_${amount}`;
    
    // Check cache first
    if (conversionCache[cacheKey]) {
      return formatCurrencySync(conversionCache[cacheKey], displayCurrency);
    }

    setIsConverting(true);
    try {
      const converted = await contextConvertCurrency(amount);
      setConversionCache(prev => ({ ...prev, [cacheKey]: converted }));
      return formatCurrencySync(converted, displayCurrency);
    } catch (error) {
      console.warn('Currency conversion failed:', error);
      return formatCurrencySync(amount, displayCurrency);
    } finally {
      setIsConverting(false);
    }
  }, [baseCurrency, displayCurrency, conversionCache, contextConvertCurrency]);

  /**
   * Convert currency amount (returns number, not formatted string)
   */
  const convertAmount = useCallback(async (amount: number): Promise<number> => {
    if (baseCurrency === displayCurrency) {
      return amount;
    }

    const cacheKey = `${baseCurrency}_${displayCurrency}_${amount}`;
    
    // Check cache first
    if (conversionCache[cacheKey]) {
      return conversionCache[cacheKey];
    }

    setIsConverting(true);
    try {
      const converted = await contextConvertCurrency(amount);
      setConversionCache(prev => ({ ...prev, [cacheKey]: converted }));
      return converted;
    } catch (error) {
      console.warn('Currency conversion failed:', error);
      return amount;
    } finally {
      setIsConverting(false);
    }
  }, [baseCurrency, displayCurrency, conversionCache, contextConvertCurrency]);

  /**
   * Synchronous format (no conversion) - for backward compatibility
   */
  const formatCurrencySyncOnly = useCallback((amount: number): string => {
    return formatCurrencySync(amount, displayCurrency);
  }, [displayCurrency]);

  return {
    formatCurrency,
    convertAmount,
    formatCurrencySync: formatCurrencySyncOnly,
    baseCurrency,
    displayCurrency,
    isConverting,
    needsConversion: baseCurrency !== displayCurrency,
  };
}

