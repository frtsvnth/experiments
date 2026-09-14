import { useEffect, useState } from 'react';
import { useSession } from '../shell/session';

const COUNT_STEPS = ['3', '2', '1'];

export function Briefing() {
  const { setStage, setStrokes, setDrawElapsedMs } = useSession();
  const [counting, setCounting] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!counting) return;
    if (step >= COUNT_STEPS.length) {
      setStrokes([]);
      setDrawElapsedMs(0);
      setStage('draw');
      return;
    }
    const timer = window.setTimeout(() => setStep((value) => value + 1), 700);
    return () => window.clearTimeout(timer);
  }, [counting, step, setStage, setStrokes, setDrawElapsedMs]);

  return (
    <section className="screen screen-briefing">
      <header className="screen-head">
        <p className="screen-step">ШАГ 2 ИЗ 3 · ИНСТРУКЦИЯ</p>
        <h2 className="screen-title">Одна минута — любой след</h2>
      </header>

      <div className="briefing-body">
        <ul className="briefing-list">
          <li>Ведите линию по клетке так, как ведёте её сейчас. Красиво не нужно.</li>
          <li>Можно писать, чертить, ставить точки или не рисовать вовсе.</li>
          <li>След — это не задание. Это способ посмотреть на темп и форму дня.</li>
        </ul>
        <p className="briefing-out">
          На выходе — срез личности на сегодняшний день. Не оценка «хороший» или «плохой»:
          состояние дня, способ решать и то, как этот день его усиливает.
        </p>
      </div>

      {counting ? (
        <div className="countdown" aria-live="polite">
          <span className="countdown-number">{COUNT_STEPS[step] ?? '1'}</span>
          <span className="countdown-caption">приготовьте руку</span>
        </div>
      ) : (
        <div className="screen-actions">
          <button type="button" className="btn btn-primary" onClick={() => setCounting(true)}>
            Открыть клетку
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setStage('intake')}>
            Назад
          </button>
        </div>
      )}
    </section>
  );
}
