-- AlterTable: Add fee column to consultations table (consultation fee in base currency)
ALTER TABLE "consultations" ADD COLUMN IF NOT EXISTS "fee" DECIMAL(10,2) NOT NULL DEFAULT 0;
