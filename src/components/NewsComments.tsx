'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Loader2, User } from 'lucide-react';

interface Comment {
  id: string;
  news_slug: string;
  author_name: string;
  body: string;
  created_at: string;
}

export function NewsComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/news/comments?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim() || name.trim().length < 2) {
      setError('نام باید حداقل ۲ کاراکتر باشد');
      return;
    }
    if (!body.trim() || body.trim().length < 3) {
      setError('متن کامنت خیلی کوتاه است');
      return;
    }
    setPosting(true);
    try {
      const res = await fetch('/api/news/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, author_name: name.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ارسال');
      setBody('');
      setSuccess('کامنت شما ثبت شد!');
      await load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'خطا');
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="mt-12 rounded-2xl border border-white/10 bg-surface-1 p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-white">
        <MessageCircle className="h-5 w-5 text-accent-400" />
        نظرات ({comments.length})
      </h3>

      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" /> در حال بارگذاری...
        </p>
      ) : comments.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">هنوز نظری ثبت نشده. اولین نفر باشید!</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-white/5 bg-surface-2 p-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-500/20 text-accent-300">
                  <User className="h-4 w-4" />
                </span>
                <span className="font-bold text-white">{c.author_name}</span>
                <span className="text-zinc-500">
                  {new Date(c.created_at).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-300">{c.body}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-6 space-y-3 border-t border-white/5 pt-6">
        <h4 className="text-sm font-bold text-white">ثبت نظر</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام شما"
            className="w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
            maxLength={60}
          />
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="نظر خود را بنویسید..."
          rows={4}
          className="w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
          maxLength={2000}
        />
        {error && <p className="text-xs font-semibold text-rose-400">{error}</p>}
        {success && <p className="text-xs font-semibold text-emerald-400">{success}</p>}
        <button
          type="submit"
          disabled={posting}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          ارسال نظر
        </button>
      </form>
    </section>
  );
}
