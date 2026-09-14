import { resolveLocation } from '../api/geo';
import { resolveWeather } from '../api/weather';
import { resolveHoliday } from '../api/holidays';
import { readLunar } from '../api/lunar';
import { fallbackHoliday } from '../data/holidaysFallback';
import { weekdayModule } from '../data/weekdayPsychology';
import { describeWeather } from '../data/weatherCodes.ru';
import { combineSeed, pickDeterministic } from './seed';
import type {
  DayContext,
  DayWhy,
  HolidaySnapshot,
  LocationSnapshot,
  LunarSnapshot,
  RawMetrics,
  Scores,
  WeatherSnapshot,
} from './types';

export type DayContextInput = {
  date: Date;
  birth: { day: number; month: number; year: number } | null;
  location: LocationSnapshot | null;
  weather: WeatherSnapshot | null;
  lunar: LunarSnapshot;
  holiday: HolidaySnapshot | null;
};

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function seasonOf(month: number): DayContext['season'] {
  if (month === 12 || month <= 2) return 'winter';
  if (month <= 5) return 'spring';
  if (month <= 8) return 'summer';
  return 'autumn';
}

function birthdayDistance(
  date: Date,
  birth: { day: number; month: number } | null,
): number | null {
  if (!birth) return null;
  const year = date.getFullYear();
  const candidates = [year - 1, year, year + 1].map((y) => {
    const tryDate = new Date(y, birth.month - 1, birth.day);
    return Math.round((tryDate.getTime() - date.getTime()) / 86400000);
  });
  return candidates.reduce((best, value) =>
    Math.abs(value) < Math.abs(best) ? value : best,
  );
}

export function buildDayContext(input: DayContextInput): DayContext {
  const { date } = input;
  const isoDate = toIsoDate(date);
  const weekday = date.getDay();
  const module = weekdayModule(weekday);
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  const daysInMonth = new Date(date.getFullYear(), month, 0).getDate();
  const country = input.location?.countryCode ?? 'PL';

  const yesterdayHoliday = fallbackHoliday(country, shiftIso(isoDate, -1));
  const tomorrowHoliday = fallbackHoliday(country, shiftIso(isoDate, 1));

  const distance = birthdayDistance(date, input.birth);

  return {
    date,
    isoDate,
    weekday,
    weekdayName: module.name,
    weekdayGenitive: module.genitive,
    weekdayInPhrase: module.inPhrase,
    isWeekend: weekday === 0 || weekday === 6,
    location: input.location,
    weather: input.weather,
    lunar: input.lunar,
    holiday: input.holiday,
    isDayBeforeHoliday: Boolean(tomorrowHoliday),
    isAfterHoliday: Boolean(yesterdayHoliday),
    isMonthEnd: dayOfMonth >= daysInMonth - 1,
    isBirthdayWindow: distance !== null && Math.abs(distance) <= 3,
    birthdayDistance: distance,
    season: seasonOf(month),
  };
}

export async function loadDayContext(
  date: Date,
  birth: { day: number; month: number; year: number } | null,
): Promise<DayContext> {
  const isoDate = toIsoDate(date);
  const geo = await resolveLocation().catch(() => null);
  const latitude = geo?.latitude ?? 51.1079;
  const longitude = geo?.longitude ?? 17.0385;

  const [weather, holiday] = await Promise.allSettled([
    resolveWeather(latitude, longitude, isoDate),
    resolveHoliday(geo?.location.countryCode ?? 'PL', isoDate),
  ]);

  const lunar = readLunar(date, latitude, longitude);

  return buildDayContext({
    date,
    birth,
    location: geo?.location ?? null,
    weather: weather.status === 'fulfilled' ? weather.value : null,
    lunar,
    holiday: holiday.status === 'fulfilled' ? holiday.value : null,
  });
}

