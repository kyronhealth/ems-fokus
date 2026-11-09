import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth';

// Landing page of the e-mail link. supabase-js exchanges the code automatically; this waits for it.
export default function AuthCallback() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { user, ready } = useAuth();
  const [failed, setFailed] = useState(false);
  const next = params.get('next') || '/heute';

  useEffect(() => {
    const code = params.get('code');
    if (!supabase || !code) return;
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) return;
      const { error } = await supabase!.auth.exchangeCodeForSession(code);
      if (error) setFailed(true);
    });
    const t = setTimeout(() => setFailed(f => f || !user), 10000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (ready && user) nav(next, { replace: true }); }, [ready, user, next, nav]);

  if (failed) {
    return (
      <div className="stack view">
        <h1>Der Link hat nicht funktioniert</h1>
        <p>Er ist vielleicht abgelaufen oder wurde in einem anderen Browser geöffnet. Fordere einfach einen neuen an.</p>
        <button className="btn primary" onClick={() => nav(`/anmelden?next=${encodeURIComponent(next)}`)}>Neuen Link anfordern</button>
      </div>
    );
  }
  return <p className="muted view">Du wirst angemeldet …</p>;
}
