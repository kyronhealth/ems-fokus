import { Link } from 'react-router-dom';
import type { Item } from '../lib/types';
import { LETTERS } from '../lib/format';
import { groupShort } from '../lib/ems';
import Lines from './Lines';

export default function ReviewList({ items, answers, showGroup, tutor }: { items: Item[]; answers: Record<string, number | null>; showGroup?: boolean; tutor?: boolean }) {
  return (
    <section className="card">
      {items.map((it, k) => {
        const a = answers[it.id];
        const ok = a === it.correct;
        return (
          <div className="review-item" key={it.id}>
            <span className="small muted">Frage {k + 1}{showGroup ? ` · ${groupShort(it.group)}` : ''}</span>
            <p className="question"><Lines text={it.question} /></p>
            <p>
              <span className={`verdict ${ok ? 'ok' : 'no'}`}>{ok ? 'Richtig' : 'Falsch'}</span>
              {' · Deine Antwort: '}{a === null || a === undefined ? 'keine' : `${LETTERS[a]} (${it.options[a]})`}
              {!ok && ` · Richtig: ${LETTERS[it.correct]} (${it.options[it.correct]})`}
            </p>
            <p className="small">{it.explanation}</p>
            {tutor && <Link className="btn small-btn" to={`/tutor/${it.id}${a !== null && a !== undefined ? `?chosen=${a}` : ''}`}>Tutor fragen</Link>}
          </div>
        );
      })}
    </section>
  );
}
