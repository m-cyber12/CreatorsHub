import { describe, it, expect } from 'vitest';
import { extractPriceChanges, type PriceHistoryRow } from '@/lib/updates';

const names = new Map([['opusclip', 'OpusClip']]);

function row(slug: string, price: string | null, date: string): PriceHistoryRow {
  return { tool_slug: slug, starting_price: price, noticed_at: `${date}T10:00:00.000Z` };
}

describe('extractPriceChanges', () => {
  it('emits from→to dated at the detection (newer) row', () => {
    const changes = extractPriceChanges(
      [row('opusclip', '$20/mo', '2026-09-10'), row('opusclip', '$15/mo', '2026-09-01')],
      names
    );
    expect(changes).toEqual([
      { slug: 'opusclip', toolName: 'OpusClip', from: '$15/mo', to: '$20/mo', date: '2026-09-10' },
    ]);
  });

  it('ignores re-recorded identical prices and chains multiple changes', () => {
    const changes = extractPriceChanges(
      [
        row('opusclip', '$20/mo', '2026-09-10'),
        row('opusclip', '$20/mo', '2026-09-05'),
        row('opusclip', '$15/mo', '2026-09-01'),
        row('opusclip', '$10/mo', '2026-08-01'),
      ],
      names
    );
    expect(changes).toEqual([
      { slug: 'opusclip', toolName: 'OpusClip', from: '$15/mo', to: '$20/mo', date: '2026-09-10' },
      { slug: 'opusclip', toolName: 'OpusClip', from: '$10/mo', to: '$15/mo', date: '2026-09-01' },
    ]);
  });

  it('emits nothing for single points, unknown tools use the slug as name', () => {
    expect(extractPriceChanges([row('opusclip', '$20/mo', '2026-09-10')], names)).toEqual([]);
    expect(extractPriceChanges([], names)).toEqual([]);
    const changes = extractPriceChanges(
      [row('ghost', '$5/mo', '2026-09-10'), row('ghost', '$3/mo', '2026-09-01')],
      names
    );
    expect(changes[0].toolName).toBe('ghost');
  });

  it('caps output at the limit', () => {
    const rows: PriceHistoryRow[] = [];
    for (let i = 50; i >= 0; i--) {
      rows.push(row(`tool${i}`, '$20/mo', '2026-09-10'), row(`tool${i}`, '$10/mo', '2026-09-01'));
    }
    expect(extractPriceChanges(rows, names, 50)).toHaveLength(50);
  });
});
