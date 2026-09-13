import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from '@/i18n/navigation';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Lightbulb,
  Rocket,
  Wrench,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SmartImage } from '@/components/SmartImage';
import { VerificationBadge } from '@/components/VerificationBadge';
import { PLAYBOOKS, getPlaybook, type PlaybookSection } from '@/data/playbooks';
import { ALL_TOOLS } from '@/data/tools';
import { absoluteUrl } from '@/config/site';

export function generateStaticParams() {
  return PLAYBOOKS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const pb = getPlaybook(slug);
  if (!pb) notFound();
  const t = await getTranslations({ locale, namespace: 'playbooks' });
  return {
    title: `${pb.title} — ${t('indexTitle')}`,
    description: pb.oneLiner.slice(0, 155),
    alternates: { canonical: `/playbooks/${slug}` },
    openGraph: {
      title: pb.title,
      description: pb.oneLiner.slice(0, 155),
      url: `/playbooks/${slug}`,
      type: 'website',
    },
  };
}

function SectionBlock({
  sections,
  icon,
}: {
  sections: PlaybookSection[];
  icon: 'wrench' | 'rocket';
}) {
  return (
    <ol className="mt-5 space-y-4">
      {sections.map((s, i) => (
        <li key={i} className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500 font-mono text-2xs font-black text-black">
              {icon === 'wrench' ? <Wrench className="h-3.5 w-3.5" aria-hidden="true" /> : <Rocket className="h-3.5 w-3.5" aria-hidden="true" />}
            </span>
            <h3 className="text-sm font-black">{s.title}</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{s.body}</p>
          {s.tip && (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-accent-500/20 bg-accent-500/5 px-3 py-2 text-2xs leading-relaxed text-accent-200/90">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-400" aria-hidden="true" />
              {s.tip}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const pb = getPlaybook(slug);
  if (!pb) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'playbooks' });
  const tool = ALL_TOOLS.find((x) => x.slug === pb.slug);
  const related = PLAYBOOKS.filter((p) => p.slug !== pb.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: pb.title,
    description: pb.oneLiner,
    url: absoluteUrl(`/playbooks/${slug}`),
    step: [...pb.setup, ...pb.workflow].map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  };

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> {t('indexTitle')}
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{pb.title}</h1>
        <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-zinc-300">
          {pb.oneLiner}
        </p>

        {tool && (
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-surface-1 p-4">
            <SmartImage
              src={tool.logo}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-lg border border-white/10 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-black">
                {tool.name} <VerificationBadge level={tool.verificationLevel} />
              </p>
              <p className="truncate text-2xs text-zinc-500">{tool.tagline}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold tabular-nums text-emerald-300">
                {t('startingAt')} {tool.startingPrice ?? tool.pricing}
              </span>
              <Link
                href={`/tool/${tool.slug}`}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-2xs font-bold text-zinc-200 transition-colors hover:border-accent-500/50 hover:text-accent-300"
              >
                {t('visit')} <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-1.5">
          {pb.bestFor.map((b) => (
            <span
              key={b}
              className="rounded-full border border-accent-500/20 bg-accent-500/5 px-3 py-1 text-2xs font-semibold text-accent-200"
            >
              {t('bestFor')}: {b}
            </span>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-black">{t('setup')}</h2>
          <SectionBlock sections={pb.setup} icon="wrench" />
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-black">{t('workflow')}</h2>
          <SectionBlock sections={pb.workflow} icon="rocket" />
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-black">{t('proMoves')}</h2>
          <SectionBlock sections={pb.proMoves} icon="rocket" />
        </section>

        <section className="mt-10 rounded-2xl border border-ember-500/20 bg-ember-500/5 p-6">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <AlertTriangle className="h-4 w-4 text-ember-400" aria-hidden="true" /> {t('mistakes')}
          </h2>
          <ul className="mt-4 space-y-3">
            {pb.mistakes.map((m) => (
              <li key={m.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-zinc-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-400" aria-hidden="true" />
                {m}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-black">{t('faqTitle')}</h2>
          <div className="mt-4 space-y-3">
            {pb.faq.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-white/10 bg-surface-1 px-4 py-3 open:border-accent-500/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-zinc-200">
                  {f.q}
                  <span className="text-zinc-500 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-base font-black">{t('related')}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/playbooks/${r.slug}`}
                className="glass-panel group flex items-center gap-3 rounded-xl p-4 transition-colors hover:border-accent-500/40"
              >
                <span className="flex-1 text-sm font-bold text-zinc-200 group-hover:text-accent-300">
                  {r.title}
                </span>
                <ArrowRight className="h-4 w-4 text-accent-400 rtl:rotate-180" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
