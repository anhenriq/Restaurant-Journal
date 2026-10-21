-- Restaurant Journal: database setup for Supabase.
--
-- How to run it: Supabase dashboard > SQL Editor > New query > paste this whole file > Run.
-- It is safe to read first; nothing here touches data you already have in other tables.
-- Run it once. (To start over in a scratch project, drop the two tables and run it again.)
--
-- What it sets up:
--   * restaurants and visits tables (matching src/types/index.ts)
--   * row-level security, so every signed-in person can only see and change their own rows
--   * a trigger that keeps restaurants.status correct ("visited" exactly when it has a visit)
--   * a trigger that keeps updated_at current

-- ---------------------------------------------------------------- tables

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  neighborhood text not null check (length(btrim(neighborhood)) > 0),
  cuisine text not null default '',
  status text not null default 'want_to_go' check (status in ('want_to_go', 'visited')),
  recommended_by text,
  why_saved text not null default '',
  vibe_tags text[] not null default '{}',
  price_level smallint not null check (price_level between 1 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  visit_date date not null,
  went_with text not null default '',
  what_i_ordered text not null default '',
  journal_entry text not null default '',
  photos text[] not null default '{}',
  would_go_back boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index restaurants_user_created_idx on public.restaurants (user_id, created_at desc);
create index visits_user_date_idx on public.visits (user_id, visit_date desc);
create index visits_restaurant_idx on public.visits (restaurant_id);

-- ---------------------------------------------------------------- privacy (row-level security)

alter table public.restaurants enable row level security;
alter table public.visits enable row level security;

-- Signed-in people can read and write only rows that belong to them.
create policy "Own restaurants" on public.restaurants
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Own visits" on public.visits
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- triggers

create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger restaurants_set_updated_at before update on public.restaurants
  for each row execute function public.set_updated_at();
create trigger visits_set_updated_at before update on public.visits
  for each row execute function public.set_updated_at();

-- A restaurant is 'visited' exactly when it has at least one visit.
-- Runs after a visit is added or deleted (including when a restaurant is deleted along with its visits).
create function public.sync_restaurant_status() returns trigger
language plpgsql
set search_path = ''
as $$
declare
  rid uuid := coalesce(new.restaurant_id, old.restaurant_id);
begin
  update public.restaurants
     set status = case
           when exists (select 1 from public.visits where restaurant_id = rid) then 'visited'
           else 'want_to_go'
         end
   where id = rid;
  return null;
end;
$$;

create trigger visits_sync_status after insert or delete on public.visits
  for each row execute function public.sync_restaurant_status();
