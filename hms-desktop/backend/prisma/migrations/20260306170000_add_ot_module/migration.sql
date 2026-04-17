-- CreateEnum
CREATE TYPE "OTStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLEANING');

-- CreateEnum
CREATE TYPE "SurgeryStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "SurgeryPriority" AS ENUM ('ELECTIVE', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "SurgeryTeamRole" AS ENUM ('SURGEON', 'ASSISTANT_SURGEON', 'ANESTHESIOLOGIST', 'SCRUB_NURSE', 'CIRCULATING_NURSE', 'TECHNICIAN');

-- CreateTable
CREATE TABLE "procedure_catalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "default_duration" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operation_theatres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "status" "OTStatus" NOT NULL DEFAULT 'AVAILABLE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operation_theatres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgeries" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "admission_id" TEXT,
    "operation_theatre_id" TEXT,
    "procedure_catalog_id" TEXT,
    "procedure_name" TEXT NOT NULL,
    "surgeon_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "status" "SurgeryStatus" NOT NULL DEFAULT 'SCHEDULED',
    "priority" "SurgeryPriority" NOT NULL DEFAULT 'ELECTIVE',
    "notes" TEXT,
    "anesthesia_type" TEXT,
    "complications" TEXT,
    "surgical_notes" TEXT,
    "implants_used" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surgeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surgery_teams" (
    "id" TEXT NOT NULL,
    "surgery_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "SurgeryTeamRole" NOT NULL,
    "is_lead" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surgery_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pre_operative_checklists" (
    "id" TEXT NOT NULL,
    "surgery_id" TEXT NOT NULL,
    "consent_signed" BOOLEAN NOT NULL DEFAULT false,
    "lab_tests_completed" BOOLEAN NOT NULL DEFAULT false,
    "anesthesia_clearance" BOOLEAN NOT NULL DEFAULT false,
    "blood_available" BOOLEAN NOT NULL DEFAULT false,
    "fasting_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "allergy_review" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_operative_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_operative_records" (
    "id" TEXT NOT NULL,
    "surgery_id" TEXT NOT NULL,
    "recovery_notes" TEXT,
    "complications" TEXT,
    "discharge_instructions" TEXT,
    "pain_level" INTEGER,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_operative_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ot_inventory_usage" (
    "id" TEXT NOT NULL,
    "surgery_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ot_inventory_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "procedure_catalog_code_key" ON "procedure_catalog"("code");

-- CreateIndex
CREATE UNIQUE INDEX "operation_theatres_hospital_id_name_key" ON "operation_theatres"("hospital_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "pre_operative_checklists_surgery_id_key" ON "pre_operative_checklists"("surgery_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_operative_records_surgery_id_key" ON "post_operative_records"("surgery_id");

-- CreateIndex
CREATE UNIQUE INDEX "surgery_teams_surgery_id_user_id_key" ON "surgery_teams"("surgery_id", "user_id");

-- AddForeignKey
ALTER TABLE "operation_theatres" ADD CONSTRAINT "operation_theatres_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospital_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_operation_theatre_id_fkey" FOREIGN KEY ("operation_theatre_id") REFERENCES "operation_theatres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_procedure_catalog_id_fkey" FOREIGN KEY ("procedure_catalog_id") REFERENCES "procedure_catalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_surgeon_id_fkey" FOREIGN KEY ("surgeon_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_teams" ADD CONSTRAINT "surgery_teams_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surgery_teams" ADD CONSTRAINT "surgery_teams_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_operative_checklists" ADD CONSTRAINT "pre_operative_checklists_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_operative_records" ADD CONSTRAINT "post_operative_records_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ot_inventory_usage" ADD CONSTRAINT "ot_inventory_usage_surgery_id_fkey" FOREIGN KEY ("surgery_id") REFERENCES "surgeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
