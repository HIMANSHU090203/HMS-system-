import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Free currency API endpoints (no API key required)
const CURRENCY_APIS = {
  // ExchangeRate-API (free tier: 1,500 requests/month)
  exchangerate: {
    url: 'https://api.exchangerate-api.com/v4/latest',
    getUrl: (baseCurrency: string) => `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
  },
  // Fixer.io alternative (requires API key, but we'll use exchangerate-api as primary)
  fixer: {
    url: 'http://data.fixer.io/api/latest',
    getUrl: (baseCurrency: string, apiKey?: string) => 
      `http://data.fixer.io/api/latest?access_key=${apiKey || ''}&base=${baseCurrency}`,
  },
};

interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
}

/**
 * Fetch exchange rates from external API
 */
export async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number> | null> {
  try {
    logger.info(`Fetching exchange rates for base currency: ${baseCurrency}`);
    
    // Try ExchangeRate-API first (free, no API key required)
    const url = CURRENCY_APIS.exchangerate.getUrl(baseCurrency);
    const response = await axios.get<ExchangeRateResponse>(url, {
      timeout: 10000,
    });

    if (response.data && response.data.rates) {
      logger.info(`Successfully fetched ${Object.keys(response.data.rates).length} exchange rates`);
      return response.data.rates;
    }

    logger.warn('ExchangeRate-API returned invalid data');
    return null;
  } catch (error: any) {
    logger.error('Failed to fetch exchange rates from ExchangeRate-API', error);
    
    // Fallback: Try Fixer.io if API key is available
    const fixerApiKey = process.env.FIXER_API_KEY;
    if (fixerApiKey) {
      try {
        const fixerUrl = CURRENCY_APIS.fixer.getUrl(baseCurrency, fixerApiKey);
        const fixerResponse = await axios.get(fixerUrl, { timeout: 10000 });
        
        if (fixerResponse.data && fixerResponse.data.success && fixerResponse.data.rates) {
          logger.info(`Successfully fetched rates from Fixer.io`);
          return fixerResponse.data.rates;
        }
      } catch (fixerError: any) {
        logger.error('Failed to fetch from Fixer.io', fixerError);
      }
    }

    return null;
  }
}

/**
 * Update exchange rates in database for today
 */
