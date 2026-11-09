import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

// Secret-key client: bypasses row-level security. Never expose this key to the browser.
// Supabase provides the new secret keys as JSON in SUPABASE_SECRET_KEYS; older projects use SUPABASE_SERVICE_ROLE_KEY.
function secretKey(): string {
  const keys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (keys) {
    try { const k = JSON.parse(keys); if (k.default) return k.default; } catch { /* fall through */ }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
}
export const admin = createClient(Deno.env.get('SUPABASE_URL')!, secretKey(), { auth: { persistSession: false } });

export async function getUser(req: Request) {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function hasAccess(userId: string): Promise<boolean> {
  const { data } = await admin
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .gt('valid_until', new Date().toISOString())
    .limit(1);
  return !!data?.length;
}
