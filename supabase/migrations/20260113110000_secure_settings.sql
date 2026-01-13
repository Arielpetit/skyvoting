-- Secure the settings table and add voting_enabled key

-- 1. Drop existing policies to be safe
DROP POLICY IF EXISTS "Allow public read access" ON public.settings;
DROP POLICY IF EXISTS "Allow admin write access" ON public.settings;

-- 2. Re-create policies with strict admin checks (matching participants table logic)
CREATE POLICY "Allow public read access"
ON public.settings FOR SELECT
USING (true);

CREATE POLICY "Allow admin write access"
ON public.settings FOR ALL
USING (lower(auth.jwt() ->> 'email') IN ('ariel.tchikaya@adorsys.com', 'ewang.branda@skyengpro.com'))
WITH CHECK (lower(auth.jwt() ->> 'email') IN ('ariel.tchikaya@adorsys.com', 'ewang.branda@skyengpro.com'));

-- 3. Insert default voting_enabled setting if not exists
INSERT INTO public.settings (key, value)
VALUES ('voting_enabled', 'false')
ON CONFLICT (key) DO NOTHING;
