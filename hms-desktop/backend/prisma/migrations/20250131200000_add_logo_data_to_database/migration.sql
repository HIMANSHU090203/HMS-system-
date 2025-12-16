-- Add logoData and logoMimeType fields to hospital_config table
-- This migration stores logo images directly in the database as binary data (PNG, JPEG, etc.)

-- Add logo_data column (BYTEA type for storing binary image data - PNG, JPEG, etc.)
ALTER TABLE "hospital_config" ADD COLUMN IF NOT EXISTS "logo_data" BYTEA;

-- Add logo_mime_type column (VARCHAR for storing MIME type like image/png, image/jpeg)
ALTER TABLE "hospital_config" ADD COLUMN IF NOT EXISTS "logo_mime_type" VARCHAR(255);

