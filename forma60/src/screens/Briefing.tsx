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
        <p className="screen-step">ШАГ 2 ИЗ 3 · РИСУНОК</p>
        <h2 className="screen-title">Нарисуйте что угодно за минуту</h2>
      </header>

      <div className="briefing-body">
        <ul className="briefing-list">
          <li>Ведите линию по клетке как получится. Красиво рисовать не нужно.</li>
          <li>Можно чертить, писать, ставить точки — или не рисовать вообще.</li>
          <li>Это не тест и не задание. По рисунку видно ваше состояние сейчас.</li>
        </ul>
        <p className="briefing-out">
          В конце вы получите разбор себя на сегодня: как вы принимаете решения, как общаетесь, что вас
          выматывает и почему день читается именно так. Это не оценка «хорошо» или «плохо».
        </p>
      </div>

      {counting ? (
        <div className="countdown" aria-live="polite">
          <span className="countdown-number">{COUNT_STEPS[step] ?? '1'}</span>
          <span className="countdown-caption">приготовьтесь</span>
        </div>
      ) : (
        <div className="screen-actions">
          <button type="button" className="btn btn-primary" onClick={() => setCounting(true)}>
            Начать рисовать
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setStage('intake')}>
            Назад
          </button>
        </div>
      )}
    </section>
  );
}
