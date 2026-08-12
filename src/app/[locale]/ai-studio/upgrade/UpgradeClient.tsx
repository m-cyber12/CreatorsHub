'use client';

import React, { useState } from 'react';
import Link from '@/i18n/navigation';
import { PAYMENT_CONFIG } from '@/config/payments';
import { QRCodeSvg } from '@/components/QRCodeSvg';
import {
  Check,
  Sparkles,
  Zap,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export function UpgradeClient() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedCrypto, setSelectedCrypto] = useState<'USDT-TRC20' | 'USDT-TON' | 'TON'>('USDT-TRC20');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [plisioUrl, setPlisioUrl] = useState<string | null>(null);

  const plan =
    billingCycle === 'yearly'
      ? PAYMENT_CONFIG.studioPlans.yearly
      : PAYMENT_CONFIG.studioPlans.monthly;

  const currentWallet =
    selectedCrypto === 'USDT-TRC20'
      ? PAYMENT_CONFIG.trc20WalletAddress
      : PAYMENT_CONFIG.tonWalletAddress;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(currentWallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateOrder = async () => {
    if (!email.trim()) return;
    setStatus('submitting');
    setErrorMsg('');

    try {
      const orderRes = await fetch('/api/checkout/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Studio Pro (${billingCycle === 'yearly' ? 'Annual' : 'Monthly'})`,
          url: 'https://creatorsaicenter.vercel.app/ai-studio',
          tagline: `Studio Pro Subscription (${plan.name})`,
          category: 'Studio Pro Subscription',
          pricing: 'Paid',
          founderEmail: email.trim().toLowerCase(),
          plan: billingCycle === 'yearly' ? 'studio-yearly' : 'studio-monthly',
          cryptoCurrency: selectedCrypto,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create subscription order');

      if (orderData.order?.plisioInvoiceUrl) {
        setPlisioUrl(orderData.order.plisioInvoiceUrl);
        window.open(orderData.order.plisioInvoiceUrl, '_blank');
      }
      setStatus('idle');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Subscription submission failed');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !txHash.trim()) return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const orderRes = await fetch('/api/checkout/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Studio Pro (${billingCycle === 'yearly' ? 'Annual' : 'Monthly'})`,
          url: 'https://creatorsaicenter.vercel.app/ai-studio',
          tagline: `Studio Pro Subscription (${plan.name})`,
          category: 'Studio Pro Subscription',
          pricing: 'Paid',
          founderEmail: email.trim().toLowerCase(),
          plan: billingCycle === 'yearly' ? 'studio-yearly' : 'studio-monthly',
          cryptoCurrency: selectedCrypto,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create subscription order');

      if (orderData.order?.id) {
        await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.order.id,
            txHash: txHash.trim(),
          }),
        });
      }

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Subscription submission failed');
    }
  };

  return (
    <div className="space-y-12">
      {/* Billing Switcher */}
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-2xl border border-white/10 bg-surface-1 p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-accent-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Monthly Billing ($4.99/mo)
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`relative rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
              billingCycle === 'yearly'
                ? 'bg-accent-500 text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="absolute -top-3 -right-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-accent-500 px-2 py-0.5 text-[9px] font-black uppercase text-black">
              Save 52%
            </span>
            Annual Billing ($29/yr)
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="rounded-3xl border border-white/10 bg-surface-1 p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Starter Free</h3>
              <span className="font-mono text-2xl font-black text-zinc-400">$0</span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">Basic access to client-side creator utilities.</p>

            <ul className="mt-6 space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" /> 3 Free AI Generations per day
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" /> Subtitle text preview
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" /> Audio waveform inspection
              </li>
              <li className="flex items-center gap-2 text-zinc-500">
                <span className="text-zinc-600">✕</span> Limited daily generations
              </li>
            </ul>
          </div>

          <Link
            href="/ai-studio"
            className="mt-8 block text-center rounded-xl border border-white/10 bg-surface-2 py-3 text-xs font-bold text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
          >
            Use Free Tools
          </Link>
        </div>

        {/* Studio Pro Plan */}
        <div className="relative rounded-3xl border-2 border-cyan-400/50 bg-gradient-to-br from-cyan-400/10 via-surface-1 to-fuchsia-500/10 p-7 shadow-[0_0_50px_rgba(34,211,238,0.2)] flex flex-col justify-between">
          <span className="absolute -top-3.5 right-6 rounded-full bg-gradient-to-r from-cyan-400 to-accent-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black shadow-lg">
            Recommended for Creators
          </span>

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <h3 className="text-xl font-black text-white">Studio Pro</h3>
              </div>
              <div className="text-right">
                {billingCycle === 'yearly' && (
                  <span className="text-xs text-zinc-500 line-through mr-1.5">$60</span>
                )}
                <span className="font-mono text-3xl font-black text-cyan-300">${plan.priceUsd}</span>
                <span className="block text-[11px] text-zinc-400 font-mono">
                  {billingCycle === 'yearly' ? '≈ 29 USDT | ≈ 4.5 TON' : '≈ 5 USDT | ≈ 0.8 TON'}
                </span>
                <span className="block text-[10px] text-zinc-500">{plan.billing}</span>
              </div>
            </div>

            <p className="mt-2 text-xs text-zinc-300">
              50 AI generations/day across all 8 tools, priority processing, and viral script hooks.
            </p>

            <ul className="mt-6 space-y-3 text-xs text-zinc-200">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-300 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-accent-400 py-3.5 text-sm font-bold text-black shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all hover:scale-[1.02]"
          >
            <Zap className="h-4 w-4 fill-black" />
            <span>Upgrade to Studio Pro (${plan.priceUsd})</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-cyan-400/40 bg-[#0c0c1a] p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => setCheckoutOpen(false)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-zinc-400 hover:text-white"
            >
              ✕
            </button>

            {status === 'success' ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-white">Subscription Request Submitted!</h3>
                <p className="mt-2 text-sm text-zinc-300">
                  Thank you! Your Studio Pro request for <strong className="text-cyan-300">{email}</strong> ({plan.name}) has been sent to our team for verification.
                </p>
                <button
                  onClick={() => setCheckoutOpen(false)}
                  className="mt-6 rounded-xl bg-cyan-400 px-6 py-2.5 text-xs font-bold text-black"
                >
                  Back to AI Studio
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 text-2xs font-bold text-cyan-300">
                    Studio Pro Checkout
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-white">
                    {plan.name} (${plan.priceUsd})
                  </h3>
                </div>

                {/* Crypto Selector */}
                <div>
                  <span className="mb-2 block text-xs font-bold text-zinc-300">Select Crypto Network:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCrypto('USDT-TRC20')}
                      className={`rounded-xl border p-2 text-center text-2xs font-bold ${
                        selectedCrypto === 'USDT-TRC20'
                          ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                          : 'border-white/10 bg-surface-2 text-zinc-400'
                      }`}
                    >
                      USDT (TRC-20)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCrypto('USDT-TON')}
                      className={`rounded-xl border p-2 text-center text-2xs font-bold ${
                        selectedCrypto === 'USDT-TON'
                          ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                          : 'border-white/10 bg-surface-2 text-zinc-400'
                      }`}
                    >
                      USDT (TON)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCrypto('TON')}
                      className={`rounded-xl border p-2 text-center text-2xs font-bold ${
                        selectedCrypto === 'TON'
                          ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                          : 'border-white/10 bg-surface-2 text-zinc-400'
                      }`}
                    >
                      TON Coin
                    </button>
                  </div>
                </div>

                {/* Automated Plisio Gateway Button */}
                <div>
                  <label htmlFor="stu-email-top" className="block text-xs font-bold text-zinc-300 mb-1">
                    Your Account Email:
                  </label>
                  <input
                    id="stu-email-top"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none mb-3"
                  />

                  {plisioUrl ? (
                    <a
                      href={plisioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 py-3.5 text-xs font-black text-black hover:opacity-90 transition-opacity shadow-lg"
                    >
                      <span>Open Plisio Automated Checkout</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreateOrder}
                      disabled={status === 'submitting' || !email.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-xs font-bold text-black hover:bg-cyan-300 disabled:opacity-50 transition-colors shadow-md"
                    >
                      {status === 'submitting' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Pay via Plisio Auto Gateway</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                  <span className="relative bg-[#0c0c1a] px-3 text-[10px] uppercase text-zinc-500 font-bold">Or Direct Transfer</span>
                </div>

                {/* QR Code & Address */}
                <div className="rounded-2xl border border-white/10 bg-surface-2 p-4 text-center">
                  <div className="mx-auto flex justify-center">
                    <QRCodeSvg text={currentWallet} size={130} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="block flex-1 truncate rounded-lg bg-black/60 px-3 py-2 font-mono text-2xs text-cyan-300">
                      {currentWallet}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyWallet}
                      className="rounded-lg border border-white/10 bg-surface-1 px-3 py-2 text-2xs font-bold text-white hover:bg-white/10"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="mt-2 text-2xs text-zinc-400">
                    Send exactly <strong className="text-white">${plan.priceUsd}</strong> in {selectedCrypto}
                  </p>
                </div>

                {/* Direct Tonkeeper button */}
                {selectedCrypto.includes('TON') && (
                  <a
                    href={`ton://transfer/${currentWallet}?text=StudioPro`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-xs font-bold text-black hover:bg-sky-400 transition-colors"
                  >
                    Open Tonkeeper App <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                {/* Manual TX Hash Form */}
                <form onSubmit={handleVerify} className="space-y-3 pt-2">
                  <div>
                    <label htmlFor="stu-tx" className="block text-xs font-bold text-zinc-300 mb-1">
                      Enter TXID / Transaction Hash (If sent manually):
                    </label>
                    <input
                      id="stu-tx"
                      type="text"
                      required
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      placeholder="Paste transaction hash..."
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {status === 'error' && <p className="text-2xs font-semibold text-rose-400">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={status === 'submitting' || !email.trim() || !txHash.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-surface-2 py-3 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
                  >
                    {status === 'submitting' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Confirm Manual Payment
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
