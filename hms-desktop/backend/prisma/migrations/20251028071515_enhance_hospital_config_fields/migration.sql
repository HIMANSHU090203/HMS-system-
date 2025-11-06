/*
  Warnings:

  - You are about to drop the column `default_consultation_duration` on the `hospital_config` table. All the data in the column will be lost.
  - You are about to drop the column `license_number` on the `hospital_config` table. All the data in the column will be lost.
  - You are about to drop the column `registration_number` on the `hospital_config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "hospital_config" DROP COLUMN "default_consultation_duration",
DROP COLUMN "license_number",
DROP COLUMN "registration_number",
ADD COLUMN     "default_doctor_consultation_duration" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "hospital_license_number" TEXT,
ALTER COLUMN "country" DROP DEFAULT;