export async function updateExchangeRates(baseCurrency: string = 'USD'): Promise<{ success: boolean; ratesUpdated: number; error?: string }> {
  try {
    const normalizedBase = (baseCurrency || 'USD').trim().toUpperCase();

    // Application standard is INR-only; no cross-currency table sync required.
    if (normalizedBase === 'INR') {
      logger.info(
        'Skipping exchange rate sync: hospital base currency is INR (multi-currency disabled for this deployment).'
      );
      return { success: true, ratesUpdated: 0 };
    }

    logger.info(`Updating exchange rates for base currency: ${normalizedBase}`);

    const rates = await fetchExchangeRates(normalizedBase);
    
    if (!rates) {
      return {
        success: false,
        ratesUpdated: 0,
        error: 'Failed to fetch exchange rates from API',
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to midnight

    let ratesUpdated = 0;

    // Get list of supported currencies from the currency utility
    const supportedCurrencies = [
      'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'AUD', 'CAD', 'CHF', 'SGD',
      'AED', 'SAR', 'PKR', 'BDT', 'LKR', 'NPR', 'MYR', 'THB', 'IDR', 'PHP',
      'VND', 'KRW', 'ZAR', 'BRL', 'MXN', 'RUB', 'TRY', 'NGN', 'EGP', 'KES',
    ];

    // Update rates for all supported currencies
    for (const targetCurrency of supportedCurrencies) {
      if (targetCurrency === normalizedBase) {
        continue; // Skip base currency (rate is always 1.0)
      }

      const rate = rates[targetCurrency];
      if (rate && typeof rate === 'number' && rate > 0) {
        try {
          // Try using Prisma model first
          if (prisma.currencyExchangeRate) {
            await prisma.currencyExchangeRate.upsert({
              where: {
                baseCurrency_targetCurrency_date: {
                  baseCurrency: normalizedBase,
                  targetCurrency,
                  date: today,
                },
              },
              update: {
                rate,
                isActive: true,
                source: 'exchangerate-api',
                updatedAt: new Date(),
              },
              create: {
                baseCurrency: normalizedBase,
                targetCurrency,
                rate,
                date: today,
                source: 'exchangerate-api',
                isActive: true,
              },
            });
          } else {
            // Fallback to raw SQL if model not available
            await prisma.$executeRaw`
              INSERT INTO currency_exchange_rates (
                id, base_currency, target_currency, rate, date, source, is_active, created_at, updated_at
              ) VALUES (
                gen_random_uuid()::text,
                ${normalizedBase},
                ${targetCurrency},
                ${rate}::numeric(12,6),
                ${today}::timestamp,
                'exchangerate-api',
                true,
                NOW(),
                NOW()
              )
              ON CONFLICT (base_currency, target_currency, date) 
              DO UPDATE SET
                rate = EXCLUDED.rate,
                is_active = EXCLUDED.is_active,
                updated_at = NOW();
            `;
          }
          ratesUpdated++;
        } catch (dbError: any) {
          logger.warn(`Failed to save rate for ${targetCurrency}:`, dbError.message);
          // Continue with other currencies
        }
      }
    }

    logger.info(`Successfully updated ${ratesUpdated} exchange rates for ${normalizedBase}`);
    
    return {
      success: true,
      ratesUpdated,
    };
  } catch (error: any) {
    logger.error('Error updating exchange rates', error);
    return {
      success: false,
      ratesUpdated: 0,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Get exchange rate for conversion
 */
export async function getExchangeRate(
  baseCurrency: string,
  targetCurrency: string,
  date?: Date
): Promise<number | null> {
  try {
    if (baseCurrency === targetCurrency) {
      return 1.0;
    }

    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Try using Prisma model first, fallback to raw SQL
    try {
      if (prisma.currencyExchangeRate) {
        // Try to get rate for the specified date
        const rate = await prisma.currencyExchangeRate.findUnique({
          where: {
            baseCurrency_targetCurrency_date: {
              baseCurrency,
              targetCurrency,
              date: targetDate,
            },
          },
          select: {
            rate: true,
            isActive: true,
          },
        });

        if (rate && rate.isActive) {
          return Number(rate.rate);
        }

        // If not found for today, try to get the most recent rate
        const latestRate = await prisma.currencyExchangeRate.findFirst({
          where: {
            baseCurrency,
            targetCurrency,
            isActive: true,
          },
          orderBy: {
            date: 'desc',
          },
          select: {
            rate: true,
          },
        });

        if (latestRate) {
          logger.warn(`Using latest available rate (not today's) for ${baseCurrency} to ${targetCurrency}`);
          return Number(latestRate.rate);
        }
      }
    } catch (prismaError: any) {
      logger.warn('Prisma model not available, using raw SQL', prismaError.message);
    }

    // Fallback to raw SQL
    try {
      const rateResult = await prisma.$queryRaw<Array<{ rate: number; is_active: boolean }>>`
        SELECT rate, is_active 
        FROM currency_exchange_rates 
        WHERE base_currency = ${baseCurrency} 
          AND target_currency = ${targetCurrency} 
          AND date = ${targetDate}::date
          AND is_active = true
        LIMIT 1;
      `;

      if (rateResult && rateResult.length > 0 && rateResult[0].is_active) {
        return Number(rateResult[0].rate);
      }

      // Get latest rate
      const latestRateResult = await prisma.$queryRaw<Array<{ rate: number }>>`
        SELECT rate 
        FROM currency_exchange_rates 
        WHERE base_currency = ${baseCurrency} 
          AND target_currency = ${targetCurrency} 
          AND is_active = true
        ORDER BY date DESC
        LIMIT 1;
      `;

      if (latestRateResult && latestRateResult.length > 0) {
        logger.warn(`Using latest available rate (not today's) for ${baseCurrency} to ${targetCurrency}`);
        return Number(latestRateResult[0].rate);
      }
    } catch (rawError: any) {
      logger.error('Error getting exchange rate with raw SQL', rawError);
    }

    logger.warn(`No exchange rate found for ${baseCurrency} to ${targetCurrency}`);
    return null;
  } catch (error: any) {
    logger.error('Error getting exchange rate', error);
    return null;
  }
}

/**
 * Convert amount from base currency to target currency
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date?: Date
): Promise<number | null> {
  try {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rate = await getExchangeRate(fromCurrency, toCurrency, date);
    
    if (rate === null) {
      logger.warn(`Cannot convert ${amount} ${fromCurrency} to ${toCurrency} - rate not available`);
      return null;
    }

    return amount * rate;
  } catch (error: any) {
    logger.error('Error converting currency', error);
    return null;
  }
}

/**
 * Get hospital base currency and display currency
 */
export async function getHospitalCurrencies(): Promise<{ baseCurrency: string; displayCurrency: string }> {
  try {
    // Use raw query to handle case where displayCurrency column might not exist yet
    const config = await prisma.$queryRaw<Array<{
      currency: string;
      display_currency?: string | null;
    }>>`
      SELECT currency, display_currency 
      FROM hospital_config 
      LIMIT 1;
    `;

    if (!config || config.length === 0) {
      return { baseCurrency: 'USD', displayCurrency: 'USD' };
    }

    const row = config[0];
    return {
      baseCurrency: row.currency || 'USD',
      displayCurrency: row.display_currency || row.currency || 'USD',
    };
  } catch (error: any) {
    // Fallback: try with Prisma if raw query fails
    try {
      const config = await prisma.hospitalConfig.findFirst({
        select: {
          currency: true,
        },
      });

      if (!config) {
        return { baseCurrency: 'USD', displayCurrency: 'USD' };
      }

      return {
        baseCurrency: config.currency || 'USD',
        displayCurrency: config.currency || 'USD', // Fallback to currency if displayCurrency not available
      };
    } catch (fallbackError: any) {
      logger.error('Error getting hospital currencies', fallbackError);
      return { baseCurrency: 'USD', displayCurrency: 'USD' };
    }
  }
}

