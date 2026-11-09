import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import * as api from '../lib/api';
import { INTRO, SEC_PER_ITEM, groupName } from '../lib/ems';
import { mmss } from '../lib/format';
import { scoreByGroup } from '../lib/plan';
import type { Section, SetFull } from '../lib/types';
import QuestionRunner from '../components/QuestionRunner';

const SET_ID = 'diagnose-1';
type Step = { kind: 'intro'; section: Section; n: number } | { kind: 'run'; section: Section };

export default function Diagnose() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [set, setSet] = useState<SetFull | null | undefined>(undefined);
  const [step, setStep] = useState(0);
  const [note, setNote] = useState('');
  const answers = useRef<Record<string, number | null>>({});
  const t0 = useRef(Date.now());

  const saved = useRef(false);
  useEffect(() => { api.getSet(SET_ID).then(setSet).catch(() => setSet(null)); }, []);

  const sections = set?.spec.sections ?? [];
  const steps: Step[] = sections.flatMap((s, n) => [{ kind: 'intro' as const, section: s, n: n + 1 }, { kind: 'run' as const, section: s }]);
  const finished = !!set && step >= steps.length;

  useEffect(() => {
    if (!finished || !set || saved.current) return;
    saved.current = true;
    const { right, total } = scoreByGroup(set.items, answers.current);
    const scores = Object.fromEntries(Object.keys(total).map(g => [g, { right: right[g], total: total[g] }]));
    const score = Object.values(right).reduce((a, b) => a + b, 0);
    const attempt = { set_id: SET_ID, kind: 'diagnostic' as const, mode: 'exam' as const, answers: answers.current, scores, score, total: set.items.length, duration_sec: Math.round((Date.now() - t0.current) / 1000) };
    (async () => {
      if (user) { try { await api.saveAttempt(attempt); } catch { api.pending.set(attempt); } } else api.pending.set(attempt);
      nav('/ergebnis', { replace: true });
    })();
  }, [finished, set, user, nav]);

  if (set === undefined) return <p className="muted wrap view">Lädt …</p>;
  if (set === null) return <p className="wrap view">Die Diagnose ist gerade nicht verfügbar. Bitte versuch es später nochmals.</p>;
  const next = () => { setStep(s => s + 1); window.scrollTo(0, 0); };
  if (finished) return <p className="muted wrap view">Auswertung …</p>;

  const st = steps[step];
  const sec = st.section;
  const quit = () => nav('/');

  if (st.kind === 'intro') {
    const isLearn = sec.type === 'learn';
    const n = isLearn ? 0 : sec.items.length;
    const secs = isLearn ? sec.learnSec : n * (SEC_PER_ITEM[sec.group] ?? 150);
    const title = isLearn ? 'Fakten lernen: einprägen' : sec.group === 'fakten' ? 'Fakten lernen: abfragen' : groupName(sec.group);
    const text = isLearn ? INTRO.learn : INTRO[sec.group] ?? '';
    return (
      <>
        <header className="top"><div className="bar"><span className="secname">Diagnose · Abschnitt {st.n} von {sections.length}</span><span className="timer">{mmss(secs)}</span></div></header>
        <main className="wrap view"><div className="stack">
          <p className="muted small">Abschnitt {st.n} von {sections.length}</p>
          <h1>{title}</h1>
          <p>{text}</p>
          <div className="card"><ul className="plan-sections">{n > 0 && <li><span>Fragen</span><span className="t">{n}</span></li>}<li><span>Zeit</span><span className="t">{mmss(secs)}</span></li></ul></div>
          {note && <p className="notice warn">{note}</p>}
          <button className="btn primary wide" onClick={() => { setNote(''); next(); }}>Abschnitt starten</button>
          <button className="btn wide" onClick={quit}>Diagnose abbrechen</button>
        </div></main>
      </>
    );
  }

  if (sec.type === 'learn') return <LearnView key={step} sec={sec} onDone={next} />;

  const items = set.items.filter(it => sec.items.includes(it.id));
  return (
    <QuestionRunner key={step} title={groupName(sec.group)} items={items} secs={items.length * (SEC_PER_ITEM[sec.group] ?? 150)} mode="exam"
      quitLabel="Diagnose abbrechen" onQuit={quit}
      onDone={(ans, timedOut) => {
        items.forEach((it, k) => { answers.current[it.id] = ans[k]; });
        if (timedOut) setNote('Die Zeit für den letzten Abschnitt ist abgelaufen. Offene Fragen zählen als falsch, wie im echten Test.');
        next();
      }} />
  );
}

function LearnView({ sec, onDone }: { sec: Extract<Section, { type: 'learn' }>; onDone: () => void }) {
  const [left, setLeft] = useState(sec.learnSec);
  const doneRef = useRef(false);
  const finish = () => { if (!doneRef.current) { doneRef.current = true; onDone(); } };
  useEffect(() => {
    const end = Date.now() + sec.learnSec * 1000;
    const id = setInterval(() => { const l = (end - Date.now()) / 1000; setLeft(l); if (l <= 0) { clearInterval(id); finish(); } }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <header className="top"><div className="bar"><span className="secname">Fakten lernen: einprägen</span><span className={`timer ${left <= 30 ? 'low' : ''}`} role="timer">{mmss(left)}</span></div></header>
      <main className="wrap view"><div className="stack">
        <p className="muted">Präge dir alle Angaben ein. Danach kommt zuerst das Textverständnis, dann die Fragen.</p>
        <div className="profiles">
          {sec.profiles.map(p => (
            <div className="prof" key={p.name}>
              <span className="n">{p.name}</span>
              <dl><dt>Alter</dt><dd>{p.age}</dd><dt>Beruf</dt><dd>{p.job}</dd><dt>Diagnose</dt><dd>{p.dx}</dd><dt>Merkmal</dt><dd>{p.trait}</dd></dl>
            </div>
          ))}
        </div>
        <button className="btn wide" onClick={finish}>Ich bin fertig</button>
      </div></main>
    </>
  );
}
