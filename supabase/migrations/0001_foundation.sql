-- Stage 1 foundation: territories, education systems, schools, profiles and
-- roles, curricula (owned by one school or one system), and the audit log.
-- Row-level security is on for every table.

create type public.app_role as enum ('global_admin', 'school_admin', 'teacher', 'parent', 'student');

create table public.territories (
  code text primary key check (code ~ '^[A-Z]{2,3}$'),
  name text not null unique check (length(trim(name)) > 0),
  currency text not null default 'XCD' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'planned' check (status in ('planned', 'live')),
  created_at timestamptz not null default now()
);

-- A national system belongs to one territory; a regional body (e.g. CXC) has none.
create table public.education_systems (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (length(trim(code)) > 0),
  name text not null check (length(trim(name)) > 0),
  level text not null check (level in ('primary', 'secondary', 'tertiary')),
  territory_code text references public.territories(code) on update cascade on delete restrict,
  created_at timestamptz not null default now()
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  territory_code text not null references public.territories(code) on update cascade on delete restrict,
  level text not null default 'primary' check (level in ('primary', 'secondary', 'primary_secondary', 'tertiary')),
  status text not null default 'listed' check (status in ('listed', 'claimed', 'subscribed')),
  created_at timestamptz not null default now(),
  unique (territory_code, name)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  role public.app_role not null default 'parent',
  school_id uuid references public.schools(id) on delete set null,
  territory_code text references public.territories(code) on update cascade on delete set null,
  created_at timestamptz not null default now()
);

create table public.curricula (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (length(trim(subject)) > 0),
  level text not null default '',
  school_id uuid references public.schools(id) on delete cascade,
  education_system_id uuid references public.education_systems(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'processing', 'in_review', 'live', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curriculum_has_one_owner check (num_nonnulls(school_id, education_system_id) = 1)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target text not null default '',
  details jsonb not null default '{}'::jsonb,
  ai_provider text,
  ai_cost_usd numeric(10, 4),
  created_at timestamptz not null default now()
);
create index audit_log_recent on public.audit_log (created_at desc);

-- Helpers ------------------------------------------------------------------

create function public.my_role() returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- A Global Administrator counts only after two-factor sign-in (aal2).
create function public.is_global_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'global_admin')
     and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
$$;

-- Every new sign-up gets a profile (role parent until an administrator changes it).
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Only a Global Administrator changes roles, and never their own.
-- Server-side setup calls (no signed-in user) are allowed, for the first administrator.
create function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    if not public.is_global_admin() then
      raise exception 'Only a Global Administrator can change roles' using errcode = '42501';
    end if;
    if old.id = auth.uid() then
      raise exception 'You cannot change your own role' using errcode = '42501';
    end if;
  end if;
  if new.email is distinct from old.email and auth.uid() is not null then
    raise exception 'Email is managed by sign-in' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

create function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger curricula_touch before update on public.curricula
  for each row execute function public.touch_updated_at();

-- The only way to write to the audit log; the actor is always the caller.
create function public.log_action(p_action text, p_target text default '', p_details jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not signed in' using errcode = '42501'; end if;
  insert into public.audit_log (actor_id, action, target, details) values (auth.uid(), p_action, p_target, coalesce(p_details, '{}'::jsonb));
end $$;

-- Row-level security ------------------------------------------------------

alter table public.territories enable row level security;
alter table public.education_systems enable row level security;
alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.curricula enable row level security;
alter table public.audit_log enable row level security;

-- Reference data anyone can read (sign-up needs territories and schools).
create policy territories_read on public.territories for select to anon, authenticated using (true);
create policy territories_admin on public.territories for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy systems_read on public.education_systems for select to anon, authenticated using (true);
create policy systems_admin on public.education_systems for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());
create policy schools_read on public.schools for select to anon, authenticated using (true);
create policy schools_admin on public.schools for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

-- People see their own profile; Global Administrators see and edit everyone's.
create policy profiles_self_read on public.profiles for select to authenticated using (id = auth.uid() or public.is_global_admin());
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid() or public.is_global_admin()) with check (id = auth.uid() or public.is_global_admin());
create policy profiles_admin_delete on public.profiles for delete to authenticated using (public.is_global_admin() and id <> auth.uid());

-- Live curricula are visible to signed-in people; administrators manage all.
create policy curricula_read on public.curricula for select to authenticated using (status = 'live' or public.is_global_admin());
create policy curricula_admin on public.curricula for all to authenticated using (public.is_global_admin()) with check (public.is_global_admin());

create policy audit_admin_read on public.audit_log for select to authenticated using (public.is_global_admin());

grant usage on schema public to anon, authenticated;
grant select on public.territories, public.education_systems, public.schools to anon;
grant select, insert, update, delete on public.territories, public.education_systems, public.schools, public.curricula to authenticated;
grant select, update, delete on public.profiles to authenticated;
grant select on public.audit_log to authenticated;
grant execute on function public.my_role(), public.is_global_admin(), public.log_action(text, text, jsonb) to authenticated;
revoke execute on function public.log_action(text, text, jsonb) from anon, public;

-- Reference data ----------------------------------------------------------

insert into public.territories (code, name, currency, status) values
  ('BB', 'Barbados', 'BBD', 'live'),
  ('JM', 'Jamaica', 'JMD', 'planned'),
  ('VC', 'St. Vincent and the Grenadines', 'XCD', 'planned'),
  ('TT', 'Trinidad and Tobago', 'TTD', 'planned')
on conflict do nothing;

insert into public.education_systems (code, name, level, territory_code) values
  ('CSEC', 'Caribbean Secondary Education Certificate', 'secondary', null),
  ('CAPE', 'Caribbean Advanced Proficiency Examination', 'tertiary', null),
  ('BB-PRI', 'Barbados National Primary Curriculum', 'primary', 'BB'),
  ('BSSEE', 'Barbados Secondary Schools'' Entrance Examination', 'primary', 'BB')
on conflict do nothing;
