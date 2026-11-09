import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth';
import * as api from '../lib/api';
import { LETTERS } from '../lib/format';
import type { Item } from '../lib/types';
import Lines from '../components/Lines';

type Turn = { role: 'user' | 'assistant'; content: string };
const SUGGESTIONS = ['Warum ist meine Antwort falsch?', 'Wie gehe ich im Test am schnellsten vor?', 'Erklär mir den Rechenweg Schritt für Schritt.'];

export default function Tutor() {
  const { itemId = '' } = useParams();
  const [params] = useSearchParams();
  const chosen = params.has('chosen') ? Number(params.get('chosen')) : null;
  const { access } = useAuth();
  const [item, setItem] = useState<Item | null | undefined>(undefined);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { api.getItem(itemId).then(setItem).catch(() => setItem(null)); }, [itemId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns]);

  if (!access) return <div className="stack view"><h1>Tutor</h1><p>Der Tutor ist Teil des Saisonpasses.</p><Link className="btn primary" to="/kaufen">Saisonpass ansehen</Link></div>;
  if (item === undefined) return <p className="muted view">Lädt …</p>;
  if (!item) return <p className="view">Diese Aufgabe wurde nicht gefunden.</p>;

  const send = async (msg: string) => {
    const m = msg.trim();
    if (!m) { setErr('Schreib zuerst deine Frage.'); return; }
    setErr(''); setBusy(true);
    const history = turns;
    setTurns(t => [...t, { role: 'user', content: m }]); setText('');
    try {
      const answer = await api.askTutor({ itemId, message: m, history, chosen });
      setTurns(t => [...t, { role: 'assistant', content: answer }]);
    } catch (x) {
      setErr((x as Error).message); setTurns(history); setText(m);
    } finally { setBusy(false); }
  };

  return (
    <div className="stack view">
      <h1>Tutor</h1>
      <section className="card stack">
        {item.stem && <p className="small">{item.stem}</p>}
        <p className="question"><Lines text={item.question} /></p>
        <p className="small muted">Richtig: {LETTERS[item.correct]} ({item.options[item.correct]}){chosen !== null && chosen !== item.correct ? ` · deine Antwort: ${LETTERS[chosen]}` : ''}</p>
      </section>
      <div className="chat" aria-live="polite">
        {turns.length === 0 && <p className="muted small">Frag, was dir an dieser Aufgabe unklar ist. Bis zu 20 Fragen pro Tag.</p>}
        {turns.map((t, k) => <div key={k} className={`msg ${t.role}`}>{t.content}</div>)}
        {busy && <div className="msg assistant muted">Der Tutor schreibt …</div>}
        <div ref={endRef} />
      </div>
      {turns.length === 0 && <div className="chips">{SUGGESTIONS.map(s => <button key={s} className="chip" onClick={() => send(s)} disabled={busy}>{s}</button>)}</div>}
      <form className="stack" onSubmit={e => { e.preventDefault(); send(text); }}>
        <label htmlFor="q" className="lbl">Deine Frage</label>
        <textarea id="q" rows={3} maxLength={800} value={text} onChange={e => { setText(e.target.value); setErr(''); }} aria-invalid={!!err} />
        {err && <span className="err" role="alert">{err}</span>}
        <button className="btn primary" disabled={busy}>Fragen</button>
      </form>
      <p className="small muted">Der Tutor ist eine KI. Er kennt die geprüfte Lösung, kann sich aber trotzdem irren.</p>
    </div>
  );
}
