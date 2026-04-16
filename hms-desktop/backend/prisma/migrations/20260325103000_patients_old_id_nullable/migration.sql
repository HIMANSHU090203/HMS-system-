-- Make old_id column nullable on patients table
ALTER TABLE "patients" ALTER COLUMN "old_id" DROP NOT NULL;
