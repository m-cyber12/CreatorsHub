"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Send, Bot, ExternalLink, Globe, Video, Mic, Image as ImageIcon, Film } from 'lucide-react';
import { Tool } from '@/data/tools';

interface AIChatAssistantProps {
  tools: Tool[];
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  recommendedTools?: Tool[];
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ tools }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<'en' | 'fa'>('en'); // Always default English
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hi! I'm your CreatorAI Hub assistant 🤖. Ask me anything about our 20+ AI video tools (e.g., 'What can OpusClip do?' or 'Best voice cloning tool?') and I'll give you a detailed breakdown with discount links!",
    },
  ]);
  const [input, setInput] = useState('');

  // Auto-open if URL has ?ask=slug from /tool/[slug] page!
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const askSlug = searchParams.get('ask');
      if (askSlug) {
        const found = tools.find((t) => t.slug === askSlug) || tools[0];
        setIsOpen(true);
        setMessages([
          {
            sender: 'bot',
            text: `Hi! I see you want to learn more about **${found.name}**! Here is my detailed AI creator breakdown:\n\n**Tagline:** ${found.tagline}\n**Best Used For:** ${found.description}\n**Pricing:** ${found.pricing} (${found.startingPrice || 'Free trial available'})\n\nClick **Visit** below to try it with our creator discount:`,
            recommendedTools: [found],
          },
        ]);
        // Clean url
        window.history.replaceState({}, '', '/');
      }
    }
  }, [tools]);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'fa' : 'en';
    setLang(nextLang);
    setMessages([
      {
        sender: 'bot',
        text:
          nextLang === 'fa'
            ? 'زبان به فارسی تغییر کرد 🇮🇷. هر سوالی درباره ابزارهای هوش مصنوعی ویدیو داری بپرس (مثلاً «OpusClip چه کاری انجام می‌ده؟» یا «بهترین ابزار صداگذاری؟») تا راهنمایی کامل کنم!'
            : "Language switched to English 🌐. Ask me anything about our AI video tools!",
      },
    ]);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Shorts & Reels':
        return <Video className="h-4 w-4 text-purple-400" />;
      case 'Voice & Audio':
        return <Mic className="h-4 w-4 text-pink-400" />;
      case 'Thumbnails & Design':
        return <ImageIcon className="h-4 w-4 text-blue-400" />;
      default:
        return <Film className="h-4 w-4 text-indigo-400" />;
    }
  };

  const generateIntelligentResponse = (userText: string): { reply: string; matchedTools: Tool[] } => {
    const q = userText.toLowerCase().trim();

    if (q.includes('opus') || q.includes('clip') || q.includes('اپوس')) {
      const tool = tools.find((t) => t.slug.includes('opus')) || tools[0];
      const reply =
        lang === 'fa'
          ? `**OpusClip AI 2.0** یکی از قدرتمندترین ابزارهای تبدیل ویدیوهای طولانی به Shorts و TikTok است! با استفاده از هوش مصنوعی، ویدیو یا پادکست ۱ ساعته شما را اسکن کرده و ۱۰ کلیپ ویروسی (Viral) را همراه با زیرنویس استایل هورموزی، زوم خودکار و امتیاز وایرال بودن استخراج می‌کند.`
          : `**OpusClip AI 2.0** is an industry-leading video clipping tool designed to turn 1 long YouTube video or podcast into 10 viral vertical Shorts in 1 click! It uses AI virality scoring to analyze hooks and automatically adds Alex Hormozi-style animated captions and emojis. Pricing starts at $19/mo with a free trial.`;
      return { reply, matchedTools: [tool] };
    }

    if (q.includes('eleven') || q.includes('voice') || q.includes('صدا') || q.includes('دوبله') || q.includes('audio')) {
      const elTool = tools.find((t) => t.slug.includes('eleven')) || tools[1];
      const hgTool = tools.find((t) => t.slug.includes('heygen')) || tools[8];
      const reply =
        lang === 'fa'
          ? `برای صداگذاری حرفه‌ای، دوبله و آواتار دو ابزار بی‌رقیب داریم:\n\n۱. **ElevenLabs:** بهترین کیفیت صداگذاری طبیعی و کلون صدا در ۲۹ زبان دنیا.\n۲. **HeyGen:** بهترین ابزار ساخت آواتار ویدیویی که با لب‌خوانی در ۴۰ زبان صحبت می‌کند.`
          : `For voice synthesis, cloning, and dubbing, here are the two industry standards:\n\n1. **ElevenLabs:** Unbeatable realistic human voices and voice cloning in 29+ languages. Ideal for faceless documentaries.\n2. **HeyGen:** Photorealistic AI avatars with instant multilingual lip-syncing.`;
      return { reply, matchedTools: [elTool, hgTool].filter(Boolean) };
    }

    if (q.includes('submagic') || q.includes('caption') || q.includes('زیرنویس') || q.includes('hormozi')) {
      const tool = tools.find((t) => t.slug.includes('submagic')) || tools[4];
      const reply =
        lang === 'fa'
          ? `**Submagic AI** سریع‌ترین استودیوی تحت وب برای ساخت زیرنویس‌های انیمیشنی استایل الکس هورموزی است! روی ویدیوهای صحبت کردن شما به صورت خودکار زیرنویس، ایموجی، افکت صوتی و زوم سینمایی می‌گذارد.`
          : `**Submagic AI** is the fastest web studio to generate animated Alex Hormozi-style captions, B-rolls, zooms, and sound effects for your Shorts, Reels, and TikToks in 1 click!`;
      return { reply, matchedTools: [tool] };
    }

    if (q.includes('thumbnail') || q.includes('midjourney') || q.includes('تامبنیل') || q.includes('کاور')) {
      const mjTool = tools.find((t) => t.slug.includes('midjourney')) || tools[3];
      const reply =
        lang === 'fa'
          ? `برای طراحی تامبنیل‌های پربازدید (High-CTR) یوتیوب:\n\n• **Midjourney v6:** تولید عکس‌های فوق‌واقع‌گرایانه و کانسپت آرت سینمایی از متن.`
          : `For designing high-CTR YouTube thumbnails and custom B-roll graphics:\n\n• **Midjourney v6:** Ultra-photorealistic AI image generation from text prompts.`;
      return { reply, matchedTools: [mjTool].filter(Boolean) };
    }

    const reply =
      lang === 'fa'
        ? `درباره «${userText}» در دیتابیس ۲۰ ابزار بررسی کردم! ابزارهای برتر زیر بهترین انطباق را با نیاز شما در تولید محتوا و ویدیو دارند. روی دکمه "Details & AI" کلیک کنید:`
        : `I checked our curated library for "${userText}"! Here are the highest-rated AI video tools that best match your workflow. Click 'Details & AI' for full reviews:`;
    return { reply, matchedTools: tools.slice(0, 3) };
  };

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;
    const { reply, matchedTools } = generateIntelligentResponse(userText);
    setMessages([
      ...messages,
      { sender: 'user', text: userText },
      { sender: 'bot', text: reply, recommendedTools: matchedTools },
    ]);
    setInput('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 px-5 py-3 text-sm font-extrabold text-white shadow-2xl shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
      >
        <Sparkles className="h-5 w-5 animate-spin" style={{ animationDuration: '6s' }} />
        <span>{lang === 'fa' ? 'دستیار هوشمند AI' : 'AI Tool Finder'}</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 bg-purple-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold">CreatorAI Tool Finder</h3>
                <p className="text-[10px] text-purple-200">
                  {lang === 'fa' ? 'پاسخگو و پیشنهاد دهنده هوشمند' : 'Smart AI matcher with creator discounts'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-white/30"
                title="Toggle Language EN / FA"
              >
                <Globe className="h-3 w-3" />
                <span>{lang.toUpperCase()}</span>
              </button>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium'
                  }`}
                >
                  {msg.text.split('\n\n').map((p, i) => (
                    <p key={i} className={i > 0 ? 'mt-2' : ''}>{p}</p>
                  ))}
                </div>

                {msg.recommendedTools && msg.recommendedTools.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    {msg.recommendedTools.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 p-2.5 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30">
                            {getCategoryIcon(t.category)}
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900 dark:text-white">{t.name}</h4>
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                              ★ {t.rating} ({t.pricing})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={`/tool/${t.slug}`}
                            className="flex items-center gap-1 rounded-xl bg-zinc-800 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-zinc-700"
                          >
                            <span>Details</span>
                          </a>
                          <a
                            href={t.affiliateUrl || t.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-[11px] font-bold text-white shadow hover:bg-purple-500"
                          >
                            <span>{lang === 'fa' ? 'بازدید' : 'Visit'}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            <button
              onClick={() => handleSend('What can OpusClip AI do?')}
              className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold text-purple-600 dark:text-purple-300"
            >
              🎬 What can OpusClip do?
            </button>
            <button
              onClick={() => handleSend('Best AI Voice & Dubbing tools?')}
              className="rounded-full border border-pink-500/30 bg-pink-500/10 px-2.5 py-1 text-[10px] font-bold text-pink-600 dark:text-pink-300"
            >
              🎙️ Voice &amp; Audio AI
            </button>
            <button
              onClick={() => handleSend('YouTube Thumbnail AI')}
              className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-300"
            >
              🖼️ Thumbnails AI
            </button>
          </div>

          <div className="flex items-center gap-2 border-t border-zinc-200 dark:border-white/10 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder={lang === 'fa' ? 'بپرس چه ابزاری نیاز داری...' : 'Ask which tool you need...'}
              className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={() => handleSend(input)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-500"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
