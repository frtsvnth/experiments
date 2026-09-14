import { createContext, useContext, useMemo, useState } from 'react';
import { createSessionFromTeams } from '../domain/defaults';
import { selectNextTeam } from '../domain/selectionEngine';
import { exportStateJson, importStateJson, loadState, saveState } from '../persistence/storage';
import type { AppState, MechanicId, SelectionEngineOutput, Team } from '../types';

interface AppActions {
  state: AppState;
  lastOutput: SelectionEngineOutput | null;
  setMechanic: (mechanic: MechanicId) => void;
  setMode: (mode: AppState['adminSettings']['selectionMode']) => void;
  pickNext: () => SelectionEngineOutput | null;
  revealApplied: () => void;
  resetSession: () => void;
  undoLastPick: () => void;
  addTeam: (teamName: string) => void;
  updateTeam: (team: Team) => void;
  removeTeam: (teamId: string) => void;
  reorderTeams: (teamIds: string[]) => void;
  setPinnedNextTeam: (teamId?: string) => void;
  setForcedRule: (teamId: string, position: number) => void;
  setFullOrder: (teamIds: string[]) => void;
  clearRules: () => void;
  removeFromSession: (teamId: string) => void;
  restoreToSession: (teamId: string) => void;
  setMuted: (muted: boolean) => void;
  exportJson: () => string;
  importJson: (raw: string) => void;
}

const AppStateContext = createContext<AppActions | null>(null);

