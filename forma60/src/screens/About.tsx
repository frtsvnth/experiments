import { useEffect } from 'react';
import logoUrl from '../assets/logo.svg';
import { useSession } from '../shell/session';

export function About() {
  const { aboutOpen, setAboutOpen } = useSession();

  useEffect(() => {
    if (!aboutOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAboutOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [aboutOpen, setAboutOpen]);

  if (!aboutOpen) return null;

  return (
    <div className="about-overlay" role="dialog" aria-modal="true" aria-label="О продукте">
      <div className="about-panel">
        <header className="about-head">
          <img src={logoUrl} alt="" />
          <div>
            <h2>О продукте</h2>
            <p className="about-meta">ФОРМА 60 · экспериментальный развлекательный протокол</p>
          </div>
          <button type="button" className="about-close" onClick={() => setAboutOpen(false)} aria-label="Закрыть">
            ×
          </button>
        </header>

        <div className="about-body">
          <p>
            ФОРМА 60 — это эксперимент. Смысл забавы в одном: за минуту посмотреть, как вы ведёте линию, и
            прочитать это как срез дня — состояния, стиля решений и того, что день делает с вашим обычным
            способом держаться.
          </p>
          <p>
            Графические метрики считаются по-настоящему: по вашему следу измеряются длина, темп, паузы,
            кривизна, покрытие плоскости, совпадение с клеткой и распределение по четвертям. Эти величины
            детерминированы — один и тот же след даёт один и тот же результат.
          </p>
          <p>
            Интерпретация художественная. Она собрана из заранее написанных формулировок и правил, которые
            связывают стиль линии, состояние минуты и контекст дня. Это не диагностика, не медицинское
            заключение и не замена консультации специалиста.
          </p>
          <p>
            Имя и рисунок остаются в вашем браузере. В сеть уходят только координаты города и дата — чтобы
            подтянуть погоду, календарь и освещённость луны. Если сети нет, срез всё равно соберётся: останутся
            локальные расчёты, а погода честно покажет «нет данных».
          </p>
          <p className="about-emphasis">
            Относитесь к бланку как к развлечению с точными измерениями. Если что-то попадёт — это удача текста,
            а не диагноз.
          </p>
        </div>

        <footer className="about-foot">
          <button type="button" className="btn btn-primary" onClick={() => setAboutOpen(false)}>
            Вернуться к бланку
          </button>
          <span>Esc закрывает это окно</span>
        </footer>
      </div>
    </div>
  );
}
