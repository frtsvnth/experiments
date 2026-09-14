import { useEffect, useMemo, useRef, useState } from 'react';
import { computeMetrics } from '../engine/metrics';
import { buildProfile } from '../engine/interpret';
import { localDayContext } from '../engine/dayContext';
import { useSession } from '../shell/session';

const STAGES: { text: string; hold: number }[] = [
  { text: 'Измеряю длину и форму линии', hold: 1200 },
  { text: 'Считаю штрихи и паузы', hold: 1150 },
  { text: 'Определяю темп решений', hold: 1350 },
  { text: 'Учитываю день: погоду, календарь, луну', hold: 1450 },
  { text: 'Собираю разбор', hold: 1400 },
];

export function Processing() {
  const {
    strokes,
    canvasSize,
    drawElapsedMs,
    dayContext,
    birth,
    setProfile,
    setStage,
  } = useSession();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const startedRef = useRef(false);

  const total = useMemo(() => STAGES.reduce((sum, item) => sum + item.hold, 0), []);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      setProgress(Math.min(1, elapsed / total));
      if (elapsed < total) {
        frame = window.requestAnimationFrame(tick);
      }
    };
    frame = window.requestAnimationFrame(tick);

    const timers: number[] = [];
    let cursor = 0;
    STAGES.forEach((stage, stageIndex) => {
      cursor += stage.hold;
      timers.push(window.setTimeout(() => setIndex(stageIndex + 1), cursor));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [total]);

  useEffect(() => {
    if (index < STAGES.length || startedRef.current) return;
    startedRef.current = true;
    const metrics = computeMetrics(strokes, Math.max(1500, drawElapsedMs), {
      size: canvasSize || 360,
      gridSize: 18,
    });
    const context = dayContext ?? localDayContext(birth);
    const profile = buildProfile(metrics, context, birth);
    setProfile(profile);
    const timer = window.setTimeout(() => setStage('result'), 420);
    return () => window.clearTimeout(timer);
  }, [index, strokes, drawElapsedMs, canvasSize, dayContext, birth, setProfile, setStage]);

  const current = STAGES[Math.min(index, STAGES.length - 1)];

  return (
    <section className="screen screen-processing">
      <div className="processing-body">
        <p className="screen-step">АНАЛИЗ РИСУНКА</p>
        <h2 className="screen-title">{index >= STAGES.length ? 'Собираю разбор' : current.text}</h2>
        <div className="processing-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <ul className="processing-stages">
          {STAGES.map((stage, stageIndex) => (
            <li
              key={stage.text}
              className={stageIndex < index ? 'is-done' : stageIndex === index ? 'is-current' : ''}
            >
              {stage.text}
            </li>
          ))}
        </ul>
        <p className="processing-note">
          Имя и рисунок остаются в браузере. В сеть уходит только город и дата — для погоды и календаря.
        </p>
      </div>
    </section>
  );
}
