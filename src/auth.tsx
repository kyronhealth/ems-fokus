import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { LOCAL, supabase } from './lib/supabase';
import * as api from './lib/api';
import type { StudyProfile } from './lib/types';

type SimpleUser = { id: string; email: string };
type AuthCtx = {
  ready: boolean;
  user: SimpleUser | null;
  profile: StudyProfile | null;
  access: boolean;
  accessUntil: string | null;
  setProfile: (p: StudyProfile) => void;
  refreshAccess: () => Promise<boolean>;
  signIn: (email: string, next: string) => Promise<'sent' | 'local'>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
const LOCAL_USER_KEY = 'emsfokus.localUser';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudyProfile | null>(null);
  const [access, setAccess] = useState(false);
  const [accessUntil, setAccessUntil] = useState<string | null>(null);

  // 1) who is signed in
  useEffect(() => {
    if (LOCAL) {
      try { const e = localStorage.getItem(LOCAL_USER_KEY); if (e) setUser({ id: 'local', email: e }); } catch { /* ignore */ }
      setSessionChecked(true);
      return;
    }
    supabase!.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUser(u ? { id: u.id, email: u.email ?? '' } : null);
      setSessionChecked(true);
    });
    const { data: sub } = supabase!.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      // defer: no Supabase calls inside this callback
      setTimeout(() => setUser(u ? { id: u.id, email: u.email ?? '' } : null), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 2) their data, and any diagnostic done before signing in
  useEffect(() => {
    if (!sessionChecked) return;
    if (!user) { setProfile(null); setAccess(false); setAccessUntil(null); setLoadedFor(null); return; }
    let cancelled = false;
    (async () => {
      const p = api.pending.get();
      if (p) { try { await api.saveAttempt(p); api.pending.clear(); } catch { /* retry next time */ } }
      const [prof, acc] = await Promise.all([api.getProfile(user.id), api.hasAccess()]);
      if (cancelled) return;
      setProfile(prof); setAccess(acc.access); setAccessUntil(acc.until); setLoadedFor(user.id);
    })();
    return () => { cancelled = true; };
  }, [user, sessionChecked]);

  const refreshAccess = useCallback(async () => {
    const acc = await api.hasAccess();
    setAccess(acc.access); setAccessUntil(acc.until);
    return acc.access;
  }, []);

  const signIn = useCallback(async (email: string, next: string) => {
    if (LOCAL) {
      try { localStorage.setItem(LOCAL_USER_KEY, email); } catch { /* ignore */ }
      setUser({ id: 'local', email });
      return 'local' as const;
    }
    const redirect = `${window.location.origin}/auth?next=${encodeURIComponent(next)}`;
    const { error } = await supabase!.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } });
    if (error) throw new Error(error.status === 429 ? 'Zu viele Versuche. Bitte warte eine Minute.' : 'Der Link konnte nicht gesendet werden. Stimmt die E-Mail-Adresse?');
    return 'sent' as const;
  }, []);

  const signOut = useCallback(async () => {
    if (LOCAL) { try { localStorage.removeItem(LOCAL_USER_KEY); } catch { /* ignore */ } setUser(null); return; }
    await supabase!.auth.signOut();
    setUser(null);
  }, []);

  const ready = sessionChecked && (!user || loadedFor === user.id);
  return (
    <Ctx.Provider value={{ ready, user, profile, access, accessUntil, setProfile, refreshAccess, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside AuthProvider');
  return c;
}
