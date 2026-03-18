/**
 * Display ID for patients: patient.id is the human-readable id (name_last4 format).
 */
export function getDisplayPatientId(patient: { id?: string } | null | undefined): string {
  if (!patient) return 'N/A';
  return (patient.id ?? 'N/A').trim() || 'N/A';
}
