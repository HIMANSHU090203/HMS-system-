-- AlterTable
ALTER TABLE "consultations" ADD COLUMN "held_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "lab_tests" ADD COLUMN "consultation_id" TEXT,
ADD COLUMN "appointment_id" TEXT;

-- CreateIndex
CREATE INDEX "lab_tests_consultation_id_idx" ON "lab_tests"("consultation_id");

-- CreateIndex
CREATE INDEX "lab_tests_appointment_id_idx" ON "lab_tests"("appointment_id");

-- AddForeignKey
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
