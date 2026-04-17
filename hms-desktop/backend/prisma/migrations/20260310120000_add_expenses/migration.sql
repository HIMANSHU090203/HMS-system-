-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExpenseCategory') THEN
    CREATE TYPE "ExpenseCategory" AS ENUM (
      'SALARY',
      'ELECTRICITY',
      'RENT',
      'MAINTENANCE',
      'EQUIPMENT',
      'SUPPLIES',
      'OTHER'
    );
  END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "expenses" (
  "id" TEXT NOT NULL,
  "category" "ExpenseCategory" NOT NULL,
  "description" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "expense_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "paid_at" TIMESTAMP(3),
  "user_id" TEXT,
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "expenses_expense_date_idx" ON "expenses"("expense_date");
CREATE INDEX IF NOT EXISTS "expenses_category_idx" ON "expenses"("category");
CREATE INDEX IF NOT EXISTS "expenses_payment_status_idx" ON "expenses"("payment_status");
CREATE INDEX IF NOT EXISTS "expenses_user_id_idx" ON "expenses"("user_id");

-- Foreign Keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'expenses_user_id_fkey'
  ) THEN
    ALTER TABLE "expenses"
      ADD CONSTRAINT "expenses_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'expenses_created_by_fkey'
  ) THEN
    ALTER TABLE "expenses"
      ADD CONSTRAINT "expenses_created_by_fkey"
      FOREIGN KEY ("created_by") REFERENCES "users"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

