-- Active — mock provider data (3 providers), fully self-contained.
-- Run once in Supabase SQL Editor. Creates auth users, profiles, listings, services, areas.

create extension if not exists pgcrypto;

do $$
declare
  u1 uuid := gen_random_uuid();
  u2 uuid := gen_random_uuid();
  u3 uuid := gen_random_uuid();
  p1 uuid := gen_random_uuid();
  p2 uuid := gen_random_uuid();
  p3 uuid := gen_random_uuid();
  cat_elec uuid := (select id from categories where slug = 'electrician');
  cat_gen  uuid := (select id from categories where slug = 'generator-technician');
  cat_plumb uuid := (select id from categories where slug = 'plumber');
begin
  -- 1. Auth users (test accounts; password is 'password123')
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  values
    (u1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'provider1@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
    (u2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'provider2@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
    (u3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'provider3@test.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}');

  -- 2. Identities (required for email login to work)
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values
    (gen_random_uuid(), u1, 'provider1@test.com', jsonb_build_object('sub', u1, 'email', 'provider1@test.com'), 'email', now(), now(), now()),
    (gen_random_uuid(), u2, 'provider2@test.com', jsonb_build_object('sub', u2, 'email', 'provider2@test.com'), 'email', now(), now(), now()),
    (gen_random_uuid(), u3, 'provider3@test.com', jsonb_build_object('sub', u3, 'email', 'provider3@test.com'), 'email', now(), now(), now());

  -- 3. Profiles
  insert into profiles (id, full_name, role) values
    (u1, 'FixRight Owner', 'provider'),
    (u2, 'Bright Spark Owner', 'provider'),
    (u3, 'Samuel Owner', 'provider');

  -- 4. Providers
  insert into providers (id, user_id, business_name, description, phone, whatsapp, status, lat, lng) values
    (p1, u1, 'FixRight Electrical', 'House wiring, fault repair, installations', '08012345678', '08012345678', 'active', 6.4478, 3.4723),
    (p2, u2, 'Bright Spark Services', 'Electrical and generator repairs', '08087654321', null, 'active', 6.4281, 3.4219),
    (p3, u3, 'Samuel Plumbing Services', 'Pipe repairs, installations, leak fixing', '08099887766', '08099887766', 'active', 6.4698, 3.5852);

  -- 5. Provider services
  insert into provider_services (provider_id, category_id) values
    (p1, cat_elec),
    (p2, cat_elec),
    (p2, cat_gen),
    (p3, cat_plumb);

  -- 6. Service areas
  insert into service_areas (provider_id, area_name, lat, lng) values
    (p1, 'Lekki', 6.4478, 3.4723),
    (p1, 'Ajah', 6.4677, 3.5651),
    (p2, 'Victoria Island', 6.4281, 3.4219),
    (p2, 'Ikoyi', 6.4540, 3.4337),
    (p3, 'Lekki', 6.4478, 3.4723),
    (p3, 'Surulere', 6.4698, 3.3515);
end $$;
