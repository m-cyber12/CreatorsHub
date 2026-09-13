/**
 * Local data backup & restore (upgrade #23).
 *
 * The whole platform is client-side by design (ops doc §22/§38), so the
 * browser is the database. This module makes that durable: one JSON file
 * captures every user-data storage key, and restoring only writes back
 * entries that pass validation — a bad file can never corrupt good data.
 *
 * Format (v1): { app: 'noxifera', version: 1, exportedAt, data: { <key>: ... } }
 */

export const BACKUP_VERSION = 1;

/** All user-data storage keys the app uses. */
export const BACKUP_KEYS = [
  'noxifera_projects',
  'noxifera_workflows',
  'noxifera_saved_stacks',
  'noxifera_advisor_saves',
  'noxifera_optimizer',
  'noxifera_bookmarks',
  'noxifera_follows',
  'noxifera_bench_requests',
  'noxifera-stack-v2',
] as const;

export type BackupKey = (typeof BACKUP_KEYS)[number];

/** Only the current stack-builder state is an object; every other key is an array. */
const OBJECT_KEYS = new Set<string>(['noxifera-stack-v2']);

export function isBackupKey(k: string): k is BackupKey {
  return (BACKUP_KEYS as readonly string[]).includes(k);
}

export function isValidValue(key: string, v: unknown): boolean {
  if (OBJECT_KEYS.has(key)) return typeof v === 'object' && v !== null && !Array.isArray(v);
  return Array.isArray(v);
}

/** Read every existing, valid entry from storage into a backup object. */
export function collectBackup(
  now: string = new Date().toISOString(),
  storage: Storage = globalThis.localStorage
): Record<string, unknown> {
  const out: Record<string, unknown> = { app: 'noxifera', version: BACKUP_VERSION, exportedAt: now };
  const data: Record<string, unknown> = {};
  for (const k of BACKUP_KEYS) {
    try {
      const raw = storage.getItem(k);
      if (raw == null) continue;
      const v: unknown = JSON.parse(raw);
      if (isValidValue(k, v)) data[k] = v;
    } catch {
      /* corrupt entry — leave it out, never crash the backup */
    }
  }
  if (Object.keys(data).length > 0) out.data = data;
  return out;
}

export interface RestoreResult {
  /** Storage keys written back. */
  restored: string[];
  /** Keys skipped (unknown, invalid shape, or storage error). */
  skipped: string[];
}

/**
 * Restore a parsed backup. Strict by construction: unknown keys and
 * wrong-shaped values are skipped, valid ones replace the stored value.
 */
export function restoreBackup(input: unknown, storage: Storage = globalThis.localStorage): RestoreResult {
  const res: RestoreResult = { restored: [], skipped: [] };
  if (typeof input !== 'object' || input === null) return res;
  const data = (input as Record<string, unknown>).data;
  if (typeof data !== 'object' || data === null) return res;
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (!isBackupKey(k) || !isValidValue(k, v)) {
      res.skipped.push(k);
      continue;
    }
    try {
      storage.setItem(k, JSON.stringify(v));
      res.restored.push(k);
    } catch {
      res.skipped.push(k);
    }
  }
  return res;
}
