-- ====================================================
-- IN.FIT GYM DATABASE SCHEMA MIGRATION & SEED SCRIPT
-- ====================================================
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

-- 2. Create PROFILES table (extended meta mapping)
create table if not exists public.profiles (
  id uuid references public.users on delete cascade primary key,
  avatar_url text,
  fitness_goal text,
  medical_history text,
  emergency_contact text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create WEBSITE SETTINGS key-value jsonb table
create table if not exists public.website_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create SERVICES table
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  image_url text not null,
  category text not null,
  is_enabled boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create MEMBERSHIP PLANS table
create table if not exists public.membership_plans (
  id uuid default gen_random_uuid() primary key,
  plan_id text unique not null,
  name text not null,
  category text not null,
  price numeric not null,
  period text not null,
  features text[] not null,
  disabled_features text[] not null default '{}',
  is_enabled boolean not null default true,
  most_popular boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create MEMBERSHIP REQUESTS table
create table if not exists public.membership_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  full_name text not null,
  email text not null,
  phone text not null,
  fitness_goal text not null,
  selected_plan text not null,
  plan_price numeric not null,
  status text not null default 'PENDING' check (status in ('PENDING', 'CONTACTED', 'APPROVED', 'REJECTED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create MEMBERSHIPS table
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

-- 8. Create ATHLETE CARDS table
create table if not exists public.athlete_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade unique not null,
  membership_id uuid references public.memberships on delete cascade not null,
  card_number text unique not null,
  barcode text not null,
  qr_code text not null,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Create TRAINERS table
create table if not exists public.trainers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  specialization text not null,
  experience text not null,
  certificates text[] not null default '{}',
  photo_url text not null,
  instagram text,
  facebook text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Create GALLERY table
create table if not exists public.gallery (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null check (category in ('Gym', 'Equipment', 'Transformation', 'Events')),
  photo_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Create TESTIMONIALS table
create table if not exists public.testimonials (
  id uuid default gen_random_uuid() primary key,
  member_name text not null,
  member_photo_url text,
  rating numeric not null default 5 check (rating >= 1 and rating <= 5),
  review_text text not null,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Create CONTACT REQUESTS table
create table if not exists public.contact_requests (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Create ANALYTICS table
create table if not exists public.analytics (
  id uuid default gen_random_uuid() primary key,
  visitors numeric not null default 0,
  requests_count numeric not null default 0,
  approved_count numeric not null default 0,
  expired_count numeric not null default 0,
  contact_count numeric not null default 0,
  monthly_growth numeric not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. Create NOTIFICATIONS table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  category text not null default 'INFO',
  is_read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. Create ATTENDANCE table
create table if not exists public.attendance (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  check_in timestamp with time zone default timezone('utc'::text, now()) not null,
  check_out timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.website_settings enable row level security;
alter table public.services enable row level security;
alter table public.membership_plans enable row level security;
alter table public.membership_requests enable row level security;
alter table public.memberships enable row level security;
alter table public.athlete_cards enable row level security;
alter table public.trainers enable row level security;
alter table public.gallery enable row level security;
alter table public.testimonials enable row level security;
alter table public.contact_requests enable row level security;
alter table public.analytics enable row level security;
alter table public.notifications enable row level security;
alter table public.attendance enable row level security;

-- Public read policies on static CMS components
create policy "Public select website_settings" on public.website_settings for select using (true);
create policy "Public select services" on public.services for select using (true);
create policy "Public select membership_plans" on public.membership_plans for select using (true);
create policy "Public select trainers" on public.trainers for select using (true);
create policy "Public select gallery" on public.gallery for select using (true);
create policy "Public select testimonials" on public.testimonials for select using (true);

-- Users profile read/write RLS
create policy "Users read own profile" on public.users for select using (auth.uid() = id);
create policy "Users insert own profile" on public.users for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.users for update using (auth.uid() = id);

create policy "Profiles select own" on public.profiles for select using (auth.uid() = id);
create policy "Profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles update own" on public.profiles for update using (auth.uid() = id);

-- Requests policies
create policy "Users submit requests" on public.membership_requests for insert with check (auth.uid() = user_id);
create policy "Users select own requests" on public.membership_requests for select using (auth.uid() = user_id);

create policy "Users select own memberships" on public.memberships for select using (auth.uid() = user_id);
create policy "Users select own card" on public.athlete_cards for select using (auth.uid() = user_id);
create policy "Users select own attendance" on public.attendance for select using (auth.uid() = user_id);

-- Public insert contact requests
create policy "Public submit contact_requests" on public.contact_requests for insert with check (true);

-- STRICT ADMIN FULL OVERRIDES FOR EVERYTHING
create policy "Admin full control users" on public.users for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control profiles" on public.profiles for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control website_settings" on public.website_settings for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control services" on public.services for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control membership_plans" on public.membership_plans for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control membership_requests" on public.membership_requests for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control memberships" on public.memberships for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control athlete_cards" on public.athlete_cards for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control trainers" on public.trainers for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control gallery" on public.gallery for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control testimonials" on public.testimonials for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control contact_requests" on public.contact_requests for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control analytics" on public.analytics for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control notifications" on public.notifications for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);
create policy "Admin full control attendance" on public.attendance for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'ADMIN')
);

-- ====================================================
-- DATABASE SEEDING
-- ====================================================

-- Seed website settings
insert into public.website_settings (key, value) values 
('hero', '{
  "gymName": "IN.FIT GYM",
  "tagline": "2 FLOORS A/C GYM | STRENGTH & CARDIO CENTER",
  "heading1": "WELCOME TO ",
  "highlight": "IN.FIT GYM",
  "heading2": "BUILT FOR ",
  "highlight2": "MASTERMASTER mastery",
  "description": "Hyderabad’s elite strength sanctuary at NTPC X Road. Powered by premier Real Leader USA biomechanic cages, high-oxygen temperature-regulated AC floors, and certified pro coaches committed to your athletic mastery.",
  "bgImageUrl": "https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM",
  "ctaText": "JOIN MEMBERSHIP",
  "ctaLink": "#packages",
  "memberCount": 700,
  "trainerCount": 10,
  "yearsExperience": 5,
  "satisfaction": 95
}'::jsonb),
('about', '{
  "title": "WELCOME TO IN.FIT GYM",
  "description": "At IN.FIT GYM, we deliver real, hardcore physical transformation programs. Spanning two fully air-conditioned levels, our facility is engineered with precision plate-loaded cages, customized compound lifting decks, and dedicated coaches ready to guide you to peak performance.",
  "mission": "To provide absolute biomechanical lifting precision, elite conditioning layouts, and highly practical coaching structures that allow athletes of all levels to unlock unstoppable raw power safety.",
  "vision": "To be the ultimate benchmark fitness and personal training brand in Hyderabad, fostering a hardcore community of serious athletes built on integrity and physical execution.",
  "images": [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM"
  ]
}'::jsonb),
('contact', '{
  "phone1": "99666 83776",
  "phone2": "83091 34004",
  "whatsapp": "9966683776",
  "email": "support@infitgym.in",
  "address": "NTPC X Road, Annojiguda, Hyderabad",
  "mapUrl": "https://www.google.com/maps/dir/?api=1&destination=in.fit+GYM+Annojiguda+Hyderabad",
  "hours": "Mon - Sat: 5:00 AM - 10:00 PM, Sun: 6:00 AM - 12:00 PM",
  "emergency": "83091 34004"
}'::jsonb),
('social', '{
  "instagram": "https://www.instagram.com/infit_gym/",
  "facebook": "https://www.facebook.com/infitgym/",
  "youtube": "https://www.youtube.com/@infitgym",
  "linkedin": "https://www.linkedin.com/company/infit-gym"
}'::jsonb),
('seo', '{
  "metaTitle": "in.fit GYM | Hyderabad’s Elite 2-Floors AC Strength & Cardio Transformation Center",
  "metaDescription": "Train with premier Real Leader USA plate-loaded machines, Olympic platforms, cardio decks, and certified personal trainers. Memberships start from ₹1299/mo.",
  "keywords": "gym, hyderabad, strength training, personal trainer, plate loaded, fitness, crossfit, annojiguda",
  "ogImage": "https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM",
  "googleAnalyticsId": "G-XXXXXXXXXX"
}'::jsonb)
on conflict (key) do update set value = excluded.value;

-- Seed default plans based on client's actual pricing
insert into public.membership_plans (plan_id, name, category, price, period, features, disabled_features, most_popular, is_enabled) values
('student-offer', 'Student Offer', 'Foundation', 1299, 'month', '{"Full Gym Access", "Cardio Zone Access", "Locker Access", "Valid Student ID Required"}', '{"Personal Coach Sessions", "Custom Diet Architecture"}', false, true),
('1-month', '1 Month Plan', 'Foundation', 1499, 'month', '{"Full Gym Access", "Cardio Zone Access", "Locker Access", "Strength Floor Access"}', '{"Personal Coach Sessions", "Custom Diet Architecture"}', false, true),
('3-months', '3 Months Plan', 'Performance', 3499, '3 months', '{"Full Gym Access", "Cardio Zone Access", "Locker Access", "Strength Floor Access", "General Trainer Support"}', '{"Personal Coach Sessions"}', true, true),
('6-months', '6 Months Plan', 'Elite', 6499, '6 months', '{"Full Gym Access", "Cardio Zone Access", "Locker Access", "Strength Floor Access", "General Trainer Support", "Biometric Body Scans"}', '{"Personal Coach Sessions"}', false, true),
('12-months', '12 Months Plan', 'Ultimate', 10999, 'year', '{"Full Gym Access", "Cardio Zone Access", "Locker Access", "Strength Floor Access", "General Trainer Support", "Biometric Body Scans", "Free Shaker Bottle"}', '{}', false, true),
('couple-3-months', '3 Month Couple Package', 'Couple', 5999, '3 months', '{"Full Gym Access for 2 Athletes", "Cardio Zone Access", "Locker Access", "Strength Floor Access", "General Trainer Support"}', '{"Personal Coach Sessions"}', false, true),
('personal-training', 'Personal Training', '1-on-1 Coaching', 4999, 'month', '{"Certified Elite Trainer Coaching", "Custom Workout Architecture", "Nutritional Periodization Plan", "Daily Bracing & lifting Audits"}', '{}', false, true)
on conflict (plan_id) do update set 
  name = excluded.name, 
  price = excluded.price, 
  features = excluded.features,
  disabled_features = excluded.disabled_features;

-- Seed services
insert into public.services (name, description, image_url, category, is_enabled) values
('Strength Training', 'Unleash absolute raw power on our dedicated biomechanic plates floor, complete with elite barbell deadlifting racks and professional cages.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=60', 'Strength', true),
('Cardio Training', 'Improve metabolic output and stamina on our high-performance temperature-regulated treadmill cardio suites.', 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600&auto=format&fit=crop&q=60', 'Conditioning', true),
('Functional Training', 'Dynamic cross-functional circuits targeting joint stability, kinetic balance, and high anaerobic recovery.', 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&auto=format&fit=crop&q=60', 'Functional', true),
('Personal Training', 'One-on-one biometric masterclasses with certified elite coaches focused entirely on your lifting form.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=60', 'Coaching', true),
('Diet Planning', 'Highly tailored periodization macro structures designed to fuel hardcore lifting recoveries and weight management goals.', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop&q=60', 'Nutrition', true),
('HIIT', 'Short duration, metabolic explosive intervals engineered to fire up fat reduction and vascular output.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=60', 'Conditioning', true)
on conflict do nothing;

-- Seed trainers
insert into public.trainers (name, specialization, experience, certificates, photo_url, instagram, facebook) values
('Rohit Sharma', 'Powerlifting & Biomechanics Specialist', '8+ Years lifting', '{"NASM-PES", "ISSA Strength", "Squat University Specialist"}', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqULpIpNiDmzC1x3IQUokQW8tElAiISsxvngnk5ksQpkIPFOq-_qiBba-uQOXq-bz5q3UhG6snqMFEAvlNMNXwhsSk5xxDxQDJ0SqADZ-0JSCRuqoXxX5zSADr6JltVipfDDGV4qTDj8bCZySJAK6GF22w4aBWhIuerl03s3w62wdGX-sLeuSiXggl9rVl9ld996liTZ4vN16JNR6IrRHqBUacTiRhX4ETWgdrr4ajKZi7r0BoyZuTv3XkQWNNTInzWk0fcnd7CDw', 'rohit_sharma_lifts', 'rohit.sharma.lifts'),
('Aditi Rao', 'High Intensity Heart-Rate Conditioning', '6+ Years Training', '{"ACE-CPT", "TRX Suspension Master Coach"}', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt_HOMvpotaxRSrV_HWr0lblzQAnHfSHn1P_dDrpPFQFqzeFtpc5irUxz7GTfNjfX_VgeE7Bgl4af96mLJO1D_yiRpkhy3j7epmWiqLc1ks3jxeye3D-rY1L846YS5aZp5Y_-JY9DOjKXr6h1aFHeoEIa0zNcUTUmiLpC7OzVJ8q8kze8yaJTpGQHIaaOJQ0j4mTnGn6LWgpOk5uefPmJ1babR7uSg9v-HMn0Q0KbLqObWfsXxI2doSqdXuhEfTr9_lxKNtkeFFOw', 'aditi_kinetics', 'aditi.kinetics'),
('Karan Kundra', 'CrossFit & Olympic Lifting Metcon', '5+ Years Coach', '{"CrossFit Level 2", "ASCA Olympic L1", "ACE-CPT"}', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsbE0zkc5syu0mPnUOHxooZ380zUN7K5qvSRi6YivCZrjFptOVOEdLHxMKjSstuvVhuw23ANiz3xDNoZbRzKM-4S__yYTHBcP9dhDS0GcmS9T3u21l9EqL71QMtVdS5OTnxm1BKDoqsjyyKO6fXL-r4EamjN_3LyxP2_ILpy3IHTKDGbItcQd78nevn8qU28jy9LgN-2rD_lt7i8jmWBaCaurZ_0CjAgaGRDFLpp3wyO25nnNGD1Xoqgd0erhMp3c8qt5NaeJsqbM', 'karan_cf_metcon', 'karan.kundra.cf')
on conflict do nothing;

-- Seed analytics
insert into public.analytics (visitors, requests_count, approved_count, expired_count, contact_count, monthly_growth) values
(1480, 42, 28, 4, 18, 12.5)
on conflict do nothing;

-- Seed default notifications
insert into public.notifications (title, message, category) values
('CMS Cloud Connected', 'The in.fit GYM business platform has been successfully linked to Supabase core schemas.', 'SYSTEM'),
('Autumn Enrollments Live', 'Inbound athlete membership inquiries queue is active.', 'INFO')
on conflict do nothing;

-- Seed testimonials
insert into public.testimonials (member_name, member_photo_url, rating, review_text, category) values
('Vikram Reddy', null, 5, 'Best compound lifting cages in Hyderabad. The deadlifting platforms are world-class and always maintained properly. Highly recommend for serious powerlifters.', 'Strength Training'),
('Anjali Sharma', null, 4, 'Elite atmosphere with excellent ventilation. The high-performance treadmills keep up with intensive sprinting series. Extremely clean lockers as well!', 'Cardio Suite'),
('Karthik Rao', null, 5, 'Unlocking massive strength milestones here. Sandeep’s customized coaching on form checks and periodization completely level-up your training protocol.', 'Personal Training')
on conflict do nothing;

-- Seed gallery items
insert into public.gallery (title, description, category, photo_url) values
('Elite Strength Floor', 'Equipped with custom matte coated plates, specialized power cages, and official Real Leader USA pin-selected racks.', 'Gym', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjr0WZYB2WIx9gR6BF1xHDKvgpcNQEWOGA5jp72grreuNi_5sDoOob994albOIdTtjPnWqrRdDt87SHr8XOt01A-l74VuSnUn7__DjlzXo1OOCbhAIyIUbvU9rpXX9VvC7oZnVA3R-QPBARDPtJQzHLurbp88UzrxZGbLn4XNntV-ujRhCFUZIXwSziGPgFly7En4dWUmhyZ8s-853MFzGBtfuIPYX0QlRoN_-L-oxsDyN3qbmEg_6nrl1zjZ8uxzp0Ecc3m3LdQM'),
('Metcon CrossFit Rig', 'Features a 30-foot central pull-up rig, gymnastics wall-balls, rogue concept-2 rowers and skiergs.', 'Equipment', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAVs1hC75ipnjlGbmNO2F3ltwsFsm2dAugqfpgylqtFONh8tVgVMzJTy5HDc9AWVsOZoQJgxscmpbpDpDef2X4qiGFqfGjSbV2_vODb_gjBYYlwp31pKdGG5cjw7yI7d5g0K4lvAAk7iBKzoL1GCT4Hh3_4aRAv5BmPpbnhiDQx1WuwDBeqpFQEOFGpuQHZnfjgMXuPKMtTklRHeO4JkRPm3wPh9ZFkho4TBi2U4lYgpnG3RiJOS91NHx6pvwjUynwZng-pdsnfXI')
on conflict do nothing;

-- Real-time publication setup
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table 
    public.users,
    public.profiles,
    public.website_settings,
    public.services,
    public.membership_plans,
    public.membership_requests,
    public.memberships,
    public.athlete_cards,
    public.trainers,
    public.gallery,
    public.testimonials,
    public.contact_requests,
    public.analytics,
    public.notifications,
    public.attendance;
commit;
