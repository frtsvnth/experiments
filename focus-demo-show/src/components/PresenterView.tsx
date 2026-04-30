import { useMemo, useState } from 'react';
import { mechanicAdapters } from '../mechanics/adapters';
import { playRevealSound, playStartSound } from '../mechanics/sound';
import { useAppState } from '../state/AppStateContext';
import { MechanicStage } from './MechanicStage';
import { ResultOverlay } from './ResultOverlay';

export const PresenterView = () => {
  const { state, setMechanic, pickNext, lastOutput, revealApplied } = useAppState();
  const [isRunning, setIsRunning] = useState(false);
  const teams = useMemo(
    () => state.teams.filter((team) => state.session.activeTeamIds.includes(team.id)),
    [state.session.activeTeamIds, state.teams],
  );

  const start = () => {
    const result = pickNext();
    if (!result) return;
    if (!state.adminSettings.muted) playStartSound();
    setIsRunning(true);
    window.setTimeout(() => {
      setIsRunning(false);
      if (!state.adminSettings.muted) playRevealSound();
    }, result.animationHint.durationMs);
  };

  return (
    <section className="presenter-screen">
      <header>
        <h1>{state.adminSettings.appTitle}</h1>
        <p>{state.session.name}</p>
      </header>

      <div className="mechanic-tabs">
        {mechanicAdapters.map((item) => (
          <button
            key={item.id}
            className={item.id === state.adminSettings.selectedMechanic ? 'active' : ''}
            onClick={() => setMechanic(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <MechanicStage
        mechanic={state.adminSettings.selectedMechanic}
        teams={teams}
        isRunning={isRunning}
        targetTeamId={lastOutput?.team.id}
        durationMs={lastOutput?.animationHint.durationMs ?? 3000}
      />

      <div className="presenter-actions">
        <button onClick={start} disabled={isRunning || teams.length === 0}>
          Start
        </button>
      </div>

      <div className="history">
        <h3>Уже выступили</h3>
        <div>
          {state.session.history.map((item) => {
            const team = state.teams.find((teamItem) => teamItem.id === item.teamId);
            return <span key={`${item.timestamp}-${item.teamId}`}>{team?.name ?? item.teamId}</span>;
          })}
        </div>
      </div>

      <ResultOverlay team={!isRunning ? lastOutput?.team ?? null : null} onConfirm={revealApplied} />
    </section>
  );
};
