import { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import * as api from './api';
import type { Attempt } from './types';
import type { Scores } from './plan';

/** Latest diagnostic: from the account, or (before sign-in) from this browser. */
export function useLatestDiagnostic() {
  const { user, ready } = useAuth();
  const [diag, setDiag] = useState<Omit<Attempt, 'id' | 'created_at'> & { created_at?: string } | null | undefined>(undefined);
  useEffect(() => {
    if (!ready) return;
    let off = false;
    (async () => {
      let d: typeof diag = null;
      if (user) d = (await api.listAttempts().catch(() => [])).find(a => a.kind === 'diagnostic') ?? null;
      if (!d) d = api.pending.get();
      if (!off) setDiag(d);
    })();
    return () => { off = true; };
  }, [user, ready]);
  return diag; // undefined while loading
}

export function shares(d: { scores: Attempt['scores'] } | null | undefined): Scores {
  const out: Scores = {};
  if (!d?.scores) return out;
  for (const [g, v] of Object.entries(d.scores)) if (v.total) out[g as keyof Scores] = v.right / v.total;
  return out;
}
