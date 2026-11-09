// AI tutor for one question. Season pass required; daily cap per student.
// The checked explanation is passed to the model so it explains, not re-solves.
import { cors, json } from '../_shared/cors.ts';
import { admin, getUser, hasAccess } from '../_shared/auth.ts';

const CAP = Number(Deno.env.get('TUTOR_DAILY_CAP') ?? 20);
const MODEL = Deno.env.get('TUTOR_MODEL') ?? 'claude-haiku-5-5';
const L = ['A', 'B', 'C', 'D', 'E'];
const strip = (s: string) => s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');

type Turn = { role: 'user' | 'assistant'; content: string };

function cleanHistory(h: unknown): Turn[] {
  if (!Array.isArray(h)) return [];
  const turns = h
    .filter((t): t is Turn => !!t && (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string')
    .map((t) => ({ role: t.role, content: t.content.slice(0, 2000) }))
    .slice(-6);
  while (turns.length && turns[0].role !== 'user') turns.shift();
  return turns;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const user = await getUser(req);
    if (!user) return json({ error: 'Bitte melde dich zuerst an.' }, 401);
    if (!(await hasAccess(user.id))) return json({ error: 'Der Tutor ist Teil des Saisonpasses.' }, 403);

    const { itemId, message, history, chosen } = await req.json().catch(() => ({}));
    if (typeof itemId !== 'string' || typeof message !== 'string' || !message.trim()) {
      return json({ error: 'Ungültige Anfrage.' }, 400);
    }
    if (message.length > 800) return json({ error: 'Bitte stell deine Frage kürzer (höchstens 800 Zeichen).' }, 400);

    const { data: item } = await admin.from('items').select('body').eq('id', itemId).single();
    if (!item) return json({ error: 'Diese Aufgabe wurde nicht gefunden.' }, 404);

    const { data: allowed, error: capError } = await admin.rpc('use_tutor', { uid: user.id, cap: CAP });
    if (capError) throw capError;
    if (!allowed) return json({ error: `Du hast heute schon ${CAP} Tutor-Fragen gestellt. Morgen geht es weiter.` }, 429);

    const b = item.body;
    const task = [
      b.passage ? `Text «${b.passage.title}»:\n${b.passage.paras.join('\n')}` : '',
      b.exhibit ? `Abbildung: ${JSON.stringify(b.exhibit)}` : '',
      b.stem ?? '',
      `Frage: ${strip(b.question)}`,
      b.options.map((o: string, i: number) => `(${L[i]}) ${o}`).join('\n'),
      `Richtige Antwort: ${L[b.correct]}`,
      `Geprüfte Musterlösung: ${b.explanation}`,
      typeof chosen === 'number' && chosen >= 0 && chosen <= 4 ? `Gewählte Antwort der lernenden Person: ${L[chosen]}` : '',
    ].filter(Boolean).join('\n\n');

    const system = [
      'Du bist ein geduldiger Tutor für den Eignungstest für das Medizinstudium (EMS) in der Schweiz.',
      'Antworte auf Schweizer Hochdeutsch (immer «ss», nie «ß»), klar und freundlich, in höchstens 150 Wörtern.',
      'Erkläre Schritt für Schritt, wie man im Test ohne Taschenrechner vorgeht.',
      'Halte dich an die geprüfte Musterlösung und widersprich ihr nicht.',
      'Beantworte nur Fragen zu dieser Aufgabe und zur EMS-Vorbereitung; lenke andere Themen freundlich zurück.',
      'Gib keine medizinischen Ratschläge zu persönlichen Beschwerden.',
      '',
      'Aufgabe:',
      task,
    ].join('\n');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system,
        messages: [...cleanHistory(history), { role: 'user', content: message.trim() }],
      }),
    });
    if (!res.ok) {
      console.error('anthropic', res.status, await res.text());
      return json({ error: 'Der Tutor ist gerade nicht erreichbar. Bitte versuch es gleich nochmals.' }, 502);
    }
    const out = await res.json();
    const answer = (out.content ?? [])
      .filter((c: { type: string }) => c.type === 'text')
      .map((c: { text: string }) => c.text)
      .join('\n')
      .trim();
    return json({ answer });
  } catch (e) {
    console.error('tutor', e);
    return json({ error: 'Etwas ist schiefgelaufen. Bitte versuch es nochmals.' }, 500);
  }
});
