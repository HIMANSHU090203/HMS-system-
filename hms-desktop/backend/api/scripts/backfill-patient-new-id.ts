/**
 * @deprecated The Patient model no longer has `newId`. Readable patient IDs live in
 * `Patient.id` (see migration `switch_patient_id_to_readable`). Do not run this script.
 *
 * Kept so historical docs / muscle memory still resolve to a file; exits immediately.
 */
async function main(): Promise<void> {
  console.log(
    'Obsolete: backfill-patient-new-id — Patient.id is already the readable identifier (newId column removed).'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
