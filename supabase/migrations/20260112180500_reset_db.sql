-- Function to reset the database state
-- This will delete all data from the application tables but keep the structure

BEGIN;

-- Truncate tables in order of dependency (or use CASCADE)
TRUNCATE TABLE votes, participants, teams, lists, settings RESTART IDENTITY CASCADE;

-- Re-seed Data (from 20260112164500_add_teams_layer.sql)


COMMIT;
