import { useEffect, useMemo, useRef, useState } from 'react';
import type { BirthDate } from '../shell/session';

type Props = {
  value: BirthDate | null;
  onChange: (value: BirthDate | null) => void;
  onValidityChange?: (valid: boolean) => void;
};

const MONTHS_RU = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

const WEEKDAYS_SHORT = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 90;
const MAX_YEAR = CURRENT_YEAR - 10;

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function DateField({ value, onChange, onValidityChange }: Props) {
  const [day, setDay] = useState(value ? pad(value.day) : '');
  const [month, setMonth] = useState(value ? pad(value.month) : '');
  const [year, setYear] = useState(value ? String(value.year) : '');
  const [touchedYear, setTouchedYear] = useState(Boolean(value));
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const base = value ? new Date(value.year, value.month - 1, 1) : new Date(CURRENT_YEAR - 30, 0, 1);
    return { year: base.getFullYear(), month: base.getMonth() + 1 };
  });
  const dayRef = useRef<HTMLInputElement | null>(null);
  const monthRef = useRef<HTMLInputElement | null>(null);
  const yearRef = useRef<HTMLInputElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const parsed = useMemo<{
    valid: boolean;
    complete: boolean;
    birth: BirthDate | null;
    error: string | null;
  }>(() => {
    if (day === '' && month === '' && year === '') {
      return { valid: true, complete: false, birth: null, error: null };
    }
    const d = Number(day);
    const m = Number(month);
    const y = Number(year);
    if (day.length < 2 || month.length < 2 || year.length < 4) {
      return { valid: false, complete: false, birth: null, error: null };
    }
    if (m < 1 || m > 12) {
      return { valid: false, complete: true, birth: null, error: 'Месяц должен быть от 01 до 12.' };
    }
    if (d < 1 || d > daysInMonth(m, y)) {
      return { valid: false, complete: true, birth: null, error: 'Такого дня в этом месяце нет.' };
    }
    const age = CURRENT_YEAR - y;
    if (age < 10 || age > 90) {
      return { valid: false, complete: true, birth: null, error: 'Возраст должен быть от 10 до 90 лет.' };
    }
    return { valid: true, complete: true, birth: { day: d, month: m, year: y }, error: null };
  }, [day, month, year]);

  useEffect(() => {
    onValidityChange?.(parsed.valid);
    onChange(parsed.birth);
  }, [parsed, onChange, onValidityChange]);

  useEffect(() => {
    if (!popoverOpen) return;
    const handleOutside = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [popoverOpen]);

  const handleNumeric = (
    raw: string,
    max: number,
    setter: (value: string) => void,
    next?: () => void,
  ) => {
    const digits = raw.replace(/\D/g, '').slice(0, max === 2 ? 2 : 4);
    setter(digits);
    if (max === 2 && digits.length === 2) next?.();
    if (max === 4 && digits.length === 4) setTouchedYear(true);
  };

  const step = (current: string, delta: number, max: number, min: number) => {
    const parsedCurrent = Number(current) || min;
    let next = parsedCurrent + delta;
    if (next > max) next = min;
    if (next < min) next = max;
    return max === 2 ? pad(next) : String(next);
  };

  const applyDay = (d: number) => {
    setDay(pad(d));
    if (month.length === 2 && year.length === 4) {
      setPopoverOpen(false);
    } else if (month.length !== 2) {
      monthRef.current?.focus();
    } else {
      yearRef.current?.focus();
    }
  };

  const grid = useMemo(() => {
    const first = new Date(cursor.year, cursor.month - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    const total = daysInMonth(cursor.month, cursor.year);
    const cells: (number | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= total; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const isValidSelection = () => {
    const age = CURRENT_YEAR - cursor.year;
    return age >= 10 && age <= 90;
  };

  return (
    <div className="date-field" ref={wrapRef}>
      <div className="date-segments" role="group" aria-label="Дата рождения">
        <input
          ref={dayRef}
          className="date-segment"
          inputMode="numeric"
          placeholder="ДД"
          aria-label="День"
          value={day}
          onChange={(event) => handleNumeric(event.target.value, 2, setDay, () => monthRef.current?.focus())}
          onKeyDown={(event) => {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setDay(step(day, 1, 31, 1));
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setDay(step(day, -1, 31, 1));
            }
            if (event.key === 'Backspace' && day === '') dayRef.current?.blur();
          }}
        />
        <span className="date-sep">/</span>
        <input
          ref={monthRef}
          className="date-segment"
          inputMode="numeric"
          placeholder="ММ"
          aria-label="Месяц"
          value={month}
          onChange={(event) => handleNumeric(event.target.value, 2, setMonth, () => yearRef.current?.focus())}
          onKeyDown={(event) => {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setMonth(step(month, 1, 12, 1));
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setMonth(step(month, -1, 12, 1));
            }
          }}
        />
        <span className="date-sep">/</span>
        <input
          ref={yearRef}
          className="date-segment date-segment-year"
          inputMode="numeric"
          placeholder="ГГГГ"
          aria-label="Год"
          value={year}
          onChange={(event) => {
            handleNumeric(event.target.value, 4, setYear);
            if (event.target.value.length === 4) setTouchedYear(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setYear(step(year, 1, MAX_YEAR, MIN_YEAR));
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setYear(step(year, -1, MAX_YEAR, MIN_YEAR));
            }
          }}
        />
        <button
          type="button"
          className="date-calendar-toggle"
          aria-label="Открыть календарь"
          aria-expanded={popoverOpen}
          onClick={() => setPopoverOpen((open) => !open)}
        >
          <span aria-hidden="true">▦</span>
        </button>
      </div>

      {touchedYear && parsed.error && <p className="field-error">{parsed.error}</p>}

      {popoverOpen && (
        <div className="date-popover" role="dialog" aria-label="Календарь">
          <div className="date-popover-head">
            <button
              type="button"
              onClick={() =>
                setCursor((c) => (c.month === 1 ? { year: c.year - 1, month: 12 } : { ...c, month: c.month - 1 }))
              }
              aria-label="Предыдущий месяц"
            >
              ‹
            </button>
            <span>
              {MONTHS_RU[cursor.month - 1]} {cursor.year}
            </span>
            <button
              type="button"
              onClick={() =>
                setCursor((c) => (c.month === 12 ? { year: c.year + 1, month: 1 } : { ...c, month: c.month + 1 }))
              }
              aria-label="Следующий месяц"
            >
              ›
            </button>
          </div>
          <div className="date-popover-grid">
            {WEEKDAYS_SHORT.map((label) => (
              <span key={label} className="date-popover-weekday">
                {label}
              </span>
            ))}
            {grid.map((cell, index) =>
              cell === null ? (
                <span key={`empty-${index}`} />
              ) : (
                <button
                  key={`day-${cell}`}
                  type="button"
                  className="date-popover-day"
                  disabled={!isValidSelection()}
                  onClick={() => applyDay(cell)}
                >
                  {cell}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
