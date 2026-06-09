-- ============================================================================
-- Live Long Collective — schema, row-level security, and onboarding RPCs
-- Apply: Supabase Dashboard → SQL Editor (paste & run)  OR  `supabase db push`
-- Model: coaches/clients store their full app object in `data` (jsonb); each
-- client's per-day data lives in one client_state row whose columns mirror the
-- app's state slices 1:1 — so the client wiring is a direct map, no renaming.
-- ============================================================================

create table if not exists coaches (
  id         text primary key,
  auth_uid   uuid unique references auth.users(id) on delete set null,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists clients (
  id         text primary key,
  coach_id   text references coaches(id) on delete set null,
  auth_uid   uuid unique references auth.users(id) on delete set null,
  email      text,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists clients_coach_idx on clients(coach_id);
create index if not exists clients_email_idx on clients(lower(email));

create table if not exists client_state (
  client_id  text primary key,           -- a client id, or '_uncli' for class sessions
  program    jsonb,
  logs       jsonb default '{}'::jsonb,
  notes      jsonb default '[]'::jsonb,
  meals      jsonb default '[]'::jsonb,
  goals      jsonb default '[]'::jsonb,
  checkins   jsonb default '[]'::jsonb,
  bodylog    jsonb default '[]'::jsonb,
  photos     jsonb default '[]'::jsonb,
  misses     jsonb default '[]'::jsonb,
  readiness  jsonb default '[]'::jsonb,
  pillaracts jsonb default '{}'::jsonb,
  attendance jsonb default '[]'::jsonb,
  formvids   jsonb default '[]'::jsonb,
  xp         int default 0,
  freezes    int default 0,
  ckday      text,
  updated_at timestamptz default now()
);

create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text check (role in ('coach','athlete')) not null,
  coach_id   text references coaches(id) on delete set null,
  client_id  text references clients(id) on delete set null,
  created_at timestamptz default now()
);

-- ---------- identity helpers (SECURITY DEFINER avoids RLS recursion) --------
create or replace function auth_role() returns text
  language sql stable security definer set search_path = public as
$$ select role from profiles where id = auth.uid() $$;
create or replace function auth_coach_id() returns text
  language sql stable security definer set search_path = public as
$$ select coach_id from profiles where id = auth.uid() $$;
create or replace function auth_client_id() returns text
  language sql stable security definer set search_path = public as
$$ select client_id from profiles where id = auth.uid() $$;

-- ---------- RLS -------------------------------------------------------------
alter table coaches      enable row level security;
alter table clients      enable row level security;
alter table client_state enable row level security;
alter table profiles     enable row level security;

create policy profiles_self_select on profiles for select using (id = auth.uid());
create policy profiles_self_insert on profiles for insert with check (id = auth.uid());
create policy profiles_self_update on profiles for update using (id = auth.uid());

create policy coaches_select      on coaches for select using (auth_uid = auth.uid() or id = auth_coach_id());
create policy coaches_self_insert on coaches for insert with check (auth_uid = auth.uid());
create policy coaches_self_update on coaches for update using (auth_uid = auth.uid());

create policy clients_coach_all   on clients for all
  using (coach_id = auth_coach_id()) with check (coach_id = auth_coach_id());
create policy clients_self_select on clients for select using (auth_uid = auth.uid());
create policy clients_self_update on clients for update using (auth_uid = auth.uid());

create policy state_coach_all on client_state for all
  using (client_id = '_uncli' or client_id in (select id from clients where coach_id = auth_coach_id()))
  with check (client_id = '_uncli' or client_id in (select id from clients where coach_id = auth_coach_id()));
create policy state_self_all on client_state for all
  using (client_id = auth_client_id()) with check (client_id = auth_client_id());

-- ---------- onboarding RPCs -------------------------------------------------
-- First-time coach: create coaches row + bind profile to the signed-in user.
create or replace function setup_coach(p_name text, p_initials text)
returns text language plpgsql security definer set search_path = public as $$
declare cid text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into cid from coaches where auth_uid = auth.uid();
  if cid is null then
    cid := 'co_' || replace(auth.uid()::text,'-','');
    insert into coaches(id, auth_uid, data)
      values (cid, auth.uid(), jsonb_build_object('name',p_name,'initials',coalesce(p_initials,'CO'),'role','Lead Coach','accent','#FF6B2C'));
  end if;
  insert into profiles(id, role, coach_id) values (auth.uid(),'coach',cid)
    on conflict (id) do update set role='coach', coach_id=cid;
  return cid;
end $$;

-- Athlete signup: link signed-in user to a pre-created client row by matching email.
create or replace function link_athlete()
returns text language plpgsql security definer set search_path = public as $$
declare cid text; em text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select email into em from auth.users where id = auth.uid();
  select id into cid from clients where lower(email) = lower(em) and auth_uid is null limit 1;
  if cid is null then raise exception 'no client invite found for %', em; end if;
  update clients set auth_uid = auth.uid() where id = cid;
  insert into profiles(id, role, client_id) values (auth.uid(),'athlete',cid)
    on conflict (id) do update set role='athlete', client_id=cid;
  return cid;
end $$;
