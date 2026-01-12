-- Script to reset ONLY the votes
-- This keeps all teams, participants, and settings intact.

BEGIN;

-- 1. Delete all records from the votes table
TRUNCATE TABLE public.votes CASCADE;

-- 2. Reset the vote counts on the lists table to 0
-- (Since we don't have a decrement trigger, we must do this manually)
UPDATE public.lists SET votes = 0;

COMMIT;
