import { useState } from 'react';
import { useAppState } from '../state/AppStateContext';
import type { SelectionMode, Team } from '../types';

const TeamRow = ({
  team,
  onUpdate,
  onDelete,
  onDragStart,
  onDrop,
}: {
  team: Team;
  onUpdate: (team: Team) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
}) => (
  <div
    className="admin-team-row"
    draggable
    onDragStart={() => onDragStart(team.id)}
    onDragOver={(event) => event.preventDefault()}
    onDrop={() => onDrop(team.id)}
  >
    <input value={team.name} onChange={(event) => onUpdate({ ...team, name: event.target.value })} />
    <input
      type="color"
      value={team.color ?? '#6a8dff'}
      onChange={(event) => onUpdate({ ...team, color: event.target.value })}
    />
    <label>
      <input
        type="checkbox"
        checked={team.enabled}
        onChange={(event) => onUpdate({ ...team, enabled: event.target.checked })}
      />
      В сессии
    </label>
    <button onClick={() => onDelete(team.id)}>Удалить</button>
  </div>
);

export const AdminPanel = () => {
  const {
    state,
    setMode,
    addTeam,
    updateTeam,
    removeTeam,
    reorderTeams,
    resetSession,
    undoLastPick,
    setPinnedNextTeam,
    setForcedRule,
    setFullOrder,
    clearRules,
    removeFromSession,
    restoreToSession,
    setMuted,
    exportJson,
    importJson,
  } = useAppState();
  const [newTeamName, setNewTeamName] = useState('');
  const [positionValue, setPositionValue] = useState(1);
  const [selectedTeamId, setSelectedTeamId] = useState(state.teams[0]?.id ?? '');
  const [importValue, setImportValue] = useState('');
  const [exportValue, setExportValue] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [draggingTeamId, setDraggingTeamId] = useState<string | null>(null);
  const [fullOrderInput, setFullOrderInput] = useState((state.scriptPlan.fullOrder ?? []).join(','));

  const unlockAdmin = pinInput === state.adminSettings.accessPin || window.location.hash === '#admin';

  if (!unlockAdmin) {
    return (
      <section className="admin-panel">
        <h2>Admin mode</h2>
        <p>Локальный доступ (UI-only): это не backend-аутентификация, только защита интерфейса.</p>
        <input
          type="password"
          placeholder="Введите PIN"
          value={pinInput}
          onChange={(event) => setPinInput(event.target.value)}
        />
      </section>
    );
  }

  return (
    <section className="admin-panel">
      <h2>Панель администратора</h2>

      <div className="admin-grid">
        <article>
          <h3>Команды</h3>
          {state.teams.map((team) => (
            <TeamRow
              key={team.id}
              team={team}
              onUpdate={updateTeam}
              onDelete={removeTeam}
              onDragStart={(id) => setDraggingTeamId(id)}
              onDrop={(targetId) => {
                if (!draggingTeamId || draggingTeamId === targetId) return;
                const ids = state.teams.map((item) => item.id);
                const from = ids.indexOf(draggingTeamId);
                const to = ids.indexOf(targetId);
                if (from < 0 || to < 0) return;
                ids.splice(from, 1);
                ids.splice(to, 0, draggingTeamId);
                reorderTeams(ids);
                setDraggingTeamId(null);
              }}
            />
          ))}
          <div className="inline-controls">
            <input
              placeholder="Новая команда"
              value={newTeamName}
              onChange={(event) => setNewTeamName(event.target.value)}
            />
            <button
              onClick={() => {
                if (!newTeamName.trim()) return;
                addTeam(newTeamName);
                setNewTeamName('');
              }}
            >
              Добавить
            </button>
          </div>
        </article>

        <article>
          <h3>Сценарий выбора</h3>
          <label>
            Режим
            <select
              value={state.adminSettings.selectionMode}
              onChange={(event) => setMode(event.target.value as SelectionMode)}
            >
              <option value="true-random">True random</option>
              <option value="scripted-random">Scripted random</option>
            </select>
          </label>
          <label>
            Pin next team
            <select value={selectedTeamId} onChange={(event) => setSelectedTeamId(event.target.value)}>
              {state.teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>
          <div className="inline-controls">
            <button onClick={() => setPinnedNextTeam(selectedTeamId)}>Зафиксировать следующую</button>
            <button onClick={() => setPinnedNextTeam(undefined)}>Снять pin</button>
          </div>
          <div className="inline-controls">
            <input
              type="number"
              min={1}
              max={99}
              value={positionValue}
              onChange={(event) => setPositionValue(Number(event.target.value))}
            />
            <button onClick={() => setForcedRule(selectedTeamId, positionValue)}>Фиксировать позицию</button>
          </div>
          <button onClick={clearRules}>Очистить правила</button>
          <label>
            Full scripted order (team-id через запятую)
            <input value={fullOrderInput} onChange={(event) => setFullOrderInput(event.target.value)} />
          </label>
          <button
            onClick={() =>
              setFullOrder(
                fullOrderInput
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
          >
            Применить full order
          </button>
        </article>

        <article>
          <h3>Сессия</h3>
          <div className="inline-controls">
            <button onClick={resetSession}>Reset session</button>
            <button onClick={undoLastPick}>Undo last pick</button>
          </div>
          <h4>Debug panel</h4>
          <p>Осталось: {state.session.activeTeamIds.length}</p>
          <p>История: {state.session.history.length}</p>
          <p>Pinned: {state.scriptPlan.pinnedNextTeamId ?? '—'}</p>
          <p>
            Forced rules: {state.scriptPlan.forcedPositions.filter((item) => !item.applied).length} активных
          </p>
          <label>
            <input
              type="checkbox"
              checked={state.adminSettings.muted}
              onChange={(event) => setMuted(event.target.checked)}
            />
            Mute звуков
          </label>
          <h4>Ручное управление сессией</h4>
          <div className="inline-controls">
            <select value={selectedTeamId} onChange={(event) => setSelectedTeamId(event.target.value)}>
              {state.teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <button onClick={() => removeFromSession(selectedTeamId)}>Убрать из активных</button>
            <button onClick={() => restoreToSession(selectedTeamId)}>Вернуть в активные</button>
          </div>
        </article>

        <article>
          <h3>Импорт / экспорт</h3>
          <div className="inline-controls">
            <button onClick={() => setExportValue(exportJson())}>Экспорт JSON</button>
            <button
              onClick={() => {
                if (!importValue.trim()) return;
                importJson(importValue);
              }}
            >
              Импорт JSON
            </button>
          </div>
          <textarea value={exportValue} onChange={(event) => setExportValue(event.target.value)} />
          <textarea
            value={importValue}
            onChange={(event) => setImportValue(event.target.value)}
            placeholder="Вставьте JSON для импорта"
          />
        </article>
      </div>
    </section>
  );
};
