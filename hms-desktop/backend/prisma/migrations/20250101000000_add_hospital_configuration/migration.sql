-- CreateTable
CREATE TABLE "hospital_config" (
    "id" TEXT NOT NULL,
    "hospital_name" TEXT NOT NULL,
    "hospital_code" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "tax_id" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "tax_rate" DECIMAL(5,2),
    "appointment_slot_duration" INTEGER NOT NULL DEFAULT 30,
    "working_hours" JSONB,
    "modules_enabled" JSONB,
    "lab_tests_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ipd_enabled" BOOLEAN NOT NULL DEFAULT true,
    "billing_enabled" BOOLEAN NOT NULL DEFAULT true,
    "patient_custom_fields" JSONB,
    "default_payment_mode" "PaymentMode",
    "enable_insurance" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_test_config" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "test_category" TEXT NOT NULL,
    "category_enabled" BOOLEAN NOT NULL DEFAULT true,
    "default_price" DECIMAL(10,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_test_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_config" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "category_enabled" BOOLEAN NOT NULL DEFAULT true,
    "default_low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "enable_auto_order" BOOLEAN NOT NULL DEFAULT false,
    "auto_order_threshold" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicine_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospital_config_hospital_code_key" ON "hospital_config"("hospital_code");
