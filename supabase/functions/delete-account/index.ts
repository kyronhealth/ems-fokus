// Deletes the signed-in student's account and all their data (profile, attempts, tutor usage, passes).
// Payment records remain at Stripe, as required for bookkeeping.
import { cors, json } from '../_shared/cors.ts';
import { admin, getUser } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const user = await getUser(req);
  if (!user) return json({ error: 'Bitte melde dich zuerst an.' }, 401);
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('delete-account', error);
    return json({ error: 'Das Konto konnte nicht gelöscht werden. Bitte schreib uns.' }, 500);
  }
  return json({ ok: true });
});
