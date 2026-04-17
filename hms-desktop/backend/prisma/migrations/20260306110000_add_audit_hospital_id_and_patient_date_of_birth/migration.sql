-- 1. Add hospital_id to audit_logs (required by Prisma schema for multi-tenancy)
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "hospital_id" TEXT;

-- 2. Patients: add date_of_birth and aadhar_card_number; migrate from age then drop age
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "date_of_birth" TIMESTAMP(3);
-- Backfill date_of_birth from existing age (approximate: age years before today)
UPDATE "patients" SET "date_of_birth" = (CURRENT_DATE - (age::text || ' years')::interval)::timestamp WHERE "date_of_birth" IS NULL AND "age" IS NOT NULL;
-- Default for any row that had no age
UPDATE "patients" SET "date_of_birth" = CURRENT_TIMESTAMP WHERE "date_of_birth" IS NULL;
ALTER TABLE "patients" ALTER COLUMN "date_of_birth" SET NOT NULL;

-- Drop age only if column exists (in case migration is re-run or age already dropped)
ALTER TABLE "patients" DROP COLUMN IF EXISTS "age";

-- Add aadhar_card_number (optional, unique per schema)
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "aadhar_card_number" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "patients_aadhar_card_number_key" ON "patients"("aadhar_card_number");
