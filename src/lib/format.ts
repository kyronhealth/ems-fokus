export const fmtLong = new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
export const fmtShort = new Intl.DateTimeFormat('de-CH', { day: 'numeric', month: 'short' });
export const mmss = (sec: number) => {
  const s = Math.max(0, Math.ceil(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
export const LETTERS = ['A', 'B', 'C', 'D', 'E'];
export const stripTags = (s: string) => s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
