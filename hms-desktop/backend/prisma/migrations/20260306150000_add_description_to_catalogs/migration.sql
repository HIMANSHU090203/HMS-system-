-- AlterTable
ALTER TABLE "allergy_catalog" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- AlterTable
ALTER TABLE "chronic_condition_catalog" ADD COLUMN IF NOT EXISTS "description" TEXT;
