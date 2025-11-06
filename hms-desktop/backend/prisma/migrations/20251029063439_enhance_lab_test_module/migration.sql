-- AlterTable
ALTER TABLE "lab_tests" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "performed_by" TEXT,
ADD COLUMN     "report_file" TEXT;

-- AlterTable
ALTER TABLE "test_catalog" ADD COLUMN     "category" TEXT,
ADD COLUMN     "reference_range" TEXT,
ADD COLUMN     "units" TEXT;

-- CreateTable
CREATE TABLE "technician_test_selections" (
    "id" TEXT NOT NULL,
    "technician_id" TEXT NOT NULL,
    "test_catalog_id" TEXT NOT NULL,
    "lab_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technician_test_selections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "technician_test_selections_technician_id_test_catalog_id_key" ON "technician_test_selections"("technician_id", "test_catalog_id");

-- AddForeignKey
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_test_selections" ADD CONSTRAINT "technician_test_selections_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_test_selections" ADD CONSTRAINT "technician_test_selections_test_catalog_id_fkey" FOREIGN KEY ("test_catalog_id") REFERENCES "test_catalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
