-- Phase 2: Switch patients.id from CUID to human-readable (new_id).
-- Prerequisite: new_id column backfilled (run api/scripts/backfill-patient-new-id.ts first).

-- 1. Drop foreign keys referencing patients(id)
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_patient_id_fkey";
ALTER TABLE "consultations" DROP CONSTRAINT IF EXISTS "consultations_patient_id_fkey";
ALTER TABLE "prescriptions" DROP CONSTRAINT IF EXISTS "prescriptions_patient_id_fkey";
ALTER TABLE "lab_tests" DROP CONSTRAINT IF EXISTS "lab_tests_patient_id_fkey";
ALTER TABLE "bills" DROP CONSTRAINT IF EXISTS "bills_patient_id_fkey";
ALTER TABLE "patient_allergies" DROP CONSTRAINT IF EXISTS "patient_allergies_patient_id_fkey";
ALTER TABLE "patient_chronic_conditions" DROP CONSTRAINT IF EXISTS "patient_chronic_conditions_patient_id_fkey";
ALTER TABLE "admissions" DROP CONSTRAINT IF EXISTS "admissions_patient_id_fkey";
ALTER TABLE "inpatient_bills" DROP CONSTRAINT IF EXISTS "inpatient_bills_patient_id_fkey";
ALTER TABLE "discharge_summaries" DROP CONSTRAINT IF EXISTS "discharge_summaries_patient_id_fkey";
ALTER TABLE "surgeries" DROP CONSTRAINT IF EXISTS "surgeries_patient_id_fkey";

-- 2. Update child tables: set patient_id to new_id (join on current id)
UPDATE "appointments" a SET patient_id = p.new_id FROM "patients" p WHERE p.id = a.patient_id;
UPDATE "consultations" c SET patient_id = p.new_id FROM "patients" p WHERE p.id = c.patient_id;
UPDATE "prescriptions" pr SET patient_id = p.new_id FROM "patients" p WHERE p.id = pr.patient_id;
UPDATE "lab_tests" l SET patient_id = p.new_id FROM "patients" p WHERE p.id = l.patient_id;
UPDATE "bills" b SET patient_id = p.new_id FROM "patients" p WHERE p.id = b.patient_id;
UPDATE "patient_allergies" pa SET patient_id = p.new_id FROM "patients" p WHERE p.id = pa.patient_id;
UPDATE "patient_chronic_conditions" pc SET patient_id = p.new_id FROM "patients" p WHERE p.id = pc.patient_id;
UPDATE "admissions" ad SET patient_id = p.new_id FROM "patients" p WHERE p.id = ad.patient_id;
UPDATE "inpatient_bills" ib SET patient_id = p.new_id FROM "patients" p WHERE p.id = ib.patient_id;
UPDATE "discharge_summaries" ds SET patient_id = p.new_id FROM "patients" p WHERE p.id = ds.patient_id;
UPDATE "surgeries" s SET patient_id = p.new_id FROM "patients" p WHERE p.id = s.patient_id;

-- 3. Swap id and new_id on patients
ALTER TABLE "patients" DROP CONSTRAINT "patients_pkey";
ALTER TABLE "patients" RENAME COLUMN "id" TO "old_id";
ALTER TABLE "patients" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "patients" ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");

-- 4. Re-add foreign keys
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bills" ADD CONSTRAINT "bills_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "patient_chronic_conditions" ADD CONSTRAINT "patient_chronic_conditions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inpatient_bills" ADD CONSTRAINT "inpatient_bills_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discharge_summaries" ADD CONSTRAINT "discharge_summaries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "surgeries" ADD CONSTRAINT "surgeries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
