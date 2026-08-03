// Simple in-memory sliding-window rate limiter for API routes.
// Good enough for a single Vercel serverless instance; swap for Upstash Redis at scale.

const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false; // blocked
  }
  hits.push(now);
  buckets.set(key, hits);
  // opportunistic cleanup
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t > windowMs)) buckets.delete(k);
    }
  }
  return true; // allowed
}

export function clientIp(request: Request): string {
  const h = (name: string) => request.headers.get(name) || '';
  return h('x-forwarded-for').split(',')[0].trim() || h('x-real-ip') || 'anon';
}
