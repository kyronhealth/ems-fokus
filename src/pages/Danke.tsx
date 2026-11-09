import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';

// Stripe sends the student here; the webhook unlocks the pass a few seconds later.
export default function Danke() {
  const { refreshAccess } = useAuth();
  const [state, setState] = useState<'wait' | 'ok' | 'slow'>('wait');
  useEffect(() => {
    let n = 0, off = false;
    const tick = async () => {
      if (off) return;
      if (await refreshAccess()) { setState('ok'); return; }
      if (++n >= 15) { setState('slow'); return; }
      setTimeout(tick, 2000);
    };
    tick();
    return () => { off = true; };
  }, [refreshAccess]);
  return (
    <div className="stack view">
      {state === 'wait' && <><h1>Danke!</h1><p className="muted">Deine Zahlung wird bestätigt …</p></>}
      {state === 'ok' && <><h1>Dein Saisonpass ist aktiv</h1><p>Alle Übungssets und der Tutor sind jetzt freigeschaltet.</p><Link className="btn primary" to="/heute">Los geht's</Link></>}
      {state === 'slow' && <><h1>Fast fertig</h1><p>Die Bestätigung dauert länger als üblich. Lade die Seite in einer Minute neu. Falls der Pass dann noch fehlt, schreib uns mit deiner E-Mail-Adresse.</p><Link className="btn" to="/heute">Zur Startseite</Link></>}
    </div>
  );
}
