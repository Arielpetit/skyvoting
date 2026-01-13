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

## 7. List Voting System (New Requirement)

### Overview
Transitioning from individual participant voting to "List" (Team) voting.
*   **List**: Represents a team (e.g., "Team Alpha").
*   **Members**: Each list has members with roles (e.g., Delegate, Assistant).
*   **Voting**: Users vote for a List.

### Data Model Changes
*   **New Table**: `lists` (id, name, description, votes_count).
*   **Modified Table**: `participants` adds `list_id` (FK) and `role` (text).
*   **Modified Table**: `votes` changes `participant_id` to `list_id`.

### UI Changes
*   **Main View**: Display Cards for Lists (not individuals).
*   **List Card**: Shows List Name and summary of members.
*   **List Details**: Clicking a list expands/opens modal to show all members and their roles.
*   **Admin**: Form to create a List and add members to it simultaneously.

## 8. Voting Report (New Requirement)

### Overview
Generate a comprehensive report at the end of the voting process.
*   **Total Eligible Voters**: Total number of employees/people who should vote.
*   **Voter List**: List of all eligible voters.
*   **Actual Voters**: List of people who cast their vote.
*   **Absences**: List of people who did not vote.
*   **Total Votes**: Count of all votes cast.
*   **Votes per List**: Breakdown of votes for each candidate list.
*   **Winner**: The list with the most votes and its percentage.

### Technical Implementation
*   **Data Fetching**: A custom hook `useReport` will fetch:
    *   All participants (to count eligible voters).
    *   All votes (to count actual voters and breakdown).
    *   Voter details (to identify who voted and who didn't).
*   **PDF Generation**: Use `jspdf` and `jspdf-autotable` or `html2canvas` to generate a well-designed PDF.
*   **UI**: A dedicated "Report" section in the Admin dashboard.