export function localDayContext(
  birth: { day: number; month: number; year: number } | null,
): DayContext {
  const now = new Date();
  const isoDate = toIsoDate(now);
  const local = fallbackHoliday('PL', isoDate);
  return buildDayContext({
    date: now,
    birth,
    location: null,
    weather: null,
    lunar: readLunar(now, 51.1079, 17.0385),
    holiday: local
      ? { name: local.name, localName: local.localName, isPublic: true }
      : null,
  });
}

/* ---------- День: что это значит на практике ---------- */

const ZODIAC: {
  name: string;
  element: 'Огонь' | 'Земля' | 'Воздух' | 'Вода';
  habit: string;
}[] = [
  { name: 'Козерог', element: 'Земля', habit: 'вы доводите начатое до конца, даже когда уже не хочется' },
  { name: 'Водолей', element: 'Воздух', habit: 'вы держите дистанцию, чтобы видеть картину целиком' },
  { name: 'Рыбы', element: 'Вода', habit: 'вы чувствуете настроение другого раньше, чем он его назовёт' },
  { name: 'Овен', element: 'Огонь', habit: 'вам нужен старт, иначе день не начинается' },
  { name: 'Телец', element: 'Земля', habit: 'вы не любите менять то, что уже работает' },
  { name: 'Близнецы', element: 'Воздух', habit: 'вы понимаете мысль, когда произносите её вслух' },
  { name: 'Рак', element: 'Вода', habit: 'вам важно держать безопасное расстояние, и вы не любите, когда его сдвигают' },
  { name: 'Лев', element: 'Огонь', habit: 'вам важно, как вас видят, и с этим приходится считаться' },
  { name: 'Дева', element: 'Земля', habit: 'вы замечаете мелочь раньше всех, а потом её же и носите' },
  { name: 'Весы', element: 'Воздух', habit: 'вы ищете решение, которое никого не поставит в угол' },
  { name: 'Скорпион', element: 'Вода', habit: 'вы не начинаете, пока не поняли, чем дело кончится' },
  { name: 'Стрелец', element: 'Огонь', habit: 'вам нужен простор, иначе день становится тесным' },
];

function zodiacOf(birth: { day: number; month: number }): (typeof ZODIAC)[number] | null {
  const { month, day } = birth;
  const cutoffs: [number, number, number][] = [
    [1, 20, 1],
    [2, 19, 2],
    [3, 21, 3],
    [4, 20, 4],
    [5, 21, 5],
    [6, 21, 6],
    [7, 23, 7],
    [8, 23, 8],
    [9, 23, 9],
    [10, 23, 10],
    [11, 22, 11],
    [12, 22, 12],
  ];
  let signIndex = 11;
  for (let i = 0; i < cutoffs.length; i++) {
    const [m, d, index] = cutoffs[i];
    if (month > m || (month === m && day >= d)) signIndex = index % 12;
  }
  return ZODIAC[signIndex] ?? null;
}

const ELEMENT_LINE: Record<string, string> = {
  Огонь: 'вы быстро загораетесь и быстро тратите силы',
  Земля: 'вам нужна опора, неясность выбивает из колеи',
  Воздух: 'вы много объясняете и часто говорите больше, чем решаете',
  Вода: 'вы всё чувствуете, и чужая усталость задевает вас сильнее, чем нужно',
};

function holidaySentence(ctx: DayContext): string | null {
  if (!ctx.holiday) return null;
  return `Сегодня ${ctx.holiday.name.toLowerCase()}. Все ждут лёгкого тона, а вы продолжаете держать планку. Это будет выглядеть как отказ разделить общее настроение.`;
}

