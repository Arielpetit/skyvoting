export const PREDEFINED_LISTS = [
  { name: 'List 1', description: 'First List' },
  { name: 'List 2', description: 'Second List' },
] as const;

export const PREDEFINED_TEAMS = {
  'List 1': ['Team 1', 'Team 2'],
  'List 2': ['Team 3', 'Team 4'],
} as const;

export const PREDEFINED_ROLES = ['Titulaire', 'Suppleant'] as const;
