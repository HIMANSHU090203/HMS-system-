-- DropForeignKey
ALTER TABLE "public"."medicine_transactions" DROP CONSTRAINT "medicine_transactions_medicine_id_fkey";

-- CreateTable
CREATE TABLE "diagnosis_catalog" (
    "id" TEXT NOT NULL,
    "icdCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnosis_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnosis_links" (
    "id" TEXT NOT NULL,
    "consultation_id" TEXT NOT NULL,
    "diagnosis_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "diagnosis_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergy_catalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allergy_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_allergies" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "allergy_id" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "onset_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_allergies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chronic_condition_catalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chronic_condition_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_chronic_conditions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "condition_id" TEXT NOT NULL,
    "diagnosis_date" TIMESTAMP(3) NOT NULL,
    "current_status" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_chronic_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_catalog" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "manufacturer" TEXT,
    "category" TEXT NOT NULL,
    "therapeutic_class" TEXT,
    "atc_code" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "expiry_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicine_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diagnosis_catalog_icdCode_key" ON "diagnosis_catalog"("icdCode");

-- CreateIndex
CREATE UNIQUE INDEX "diagnosis_links_consultation_id_diagnosis_id_key" ON "diagnosis_links"("consultation_id", "diagnosis_id");

-- CreateIndex
CREATE UNIQUE INDEX "allergy_catalog_code_key" ON "allergy_catalog"("code");

-- CreateIndex
CREATE UNIQUE INDEX "patient_allergies_patient_id_allergy_id_key" ON "patient_allergies"("patient_id", "allergy_id");

-- CreateIndex
CREATE UNIQUE INDEX "chronic_condition_catalog_code_key" ON "chronic_condition_catalog"("code");

-- CreateIndex
CREATE UNIQUE INDEX "medicine_catalog_code_key" ON "medicine_catalog"("code");

-- AddForeignKey
ALTER TABLE "diagnosis_links" ADD CONSTRAINT "diagnosis_links_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "consultations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnosis_links" ADD CONSTRAINT "diagnosis_links_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "diagnosis_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_allergy_id_fkey" FOREIGN KEY ("allergy_id") REFERENCES "allergy_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_chronic_conditions" ADD CONSTRAINT "patient_chronic_conditions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_chronic_conditions" ADD CONSTRAINT "patient_chronic_conditions_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "chronic_condition_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine_transactions" ADD CONSTRAINT "medicine_transactions_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicine_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
