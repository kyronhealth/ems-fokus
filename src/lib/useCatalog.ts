import { useEffect, useState } from 'react';
import * as api from './api';
import type { Attempt, SetMeta } from './types';

export function useCatalogAndAttempts() {
  const [catalog, setCatalog] = useState<SetMeta[] | null>(null);
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let off = false;
    Promise.all([api.getCatalog(), api.listAttempts()])
      .then(([c, a]) => { if (!off) { setCatalog(c); setAttempts(a); } })
      .catch(e => !off && setError((e as Error).message || 'Laden hat nicht geklappt.'));
    return () => { off = true; };
  }, []);
  return { catalog, attempts, error };
}
