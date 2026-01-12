-- Update get_detailed_votes function to use lists
DROP FUNCTION IF EXISTS public.get_detailed_votes();

CREATE OR REPLACE FUNCTION public.get_detailed_votes()
RETURNS TABLE (
  vote_id UUID,
  list_name TEXT,
  user_email TEXT,
  user_full_name TEXT,
  vote_created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id as vote_id,
    l.name as list_name,
    u.email as user_email,
    (u.raw_user_meta_data->>'full_name')::TEXT as user_full_name,
    v.created_at as vote_created_at
  FROM
    public.votes v
    JOIN public.lists l ON v.list_id = l.id
    JOIN auth.users u ON v.user_id = u.id
  ORDER BY
    v.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
