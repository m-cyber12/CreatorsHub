"use client";

import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { applyStoredSnapTheme } from '@/lib/snapTheme';
import { StudioQuotaProvider } from '@/context/StudioQuotaContext';
import {
  WORKSPACE_CHANGED_EVENT,
  getSavedTools,
  setToolNote as wsSetToolNote,
  setToolStatus as wsSetToolStatus,
  toggleSavedTool as wsToggleSavedTool,
  type SavedTool,
  type ToolStatus,
} from '@/lib/workspace';
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

/* ============ Bookmarks (My NOXIFERA saved tools) ============ */
interface BookmarkCtx {
  bookmarks: string[];
  toggleBookmark: (slug: string) => void;
  isBookmarked: (slug: string) => boolean;
}
const BookmarkContext = createContext<BookmarkCtx>({ bookmarks: [], toggleBookmark: () => {}, isBookmarked: () => false });
export const useBookmarks = () => useContext(BookmarkContext);

/* ============ Saved tools (rich workspace records) ============ */
interface SavedToolsCtx {
  savedTools: SavedTool[];
  setNote: (slug: string, note: string) => void;
  setStatus: (slug: string, status: ToolStatus, note?: string) => void;
  refresh: () => void;
}
const SavedToolsContext = createContext<SavedToolsCtx>({ savedTools: [], setNote: () => {}, setStatus: () => {}, refresh: () => {} });
export const useSavedTools = () => useContext(SavedToolsContext);

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
      const storedLocalUser = localStorage.getItem('noxifera_local_user') ?? localStorage.getItem('cah_local_user');
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
        try { localStorage.setItem('noxifera_local_user', JSON.stringify(session.user)); } catch {}
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const setLocalUser = useCallback((usr: User | null) => {
    setUser(usr);
    try {
      if (usr) {
        localStorage.setItem('noxifera_local_user', JSON.stringify(usr));
        localStorage.removeItem('cah_local_user');
      } else {
        localStorage.removeItem('noxifera_local_user'); localStorage.removeItem('cah_local_user');
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
    try { localStorage.removeItem('noxifera_local_user'); localStorage.removeItem('cah_local_user'); } catch {}
  }, []);

  // --- saved tools: single store is src/lib/workspace.ts (rich records with
  // notes, statuses, and history). Legacy slug arrays are merged on load, so
  // no existing user loses a saved tool. `bookmarks` stays a plain slug
  // array so every existing consumer keeps working unchanged. ---
  const [savedTools, setSavedTools] = useState<SavedTool[]>([]);
  useEffect(() => {
    const refresh = () => {
      try {
        setSavedTools(getSavedTools());
      } catch {}
    };
    refresh();
    window.addEventListener(WORKSPACE_CHANGED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(WORKSPACE_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const bookmarks = useMemo(() => savedTools.map((t) => t.slug), [savedTools]);

  const syncSlugsToCloud = useCallback(
    (slugs: string[]) => {
      if (supabase && user) {
        supabase.from('user_bookmarks').upsert({ user_id: user.id, slugs }, { onConflict: 'user_id' }).then(() => {});
      }
    },
    [user]
  );

  const toggleBookmark = useCallback(
    (slug: string) => {
      const { list } = wsToggleSavedTool(slug);
      setSavedTools(list);
      syncSlugsToCloud(list.map((t) => t.slug));
    },
    [syncSlugsToCloud]
  );

  const isBookmarked = useCallback((slug: string) => bookmarks.includes(slug), [bookmarks]);

  const setNote = useCallback((slug: string, note: string) => {
    setSavedTools(wsSetToolNote(slug, note));
  }, []);

  const setStatus = useCallback((slug: string, status: ToolStatus, note?: string) => {
    setSavedTools(wsSetToolStatus(slug, status, note));
  }, []);

  const refreshSavedTools = useCallback(() => {
    try {
      setSavedTools(getSavedTools());
    } catch {}
  }, []);

  // --- compare ---
  const [compareList, setCompareList] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('noxifera_compare');
      if (raw) setCompareList(JSON.parse(raw));
    } catch {}
  }, []);

  const setCompare = (next: string[]) => {
    setCompareList(next);
    try { sessionStorage.setItem('noxifera_compare', JSON.stringify(next)); } catch {}
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

  const savedToolsValue = useMemo(
    () => ({ savedTools, setNote, setStatus, refresh: refreshSavedTools }),
    [savedTools, setNote, setStatus, refreshSavedTools]
  );

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setLocalUser }}>
      <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>
        <SavedToolsContext.Provider value={savedToolsValue}>
          <CompareContext.Provider value={{ compareList, toggleCompare, isCompared, clearCompare }}>
            <StudioQuotaProvider>
              {children}
            </StudioQuotaProvider>
          </CompareContext.Provider>
        </SavedToolsContext.Provider>
      </BookmarkContext.Provider>
    </AuthContext.Provider>
  );
}
