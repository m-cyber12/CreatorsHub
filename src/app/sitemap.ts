import { MetadataRoute } from 'next';
import { INITIAL_TOOLS } from '@/data/tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://directory-ai-hub.vercel.app';
  const staticRoutes = ['', '/tools', '/compare', '/stack-builder', '/blog', '/deals', '/about', '/contact', '/disclosure', '/privacy', '/terms', '/submit'];
  const toolRoutes = INITIAL_TOOLS.map((tool) => `/tool/${tool.slug}`);
  const allRoutes = [...staticRoutes, ...toolRoutes];
  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
