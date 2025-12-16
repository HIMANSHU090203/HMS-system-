import React, { useState, useEffect } from 'react';
import { useHospitalConfig } from '../contexts/HospitalConfigContext';
import { formatCurrencySync } from './currencyAndTimezone';

/**
 * Helper component to display currency with automatic conversion
 * Use this in React.createElement patterns
 */
export function CurrencyPriceDisplay({ amount, baseCurrency, displayCurrency, formatCurrency }) {
  const [displayAmount, setDisplayAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);

  useEffect(() => {
    const convert = async () => {
      if (baseCurrency === displayCurrency || numAmount === 0) {
        setDisplayAmount(numAmount);
        return;
      }

      setIsLoading(true);
      try {
        const { convertCurrency: convertCurrencyFn } = await import('../contexts/HospitalConfigContext');
        // We'll use the context directly
        const converted = await convertCurrencyFn(numAmount);
        setDisplayAmount(converted);
      } catch (error) {
        console.warn('Currency conversion failed:', error);
        setDisplayAmount(numAmount);
      } finally {
        setIsLoading(false);
      }
    };

    convert();
  }, [numAmount, baseCurrency, displayCurrency]);

  if (displayAmount === null || isLoading) {
    return React.createElement('span', null, formatCurrency(numAmount));
  }

  return React.createElement('span', null, formatCurrency(displayAmount));
}

/**
 * Hook to get converted currency amount
 */
export function useCurrencyAmount(amount: number | string | null | undefined) {
  const { baseCurrency, displayCurrency, convertCurrency } = useHospitalConfig();
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);

  useEffect(() => {
    const convert = async () => {
      if (baseCurrency === displayCurrency || numAmount === 0) {
        setConvertedAmount(numAmount);
        return;
      }

      setIsLoading(true);
      try {
        const converted = await convertCurrency(numAmount);
        setConvertedAmount(converted);
      } catch (error) {
        console.warn('Currency conversion failed:', error);
        setConvertedAmount(numAmount);
      } finally {
        setIsLoading(false);
      }
    };

    convert();
  }, [numAmount, baseCurrency, displayCurrency, convertCurrency]);

  return { convertedAmount: convertedAmount ?? numAmount, isLoading };
}
















