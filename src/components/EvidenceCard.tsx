import Link from 'next/link';
import { ShieldCheck, FileVideo, ExternalLink } from 'lucide-react';
import type { Tool } from '@/data/tools';

/**
 * The REAL Evidence Card.
 *
 * Audit fix 1.1. The previous version was hardcoded onto all 200 tool pages
 * with a fixed "Test Date: 2026-08-01" and "Evidence Type: Hands-on + Vendor
 * Data" regardless of whether any test had happened.
 *
 * This component now renders only for tools where
 * verificationLevel === 'hands-on-tested', and every field is read from the
 * tool record rather than hardcoded. If the evidence is not there, the card
 * does not exist — the caller shows <NotTestedNotice /> instead.
 */
export function EvidenceCard({ tool }: { tool: Tool }) {
  if (tool.verificationLevel !== 'hands-on-tested' || !tool.testedAt) return null;

  const fields = [
    { label: 'Test date', value: tool.testedAt, mono: true },
    { label: 'Plan used', value: tool.planTested ?? tool.pricing },
    {
      label: 'Pricing checked',
      value: tool.pricingCheckedAt ?? 'Not separately verified',
      mono: !!tool.pricingCheckedAt,
    },
    {
      label: 'Evidence on file',
      value: tool.evidenceUrls?.length
        ? `${tool.evidenceUrls.length} artefact${tool.evidenceUrls.length === 1 ? '' : 's'}`
        : 'Notes only',
    },
  ];

  return (
    <section className="mt-6 rounded-3xl border border-emerald-500/25 bg-emerald-950/20 p-6 sm:p-8">
      <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-emerald-300">
        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        Evidence Card — how we tested {tool.name}
      </h2>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((f) => (
          <div key={f.label} className="rounded-xl border border-white/10 bg-surface-0 p-4">
            <dt className="mb-1 text-2xs font-bold uppercase tracking-wider text-emerald-400">
              {f.label}
            </dt>
            <dd
              className={`text-sm font-bold text-white ${
                f.mono ? 'font-mono tabular-nums' : ''
              }`}
            >
              {f.value}
            </dd>
          </div>
        ))}
      </dl>

      {tool.evidenceUrls && tool.evidenceUrls.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-2xs font-bold uppercase tracking-wider text-emerald-400">
            Published artefacts
          </h3>
          <ul className="flex flex-wrap gap-2">
            {tool.evidenceUrls.map((url, i) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface-0 px-3 py-1.5 text-2xs font-semibold text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-300"
                >
                  <FileVideo className="h-3 w-3" aria-hidden="true" />
                  Evidence {i + 1}
                  <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-2xs leading-relaxed text-zinc-400">
        We ran {tool.name} ourselves against the standard brief for its category and published the
        raw output above, so you can judge the result rather than trust our score.{' '}
        <Link href="/benchmark" className="underline hover:text-zinc-200">
          See the test briefs
        </Link>{' '}
        ·{' '}
        <Link href="/about" className="underline hover:text-zinc-200">
          our methodology
        </Link>
        .
      </p>
    </section>
  );
}
