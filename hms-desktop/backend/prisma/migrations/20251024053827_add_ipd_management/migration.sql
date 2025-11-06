/*
  Warnings:

  - You are about to drop the column `admitted_by` on the `admissions` table. All the data in the column will be lost.
  - You are about to drop the column `discharged_by` on the `admissions` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `inpatient_bills` table. All the data in the column will be lost.
  - You are about to drop the column `paid_amount` on the `inpatient_bills` table. All the data in the column will be lost.
  - You are about to drop the column `payment_mode` on the `inpatient_bills` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `wards` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."admissions" DROP CONSTRAINT "admissions_admitted_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."admissions" DROP CONSTRAINT "admissions_discharged_by_fkey";

-- DropIndex
DROP INDEX "public"."beds_ward_id_bed_number_key";

-- AlterTable
ALTER TABLE "admissions" DROP COLUMN "admitted_by",
DROP COLUMN "discharged_by";

-- AlterTable
ALTER TABLE "inpatient_bills" DROP COLUMN "notes",
DROP COLUMN "paid_amount",
DROP COLUMN "payment_mode";

-- AlterTable
ALTER TABLE "wards" DROP COLUMN "description";
