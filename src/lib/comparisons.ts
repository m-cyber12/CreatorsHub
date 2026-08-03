import { ALL_TOOLS, type Tool } from '@/data/tools';

/**
 * Curated "X vs Y" comparison pairs (audit fix 3.1).
 *
 * "<tool a> vs <tool b>" is extremely high-intent search traffic and the site
 * had no page for it. The audit suggests 300+ pairs, but generating every
 * combination produces thin duplicate pages — a doorway-page risk it also
 * warns about. So pairs are generated under strict rules:
 *
 *   - both tools in the same category (comparing a thumbnail maker to a
 *     transcription tool helps nobody)
 *   - both reasonably prominent, so the page answers a question people ask
 *   - capped per category, ranked by combined prominence
 *   - deterministic ordering, so URLs are stable between builds
 *
 * That yields a focused set of genuinely useful pages instead of hundreds of
 * near-empty ones.
 */

const MAX_PAIRS_PER_CATEGORY = 12;
/** Only tools at least this prominent are eligible for a dedicated page. */
const MIN_PROMINENCE = 4.5;

function prominence(t: Tool): number {
  let p = t.rating;
  if (t.isFeatured) p += 0.5;
  if (t.isEditorsChoice) p += 0.4;
  if (t.isTrending) p += 0.3;
  if (t.verificationLevel === 'hands-on-tested') p += 1.0;
  return p;
}

function buildPairs(): [string, string][] {
  const byCategory = new Map<string, Tool[]>();
  for (const t of ALL_TOOLS) {
    if (prominence(t) < MIN_PROMINENCE) continue;
    const list = byCategory.get(t.category) ?? [];
    list.push(t);
    byCategory.set(t.category, list);
  }

  const pairs: [string, string][] = [];

  for (const tools of byCategory.values()) {
    const ranked = [...tools].sort((a, b) => {
      const d = prominence(b) - prominence(a);
      return d !== 0 ? d : a.slug.localeCompare(b.slug);
    });

    const candidates: { pair: [string, string]; weight: number }[] = [];
    for (let i = 0; i < ranked.length; i++) {
      for (let j = i + 1; j < ranked.length; j++) {
        // Alphabetical slug order keeps each URL canonical and stable.
        const [a, b] =
          ranked[i].slug < ranked[j].slug
            ? [ranked[i].slug, ranked[j].slug]
            : [ranked[j].slug, ranked[i].slug];
        candidates.push({
          pair: [a, b],
          weight: prominence(ranked[i]) + prominence(ranked[j]),
        });
      }
    }

    candidates
      .sort((x, y) => y.weight - x.weight || x.pair[0].localeCompare(y.pair[0]))
      .slice(0, MAX_PAIRS_PER_CATEGORY)
      .forEach((c) => pairs.push(c.pair));
  }

  // Stable global ordering.
  return pairs.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
}

export const COMPARISON_PAIRS: [string, string][] = buildPairs();

/** Parse "a-vs-b" back into two tools, tolerating slugs that contain "-vs-". */
export function parseComparisonSlug(slug: string): { a: Tool; b: Tool } | null {
  const idx = slug.indexOf('-vs-');
  if (idx === -1) return null;

  // Try every split point in case a slug legitimately contains "-vs-".
  let search = idx;
  while (search !== -1) {
    const aSlug = slug.slice(0, search);
    const bSlug = slug.slice(search + 4);
    const a = ALL_TOOLS.find((t) => t.slug === aSlug);
    const b = ALL_TOOLS.find((t) => t.slug === bSlug);
    if (a && b) return { a, b };
    search = slug.indexOf('-vs-', search + 1);
  }
  return null;
}
