// All data access goes through here. With Supabase configured it talks to the database;
// in local preview (npm run dev without .env.local) it uses content/bank.json and the browser.
import { LOCAL, supabase } from './supabase';
import type { Attempt, Item, SetFull, SetMeta, StudyProfile } from './types';

type Bank = { sets: (Omit<SetMeta, 'item_count'> & { group?: string; spec: SetFull['spec'] })[]; items: Item[] };

async function bank(): Promise<Bank> {
  if (import.meta.env.DEV) return (await import('../../content/bank.json')).default as unknown as Bank;
  throw new Error('Die App ist nicht mit der Datenbank verbunden.');
}
const local = {
  get<T>(k: string, d: T): T { try { const v = localStorage.getItem('emsfokus.' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k: string, v: unknown) { try { localStorage.setItem('emsfokus.' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};
const itemIds = (spec: SetFull['spec']) => spec.items ?? (spec.sections ?? []).flatMap(s => (s.type === 'questions' ? s.items : []));

export async function getCatalog(): Promise<SetMeta[]> {
  if (LOCAL) {
    const b = await bank();
    return b.sets.map(s => ({ id: s.id, kind: s.kind, group_id: (s.group ?? null) as SetMeta['group_id'], title: s.title, free: s.free, position: s.position, item_count: itemIds(s.spec).length }));
  }
  const { data, error } = await supabase!.rpc('set_catalog');
  if (error) throw error;
  return data as SetMeta[];
}

/** Returns null when the set is locked (no pass) or does not exist. */
export async function getSet(id: string): Promise<SetFull | null> {
  let meta: Omit<SetFull, 'items'> | null = null;
  let items: Item[] = [];
  if (LOCAL) {
    const b = await bank();
    const s = b.sets.find(x => x.id === id);
    if (!s) return null;
    meta = { id: s.id, kind: s.kind, group_id: (s.group ?? null) as SetMeta['group_id'], title: s.title, free: s.free, position: s.position, item_count: itemIds(s.spec).length, spec: s.spec };
    items = b.items.filter(it => itemIds(s.spec).includes(it.id));
  } else {
    const { data } = await supabase!.from('sets').select('*').eq('id', id).maybeSingle();
    if (!data) return null;
    meta = data;
    const ids = itemIds(data.spec);
    const { data: rows, error } = await supabase!.from('items').select('body').in('id', ids);
    if (error) throw error;
    items = (rows ?? []).map(r => r.body as Item);
  }
  const order = itemIds(meta!.spec);
  items.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return { ...meta!, items };
}

export async function getItem(id: string): Promise<Item | null> {
  if (LOCAL) return (await bank()).items.find(i => i.id === id) ?? null;
  const { data } = await supabase!.from('items').select('body').eq('id', id).maybeSingle();
  return (data?.body as Item) ?? null;
}

export async function saveAttempt(a: Omit<Attempt, 'id' | 'created_at'>): Promise<string> {
  if (LOCAL) {
    const list = local.get<Attempt[]>('attempts', []);
    const id = crypto.randomUUID();
    list.unshift({ ...a, id, created_at: new Date().toISOString() });
    local.set('attempts', list);
    return id;
  }
  const { data, error } = await supabase!.from('attempts').insert(a).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function listAttempts(): Promise<Attempt[]> {
  if (LOCAL) return local.get<Attempt[]>('attempts', []);
  const { data, error } = await supabase!.from('attempts').select('*').order('created_at', { ascending: false }).limit(300);
  if (error) throw error;
  return data as Attempt[];
}

export async function getAttempt(id: string): Promise<Attempt | null> {
  if (LOCAL) return local.get<Attempt[]>('attempts', []).find(a => a.id === id) ?? null;
  const { data } = await supabase!.from('attempts').select('*').eq('id', id).maybeSingle();
  return (data as Attempt) ?? null;
}

export async function getProfile(userId: string): Promise<StudyProfile | null> {
  if (LOCAL) return local.get<StudyProfile | null>('profile', null);
  const { data } = await supabase!.from('profiles').select('track, minutes_per_day, days_per_week').eq('id', userId).maybeSingle();
  return (data as StudyProfile) ?? null;
}

export async function saveProfile(userId: string, p: StudyProfile) {
  if (LOCAL) { local.set('profile', p); return; }
  const { error } = await supabase!.from('profiles').upsert({ id: userId, ...p, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function hasAccess(): Promise<{ access: boolean; until: string | null }> {
  if (LOCAL) return { access: true, until: '2027-07-31' };
  const { data } = await supabase!.from('entitlements').select('valid_until').gt('valid_until', new Date().toISOString()).order('valid_until', { ascending: false }).limit(1);
  return { access: !!data?.length, until: data?.[0]?.valid_until ?? null };
}

async function invoke<T>(name: string, body?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase!.functions.invoke(name, { body });
  if (error) {
    let msg = 'Etwas ist schiefgelaufen. Bitte versuch es nochmals.';
    try { const j = await (error as { context?: Response }).context?.json(); if (j?.error) msg = j.error; } catch { /* keep default */ }
    throw new Error(msg);
  }
  return data as T;
}

export async function startCheckout() {
  if (LOCAL) throw new Error('Bezahlen ist in der lokalen Vorschau nicht verfügbar.');
  const { url } = await invoke<{ url: string }>('create-checkout');
  window.location.href = url;
}

export async function askTutor(p: { itemId: string; message: string; history: { role: 'user' | 'assistant'; content: string }[]; chosen?: number | null }): Promise<string> {
  if (LOCAL) return 'Lokale Vorschau: Hier antwortet später der Tutor. Er kennt die Aufgabe und die geprüfte Musterlösung.';
  const { answer } = await invoke<{ answer: string }>('tutor', { ...p });
  return answer;
}

export async function deleteAccount() {
  if (LOCAL) { ['attempts', 'profile', 'pendingDiag'].forEach(k => { try { localStorage.removeItem('emsfokus.' + k); } catch { /* ignore */ } }); return; }
  await invoke('delete-account');
  await supabase!.auth.signOut();
}

/* Diagnostic done before signing up is kept in this browser and saved once the student signs in. */
export const pending = {
  get: () => local.get<Omit<Attempt, 'id' | 'created_at'> | null>('pendingDiag', null),
  set: (a: Omit<Attempt, 'id' | 'created_at'>) => local.set('pendingDiag', a),
  clear: () => { try { localStorage.removeItem('emsfokus.pendingDiag'); } catch { /* ignore */ } },
};
