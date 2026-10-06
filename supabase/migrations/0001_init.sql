-- Active — V1 schema
-- Run in Supabase SQL editor (or via supabase db push). Idempotent-ish: drops first.

create extension if not exists "pgcrypto";

drop table if exists ratings, reports, messages, conversations, service_areas, provider_services, providers, categories, profiles cascade;

-- PROFILES: one row per auth user. role helps route UX, both = can be seeker and provider.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'seeker' check (role in ('seeker','provider','both')),
  created_at timestamptz not null default now()
);

-- CATEGORIES: admin-managed in V1 (seeded below).
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

-- PROVIDERS: the discoverable listing. One listing per user in V1.
create table providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  business_name text not null,
  description text,
  phone text not null,
  whatsapp text,
  photo_url text,
  lat double precision,
  lng double precision,
  status text not null default 'draft' check (status in ('draft','active','suspended')),
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);
create index on providers (status);

-- PROVIDER_SERVICES: which categories a provider offers.
create table provider_services (
  provider_id uuid not null references providers(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (provider_id, category_id)
);

-- SERVICE_AREAS: where the provider operates (names, not home addresses).
create table service_areas (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  area_name text not null,
  lat double precision,
  lng double precision
);
create index on service_areas (area_name);

-- CONVERSATIONS: 1:1 seeker<->provider.
create table conversations (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references profiles(id) on delete cascade,
  provider_id uuid not null references providers(id) on delete cascade,
  status text not null default 'active' check (status in ('active','expired','reported')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

-- MESSAGES: body expires; conversation metadata (who/when/report flags) does not.
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);
create index on messages (conversation_id, created_at);

-- REPORTS: either side can report. Tied to conversation metadata for investigation.
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  reported_provider_id uuid references providers(id) on delete set null,
  reason text not null,
  status text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at timestamptz not null default now()
);

-- RATINGS: only after a conversation existed between the two sides.
create table ratings (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  seeker_id uuid not null references profiles(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (provider_id, seeker_id, conversation_id)
);

-- RLS ------------------------------------------------------------------
alter table profiles, categories, providers, provider_services, service_areas,
            conversations, messages, reports, ratings enable row level security;

create policy "profiles: read all basic" on profiles for select using (true);
create policy "profiles: insert own" on profiles for insert with check (auth.uid() = id);
create policy "profiles: update own" on profiles for update using (auth.uid() = id);

create policy "categories: read all" on categories for select using (true);

create policy "providers: read active" on providers for select using (status = 'active');
create policy "providers: owner read own" on providers for select using (auth.uid() = user_id);
create policy "providers: owner insert" on providers for insert with check (auth.uid() = user_id);
create policy "providers: owner update" on providers for update using (auth.uid() = user_id);

create policy "provider_services: read all" on provider_services for select using (true);
create policy "provider_services: owner write" on provider_services for all
  using (exists (select 1 from providers p where p.id = provider_id and p.user_id = auth.uid()))
  with check (exists (select 1 from providers p where p.id = provider_id and p.user_id = auth.uid()));

create policy "service_areas: read all" on service_areas for select using (true);
create policy "service_areas: owner write" on service_areas for all
  using (exists (select 1 from providers p where p.id = provider_id and p.user_id = auth.uid()))
  with check (exists (select 1 from providers p where p.id = provider_id and p.user_id = auth.uid()));

create policy "conversations: participant read" on conversations for select
  using (auth.uid() = seeker_id or exists (select 1 from providers p where p.id = provider_id and p.user_id = auth.uid()));
create policy "conversations: seeker create" on conversations for insert
  with check (auth.uid() = seeker_id);

create policy "messages: participant read" on messages for select
  using (exists (select 1 from conversations c where c.id = conversation_id
    and (c.seeker_id = auth.uid() or exists (select 1 from providers p where p.id = c.provider_id and p.user_id = auth.uid()))));
create policy "messages: participant send" on messages for insert
  with check (auth.uid() = sender_id and exists (select 1 from conversations c where c.id = conversation_id
    and (c.seeker_id = auth.uid() or exists (select 1 from providers p where p.id = c.provider_id and p.user_id = auth.uid()))));

create policy "reports: insert authed" on reports for insert with check (auth.uid() = reporter_id);
create policy "reports: read own" on reports for select using (auth.uid() = reporter_id);

create policy "ratings: read all" on ratings for select using (true);
create policy "ratings: seeker who conversed writes" on ratings for insert
  with check (auth.uid() = seeker_id and exists (select 1 from conversations c where c.id = conversation_id and c.seeker_id = auth.uid()));
