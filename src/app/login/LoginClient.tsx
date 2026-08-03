"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AppProviders';
import { Mail, Loader2, CheckCircle2, Zap, AlertCircle } from 'lucide-react';

export function LoginClient() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  if (user) {
    router.replace('/account');
    return null;
  }

  const supabaseReady = !!supabase;

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setStatus('sending');
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('sent');
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase) return;
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined },
    });
    if (error) { setStatus('error'); setErrorMsg(error.message); }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-xl">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-black">Welcome to CreatorAI Hub</h1>
              <p className="mt-1 text-xs text-zinc-500">
                Sync your saved tools, post reviews, and get early access to deals. No password needed.
              </p>
            </div>

            {!supabaseReady && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Auth backend not configured yet. Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                  <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel, then run{' '}
                  <code className="font-mono">supabase-launch-upgrade.sql</code>. Bookmarks still work locally.
                </span>
              </div>
            )}

            {status === 'sent' ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                <p className="text-sm font-bold text-emerald-300">Magic link sent!</p>
                <p className="mt-1 text-xs text-zinc-400">Check <span className="font-semibold text-white">{email}</span> and click the link to sign in.</p>
              </div>
            ) : (
              <>
                <button
                  onClick={signInWithGoogle}
                  disabled={!supabaseReady}
                  className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-bold text-zinc-900 hover:bg-zinc-200 disabled:opacity-40 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                  Continue with Google
                </button>

                <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  <div className="h-px flex-1 bg-white/10" /> or <div className="h-px flex-1 bg-white/10" />
                </div>

                <form onSubmit={sendMagicLink} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-white/10 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  {status === 'error' && <p className="text-xs font-semibold text-rose-400">{errorMsg}</p>}
                  <button
                    type="submit"
                    disabled={!supabaseReady || status === 'sending'}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
                  >
                    {status === 'sending' && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send Magic Link
                  </button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-[10px] leading-relaxed text-zinc-600">
              By continuing you agree to our <Link href="/terms" className="underline hover:text-zinc-400">Terms</Link> and{' '}
              <Link href="/privacy" className="underline hover:text-zinc-400">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
