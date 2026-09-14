import logoUrl from '../assets/logo.svg';
import { useSession } from '../shell/session';

export function Splash() {
  const { setStage, setAboutOpen } = useSession();

  return (
    <section className="screen screen-splash">
      <div className="splash-stamp">
        <img src={logoUrl} alt="Штамп ФОРМА 60" />
      </div>
      <p className="splash-kicker">АНАЛИЗ ЛИЧНОСТИ ПО РИСУНКУ</p>
      <h1 className="splash-title">ФОРМА 60</h1>
      <p className="splash-lead">
        Нарисуйте линию за одну минуту и получите разбор себя на сегодня.
      </p>
      <p className="splash-slogan">Минута на клетке. Форма на день.</p>
      <p className="splash-meta">1 МИНУТА · РИСУНОК · РАЗБОР</p>
      <div className="splash-actions">
        <button type="button" className="btn btn-primary" onClick={() => setStage('intake')}>
          Получить консультацию
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setAboutOpen(true)}>
          О проекте
        </button>
      </div>
      <p className="splash-note">
        По рисунку видно, как вы принимаете решения, как общаетесь и что вас выматывает. Имя и рисунок
        остаются в вашем браузере.
      </p>
    </section>
  );
}
