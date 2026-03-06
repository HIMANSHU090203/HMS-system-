import apiClient from '../config';
import type { ApiResponse } from '../types';

export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  date: string;
}

export interface CurrencyConversion {
  originalAmount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  date: string;
}

export interface HospitalCurrencies {
  baseCurrency: string;
  displayCurrency: string;
}

class CurrencyService {
  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(baseCurrency: string, targetCurrency: string, date?: string): Promise<number> {
    try {
      const params: any = { baseCurrency, targetCurrency };
      if (date) params.date = date;

      const response = await apiClient.get<ApiResponse<{ rate: number }>>('/currency/rates', { params });
      return response.data.data?.rate || 1.0;
    } catch (error: any) {
      console.error('Error getting exchange rate:', error);
      return 1.0; // Fallback to 1.0 if rate not available
    }
  }

  /**
   * Convert amount from one currency to another
   * Application uses INR only - no conversion needed
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string, date?: string): Promise<number> {
    // Application uses INR only - return amount as-is
    return amount;
  }

  /**
   * Get hospital base and display currencies
   * Application uses INR only
   */
  async getHospitalCurrencies(): Promise<HospitalCurrencies> {
    // Application uses INR only
    return { baseCurrency: 'INR', displayCurrency: 'INR' };
  }

  /**
   * Get latest exchange rates for all currencies
   */
  async getLatestRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
    try {
      const response = await apiClient.get<ApiResponse<{ rates: Record<string, number> }>>('/currency/latest-rates', {
        params: { baseCurrency },
      });
      return response.data.data?.rates || {};
    } catch (error: any) {
      console.error('Error getting latest rates:', error);
      return {};
    }
  }

  /**
   * Manually trigger currency rate update (Admin only)
   */
  async updateRates(): Promise<{ success: boolean; ratesUpdated: number }> {
    try {
      const response = await apiClient.post<ApiResponse<{ ratesUpdated: number }>>('/currency/update-rates');
      return {
        success: response.data.success,
        ratesUpdated: response.data.data?.ratesUpdated || 0,
      };
    } catch (error: any) {
      console.error('Error updating rates:', error);
      return { success: false, ratesUpdated: 0 };
    }
  }
}

export default new CurrencyService();
















