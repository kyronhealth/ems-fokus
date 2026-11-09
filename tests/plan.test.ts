import { describe, expect, it } from 'vitest';
import { addDays, allocFor, daysLeft, monday, phaseOf, phases, scoreByGroup, weeksUntil, weights } from '../src/lib/plan';
import bank from '../content/bank.json';

const TEST = new Date(2027, 6, 9);

describe('dates and phases', () => {
  it('counts days to the test', () => {
    expect(daysLeft(new Date(2026, 10, 9), TEST)).toBe(242);
    expect(daysLeft(new Date(2027, 6, 9), TEST)).toBe(0);
    expect(daysLeft(new Date(2027, 7, 1), TEST)).toBe(0);
  });
  it('monday() returns the Monday of the week', () => {
    expect(monday(new Date(2026, 10, 12)).getDate()).toBe(9); // Thu 12 Nov -> Mon 9 Nov
    expect(monday(new Date(2026, 10, 15)).getDate()).toBe(9); // Sun 15 Nov -> Mon 9 Nov
  });
  it('phases are contiguous and end on test day', () => {
    const ps = phases(TEST);
    expect(ps.map(p => p.id)).toEqual(['grund', 'tempo', 'sim', 'final']);
    for (let i = 1; i < ps.length; i++) expect(ps[i].from!.toDateString()).toBe(addDays(ps[i - 1].to, 1).toDateString()); // calendar days (DST-safe)
    expect(ps[3].from!.getDay()).toBe(1);
    expect(ps[3].to).toEqual(TEST);
  });
  it('puts dates in the right phase', () => {
    expect(phaseOf(new Date(2026, 10, 9), TEST).id).toBe('grund');
    expect(phaseOf(new Date(2027, 3, 15), TEST).id).toBe('tempo');
    expect(phaseOf(new Date(2027, 5, 14), TEST).id).toBe('sim');
    expect(phaseOf(new Date(2027, 6, 7), TEST).id).toBe('final');
  });
  it('lists every week up to the test', () => {
    const w = weeksUntil(new Date(2026, 10, 9), TEST);
    expect(w[0].getDate()).toBe(9);
    expect(w.at(-1)!.getTime()).toBe(new Date(2027, 6, 5).getTime());
    expect(w.length).toBe(35);
  });
});

describe('weights and allocation', () => {
  it('gives weak groups more time, capped at 2.5x', () => {
    const w = Object.fromEntries(weights({ mng: 0, qfp: 1, tv: 2 / 3 }).map(g => [g.id, g.w]));
    expect(w.mng).toBe(2.5);
    expect(w.qfp).toBe(1);
    expect(w.tv).toBeCloseTo(1.5);
    expect(w.ksa).toBe(0.4);
    expect(w.dt).toBe(1.5); // not diagnosed yet -> middle weight
  });
  it('allocates roughly the weekly minutes', () => {
    const a = allocFor('grund', 45, 5, {});
    const sum = a.list.reduce((s, g) => s + g.min, 0);
    expect(a.weekly).toBe(225);
    expect(Math.abs(sum - 225)).toBeLessThanOrEqual(25);
    expect(a.list.every(g => g.min % 5 === 0)).toBe(true);
  });
  it('reserves 4 hours for the mock test in the simulation phase', () => {
    const a = allocFor('sim', 60, 6, {});
    expect(a.sim).toBe(true);
    expect(a.weekly).toBe(360 - 240);
  });
  it('final week is light', () => {
    const a = allocFor('final', 60, 5, {});
    expect(a.list).toEqual([]);
    expect(a.weekly).toBe(120);
  });
});

describe('scoring', () => {
  it('scores the diagnostic by group with the answer key', () => {
    const items = (bank as { items: { id: string; group: string; correct: number }[] }).items.filter(i => /^(mng|qfp|tv|dt|fl)\d$/.test(i.id));
    const allRight = Object.fromEntries(items.map(i => [i.id, i.correct]));
    const { right, total } = scoreByGroup(items, allRight);
    expect(total).toEqual({ mng: 3, qfp: 3, tv: 3, dt: 3, fakten: 3 });
    expect(Object.values(right).reduce((a, b) => a + b, 0)).toBe(15);
    const none = Object.fromEntries(items.map(i => [i.id, null]));
    expect(Object.values(scoreByGroup(items, none).right).reduce((a, b) => a + b, 0)).toBe(0);
  });
});
