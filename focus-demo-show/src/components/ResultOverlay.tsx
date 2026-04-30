import type { Team } from '../types';

export const ResultOverlay = ({
  team,
  onConfirm,
}: {
  team: Team | null;
  onConfirm: () => void;
}) => {
  if (!team) return null;
  return (
    <div className="result-overlay" role="dialog" aria-modal="true">
      <div className="result-card" style={{ borderColor: team.color ?? '#9f7aea' }}>
        <p>Следующая команда</p>
        <h2>{team.name}</h2>
        <button onClick={onConfirm}>Передать слово</button>
      </div>
    </div>
  );
};
