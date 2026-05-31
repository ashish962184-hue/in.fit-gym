-- ==========================================
-- in.fit GYM DATABASE SCHEMA MIGRATION SCRIPT
-- ==========================================
-- Paste this script directly into your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- and click Run to initialize all tables, schemas, and Row Level Security (RLS) policies.

-- 1. Create CUSTOM USERS table linking to Supabase Auth.users
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text unique not null,
  phone text not null,
  role text not null default 'MEMBER' check (role in ('ADMIN', 'MEMBER', 'TRAINER')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create MEMBERSHIP REQUEST LEADS table
create table if not exists public.membership_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  full_name text not null,
  email text not null,
  phone text not null,
  selected_plan text not null,
  plan_price numeric not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'CONTACTED', 'APPROVED', 'REJECTED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create MEMBERSHIPS table (approved and active memberships)
create table if not exists public.memberships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade unique not null,
  plan_name text not null,
  plan_price numeric not null,
  start_date date not null default current_date,
  expiry_date date not null,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create ATHLETE CARDS table (circle passes with barcodes)
create table if not exists public.athlete_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade unique not null,
  membership_id uuid references public.memberships on delete cascade not null,
  card_number text unique not null,
  barcode text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.users enable row level security;
alter table public.membership_requests enable row level security;
alter table public.memberships enable row level security;
alter table public.athlete_cards enable row level security;

-- 6. RLS POLICIES FOR 'users' TABLE
-- Users can view their own profile
create policy "Allow users to read their own profile" 
  on public.users for select 
  using (auth.uid() = id);

-- Users can insert their own profile during registration
create policy "Allow users to insert their own profile" 
  on public.users for insert 
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Allow users to update their own profile" 
  on public.users for update 
  using (auth.uid() = id);

-- Admins have full access to everything in users table
create policy "Admins full control users" 
  on public.users for all 
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role = 'ADMIN'
    )
  );

-- 7. RLS POLICIES FOR 'membership_requests' TABLE
-- Members can read their own inquiries
create policy "Allow users to view their own requests" 
  on public.membership_requests for select 
  using (auth.uid() = user_id);

-- Members can insert their own inquiries
create policy "Allow users to submit requests" 
  on public.membership_requests for insert 
  with check (auth.uid() = user_id);

-- Admins have full access
create policy "Admins full control membership_requests" 
  on public.membership_requests for all 
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role = 'ADMIN'
    )
  );

-- 8. RLS POLICIES FOR 'memberships' TABLE
-- Members can view their own active memberships
create policy "Allow users to view their own memberships" 
  on public.memberships for select 
  using (auth.uid() = user_id);

-- Admins have full access
create policy "Admins full control memberships" 
  on public.memberships for all 
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role = 'ADMIN'
    )
  );

-- 9. RLS POLICIES FOR 'athlete_cards' TABLE
-- Members can view their own digital passes
create policy "Allow users to view their own cards" 
  on public.athlete_cards for select 
  using (auth.uid() = user_id);

-- Admins have full access
create policy "Admins full control athlete_cards" 
  on public.athlete_cards for all 
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role = 'ADMIN'
    )
  );

-- 10. REAL-TIME PUBLICATION SETUP
-- Allow listening to real-time events for inquiries and memberships
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table 
    public.users, 
    public.membership_requests, 
    public.memberships, 
    public.athlete_cards;
commit;
