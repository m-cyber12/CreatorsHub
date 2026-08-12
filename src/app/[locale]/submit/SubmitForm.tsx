'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CATEGORIES } from '@/data/tools';
import { PAYMENT_CONFIG, type PlanId } from '@/config/payments';
import { QRCodeSvg } from '@/components/QRCodeSvg';
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap,
  Flame,
  Check,
  Copy,
  ExternalLink,
  ArrowRight,
  Sparkles,
  QrCode,
} from 'lucide-react';

export function SubmitForm({
  categoryLabels = {},
}: {
  /** English category → localized display label (from the server). */
  categoryLabels?: Record<string, string>;
}) {
  const t = useTranslations('submit');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    tagline: '',
    category: CATEGORIES[1] as string,
    pricing: 'Freemium',
    founderEmail: '',
    willAddBadge: true,
  });

  const [selectedPlan, setSelectedPlan] = useState<PlanId>('fastTrack');
  const [selectedCrypto, setSelectedCrypto] = useState<'USDT-TRC20' | 'USDT-TON' | 'TON'>('USDT-TRC20');

  const [status, setStatus] = useState<'form' | 'checkout' | 'submitting' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [orderData, setOrderData] = useState<{
    id: string;
    amountUsd: number;
    walletAddress: string;
    tonkeeperDeepLink: string;
    plisioInvoiceUrl?: string | null;
    planName: string;
    cryptoCurrency: string;
  } | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'verifying' | 'verified'>('idle');

  const set = (k: string, v: string | boolean) => setFormData((p) => ({ ...p, [k]: v }));

  const planInfo = PAYMENT_CONFIG.plans[selectedPlan];
  const currentWallet =
    selectedCrypto === 'USDT-TRC20'
      ? PAYMENT_CONFIG.trc20WalletAddress
      : PAYMENT_CONFIG.tonWalletAddress;

  const handleCopyWallet = () => {
    const addr = orderData?.walletAddress || currentWallet;
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleProceedToCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/checkout/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          plan: selectedPlan,
          cryptoCurrency: selectedCrypto,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || t('failGeneric'));

      if (result.order.isFree) {
        setStatus('success');
      } else {
        setOrderData({
          id: result.order.id,
          amountUsd: result.order.amountUsd,
          walletAddress: result.order.walletAddress,
          tonkeeperDeepLink: result.order.tonkeeperDeepLink,
          plisioInvoiceUrl: result.order.plisioInvoiceUrl,
          planName: result.order.planName,
          cryptoCurrency: result.order.cryptoCurrency || selectedCrypto,
        });
        setStatus('checkout');
      }
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t('failGeneric'));
    }
  };

  const handleVerifyTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderData || !txHash.trim()) return;

    setVerifyStatus('verifying');
    try {
      const res = await fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.id,
          txHash: txHash.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Verification failed');
      setVerifyStatus('verified');
      setStatus('success');
    } catch (err: unknown) {
      setVerifyStatus('idle');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to verify transaction.');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black text-white">{t('successTitle')}</h2>
        <p className="mt-3 text-sm text-zinc-300">
          {selectedPlan === 'free' ? (
            /* 2026-08-12: was t.rich with function renderers fed into plain
               {name}/{email} placeholders (React rejects function children —
               values never rendered). Plain value substitution instead. */
            t('successBody', { name: formData.name, email: formData.founderEmail })
          ) : (
            <span>
              Your order for <strong className="text-accent-300">{formData.name}</strong> ({planInfo.name}) has been
              received. Our editorial team is prioritizing your review and verification!
            </span>
          )}
        </p>
        {txHash && (
          <p className="mt-4 font-mono text-2xs text-zinc-400">
            TXID: <span className="text-emerald-400">{txHash}</span>
          </p>
        )}
      </div>
    );
  }

  const pricingOptions = [
    { value: 'Free', label: tCommon('free') },
    { value: 'Freemium', label: tCommon('freemium') },
    { value: 'Paid', label: tCommon('paid') },
    { value: 'Free Trial', label: tCommon('freeTrial') },
  ];

  return (
    <div className="space-y-8">
      {status === 'checkout' && orderData ? (
        /* ================= CHECKOUT / PAYMENT MODAL ================= */
        <div className="rounded-3xl border border-accent-500/30 bg-surface-1/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-2xs font-bold text-accent-300">
                <Sparkles className="h-3 w-3" /> Step 2: Complete Payment
              </span>
              <h2 className="mt-2 text-2xl font-black text-white">
                {orderData.planName} (${orderData.amountUsd})
              </h2>
            </div>
            <div className="text-right">
              <span className="font-mono text-3xl font-black text-emerald-400">${orderData.amountUsd}</span>
              <span className="block text-2xs text-zinc-400">Total USD</span>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {/* Plisio Automated Checkout Button */}
            {orderData.plisioInvoiceUrl && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <p className="mb-2 text-xs text-emerald-300 font-bold">
                  Instant Auto-Verification via Plisio Gateway:
                </p>
                <a
                  href={orderData.plisioInvoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-accent-400 px-6 py-3.5 text-xs font-black text-black transition-transform hover:scale-105 shadow-xl"
                >
                  Pay via Plisio Secure Crypto Gateway <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            {/* Currency Selector */}
            <div>
              <span className="mb-2 block text-xs font-bold text-zinc-300">Choose Crypto Payment Network:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCrypto('USDT-TRC20')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-2xs font-bold transition-all ${
                    selectedCrypto === 'USDT-TRC20'
                      ? 'border-accent-500 bg-accent-500/20 text-accent-300 shadow-lg ring-1 ring-accent-500'
                      : 'border-white/10 bg-surface-2 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-black font-black">
                    ₮
                  </span>
                  <span>USDT (TRC-20)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCrypto('USDT-TON')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-2xs font-bold transition-all ${
                    selectedCrypto === 'USDT-TON'
                      ? 'border-accent-500 bg-accent-500/20 text-accent-300 shadow-lg ring-1 ring-accent-500'
                      : 'border-white/10 bg-surface-2 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[10px] text-black font-black">
                    ₮
                  </span>
                  <span>USDT (TON)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCrypto('TON')}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-2xs font-bold transition-all ${
                    selectedCrypto === 'TON'
                      ? 'border-accent-500 bg-accent-500/20 text-accent-300 shadow-lg ring-1 ring-accent-500'
                      : 'border-white/10 bg-surface-2 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 text-[10px] text-black font-black">
                    💎
                  </span>
                  <span>TON Coin</span>
                </button>
              </div>
            </div>

            {/* Tonkeeper Direct Transfer Button (only for TON networks) */}
            {selectedCrypto.includes('TON') && (
              <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-sky-200">
                      <span>💎</span> Pay with Tonkeeper App
                    </h4>
                    <p className="text-2xs text-zinc-400">
                      Open Tonkeeper on mobile or scan QR to send ${orderData.amountUsd}
                    </p>
                  </div>
                  <a
                    href={`ton://transfer/${PAYMENT_CONFIG.tonWalletAddress}?text=Order-${orderData.id.slice(0, 8)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105"
                  >
                    Open in Tonkeeper
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Wallet Address & QR Code */}
            <div className="rounded-2xl border border-white/10 bg-surface-2 p-5">
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <div className="flex flex-col items-center justify-center rounded-xl bg-white p-2 text-black shadow-lg">
                  {/* Inline SVG QR Code */}
                  <QRCodeSvg text={currentWallet} size={130} />
                  <span className="mt-1 flex items-center gap-1 font-mono text-[9px] font-bold text-zinc-700">
                    <QrCode className="h-3 w-3" /> Scan to Deposit
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <span className="block text-2xs font-bold text-zinc-400">
                    {selectedCrypto === 'USDT-TRC20'
                      ? 'USDT (TRC-20 Network - Tron) Address:'
                      : 'TON / USDT (TON Network) Address:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="block flex-1 truncate rounded-lg bg-black/60 px-3 py-2 font-mono text-2xs text-emerald-300">
                      {currentWallet}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyWallet}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-surface-1 px-3 py-2 text-2xs font-bold text-zinc-200 hover:bg-white/10"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-400">
                    Send exactly <strong className="text-white">${orderData.amountUsd}</strong> in{' '}
                    <strong className="text-accent-300">{selectedCrypto}</strong> to this address.
                  </p>
                </div>
              </div>
            </div>

            {/* TXID Submission Form */}
            <form onSubmit={handleVerifyTx} className="space-y-3 rounded-2xl border border-white/10 bg-surface-2 p-5">
              <label htmlFor="tx-hash" className="block text-xs font-bold text-zinc-200">
                Enter Transaction Hash / TXID (پس از واریز، هش تراکنش را اینجا وارد کنید):
              </label>
              <div className="flex gap-2">
                <input
                  id="tx-hash"
                  type="text"
                  required
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="Paste transaction hash (e.g. 7f8a9b...)"
                  className="flex-1 rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={verifyStatus === 'verifying' || !txHash.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
                >
                  {verifyStatus === 'verifying' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Payment
                </button>
              </div>
              {errorMessage && <p className="text-2xs font-semibold text-rose-400">{errorMessage}</p>}
            </form>
          </div>
        </div>
      ) : (
        /* ================= STEP 1 & 2: TOOL DETAILS + PLAN SELECTOR ================= */
        <form onSubmit={handleProceedToCheckout} className="space-y-8">
          {/* Plan Selector Grid */}
          <div>
            <span className="mb-3 block text-sm font-black tracking-wide text-zinc-200">
              1. Choose Submission & Promotion Tier (پلن ثبت و انتشار):
            </span>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Free Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan('free')}
                className={`w-full text-left rounded-2xl border p-5 transition-all duration-300 ${
                  selectedPlan === 'free'
                    ? 'border-accent-500 bg-accent-500/10 shadow-[0_0_25px_rgba(247,201,72,0.15)] ring-1 ring-accent-500'
                    : 'border-white/10 bg-surface-1 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Standard</h3>
                  <span className="font-mono text-xl font-black text-white">$0</span>
                </div>
                <p className="mt-1 text-2xs text-zinc-400">Queue review (up to 30 days)</p>
                <ul className="mt-4 space-y-2 text-2xs text-zinc-300">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400" /> Catalogued in directory
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400" /> SEO backlink & tool page
                  </li>
                  <li className="flex items-center gap-1.5 text-zinc-500">
                    <span className="text-zinc-600">✕</span> No priority placement
                  </li>
                </ul>
              </button>

              {/* Fast-Track Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan('fastTrack')}
                className={`relative w-full text-left rounded-2xl border p-5 transition-all duration-300 ${
                  selectedPlan === 'fastTrack'
                    ? 'border-accent-500 bg-accent-500/15 shadow-[0_0_30px_rgba(247,201,72,0.25)] ring-2 ring-accent-500'
                    : 'border-white/10 bg-surface-1 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
                    Launch Special (-40%)
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-accent-400" />
                    <h3 className="text-base font-bold text-white">Fast-Track</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 line-through mr-1.5">$49</span>
                    <span className="font-mono text-xl font-black text-accent-300">$29</span>
                    <span className="block text-[10px] text-zinc-400 font-mono">≈ 29 USDT | ≈ 4.5 TON</span>
                  </div>
                </div>
                <p className="mt-1 text-2xs text-accent-300 font-semibold">Guaranteed &lt; 48h review + Lifetime Verified</p>
                <ul className="mt-4 space-y-2 text-2xs text-zinc-200">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-accent-400" /> Verified & published in &lt; 48 hours
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-accent-400" /> Official Verified trust badge
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-accent-400" /> Dofollow high-authority SEO backlink
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-accent-400" /> Priority in search & category filters
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-accent-400" /> Evidence audit & transparent pricing
                  </li>
                </ul>
              </button>

              {/* Featured Boost Plan (6 Months + Gauntlet Slot) */}
              <button
                type="button"
                onClick={() => setSelectedPlan('featured')}
                className={`relative w-full text-left rounded-2xl border p-5 transition-all duration-300 ${
                  selectedPlan === 'featured'
                    ? 'border-fuchsia-500 bg-fuchsia-500/15 shadow-[0_0_30px_rgba(232,121,249,0.25)] ring-2 ring-fuchsia-500'
                    : 'border-white/10 bg-surface-1 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-accent-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
                    6 Months Boost (-35%)
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-fuchsia-400" />
                    <h3 className="text-base font-bold text-white">Featured</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-500 line-through mr-1.5">$149</span>
                    <span className="font-mono text-xl font-black text-fuchsia-300">$99</span>
                    <span className="block text-[10px] text-zinc-400 font-mono">≈ 99 USDT | ≈ 15.5 TON</span>
                  </div>
                </div>
                <p className="mt-1 text-2xs text-fuchsia-300 font-semibold">Top 3 Homepage (6 Mo) + Permanent Gauntlet Slot</p>
                <ul className="mt-4 space-y-2 text-2xs text-zinc-200">
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-fuchsia-400" /> Top 3 Homepage slot for 6 Months
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-fuchsia-400" /> Permanent Infinity Gauntlet hero stone slot
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-fuchsia-400" /> Pinned to Category top for 6 Months
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-fuchsia-400" /> Featured in weekly CreatorAI Newsletter
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-fuchsia-400" /> Guaranteed publish in &lt; 24 hours
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-fuchsia-400" /> Glowing border & Founder Badge
                  </li>
                </ul>
              </button>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4 rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8">
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">2. Tool Details:</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sf-name" className="mb-1.5 block text-xs font-bold text-zinc-300">
                  {t('formToolName')} *
                </label>
                <input
                  id="sf-name"
                  type="text"
                  required
                  maxLength={60}
                  value={formData.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder={t('formToolNamePh')}
                  className="w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="sf-url" className="mb-1.5 block text-xs font-bold text-zinc-300">
                  {t('formUrl')} *
                </label>
                <input
                  id="sf-url"
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => set('url', e.target.value)}
                  placeholder={t('formUrlPh')}
                  className="w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sf-tagline" className="mb-1.5 block text-xs font-bold text-zinc-300">
                {t('formTagline')} *
              </label>
              <input
                id="sf-tagline"
                type="text"
                required
                maxLength={90}
                value={formData.tagline}
                onChange={(e) => set('tagline', e.target.value)}
                placeholder={t('formTaglinePh')}
                className="w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sf-category" className="mb-1.5 block text-xs font-bold text-zinc-300">
                  {t('formCategory')} *
                </label>
                <select
                  id="sf-category"
                  value={formData.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-3 text-sm text-white focus:border-accent-500 focus:outline-none"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {categoryLabels[c] ?? c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sf-pricing" className="mb-1.5 block text-xs font-bold text-zinc-300">
                  {t('formPricing')} *
                </label>
                <select
                  id="sf-pricing"
                  value={formData.pricing}
                  onChange={(e) => set('pricing', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-3 text-sm text-white focus:border-accent-500 focus:outline-none"
                >
                  {pricingOptions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="sf-email" className="mb-1.5 block text-xs font-bold text-zinc-300">
                {t('formEmail')} *
              </label>
              <input
                id="sf-email"
                type="email"
                required
                value={formData.founderEmail}
                onChange={(e) => set('founderEmail', e.target.value)}
                placeholder={t('formEmailPh')}
                className="w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-accent-500/30 bg-accent-500/10 p-4">
              <input
                type="checkbox"
                checked={formData.willAddBadge}
                onChange={(e) => set('willAddBadge', e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-accent-500"
              />
              <span className="text-xs leading-relaxed text-zinc-400">
                <span className="inline-flex items-center gap-1 font-bold text-accent-300">
                  <ShieldCheck className="h-3.5 w-3.5" /> {t('badgeLabel')}
                </span>{' '}
                {t('badgeBody')}
              </span>
            </label>

            {status === 'error' && <p className="text-xs font-semibold text-rose-400">{errorMessage}</p>}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 py-4 text-sm font-bold text-black transition-all hover:bg-accent-400 hover:shadow-[0_0_30px_rgba(247,201,72,0.4)] disabled:opacity-50"
            >
              {status === 'submitting' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {selectedPlan === 'free' ? 'Submit Tool (Free)' : `Proceed to Payment (${planInfo.name} — $${planInfo.priceUsd})`}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <p className="text-center text-2xs text-zinc-500">{t('submitNote')}</p>
          </div>
        </form>
      )}
    </div>
  );
}
