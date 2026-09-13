import { describe, it, expect } from 'vitest';
import {
  BACKUP_KEYS,
  BACKUP_VERSION,
  collectBackup,
  restoreBackup,
} from '../src/lib/backup';

const NOW = '2026-09-13T12:00:00.000Z';

class MemStorage implements Storage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  get length() { return this.m.size; }
}

describe('backup — collect', () => {
  it('captures every existing valid entry with metadata', () => {
    const s = new MemStorage();
    s.setItem('noxifera_projects', JSON.stringify([{ id: 'p1' }]));
    s.setItem('noxifera-stack-v2', JSON.stringify({ goal: 'faceless', budget: 'pro', picks: {} }));
    const b = collectBackup(NOW, s);
    expect(b.app).toBe('noxifera');
    expect(b.version).toBe(BACKUP_VERSION);
    expect(b.exportedAt).toBe(NOW);
    expect((b.data as Record<string, unknown>)['noxifera_projects']).toEqual([{ id: 'p1' }]);
    expect((b.data as Record<string, unknown>)['noxifera-stack-v2']).toEqual({ goal: 'faceless', budget: 'pro', picks: {} });
  });

  it('skips missing, corrupt and wrong-shaped entries without failing', () => {
    const s = new MemStorage();
    s.setItem('noxifera_projects', 'not-json'); // corrupt
    s.setItem('noxifera_bookmarks', JSON.stringify({ not: 'an array' })); // wrong shape
    s.setItem('noxifera-stack-v2', JSON.stringify([1, 2])); // wrong shape for object key
    const b = collectBackup(NOW, s);
    expect(b.data).toBeUndefined();
  });

  it('covers exactly the known user-data keys', () => {
    expect(BACKUP_KEYS).toHaveLength(9);
  });
});

describe('backup — restore', () => {
  it('round-trips a collected backup', () => {
    const s1 = new MemStorage();
    s1.setItem('noxifera_projects', JSON.stringify([{ id: 'p1' }]));
    s1.setItem('noxifera_workflows', JSON.stringify([{ id: 'w1' }]));
    const backup = collectBackup(NOW, s1);

    const s2 = new MemStorage();
    const res = restoreBackup(backup, s2);
    expect(res.restored.sort()).toEqual(['noxifera_projects', 'noxifera_workflows']);
    expect(res.skipped).toEqual([]);
    expect(s2.getItem('noxifera_projects')).toBe(s1.getItem('noxifera_projects'));
  });

  it('skips unknown keys and wrong shapes, keeps valid ones', () => {
    const s = new MemStorage();
    const res = restoreBackup(
      {
        data: {
          noxifera_projects: [{ id: 'ok' }],
          'noxifera_evil': [1],
          noxifera_bookmarks: { bad: true },
          noxifera_optimizer: 'string',
        },
      },
      s
    );
    expect(res.restored).toEqual(['noxifera_projects']);
    expect(res.skipped.sort()).toEqual(['noxifera_bookmarks', 'noxifera_evil', 'noxifera_optimizer']);
    expect(s.getItem('noxifera_projects')).toBe(JSON.stringify([{ id: 'ok' }]));
    expect(s.getItem('noxifera_bookmarks')).toBeNull();
  });

  it('rejects non-objects and backups without a data section', () => {
    expect(restoreBackup(null, new MemStorage()).restored).toEqual([]);
    expect(restoreBackup('text', new MemStorage()).restored).toEqual([]);
    expect(restoreBackup({ app: 'noxifera' }, new MemStorage()).restored).toEqual([]);
    expect(restoreBackup({ data: null }, new MemStorage()).restored).toEqual([]);
  });
});
