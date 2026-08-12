import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from '@/i18n/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ALL_TOOLS, CATEGORIES } from '@/data/tools';
import { SITE_URL, SITE_NAME } from '@/config/site';
import { Code2, Zap, Shield, Database } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'developers' });
  const title = t('metaTitle');
  const description = t('metaDescription', { count: String(ALL_TOOLS.length) });
  return {
    title,
    description,
    alternates: { canonical: '/developers' },
    openGraph: {
      title,
      description: t('metaDescriptionOg', { count: String(ALL_TOOLS.length) }),
      type: 'website',
    },
  };
}

const EXAMPLE = `curl "${SITE_URL}/api/v1/tools?q=voice%20cloning&pricing=Freemium&limit=5"`;

const RESPONSE = `{
  "meta": {
    "total": 12,
    "count": 5,
    "limit": 5,
    "offset": 0,
    "source": "${SITE_NAME} Public API v1"
  },
  "data": [
    {
      "name": "ElevenLabs",
      "slug": "elevenlabs",
      "tagline": "Most realistic AI voice cloning",
      "category": "Voice & Audio",
      "pricing": "Freemium",
      "startingPrice": "$5/mo",
      "verification_level": "pricing-verified",
      "verified_score": null,
      "pricing_source_url": "https://elevenlabs.io/pricing",
      "pricing_checked_at": "2026-08-04",
      "tags": ["Voice Cloning", "Text to Speech"],
      "detailPage": "${SITE_URL}/tool/elevenlabs"
    }
  ]
}`;

export default async function DevelopersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'developers' });

  const features = [
    { icon: Zap, title: t('featKeyTitle'), desc: t('featKeyDesc') },
    {
      icon: Database,
      title: t('featDataTitle', { count: String(ALL_TOOLS.length) }),
      desc: t('featDataDesc', { cats: String(CATEGORIES.length - 1) }),
    },
    { icon: Shield, title: t('featCacheTitle'), desc: t('featCacheDesc') },
  ];

  const rows: { param: string; type: string; desc: string }[] = [
    { param: 'q', type: 'string', desc: t('qDesc') },
    { param: 'category', type: 'string', desc: t('categoryDesc', { list: CATEGORIES.filter((c) => c !== 'All').join(', ') }) },
    { param: 'pricing', type: 'string', desc: t('pricingDesc') },
    { param: 'tested', type: '1', desc: t('testedDesc') },
    { param: 'tags', type: 'csv', desc: t('tagsDesc') },
    { param: 'limit', type: 'int', desc: t('limitDesc') },
    { param: 'offset', type: 'int', desc: t('offsetDesc') },
  ];

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-14">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/10 border border-accent-500/20 px-4 py-1.5 text-xs font-semibold text-accent-300 mb-5">
          <Code2 className="h-3.5 w-3.5" /> {t('badge')}
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">{t('heading')}</h1>
        <p className="mt-4 max-w-2xl text-sm text-zinc-400 leading-relaxed">
          {t('intro', { count: String(ALL_TOOLS.length) })}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-zinc-900/50 p-5">
              <f.icon className="h-5 w-5 text-accent-400" />
              <h3 className="mt-2 text-sm font-bold">{f.title}</h3>
              <p className="mt-1 text-xs text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-bold">{t('endpoint')}</h2>
        <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950 p-5 text-xs text-emerald-300">
GET /api/v1/tools
        </pre>

        <h2 className="mt-8 text-xl font-bold">{t('params')}</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-bold">{t('param')}</th>
                <th className="px-4 py-3 font-bold">{t('type')}</th>
                <th className="px-4 py-3 font-bold">{t('description')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-zinc-950/60 text-zinc-300">
              {rows.map((r) => (
                <tr key={r.param}>
                  <td className="px-4 py-3 font-mono text-accent-300">{r.param}</td>
                  <td className="px-4 py-3">{r.type}</td>
                  <td className="px-4 py-3">{r.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 text-xl font-bold">{t('example')}</h2>
        <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950 p-5 text-xs text-zinc-300">{EXAMPLE}</pre>

        <h2 className="mt-8 text-xl font-bold">{t('response')}</h2>
        <pre className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-zinc-950 p-5 text-xs text-zinc-300">{RESPONSE}</pre>

        <div className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-xs leading-relaxed text-amber-200/80">
          <strong className="text-amber-300">{t('termsLabel')}</strong>{' '}
          {t('termsBody')}
          <Link href="/contact" className="underline">
            {t('contact')}
          </Link>
          {t('termsEnd')}
        </div>
      </main>
      <Footer />
    </div>
  );
}
