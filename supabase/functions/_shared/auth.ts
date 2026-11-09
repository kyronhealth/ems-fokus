import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

// Service-role client: bypasses row-level security. Never expose this key to the browser.
export const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);

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
