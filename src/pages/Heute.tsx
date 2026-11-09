import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { TEST_DATE, groupShort } from '../lib/ems';
import { fmtLong } from '../lib/format';
import { allocFor, daysLeft, phaseOf } from '../lib/plan';
import { shares, useLatestDiagnostic } from '../lib/useDiagnostic';
import { useCatalogAndAttempts } from '../lib/useCatalog';

export default function Heute() {
  const { profile, access } = useAuth();
  const d = useLatestDiagnostic();
  const { catalog, attempts } = useCatalogAndAttempts();
  if (!profile) return <Navigate to="/einrichten" replace />;
  const ph = phaseOf(new Date());
  const a = allocFor(ph.id, profile.minutes_per_day, profile.days_per_week, shares(d));
  const done = new Set((attempts ?? []).map(x => x.set_id));
  const focus = a.list.map(g => g.id);
  const nextSet = (catalog ?? [])
    .filter(s => s.kind === 'practice' && (s.free || access) && !done.has(s.id))
    .sort((x, y) => focus.indexOf(x.group_id!) - focus.indexOf(y.group_id!))[0];
  const last = (attempts ?? [])[0];
  return (
    <div className="stack view">
      <div className="card count"><span className="big">{daysLeft(new Date())}</span><span>Tage bis zum EMS am {fmtLong.format(TEST_DATE)}</span></div>
      <section className="card stack">
        <h2>Heute dran</h2>
        <p className="small muted">Phase {ph.name} · etwa {profile.minutes_per_day} Minuten</p>
        {ph.id === 'final' ? <p>{ph.what}</p> : (
          <ol className="todo">
            {a.list.slice(0, 2).map(g => <li key={g.id}><b>{groupShort(g.id)}</b>: {Math.round(profile.minutes_per_day * g.w / a.list.slice(0, 2).reduce((s, x) => s + x.w, 0))} Minuten</li>)}
          </ol>
        )}
        {nextSet ? <Link className="btn primary wide" to={`/set/${nextSet.id}`}>{groupShort(nextSet.group_id!)} · {nextSet.title} starten</Link>
          : catalog && <Link className="btn wide" to="/uebungen">Alle Übungssets</Link>}
      </section>
      {!d && <section className="card stack"><h2>Noch keine Diagnose</h2><p>Mit der Diagnose gewichtet dein Plan die schwächeren Gruppen stärker.</p><Link className="btn" to="/diagnose">Diagnose starten</Link></section>}
      {last && <section className="card"><h2>Zuletzt</h2><p>{last.kind === 'diagnostic' ? 'Diagnose' : 'Übungsset'} vom {fmtLong.format(new Date(last.created_at))}: <b>{last.score} von {last.total}</b> richtig. <Link to={last.kind === 'diagnostic' ? '/ergebnis' : `/auswertung/${last.id}`}>Ansehen</Link></p></section>}
      {!access && (
        <section className="card stack accent">
          <h2>Mehr üben mit dem Saisonpass</h2>
          <p>Alle Übungssets, der Tutor und die Probetests bis zum 31. Juli 2027. Einmal bezahlen, kein Abo.</p>
          <Link className="btn primary" to="/kaufen">Saisonpass ansehen</Link>
        </section>
      )}
    </div>
  );
}
