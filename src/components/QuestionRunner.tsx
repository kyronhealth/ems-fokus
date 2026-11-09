import { useEffect, useRef, useState } from 'react';
import type { Item } from '../lib/types';
import { LETTERS, mmss } from '../lib/format';
import Exhibit from './Exhibit';
import Lines from './Lines';

type Props = {
  title: string;
  items: Item[];
  secs: number;
  mode: 'exam' | 'learn';
  onDone: (answers: (number | null)[], timedOut: boolean, usedSec: number) => void;
  onQuit?: () => void;
  quitLabel?: string;
};

export default function QuestionRunner({ title, items, secs, mode, onDone, onQuit, quitLabel = 'Abbrechen' }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => items.map(() => null));
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(secs);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const done = useRef(false);
  const t0 = useRef(Date.now());
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const finish = (timedOut: boolean) => {
    if (done.current) return;
    done.current = true;
    onDoneRef.current(answersRef.current, timedOut, Math.round((Date.now() - t0.current) / 1000));
  };

  useEffect(() => {
    const end = t0.current + secs * 1000;
    const id = setInterval(() => {
      const l = (end - Date.now()) / 1000;
      setLeft(l);
      if (l <= 0) { clearInterval(id); finish(true); }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { setConfirmSubmit(false); window.scrollTo(0, 0); }, [i]);

  const it = items[i];
  const learn = mode === 'learn';
  const isChecked = checked[i];
  const open = answers.filter(a => a === null).length;
  const choose = (k: number) => setAnswers(a => a.map((x, j) => (j === i ? k : x)));

  return (
    <>
      <header className="top">
        <div className="bar">
          <span className="secname">{title}</span>
          <span className={`timer ${left <= 60 ? 'low' : ''}`} role="timer" aria-label="Verbleibende Zeit">{mmss(left)}</span>
        </div>
      </header>
      <main className="wrap view">
        <div className="stack">
          <div className="qhead">
            <span className="muted small">Frage {i + 1} von {items.length}</span>
            <div className="dots" role="group" aria-label="Fragenübersicht">
              {items.map((_, k) => (
                <button key={k} className={`${answers[k] !== null ? 'answered' : ''} ${k === i ? 'current' : ''}`}
                  aria-label={`Frage ${k + 1}${answers[k] !== null ? ', beantwortet' : ''}`} onClick={() => setI(k)}>{k + 1}</button>
              ))}
            </div>
          </div>
          {it.passage && (
            <article className="passage" tabIndex={0} aria-label="Text">
              <h3>{it.passage.title}</h3>
              {it.passage.paras.map((p, k) => <p key={k}>{p}</p>)}
            </article>
          )}
          {it.stem && <p className="stem">{it.stem}</p>}
          {it.exhibit && <Exhibit ex={it.exhibit} />}
          <p className="question"><Lines text={it.question} /></p>
          <ul className="opts">
            {it.options.map((op, k) => {
              let cls = '';
              if (learn && isChecked) cls = k === it.correct ? 'right' : k === answers[i] ? 'wrong' : '';
              return (
                <li key={k}>
                  <button className={`opt ${cls}`} aria-pressed={answers[i] === k} disabled={learn && isChecked} onClick={() => choose(k)}>
                    <span className="b" aria-hidden="true">{LETTERS[k]}</span><span>{op}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {learn && isChecked && (
            <div className="expl">
              <p className={`verdict ${answers[i] === it.correct ? 'ok' : 'no'}`}>{answers[i] === it.correct ? 'Richtig.' : `Nicht ganz. Richtig ist ${LETTERS[it.correct]}.`}</p>
              <p>{it.explanation}</p>
            </div>
          )}
          <div className="qnav">
            <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)}>Zurück</button>
            {learn && !isChecked ? (
              <button className="btn primary" disabled={answers[i] === null} onClick={() => setChecked(c => c.map((x, j) => (j === i ? true : x)))}>Prüfen</button>
            ) : i < items.length - 1 ? (
              <button className="btn primary" onClick={() => setI(i + 1)}>Weiter</button>
            ) : (
              <button className="btn primary" onClick={() => (open && !confirmSubmit ? setConfirmSubmit(true) : finish(false))}>
                {open && confirmSubmit ? `${open} offen – trotzdem abgeben` : 'Abgeben'}
              </button>
            )}
          </div>
          {onQuit && (
            <button className="btn wide" onClick={() => (confirmQuit ? (done.current = true, onQuit()) : setConfirmQuit(true))}>
              {confirmQuit ? 'Wirklich abbrechen? Antworten gehen verloren.' : quitLabel}
            </button>
          )}
        </div>
      </main>
    </>
  );
}