const persist = (updater: (prev: AppState) => AppState, setState: (next: AppState) => void, prev: AppState) => {
  const next = updater(prev);
  saveState(next);
  setState(next);
};

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(() => loadState());
  const [lastOutput, setLastOutput] = useState<SelectionEngineOutput | null>(null);

  const actions: AppActions = useMemo(
    () => ({
      state,
      lastOutput,
      setMechanic: (mechanic) =>
        persist(
          (prev) => ({ ...prev, adminSettings: { ...prev.adminSettings, selectedMechanic: mechanic } }),
          setState,
          state,
        ),
      setMode: (mode) =>
        persist(
          (prev) => ({ ...prev, adminSettings: { ...prev.adminSettings, selectionMode: mode } }),
          setState,
          state,
        ),
      pickNext: () => {
        const result = selectNextTeam(state, state.adminSettings.selectionMode);
        setLastOutput(result);
        return result;
      },
      revealApplied: () => {
        if (!lastOutput) return;
        persist(
          (prev) => {
            const nextPlan = { ...prev.scriptPlan };
            if (lastOutput.reason === 'pinned-next') {
              nextPlan.pinnedNextTeamId = undefined;
            }
            if (lastOutput.debugMeta.appliedRuleId) {
              nextPlan.forcedPositions = nextPlan.forcedPositions.map((rule) =>
                rule.id === lastOutput.debugMeta.appliedRuleId ? { ...rule, applied: true } : rule,
              );
            }
            if (lastOutput.reason === 'scripted-order') {
              nextPlan.fullOrder = nextPlan.fullOrder?.filter((id) => id !== lastOutput.team.id);
            }

            return {
              ...prev,
              scriptPlan: nextPlan,
              session: {
                ...prev.session,
                activeTeamIds: prev.session.activeTeamIds.filter((id) => id !== lastOutput.team.id),
                removedTeamIds: [...prev.session.removedTeamIds, lastOutput.team.id],
                history: [
                  ...prev.session.history,
                  {
                    mechanic: prev.adminSettings.selectedMechanic,
                    mode: prev.adminSettings.selectionMode,
                    reason: lastOutput.reason,
                    step: prev.session.step,
                    teamId: lastOutput.team.id,
                    timestamp: Date.now(),
                  },
                ],
                step: prev.session.step + 1,
              },
            };
          },
          setState,
          state,
        );
        setLastOutput(null);
      },
      resetSession: () =>
        persist(
          (prev) => ({
            ...prev,
            session: createSessionFromTeams(prev.teams),
            scriptPlan: {
              ...prev.scriptPlan,
              forcedPositions: prev.scriptPlan.forcedPositions.map((item) => ({ ...item, applied: false })),
            },
          }),
          setState,
          state,
        ),
      undoLastPick: () =>
        persist(
          (prev) => {
            const history = [...prev.session.history];
            const last = history.pop();
            if (!last) return prev;
            return {
              ...prev,
              session: {
                ...prev.session,
                history,
                step: Math.max(1, prev.session.step - 1),
                activeTeamIds: [...prev.session.activeTeamIds, last.teamId],
                removedTeamIds: prev.session.removedTeamIds.filter((id) => id !== last.teamId),
              },
            };
          },
          setState,
          state,
        ),
      addTeam: (teamName) =>
        persist(
          (prev) => {
            const team: Team = {
              id: crypto.randomUUID(),
              name: teamName.trim(),
              enabled: true,
              color: '#6a8dff',
            };
            return {
              ...prev,
              teams: [...prev.teams, team],
              session: {
                ...prev.session,
                activeTeamIds: [...prev.session.activeTeamIds, team.id],
              },
            };
          },
          setState,
          state,
        ),
      updateTeam: (team) =>
        persist(
          (prev) => ({ ...prev, teams: prev.teams.map((item) => (item.id === team.id ? team : item)) }),
          setState,
          state,
        ),
      removeTeam: (teamId) =>
        persist(
          (prev) => ({
            ...prev,
            teams: prev.teams.filter((item) => item.id !== teamId),
            session: {
              ...prev.session,
              activeTeamIds: prev.session.activeTeamIds.filter((id) => id !== teamId),
              removedTeamIds: prev.session.removedTeamIds.filter((id) => id !== teamId),
            },
          }),
          setState,
          state,
        ),
      reorderTeams: (teamIds) =>
        persist(
          (prev) => ({
            ...prev,
            teams: teamIds
              .map((id) => prev.teams.find((team) => team.id === id))
              .filter((team): team is Team => Boolean(team)),
          }),
          setState,
          state,
        ),
      setPinnedNextTeam: (teamId) =>
        persist(
          (prev) => ({ ...prev, scriptPlan: { ...prev.scriptPlan, pinnedNextTeamId: teamId } }),
          setState,
          state,
        ),
      setForcedRule: (teamId, position) =>
        persist(
          (prev) => ({
            ...prev,
            scriptPlan: {
              ...prev.scriptPlan,
              forcedPositions: [
                ...prev.scriptPlan.forcedPositions.filter((rule) => rule.position !== position),
                { id: crypto.randomUUID(), applied: false, position, teamId },
              ],
            },
          }),
          setState,
          state,
        ),
      setFullOrder: (teamIds) =>
        persist(
          (prev) => ({ ...prev, scriptPlan: { ...prev.scriptPlan, fullOrder: teamIds } }),
          setState,
          state,
        ),
      clearRules: () =>
        persist(
          (prev) => ({
            ...prev,
            scriptPlan: { ...prev.scriptPlan, forcedPositions: [], pinnedNextTeamId: undefined, fullOrder: undefined },
          }),
          setState,
          state,
        ),
      removeFromSession: (teamId) =>
        persist(
          (prev) => ({
            ...prev,
            session: {
              ...prev.session,
              activeTeamIds: prev.session.activeTeamIds.filter((id) => id !== teamId),
              removedTeamIds: prev.session.removedTeamIds.includes(teamId)
                ? prev.session.removedTeamIds
                : [...prev.session.removedTeamIds, teamId],
            },
          }),
          setState,
          state,
        ),
      restoreToSession: (teamId) =>
        persist(
          (prev) => ({
            ...prev,
            session: {
              ...prev.session,
              activeTeamIds: prev.session.activeTeamIds.includes(teamId)
                ? prev.session.activeTeamIds
                : [...prev.session.activeTeamIds, teamId],
              removedTeamIds: prev.session.removedTeamIds.filter((id) => id !== teamId),
            },
          }),
          setState,
          state,
        ),
      setMuted: (muted) =>
        persist(
          (prev) => ({ ...prev, adminSettings: { ...prev.adminSettings, muted } }),
          setState,
          state,
        ),
      exportJson: () => exportStateJson(state),
      importJson: (raw) => {
        const parsed = importStateJson(raw);
        saveState(parsed);
        setState(parsed);
      },
    }),
    [lastOutput, state],
  );

  return <AppStateContext.Provider value={actions}>{children}</AppStateContext.Provider>;
};

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within provider');
  return ctx;
};
