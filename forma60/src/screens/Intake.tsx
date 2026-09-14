import { useCallback, useState } from 'react';
import { DateField } from '../components/DateField';
import { useSession, type BirthDate } from '../shell/session';

export function Intake() {
  const { name, setName, birth, setBirth, setStage, refreshDay } = useSession();
  const [dateValid, setDateValid] = useState(false);

  const handleDate = useCallback(
    (value: BirthDate | null) => {
      setBirth(value);
    },
    [setBirth],
  );

  const handleValidity = useCallback((valid: boolean) => {
    setDateValid(valid);
  }, []);

  const canContinue = dateValid && birth !== null;

  const handleContinue = () => {
    refreshDay();
    setStage('briefing');
  };

  return (
    <section className="screen screen-intake">
      <header className="screen-head">
        <p className="screen-step">ШАГ 1 ИЗ 3 · ЗНАКОМСТВО</p>
        <h2 className="screen-title">Как к вам обращаться</h2>
        <p className="screen-sub">Имя и дата рождения. Больше ничего не нужно.</p>
      </header>

      <div className="intake-form">
        <label className="field">
          <span className="field-label">Имя или инициалы</span>
          <input
            className="field-input"
            type="text"
            maxLength={32}
            autoFocus
            autoComplete="off"
            placeholder="Ваше имя"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <div className="field">
          <span className="field-label">Дата рождения</span>
          <DateField value={birth} onChange={handleDate} onValidityChange={handleValidity} />
          <span className="field-hint">Возраст от 10 до 90 лет. Нужна для разбора даты.</span>
        </div>
      </div>

      <div className="screen-actions">
        <button type="button" className="btn btn-primary" disabled={!canContinue} onClick={handleContinue}>
          Нарисовать рисунок
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setStage('splash')}>
          Назад
        </button>
      </div>

      <p className="screen-note">Имя, дата и рисунок остаются в вашем браузере. Мы не отправляем их на сервер.</p>
    </section>
  );
}
