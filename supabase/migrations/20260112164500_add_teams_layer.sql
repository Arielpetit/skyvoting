-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Admins can insert teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (true);

-- Update participants table
ALTER TABLE public.participants 
  ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Seed Data

