import { resolveLocation } from '../api/geo';
import { resolveWeather } from '../api/weather';
import { resolveHoliday } from '../api/holidays';
import { readLunar } from '../api/lunar';
import { fallbackHoliday } from '../data/holidaysFallback';
import { WEEKDAYS_RU, weekdayModule } from '../data/weekdayPsychology';
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

/* ---------- День как психология, а не как сводка ---------- */
const ZODIAC: {
  name: string;
  element: 'Огонь' | 'Земля' | 'Воздух' | 'Вода';
  contour: string;
}[] = [
  { name: 'Козерог', element: 'Земля', contour: 'вы выросли из привычки доводить, а не из уверенности' },
  { name: 'Водолей', element: 'Воздух', contour: 'вы держите дистанцию, чтобы видеть конструкцию целиком' },
  { name: 'Рыбы', element: 'Вода', contour: 'вы считываете настроение раньше, чем его произнесут' },
  { name: 'Овен', element: 'Огонь', contour: 'вам нужен старт, иначе день не начинается' },
  { name: 'Телец', element: 'Земля', contour: 'вы не любите менять форму того, что уже работает' },
  { name: 'Близнецы', element: 'Воздух', contour: 'вы проверяете мысль, произнося её вслух' },
  { name: 'Рак', element: 'Вода', contour: 'вы держите контур безопасности и не любите, когда его сдвигают' },
  { name: 'Лев', element: 'Огонь', contour: 'вы отвечаете за то, каким вас видят, и это не пустое' },
  { name: 'Дева', element: 'Земля', contour: 'вы замечаете мелочь раньше всех и потом носите её' },
  { name: 'Весы', element: 'Воздух', contour: 'вы ищете решение, которое никого не поставит в угол' },
  { name: 'Скорпион', element: 'Вода', contour: 'вы не начинаете, пока не поняли, где у ситуации дно' },
  { name: 'Стрелец', element: 'Огонь', contour: 'вам нужен горизонт, иначе день становится тесным' },
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
  Огонь: 'стихия держит вас в движении, и сегодня это скорее расход, чем топливо',
  Земля: 'стихия просит опору, и любая неясность сегодня читается как угроза опоре',
  Воздух: 'стихия держит вас в объяснениях, и сегодня слово опережает решение',
  Вода: 'стихия делает вас проницательным, и сегодня чужая усталость заходит слишком близко',
};

function holidaySentence(ctx: DayContext): string | null {
  if (!ctx.holiday) return null;
  const name = ctx.holiday.name.toLowerCase();
  return `Сегодня ${name}. Вокруг ждут облегчённого тона, а ваш след устроен иначе: вы продолжаете держать планку, и это будет выглядеть как отказ разделить настроение.`;
}

function calendarSentence(ctx: DayContext, scores: Scores): string | null {
  const lines: string[] = [];
  if (ctx.isDayBeforeHoliday) {
    lines.push(
      'Завтра праздник. День перед ним всегда разгоняется сам, а вместе с ним растёт соблазн закрыть больше, чем стоит.',
    );
  }
  if (ctx.isAfterHoliday) {
    lines.push(
      'Вчера был праздник, и тело ещё живёт в другом ритме. Первая половина дня будет холоднее по контакту, чем вы ожидаете, — это не отношение к людям.',
    );
  }
  if (ctx.isMonthEnd && scores.order > 55) {
    lines.push(
      'Конец месяца. У вас включается ревизия, и её точность сейчас выше, чем терпимость к чужим незакрытым хвостам.',
    );
  }
  if (ctx.isBirthdayWindow) {
    lines.push(
      'Вы рядом со своей датой. За несколько дней до неё решения становятся честнее, но и обидчивость на невнимание — выше обычного.',
    );
  }
  return lines.length > 0 ? lines.join(' ') : null;
}

