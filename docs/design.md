# Design Document - SkyVoting Auth Integration

## 1. Overview
The goal is to integrate Supabase Authentication (Google Login) into the SkyVoting application. Currently, the app uses device fingerprinting and local storage to prevent duplicate votes. We will replace/augment this with real user authentication to ensure one vote per user account.

## 2. User Flow
1.  **Landing**: User visits the app.
2.  **Auth Check**:
    *   If not logged in: Show a "Login with Google" button/page.
    *   If logged in: Show the Voting Interface.
3.  **Voting**:
    *   User selects a participant.
    *   System checks if `user_id` has already voted.
    *   If not, vote is recorded with `user_id`.
    *   UI updates to show "Thank you".

## 3. Architecture Changes

### Frontend
*   **New Route**: `/login` (or handle in `/` with conditional rendering).
*   **Auth Context**: A React Context to manage `session` and `user` state.
*   **Components**:
    *   `LoginButton`: Triggers Supabase Google OAuth.
    *   `VotingApp`: Update to use `user.id` instead of fingerprint.
    *   `Navbar/Header`: Show user avatar/logout button.

### Backend (Supabase)
*   **Auth**: Enable Google Provider (User needs to configure this in Supabase Dashboard).
*   **Database**:
    *   `votes` table: Ensure it has `user_id` (UUID, FK to `auth.users`) and a unique constraint on `(user_id, poll_id)` or just `user_id` if there's only one global poll.
    *   `profiles` table (Optional but recommended): To store user metadata if needed, but `auth.users` might suffice for simple voting.
*   **Edge Functions**:
    *   `vote`: Update to verify the user's JWT and extract `user_id` from it.

## 4. Data Model (Assumed/Proposed)

```sql
-- Existing (likely)
table participants (
  id uuid primary key,
  name text,
  votes int
);

-- New/Modified
table votes (
  id uuid primary key,
  participant_id uuid references participants(id),
  user_id uuid references auth.users(id), -- NEW
  created_at timestamptz
);

-- RLS Policies
-- Users can only insert their own vote.
-- Users can only read their own vote (to check if they voted).
```

## 5. Security
*   **RLS**: Enable RLS on `votes` table.
*   **Auth**: Only authenticated users can call the `vote` function or insert into `votes`.

## 6. Implementation Plan
1.  **Setup Auth**: Add `AuthProvider` and Login UI.
2.  **Database**: Create/Update `votes` table to link to `auth.users`.
3.  **Backend Logic**: Update `vote` Edge Function or direct DB logic to use `auth.uid()`.
4.  **Frontend Logic**: Remove fingerprinting logic (or keep as secondary check), use `user.id` for "has voted" check.
