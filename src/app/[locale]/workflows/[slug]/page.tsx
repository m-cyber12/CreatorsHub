import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from '@/i18n/navigation';
import { ArrowRight, GitBranch, Lightbulb } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CommunityQA } from '@/components/CommunityQA';
import { TrackView } from '@/components/TrackView';
import { WORKFLOWS, getWorkflow, workflowMinutes, workflowForClient } from '@/data/workflows';
import { absoluteUrl } from '@/config/site';
import { WorkflowClient } from './WorkflowClient';

export function generateStaticParams() {
  return WORKFLOWS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const w = getWorkflow(slug);
  if (!w) notFound();
  const t = await getTranslations({ locale, namespace: 'workflows' });
  return {
    title: `${w.title} — ${t('indexTitle')}`,
    description: w.oneLiner.slice(0, 155),
    alternates: { canonical: `/workflows/${slug}` },
    openGraph: {
      title: w.title,
      description: w.oneLiner.slice(0, 155),
      url: `/workflows/${slug}`,
      type: 'website',
    },
  };
}



export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const workflow = getWorkflow(slug);
  if (!workflow) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'workflows' });

  const clientData = workflowForClient(workflow);
  const minutes = workflowMinutes(workflow);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: workflow.title,
    description: workflow.oneLiner,
    url: absoluteUrl(`/workflows/${slug}`),
    totalTime: `PT${minutes}M`,
    step: workflow.nodes.map((n, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: n.label,
      text: n.instructions,
      url: n.tool ? absoluteUrl(`/tool/${n.tool}`) : undefined,
    })),
  };

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <TrackView event="workflow_opened" slug={workflow.slug} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
          <GitBranch className="h-3.5 w-3.5" aria-hidden="true" /> {t('pipelineTitle')}
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{workflow.title}</h1>
        <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-zinc-300">
          {workflow.oneLiner}
        </p>
        {workflow.frequency && (
          <p className="mt-2 text-2xs font-semibold uppercase tracking-wider text-zinc-500">
            {workflow.frequency}
          </p>
        )}

        <WorkflowClient data={clientData} />

        {workflow.notes.length > 0 && (
          <section className="mt-10 rounded-2xl border border-ember-500/20 bg-ember-500/5 p-6">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Lightbulb className="h-4 w-4 text-ember-400" aria-hidden="true" /> {t('notesTitle')}
            </h2>
            <ul className="mt-4 space-y-3">
              {workflow.notes.map((note) => (
                <li key={note.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-zinc-400">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-400" aria-hidden="true" />
                  {note}
                </li>
              ))}
            </ul>
          </section>
        )}

        <WorkflowClient data={clientData} />

        <section className="mt-12">
          <h2 className="text-base font-black">{t('indexTitle')}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {WORKFLOWS.filter((w) => w.slug !== workflow.slug).map((w) => (
              <Link
                key={w.slug}
                href={`/workflows/${w.slug}`}
                className="glass-panel group flex items-center gap-3 rounded-xl p-4 transition-colors hover:border-accent-500/40"
              >
                <span className="flex-1 text-sm font-bold text-zinc-200 group-hover:text-accent-300">
                  {w.title}
                </span>
                <ArrowRight className="h-4 w-4 text-accent-400 rtl:rotate-180" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
        <CommunityQA entityType="workflow" entitySlug={workflow.slug} />
      </main>
      <Footer />
    </div>
  );
}
