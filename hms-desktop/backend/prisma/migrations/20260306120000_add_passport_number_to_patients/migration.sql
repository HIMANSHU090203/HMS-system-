-- Add passport_number for foreign patients (optional, unique)
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "passport_number" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "patients_passport_number_key" ON "patients"("passport_number") WHERE "passport_number" IS NOT NULL;
