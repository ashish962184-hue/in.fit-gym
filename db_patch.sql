-- ================================================================
-- IN.FIT GYM — DATABASE PATCH SCRIPT
-- ================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- PURPOSE: Adds missing columns and fixes constraints introduced
-- after the initial supabase_setup.sql was run.
-- Safe to run multiple times (uses IF NOT EXISTS / DO NOTHING).
-- ================================================================


-- ----------------------------------------------------------------
-- PATCH 1: services table — add popup modal content columns
-- ----------------------------------------------------------------
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS schedule text,
  ADD COLUMN IF NOT EXISTS features text;

-- Update existing seeded services with schedule and features
UPDATE public.services SET
  schedule = 'Mon–Sat: 6:00 AM – 9:00 PM',
  features = 'Power Cages & Barbells,Plate-Loaded Machines,Real Leader USA Equipment,Deadlift Platforms,Trainer Guidance Available'
WHERE name = 'Strength Training' AND schedule IS NULL;

UPDATE public.services SET
  schedule = 'Mon–Sat: 5:00 AM – 10:00 PM',
  features = 'Commercial Treadmills,Elliptical Machines,Stationary Bikes,Air-Conditioned Floor,Heart Rate Monitoring'
WHERE name = 'Cardio Training' AND schedule IS NULL;

UPDATE public.services SET
  schedule = 'Mon–Sat: 7:00 AM – 8:00 PM',
  features = 'Kettlebells & Battle Ropes,TRX Suspension Training,Medicine Balls,Agility Ladders,Group or Solo Sessions'
WHERE name = 'Functional Training' AND schedule IS NULL;

UPDATE public.services SET
  schedule = 'By Appointment — 7 Days',
  features = '1-on-1 Certified Coach,Custom Workout Plan,Nutritional Guidance,Progress Tracking,Form Correction & Safety'
WHERE name = 'Personal Training' AND schedule IS NULL;

UPDATE public.services SET
  schedule = 'Tue & Thu: 6:30 PM – 7:30 PM',
  features = 'Expert Zumba Instructor,Group Class Format,High-Energy Music,Calorie Burning Dance Moves,All Fitness Levels Welcome'
WHERE name = 'Zumba Class' AND schedule IS NULL;

UPDATE public.services SET
  schedule = 'Mon/Wed/Fri: 7:00 AM & 6:00 PM',
  features = 'Interval Timer Training,Kettlebell Circuits,Battle Rope Slams,Group Energy Atmosphere,Measurable Performance'
WHERE name = 'HIIT' AND schedule IS NULL;

UPDATE public.services SET
  schedule = 'Mon & Wed: 8:00 AM – 9:00 AM',
  features = 'Certified Yoga Instructor,Yoga Mats & Props Provided,Breathing Techniques,Stretch & Mobility Work,Stress Reduction'
WHERE name = 'Yoga & Flexibility' AND schedule IS NULL;


-- ----------------------------------------------------------------
-- PATCH 2: trainers table — add bio column
-- ----------------------------------------------------------------
ALTER TABLE public.trainers
  ADD COLUMN IF NOT EXISTS bio text;


-- ----------------------------------------------------------------
-- PATCH 3: gallery table — relax restrictive category constraint
-- ----------------------------------------------------------------
ALTER TABLE public.gallery
  DROP CONSTRAINT IF EXISTS gallery_category_check;

ALTER TABLE public.gallery
  ADD CONSTRAINT gallery_category_check
  CHECK (category IN (
    'Strength Area',
    'Cardio Area',
    'Group Training',
    'Personal Training',
    'Gym Equipment',
    'Member Activities',
    'Gym',
    'Equipment',
    'Transformation',
    'Events'
  ));


-- ----------------------------------------------------------------
-- PATCH 4: membership_plans — add best_value flag
-- ----------------------------------------------------------------
ALTER TABLE public.membership_plans
  ADD COLUMN IF NOT EXISTS best_value boolean NOT NULL DEFAULT false;

-- Mark 12-month plan as best value
UPDATE public.membership_plans
  SET best_value = true
WHERE plan_id = '12-months';


-- ----------------------------------------------------------------
-- PATCH 5: Supabase Storage — create gym-images bucket
-- ----------------------------------------------------------------
-- Run this separately in Storage > Buckets if SQL doesn't support it:
-- Create a bucket named "gym-images" with public access enabled.
--
-- Or run via Supabase JS client (one-time setup):
-- await supabase.storage.createBucket('gym-images', { public: true })
--
-- Folder structure inside the bucket:
--   /hero/       — hero banner images
--   /services/   — service card images
--   /trainers/   — trainer profile photos
--   /gallery/    — gym gallery photos
--   /testimonials/ — member review photos
--   /logos/      — gym logos and banners
-- ----------------------------------------------------------------

-- Storage RLS: allow admins to upload, public to read
INSERT INTO storage.buckets (id, name, public)
VALUES ('gym-images', 'gym-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read gym-images" ON storage.objects;
  DROP POLICY IF EXISTS "Admin upload gym-images" ON storage.objects;
  DROP POLICY IF EXISTS "Admin delete gym-images" ON storage.objects;
END $$;

CREATE POLICY "Public read gym-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gym-images');

CREATE POLICY "Admin upload gym-images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gym-images' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admin delete gym-images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gym-images' AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );


-- ----------------------------------------------------------------
-- PATCH 6: website_settings — ensure seo row has GA placeholder
-- ----------------------------------------------------------------
INSERT INTO public.website_settings (key, value)
VALUES ('seo', '{
  "metaTitle": "in.fit GYM | Hyderabad''s Elite 2-Floors AC Strength & Cardio Transformation Center",
  "metaDescription": "Train with premier Real Leader USA plate-loaded machines, Olympic platforms, cardio decks, and certified personal trainers. Memberships start from ₹1299/mo.",
  "keywords": "gym, hyderabad, strength training, personal trainer, plate loaded, fitness, annojiguda",
  "ogImage": "",
  "googleAnalyticsId": ""
}'::jsonb)
ON CONFLICT (key) DO UPDATE
  SET value = website_settings.value || '{"googleAnalyticsId": ""}'::jsonb
  WHERE NOT (website_settings.value ? 'googleAnalyticsId');
