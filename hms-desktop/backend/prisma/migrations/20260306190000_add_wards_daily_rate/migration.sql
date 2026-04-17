-- Add daily_rate to wards (optional, for per-ward daily charge)
ALTER TABLE "wards" ADD COLUMN IF NOT EXISTS "daily_rate" DECIMAL(10,2);
