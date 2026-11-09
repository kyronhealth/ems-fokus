import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth';
import * as api from '../lib/api';
import { mmss } from '../lib/format';
import type { Attempt, SetFull } from '../lib/types';
import ReviewList from '../components/ReviewList';

export default function Auswertung() {
  const { id = '' } = useParams();
  const { access } = useAuth();
  const [data, setData] = useState<{ a: Attempt; s: SetFull } | null | undefined>(undefined);
  useEffect(() => {
    (async () => {
      const a = await api.getAttempt(id);
      const s = a ? await api.getSet(a.set_id) : null;
      setData(a && s ? { a, s } : null);
    })().catch(() => setData(null));
  }, [id]);
  if (data === undefined) return <p className="muted view">Lädt …</p>;
  if (!data) return <div className="stack view"><h1>Auswertung nicht gefunden</h1><Link className="btn" to="/fortschritt">Zum Fortschritt</Link></div>;
  const { a, s } = data;
  return (
    <div className="stack view">
      <h1>{s.title}: {a.score} von {a.total} richtig</h1>
      <p className="muted">{a.mode === 'learn' ? 'Lernmodus' : 'Prüfungsmodus'}{a.duration_sec ? ` · ${mmss(a.duration_sec)} Minuten` : ''}. Lies vor allem die Erklärungen zu deinen Fehlern.</p>
      <ReviewList items={s.items} answers={a.answers} tutor={access} />
      {!access && <p className="small muted">Mit dem Saisonpass kannst du zu jeder Aufgabe den Tutor fragen. <Link to="/kaufen">Mehr erfahren</Link></p>}
      <div className="row"><Link className="btn primary" to="/uebungen">Nächstes Set</Link><Link className="btn" to={`/set/${s.id}`}>Nochmals üben</Link></div>
    </div>
  );
}
