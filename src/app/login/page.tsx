import type { Metadata } from 'next';
import { LoginClient } from './LoginClient';

export const metadata: Metadata = {
  title: 'Sign In — CreatorAI Hub',
  description: 'Sign in to CreatorAI Hub to save tools, sync bookmarks, and post reviews.',
  alternates: { canonical: '/login' },
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginClient />;
}
