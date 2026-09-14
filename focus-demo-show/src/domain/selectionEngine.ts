import type { AppState, SelectionEngineOutput, SelectionMode, Team } from '../types';

const randomFromSeed = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const pickRandomTeam = (teams: Team[], entropy: number): Team => {
  const index = Math.floor(randomFromSeed(entropy) * teams.length);
  return teams[Math.max(0, Math.min(index, teams.length - 1))];
};

export const selectNextTeam = (
  state: AppState,
  mode: SelectionMode,
): SelectionEngineOutput | null => {
  const availableTeams = state.teams.filter(
    (team) =>
      state.session.activeTeamIds.includes(team.id) &&
      team.enabled &&
      !state.scriptPlan.excludedTeamIds.includes(team.id),
  );

  if (!availableTeams.length) {
    return null;
  }

  const seed = Date.now() + state.session.step * 37;
  let reason: SelectionEngineOutput['reason'] = 'true-random';
  let plannedTeam: Team | undefined;
  let appliedRuleId: string | undefined;

  if (mode === 'scripted-random') {
    if (state.scriptPlan.pinnedNextTeamId) {
      plannedTeam = availableTeams.find((team) => team.id === state.scriptPlan.pinnedNextTeamId);
      reason = 'pinned-next';
    }

    if (!plannedTeam) {
      const forced = state.scriptPlan.forcedPositions.find(
        (rule) => !rule.applied && rule.position === state.session.step,
      );
      if (forced) {
        plannedTeam = availableTeams.find((team) => team.id === forced.teamId);
        if (plannedTeam) {
          reason = 'forced-position';
          appliedRuleId = forced.id;
        }
      }
    }

    if (!plannedTeam && state.scriptPlan.fullOrder?.length) {
      const nextFromOrder = state.scriptPlan.fullOrder.find((teamId) =>
        availableTeams.some((team) => team.id === teamId),
      );
      if (nextFromOrder) {
        plannedTeam = availableTeams.find((team) => team.id === nextFromOrder);
        reason = 'scripted-order';
      }
    }
  }

  const team = plannedTeam ?? pickRandomTeam(availableTeams, seed);

  return {
    team,
    reason,
    animationHint: {
      seed,
      durationMs: 3800 + Math.floor(randomFromSeed(seed + 7) * 1500),
      suspenseMs: 500 + Math.floor(randomFromSeed(seed + 11) * 1200),
      nearMissCount: 1 + Math.floor(randomFromSeed(seed + 13) * 3),
    },
    debugMeta: {
      mode,
      availableTeamIds: availableTeams.map((item) => item.id),
      plannedTeamId: plannedTeam?.id,
      appliedRuleId,
    },
  };
};
