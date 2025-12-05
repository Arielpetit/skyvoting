-- Create participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Everyone can view participants (public voting)
CREATE POLICY "Anyone can view participants" 
ON public.participants 
FOR SELECT 
USING (true);

-- Only backend can update votes
CREATE POLICY "Backend can update votes" 
ON public.participants 
FOR UPDATE 
USING (true);

-- Create device_votes table to track which devices have voted
CREATE TABLE public.device_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_fingerprint TEXT NOT NULL UNIQUE,
  participant_id UUID NOT NULL REFERENCES public.participants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.device_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can check if a device has voted (for validation)
CREATE POLICY "Anyone can check device votes" 
ON public.device_votes 
FOR SELECT 
USING (true);

-- Insert some sample participants
INSERT INTO public.participants (name, avatar_url, votes) VALUES
  ('Alice Johnson', NULL, 0),
  ('Bob Smith', NULL, 0),
  ('Carol Williams', NULL, 0),
  ('David Brown', NULL, 0),
  ('Eva Martinez', NULL, 0);

-- Enable realtime for participants table
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;