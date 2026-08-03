import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/go/', '/admin', '/account', '/login'],
    },
    sitemap: 'https://directory-ai-hub.vercel.app/sitemap.xml',
  };
}
