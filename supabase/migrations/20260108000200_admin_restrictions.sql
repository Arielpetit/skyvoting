-- 1. Remove all existing participants
DELETE FROM public.participants;

-- 2. Update RLS policy for participants to only allow admin to insert
-- First, drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can insert participants" ON public.participants;

-- Create a new policy that checks the user's email
-- Note: We use auth.jwt() -> 'email' to get the user's email from the JWT
CREATE POLICY "Only admin can insert participants" 
ON public.participants 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.jwt() ->> 'email' = 'tchikayaline@gmail.com');

-- 3. Update RLS policy for avatars bucket to only allow admin to upload
-- Drop existing policies for the avatars bucket
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete avatars" ON storage.objects;

-- Create new policies restricted by email
CREATE POLICY "Only admin can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (auth.jwt() ->> 'email' = 'tchikayaline@gmail.com'));

CREATE POLICY "Only admin can update avatars"
ON storage.objects FOR UPDATE TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (auth.jwt() ->> 'email' = 'tchikayaline@gmail.com'));

CREATE POLICY "Only admin can delete avatars"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (auth.jwt() ->> 'email' = 'tchikayaline@gmail.com'));
