import { useState } from 'react';
import type { StudyProfile } from '../lib/types';

const TRACKS = ['Humanmedizin', 'Zahnmedizin', 'Veterinärmedizin', 'Chiropraktik'];

export default function PlanForm({ initial, submitLabel, onSubmit }: { initial: StudyProfile | null; submitLabel: string; onSubmit: (p: StudyProfile) => Promise<void> | void }) {
  const [p, setP] = useState<StudyProfile>(initial ?? { track: 'Humanmedizin', minutes_per_day: 45, days_per_week: 5 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <form className="card stack" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setErr('');
      try { await onSubmit(p); } catch (x) { setErr((x as Error).message || 'Speichern hat nicht geklappt.'); } finally { setBusy(false); }
    }}>
      <div className="field">
        <label htmlFor="track">Studienrichtung</label>
        <select id="track" value={p.track} onChange={e => setP({ ...p, track: e.target.value })}>
          {TRACKS.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="field">
        <span className="lbl" id="mpd">Minuten pro Lerntag</span>
        <div className="seg" role="group" aria-labelledby="mpd">
          {[30, 45, 60, 90].map(v => <button type="button" key={v} aria-pressed={p.minutes_per_day === v} onClick={() => setP({ ...p, minutes_per_day: v })}>{v}</button>)}
        </div>
      </div>
      <div className="field">
        <span className="lbl" id="dpw">Lerntage pro Woche</span>
        <div className="seg" role="group" aria-labelledby="dpw">
          {[3, 4, 5, 6].map(v => <button type="button" key={v} aria-pressed={p.days_per_week === v} onClick={() => setP({ ...p, days_per_week: v })}>{v}</button>)}
        </div>
      </div>
      {err && <p className="notice warn" role="alert">{err}</p>}
      <button className="btn primary wide" disabled={busy}>{busy ? 'Speichert …' : submitLabel}</button>
    </form>
  );
}
