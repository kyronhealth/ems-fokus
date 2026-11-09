import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as api from '../lib/api';
import { SEC_PER_ITEM, groupName } from '../lib/ems';
import { mmss } from '../lib/format';
import { scoreByGroup } from '../lib/plan';
import type { SetFull } from '../lib/types';
import QuestionRunner from '../components/QuestionRunner';

export default function SetRunner() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const [set, setSet] = useState<SetFull | null | undefined>(undefined);
  const [mode, setMode] = useState<'exam' | 'learn' | null>(null);
  const [saveErr, setSaveErr] = useState('');
  useEffect(() => { api.getSet(id).then(setSet).catch(() => setSet(null)); }, [id]);

  if (set === undefined) return <p className="muted wrap view">Lädt …</p>;
  if (set === null) {
    return (
      <main className="wrap view stack">
        <h1>Dieses Set ist gesperrt</h1>
        <p>Es gehört zum Saisonpass, oder es existiert nicht mehr.</p>
        <Link className="btn primary" to="/kaufen">Saisonpass ansehen</Link>
        <Link className="btn" to="/uebungen">Zurück zu den Übungssets</Link>
      </main>
    );
  }
  const per = SEC_PER_ITEM[set.group_id ?? 'qfp'] ?? 150;
  const secs = set.items.length * per;
  const title = `${groupName(set.group_id ?? '')} · ${set.title}`;

  if (!mode) {
    return (
      <>
        <header className="top"><div className="bar"><Link className="brand" to="/uebungen">← Übungssets</Link></div></header>
        <main className="wrap view"><div className="stack">
          <h1>{title}</h1>
          <p>{set.items.length} Fragen in {mmss(secs)} Minuten. Kein Taschenrechner, Notizpapier ist erlaubt.</p>
          {saveErr && <p className="notice warn">{saveErr}</p>}
          <section className="card stack">
            <h2>Modus wählen</h2>
            <button className="btn primary wide" onClick={() => setMode('exam')}>Prüfungsmodus: Lösungen am Schluss</button>
            <button className="btn wide" onClick={() => setMode('learn')}>Lernmodus: Erklärung nach jeder Frage</button>
          </section>
        </div></main>
      </>
    );
  }
  return (
    <QuestionRunner title={`${set.title} · ${mode === 'exam' ? 'Prüfungsmodus' : 'Lernmodus'}`} items={set.items} secs={secs} mode={mode}
      quitLabel="Set abbrechen" onQuit={() => setMode(null)}
      onDone={async (ans, _timedOut, sec) => {
        const answers = Object.fromEntries(set.items.map((it, k) => [it.id, ans[k]]));
        const { right, total } = scoreByGroup(set.items, answers);
        const score = Object.values(right).reduce((a, b) => a + b, 0);
        const scores = Object.fromEntries(Object.keys(total).map(g => [g, { right: right[g], total: total[g] }]));
        try {
          const attemptId = await api.saveAttempt({ set_id: set.id, kind: set.kind, mode, answers, scores, score, total: set.items.length, duration_sec: sec });
          nav(`/auswertung/${attemptId}`, { replace: true });
        } catch {
          setSaveErr('Dein Ergebnis konnte nicht gespeichert werden. Prüf deine Internetverbindung.');
          setMode(null);
        }
      }} />
  );
}
