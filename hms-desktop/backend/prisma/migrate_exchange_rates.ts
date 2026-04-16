/**
 * Migration script to migrate data from old exchange_rate table to new currency_exchange_rates table
 * Run this script before applying the Prisma schema changes
 * 
 * Usage: ts-node prisma/migrations/migrate_exchange_rates.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateExchangeRates() {
  console.log('🔄 Starting exchange rate migration...\n');

  try {
    // Check if old exchange_rate table exists
    const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'exchange_rate'
      );
    `;

    if (!tableExists[0]?.exists) {
      console.log('✅ Old exchange_rate table does not exist. No migration needed.');
      return;
    }

    // Get all data from old exchange_rate table
    const oldRates = await prisma.$queryRaw<Array<{
      id?: string;
      base_currency?: string;
      target_currency?: string;
      rate?: number | string;
      date?: Date | string;
      source?: string;
      is_active?: boolean;
      created_at?: Date | string;
      updated_at?: Date | string;
    }>>`
      SELECT * FROM exchange_rate;
    `;

    if (!oldRates || oldRates.length === 0) {
      console.log('✅ No data in old exchange_rate table. No migration needed.');
      return;
    }

    console.log(`📊 Found ${oldRates.length} exchange rate records to migrate\n`);

    // Check if new table exists, if not, we'll need to create it first via Prisma
    const newTableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'currency_exchange_rates'
      );
    `;

    if (!newTableExists[0]?.exists) {
      console.log('⚠️  New currency_exchange_rates table does not exist yet.');
      console.log('   Please run: npx prisma db push (or create migration) first.');
      console.log('   Then run this script again to migrate the data.\n');
      return;
    }

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    // Migrate each record
    for (const oldRate of oldRates) {
      try {
        const baseCurrency = oldRate.base_currency || 'USD';
        const targetCurrency = oldRate.target_currency || 'USD';
        const rate = typeof oldRate.rate === 'string' ? parseFloat(oldRate.rate) : (oldRate.rate || 1.0);
        const date = oldRate.date ? new Date(oldRate.date) : new Date();
        const source = oldRate.source || 'migrated';
        const isActive = oldRate.is_active !== false; // Default to true

        // Skip if base and target are the same
        if (baseCurrency === targetCurrency) {
          skipped++;
          continue;
        }

        // Try to insert into new table
        await prisma.$executeRaw`
          INSERT INTO currency_exchange_rates (
            id, base_currency, target_currency, rate, date, source, is_active, created_at, updated_at
          ) VALUES (
            gen_random_uuid()::text,
            ${baseCurrency},
            ${targetCurrency},
            ${rate}::numeric(12,6),
            ${date}::timestamp,
            ${source},
            ${isActive},
            ${oldRate.created_at ? new Date(oldRate.created_at) : new Date()}::timestamp,
            ${oldRate.updated_at ? new Date(oldRate.updated_at) : new Date()}::timestamp
          )
          ON CONFLICT (base_currency, target_currency, date) 
          DO UPDATE SET
            rate = EXCLUDED.rate,
            is_active = EXCLUDED.is_active,
            updated_at = EXCLUDED.updated_at;
        `;

        migrated++;
        if (migrated % 10 === 0) {
          process.stdout.write(`\r   Migrated ${migrated}/${oldRates.length} records...`);
        }
      } catch (error: any) {
        console.error(`\n❌ Error migrating record:`, error.message);
        errors++;
      }
    }

    console.log(`\n\n✅ Migration completed!`);
    console.log(`   ✅ Migrated: ${migrated} records`);
    console.log(`   ⏭️  Skipped: ${skipped} records`);
    console.log(`   ❌ Errors: ${errors} records\n`);

    if (migrated > 0) {
      console.log('💡 Next steps:');
      console.log('   1. Verify the migrated data in currency_exchange_rates table');
      console.log('   2. Once verified, you can drop the old exchange_rate table:');
      console.log('      DROP TABLE IF EXISTS exchange_rate;');
      console.log('   3. Or let Prisma handle it during schema push\n');
    }
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateExchangeRates()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
