function weatherSentence(ctx: DayContext, metrics: RawMetrics, scores: Scores): string | null {
  if (!ctx.weather) return null;
  const descriptor = describeWeather(ctx.weather.code);
  const heavy = descriptor.heaviness > 0.55;
  const bright = descriptor.brightness > 0.7;

  if (heavy && scores.order > 58) {
    return `${descriptor.label[0].toUpperCase()}${descriptor.label.slice(1)}: небо давит, и вам хочется компенсировать это порядком. Сегодня вы будете выравнивать то, что тонет, — и раздражаться на тех, кто этого не делает.`;
  }
  if (heavy && metrics.meanAbsTurn > 0.9) {
    return `${descriptor.label[0].toUpperCase()}${descriptor.label.slice(1)} и рваный темп следа усиливают друг друга: конфликт сегодня будет казаться крупнее, чем он есть. Стоит разводить раздражение и настоящую причину.`;
  }
  if (heavy) {
    return `${descriptor.label[0].toUpperCase()}${descriptor.label.slice(1)}. Тяжёлый фон облегчает разговор по существу: сегодня люди мягче слышат прямое, если оно сказано без напора.`;
  }
  if (bright && metrics.speedStd > 260) {
    return `Ярко и сухо, а след идёт рывками: день добавит вам сил больше, чем нужно, и вы переоцените, сколько успеете. Первый же перегрев покажется чужим, а не своим.`;
  }
  if (bright) {
    return `Светло и сухо. День открыт наружу, и это работает на вас, пока вы держите ритм; резкий вход в чужие обсуждения сегодня читается как вторжение.`;
  }
  return `${descriptor.label[0].toUpperCase()}${descriptor.label.slice(1)}. Фон нейтральный, и это значит, что состояние дня держится целиком на вашей линии, а не на атмосфере.`;
}

function lunarSentence(ctx: DayContext, metrics: RawMetrics, scores: Scores): string {
  const illum = Math.round(ctx.lunar.illumination * 100);
  if (illum > 70 && scores.order > 55) {
    return `Луна освещена на ${illum}%. Вас видно лучше обычного: держать при себе раздражение сегодня дороже, чем сказать о нём спокойно.`;
  }
  if (illum < 28 && metrics.empty) {
    return `Освещённость ${illum}%. День без сцены: никому ничего доказывать не нужно, и это лучший фон, чтобы не оставлять лишний след.`;
  }
  if (illum < 28) {
    return `Освещённость ${illum}%. Видно немного, и это удобно: сегодня можно проверить решение тихо, без объяснений и без свидетелей.`;
  }
  if (illum > 70) {
    return `Освещённость ${illum}%. День хорошо видимый, ваши паузы тоже заметны — пустая деталь между словами сегодня будет прочитана как ответ.`;
  }
  return `Освещённость ${illum}%. Свет ровный: у дня нет ни прикрытия, ни сцены. Полезно ровно то, что вы решите считать закрытым.`;
}

