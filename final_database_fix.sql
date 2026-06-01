-- ==============================================================
-- IN.FIT GYM FINAL DATABASE FIX: RLS & TRIGGER OPTIMIZATIONS
-- ==============================================================

-- 1. Create a secure, non-recursive function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop all old recursive Admin policies
DROP POLICY IF EXISTS "Admin full control users" ON public.users;
DROP POLICY IF EXISTS "Admin full control profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin full control website_settings" ON public.website_settings;
DROP POLICY IF EXISTS "Admin full control services" ON public.services;
DROP POLICY IF EXISTS "Admin full control membership_plans" ON public.membership_plans;
DROP POLICY IF EXISTS "Admin full control membership_requests" ON public.membership_requests;
DROP POLICY IF EXISTS "Admin full control memberships" ON public.memberships;
DROP POLICY IF EXISTS "Admin full control athlete_cards" ON public.athlete_cards;
DROP POLICY IF EXISTS "Admin full control trainers" ON public.trainers;
DROP POLICY IF EXISTS "Admin full control gallery" ON public.gallery;
DROP POLICY IF EXISTS "Admin full control testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admin full control contact_requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Admin full control analytics" ON public.analytics;
DROP POLICY IF EXISTS "Admin full control notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin full control attendance" ON public.attendance;

-- 3. Apply the new secure, recursion-free Admin policies using the function
CREATE POLICY "Admin full control users" ON public.users FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control profiles" ON public.profiles FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control website_settings" ON public.website_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control services" ON public.services FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control membership_plans" ON public.membership_plans FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control membership_requests" ON public.membership_requests FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control memberships" ON public.memberships FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control athlete_cards" ON public.athlete_cards FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control trainers" ON public.trainers FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control gallery" ON public.gallery FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control testimonials" ON public.testimonials FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control contact_requests" ON public.contact_requests FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control analytics" ON public.analytics FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control notifications" ON public.notifications FOR ALL USING (public.is_admin());
CREATE POLICY "Admin full control attendance" ON public.attendance FOR ALL USING (public.is_admin());

-- 4. Ensure the Signup Database Trigger is completely flawless
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, phone, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Gym Member'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', 'Not provided'),
    COALESCE(new.raw_user_meta_data->>'role', 'MEMBER')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
