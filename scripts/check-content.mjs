// Validates content/bank.json. Exit code 1 on any error.
import { readFileSync } from 'node:fs';
const bank = JSON.parse(readFileSync(new URL('../content/bank.json', import.meta.url)));
const errors = [];
const ids = new Set();
for (const it of bank.items) {
  const where = `item ${it.id}`;
  if (ids.has(it.id)) errors.push(`${where}: duplicate id`);
  ids.add(it.id);
  if (!bank.groups[it.group]) errors.push(`${where}: unknown group "${it.group}"`);
  if (!Array.isArray(it.options) || it.options.length !== 5) errors.push(`${where}: needs exactly 5 options`);
  if (!Number.isInteger(it.correct) || it.correct < 0 || it.correct > 4) errors.push(`${where}: correct must be 0-4`);
  if (new Set(it.options || []).size !== (it.options || []).length) errors.push(`${where}: duplicate options`);
  if (!it.question?.trim()) errors.push(`${where}: missing question`);
  if (!it.explanation?.trim() || it.explanation.length < 20) errors.push(`${where}: explanation missing or too short`);
  if (JSON.stringify(it).includes('ß')) errors.push(`${where}: uses "ß" (Swiss spelling needs "ss")`);
}
for (const s of bank.sets) {
  const refs = s.spec.items ?? s.spec.sections.flatMap(x => x.items ?? []);
  for (const r of refs) if (!ids.has(r)) errors.push(`set ${s.id}: unknown item ${r}`);
  if (s.kind === 'practice' && !bank.groups[s.group]) errors.push(`set ${s.id}: unknown group`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`OK: ${bank.items.length} questions, ${bank.sets.length} sets`);
