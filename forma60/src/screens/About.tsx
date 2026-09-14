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
    <div className="about-overlay" role="dialog" aria-modal="true" aria-label="О проекте">
      <div className="about-panel">
        <header className="about-head">
          <img src={logoUrl} alt="" />
          <div>
            <h2>О проекте</h2>
            <p className="about-meta">ФОРМА 60 · анализ личности по рисунку</p>
          </div>
          <button type="button" className="about-close" onClick={() => setAboutOpen(false)} aria-label="Закрыть">
            ×
          </button>
        </header>

        <div className="about-body">
          <p>
            ФОРМА 60 — это способ посмотреть на себя со стороны за одну минуту. Вы ведёте линию по клетке,
            а программа читает по ней особенности вашего характера и то, как вы себя чувствуете сегодня.
            Рассказывать о себе ничего не нужно: говорит рисунок.
          </p>
          <p>
            Метод опирается на принцип проективного анализа, известный в психологии больше века: когда рука
            ведёт линию, она неосознанно отражает темп, собранность, решительность и то, как человек держит
            напряжение. Мозг занят рисунком, и защита ослабевает — наружу выходит то, что обычно не проговаривают.
          </p>
          <p>
            Измерения настоящие: длина линии, число штрихов, скорость и её перепады, паузы, ровность,
            совпадение с клеткой, занятое место. Из этих величин выводятся пять показателей — собранность,
            открытость контакту, потребность в ясности, темп решений, запас на вечер.
          </p>
          <p>
            Дальше начинается разбор: как вы принимаете решения, как говорите с людьми, как выглядите под
            давлением, чего вам сегодня не хватает и как с вами лучше работать. Отдельная часть отвечает на
            вопрос «почему именно сегодня» — день недели, календарь, погода и луна встречаются с вашим рисунком.
          </p>
          <p>
            Формулировки подбираются по постоянным правилам: один и тот же рисунок в один и тот же день даёт
            один и тот же результат. Ничего случайного в тексте нет.
          </p>
          <p>
            Имя и рисунок остаются в вашем браузере. В сеть уходит только город и дата — для погоды,
            календаря и луны.
          </p>
          <p className="about-emphasis">
            Разбор не является медицинским заключением, диагнозом и не заменяет консультацию специалиста.
          </p>
        </div>

        <footer className="about-foot">
          <button type="button" className="btn btn-primary" onClick={() => setAboutOpen(false)}>
            Понятно
          </button>
          <span>Esc закрывает это окно</span>
        </footer>
      </div>
    </div>
  );
}
