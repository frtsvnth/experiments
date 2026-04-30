import type { AppState, Team } from '../types';

const defaultTeams: Team[] = [
  { id: 'platform', name: 'Platform', color: '#7c5cff', enabled: true },
  { id: 'mobile', name: 'Mobile', color: '#00c2ff', enabled: true },
  { id: 'payments', name: 'Payments', color: '#3ddc97', enabled: true },
  { id: 'growth', name: 'Growth', color: '#ffc857', enabled: true },
  { id: 'search', name: 'Search', color: '#ff6b6b', enabled: true },
  { id: 'core-web', name: 'Core Web', color: '#b26dff', enabled: true },
];

const makeSession = (teams: Team[]) => ({
  id: crypto.randomUUID(),
  name: `Sprint Review ${new Date().toLocaleDateString('ru-RU')}`,
  activeTeamIds: teams.filter((team) => team.enabled).map((team) => team.id),
  removedTeamIds: [] as string[],
  history: [],
  step: 1,
});

export const createDefaultState = (): AppState => ({
  teams: defaultTeams,
  session: makeSession(defaultTeams),
  scriptPlan: {
    forcedPositions: [],
    excludedTeamIds: [],
  },
  adminSettings: {
    accessPin: '0420',
    selectionMode: 'true-random',
    selectedMechanic: 'wheel',
    muted: false,
    reducedMotion: false,
    appTitle: 'Sprint Review Show',
  },
});

export const createSessionFromTeams = (teams: Team[]) => makeSession(teams);
