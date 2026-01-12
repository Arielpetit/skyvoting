export interface List {
    id: string;
    name: string;
    description: string | null;
    votes: number;
    created_at: string;
    participants?: Participant[];
    teams?: Team[];
}

export interface Team {
    id: string;
    name: string;
    list_id: string;
    created_at: string;
}

export interface Participant {
    id: string;
    name: string;
    avatar_url: string | null;
    list_id: string;
    team_id: string | null;
    role: string | null;
    created_at: string;
    teams?: Team; // For joined queries
}
