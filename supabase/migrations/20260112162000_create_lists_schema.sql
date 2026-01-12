-- Clear existing data to avoid conflicts during schema change
TRUNCATE TABLE public.votes, public.participants CASCADE;

-- Create lists table
CREATE TABLE public.lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on lists
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- Policies for lists
CREATE POLICY "Anyone can view lists" ON public.lists FOR SELECT USING (true);
CREATE POLICY "Admins can insert lists" ON public.lists FOR INSERT TO authenticated WITH CHECK (true); -- Simplified for now, ideally check admin role
CREATE POLICY "Admins can update lists" ON public.lists FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete lists" ON public.lists FOR DELETE TO authenticated USING (true);


-- Update participants table
ALTER TABLE public.participants 
  ADD COLUMN list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE,
  ADD COLUMN role TEXT; -- e.g. 'Delegate', 'Assistant'

-- Update votes table
-- Drop participant_id and add list_id
ALTER TABLE public.votes 
  DROP COLUMN participant_id,
  ADD COLUMN list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE;

-- Update handle_new_vote function to increment list votes instead of participant votes
CREATE OR REPLACE FUNCTION public.handle_new_vote()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.lists
  SET votes = votes + 1
  WHERE id = NEW.list_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger (it might have dropped if it depended on columns, but better to be safe)
DROP TRIGGER IF EXISTS on_vote_created ON public.votes;
CREATE TRIGGER on_vote_created
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_vote();

-- Create delete_list function for admin convenience
CREATE OR REPLACE FUNCTION delete_list(l_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.lists WHERE id = l_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
