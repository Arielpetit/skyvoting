-- Create eligible_voters table
CREATE TABLE IF NOT EXISTS public.eligible_voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.eligible_voters ENABLE ROW LEVEL SECURITY;

-- Policies for eligible_voters
CREATE POLICY "Anyone can view eligible voters" ON public.eligible_voters FOR SELECT USING (true);

-- Only admins can manage eligible voters
-- Using the same admin emails as in VotingApp.tsx for consistency in RLS if possible, 
-- but RLS usually checks auth.jwt() ->> 'email'
CREATE POLICY "Admins can manage eligible voters" 
ON public.eligible_voters 
FOR ALL 
TO authenticated 
USING (lower(auth.jwt() ->> 'email') IN ('ariel.tchikaya@adorsys.com', 'ewang.branda@skyengpro.com'))
WITH CHECK (lower(auth.jwt() ->> 'email') IN ('ariel.tchikaya@adorsys.com', 'ewang.branda@skyengpro.com'));

-- Function to get absences (eligible voters who haven't voted)
CREATE OR REPLACE FUNCTION public.get_absences()
RETURNS TABLE (
  email TEXT,
  full_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ev.email,
    ev.full_name
  FROM
    public.eligible_voters ev
  LEFT JOIN
    auth.users u ON lower(ev.email) = lower(u.email)
  LEFT JOIN
    public.votes v ON u.id = v.user_id
  WHERE
    v.id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_absences() TO authenticated;
