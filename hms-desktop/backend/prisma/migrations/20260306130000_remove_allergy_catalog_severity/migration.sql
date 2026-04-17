-- Remove catalog-level allergy severity.
-- Severity is patient-specific and stored in "patient_allergies"."severity".

ALTER TABLE "public"."allergy_catalog" DROP COLUMN "severity";

