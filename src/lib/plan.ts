// Study plan logic. Pure functions, unit-tested in tests/plan.test.ts.
import { GROUPS, TEST_DATE, type GroupId } from './ems';

export type PhaseId = 'grund' | 'tempo' | 'sim' | 'final';
export type Phase = { id: PhaseId; name: string; from: Date | null; to: Date; what: string };
export type Scores = Partial<Record<GroupId, number>>; // share correct, 0..1

const DAY = 86_400_000;
export const midnight = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const monday = (d: Date) => { const x = midnight(d); return addDays(x, -((x.getDay() + 6) % 7)); };
export const daysLeft = (now: Date, test = TEST_DATE) => Math.max(0, Math.round((midnight(test).getTime() - midnight(now).getTime()) / DAY));

export function phases(test = TEST_DATE): Phase[] {
  const finalMon = monday(test);
  const simStart = addDays(finalMon, -28);
  const tempoStart = addDays(simStart, -70);
  return [
    { id: 'grund', name: 'Grundlagen', from: null, to: addDays(tempoStart, -1), what: 'Aufgabentypen verstehen, ohne Zeitdruck üben, Lösungswege aufschreiben.' },
    { id: 'tempo', name: 'Tempo', from: tempoStart, to: addDays(simStart, -1), what: 'Sets à 18 Fragen in echter Zeit, danach jeden Fehler auswerten.' },
    { id: 'sim', name: 'Simulation', from: simStart, to: addDays(finalMon, -1), what: 'Einmal pro Woche den ganzen Test am Vormittag, in echter Reihenfolge und Zeit.' },
    { id: 'final', name: 'Schlusswoche', from: finalMon, to: test, what: 'Nur noch leicht wiederholen. Schlaf, Anreise und Material planen.' },
  ];
}

export function phaseOf(d: Date, test = TEST_DATE): Phase {
  const ps = phases(test);
  const day = midnight(d);
  return ps.find(p => (!p.from || day >= p.from) && day <= p.to) ?? ps[ps.length - 1];
}

/** Weight per group: weaker diagnosed groups get up to 2.5x the time of a strong group. */
export function weights(scores: Scores = {}) {
  return GROUPS.map(g => {
    const s = scores[g.id];
    const w = g.fixedWeight ?? (s === undefined ? 1.5 : 1 + 1.5 * (1 - Math.min(1, Math.max(0, s))));
    return { ...g, w };
  });
}

export type Allocation = { sim: boolean; weekly: number; list: (ReturnType<typeof weights>[number] & { min: number })[] };

export function allocFor(phase: PhaseId, minutesPerDay: number, daysPerWeek: number, scores: Scores = {}): Allocation {
  let weekly = minutesPerDay * daysPerWeek;
  if (phase === 'final') return { sim: false, weekly: Math.round(weekly * 0.4), list: [] };
  const sim = phase === 'sim';
  if (sim) weekly = Math.max(0, weekly - 240); // one 4-hour mock test per week
  const ws = weights(scores);
  const sum = ws.reduce((a, g) => a + g.w, 0);
  const list = ws
    .map(g => ({ ...g, min: Math.round((weekly * g.w) / sum / 5) * 5 }))
    .filter(g => g.min > 0)
    .sort((a, b) => b.min - a.min);
  return { sim, weekly, list };
}

export function weeksUntil(now: Date, test = TEST_DATE): Date[] {
  const out: Date[] = [];
  for (let m = monday(now); m <= test; m = addDays(m, 7)) out.push(m);
  return out;
}

/** Share correct per group from answers. */
export function scoreByGroup(items: { id: string; group: string; correct: number }[], answers: Record<string, number | null>) {
  const right: Record<string, number> = {}, total: Record<string, number> = {};
  for (const it of items) {
    total[it.group] = (total[it.group] ?? 0) + 1;
    right[it.group] = (right[it.group] ?? 0) + (answers[it.id] === it.correct ? 1 : 0);
  }
  return { right, total };
}
