"use client";

import React, { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function NewsletterForm({ source = 'homepage' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed');
      setStatus('success');
      setMessage(data.message || 'You are in! Welcome aboard 🎉');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  if (status === 'success') {
    return (
      <p className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 text-sm font-bold text-emerald-300">
        <CheckCircle2 className="h-5 w-5" /> {message}
      </p>
    );
  }

  return (
    <form className="flex gap-2 max-w-md mx-auto" onSubmit={submit}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
        aria-label="Email address"
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60 transition-opacity whitespace-nowrap"
      >
        {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
        Subscribe
      </button>
      {status === 'error' && <p className="absolute mt-14 text-xs font-semibold text-rose-400">{message}</p>}
    </form>
  );
}
