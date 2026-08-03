import { MetadataRoute } from 'next';
import { ALL_TOOLS } from '@/data/tools';
import { BLOG_POSTS } from '@/data/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://directory-ai-hub.vercel.app';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date('2026-08-01'), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/tools`, lastModified: new Date('2026-08-01'), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date('2026-08-01'), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: new Date('2026-08-01'), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/benchmark`, lastModified: new Date('2026-08-01'), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/graveyard`, lastModified: new Date('2026-08-01'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/stack-builder`, lastModified: new Date('2026-08-01'), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/deals`, lastModified: new Date('2026-08-01'), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date('2026-08-01'), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/submit`, lastModified: new Date('2026-08-01'), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/developers`, lastModified: new Date('2026-08-01'), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/contact`, lastModified: new Date('2026-08-01'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/disclosure`, lastModified: new Date('2026-08-01'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date('2026-08-01'), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date('2026-08-01'), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = ALL_TOOLS.map((tool) => ({
    url: `${baseUrl}/tool/${tool.slug}`,
    lastModified: new Date(tool.lastReviewed || '2026-08-01'),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.isoDate),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...toolRoutes, ...blogRoutes];
}
