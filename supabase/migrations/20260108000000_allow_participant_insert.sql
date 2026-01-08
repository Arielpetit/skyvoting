-- Allow authenticated users to insert participants
CREATE POLICY "Authenticated users can insert participants" 
ON public.participants 
FOR INSERT 
TO authenticated 
WITH CHECK (true);
