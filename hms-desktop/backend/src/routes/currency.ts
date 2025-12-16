import { Router } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import { updateExchangeRates, getExchangeRate, convertCurrency, getHospitalCurrencies } from '../services/currencyService';
import { triggerCurrencyUpdate } from '../services/currencyScheduler';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/currency/rates
 * @desc    Get exchange rates
 * @access  Private
 */
router.get('/rates', async (req: AuthRequest, res: Response) => {
  try {
    const { baseCurrency, targetCurrency, date } = req.query;

    if (!baseCurrency || !targetCurrency) {
      return res.status(400).json({
        success: false,
        message: 'baseCurrency and targetCurrency are required',
      });
    }

    const rate = await getExchangeRate(
      baseCurrency as string,
      targetCurrency as string,
      date ? new Date(date as string) : undefined
    );

    if (rate === null) {
      return res.status(404).json({
        success: false,
        message: 'Exchange rate not found',
      });
    }

    res.json({
      success: true,
      data: {
        baseCurrency,
        targetCurrency,
        rate,
        date: date || new Date().toISOString().split('T')[0],
      },
    });
  } catch (error: any) {
    console.error('Get exchange rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exchange rate',
    });
  }
});

/**
 * @route   POST /api/currency/convert
 * @desc    Convert amount between currencies
 * @access  Private
 */
router.post('/convert', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, fromCurrency, toCurrency, date } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({
        success: false,
        message: 'amount, fromCurrency, and toCurrency are required',
      });
    }

    const convertedAmount = await convertCurrency(
      parseFloat(amount),
      fromCurrency,
      toCurrency,
      date ? new Date(date) : undefined
    );

    if (convertedAmount === null) {
      return res.status(404).json({
        success: false,
        message: 'Cannot convert currency - exchange rate not available',
      });
    }

    res.json({
      success: true,
      data: {
        originalAmount: parseFloat(amount),
        fromCurrency,
        toCurrency,
        convertedAmount,
        date: date || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Convert currency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert currency',
    });
  }
});

/**
 * @route   GET /api/currency/hospital-currencies
 * @desc    Get hospital base and display currencies
 * @access  Private
 */
router.get('/hospital-currencies', async (req: AuthRequest, res: Response) => {
  try {
    const currencies = await getHospitalCurrencies();
    res.json({
      success: true,
      data: currencies,
    });
  } catch (error: any) {
    console.error('Get hospital currencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get hospital currencies',
    });
  }
});

/**
 * @route   POST /api/currency/update-rates
 * @desc    Manually trigger currency rate update
 * @access  Admin only
 */
router.post('/update-rates', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const result = await triggerCurrencyUpdate();
    
    if (result.success) {
      res.json({
        success: true,
        message: `Successfully updated ${result.ratesUpdated} exchange rates`,
        data: {
          ratesUpdated: result.ratesUpdated,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error || 'Failed to update exchange rates',
      });
    }
  } catch (error: any) {
    console.error('Update currency rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exchange rates',
    });
  }
});

/**
 * @route   GET /api/currency/latest-rates
 * @desc    Get latest exchange rates for all currencies
 * @access  Private
 */
router.get('/latest-rates', async (req: AuthRequest, res: Response) => {
  try {
    const { baseCurrency = 'USD' } = req.query;
    
    const rates = await prisma.currencyExchangeRate.findMany({
      where: {
        baseCurrency: baseCurrency as string,
        isActive: true,
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 50, // Limit to most recent rates
    });

    // Group by target currency and get latest rate for each
    const latestRates: Record<string, number> = {};
    const processedCurrencies = new Set<string>();

    for (const rate of rates) {
      if (!processedCurrencies.has(rate.targetCurrency)) {
        latestRates[rate.targetCurrency] = Number(rate.rate);
        processedCurrencies.add(rate.targetCurrency);
      }
    }

    res.json({
      success: true,
      data: {
        baseCurrency,
        rates: latestRates,
        lastUpdated: rates[0]?.date || null,
      },
    });
  } catch (error: any) {
    console.error('Get latest rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get latest exchange rates',
    });
  }
});

export default router;
















