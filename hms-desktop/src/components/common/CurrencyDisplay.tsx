import React, { useState, useEffect } from 'react';
import { useHospitalConfig } from '../../lib/contexts/HospitalConfigContext';
import { formatCurrencySync } from '../../lib/utils/currencyAndTimezone';

interface CurrencyDisplayProps {
  amount: number | string | null | undefined;
  className?: string;
  style?: React.CSSProperties;
  showSymbol?: boolean;
}

/**
 * Component to display currency with automatic conversion
 * Handles async conversion from base currency to display currency
 */
export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  className = '', 
  style = {},
  showSymbol = true 
}) => {
  const { baseCurrency, displayCurrency, convertCurrency } = useHospitalConfig();
  const [displayAmount, setDisplayAmount] = useState<number | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);

  useEffect(() => {
    const convertAmount = async () => {
      if (baseCurrency === displayCurrency || numAmount === 0) {
        setDisplayAmount(numAmount);
        return;
      }

      setIsConverting(true);
      try {
        const converted = await convertCurrency(numAmount);
        setDisplayAmount(converted);
      } catch (error) {
        console.warn('Currency conversion failed, using original amount:', error);
        setDisplayAmount(numAmount);
      } finally {
        setIsConverting(false);
      }
    };

    convertAmount();
  }, [numAmount, baseCurrency, displayCurrency, convertCurrency]);

  if (displayAmount === null) {
    return React.createElement(
      'span',
      { className, style },
      isConverting ? '...' : formatCurrencySync(numAmount, displayCurrency)
    );
  }

  return React.createElement(
    'span',
    { className, style },
    formatCurrencySync(displayAmount, displayCurrency)
  );
};

export default CurrencyDisplay;
















