export type HolidayRule = {
  country: 'RU' | 'PL';
  month: number;
  day: number;
  name: string;
  localName: string;
};

export type HolidayDate = {
  country: 'RU' | 'PL';
  iso: string;
  name: string;
  localName: string;
};

const FIXED: HolidayRule[] = [
  { country: 'RU', month: 1, day: 1, name: 'Новый год', localName: 'Новый год' },
  { country: 'RU', month: 1, day: 2, name: 'Новогодние каникулы', localName: 'Новогодние каникулы' },
  { country: 'RU', month: 1, day: 3, name: 'Новогодние каникулы', localName: 'Новогодние каникулы' },
  { country: 'RU', month: 1, day: 4, name: 'Новогодние каникулы', localName: 'Новогодние каникулы' },
  { country: 'RU', month: 1, day: 5, name: 'Новогодние каникулы', localName: 'Новогодние каникулы' },
  { country: 'RU', month: 1, day: 6, name: 'Новогодние каникулы', localName: 'Новогодние каникулы' },
  { country: 'RU', month: 1, day: 7, name: 'Рождество Христово', localName: 'Рождество Христово' },
  { country: 'RU', month: 1, day: 8, name: 'Новогодние каникулы', localName: 'Новогодние каникулы' },
  { country: 'RU', month: 2, day: 23, name: 'День защитника Отечества', localName: 'День защитника Отечества' },
  { country: 'RU', month: 3, day: 8, name: 'Международный женский день', localName: '8 Марта' },
  { country: 'RU', month: 5, day: 1, name: 'Праздник Весны и Труда', localName: '1 Мая' },
  { country: 'RU', month: 5, day: 9, name: 'День Победы', localName: 'День Победы' },
  { country: 'RU', month: 6, day: 12, name: 'День России', localName: 'День России' },
  { country: 'RU', month: 11, day: 4, name: 'День народного единства', localName: 'День народного единства' },
  { country: 'PL', month: 1, day: 1, name: 'Новый год', localName: 'Nowy Rok' },
  { country: 'PL', month: 1, day: 6, name: 'Богоявление', localName: 'Trzech Króli' },
  { country: 'PL', month: 5, day: 1, name: 'Праздник труда', localName: 'Święto Pracy' },
  { country: 'PL', month: 5, day: 3, name: 'День Конституции', localName: 'Święto Konstytucji 3 Maja' },
  { country: 'PL', month: 8, day: 15, name: 'Успение Богородицы', localName: 'Wniebowzięcie NMP' },
  { country: 'PL', month: 11, day: 1, name: 'День всех святых', localName: 'Wszystkich Świętych' },
  { country: 'PL', month: 11, day: 11, name: 'День независимости', localName: 'Święto Niepodległości' },
  { country: 'PL', month: 12, day: 25, name: 'Рождество', localName: 'Boże Narodzenie' },
  { country: 'PL', month: 12, day: 26, name: 'Второй день Рождества', localName: 'Drugi dzień Bożego Narodzenia' },
];

const MOVABLE: HolidayDate[] = [
  { country: 'PL', iso: '2025-04-20', name: 'Пасха', localName: 'Wielkanoc' },
  { country: 'PL', iso: '2025-04-21', name: 'Пасхальный понедельник', localName: 'Poniedziałek Wielkanocny' },
  { country: 'PL', iso: '2025-06-19', name: 'Божье тело', localName: 'Boże Ciało' },
  { country: 'PL', iso: '2026-04-05', name: 'Пасха', localName: 'Wielkanoc' },
  { country: 'PL', iso: '2026-04-06', name: 'Пасхальный понедельник', localName: 'Poniedziałek Wielkanocny' },
  { country: 'PL', iso: '2026-06-04', name: 'Божье тело', localName: 'Boże Ciało' },
  { country: 'PL', iso: '2027-03-28', name: 'Пасха', localName: 'Wielkanoc' },
  { country: 'PL', iso: '2027-03-29', name: 'Пасхальный понедельник', localName: 'Poniedziałek Wielkanocny' },
  { country: 'PL', iso: '2027-05-27', name: 'Божье тело', localName: 'Boże Ciało' },
];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function fallbackHoliday(country: string, isoDate: string): HolidayDate | null {
  const [yearText, monthText, dayText] = isoDate.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const code = country === 'PL' ? 'PL' : 'RU';

  const movable = MOVABLE.find((entry) => entry.country === code && entry.iso === isoDate);
  if (movable && year >= 2025 && year <= 2027) return movable;

  const rule = FIXED.find((entry) => entry.country === code && entry.month === month && entry.day === day);
  if (!rule || year < 2025 || year > 2027) return null;
  return {
    country: rule.country,
    iso: `${year}-${pad(month)}-${pad(day)}`,
    name: rule.name,
    localName: rule.localName,
  };
}
