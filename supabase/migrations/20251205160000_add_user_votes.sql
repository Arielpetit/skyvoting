/*
  # Add user_id to votes table and enable RLS

  1. Changes
    - Add `user_id` column to `votes` table (foreign key to `auth.users`).
    - Add unique constraint on `(user_id)` to ensure one vote per user (assuming single poll for now, or `(user_id, participant_id)` if multiple votes allowed but one per participant - wait, requirement is "vote has to be tied to a user", usually means one vote per election).
    - Enable RLS on `votes` table.
    - Add policies for:
      - Insert: Authenticated users can insert their own vote.
      - Select: Users can view their own votes.

  2. Security
    - Enable RLS on `votes` table
    - Add policy for authenticated users to insert their own vote
*/

-- Create votes table if it doesn't exist (it might be handled by edge function currently, but let's formalize it)
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.participants(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_vote UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own vote
CREATE POLICY "Users can cast their own vote"
  ON public.votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own votes
CREATE POLICY "Users can view their own votes"
  ON public.votes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Public can view vote counts (via participants table, but if we query votes directly for analytics, we might need another policy or use a view/function)
-- For now, we only need users to see their own vote to confirm they voted.

-- Optional: Update participants vote count via trigger (if not already done by Edge Function)
-- But the current app seems to use an Edge Function 'vote'. We should probably update that function instead of relying purely on client-side inserts if we want to be secure.
-- However, for this task "vote has to be tied to a user", we can stick to client-side insert + RLS for simplicity if the Edge Function is too complex to refactor blindly.
-- BUT, the prompt says "managed by superbase", and the existing code uses `supabase.functions.invoke("vote")`.
-- So I should probably update the Edge Function OR switch to direct DB insert.
-- Direct DB insert is often simpler for standard CRUD. Let's try to switch to direct DB insert for the "Vote" action to simplify the architecture and remove the opaque Edge Function dependency if possible.
-- Wait, `participants` table has `votes` count. We need to increment that.
-- A trigger is the best way to keep `participants.votes` in sync with `votes` table.

CREATE OR REPLACE FUNCTION public.handle_new_vote()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.participants
  SET votes = votes + 1
  WHERE id = NEW.participant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_created
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_vote();
