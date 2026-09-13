# NOXIFERA — Execution Plan (2026-09-12)

Goal (per `noxifera updates/NOXIFERA_Roadmap.md` + user): turn the CreatorAI Hub
directory into the **Noxifera** platform — "Light in the Darkness". Quality over
quantity: a few robust, well-tested features, not ten stubs.

## Scope for this execution

1. **Rebrand to NOXIFERA** — name, tagline, Flame Stone logo (SVG), serif wordmark
   (Cinzel), brand navy+ember theme, favicon, meta/SEO, about page (brand story),
   all i18n dictionaries (8 locales), README.
2. **Outcome pages** (Roadmap §3.4) — `/outcomes` + `/outcomes/[slug]`, 8 hand-written
   outcome systems (jobs→tools, workflow, cost presets, related content).
   Data-validated in CI.
3. **AI Advisor** (Roadmap §4, the first killer feature) — `/advisor`:
   deterministic, data-grounded decision engine (no chatbot), multi-step wizard,
   "Your recommended system" pipeline with per-stage tool/alternative/cost/next-step,
   save / build-stack / compare / copy actions. Unit-tested.
4. **Saved stacks + personal dashboard** (Roadmap §3.1–3.3) — named saved stacks in
   Stack Builder (localStorage, no account required, sync-safe shape), account
   dashboard tabs: Saved tools, Saved stacks, Saved plans (advisor outputs).
5. **Subscription Optimizer** (Roadmap §11) — `/optimizer`: enter current
   subscriptions (catalog autocomplete), detect duplicates, cheaper alternatives,
   compute monthly/yearly savings. Unit-tested.
6. **Tool Playbooks** (Roadmap §5) — `/playbooks` + playbook section on tool pages,
   5 flagship tools (opusclip, descript, elevenlabs, capcut, runway), hand-written
   step-by-step with cost/time/difficulty.
7. **Integration** — header nav, home page (answers "what should I use?" → Advisor;
   "what am I making?" → Outcomes), sitemap, changelog entry, footer, llms.txt.
8. **QA** — `validate-data` extensions (all new slug references), unit tests for
   advisor + optimizer engines, `npm run verify`, production build, live smoke of
   every new route (EN + one RTL + one LTR locale).

## Honesty rules (inherited from the audit)
- No invented scores. Advisor/optimizer recommendations are labelled editorial picks.
- Costs are computed from catalog `startingPrice` data, never hardcoded.
- Every referenced tool slug must exist in the catalog (CI-enforced).
- i18n: every new key added to ALL 8 locale files (next-intl throws on missing).

## Out of scope (needs real-world action — see ROADMAP.md)
Real benchmark testing, affiliate approvals, custom domain, ESP, Supabase config.
