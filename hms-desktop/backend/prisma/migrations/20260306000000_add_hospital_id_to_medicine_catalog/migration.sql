-- AlterTable: Add optional hospital_id to medicine_catalog for multi-tenancy
ALTER TABLE "medicine_catalog" ADD COLUMN IF NOT EXISTS "hospital_id" TEXT;

-- AddForeignKey
ALTER TABLE "medicine_catalog" ADD CONSTRAINT "medicine_catalog_hospital_id_fkey" 
  FOREIGN KEY ("hospital_id") REFERENCES "hospital_config"("id") ON DELETE SET NULL ON UPDATE CASCADE;
