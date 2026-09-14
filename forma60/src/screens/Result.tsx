import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { renderStrokesToDataUrl } from '../canvas/inkEngine';
import { localDayContext } from '../engine/dayContext';
import { buildFormPdf, pdfFileName } from '../pdf/buildFormPdf';
import { useSession } from '../shell/session';

const SHEETS = ['Разбор', 'О вас', 'Почему сегодня'];

export function Result() {
  const { profile, strokes, canvasSize, dayContext, birth, participantName, age, resetSession } =
    useSession();
  const [sheet, setSheet] = useState(0);
  const [busy, setBusy] = useState<'pdf' | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const drawing = useMemo(
    () => renderStrokesToDataUrl(strokes, canvasSize || 360, 18, undefined, 2),
    [strokes, canvasSize],
  );

  if (!profile) return null;
  const context = dayContext ?? localDayContext(birth);
  const dateLine = format(context.date, "d MMMM yyyy, HH:mm", { locale: ru });
  const filename = pdfFileName(participantName, context.isoDate);

  const makePdf = async (): Promise<Blob> =>
    buildFormPdf({
      profile,
      strokes,
      canvasSize: canvasSize || 360,
      day: context,
      participantName,
      age,
    });

  const handleDownload = async () => {
    try {
      setBusy('pdf');
      setStatus(null);
      const blob = await makePdf();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      setStatus('PDF сохранён в загрузки.');
    } catch {
      setStatus('Не удалось собрать PDF. Попробуйте ещё раз.');
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    try {
      setBusy('pdf');
      setStatus(null);
      const blob = await makePdf();
      const file = new File([blob], filename, { type: 'application/pdf' });
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
      };
      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        await nav.share({
          files: [file],
          title: 'ФОРМА 60',
          text: 'Мой разбор на сегодня.',
        });
        setStatus('PDF готов — можно отправить.');
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 4000);
        setStatus('Поделиться не получилось — PDF сохранён в загрузки.');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setStatus('Поделиться не получилось. Скачайте PDF отдельно.');
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="screen screen-result">
      <div className="result-head">
        <div className="result-sheets" role="tablist" aria-label="Разделы разбора">
          {SHEETS.map((label, index) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={sheet === index}
              className={`result-dot ${sheet === index ? 'is-active' : ''}`}
              onClick={() => setSheet(index)}
            >
              <span className="result-dot-mark" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <span className="result-number">{profile.number}</span>
      </div>

      <div className="result-page" key={sheet}>
        {sheet === 0 && (
          <article className="sheet sheet-summary">
            <header className="form-head">
              <div className="form-head-main">
                <span className="form-head-name">
                  {participantName}
                  {age !== null ? `, ${age}` : ''}
                </span>
                <span className="form-head-date">{dateLine}</span>
              </div>
              <span className="form-head-weekday">{context.weekdayName}</span>
            </header>

            <div className="sheet-summary-body">
              <figure className="drawing-frame">
                {drawing ? (
                  <img src={drawing} alt="Ваш рисунок" />
                ) : (
                  <div className="drawing-empty">Лист пустой</div>
                )}
                <figcaption>Ваш рисунок, 60 секунд</figcaption>
              </figure>

              <div className="summary-text">
                <h2 className="summary-headline">{profile.headline}</h2>
                <p className="summary-lead">{profile.lead}</p>
              </div>
            </div>

            <div className="insights">
              <h3 className="block-title">Что видно по рисунку</h3>
              <ol className="insight-list">
                {profile.insights.map((insight) => (
                  <li key={insight.id} className="insight">
                    <span className="insight-label">{insight.label}</span>
                    <p className="insight-claim">{insight.claim}</p>
                    <p className="insight-because">{insight.because}</p>
                    <p className="insight-today">{insight.today}</p>
                    <p className="insight-sting">
                      <span>Если не заметить:</span> {insight.sting}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        )}

        {sheet === 1 && (
          <article className="sheet sheet-profile">
            <h3 className="block-title">Как вы работаете и общаетесь</h3>
            <p className="role-line">
              Ваша роль сегодня: <strong>{profile.roleLabel}</strong>. {profile.roleText}
            </p>

            <div className="profile-blocks">
              <ProfileBlock title="Как решаете" text={profile.decision} />
              <ProfileBlock title="Как говорите" text={profile.speech} />
              <ProfileBlock
                title="Под давлением"
                text={`${capitalize(profile.shadowLabel)}. ${profile.shadowText} ${profile.pressure}`}
              />
              <ProfileBlock title="Что вам сегодня нужно" text={`${capitalize(profile.motiveLabel)}. ${profile.motiveText}`} />
            </div>

            <div className="with-you">
              <h3 className="block-subtitle">Как с вами сегодня</h3>
              <ul>
                {profile.withYou.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div className="scales">
              <h3 className="block-subtitle">Пять показателей</h3>
              {profile.scales.map((scale) => (
                <div key={scale.id} className="scale">
                  <div className="scale-head">
                    <span className="scale-label">{scale.label}</span>
                    <span className="scale-band">{scale.band}</span>
                  </div>
                  <div className="scale-track" role="img" aria-label={`${scale.label}: ${scale.value} из 100`}>
                    <span className="scale-marker" style={{ left: `${scale.value}%` }} />
                  </div>
                  <div className="scale-ends">
                    <span>{scale.left}</span>
                    <span>{scale.right}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )}

        {sheet === 2 && (
          <article className="sheet sheet-day">
            <h3 className="block-title">Почему именно сегодня</h3>

            <DayBlock title="День недели" text={profile.dayWhy.weekday} />
            <DayBlock title="Если бы рисовали в другой день" text={profile.dayWhy.counterfactual} />
            {profile.dayWhy.calendar && <DayBlock title="Календарь" text={profile.dayWhy.calendar} />}
            {profile.dayWhy.weather && <DayBlock title="Погода" text={profile.dayWhy.weather} />}
            <DayBlock title="Луна" text={profile.dayWhy.lunar} />
            {profile.dayWhy.birth && <DayBlock title="Дата рождения" text={profile.dayWhy.birth} />}

            <div className="day-window">
              <h3 className="block-subtitle">Как идёт день</h3>
              <div className="day-window-grid">
                <div>
                  <span className="day-window-label">Утро</span>
                  <p>{profile.dayWhy.window.morning}</p>
                </div>
                <div>
                  <span className="day-window-label">День</span>
                  <p>{profile.dayWhy.window.midday}</p>
                </div>
                <div>
                  <span className="day-window-label">Вечер</span>
                  <p>{profile.dayWhy.window.evening}</p>
                </div>
              </div>
            </div>

            <p className="day-closing">{profile.dayWhy.closing}</p>
            <p className="day-drop">{profile.dayWhy.drop}</p>

            <div className="method">
              <h3 className="block-subtitle">Как это считается</h3>
              <ul>
                <li>Рисунок превращается в набор точек: где была рука, в какой момент и с каким нажимом.</li>
                <li>
                  По нему считаются длина линии, число штрихов, скорость и её перепады, паузы, повороты,
                  сколько места занято и совпадение с клеткой.
                </li>
                <li>
                  Отдельно считаются ровность, место старта и финиша, число использованных чернил.
                </li>
                <li>
                  Пять показателей — собранность, открытость контакту, потребность в ясности, темп решений,
                  запас на вечер — считаются из этих величин по постоянным правилам.
                </li>
                <li>
                  Выводы соединяют три вещи: как вы обычно ведёте линию, как провели эту минуту и какой
                  сегодня день.
                </li>
                <li>День учитывается так: день недели, календарь, погода, луна и дата рождения.</li>
                <li>
                  Правила постоянные: один и тот же рисунок в один и тот же день даёт один и тот же текст.
                </li>
                <li>Рисунок и имя не отправляются на сервер.</li>
              </ul>
            </div>

            <p className="disclaimer">Сформирован автоматически, не заменяет консультацию специалиста.</p>
            <span className="half-stamp">Ф60 · разбор по рисунку</span>
          </article>
        )}
      </div>

      <div className="result-actions">
        <button type="button" className="btn btn-primary" disabled={busy !== null} onClick={handleDownload}>
          {busy === 'pdf' ? 'Собираю PDF' : 'Скачать PDF'}
        </button>
        <button type="button" className="btn btn-secondary" disabled={busy !== null} onClick={handleShare}>
          Поделиться
        </button>
        <button type="button" className="btn btn-ghost" onClick={resetSession}>
          Пройти заново
        </button>
        <span className="result-status">{status ?? 'PDF готов — можно отправить.'}</span>
      </div>
    </section>
  );
}

function ProfileBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="profile-block">
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}

function DayBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="day-block">
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
