import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { GROUPS, SEC_PER_ITEM } from '../lib/ems';
import { mmss } from '../lib/format';
import { useCatalogAndAttempts } from '../lib/useCatalog';

export default function Uebungen() {
  const { access } = useAuth();
  const { catalog, attempts, error } = useCatalogAndAttempts();
  if (error) return <p className="notice warn view">{error}</p>;
  if (!catalog) return <p className="muted view">Lädt …</p>;
  const best: Record<string, string> = {};
  (attempts ?? []).forEach(a => { const r = `${a.score}/${a.total}`; if (!best[a.set_id]) best[a.set_id] = r; });
  const practice = catalog.filter(s => s.kind !== 'diagnostic');
  return (
    <div className="stack view">
      <h1>Übungssets</h1>
      <p className="muted">Jedes Set läuft in echter Zeit. Im Lernmodus siehst du die Erklärung direkt nach jeder Frage.</p>
      {GROUPS.map(g => {
        const sets = practice.filter(s => s.group_id === g.id);
        if (!sets.length) return null;
        return (
          <section className="card stack" key={g.id}>
            <h2>{g.name}</h2>
            <ul className="setlist">
              {sets.map(s => {
                const locked = !s.free && !access;
                return (
                  <li key={s.id}>
                    <div><b>{s.title}</b><span className="small muted"> · {s.item_count} Fragen · {mmss(s.item_count * (SEC_PER_ITEM[g.id] ?? 150))}</span>
                      {best[s.id] && <span className="small"> · zuletzt {best[s.id]}</span>}</div>
                    {locked ? <Link className="btn small-btn" to="/kaufen">Mit Saisonpass</Link> : <Link className="btn small-btn primary" to={`/set/${s.id}`}>Starten</Link>}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="small muted">Neue Sets kommen laufend dazu. Muster zuordnen, Objekte im Raum, Figuren lernen und Konzentriertes Arbeiten folgen später; bis dahin übst du diese mit den offiziellen Originalversionen.</p>
    </div>
  );
}
