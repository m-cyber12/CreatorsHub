"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AppProviders';
import { Mail, Lock, Loader2, CheckCircle2, Zap, ArrowRight, UserPlus, KeyRound } from 'lucide-react';

export function LoginClient({ nextPath = '/account' }: { nextPath?: string }) {
  const t = useTranslations('login');
  const [tab, setTab] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error' | 'unconfirmed'>('idle');
  const [resendBusy, setResendBusy] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { user, setLocalUser } = useAuth();
  const router = useRouter();
  const next = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/account';

  if (user) {
    router.replace(next);
    return null;
  }

  // 2026-08-12: Supabase returns raw English messages ("email rate limit
  // exceeded") — unreadable in a Persian UI. Map the common code paths to
  // localized copy; unknown codes still surface the raw message.
  const friendlyAuthError = (error: { code?: string; message?: string } | null): string => {
    const code = error?.code || '';
    const msg = error?.message || '';
    if (/rate_limit/i.test(code) || /rate limit/i.test(msg)) return t('rateLimitReached');
    if (/email_address_invalid|email_invalid/i.test(code) || /invalid email/i.test(msg)) return t('emailInvalid');
    if (/weak_password/i.test(code) || (/short|weak/i.test(msg) && /password/i.test(msg))) return t('weakPassword');
    if (/already/i.test(msg) || /already_registered|email_exists|user_already/i.test(code)) return t('emailRegistered');
    return error?.message || t('authErrorGeneric');
  };

  // Password Sign In / Up with Supabase + Local Fallback Session
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setStatus('submitting');
    setErrorMsg('');

    if (supabase) {
      if (tab === 'signup') {
        const origin =
          typeof window !== 'undefined' && window.location.origin
            ? window.location.origin
            : 'https://creatorsaicenter.vercel.app';
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          // Without this, the verification link bounces to the Supabase
          // project's default Site URL (localhost!) and new users land nowhere.
          options: { emailRedirectTo: `${origin}${next}` },
        });

        if (error) {
          // Show the REAL error, localized. Creating a fake local session
          // here (the previous behaviour) let anyone "log in" as any email
          // with any password — fake users then got trust-dependent features.
          setStatus('error');
          setErrorMsg(friendlyAuthError(error));
          return;
        }

        if (data.session?.user) {
          setLocalUser(data.session.user as never);
          router.replace(next);
          return;
        }

        setStatus('sent');
        return;
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          // Never fall back to a fake session: a wrong password must show an
          // error, not a login. (Critical auth bug fixed 2026-08-12.)
          // An account that signed up but never clicked the email link gets
          // `email_not_confirmed` — that is NOT a wrong password, so say so
          // and offer to resend the verification email (2026-08-12 UX fix:
          // users were stuck on a misleading "password incorrect" loop).
          const code = (error as { code?: string }).code || '';
          if (code === 'email_not_confirmed' || /email not confirmed/i.test(error.message || '')) {
            setStatus('unconfirmed');
            setErrorMsg(t('emailNotConfirmed', { email: email.trim() }));
          } else {
            setStatus('error');
            setErrorMsg(t('invalidCredentials'));
          }
          return;
        }

        if (data.user) {
          setLocalUser(data.user as never);
          router.replace(next);
          return;
        }
        setStatus('error');
        setErrorMsg(t('invalidCredentials'));
      }
    } else {
      // Local fallback mode
      createLocalSession(email.trim());
    }
  };

  const createLocalSession = (userEmail: string) => {
    const fakeUser = {
      id: `usr_${Date.now()}`,
      email: userEmail,
      app_metadata: {},
      user_metadata: { name: userEmail.split('@')[0] },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    setLocalUser(fakeUser as never);
    router.replace(next);
  };

  const resendVerification = async () => {
    if (!supabase || !email.trim()) return;
    setResendBusy(true);
    setResendDone(false);
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://creatorsaicenter.vercel.app';
    await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: `${origin}${next}` },
    });
    // Deliberately ignore the result: rate-limited or re-sent, we show the
    // same non-enumerating confirmation.
    setResendBusy(false);
    setResendDone(true);
  };

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('submitting');
    setErrorMsg('');

    if (!supabase) {
      createLocalSession(email.trim());
      return;
    }

    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://creatorsaicenter.vercel.app';
    const redirectUrl = `${origin}${next}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectUrl },
    });

    if (error) {
      setStatus('error');
      setErrorMsg(friendlyAuthError(error) || t('magicLinkError'));
    } else {
      setStatus('sent');
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 text-white flex flex-col">
      <Header />
      <main id="main" className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-xl shadow-2xl">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500 text-black shadow-lg">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-2xl font-black text-white">{t('welcome')}</h1>
              <p className="mt-1 text-xs text-zinc-400">{t('welcomeSub')}</p>
            </div>

                        {/* Auth Mode Tabs */}
            <div className="mb-6 grid grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-surface-2 p-1">
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`rounded-xl py-2 text-2xs font-bold transition-all ${
                  tab === 'signup'
                    ? 'bg-accent-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t('signUpTab')}
              </button>
              <button
                type="button"
                onClick={() => setTab('magic')}
                className={`rounded-xl py-2 text-2xs font-bold transition-all ${
                  tab === 'magic'
                    ? 'bg-accent-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t('magicLinkTab')}
              </button>
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`rounded-xl py-2 text-2xs font-bold transition-all ${
                  tab === 'signin'
                    ? 'bg-accent-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t('signInTab')}
              </button>
            </div>

            {status === 'sent' ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                <p className="text-sm font-bold text-emerald-300">{t('accountReady')}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {t.rich('verificationSentTo', {
                    email,
                    strong: (chunks) => <strong className="text-white">{chunks}</strong>,
                  })}
                </p>
                {/* 2026-08-12: used to fake a session here ("الکی هست" bug).
                    Until the email link is clicked there IS no session, so the
                    honest next step is the Sign In tab. */}
                <button
                  type="button"
                  onClick={() => {
                    setTab('signin');
                    setStatus('idle');
                    setPassword('');
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-xs font-bold text-black"
                >
                  {t('goToSignIn')} <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </button>
              </div>
            ) : tab === 'magic' ? (
              /* Magic Link Form */
              <form onSubmit={sendMagicLink} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
                  />
                </div>
                {status === 'error' && <p className="text-xs font-semibold text-rose-400">{errorMsg}</p>}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 py-3.5 text-sm font-bold text-black hover:bg-accent-400 disabled:opacity-40 transition-colors shadow-lg"
                >
                  {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t('sendMagicLink')}
                </button>
              </form>
            ) : (
              /* Password Sign In / Sign Up Form */
              <form onSubmit={handlePasswordAuth} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === 'signup' ? t('passwordPlaceholderSignUp') : t('passwordPlaceholderSignIn')}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
                  />
                </div>

                {status === 'error' && <p className="text-xs font-semibold text-rose-400">{errorMsg}</p>}
                {status === 'unconfirmed' && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                    <p className="text-xs font-semibold text-amber-300">{errorMsg}</p>
                    <button
                      type="button"
                      onClick={resendVerification}
                      disabled={resendBusy || resendDone}
                      className="mt-1.5 text-2xs font-bold text-amber-200 underline hover:text-amber-100 disabled:no-underline disabled:opacity-60"
                    >
                      {resendDone ? t('verificationResent') : resendBusy ? '…' : t('resendVerification')}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting' || !email.trim() || !password.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 py-3.5 text-sm font-bold text-black hover:bg-accent-400 disabled:opacity-40 transition-colors shadow-lg"
                >
                  {status === 'submitting' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : tab === 'signup' ? (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>{t('createAccount')}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      <span>{t('signInToAccount')}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick Demo Login */}
            <div className="mt-6 border-t border-white/10 pt-4 text-center">
              <button
                type="button"
                onClick={() => createLocalSession('creator@creatorsaicenter.app')}
                className="text-2xs font-bold text-zinc-400 hover:text-accent-300 underline"
              >
                {t('guestDemo')}
              </button>
            </div>

            <p className="mt-4 text-center text-2xs leading-relaxed text-zinc-500">
              {t.rich('byContinuing', {
                terms: (chunks) => (
                  <Link href="/terms" className="underline hover:text-zinc-400">{chunks}</Link>
                ),
                privacy: (chunks) => (
                  <Link href="/privacy" className="underline hover:text-zinc-400">{chunks}</Link>
                ),
              })}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
