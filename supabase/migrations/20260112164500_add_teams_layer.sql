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
DO $$
DECLARE
  list1_id UUID;
  list2_id UUID;
BEGIN
  -- Clear existing lists to start fresh with the 2 required lists
  DELETE FROM public.lists;

  -- Insert List 1
  INSERT INTO public.lists (name, description) VALUES ('List 1', 'First List') RETURNING id INTO list1_id;
  
  -- Insert List 2
  INSERT INTO public.lists (name, description) VALUES ('List 2', 'Second List') RETURNING id INTO list2_id;

  -- Insert Teams for List 1 (Team 1, Team 2)
  INSERT INTO public.teams (name, list_id) VALUES ('Team 1', list1_id);
  INSERT INTO public.teams (name, list_id) VALUES ('Team 2', list1_id);

  -- Insert Teams for List 2 (Team 3, Team 4)
  INSERT INTO public.teams (name, list_id) VALUES ('Team 3', list2_id);
  INSERT INTO public.teams (name, list_id) VALUES ('Team 4', list2_id);
END $$;
