/**
 * Shared rules for how many physical units (tablets, etc.) a prescription line represents
 * when dispensing — used by dispense flow and inventory reconciliation.
 */

export function dosesPerDayFromFrequency(frequency: string): number {
  const raw = (frequency || '').trim();
  if (!raw) return 1;

  const compact = raw.replace(/\s/g, '');
  if (/^\d+(-\d+)+$/.test(compact)) {
    let sum = 0;
    for (const p of compact.split('-')) {
      const n = parseInt(p, 10);
      if (!Number.isNaN(n)) sum += n;
    }
    return Math.max(1, sum);
  }

  const upper = compact.toUpperCase();
  const abbrev: Record<string, number> = {
    OD: 1,
    ODS: 1,
    BD: 2,
    BID: 2,
    TDS: 3,
    TID: 3,
    QID: 4,
    QDS: 4,
  };
  if (abbrev[upper] !== undefined) return abbrev[upper];

  const nums = raw.match(/\d+/g);
  if (nums?.length) {
    const n = parseInt(nums[0], 10);
    if (!Number.isNaN(n) && n > 0) return Math.min(n, 24);
  }

  return 1;
}

export function computeUnitsToDispenseForLine(item: {
  quantity: number;
  frequency: string;
  duration: number;
}): number {
  const perDose = Math.max(1, item.quantity);
  const days = Math.max(1, item.duration);
  return perDose * dosesPerDayFromFrequency(item.frequency) * days;
}
