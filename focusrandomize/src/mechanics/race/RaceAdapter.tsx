import { useEffect, useMemo, useState, useRef } from 'react';
import type { MechanicAdapterProps } from '../adapter';
import { mulberry32 } from '../../utils/seededRandom';

export default function RaceAdapter({
  teams,
  targetTeam,
  seed,
  reducedMotion,
  onComplete,
}: MechanicAdapterProps) {
  const targetId = targetTeam.id;
  const trackRef = useRef<HTMLDivElement>(null);

  const speeds = useMemo(() => {
    const rand = mulberry32(seed);
    const map: Record<string, number> = {};
    let maxOther = 0;
    for (const t of teams) {
      const base = 0.7 + rand() * 1.2;
      map[t.id] = base;
      if (t.id !== targetId) maxOther = Math.max(maxOther, base);
    }
    map[targetId] = maxOther + 0.3 + rand() * 0.5;
    return map;
  }, [teams, targetId, seed]);

  const [positions, setPositions] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const t of teams) init[t.id] = 5;
    return init;
  });

  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      const fin: Record<string, number> = {};
      for (const t of teams) fin[t.id] = t.id === targetId ? 90 : 50 + Math.random() * 30;
      setPositions(fin);
      setFinished(true);
      const to = setTimeout(onComplete, 600);
      return () => clearTimeout(to);
    }

    let animId = 0;
    const state: Record<string, number> = {};
    for (const t of teams) state[t.id] = 5;

    const step = () => {
      let winner = false;
      for (const t of teams) {
        if (state[t.id] >= 90) continue;
        state[t.id] += speeds[t.id] * (0.8 + Math.random() * 0.4);
        if (state[t.id] >= 90) {
          state[t.id] = 90;
          if (t.id === targetId) winner = true;
        }
      }
      setPositions({ ...state });
      if (winner) {
        setFinished(true);
        setTimeout(onComplete, 900);
      } else {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [teams, targetId, speeds, reducedMotion, onComplete]);

  const animalEmojis = ['🐴', '🦄', '🐎', '🦓', '🐂', '🦬', '🐃', '🐪', '🐆', '🐕', '🐩', '🐈', '🐇', '🦊', '🐺'];

  return (
    <div
      ref={trackRef}
      style={{
        position: 'relative',
        width: 'min(90vw, 700px)',
        margin: '0 auto',
        background: 'linear-gradient(180deg, #2d5a27, #1a3a16)',
        borderRadius: 20,
        padding: '16px 0',
        border: '3px solid #3d7a33',
        boxShadow: '0 0 30px rgba(34,211,238,0.08), inset 0 0 30px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}
    >
      {/* Track lanes */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 44px, rgba(255,255,255,0.04) 44px, rgba(255,255,255,0.04) 46px)',
        pointerEvents: 'none',
      }} />
      {/* Finish line */}
      <div style={{
        position: 'absolute',
        right: 20,
        top: 0,
        bottom: 0,
        width: 4,
        background: 'repeating-linear-gradient(0deg, #fff 0px, #fff 10px, #000 10px, #000 20px)',
        opacity: 0.6,
        pointerEvents: 'none',
      }} />

      {teams.map((t, idx) => {
        const pct = positions[t.id] || 5;
        const isWinner = finished && t.id === targetId;
        const emoji = t.logo || animalEmojis[idx % animalEmojis.length];
        return (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 44,
              position: 'relative',
              paddingLeft: 8,
              borderBottom: idx < teams.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
            }}
          >
            {/* Lane number */}
            <span style={{
              width: 28, textAlign: 'center', fontSize: 12, fontWeight: 700,
              color: '#94a3b8', flexShrink: 0,
            }}>{idx + 1}</span>
            {/* Team name label */}
            <span style={{
              width: 90, fontSize: 12, fontWeight: 700, color: '#e2e8f0',
              flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{t.name}</span>
            {/* Runner */}
            <div style={{
              position: 'absolute',
              left: `${pct}%`,
              top: idx * 44 + 8,
              transform: 'translateX(-50%)',
              fontSize: 32,
              transition: reducedMotion ? 'none' : 'left 0.15s linear',
              filter: isWinner ? 'drop-shadow(0 0 10px gold)' : 'none',
              zIndex: 2,
            }}>
              {emoji}
            </div>
            {/* Color trail */}
            <div style={{
              position: 'absolute',
              left: '128px',
              top: idx * 44 + 8 + 18,
              width: `${Math.max(0, pct - 18)}%`,
              height: 3,
              background: `linear-gradient(90deg, ${t.color}88, ${t.color}22)`,
              borderRadius: 2,
              opacity: 0.5,
              pointerEvents: 'none',
            }} />
          </div>
        );
      })}

      {finished && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 20,
          zIndex: 10,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: targetTeam.color, textShadow: `0 0 20px ${targetTeam.color}88` }}>
              {targetTeam.name}
            </div>
            <div style={{ fontSize: 16, color: '#fbbf24', marginTop: 4 }}>Победитель!</div>
          </div>
        </div>
      )}
    </div>
  );
}
