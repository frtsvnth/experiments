import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { GridCanvas } from '../canvas/GridCanvas';
import { INKS } from '../engine/types';
import { useSession } from '../shell/session';

const SESSION_MS = 60000;
const MIN_MS = 8000;
const CLEAR_WINDOW_MS = 8000;

export function Draw() {
  const { strokes, setStrokes, setDrawElapsedMs, setStage, setCanvasSize } = useSession();
  const [elapsed, setElapsed] = useState(0);
  const [ink, setInk] = useState(INKS[0].color);
  const startRef = useRef<number>(performance.now());
  const elapsedRef = useRef(0);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setDrawElapsedMs(elapsedRef.current);
    setStage('processing');
  }, [setStage, setDrawElapsedMs]);

  useEffect(() => {
    startRef.current = performance.now();
    const timer = window.setInterval(() => {
      const value = performance.now() - startRef.current;
      elapsedRef.current = value;
      setElapsed(value);
      setDrawElapsedMs(value);
      if (value >= SESSION_MS) {
        window.clearInterval(timer);
        finish();
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [finish, setDrawElapsedMs]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'z' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setStrokes(strokes.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [strokes, setStrokes]);

  const remaining = Math.max(0, SESSION_MS - elapsed);
  const secondsLeft = Math.ceil(remaining / 1000);
  const canFinish = elapsed >= MIN_MS;
  const canUndo = strokes.length > 0;
  const canClear = elapsed < CLEAR_WINDOW_MS && strokes.length > 0;
  const progress = Math.min(1, elapsed / SESSION_MS);
  const circumference = 2 * Math.PI * 20;

  const handleUndo = () => setStrokes(strokes.slice(0, -1));
  const handleClear = () => {
    if (canClear) setStrokes([]);
  };

  return (
    <section className="screen screen-draw">
      <div className="draw-head">
        <div className="draw-timer">
          <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
            <circle cx="24" cy="24" r="20" className="timer-track" />
            <circle
              cx="24"
              cy="24"
              r="20"
              className="timer-progress"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * progress}
            />
          </svg>
          <span className={`draw-seconds ${strokes.length > 0 ? 'is-recording' : ''}`}>{secondsLeft}</span>
        </div>
        <div className="draw-status">
          <p className="screen-step">ШАГ 3 ИЗ 3 · ВЫ РИСУЕТЕ</p>
          <p className="draw-hint">
            {strokes.length === 0
              ? 'Рисуйте линию. Если не хочется — оставьте лист пустым, это тоже результат.'
              : `Штрихов: ${strokes.length}. Можно закончить, когда посчитаете нужным.`}
          </p>
        </div>
      </div>

      <div className="draw-stage">
        <GridCanvas
          strokes={strokes}
          onStrokesChange={(value) => setStrokes(value)}
          color={ink}
          gridSize={18}
          baseWidth={2.6}
          onSizeChange={setCanvasSize}
        />
      </div>

      <div className="draw-toolbar">
        <div className="ink-picker" role="group" aria-label="Цвет линии">
          {INKS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`ink-swatch ${ink === entry.color ? 'is-active' : ''}`}
              style={{ '--swatch': entry.color } as CSSProperties}
              aria-label={entry.label}
              aria-pressed={ink === entry.color}
              onClick={() => setInk(entry.color)}
            />
          ))}
        </div>
        <div className="draw-tools">
          <button type="button" className="btn btn-ghost btn-compact" disabled={!canUndo} onClick={handleUndo}>
            Отменить
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-compact"
            disabled={!canClear}
            onClick={handleClear}
            title={canClear ? 'Убрать все линии' : 'Стереть можно только в первые 8 секунд'}
          >
            Стереть всё
          </button>
        </div>
        <button type="button" className="btn btn-primary" disabled={!canFinish} onClick={finish}>
          {canFinish ? 'Закончить и получить разбор' : 'Подождите 8 секунд'}
        </button>
      </div>
    </section>
  );
}
