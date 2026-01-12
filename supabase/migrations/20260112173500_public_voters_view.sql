-- Function to get public voter list (hides who they voted for)
CREATE OR REPLACE FUNCTION public.get_public_voters()
RETURNS TABLE (
  user_email TEXT,
  user_full_name TEXT,
  vote_created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.email::TEXT as user_email,
    (u.raw_user_meta_data->>'full_name')::TEXT as user_full_name,
    v.created_at as vote_created_at
  FROM
    public.votes v
    JOIN auth.users u ON v.user_id = u.id
  ORDER BY
    v.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_voters() TO authenticated;
