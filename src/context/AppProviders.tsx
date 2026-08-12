"use client";

import React, { createContext, useContext, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { applyStoredSnapTheme } from '@/lib/snapTheme';
import { StudioQuotaProvider } from '@/context/StudioQuotaContext';
import type { User } from '@supabase/supabase-js';

/* ============ Auth ============ */
interface AuthCtx {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setLocalUser: (user: User | null) => void;
}
const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  signOut: async () => {},
  setLocalUser: () => {},
});
export const useAuth = () => useContext(AuthContext);

/* ============ Bookmarks ============ */
interface BookmarkCtx {
  bookmarks: string[];
  toggleBookmark: (slug: string) => void;
  isBookmarked: (slug: string) => boolean;
}
const BookmarkContext = createContext<BookmarkCtx>({ bookmarks: [], toggleBookmark: () => {}, isBookmarked: () => false });
export const useBookmarks = () => useContext(BookmarkContext);

/* ============ Compare ============ */
interface CompareCtx {
  compareList: string[];
  toggleCompare: (slug: string) => void;
  isCompared: (slug: string) => boolean;
  clearCompare: () => void;
}
const CompareContext = createContext<CompareCtx>({ compareList: [], toggleCompare: () => {}, isCompared: () => false, clearCompare: () => {} });
export const useCompare = () => useContext(CompareContext);

const MAX_COMPARE = 3;

export function AppProviders({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    applyStoredSnapTheme();
  }, []);

  // --- auth ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedLocalUser = localStorage.getItem('cah_local_user');
      if (storedLocalUser) {
        setUser(JSON.parse(storedLocalUser));
      }
    } catch {
      /* noop */
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user);
        try { localStorage.setItem('cah_local_user', JSON.stringify(session.user)); } catch {}
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const setLocalUser = useCallback((usr: User | null) => {
    setUser(usr);
    try {
      if (usr) {
        localStorage.setItem('cah_local_user', JSON.stringify(usr));
      } else {
        localStorage.removeItem('cah_local_user');
      }
    } catch {
      /* noop */
    }
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    setUser(null);
    try { localStorage.removeItem('cah_local_user'); } catch {}
  }, []);

  // --- bookmarks ---
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cah_bookmarks');
      if (raw) setBookmarks(JSON.parse(raw));
    } catch {}
  }, []);

  const persistBookmarks = (next: string[]) => {
    setBookmarks(next);
    try { localStorage.setItem('cah_bookmarks', JSON.stringify(next)); } catch {}
    if (supabase && user) {
      supabase.from('user_bookmarks').upsert({ user_id: user.id, slugs: next }, { onConflict: 'user_id' }).then(() => {});
    }
  };

  const toggleBookmark = useCallback((slug: string) => {
    persistBookmarks(bookmarks.includes(slug) ? bookmarks.filter((s) => s !== slug) : [...bookmarks, slug]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarks, user]);

  const isBookmarked = useCallback((slug: string) => bookmarks.includes(slug), [bookmarks]);

  // --- compare ---
  const [compareList, setCompareList] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('cah_compare');
      if (raw) setCompareList(JSON.parse(raw));
    } catch {}
  }, []);

  const setCompare = (next: string[]) => {
    setCompareList(next);
    try { sessionStorage.setItem('cah_compare', JSON.stringify(next)); } catch {}
  };

  const toggleCompare = useCallback((slug: string) => {
    setCompare(
      compareList.includes(slug)
        ? compareList.filter((s) => s !== slug)
        : compareList.length >= MAX_COMPARE
          ? [...compareList.slice(1), slug]
          : [...compareList, slug]
    );
  }, [compareList]);

  const isCompared = useCallback((slug: string) => compareList.includes(slug), [compareList]);
  const clearCompare = useCallback(() => setCompare([]), []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setLocalUser }}>
      <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>
        <CompareContext.Provider value={{ compareList, toggleCompare, isCompared, clearCompare }}>
          <StudioQuotaProvider>
            {children}
          </StudioQuotaProvider>
        </CompareContext.Provider>
      </BookmarkContext.Provider>
    </AuthContext.Provider>
  );
}
