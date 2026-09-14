import type { Metadata } from 'next';
import Link from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getNews } from '@/lib/news';
import { newsHref } from '@/data/news';
import { localizeNews } from '@/lib/i18n/content';
import { ensureNewsTranslation } from '@/lib/newsTranslate';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { NewsComments } from '@/components/NewsComments';

export const dynamicParams = true;
export const revalidate = 3600;

interface Params {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'news' });
  const { items } = await getNews();
  const item = (await localizeNews(items, locale)).find((n) => n.slug === slug);
  if (!item) return { title: t('notFound') };
  return {
    title: item.title,
    description: item.excerpt,
    alternates: { canonical: `/news/${item.slug}` },
    openGraph: { title: item.title, description: item.excerpt, type: 'article', url: `/news/${item.slug}` },
  };
}

export default async function NewsDetail({ params }: Params) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'news' });
  const { items } = await getNews();
  const item = items.find((n) => n.slug === slug);
  if (!item) notFound();

  await ensureNewsTranslation(item, locale, { includeContent: true });

  const localized = await localizeNews(items, locale);
  const localizedItem = localized.find((n) => n.slug === slug);
  if (!localizedItem) notFound();

  const related = localized
    .filter((n) => n.category === localizedItem.category && n.slug !== localizedItem.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 transition-colors hover:text-accent-400"
        >
          <ArrowLeft className="h-4 w-4 rtl-flip" aria-hidden="true" /> {t('backToFeed')}
        </Link>

        <article className="mt-8">
          {localizedItem.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={localizedItem.image} alt="" className="mb-6 w-full rounded-2xl object-cover" />
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full border border-accent-500/30 bg-accent-500/15 px-3 py-1 font-bold text-accent-300">
              {localizedItem.category}
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {new Date(localizedItem.publishedAt).toLocaleDateString(locale, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {Math.max(1, Math.ceil(localizedItem.content.length / 800))} دقیقه مطالعه
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold leading-tight sm:text-4xl">{localizedItem.title}</h1>

          <p className="mt-4 rounded-xl bg-accent-500/10 p-4 text-sm leading-relaxed text-zinc-300 border border-accent-500/20">
            {localizedItem.excerpt}
          </p>

          <div className="mt-6 space-y-5">
            {localizedItem.content.split('\n\n').map((para, idx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;
              // Simple heading detection
              if (trimmed.length < 80 && !trimmed.endsWith('.') && idx > 0) {
                return (
                  <h3 key={idx} className="pt-2 text-lg font-bold text-white">
                    {trimmed}
                  </h3>
                );
              }
              return (
                <p key={idx} className="text-[15px] leading-7 text-zinc-300 sm:text-base sm:leading-8">
                  {trimmed}
                </p>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-6">
            <span className="rounded-full bg-white/5 px-3 py-1 text-2xs text-zinc-400">#{localizedItem.category}</span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-2xs text-zinc-400">#AI News</span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-2xs text-zinc-400">#Noxifera</span>
          </div>
        </article>

        <NewsComments slug={localizedItem.slug} />

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-bold text-accent-400">
              {t('moreIn', { category: localizedItem.category })}
            </h2>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={newsHref(r)}
                    className="block rounded-xl border border-white/10 bg-surface-1 p-4 transition-colors hover:border-accent-500/30"
                  >
                    <span className="text-2xs font-semibold uppercase tracking-wide text-accent-400">
                      {r.category}
                    </span>
                    <h3 className="mt-1 text-sm font-bold leading-snug text-white group-hover:text-accent-300">
                      {r.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-2xs text-zinc-500">{r.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
