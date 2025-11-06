import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  allergyCatalogData, 
  chronicConditionData, 
  commonDiagnosesData,
  commonMedicinesData,
  labTestCatalogData 
} from './seed/catalogData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // NOTE: Admin user creation is now handled by the setup/onboarding flow
  // This seed file only creates catalog data and system configs
  console.log('ℹ️  Admin user will be created during first-time setup');

  // Create default system configuration
  const systemConfigs = [
    {
      configKey: 'hospital_name',
      configValue: 'HMS Hospital',
    },
    {
      configKey: 'hospital_address',
      configValue: '123 Medical Street, Healthcare City',
    },
    {
      configKey: 'tax_rate',
      configValue: '18',
    },
    {
      configKey: 'default_currency',
      configValue: 'INR',
    },
    {
      configKey: 'appointment_duration',
      configValue: '30',
    },
    {
      configKey: 'low_stock_threshold',
      configValue: '10',
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { configKey: config.configKey },
      update: { configValue: config.configValue },
      create: config,
    });
  }

  console.log('✅ System configuration created');

  // Seed Allergy Catalog
  console.log('📝 Seeding allergy catalog...');
  for (const allergy of allergyCatalogData) {
    await prisma.allergyCatalog.upsert({
      where: { code: allergy.code },
      update: {},
      create: allergy,
    });
  }
  console.log(`✅ ${allergyCatalogData.length} allergies seeded`);

  // Seed Chronic Condition Catalog
  console.log('📝 Seeding chronic condition catalog...');
  for (const condition of chronicConditionData) {
    await prisma.chronicConditionCatalog.upsert({
      where: { code: condition.code },
      update: {},
      create: condition,
    });
  }
  console.log(`✅ ${chronicConditionData.length} chronic conditions seeded`);

  // Seed Diagnosis Catalog
  console.log('📝 Seeding diagnosis catalog...');
  for (const diagnosis of commonDiagnosesData) {
    await prisma.diagnosisCatalog.upsert({
      where: { icdCode: diagnosis.icdCode },
      update: {},
      create: diagnosis,
    });
  }
  console.log(`✅ ${commonDiagnosesData.length} diagnoses seeded`);

  // Seed Medicine Catalog
  console.log('📝 Seeding medicine catalog...');
  for (const medicine of commonMedicinesData) {
    await prisma.medicineCatalog.upsert({
      where: { code: medicine.code },
      update: {},
      create: medicine,
    });
  }
  console.log(`✅ ${commonMedicinesData.length} medicines seeded`);

  // Seed Lab Test Catalog
  console.log('📝 Seeding lab test catalog...');
  for (const test of labTestCatalogData) {
    await prisma.testCatalog.upsert({
      where: { testName: test.testName },
      update: {},
      create: test,
    });
  }
  console.log(`✅ ${labTestCatalogData.length} lab tests seeded`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start the application');
  console.log('2. Complete hospital profile setup');
  console.log('3. Create your first admin account');
  console.log('\n⚠️  No default admin user is created - use the setup wizard!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
