-- AlterTable
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "new_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "patients_new_id_key" ON "patients"("new_id");