function birthSentence(birth: { day: number; month: number } | null, scores: Scores): string | null {
  if (!birth) return null;
  const zodiac = zodiacOf(birth);
  if (!zodiac) return null;
  return `Дата рождения держит ${zodiac.element.toLowerCase()}. ${
    ELEMENT_LINE[zodiac.element]
  }. Обычно это читается как ${zodiac.name.toLowerCase()}: ${zodiac.contour}. Сегодня стихия работает как ${
    scores.regulation > 55 ? 'опора' : 'нагрузка'
  }.`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const DROPS: string[] = [
  'Единственное бытовое следствие: не разбирайте сложное в переписке после 21:00 — к этому часу вы читаете не текст, а вчерашний тон.',
  'Единственное бытовое следствие: оставьте паузу перед «да». Первый ответ сегодня опережает вашу собственную точку зрения.',
  'Единственное бытовое следствие: не назначайте финал дня на раннее утро — ваш точный час всё равно позже.',
  'Единственное бытовое следствие: договоритесь о письменной формулировке там, где решение важное, — устная сегодня легко станет вашей ответственностью.',
  'Единственное бытовое следствие: не ставьте длинные встречи подряд. Вам нужно два коротких перерыва без людей, иначе вечер уйдёт на восстановление.',
  'Единственное бытовое следствие: не обещайте срок сходу, даже если он кажется очевидным. Названное сегодня число прозвучит жёстче, чем вы имели в виду.',
];

export function composeDayWhy(
  ctx: DayContext,
  metrics: RawMetrics,
  scores: Scores,
  seed: number,
  birth: { day: number; month: number } | null,
): DayWhy {
  const module = weekdayModule(ctx.weekday);
  const weekPart = `${capitalize(module.reading)}. По решениям ${module.decisions}; по контакту ${module.contact}. ${capitalize(module.mask)}.`;
  const counterfactual = `Если бы этот след был в субботу, он читался бы иначе. ${capitalize(
    module.counterfactual,
  )}.`;

  const calendar = holidaySentence(ctx) ?? calendarSentence(ctx, scores) ?? '';
  const weather = weatherSentence(ctx, metrics, scores);
  const lunar = lunarSentence(ctx, metrics, scores);
  const birthLine = birthSentence(birth, scores);

  const window = composeWindow(ctx, metrics, scores, seed);
  const drop = pickDeterministic(DROPS, combineSeed(seed, ctx.isoDate, 'drop'));
  const closing = composeClosing(ctx, metrics, scores);

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
      'Утро сильнее вечера: линия у вас концентрируется в начале. Сложное берите в первое окно, пока запас честный.',
    );
    eveningOptions.push(
      'Вечер будет тише, чем вы от него ждёте. Не назначайте на него разговор, где нужен ваш напор.',
    );
  } else if (metrics.earlyLateBalance < 0.4) {
    morningOptions.push(
      'Утро идёт медленнее, чем требует день: вы входите телом позже, чем планом. Первый час лучше не защищать решения.',
    );
    eveningOptions.push(
      'Вечер собраннее, чем утро. Именно там у вас появляется точная формулировка, которой не хватало днём.',
    );
  } else {
    morningOptions.push(
      'Темп распределён ровно, и это редкость. Утро можно начинать без разгона — оно не потребует от вас отдельной сборки.',
    );
    eveningOptions.push(
      'Вечер не даст отдельного рывка: то, что не решено днём, скорее всего, так и уйдёт в завтра.',
    );
  }

  if (scores.expression > 60) {
    middayOptions.push(
      'Середина дня — ваша говорливая часть: контакт идёт легко, но вы обещаете больше, чем готовы держать.',
    );
  } else {
    middayOptions.push(
      'В середине дня вы дороже в контакте, чем утром: слова экономите, и это читается как холодность, хотя это концентрация.',
    );
  }

  if (scores.stamina < 42) {
    eveningOptions.push(
      'Запас к вечеру небольшой. После 17:00 выигрывает не тот, кто дожимает, а тот, кто закрывает.',
    );
  }
  if (ctx.weather && ctx.weather.apparent < 4) {
    morningOptions.push(
      'Холодный фон забирает часть запаса на старте: первый выход наружу стоит планировать с запасом по времени.',
    );
  }

  return {
    morning: pickDeterministic(morningOptions, combineSeed(seed, ctx.isoDate, 'morning')),
    midday: pickDeterministic(middayOptions, combineSeed(seed, ctx.isoDate, 'midday')),
    evening: pickDeterministic(eveningOptions, combineSeed(seed, ctx.isoDate, 'evening')),
  };
}

function composeClosing(ctx: DayContext, metrics: RawMetrics, scores: Scores): string {
  const day = WEEKDAYS_RU[ctx.weekday]?.name ?? 'день';
  if (metrics.empty) {
    return `Итог дня простой: ${day} не требует вашей линии. То, что вы её не оставили, — тоже решение, и оно про экономию, а не про пустоту.`;
  }
  if (scores.regulation > 62) {
    return `Итог дня: вы удержите форму ${ctx.weekdayGenitive} ровно настолько, насколько заранее назовёте, что считаете закрытым.`;
  }
  if (metrics.meanAbsTurn > 0.95) {
    return `Итог дня: ${day} даст вам больше поворотов, чем нужно. Один из них стоит отменить заранее, и это будет лучшим решением дня.`;
  }
  return `Итог дня: ${day} читается через ваш темп, а не через чужие ожидания. Держите его — и вечер не придётся пересобирать.`;
}
