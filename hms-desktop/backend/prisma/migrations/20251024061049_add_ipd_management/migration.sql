/*
  Warnings:

  - You are about to drop the column `items` on the `inpatient_bills` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ward_id,bed_number]` on the table `beds` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `admitted_by` to the `admissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `inpatient_bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lab_charges` to the `inpatient_bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `other_charges` to the `inpatient_bills` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('MORNING', 'AFTERNOON', 'NIGHT', 'GENERAL');

-- AlterEnum
ALTER TYPE "AdmissionStatus" ADD VALUE 'ABSENT_WITHOUT_LEAVE';

-- AlterEnum
ALTER TYPE "AdmissionType" ADD VALUE 'OBSERVATION';

-- AlterEnum
ALTER TYPE "BedType" ADD VALUE 'ISOLATION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'NURSE';
ALTER TYPE "UserRole" ADD VALUE 'WARD_MANAGER';
ALTER TYPE "UserRole" ADD VALUE 'IPD_DOCTOR';
ALTER TYPE "UserRole" ADD VALUE 'NURSING_SUPERVISOR';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WardType" ADD VALUE 'CARDIAC';
ALTER TYPE "WardType" ADD VALUE 'NEUROLOGY';
ALTER TYPE "WardType" ADD VALUE 'ORTHOPEDIC';

-- AlterTable
ALTER TABLE "admissions" ADD COLUMN     "admitted_by" TEXT NOT NULL,
ADD COLUMN     "discharge_notes" TEXT,
ADD COLUMN     "discharged_by" TEXT;

-- AlterTable
ALTER TABLE "beds" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "inpatient_bills" DROP COLUMN "items",
ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "lab_charges" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "other_charges" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "paid_amount" DECIMAL(10,2),
ADD COLUMN     "payment_mode" "PaymentMode";

-- AlterTable
ALTER TABLE "wards" ADD COLUMN     "description" TEXT,
ADD COLUMN     "floor" TEXT;

-- CreateTable
CREATE TABLE "daily_rounds" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "round_date" TIMESTAMP(3) NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "treatment" TEXT NOT NULL,
    "notes" TEXT,
    "next_round_date" TIMESTAMP(3),
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_signs" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "recorded_by" TEXT NOT NULL,
    "temperature" DECIMAL(4,1),
    "blood_pressure" TEXT,
    "heart_rate" INTEGER,
    "respiratory_rate" INTEGER,
    "oxygen_saturation" DECIMAL(4,1),
    "weight" DECIMAL(5,2),
    "height" DECIMAL(5,2),
    "notes" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nursing_shifts" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "shift_type" "ShiftType" NOT NULL,
    "shift_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "notes" TEXT,
    "medications" JSONB,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nursing_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discharge_summaries" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "admission_date" TIMESTAMP(3) NOT NULL,
    "discharge_date" TIMESTAMP(3) NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "treatment_given" TEXT NOT NULL,
    "procedures_performed" TEXT,
    "medications_prescribed" TEXT,
    "follow_up_instructions" TEXT,
    "next_appointment_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discharge_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discharge_summaries_admission_id_key" ON "discharge_summaries"("admission_id");

-- CreateIndex
CREATE UNIQUE INDEX "beds_ward_id_bed_number_key" ON "beds"("ward_id", "bed_number");

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_admitted_by_fkey" FOREIGN KEY ("admitted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_discharged_by_fkey" FOREIGN KEY ("discharged_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_rounds" ADD CONSTRAINT "daily_rounds_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_rounds" ADD CONSTRAINT "daily_rounds_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inpatient_bills" ADD CONSTRAINT "inpatient_bills_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_shifts" ADD CONSTRAINT "nursing_shifts_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_shifts" ADD CONSTRAINT "nursing_shifts_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discharge_summaries" ADD CONSTRAINT "discharge_summaries_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discharge_summaries" ADD CONSTRAINT "discharge_summaries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discharge_summaries" ADD CONSTRAINT "discharge_summaries_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
