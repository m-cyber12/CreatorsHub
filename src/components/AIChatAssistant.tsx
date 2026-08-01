"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Send, Bot, ExternalLink, Globe } from 'lucide-react';
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
  const [lang, setLang] = useState<'en' | 'fa'>('en'); // Default English
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const isIranOrPersian =
      Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Tehran') ||
      (typeof navigator !== 'undefined' && navigator.language.includes('fa'));

    const detectedLang = isIranOrPersian ? 'fa' : 'en';
    setLang(detectedLang);

    setMessages([
      {
        sender: 'bot',
        text:
          detectedLang === 'fa'
            ? 'سلام! من دستیار هوشمند CreatorAI Hub هستم 🤖. بگو چه ویدیویی می‌خواهی بسازی تا بهترین ابزار با تخفیف و لینک مستقیم را بهت پیشنهاد بدم!'
            : "Hi! I'm your CreatorAI Hub assistant 🤖. Tell me what video or short you're making, and I'll match you with the best tested AI tool!",
      },
    ]);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'fa' : 'en';
    setLang(nextLang);
    setMessages([
      {
        sender: 'bot',
        text:
          nextLang === 'fa'
            ? 'زبان به فارسی تغییر کرد 🇮🇷. بگو چه ویدیویی می‌خواهی بسازی تا بهترین ابزار را بهت پیشنهاد بدم!'
            : 'Language switched to English 🌐. Tell me what kind of video or shorts workflow you want to automate!',
      },
    ]);
  };

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;
    const newMessages: Message[] = [...messages, { sender: 'user', text: userText }];
    const query = userText.toLowerCase();
    let matched: Tool[] = [];

    if (query.includes('short') || query.includes('شورت') || query.includes('tiktok') || query.includes('reels') || query.includes('ریلز')) {
      matched = tools.filter((t) => t.category === 'Shorts & Reels').slice(0, 3);
    } else if (query.includes('voice') || query.includes('صدا') || query.includes('دوبله') || query.includes('audio')) {
      matched = tools.filter((t) => t.category === 'Voice & Audio').slice(0, 3);
    } else if (query.includes('thumbnail') || query.includes('تامبنیل') || query.includes('عکس') || query.includes('image')) {
      matched = tools.filter((t) => t.category === 'Thumbnails & Design').slice(0, 3);
    } else if (query.includes('script') || query.includes('متن') || query.includes('seo') || query.includes('سئو')) {
      matched = tools.filter((t) => t.category === 'Script & SEO').slice(0, 3);
    } else {
      matched = tools.filter((t) => t.isFeatured).slice(0, 3);
    }

    const botReplyText =
      lang === 'fa'
        ? 'بر اساس درخواستت، بهترین ابزارهای تست‌شده زیر رو پیشنهاد می‌کنم. روی دکمه "بازدید" کلیک کن:'
        : "Based on your request, here are the top tested AI tools. Click 'Visit Tool' to try them with our creator discount:";

    setMessages([...newMessages, { sender: 'bot', text: botReplyText, recommendedTools: matched }]);
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
                  {lang === 'fa' ? 'پیشنهاد هوشمند ابزار با لینک افیلیت' : 'Smart AI matcher with creator discounts'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-white/30"
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
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.recommendedTools && msg.recommendedTools.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    {msg.recommendedTools.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 p-2.5 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <img src={t.logo} alt={t.name} className="h-8 w-8 rounded-lg object-cover" />
                          <div>
                            <h4 className="font-bold text-zinc-900 dark:text-white">{t.name}</h4>
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">★ {t.rating} ({t.pricing})</span>
                          </div>
                        </div>
                        <a
                          href={t.affiliateUrl || t.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-1.5 text-[11px] font-bold text-white shadow hover:bg-purple-500 shrink-0"
                        >
                          <span>{lang === 'fa' ? 'بازدید' : 'Visit Tool'}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            <button
              onClick={() => handleSend(lang === 'fa' ? 'ابزارهای ادیت شورتز و ریلز' : 'Best AI tools for Shorts & Reels')}
              className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold text-purple-600 dark:text-purple-300"
            >
              🎬 {lang === 'fa' ? 'شورتز و ریلز' : 'Shorts & Reels'}
            </button>
            <button
              onClick={() => handleSend(lang === 'fa' ? 'ابزارهای صداگذاری و دوبله با هوش مصنوعی' : 'AI Voice & Dubbing tools')}
              className="rounded-full border border-pink-500/30 bg-pink-500/10 px-2.5 py-1 text-[10px] font-bold text-pink-600 dark:text-pink-300"
            >
              🎙️ {lang === 'fa' ? 'صداگذاری و دوبله' : 'Voice & Audio'}
            </button>
            <button
              onClick={() => handleSend(lang === 'fa' ? 'ابزار ساخت تامبنیل یوتیوب' : 'YouTube Thumbnail AI')}
              className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-300"
            >
              🖼️ {lang === 'fa' ? 'ساخت تامبنیل' : 'Thumbnails AI'}
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
