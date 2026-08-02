import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // جلوگیری از ایندکس شدن صفحات API
    },
    sitemap: 'https://directory-ai-hub.vercel.app/sitemap.xml',
  };
}
