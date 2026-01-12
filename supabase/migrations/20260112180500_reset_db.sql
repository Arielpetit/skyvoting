-- Function to reset the database state
-- This will delete all data from the application tables but keep the structure

BEGIN;

-- Truncate tables in order of dependency (or use CASCADE)
TRUNCATE TABLE votes, participants, teams, lists, settings RESTART IDENTITY CASCADE;

-- Optional: If you want to keep the admin user or specific settings, you would insert them back here.
-- For a full hard reset, the above is sufficient.

COMMIT;
