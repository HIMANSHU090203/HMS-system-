/**
 * One-time backfill: set patients.new_id = name_last4 (12-digit Aadhar or Passport).
 * Run from backend folder: npx ts-node api/scripts/backfill-patient-new-id.ts
 * Requires: new_id column already added (migration add_patient_new_id applied).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function computeNewId(
  name: string,
  aadharCardNumber?: string | null,
  passportNumber?: string | null
): string | null {
  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  if (!normalizedName) return null;

  let last4: string | null = null;
  if (aadharCardNumber && /^[0-9]{12}$/.test(aadharCardNumber.trim())) {
    last4 = aadharCardNumber.trim().slice(-4);
  } else if (passportNumber && passportNumber.trim().length >= 4) {
    last4 = passportNumber.trim().slice(-4).replace(/[^a-zA-Z0-9]/g, '');
    if (last4.length < 4) last4 = passportNumber.trim().slice(-4);
  }
  if (!last4) return null;

  return `${normalizedName}_${last4}`;
}

async function ensureUnique(
  base: string,
  usedInBatch: Set<string>,
  excludePatientId: string
): Promise<string> {
  let candidate = base;
  let suffix = 1;
  for (;;) {
    const existsInDb = await prisma.patient.findFirst({
      where: {
        newId: candidate,
        id: { not: excludePatientId },
      },
    });
    if (!existsInDb && !usedInBatch.has(candidate)) return candidate;
    suffix++;
    candidate = `${base}_${suffix}`;
  }
}

async function main() {
  console.log('Backfilling patients.new_id (name_last4)...');
  const patients = await prisma.patient.findMany({
    select: {
      id: true,
      name: true,
      aadharCardNumber: true,
      passportNumber: true,
      newId: true,
    },
  });
  console.log(`Found ${patients.length} patients.`);

  const usedInBatch = new Set<string>();
  let updated = 0;
  let skipped = 0;
  let noId = 0;

  for (const p of patients) {
    if (p.newId) {
      skipped++;
      usedInBatch.add(p.newId);
      continue;
    }
    const base = computeNewId(p.name, p.aadharCardNumber, p.passportNumber);
    if (!base) {
      // No Aadhar/Passport: use fallback normalizedname_0000 and ensure unique
      const normalizedName = p.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '') || 'patient';
      const fallback = `${normalizedName}_0000`;
      const unique = await ensureUnique(fallback, usedInBatch, p.id);
      await prisma.patient.update({
        where: { id: p.id },
        data: { newId: unique },
      });
      usedInBatch.add(unique);
      updated++;
      noId++;
      continue;
    }
    const unique = await ensureUnique(base, usedInBatch, p.id);
    await prisma.patient.update({
      where: { id: p.id },
      data: { newId: unique },
    });
    usedInBatch.add(unique);
    updated++;
  }

  console.log(`Done. Updated: ${updated}, Skipped (already had new_id): ${skipped}, Without national ID (fallback): ${noId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
