import logoUrl from '../assets/logo.svg';
import { useSession } from '../shell/session';

export function Splash() {
  const { setStage, setAboutOpen } = useSession();

  return (
    <section className="screen screen-splash">
      <div className="splash-stamp">
        <img src={logoUrl} alt="Штамп ФОРМА 60" />
      </div>
      <p className="splash-kicker">ЭКСПРЕСС-СРЕЗ ЛИЧНОСТИ НА ДЕНЬ</p>
      <h1 className="splash-title">ФОРМА 60</h1>
      <p className="splash-slogan">Минута на клетке. Форма на день.</p>
      <p className="splash-meta">СЕАНС 60с · ЛОКАЛЬНЫЙ СРЕЗ</p>
      <div className="splash-actions">
        <button type="button" className="btn btn-primary" onClick={() => setStage('intake')}>
          Открыть бланк
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setAboutOpen(true)}>
          Что это
        </button>
      </div>
      <p className="splash-note">
        Имя и рисунок остаются в браузере. Сеть нужна только для погоды и календаря дня.
      </p>
    </section>
  );
}
