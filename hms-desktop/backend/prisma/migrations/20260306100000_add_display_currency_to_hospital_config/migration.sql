-- Add display_currency (required by Prisma schema; setup-status fails without it)
ALTER TABLE "hospital_config" ADD COLUMN IF NOT EXISTS "display_currency" VARCHAR(10) DEFAULT 'INR';

-- Add default_consultation_fee (in schema but never added by migrations)
ALTER TABLE "hospital_config" ADD COLUMN IF NOT EXISTS "default_consultation_fee" DECIMAL(10,2);
