import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Mail, ShieldCheck, Scale, Eye, BookOpenCheck } from 'lucide-react';
import { SITE_NAME, CONTACT_EMAIL } from '@/config/site';
import { NoxiferaWordmark } from '@/components/brand';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/about' },
    openGraph: { title: t('title'), description: t('description'), url: '/about', type: 'website' },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'about' });

  const principles = [
    {
      icon: ShieldCheck,
      title: 'No score without evidence.',
      body: 'A number is meaningless if you cannot inspect how it was produced. We publish verification levels, not invented stars — and when a tool is hands-on tested, the evidence goes with it.',
    },
    {
      icon: Scale,
      title: 'Every tool has flaws.',
      body: 'We write drawbacks for every tool we cover. If you cannot find a downside, we have not looked hard enough. "Who should avoid it" is mandatory, not optional.',
    },
    {
      icon: Eye,
      title: 'Prices carry a source and a date.',
      body: 'Every listed price links to where we read it and when we checked it. Dead tools go to the Graveyard, not silently to a 404.',
    },
    {
      icon: BookOpenCheck,
      title: 'Affiliate links are labeled.',
      body: 'When we earn a commission, the link says so and we link the disclosure. Commissions never affect scores, rankings or recommendations.',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Brand hero */}
        <div className="mb-10 flex flex-col items-start gap-4">
          <NoxiferaWordmark showIcon={false} tagline className="scale-125 origin-left" />
          <p className="text-2xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            {t('heading')}
          </p>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-zinc-300 leading-relaxed">
            Noxifera started with a spreadsheet. One night the founder counted what it actually cost
            to run a modern content workflow: 14 active AI subscriptions, 3 of them used regularly.
            Six hours in a comparison spreadsheet later, $150 a month was back in the bank — and a
            question was left on the table: <em>why doesn&apos;t this already exist?</em>
          </p>

          <p className="text-zinc-400">
            Most AI tool directories optimise for clicks. They write “BEST AI TOOLS 2026”, stuff the
            page with affiliate links, and let the highest-paying tool take the top spot. Noxifera
            optimises for trust: we organise tools by the job they do, label exactly how far we have
            verified each one, and show what we have <strong>not</strong> checked. You decide. We just
            give you the light.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">Why the name</h2>
          <p className="text-zinc-400">
            <strong className="text-accent-300">Nox</strong> — night, darkness.{' '}
            <strong className="text-accent-300">Fera</strong> — to carry, to bear.
          </p>
          <p className="text-zinc-400">
            Creators are lost in the darkness of too many choices, too many tools, too many fake
            reviews. They don&apos;t need another tool. They need someone to carry the light — to show
            which path is real. <strong>Light in the darkness</strong> is what the platform does: it
            reaches into the noise, the marketing and the invented ratings, and pulls out the truth,
            one tool at a time.
          </p>
          <p className="text-zinc-400">
            The logo is a flame trapped in a stone — a reminder that the truth is always there,
            waiting to be found.
          </p>

          <h2 className="mt-8 mb-4 text-xl font-bold text-white">{t('whatWeDo')}</h2>
          <p className="text-zinc-400">
            Noxifera is not just a directory. It is the AI operating system for creators:
          </p>
          <ul className="mt-3 space-y-2 text-zinc-400">
            <li className="flex gap-3">
              <span className="text-accent-400 font-bold">→</span>
              <span>
                <strong className="text-zinc-200">A catalog with honest labels</strong> — hundreds of
                tools, each price sourced and dated, each verification level explicit.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-400 font-bold">→</span>
              <span>
                <strong className="text-zinc-200">The AI Advisor</strong> — tell it what you want to
                make; it answers with a stage-by-stage system of tools, costs and next steps.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-400 font-bold">→</span>
              <span>
                <strong className="text-zinc-200">Outcome guides</strong> — from “podcast” to “10
                Shorts” as a concrete pipeline with tools, workflow and budget.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-400 font-bold">→</span>
              <span>
                <strong className="text-zinc-200">Playbooks</strong> — how to actually use the
                flagship tools, step by step.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-400 font-bold">→</span>
              <span>
                <strong className="text-zinc-200">The Subscription Optimizer</strong> — stop paying
                twice for the same capability.
              </span>
            </li>
          </ul>

          <h2 className="mt-8 mb-4 text-xl font-bold text-white">{t('editorialPolicy')}</h2>
          <div className="mt-4 space-y-4">
            {principles.map((p) => (
              <div key={p.title} className="flex gap-3 rounded-xl border border-white/5 bg-surface-1 p-4">
                <p.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-zinc-100">{p.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{p.body}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 mb-3 text-xl font-bold text-white">Contact</h2>
          <p className="text-zinc-400">
            Questions, corrections, or partnership inquiries:{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1 text-accent-400 hover:underline"
            >
              <Mail className="h-4 w-4" aria-hidden="true" /> {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
