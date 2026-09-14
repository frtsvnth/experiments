export type SelectionMode = 'true-random' | 'scripted-random';

export type SelectionReason =
  | 'forced-position'
  | 'pinned-next'
  | 'scripted-order'
  | 'true-random';

export type MechanicId =
  | 'wheel'
  | 'plinko'
  | 'pinball'
  | 'slot'
  | 'race'
  | 'claw'
  | 'cards';

export interface Team {
  id: string;
  name: string;
  color?: string;
  logoUrl?: string;
  enabled: boolean;
}

export interface ForcedPositionRule {
  id: string;
  teamId: string;
  position: number;
  applied: boolean;
}

export interface ScriptPlan {
  fullOrder?: string[];
  forcedPositions: ForcedPositionRule[];
  pinnedNextTeamId?: string;
  excludedTeamIds: string[];
}

export interface SessionState {
  id: string;
  name: string;
  activeTeamIds: string[];
  removedTeamIds: string[];
  history: SelectionResult[];
  step: number;
}

export interface SelectionResult {
  teamId: string;
  timestamp: number;
  step: number;
  reason: SelectionReason;
  mode: SelectionMode;
  mechanic: MechanicId;
}

export interface AnimationHint {
  seed: number;
  durationMs: number;
  suspenseMs: number;
  nearMissCount: number;
}

export interface SelectionEngineOutput {
  team: Team;
  reason: SelectionReason;
  animationHint: AnimationHint;
  debugMeta: {
    mode: SelectionMode;
    availableTeamIds: string[];
    plannedTeamId?: string;
    appliedRuleId?: string;
  };
}

export interface AdminSettings {
  accessPin: string;
  selectionMode: SelectionMode;
  selectedMechanic: MechanicId;
  muted: boolean;
  reducedMotion: boolean;
  appTitle: string;
}

export interface AppState {
  teams: Team[];
  session: SessionState;
  scriptPlan: ScriptPlan;
  adminSettings: AdminSettings;
}
