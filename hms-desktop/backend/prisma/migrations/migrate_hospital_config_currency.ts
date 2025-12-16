/**
 * Migration script to add display_currency column to hospital_config table
 * and migrate existing currency data
 * 
 * Usage: ts-node prisma/migrations/migrate_hospital_config_currency.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateHospitalConfigCurrency() {
  console.log('🔄 Starting hospital config currency migration...\n');

  try {
    // Check if display_currency column already exists
    const columnExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'hospital_config'
        AND column_name = 'display_currency'
      );
    `;

    if (columnExists[0]?.exists) {
      console.log('✅ display_currency column already exists. Checking for null values...\n');
    } else {
      console.log('📝 Adding display_currency column to hospital_config table...\n');
      
      // Add the column
      await prisma.$executeRaw`
        ALTER TABLE hospital_config 
        ADD COLUMN IF NOT EXISTS display_currency VARCHAR(10);
      `;
      
      console.log('✅ Column added successfully\n');
    }

    // Update all hospital configs to set display_currency = currency if it's null
    const result = await prisma.$executeRaw`
      UPDATE hospital_config 
      SET display_currency = currency 
      WHERE display_currency IS NULL;
    `;

    console.log(`✅ Updated ${result} hospital config record(s) with display_currency\n`);

    // Check for old columns that might need to be removed
    const oldColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'hospital_config'
      AND column_name IN ('base_currency', 'enable_currency_conversion');
    `;

    if (oldColumns.length > 0) {
      console.log('⚠️  Found old currency-related columns that can be removed:');
      oldColumns.forEach(col => console.log(`   - ${col.column_name}`));
      console.log('\n💡 You can remove these columns manually if they are no longer needed:');
      oldColumns.forEach(col => {
        console.log(`   ALTER TABLE hospital_config DROP COLUMN IF EXISTS ${col.column_name};`);
      });
      console.log('');
    }

    console.log('✅ Hospital config currency migration completed!\n');
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateHospitalConfigCurrency()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
















