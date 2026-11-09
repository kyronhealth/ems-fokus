import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import * as api from '../lib/api';
import { TEST_DATE } from '../lib/ems';
import { fmtLong, fmtShort } from '../lib/format';
import { addDays, allocFor, midnight, monday, phaseOf, phases, weeksUntil } from '../lib/plan';
import { shares, useLatestDiagnostic } from '../lib/useDiagnostic';
import PlanForm from '../components/PlanForm';

const weekLabel = (m: Date) => `${fmtShort.format(m)} – ${fmtShort.format(addDays(m, 6))}`;

export default function Lernplan() {
  const { user, profile, setProfile } = useAuth();
  const d = useLatestDiagnostic();
  if (!profile) return <Navigate to="/einrichten" replace />;
  const now = new Date();
  const thisMon = monday(now);
  const ps = phases();
  const cur = phaseOf(now);
  const sc = shares(d);
  const weeks = weeksUntil(now);
  const a = allocFor(cur.id, profile.minutes_per_day, profile.days_per_week, sc);
  const maxMin = Math.max(1, ...a.list.map(x => x.min));
  return (
    <div className="stack view">
      <h1>Dein Lernplan bis zum {fmtLong.format(TEST_DATE)}</h1>
      <p className="muted">{weeks.length} Wochen · {profile.minutes_per_day} Minuten an {profile.days_per_week} Tagen pro Woche · {profile.track}{d ? '' : ' · noch ohne Diagnose gewichtet'}</p>
      <section className="card phases" aria-label="Phasen">
        {ps.filter(p => !p.from || p.to >= thisMon).map(p => (
          <div key={p.id} className={`phase ${p.to < midnight(now) ? 'past' : p.id === cur.id ? 'now' : ''}`}>
            <span className="dot" aria-hidden="true" />
            <div><b>{p.name}</b> <span className="muted small">{p.from ? fmtShort.format(p.from) : 'ab jetzt'} – {fmtShort.format(p.to)}</span><p className="small">{p.what}</p></div>
          </div>
        ))}
      </section>
      <section className="card stack">
        <h2>Diese Woche · {weekLabel(thisMon)}</h2>
        <p className="small muted">Phase {cur.name} · {a.weekly} Minuten{a.sim ? ' plus ein Probetest (ca. 4 Std.)' : ''}</p>
        {cur.id === 'final' ? <p>{cur.what}</p> : (
          <ul className="alloc">
            {a.list.map(g => (
              <li key={g.id}>
                <span>{g.name}</span><span className="min">{g.min} min</span>
                <span className="barw"><i style={{ width: `${Math.round((g.min / maxMin) * 100)}%` }} /></span>
                <span className="src">{g.source}</span>
              </li>
            ))}
          </ul>
        )}
        <Link className="btn" to="/uebungen">Zu den Übungssets</Link>
      </section>
      <details className="card">
        <summary><b>Alle {weeks.length} Wochen anzeigen</b></summary>
        <ul className="weeks">
          {weeks.map((m, k) => {
            const ph = phaseOf(addDays(m, 3));
            const al = allocFor(ph.id, profile.minutes_per_day, profile.days_per_week, sc);
            const top = al.list.slice(0, 3).map(g => g.short).join(', ');
            return <li key={k}><span className="wk"><b>Woche {k + 1}</b><span className="muted small">{weekLabel(m)}</span></span><span className="small">{ph.name}{al.sim ? ' · Probetest' : ''}{top ? ` · Schwerpunkt: ${top}` : ''}</span></li>;
          })}
        </ul>
      </details>
      <p className="small muted">Schwächere Gruppen aus deiner Diagnose bekommen bis zu 2,5-mal mehr Zeit. Für Konzentriertes und sorgfältiges Arbeiten bleibt bewusst wenig, weil zu viel Training dort laut den Testentwicklern schaden kann. Für Gruppen ohne Sets in EMS Fokus nimmst du die zwei veröffentlichten Originalversionen des EMS.</p>
      <h2>Plan anpassen</h2>
      <PlanForm initial={profile} submitLabel="Plan aktualisieren" onSubmit={async p => { await api.saveProfile(user!.id, p); setProfile(p); }} />
    </div>
  );
}
