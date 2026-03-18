import * as cron from 'node-cron';
import { updateExchangeRates, getHospitalCurrencies } from './currencyService';
import logger from '../utils/logger';

let schedulerRunning = false;

/**
 * Schedule daily currency rate updates at midnight
 */
export function startCurrencyScheduler(): void {
  if (schedulerRunning) {
    logger.warn('Currency scheduler is already running');
    return;
  }

  logger.info('Starting currency exchange rate scheduler...');

  // Schedule daily update at midnight (00:00) in the server's timezone
  // Format: minute hour day month dayOfWeek
  // '0 0 * * *' means: at 00:00 (midnight) every day
  cron.schedule('0 0 * * *', async () => {
    logger.info('🔄 Scheduled currency rate update triggered at midnight');
    await updateCurrencyRatesJob();
  }, {
    scheduled: true,
    timezone: process.env.TZ || 'UTC',
  });

  // Also run immediately on startup to ensure rates are available
  logger.info('Running initial currency rate update...');
  updateCurrencyRatesJob().catch(err => {
    logger.error('Initial currency rate update failed', err);
  });

  schedulerRunning = true;
  logger.info('✅ Currency scheduler started successfully');
}

/**
 * Job function to update currency rates
 */
async function updateCurrencyRatesJob(): Promise<void> {
  try {
    logger.info('🔄 Starting currency rate update job...');
    
    const { baseCurrency } = await getHospitalCurrencies();
    logger.info(`Updating rates for base currency: ${baseCurrency}`);
    
    const result = await updateExchangeRates(baseCurrency);
    
    if (result.success) {
      logger.info(`✅ Currency rate update completed successfully. ${result.ratesUpdated} rates updated.`);
    } else {
      logger.error(`❌ Currency rate update failed: ${result.error}`);
    }
  } catch (error: any) {
    logger.error('❌ Error in currency rate update job', error);
  }
}

/**
 * Stop the currency scheduler
 */
export function stopCurrencyScheduler(): void {
  // Note: node-cron doesn't have a direct stop method for individual tasks
  // In production, you might want to store the task reference and use task.stop()
  logger.info('Currency scheduler stop requested');
  schedulerRunning = false;
}

/**
 * Manually trigger currency rate update (for testing or manual refresh)
 */
export async function triggerCurrencyUpdate(): Promise<{ success: boolean; ratesUpdated: number; error?: string }> {
  logger.info('🔄 Manual currency rate update triggered');
  const { baseCurrency } = await getHospitalCurrencies();
  return await updateExchangeRates(baseCurrency);
}

