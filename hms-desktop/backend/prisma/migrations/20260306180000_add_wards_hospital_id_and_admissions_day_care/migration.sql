-- Add hospital_id to wards (required by current schema; backfill from first hospital_config)
-- Add day-care columns to admissions

-- 1. Wards: add hospital_id column (nullable first for backfill)
ALTER TABLE "wards" ADD COLUMN IF NOT EXISTS "hospital_id" TEXT;

-- Backfill: set all existing wards to the first hospital config id
UPDATE "wards" SET "hospital_id" = (SELECT "id" FROM "hospital_config" LIMIT 1) WHERE "hospital_id" IS NULL;

-- Make hospital_id NOT NULL only when every ward has a value (required by Prisma schema)
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM "wards" WHERE "hospital_id" IS NULL) = 0 THEN
    ALTER TABLE "wards" ALTER COLUMN "hospital_id" SET NOT NULL;
  ELSE
    RAISE NOTICE 'Some wards have no hospital_id - add a hospital_config row and re-run migration or update wards manually';
  END IF;
END $$;

-- Drop old unique constraint on wards(name) if it exists (from 20251024044147)
DROP INDEX IF EXISTS "wards_name_key";

-- Add unique constraint (hospital_id, name)
CREATE UNIQUE INDEX IF NOT EXISTS "wards_hospital_id_name_key" ON "wards"("hospital_id", "name");

-- Add foreign key to hospital_config
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'wards_hospital_id_fkey'
  ) THEN
    ALTER TABLE "wards" ADD CONSTRAINT "wards_hospital_id_fkey"
      FOREIGN KEY ("hospital_id") REFERENCES "hospital_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'FK wards_hospital_id_fkey may already exist or hospital_config missing';
END $$;

-- 2. Admissions: add day-care columns
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "is_day_care" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "procedure_start_time" TIMESTAMP(3);
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "procedure_end_time" TIMESTAMP(3);
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "recovery_start_time" TIMESTAMP(3);
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "recovery_end_time" TIMESTAMP(3);
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "expected_discharge_time" TIMESTAMP(3);
ALTER TABLE "admissions" ADD COLUMN IF NOT EXISTS "home_support_available" BOOLEAN;
