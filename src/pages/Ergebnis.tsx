import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import * as api from '../lib/api';
import { groupName } from '../lib/ems';
import { fmtLong } from '../lib/format';
import type { SetFull } from '../lib/types';
import { useLatestDiagnostic } from '../lib/useDiagnostic';
import ReviewList from '../components/ReviewList';

const level = (f: number): [string, string] => (f >= 1 ? ['strong', 'Stärke'] : f >= 0.6 ? ['ok', 'Solide'] : ['focus', 'Fokus']);

export default function Ergebnis() {
  const { user, profile } = useAuth();
  const d = useLatestDiagnostic();
  const [set, setSet] = useState<SetFull | null>(null);
  const [showReview, setShowReview] = useState(false);
  useEffect(() => { if (showReview && !set) api.getSet(d?.set_id ?? 'diagnose-1').then(setSet); }, [showReview, set, d]);

  if (d === undefined) return <p className="muted view">Lädt …</p>;
  if (!d || !d.scores) {
    return (
      <div className="stack view">
        <h1>Noch keine Diagnose</h1>
        <p>Mach zuerst die Gratis-Diagnose. Sie dauert etwa 33 Minuten.</p>
        <Link className="btn primary" to="/diagnose">Diagnose starten</Link>
      </div>
    );
  }
  const rows = Object.entries(d.scores).map(([g, v]) => ({ g, ...v, f: v.right / v.total })).sort((a, b) => a.f - b.f);
  return (
    <div className="stack view">
      <h1>Dein Ergebnis: {d.score} von {d.total}</h1>
      <p className="muted">{d.created_at ? `Vom ${fmtLong.format(new Date(d.created_at))}. ` : ''}Mit drei Fragen pro Gruppe ist das ein erster Hinweis, keine Prognose für deinen Prozentrang.</p>
      <section className="card">
        {rows.map(r => {
          const [c, t] = level(r.f);
          return (
            <div className="score-row" key={r.g}>
              <span>{groupName(r.g)}</span>
              <span className="row tight"><span className={`tag ${c}`}>{t}</span><b className="num">{r.right}/{r.total}</b></span>
              <div className="meter" aria-hidden="true">{Array.from({ length: r.total }, (_, k) => <span key={k} className={k < r.right ? 'on' : ''} />)}</div>
            </div>
          );
        })}
      </section>
      <p>Am meisten bringt dir jetzt: <b>{groupName(rows[0].g)}</b>{rows[1] && rows[1].f < 1 ? <> und <b>{groupName(rows[1].g)}</b></> : null}.</p>
      {!user ? (
        <section className="card stack">
          <h2>Lernplan gratis speichern</h2>
          <p>Mit deiner E-Mail-Adresse speichern wir dein Ergebnis und erstellen deinen Lernplan bis zum Testtag. Kein Passwort nötig.</p>
          <Link className="btn primary wide" to="/anmelden?next=/einrichten">Mit E-Mail fortfahren</Link>
        </section>
      ) : (
        <Link className="btn primary wide" to={profile ? '/lernplan' : '/einrichten'}>{profile ? 'Zum Lernplan' : 'Lernplan erstellen'}</Link>
      )}
      <button className="btn wide" onClick={() => setShowReview(v => !v)}>{showReview ? 'Lösungen ausblenden' : 'Antworten und Lösungen ansehen'}</button>
      {showReview && (set ? <ReviewList items={set.items} answers={d.answers} showGroup /> : <p className="muted">Lädt …</p>)}
      <Link className="btn wide" to="/diagnose">Diagnose wiederholen</Link>
    </div>
  );
}
