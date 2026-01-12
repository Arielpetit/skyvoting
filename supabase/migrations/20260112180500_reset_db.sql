-- Function to reset the database state
-- This will delete all data from the application tables but keep the structure

BEGIN;

-- Truncate tables in order of dependency (or use CASCADE)
TRUNCATE TABLE votes, participants, teams, lists, settings RESTART IDENTITY CASCADE;

-- Re-seed Data (from 20260112164500_add_teams_layer.sql)
DO $$
DECLARE
  list1_id UUID;
  list2_id UUID;
BEGIN
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

COMMIT;