function calendarSentence(ctx: DayContext, scores: Scores): string | null {
  const lines: string[] = [];
  if (ctx.isDayBeforeHoliday) {
    lines.push(
      'Завтра праздник. Такие дни разгоняются сами: хочется закрыть больше, чем нужно.',
    );
  }
  if (ctx.isAfterHoliday) {
    lines.push(
      'Вчера был праздник. Первую половину дня вы будете входить в работу медленнее обычного, и это не про отношение к людям.',
    );
  }
  if (ctx.isMonthEnd && scores.order > 55) {
    lines.push(
      'Конец месяца. Вы проверяете хвосты и хуже терпите чужие незакрытые дела.',
    );
  }
  if (ctx.isBirthdayWindow) {
    lines.push(
      'Скоро ваш день рождения. За несколько дней до него решения даются честнее, а невнимание других задевает сильнее.',
    );
  }
  return lines.length > 0 ? lines.join(' ') : null;
}

function weatherSentence(ctx: DayContext, metrics: RawMetrics, scores: Scores): string | null {
  if (!ctx.weather) return null;
  const descriptor = describeWeather(ctx.weather.code);
  const heavy = descriptor.heaviness > 0.55;
  const bright = descriptor.brightness > 0.7;
  const label = capitalize(descriptor.label);

  if (heavy && scores.order > 58) {
    return `${label}. В такую погоду хочется навести порядок: вы начнёте выравнивать мелочи и раздражаться на тех, кто этого не делает.`;
  }
  if (heavy && metrics.meanAbsTurn > 0.9) {
    return `${label}. Из-за погоды и рваного темпа мелкий спор покажется крупным. Разделяйте раздражение и настоящую причину.`;
  }
  if (heavy) {
    return `${label}. В такой день люди мягче принимают прямо сказанное, если говорить без нажима.`;
  }
  if (bright && metrics.speedStd > 260) {
    return 'Светло и сухо, а рука шла рывками. Сил больше, чем нужно, и вы возьмёте больше, чем успеете.';
  }
  if (bright) {
    return 'Светло и сухо. День открыт, но резкий вход в чужой разговор будет выглядеть грубо.';
  }
  return `${label}. Погода нейтральная, поэтому сегодня всё зависит от вас, а не от фона.`;
}

function lunarSentence(ctx: DayContext, metrics: RawMetrics, scores: Scores): string {
  const illum = Math.round(ctx.lunar.illumination * 100);
  if (illum > 70 && scores.order > 55) {
    return `Луна яркая (${illum}%). Вас заметно лучше видно обычного: спрятать раздражение не получится, лучше сказать о нём спокойно.`;
  }
  if (illum < 28 && metrics.empty) {
    return `Луна почти не видна (${illum}%). Хороший день, чтобы ничего никому не доказывать.`;
  }
  if (illum < 28) {
    return `Луна почти не видна (${illum}%). Можно спокойно проверить решение, без свидетелей и объяснений.`;
  }
  if (illum > 70) {
    return `Луна яркая (${illum}%). Заметны даже паузы: молчание сегодня примут за ответ.`;
  }
  return `Луна освещена на ${illum}%. День без подсказок: считается только то, что вы назвали сделанным.`;
}

