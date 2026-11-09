import type { GroupId } from './ems';

export type Exhibit =
  | { title: string; head: string[]; rows: string[][]; note?: string }
  | { title: string; labels: string[]; values: number[]; xLabel: string };

export type Item = {
  id: string;
  group: GroupId;
  stem?: string;
  question: string; // may contain <br>
  options: string[];
  correct: number;
  explanation: string;
  exhibit?: Exhibit;
  passage?: { title: string; paras: string[] };
};

export type Profile = { name: string; age: number; job: string; dx: string; trait: string };

export type Section =
  | { type: 'questions'; group: GroupId; items: string[] }
  | { type: 'learn'; group: GroupId; learnSec: number; profiles: Profile[] };

export type SetMeta = { id: string; kind: 'diagnostic' | 'practice' | 'simulation'; group_id: GroupId | null; title: string; free: boolean; position: number; item_count: number };
export type SetFull = SetMeta & { spec: { items?: string[]; sections?: Section[] }; items: Item[] };

export type Attempt = {
  id: string;
  set_id: string;
  kind: 'diagnostic' | 'practice' | 'simulation';
  mode: 'exam' | 'learn' | null;
  answers: Record<string, number | null>; // itemId -> chosen option
  scores: Record<string, { right: number; total: number }> | null; // per group
  score: number;
  total: number;
  duration_sec: number | null;
  created_at: string;
};

export type StudyProfile = { track: string; minutes_per_day: number; days_per_week: number };
