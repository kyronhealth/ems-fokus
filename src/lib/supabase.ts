import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'pkce' } }) : null;

/** Local preview: no Supabase configured. Only works with `npm run dev`; content is never bundled for production. */
export const LOCAL = !supabase;
