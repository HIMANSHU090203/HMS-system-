-- Add logo_data and logo_mime_type columns to hospital_config table
-- Run this SQL directly in your PostgreSQL database

-- Add logo_data column (BYTEA type for storing binary image data - PNG, JPEG, etc.)
ALTER TABLE "hospital_config" ADD COLUMN IF NOT EXISTS "logo_data" BYTEA;

-- Add logo_mime_type column (VARCHAR for storing MIME type like image/png, image/jpeg)
ALTER TABLE "hospital_config" ADD COLUMN IF NOT EXISTS "logo_mime_type" VARCHAR(255);



























