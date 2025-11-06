-- AlterTable: Add qualifications and registrationNumber to users table
ALTER TABLE "users" ADD COLUMN "qualifications" TEXT,
ADD COLUMN "registration_number" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "email" TEXT;

-- AlterTable: Add temperature, bloodPressure, and followUpDate to consultations table
ALTER TABLE "consultations" ADD COLUMN "temperature" DECIMAL(4,1),
ADD COLUMN "blood_pressure" TEXT,
ADD COLUMN "follow_up_date" TIMESTAMP(3);




