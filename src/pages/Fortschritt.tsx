import { Link } from 'react-router-dom';
import { GROUPS } from '../lib/ems';
import { fmtLong } from '../lib/format';
import { useCatalogAndAttempts } from '../lib/useCatalog';

export default function Fortschritt() {
  const { attempts, error } = useCatalogAndAttempts();
  if (error) return <p className="notice warn view">{error}</p>;
  if (!attempts) return <p className="muted view">Lädt …</p>;
  if (!attempts.length) return <div className="stack view"><h1>Fortschritt</h1><p>Noch keine Ergebnisse. Starte mit der Diagnose oder einem Übungsset.</p><Link className="btn primary" to="/uebungen">Zu den Übungssets</Link></div>;

  const byGroup: Record<string, number[]> = {};
  [...attempts].reverse().forEach(a => Object.entries(a.scores ?? {}).forEach(([g, v]) => { if (v.total) (byGroup[g] ??= []).push(v.right / v.total); }));
  return (
    <div className="stack view">
      <h1>Fortschritt</h1>
      <p className="muted">Dein Anteil richtiger Antworten pro Aufgabengruppe, ältestes Ergebnis links. Das ist dein persönlicher Verlauf, kein offizieller Prozentrang.</p>
      <section className="card">
        {GROUPS.filter(g => byGroup[g.id]).map(g => {
          const vals = byGroup[g.id].slice(-8);
          const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100);
          return (
            <div className="score-row" key={g.id}>
              <span>{g.name}</span><b className="num">{avg} %</b>
              <div className="spark" aria-label={`Letzte Ergebnisse: ${vals.map(v => Math.round(v * 100) + ' %').join(', ')}`}>
                {vals.map((v, k) => <span key={k} style={{ height: `${Math.max(6, v * 100)}%` }} />)}
              </div>
            </div>
          );
        })}
      </section>
      <section className="card">
        <h2>Alle Ergebnisse</h2>
        <ul className="weeks">
          {attempts.map(a => (
            <li key={a.id}>
              <span className="wk"><Link to={a.kind === 'diagnostic' ? '/ergebnis' : `/auswertung/${a.id}`}>{a.kind === 'diagnostic' ? 'Diagnose' : a.set_id}</Link><b className="num">{a.score}/{a.total}</b></span>
              <span className="small muted">{fmtLong.format(new Date(a.created_at))}{a.mode === 'learn' ? ' · Lernmodus' : ''}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
