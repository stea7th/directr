-- Directr creator-direction model.
-- Additive migration: existing auth.users, profiles, billing, and jobs remain unchanged.

create table if not exists public.creator_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  niche text not null default '',
  goals text[] not null default '{}',
  audience text not null default '',
  voice_description text not null default '',
  preferred_formats text[] not null default '{}',
  disliked_formats text[] not null default '{}',
  available_locations text[] not null default '{}',
  equipment text[] not null default '{}',
  posting_frequency text not null default '',
  reference_creators text[] not null default '{}',
  reference_videos text[] not null default '{}',
  topics text[] not null default '{}',
  topics_to_avoid text[] not null default '{}',
  platforms text[] not null default '{}',
  creator_dna_score integer not null default 0 check (creator_dna_score between 0 and 100),
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_references (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  creator_name text,
  notes text,
  extracted_style_data jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.directions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_idea text not null,
  angle text not null,
  hook text not null,
  reasoning text,
  format text,
  duration integer,
  delivery_notes text[] not null default '{}',
  caption text,
  status text not null default 'ready' check (status in ('ready', 'filming', 'filmed', 'posted')),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.direction_shots (
  id uuid primary key default gen_random_uuid(),
  direction_id uuid not null references public.directions(id) on delete cascade,
  order_index integer not null,
  title text not null,
  description text,
  dialogue text,
  framing text,
  duration integer,
  completed boolean not null default false,
  unique (direction_id, order_index)
);

create table if not exists public.content_posts (
  id uuid primary key default gen_random_uuid(),
  direction_id uuid not null references public.directions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text,
  post_url text,
  posted_at timestamptz,
  performance_data jsonb,
  creator_rating text check (creator_rating in ('loved', 'fine', 'hated')),
  created_at timestamptz not null default now()
);

create index if not exists creator_references_user_id_idx on public.creator_references(user_id, created_at desc);
create index if not exists directions_user_id_idx on public.directions(user_id, created_at desc);
create index if not exists direction_shots_direction_id_idx on public.direction_shots(direction_id, order_index);
create index if not exists content_posts_user_id_idx on public.content_posts(user_id, created_at desc);

alter table public.creator_profiles enable row level security;
alter table public.creator_references enable row level security;
alter table public.directions enable row level security;
alter table public.direction_shots enable row level security;
alter table public.content_posts enable row level security;

grant select, insert, update, delete on public.creator_profiles to authenticated;
grant select, insert, update, delete on public.creator_references to authenticated;
grant select, insert, update, delete on public.directions to authenticated;
grant select, insert, update, delete on public.direction_shots to authenticated;
grant select, insert, update, delete on public.content_posts to authenticated;

drop policy if exists "Creators manage their own profile" on public.creator_profiles;
create policy "Creators manage their own profile" on public.creator_profiles
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Creators manage their own references" on public.creator_references;
create policy "Creators manage their own references" on public.creator_references
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Creators manage their own directions" on public.directions;
create policy "Creators manage their own directions" on public.directions
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "Creators manage their own direction shots" on public.direction_shots;
create policy "Creators manage their own direction shots" on public.direction_shots
  for all to authenticated using (
    exists (select 1 from public.directions where directions.id = direction_id and directions.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.directions where directions.id = direction_id and directions.user_id = (select auth.uid()))
  );

drop policy if exists "Creators manage their own posts" on public.content_posts;
create policy "Creators manage their own posts" on public.content_posts
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
