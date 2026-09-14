import logoUrl from '../assets/logo.svg';
import { useSession } from './session';

export function TitleBar() {
  const { statusText, resetSession, setAboutOpen, stage } = useSession();

  const handleReset = () => {
    if (stage === 'splash') {
      resetSession();
      return;
    }
    const confirmed = window.confirm('Начать сеанс заново? Имя, дата и рисунок будут сброшены.');
    if (confirmed) resetSession();
  };

  return (
    <header className="titlebar">
      <div className="titlebar-left">
        <img src={logoUrl} alt="" className="titlebar-logo" />
        <span className="titlebar-name">ФОРМА 60</span>
        <span className="titlebar-dot-sep" aria-hidden="true">
          ·
        </span>
        <span className="titlebar-sub">СЕАНС</span>
        <button
          type="button"
          className="titlebar-about"
          onClick={() => setAboutOpen(true)}
        >
          О продукте
        </button>
      </div>
      <div className="titlebar-right">
        <span className="titlebar-status">{statusText}</span>
        <div className="titlebar-dots" role="group" aria-label="Управление окном">
          <span className="titlebar-dot" aria-hidden="true" />
          <span className="titlebar-dot" aria-hidden="true" />
          <button
            type="button"
            className="titlebar-dot titlebar-dot-red"
            onClick={handleReset}
            aria-label="Сбросить сеанс"
            title="Сбросить сеанс"
          />
        </div>
      </div>
    </header>
  );
}
