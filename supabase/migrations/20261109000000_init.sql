-- EMS Fokus: initial schema
-- Paid questions are protected by row-level security: a student can read a question only if it
-- belongs to a free set or the student has a valid season pass (row in entitlements).

create extension if not exists pgcrypto;

-- ---------- content ----------
create table public.items (
  id text primary key,
  group_id text not null,
  free boolean not null default false,
  body jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.sets (
  id text primary key,
  kind text not null check (kind in ('diagnostic', 'practice', 'simulation')),
  group_id text,
  title text not null,
  free boolean not null default false,
  position int not null default 0,
  item_count int not null default 0,
  spec jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- students ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  track text not null default 'Humanmedizin',
  minutes_per_day int not null default 45 check (minutes_per_day between 10 and 240),
  days_per_week int not null default 5 check (days_per_week between 1 and 7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product text not null,
  valid_until timestamptz not null,
  stripe_session_id text unique,
  amount_total int,
  currency text,
  created_at timestamptz not null default now()
);
create index entitlements_user_idx on public.entitlements (user_id);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  set_id text not null,
  kind text not null check (kind in ('diagnostic', 'practice', 'simulation')),
  mode text,
  answers jsonb not null,
  scores jsonb,
  score int not null,
  total int not null,
  duration_sec int,
  created_at timestamptz not null default now()
);
create index attempts_user_idx on public.attempts (user_id, created_at desc);

create table public.tutor_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (user_id, day)
);

-- ---------- access ----------
create or replace function public.has_access()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = auth.uid() and e.valid_until > now()
  );
$$;
grant execute on function public.has_access() to anon, authenticated;

-- Public catalogue: every student sees which sets exist (paid ones shown as locked).
create or replace function public.set_catalog()
returns table (id text, kind text, group_id text, title text, free boolean, "position" int, item_count int)
language sql stable security definer set search_path = public
as $$
  select s.id, s.kind, s.group_id, s.title, s.free, s.position, s.item_count
  from public.sets s order by s.position, s.id;
$$;
grant execute on function public.set_catalog() to anon, authenticated;

-- Counts one tutor question; returns false once the daily cap is reached. Only the server may call it.
create or replace function public.use_tutor(uid uuid, cap int)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare n int;
begin
  insert into public.tutor_usage as t (user_id, day, count)
  values (uid, (now() at time zone 'Europe/Zurich')::date, 1)
  on conflict (user_id, day) do update set count = t.count + 1
  where t.count < cap
  returning t.count into n;
  return n is not null;
end;
$$;
revoke execute on function public.use_tutor(uuid, int) from public, anon, authenticated;
grant execute on function public.use_tutor(uuid, int) to service_role;

-- ---------- row-level security ----------
alter table public.items enable row level security;
create policy items_read on public.items for select using (free or public.has_access());

alter table public.sets enable row level security;
create policy sets_read on public.sets for select using (free or public.has_access());

alter table public.profiles enable row level security;
create policy profiles_select on public.profiles for select using (id = auth.uid());
create policy profiles_insert on public.profiles for insert with check (id = auth.uid());
create policy profiles_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

alter table public.attempts enable row level security;
create policy attempts_select on public.attempts for select using (user_id = auth.uid());
create policy attempts_insert on public.attempts for insert with check (user_id = auth.uid());
create policy attempts_delete on public.attempts for delete using (user_id = auth.uid());

-- Only the Stripe webhook (service role) writes entitlements; students can read their own.
alter table public.entitlements enable row level security;
create policy entitlements_select on public.entitlements for select using (user_id = auth.uid());

alter table public.tutor_usage enable row level security;
create policy tutor_usage_select on public.tutor_usage for select using (user_id = auth.uid());
