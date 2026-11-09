// Copies content/bank.json into Supabase. Run on your own computer:
//   npm run import-content
// Needs VITE_SUPABASE_URL and SUPABASE_SECRET_KEY (sb_secret_...) in .env.local (never commit that file).
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Set VITE_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local'); process.exit(1); }
const db = createClient(url, key, { auth: { persistSession: false } });
const bank = JSON.parse(readFileSync(new URL('../content/bank.json', import.meta.url)));

const freeItems = new Set();
for (const s of bank.sets) if (s.free) (s.spec.items ?? s.spec.sections.flatMap(x => x.items ?? [])).forEach(id => freeItems.add(id));

const itemRows = bank.items.map(({ id, group, ...body }) => ({ id, group_id: group, free: freeItems.has(id), body: { id, group, ...body } }));
const setRows = bank.sets.map(s => ({
  id: s.id, kind: s.kind, group_id: s.group ?? null, title: s.title, free: !!s.free, position: s.position ?? 0, spec: s.spec,
  item_count: (s.spec.items ?? s.spec.sections.flatMap(x => x.items ?? [])).length,
}));

let r = await db.from('items').upsert(itemRows);
if (r.error) { console.error('items:', r.error.message); process.exit(1); }
r = await db.from('sets').upsert(setRows);
if (r.error) { console.error('sets:', r.error.message); process.exit(1); }
console.log(`Imported ${itemRows.length} questions (${freeItems.size} free) and ${setRows.length} sets.`);
