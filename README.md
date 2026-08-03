# CreatorAI Hub

A specialist directory of AI tools for video creators — YouTubers, editors, podcasters and
short-form creators — built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS** and
**Supabase**.

> **Read [`DEPLOYMENT.md`](./DEPLOYMENT.md) before pushing.** There is a security migration that
> must be run in Supabase, and a required environment variable, or writes will silently stop.

---

## The core idea

Most AI directories claim every listing is "independently reviewed". It is almost never true, and
it is why their ratings are worthless — when every tool scores 4.5 stars, the score carries no
information.

This site uses three explicit verification levels, shown on every listing:

| Level | What it means | Gets a score? |
|---|---|---|
| `hands-on-tested` | We ran it ourselves on the standard brief and published the output | ✅ Yes |
| `pricing-verified` | A human confirmed the price on the vendor's page, on a stated date | ❌ No |
| `listed-only` | Catalogued from public information. No test claim | ❌ No |

A tool can only earn a level above `listed-only` by having a hand-written record in
[`src/data/verified-tools.ts`](./src/data/verified-tools.ts). It is deliberately impossible to
fake a test claim by editing a machine-generated data file, and CI rejects any `hands-on-tested`
entry lacking a test date, scores or published evidence.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # everything is optional for local dev
npm run dev
```

The site builds and runs with **no** environment variables — it falls back to the static catalog.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run verify` | **typecheck + lint + data integrity** — run before pushing |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint including `jsx-a11y` |
| `npm run validate:data` | Catalog integrity (duplicate slugs, dead hosts, unbacked claims) |
| `npm run format` | Prettier |

---

## Architecture

```
src/
├─ config/site.ts          Single source of truth for URL, name, contact
├─ data/
│  ├─ tools.ts             Type definitions + 44 hand-written tools
│  ├─ tools-extended.ts    153 generated tools (never edit by hand)
│  ├─ verified-tools.ts    ⭐ The evidence registry — the only place a claim is granted
│  └─ graveyard.ts         Dead tools; auto-excluded from the live catalog
├─ lib/
│  ├─ toolFilters.ts       Pure filter/sort shared by server page and client island
│  ├─ categories.ts        Category slugs + hand-written editorial copy
│  ├─ comparisons.ts       Curated "X vs Y" pairs (not exhaustive — avoids doorway pages)
│  ├─ supabase.ts          Public client (reads only)
│  ├─ supabaseAdmin.ts     🔒 Service-role client, server-only (all writes)
│  ├─ adminAuth.ts         HMAC-signed admin sessions + CSRF
│  └─ rateLimit.ts         Upstash-backed with in-memory fallback
└─ app/
   ├─ tools/               Server-rendered catalog + client filter island
   ├─ tool/[slug]/         197 tool pages + dynamic OG images
   ├─ category/[slug]/     13 category guides
   ├─ alternatives/[slug]/ 197 "best alternatives" pages
   ├─ compare/[pair]/      115 curated head-to-head pages
   ├─ badge/[slug]/        Embeddable SVG badge (backlink engine)
   └─ api/cron/link-health Weekly dead-link detection
```

### Data flow

`ALL_TOOLS` is the single catalog used everywhere. It merges the two seed arrays, drops anything
in the graveyard, and applies verification from `verified-tools.ts`. Nothing else grants trust.

---

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. SQL Editor → run the migrations **in order**:

```
supabase/migrations/
├─ 0001_initial_schema.sql     tools, submissions
├─ 0002_site_settings.sql      site_settings
├─ 0002b_launch_upgrade.sql    reviews, bookmarks, newsletter, click_log
├─ 0003_lock_down_rls.sql      ⚠️ SECURITY — revokes anon write access
└─ 0004_launch_features.sql    link_health, search_log, price_history, double opt-in
```

3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (see `.env.example`)

**Migration 0003 is not optional.** Without it the anon key — which is public in the browser
bundle — can rewrite your site copy and self-approve reviews. Details in `DEPLOYMENT.md`.

---

## Weekly link health

`/api/cron/link-health` checks all 197 outbound links every Monday (scheduled in `vercel.json`)
and records results in `link_health`. Three consecutive failures flag a tool for review; confirmed
shutdowns move to `src/data/graveyard.ts`, which removes them from the catalog automatically.

Run it manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/link-health
```

---

## Adding a tool

1. Add the entry to `src/data/tools.ts` (typed as `ToolSeed` — it cannot declare its own
   verification level)
2. Run `npm run validate:data`
3. To grant a verification level, add a record to `src/data/verified-tools.ts`

## Testing a tool (the important workflow)

1. Run it against the standard brief for its category — see `/benchmark`
2. Capture evidence: screenshot, exported file, or clip. Upload and link it
3. Score each dimension 0–10 honestly, using the full range
4. Fill **both** `pros` and `cons` — every tool has drawbacks
5. Add the record to `verified-tools.ts` with `verificationLevel: 'hands-on-tested'`

CI fails if you claim a test without a date, scores and evidence.

---

## Tech notes

- **197 tool pages, 13 categories, 197 alternatives, 115 comparisons** — all statically generated
- **Fonts** self-hosted via `next/font` (Inter + JetBrains Mono for tabular figures)
- **No text below 12px** anywhere — the type scale enforces it
- **Security headers** (CSP, HSTS, X-Frame-Options…) in `next.config.js`
- **Analytics** via `@vercel/analytics` — cookieless, no consent required
- `/feed.xml`, `/llms.txt`, `/manifest.webmanifest` for RSS, AI crawlers and PWA
