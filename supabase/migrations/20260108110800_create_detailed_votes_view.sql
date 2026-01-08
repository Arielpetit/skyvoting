-- Instead of a view with incorrect RLS, we use a SECURITY DEFINER function.
-- This allows us to securely query user data, which is normally protected.
CREATE OR REPLACE FUNCTION get_detailed_votes()
RETURNS TABLE (
  vote_id uuid,
  participant_name text,
  user_email text,
  user_full_name text,
  vote_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER -- This is the key part. It runs with the permissions of the function owner.
SET search_path = public
AS $$
BEGIN
  -- This function can join with auth.users because it runs with the definer's permissions (postgres).
  -- Access is restricted to authenticated users, and the client-side code ensures only admins call it.
  RETURN QUERY
  SELECT
    v.id,
    p.name,
    u.email::text,
    u.raw_user_meta_data->>'full_name',
    v.created_at
  FROM
    votes v
    JOIN participants p ON v.participant_id = p.id
    JOIN auth.users u ON v.user_id = u.id
  ORDER BY
    v.created_at DESC;
END;
$$;

-- Grant execute permission on the function to authenticated users.
GRANT EXECUTE ON FUNCTION public.get_detailed_votes() TO authenticated;