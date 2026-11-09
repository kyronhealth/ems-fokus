import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Login() {
  const { signIn } = useAuth();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const next = params.get('next') || '/heute';
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'sent'>('idle');
  const [err, setErr] = useState('');
  return (
    <div className="stack view">
      <h1>Anmelden</h1>
      {state === 'sent' ? (
        <div className="card stack">
          <p><b>Schau in dein Postfach.</b> Wir haben einen Anmeldelink an {email} geschickt. Er ist eine Stunde gültig.</p>
          <p className="small muted">Keine E-Mail da? Prüf den Spam-Ordner oder fordere den Link nochmals an.</p>
          <button className="btn" onClick={() => setState('idle')}>Andere Adresse verwenden</button>
        </div>
      ) : (
        <form className="card stack" onSubmit={async e => {
          e.preventDefault();
          if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Bitte gib eine gültige E-Mail-Adresse ein.'); return; }
          setErr(''); setState('busy');
          try {
            const r = await signIn(email.trim(), next);
            if (r === 'local') nav(next, { replace: true }); else setState('sent');
          } catch (x) { setErr((x as Error).message); setState('idle'); }
        }}>
          <p>Du bekommst einen Link per E-Mail. Ein Passwort brauchst du nicht.</p>
          <div className="field">
            <label htmlFor="email">E-Mail-Adresse</label>
            <input id="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={e => { setEmail(e.target.value); setErr(''); }} aria-invalid={!!err} aria-describedby={err ? 'email-err' : undefined} />
            {err && <span id="email-err" className="err" role="alert">{err}</span>}
          </div>
          <button className="btn primary wide" disabled={state === 'busy'}>{state === 'busy' ? 'Wird gesendet …' : 'Anmeldelink senden'}</button>
          <p className="small muted">Mit der Anmeldung akzeptierst du die AGB und die Datenschutzerklärung.</p>
        </form>
      )}
    </div>
  );
}
