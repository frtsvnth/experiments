import { useEffect, useMemo, useState } from 'react';
import { getMechanicAdapter } from '../mechanics/adapters';
import type { MechanicId, Team } from '../types';

interface Props {
  mechanic: MechanicId;
  teams: Team[];
  isRunning: boolean;
  targetTeamId?: string;
  durationMs: number;
}

export const MechanicStage = ({ mechanic, teams, isRunning, targetTeamId, durationMs }: Props) => {
  const [elapsed, setElapsed] = useState(0);
  const adapter = getMechanicAdapter(mechanic);
  const targetIndex = Math.max(
    0,
    teams.findIndex((team) => team.id === targetTeamId),
  );

  useEffect(() => {
    if (!isRunning) {
      setElapsed(0);
      return;
    }
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      setElapsed(now - startedAt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isRunning]);

  const frame = useMemo(
    () =>
      adapter.computeFrame(elapsed, {
        durationMs,
        nearMissCount: 2,
        seed: 10,
        suspenseMs: 600,
      }),
    [adapter, durationMs, elapsed],
  );

  const highlightProgress = Math.floor(frame.progress * Math.max(teams.length, 1) * 4) % Math.max(teams.length, 1);
  const reels = [
    Math.floor((1 - frame.progress) * 20 + highlightProgress) % Math.max(teams.length, 1),
    Math.floor((1 - frame.progress) * 30 + highlightProgress * 2) % Math.max(teams.length, 1),
    Math.floor((1 - frame.progress) * 40 + highlightProgress * 3) % Math.max(teams.length, 1),
  ];

  const renderMechanicBody = () => {
    if (teams.length === 0) return <p>Нет активных команд</p>;

    if (mechanic === 'wheel') {
      return (
        <div className="wheel-layout">
          <div
            className="wheel-disc"
            style={{ transform: `rotate(${frame.progress * 1440 + targetIndex * (360 / teams.length)}deg)` }}
          >
            {teams.map((team, index) => (
              <div
                key={team.id}
                className={`wheel-segment ${!isRunning && index === targetIndex ? 'winner' : ''}`}
                style={{ transform: `rotate(${(360 / teams.length) * index}deg)` }}
              >
                {team.name}
              </div>
            ))}
          </div>
          <div className="wheel-pointer">▼</div>
        </div>
      );
    }

    if (mechanic === 'plinko') {
      return (
        <div className="plinko-board">
          <div className="plinko-pins">
            {Array.from({ length: 36 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="plinko-ball" style={{ left: `${10 + frame.progress * 80}%` }} />
          <div className="plinko-slots">
            {teams.map((team, index) => (
              <div key={team.id} className={!isRunning && index === targetIndex ? 'winner' : ''}>
                {team.name}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (mechanic === 'pinball') {
      return (
        <div className="pinball-table">
          <div className="pinball-bumpers">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="pinball-ball" style={{ left: `${frame.progress * 82}%`, top: `${20 + frame.pulse * 8}%` }} />
          <div className="pinball-pockets">
            {teams.map((team, index) => (
              <div key={team.id} className={!isRunning && index === targetIndex ? 'winner' : ''}>
                {team.name}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (mechanic === 'slot') {
      return (
        <div className="slot-machine">
          {reels.map((value, reelIndex) => (
            <div key={reelIndex} className="slot-reel">
              {teams[value]?.name}
            </div>
          ))}
          <div className="slot-result">{!isRunning ? teams[targetIndex]?.name : '...'}</div>
        </div>
      );
    }

    if (mechanic === 'race') {
      return (
        <div className="race-track">
          {teams.map((team, index) => {
            const progress = isRunning
              ? Math.min(1, frame.progress * (0.8 + (index % 3) * 0.1) + (index === targetIndex ? 0.1 : 0))
              : index === targetIndex
                ? 1
                : 0.86;
            return (
              <div key={team.id} className="race-row">
                <span>{team.name}</span>
                <div className="race-lane-inner">
                  <i style={{ left: `${progress * 92}%` }} className={!isRunning && index === targetIndex ? 'winner' : ''} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (mechanic === 'claw') {
      return (
        <div className="claw-machine">
          <div className="claw-head" style={{ left: `${8 + frame.progress * 80}%` }}>
            ║║
          </div>
          <div className="claw-capsules">
            {teams.map((team, index) => (
              <span key={team.id} className={!isRunning && index === targetIndex ? 'winner' : ''}>
                {team.name}
              </span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="cards-grid">
        {teams.map((team, index) => (
          <div key={team.id} className={`card-door ${!isRunning && index === targetIndex ? 'opened winner' : ''}`}>
            {!isRunning && index === targetIndex ? team.name : '?'}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`mechanic-stage ${adapter.renderClassName}`} aria-live="polite">
      <div className="mechanic-title">{adapter.title}</div>
      {renderMechanicBody()}
      <div className="progress-bar">
        <div style={{ width: `${Math.min(100, frame.progress * 100)}%` }} />
      </div>
    </div>
  );
};
