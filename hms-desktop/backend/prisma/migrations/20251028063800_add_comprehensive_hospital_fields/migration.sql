/*
  Warnings:

  - You are about to drop the column `appointment_reminders` on the `hospital_config` table. All the data in the column will be lost.
  - You are about to drop the column `backup_frequency` on the `hospital_config` table. All the data in the column will be lost.
  - You are about to drop the column `data_retention_days` on the `hospital_config` table. All the data in the column will be lost.
  - You are about to drop the column `doctor_consultation_duration` on the `hospital_config` table. All the data in the column will be lost.
  - You are about to drop the column `email_notifications` on the `hospital_config` table. All the data in the column will be lost.
  - You are about to drop the column `enable_data_backup` on the `hospital_config` table. All the data in the column will be lost.
  - You are about to drop the column `privacy_policy_url` on the `hospital_config` table. All the data in the column will be lost.
  - You are about to drop the column `sms_notifications` on the `hospital_config` table. All the data in the column will be lost.
  - You are about to drop the column `terms_of_service_url` on the `hospital_config` table. All the data in the column will be lost.
  - You are about to drop the column `test_result_notifications` on the `hospital_config` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "hospital_config" DROP COLUMN "appointment_reminders",
DROP COLUMN "backup_frequency",
DROP COLUMN "data_retention_days",
DROP COLUMN "doctor_consultation_duration",
DROP COLUMN "email_notifications",
DROP COLUMN "enable_data_backup",
DROP COLUMN "privacy_policy_url",
DROP COLUMN "sms_notifications",
DROP COLUMN "terms_of_service_url",
DROP COLUMN "test_result_notifications",
ADD COLUMN     "default_consultation_duration" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "logo_url" TEXT,
ALTER COLUMN "country" SET DEFAULT 'USA';
