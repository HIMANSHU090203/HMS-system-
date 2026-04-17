-- AlterTable
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "patient_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "patients_patient_number_key" ON "patients"("patient_number");
