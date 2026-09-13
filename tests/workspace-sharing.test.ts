import { describe, expect, it } from 'vitest';
import {
  decodeSharePayload,
  encodeSharePayload,
  importSharedStack,
  importSharedWorkflow,
  renameComparison,
  saveComparison,
  saveStackEntry,
  saveWorkflowEntry,
  updateStackEntry,
  updateWorkflowEntry,
} from '@/lib/workspace';

function memStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    key: (i: number) => [...m.keys()][i] ?? null,
    removeItem: (k: string) => void m.delete(k),
    setItem: (k: string, v: string) => void m.set(k, v),
  };
}

describe('workspace share codec', () => {
  it('round-trips a stack without id/timestamps and stays URL-safe', () => {
    const s = memStorage();
    const [entry] = saveStackEntry(
      { name: 'My stack', goal: 'shorts', budget: 'free', picks: { 0: 'capcut', 5: 'elevenlabs' }, notes: 'hi' },
      s
    );
    const code = encodeSharePayload('stack', entry);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    const payload = decodeSharePayload(code);
    expect(payload?.kind).toBe('stack');
    expect(payload?.data.name).toBe('My stack');
    expect(payload?.data).not.toHaveProperty('id');
    expect(payload?.data).not.toHaveProperty('savedAt');
  });

  it('rejects garbage, wrong version, and oversized codes', () => {
    expect(decodeSharePayload('!!!not-base64!!!')).toBeNull();
    expect(decodeSharePayload('x'.repeat(9000))).toBeNull();
    expect(decodeSharePayload('')).toBeNull();
  });

  it('imports a shared stack with a fresh id and keeps unknown slugs', () => {
    const s = memStorage();
    const list = importSharedStack(
      { name: 'Shared', goal: 'weird-goal', budget: 'pro', picks: { 0: 'no-such-tool' } },
      s
    );
    expect(list).not.toBeNull();
    expect(list![0].picks[0]).toBe('no-such-tool');
    expect(list![0].id).toBeTruthy();
  });

  it('refuses to import a stack without a name', () => {
    expect(importSharedStack({ goal: 'shorts' }, memStorage())).toBeNull();
  });

  it('imports a shared custom workflow with steps validated', () => {
    const s = memStorage();
    const list = importSharedWorkflow(
      {
        name: 'Pipe',
        slug: 'custom',
        picks: {},
        steps: [
          { id: 'a', title: 'Voice' },
          { id: '', title: '' },
        ],
      },
      s
    );
    expect(list?.[0].steps).toHaveLength(1);
    expect(list?.[0].steps?.[0].title).toBe('Voice');
  });
});

describe('workspace editors', () => {
  it('updateStackEntry patches picks/goal and stamps updatedAt', () => {
    const s = memStorage();
    const [entry] = saveStackEntry({ name: 'S', goal: 'shorts', budget: 'free', picks: {} }, s);
    const [next] = updateStackEntry(entry.id, { picks: { 0: 'capcut' }, goal: 'longform' }, s);
    expect(next.picks[0]).toBe('capcut');
    expect(next.goal).toBe('longform');
    expect(next.updatedAt).toBeTruthy();
  });

  it('updateStackEntry rejects blank renames', () => {
    const s = memStorage();
    const [entry] = saveStackEntry({ name: 'S', goal: 'shorts', budget: 'free', picks: {} }, s);
    const [next] = updateStackEntry(entry.id, { name: '   ' }, s);
    expect(next.name).toBe('S');
  });

  it('updateWorkflowEntry patches custom steps', () => {
    const s = memStorage();
    const [entry] = saveWorkflowEntry({ name: 'W', slug: 'custom', picks: {} }, s);
    const [next] = updateWorkflowEntry(
      entry.id,
      { steps: [{ id: 's1', title: 'Script', toolSlug: 'chatgpt' }] },
      s
    );
    expect(next.steps?.[0].toolSlug).toBe('chatgpt');
  });

  it('saveWorkflowEntry preserves steps for custom workflows', () => {
    const s = memStorage();
    const [entry] = saveWorkflowEntry(
      { name: 'W', slug: 'custom', picks: {}, steps: [{ id: 's1', title: 'Edit' }] },
      s
    );
    expect(entry.steps?.[0].title).toBe('Edit');
  });

  it('renameComparison renames without touching slugs', () => {
    const s = memStorage();
    saveComparison('Old', ['a', 'b'], s);
    const all = saveComparison('Second', ['c', 'd'], s);
    const renamed = renameComparison(all.find((c) => c.name === 'Old')!.id, 'New', s);
    expect(renamed.find((c) => c.name === 'New')?.slugs).toEqual(['a', 'b']);
    expect(renameComparison('missing', 'X', s)).toHaveLength(2);
  });
});
