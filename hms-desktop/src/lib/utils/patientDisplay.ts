/**
 * Display ID for patients: patientNumber (name + "_" + last 4 of national ID) when available,
 * otherwise internal id. Use for display only; keep patient.id for APIs/keys.
 */
export function getDisplayPatientId(patient: { patientNumber?: string | null; id?: string } | null | undefined): string {
  if (!patient) return 'N/A';
  return (patient.patientNumber ?? patient.id ?? 'N/A').trim() || 'N/A';
}
