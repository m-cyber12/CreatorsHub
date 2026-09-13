import type { Tool } from '@/data/tools';

/** Minimal catalog row the /my shell passes down (effective catalog, serializable). */
export interface CatalogRow {
  slug: string;
  name: string;
  logo: string;
  category: string;
  pricing: string;
  startingPrice?: string;
  tags: string[];
}

export function toCatalogRow(t: Tool): CatalogRow {
  return {
    slug: t.slug,
    name: t.name,
    logo: t.logo,
    category: t.category,
    pricing: t.pricing,
    startingPrice: t.startingPrice,
    tags: t.tags,
  };
}
