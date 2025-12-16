-- Remove unused database models
-- This migration removes 4 unused models from the database:
-- 1. SystemConfig
-- 2. Medicine (deprecated, replaced by MedicineCatalog)
-- 3. DiagnosisLink
-- 4. PrescriptionTemplate

-- Drop foreign key constraints first (only if tables exist)
DO $$ 
BEGIN
    -- Drop constraints for diagnosis_links if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'diagnosis_links') THEN
        ALTER TABLE "diagnosis_links" DROP CONSTRAINT IF EXISTS "diagnosis_links_consultation_id_fkey";
        ALTER TABLE "diagnosis_links" DROP CONSTRAINT IF EXISTS "diagnosis_links_diagnosis_id_fkey";
    END IF;
    
    -- Drop constraints for prescription_templates if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'prescription_templates') THEN
        ALTER TABLE "prescription_templates" DROP CONSTRAINT IF EXISTS "prescription_templates_doctor_id_fkey";
    END IF;
END $$;

-- Drop the unused tables (IF EXISTS ensures no error if table doesn't exist)
DROP TABLE IF EXISTS "system_config";
DROP TABLE IF EXISTS "medicines";
DROP TABLE IF EXISTS "diagnosis_links";
DROP TABLE IF EXISTS "prescription_templates";
