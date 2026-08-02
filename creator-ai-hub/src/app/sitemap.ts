import { MetadataRoute } from 'next';
import { INITIAL_TOOLS } from '@/data/tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://directory-ai-hub.vercel.app'; // دامنه شما روی Vercel یا دامنه اختصاصی

  // 1. صفحه اصلی (Main Directory)
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 2. تولید خودکار آدرس برای تک‌تک ابزارها (اگر صفحه اختصاصی داشته باشند)
  const toolRoutes: MetadataRoute.Sitemap = INITIAL_TOOLS.map((tool) => ({
    url: `${baseUrl}/#tool-${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...routes, ...toolRoutes];
}
