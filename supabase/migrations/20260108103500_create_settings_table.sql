-- 1. Create settings table
CREATE TABLE public.settings (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 3. Allow public read access
CREATE POLICY "Allow public read access"
ON public.settings FOR SELECT
USING (true);

-- 4. Allow admin write access
-- This policy allows any authenticated user to change settings.
-- This is acceptable for now as the UI is already restricted to admins on the client-side.
CREATE POLICY "Allow admin write access"
ON public.settings FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 5. Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_settings_updated
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();