function birthSentence(birth: { day: number; month: number } | null, scores: Scores): string | null {
  if (!birth) return null;
  const zodiac = zodiacOf(birth);
  if (!zodiac) return null;
  return `Дата рождения — ${zodiac.name}, стихия ${zodiac.element}. ${capitalize(
    ELEMENT_LINE[zodiac.element],
  )}. Обычно это значит: ${zodiac.habit}. Сегодня эта черта ${
    scores.regulation > 55 ? 'помогает' : 'мешает'
  }.`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const DROPS: string[] = [
  'Одно бытовое следствие: не разбирайте сложное в переписке после 21:00.',
  'Одно бытовое следствие: не отвечайте «да» сразу, возьмите паузу до конца разговора.',
  'Одно бытовое следствие: важные дела не ставьте на самое утро, вы раскачиваетесь позже.',
  'Одно бытовое следствие: важные договорённости повторяйте письменно.',
  'Одно бытовое следствие: не ставьте три встречи подряд, оставьте перерыв без людей.',
  'Одно бытовое следствие: не называйте срок сразу, даже если он кажется очевидным.',
];

export function composeDayWhy(
  ctx: DayContext,
  metrics: RawMetrics,
  scores: Scores,
  seed: number,
  birth: { day: number; month: number } | null,
): DayWhy {
  const module = weekdayModule(ctx.weekday);
  const weekPart = `${capitalize(module.reading)}. Как вы решаете: ${module.decisions}. Как общаетесь: ${module.contact}. ${capitalize(module.watching)}.`;
  const counterfactual = `Тот же рисунок в другой день объяснили бы иначе: ${module.counterfactual}.`;

  const calendar = holidaySentence(ctx) ?? calendarSentence(ctx, scores) ?? '';
  const weather = weatherSentence(ctx, metrics, scores);
  const lunar = lunarSentence(ctx, metrics, scores);
  const birthLine = birthSentence(birth, scores);

  const window = composeWindow(ctx, metrics, scores, seed);
  const drop = pickDeterministic(DROPS, combineSeed(seed, ctx.isoDate, 'drop'));
  const closing = composeClosing(metrics, scores);

  return {
    weekday: weekPart,
    counterfactual,
    calendar,
    weather,
    lunar,
    birth: birthLine,
    window,
    drop,
    closing,
  };
}

function composeWindow(
  ctx: DayContext,
  metrics: RawMetrics,
  scores: Scores,
  seed: number,
): DayWhy['window'] {
  const morningOptions: string[] = [];
  const middayOptions: string[] = [];
  const eveningOptions: string[] = [];

  if (metrics.earlyLateBalance > 0.6) {
    morningOptions.push(
      'Вы лучше работаете в начале дня. Сложное берите в первое окно, пока силы есть.',
    );
    eveningOptions.push(
      'К вечеру силы падают. Не назначайте на вечер разговор, где нужен напор.',
    );
  } else if (metrics.earlyLateBalance < 0.4) {
    morningOptions.push(
      'Утро у вас медленное. Не принимайте важных решений в первый час.',
    );
    eveningOptions.push(
      'Вечер сильнее утра. Точная формулировка приходит именно тогда.',
    );
  } else {
    morningOptions.push(
      'Силы распределены ровно. Утро не потребует отдельной раскачки.',
    );
    eveningOptions.push(
      'Вечер не даст рывка: что не решено днём, уйдёт на завтра.',
    );
  }

  if (scores.expression > 60) {
    middayOptions.push(
      'Днём вы разговорчивее и легко обещаете больше, чем готовы сделать.',
    );
  } else {
    middayOptions.push(
      'Днём вы сдержаннее и короче, чем утром. Это не холодность, а сосредоточенность.',
    );
  }

  if (scores.stamina < 42) {
    eveningOptions.push('Вечером лучше заканчивать дела, а не начинать новые.');
  }
  if (ctx.weather && ctx.weather.apparent < 4) {
    morningOptions.push('Холод забирает силы на старте. Выходя из дома, закладывайте время с запасом.');
  }

  return {
    morning: pickDeterministic(morningOptions, combineSeed(seed, ctx.isoDate, 'morning')),
    midday: pickDeterministic(middayOptions, combineSeed(seed, ctx.isoDate, 'midday')),
    evening: pickDeterministic(eveningOptions, combineSeed(seed, ctx.isoDate, 'evening')),
  };
}

function composeClosing(metrics: RawMetrics, scores: Scores): string {
  if (metrics.empty) {
    return `Итог дня: сегодня можно ничего не рисовать и никому ничего не доказывать. Это тоже решение.`;
  }
  if (scores.regulation > 62) {
    return `Итог дня: форма удержится, если вы заранее назовёте, что считаете сделанным.`;
  }
  if (metrics.meanAbsTurn > 0.95) {
    return `Итог дня: поворотов будет больше, чем нужно. Один из них стоит отменить заранее.`;
  }
  return `Итог дня: смотрите на свой темп, а не на чужие ожидания.`;
}
