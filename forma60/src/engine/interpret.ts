import type {
  DayContext,
  Insight,
  MotiveId,
  Profile,
  RawMetrics,
  RoleId,
  Scale,
  Scores,
  ShadowId,
} from './types';
import { clamp, combineSeed, formatStampHash, hashMetrics, pickDeterministic } from './seed';
import { composeDayWhy } from './dayContext';
import { selectInsights, type InsightContext } from './insights';
import { describeWeather } from '../data/weatherCodes.ru';

function norm(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return clamp(((value - min) / (max - min)) * 100);
}

function emptyScores(durationMs: number): Scores {
  const patience = norm(durationMs, 8000, 60000);
  return {
    order: Math.round(50 + patience * 0.06),
    expression: Math.round(16 + patience * 0.05),
    regulation: Math.round(56 + patience * 0.08),
    focus: Math.round(52 + patience * 0.06),
    stamina: Math.round(54 + patience * 0.05),
  };
}

export function computeScores(metrics: RawMetrics): Scores {
  if (metrics.empty) return emptyScores(metrics.durationMs);

  const size = 1;
  const lengthRatio = metrics.totalLength / size;
  const maxQuadrant = Math.max(...metrics.quadrantMass);

  const order = Math.round(
    0.4 * norm(metrics.gridAlignment, 0.05, 0.6) +
      0.3 * norm(metrics.straightness, 0.3, 0.85) +
      0.15 * norm(metrics.symmetry, 0.35, 0.92) +
      0.15 * (100 - norm(metrics.meanAbsTurn, 0.1, 1.6)),
  );

  const expression = Math.round(
    0.35 * norm(metrics.coverage, 0.02, 0.35) +
      0.25 * norm(lengthRatio, 0.4, 6) +
      0.25 * norm(metrics.meanSpeed, 80, 700) +
      0.15 * norm(metrics.colorCount, 1, 3),
  );

  const regulation = Math.round(
    0.35 * (100 - norm(metrics.speedStd, 80, 600)) +
      0.25 * norm(metrics.symmetry, 0.35, 0.92) +
      0.2 * (100 - norm(Math.abs(metrics.idleRatio - 0.15), 0, 0.5)) +
      0.2 * norm(metrics.gridAlignment, 0.05, 0.6),
  );

  const focus = Math.round(
    0.4 * norm(metrics.straightness, 0.3, 0.85) +
      0.3 * norm(maxQuadrant, 0.3, 0.75) +
      0.3 * (100 - norm(metrics.pauseCount, 0, 6)),
  );

  const stamina = Math.round(
    0.4 * (100 - Math.abs(metrics.earlyLateBalance - 0.5) * 200) +
      0.3 * norm(lengthRatio, 0.4, 6) +
      0.3 * (100 - norm(metrics.idleRatio, 0, 0.6)),
  );

  return {
    order: clamp(order),
    expression: clamp(expression),
    regulation: clamp(regulation),
    focus: clamp(focus),
    stamina: clamp(stamina),
  };
}

/* ---------------- Шкалы ---------------- */

type ScaleDef = {
  id: Scale['id'];
  label: string;
  left: string;
  right: string;
  low: string;
  high: string;
  mid: string;
};

const SCALE_DEFS: ScaleDef[] = [
  {
    id: 'order',
    label: 'Собранность',
    left: 'иду без рамки',
    right: 'держу форму',
    low: 'сегодня вы идёте без рамки',
    high: 'сегодня вы держитесь порядка',
    mid: 'сегодня ровно посередине',
  },
  {
    id: 'expression',
    label: 'Открытость контакту',
    left: 'беру паузу',
    right: 'говорю первым',
    low: 'сегодня вы говорите мало',
    high: 'сегодня разговор идёт через вас',
    mid: 'говорите по делу, не больше',
  },
  {
    id: 'regulation',
    label: 'Потребность в ясности',
    left: 'могу начать в тумане',
    right: 'нужен названный край',
    low: 'вы можете начать, не зная всего пути',
    high: 'без понятного края вы придумываете свой',
    mid: 'край нужен, но не любой ценой',
  },
  {
    id: 'focus',
    label: 'Темп решений',
    left: 'медленно и верно',
    right: 'быстро и с правкой',
    low: 'решение вы собираете дольше, чем произносите',
    high: 'решение вы отдаёте раньше, чем оно дозрело',
    mid: 'темп ровный: успеваете и то и другое',
  },
  {
    id: 'stamina',
    label: 'Запас на вечер',
    left: 'вечер тише утра',
    right: 'вечер сильнее утра',
    low: 'к вечеру силы заканчиваются',
    high: 'вечер — ваш второй, более точный заход',
    mid: 'вечер без подъёма и без провала',
  },
];

export function buildScales(scores: Scores): Scale[] {
  return SCALE_DEFS.map((def) => {
    const value = scores[def.id];
    const band = value < 42 ? def.low : value > 58 ? def.high : def.mid;
    return {
      id: def.id,
      label: def.label,
      value,
      band,
      left: def.left,
      right: def.right,
    };
  });
}

/* ---------------- Роли дня ---------------- */

type RoleInfo = {
  label: string;
  text: string;
  decision: string;
  speech: string;
  pressure: string;
  motive: MotiveId;
  withYou: string[];
};

const ROLE_INFO: Record<RoleId, RoleInfo> = {
  closer: {
    label: 'закрывающий',
    text: 'Сегодня вы ставите точку. Остальным проще идти за вашей точкой, чем искать свою.',
    decision: 'Вы решаете до конца. Если сегодня не получается, честно переносите на завтра.',
    speech: 'Вы говорите выводами. С вами перестают спорить о деталях.',
    pressure: 'Под давлением вы начинаете закрывать чужие дела. Это выглядит как выручка, а заканчивается перегрузом.',
    motive: 'finished_piece',
    withYou: [
      'Давайте задачи с понятным концом, а не открытые.',
      'Не решайте за вас, когда вы уже почти закончили.',
      'Если срок сдвигается, говорите сразу, а не в последний день.',
    ],
  },
  framer: {
    label: 'тот, кто задаёт рамки',
    text: 'Сегодня вы называете границы. Без вашего «до какого момента» день расползается.',
    decision: 'Сначала вы называете критерий, потом решаете. Нет критерия — придумаете сами, и выйдет строже, чем вы хотели.',
    speech: 'Вы уточняете формулировки. Иногда это принимают за недоверие.',
    pressure: 'Под давлением вы начинаете контролировать мелочи, которые и так в порядке.',
    motive: 'clarity',
    withYou: [
      'Открытую задачу давайте вместе с условием «что считается готовым».',
      'Не обсуждайте ваш характер, когда спор идёт о сроках.',
      'Важные решения просите письменно.',
    ],
  },
  starter: {
    label: 'запускающий',
    text: 'Сегодня вы запускаете. Идея приходит быстрее, чем план.',
    decision: 'Вы решаете в начале, пока видно движение. Дальше нужен человек, который додержит.',
    speech: 'Вы говорите быстро. Слушатели ловят идею, но теряют детали.',
    pressure: 'Под давлением вы начинаете новое вместо того, чтобы закончить начатое. Оба дела остаются вашими.',
    motive: 'meaning',
    withYou: [
      'Берите запуск, но не берите закрытие.',
      'Просите у вас короткий письменный итог первых десяти минут.',
      'Не давайте две новые темы сразу: возьмёте обе.',
    ],
  },
  quality: {
    label: 'держащий качество',
    text: 'Сегодня на вас держится планка. Вы видите брак раньше всех и не можете его пропустить.',
    decision: 'Вы решаете медленно, потому что видите цену ошибки. Где ошибка дешёвая, это только тормозит.',
    speech: 'Ваше «пока рано» весит больше, чем чужое «давай».',
    pressure: 'Под давлением вы перепроверяете то, что уже проверено. Люди перестают приносить вам проблемы.',
    motive: 'meaning',
    withYou: [
      'Давайте вам проверку, а не аврал.',
      'Не торопите фразой «и так сойдёт» — станет дольше.',
      'Заранее спросите, при каком условии вы остановитесь.',
    ],
  },
  quiet_veto: {
    label: 'молчаливый несогласный',
    text: 'Сегодня вы почти не спорите, но внутри у вас ясное «нет». Оно редко звучит вслух и потому выходит делами.',
    decision: 'Вы решаете тихо и позже. Внешне это похоже на согласие.',
    speech: 'Вы мало говорите. Паузу принимают за согласие, и это удобно до первого обещания.',
    pressure: 'Под давлением вы замолкаете и соглашаетесь без согласия. Потом возражение выглядит как саботаж.',
    motive: 'calm',
    withYou: [
      'Спрашивайте прямо: «есть возражения?», а не «согласны?».',
      'Дайте время ответить письменно.',
      'Молчание не считайте поддержкой.',
    ],
  },
  pace: {
    label: 'задающий темп',
    text: 'Сегодня вы ускоряете всех. День идёт в вашей скорости, и пока она по делу, это лучший режим.',
    decision: 'Вы решаете быстро, чтобы двигаться. Правки вносите по ходу.',
    speech: 'Вы говорите коротко, без вступлений. Экономите время и теряете часть тепла.',
    pressure: 'Под давлением вы ускоряетесь даже там, где спешить не нужно.',
    motive: 'finished_piece',
    withYou: [
      'Ограничивайте время, а не объём.',
      'Останавливайте вас там, где нужно выбрать одно.',
      'Не ставьте вас в разговор, где нужна долгая мягкость.',
    ],
  },
  glue: {
    label: 'связывающий людей',
    text: 'Сегодня через вас люди понимают друг друга. Это выходит лучше, чем у большинства.',
    decision: 'Вы выбираете вариант, который устроит всех. Своё мнение появляется последним.',
    speech: 'Вы переводите чужое на понятный язык. Это мягче и медленнее, чем сказать прямо.',
    pressure: 'Под давлением вы берёте на себя чужие состояния и к вечеру остаётесь без своего результата.',
    motive: 'people',
    withYou: [
      'Не отправляйте вас мирить тех, кто не собирается договариваться.',
      'Дайте доделать одну свою вещь.',
      'Спрашивайте прямо, чего хотите вы.',
    ],
  },
  solo: {
    label: 'работающий отдельно',
    text: 'Сегодня вам выгоднее свой участок. На согласованиях уходит больше сил, чем на саму работу.',
    decision: 'Вы решаете сами и быстро: вся картина у вас в голове.',
    speech: 'Вы объясняете ровно столько, сколько нужно.',
    pressure: 'Под давлением вы уходите в задачу и перестаёте сообщать о ходе. Для других результат появляется внезапно.',
    motive: 'calm',
    withYou: [
      'Ставьте задачу с понятным краем и оставляйте в покое.',
      'Не зовите на общий штурм без роли.',
      'Просите статус коротко и письмом.',
    ],
  },
  mirror: {
    label: 'считывающий других',
    text: 'Сегодня вы лучше понимаете чужие состояния, чем свои.',
    decision: 'Вы решаете после всех: сначала собираете чужие ожидания.',
    speech: 'Вы подстраиваете тон под человека и почти не подстраиваете под себя.',
    pressure: 'Под давлением вы всё замечаете и молчите, а решение принимают за вас.',
    motive: 'people',
    withYou: [
      'Не просите вас оценить человека: вы сделаете это в его пользу.',
      'Задавайте вопрос, на который нужен ваш ответ.',
      'Если хотите услышать ваше мнение, поговорите отдельно.',
    ],
  },
  minimal: {
    label: 'упрощающий',
    text: 'Сегодня вы всё упрощаете. Лишнее уходит, и это честный способ дожить до вечера.',
    decision: 'Вы решаете отсечением: убираете вариант, а не выбираете из списка.',
    speech: 'Вы говорите минимумом слов. Точно, иногда слишком.',
    pressure: 'Под давлением вы отсекаете то, что нужно было просто объяснить, и остаётесь без союзников.',
    motive: 'calm',
    withYou: [
      'Давайте одну ясную задачу вместо трёх важных.',
      'Не зовите обсуждать то, что уже решено.',
      'Если нужна причина, спрашивайте прямо.',
    ],
  },
};

const SHADOW_INFO: Record<ShadowId, { label: string; text: string }> = {
  control_details: {
    label: 'контроль мелочей',
    text: 'Под давлением вы наводите порядок в мелочах. Не потому, что они важны, а потому, что они под рукой.',
  },
  speed_at_any_cost: {
    label: 'ускорение',
    text: 'Под давлением вы ускоряетесь, чтобы не чувствовать тяжесть. Легче на час, дороже потом.',
  },
  silence: {
    label: 'молчание',
    text: 'Под давлением вы замолкаете. Это не отступление, но окружающие понимают иначе.',
  },
  agreement_without_agreement: {
    label: 'согласие без согласия',
    text: 'Под давлением вы соглашаетесь, чтобы закончить разговор. Возражение останется и вернётся.',
  },
  new_idea_instead_of_finish: {
    label: 'новое вместо законченного',
    text: 'Под давлением вы начинаете новое вместо того, чтобы закончить начатое: так проще.',
  },
  hard_directness: {
    label: 'резкость',
    text: 'Под давлением ваша прямота теряет мягкость. Смысл верный, запомнится тон.',
  },
};

const MOTIVE_INFO: Record<MotiveId, { label: string; text: string }> = {
  clarity: {
    label: 'ясность',
    text: 'Вам нужна ясность. Когда край назван, вы способны на многое; когда нет, тратите силы на догадки.',
  },
  people: {
    label: 'люди',
    text: 'Вам нужны люди: через разговор вы понимаете задачу быстрее, чем из документов.',
  },
  order: {
    label: 'порядок',
    text: 'Вам нужен порядок. Убранное место даёт больше, чем убранный список дел.',
  },
  meaning: {
    label: 'смысл',
    text: 'Вам нужен смысл. Бессмысленная часть дня кажется дороже, чем есть.',
  },
  finished_piece: {
    label: 'законченный кусок',
    text: 'Вам нужен законченный кусок: не всё дело, а закрытая часть, к которой не придётся возвращаться.',
  },
  calm: {
    label: 'спокойствие',
    text: 'Вам нужно спокойствие. Вы готовы потерять в скорости, чтобы не потерять ровность.',
  },
};

/* ---------------- Роль, тень, мотив ---------------- */

function scoreRoles(metrics: RawMetrics, scores: Scores): Record<RoleId, number> {
  const softTurn = 100 - norm(metrics.meanAbsTurn, 0.1, 1.5);
  return {
    closer: scores.focus * 0.5 + scores.order * 0.3 + norm(metrics.earlyLateBalance, 0.3, 0.7) * 0.2,
    framer: scores.order * 0.55 + scores.regulation * 0.3 + norm(metrics.gridAlignment, 0.05, 0.6) * 0.15,
    starter: scores.expression * 0.5 + (100 - scores.stamina) * 0.3 + norm(metrics.maxSpeed, 200, 1200) * 0.2,
    quality: scores.order * 0.4 + scores.regulation * 0.35 + norm(metrics.pauseCount, 0, 6) * 0.25,
    quiet_veto: (100 - scores.expression) * 0.45 + softTurn * 0.3 + (100 - scores.focus) * 0.25,
    pace: scores.expression * 0.4 + norm(metrics.meanSpeed, 80, 700) * 0.4 + scores.stamina * 0.2,
    glue: scores.expression * 0.35 + symm(metrics) * 0.35 + (100 - scores.focus) * 0.3,
    solo: (100 - norm(metrics.coverage, 0.02, 0.35)) * 0.5 + scores.focus * 0.3 + scores.regulation * 0.2,
    mirror: symm(metrics) * 0.45 + (100 - scores.focus) * 0.3 + scores.expression * 0.25,
    minimal: (100 - norm(metrics.totalLength / Math.max(1, metrics.durationMs) * 1000, 20, 500)) * 0.4 + (100 - scores.expression) * 0.35 + scores.regulation * 0.25,
  };
}

function symm(metrics: RawMetrics): number {
  return metrics.symmetry * 100;
}

function pickRole(metrics: RawMetrics, scores: Scores, seed: number): RoleId {
  const table = scoreRoles(metrics, scores);
  const entries = (Object.keys(table) as RoleId[]).map((id) => ({
    id,
    score: table[id] + (combineSeed(seed, id) % 7),
  }));
  entries.sort((a, b) => b.score - a.score);
  return entries[0].id;
}

function pickShadow(metrics: RawMetrics, scores: Scores, seed: number): ShadowId {
  const candidates: ShadowId[] = [];
  if (scores.order > 62 && metrics.gridAlignment > 0.42) candidates.push('control_details');
  if (metrics.meanSpeed > 430 && scores.stamina >= 52) candidates.push('speed_at_any_cost');
  if (metrics.strokeCount <= 2 && metrics.pauseCount >= 2) candidates.push('silence');
  if (metrics.meanAbsTurn < 0.55 && scores.expression < 56) candidates.push('agreement_without_agreement');
  if (metrics.colorCount >= 2 || (metrics.startZone !== metrics.endZone && metrics.strokeCount >= 4))
    candidates.push('new_idea_instead_of_finish');
  if (metrics.maxSpeed > 950) candidates.push('hard_directness');
  if (candidates.length === 0) {
    candidates.push(scores.order >= 55 ? 'control_details' : 'silence');
  }
  return candidates[combineSeed(seed, 'shadow') % candidates.length];
}

function pickMotive(motive: MotiveId, metrics: RawMetrics, scores: Scores, seed: number): MotiveId {
  if (metrics.empty) return 'calm';
  if (scores.regulation > 64) return 'clarity';
  if (scores.expression > 64 && scores.stamina < 52) return 'finished_piece';
  if (scores.order > 64) return 'order';
  if (scores.expression > 60) return 'people';
  if (scores.focus > 58) return 'meaning';
  if (combineSeed(seed, 'motive') % 2 === 0) return 'calm';
  return motive;
}

/* ---------------- Заголовок и лид ---------------- */

type HeadlineRule = { text: string; match: (m: RawMetrics, s: Scores) => boolean };

const HEADLINES: HeadlineRule[] = [
  { text: 'Сегодня вы держите лицо ровнее, чем линию.', match: (_m, s) => s.regulation > 55 },
  { text: 'Вы уже всё решили — и всё ещё проверяете.', match: (m, s) => m.straightness > 0.58 && m.pauseCount >= 2 && s.focus > 45 },
  { text: 'Вам нужен понятный край задачи, иначе день расползётся.', match: (m, s) => s.order > 56 && m.coverage > 0.12 },
  { text: 'Вы соглашаетесь раньше, чем понимаете, с чем.', match: (m, s) => m.meanSpeed > 430 && s.regulation < 62 },
  { text: 'Вы устали не от людей, а от незаконченных разговоров.', match: (m, s) => m.pauseCount >= 3 && s.expression < 58 },
  { text: 'Сил хватит не на весь день, а на его половину.', match: (_m, s) => s.stamina < 46 },
  { text: 'У вас сильное начало и слабый вечер.', match: (m) => m.earlyLateBalance > 0.62 },
  { text: 'Ваш лучший час сегодня позже, чем вы думаете.', match: (m) => m.earlyLateBalance < 0.38 },
  { text: 'Вы проверяете качество там, где вас об этом не просили.', match: (m, s) => s.order > 60 && m.coverage > 0.15 },
  { text: 'Сегодня вам лучше работать отдельно от других.', match: (m, s) => m.coverage < 0.13 && s.focus > 48 },
  { text: 'Вы говорите выводами и теряете детали.', match: (m, s) => s.expression > 58 && m.strokeCount <= 3 },
  { text: 'Сегодня вы выглядите спокойнее, чем есть.', match: (_m, s) => s.regulation > 62 },
  { text: 'От вас ждут прямоты, а вы бережёте слова.', match: (m, s) => s.expression < 46 && m.totalLength > 0 },
  { text: 'Сегодня вы ничего не нарисовали — и это тоже ответ.', match: (m) => m.empty },
  { text: 'Вы начинали заново больше одного раза.', match: (m) => m.strokeCount >= 5 },
];

const HEADLINE_FALLBACK = 'Сегодня ваш ритм совпадает с тем, что вы нарисовали.';

function pickHeadline(metrics: RawMetrics, scores: Scores, seed: number): string {
  const matches = HEADLINES.filter((rule) => rule.match(metrics, scores));
  if (matches.length === 0) return HEADLINE_FALLBACK;
  return matches[combineSeed(seed, 'headline') % matches.length].text;
}

const LEAD_OPEN: { text: string; match: (m: RawMetrics, s: Scores) => boolean }[] = [
  { text: 'Сегодня вы вошли в день с понятным планом: сколько успеете и где остановитесь.', match: (_m, s) => s.regulation > 58 },
  { text: 'Силы есть, но ровными они не будут. Хватит на важное, если не тратить их на объяснения.', match: (m, _s) => m.speedStd > 280 },
  { text: 'Сегодня вы экономите слова и жесты: короткие ответы, короткие решения.', match: (_m, s) => s.expression < 50 },
  { text: 'Сегодня движения больше, чем плана. Куда идти, решается по ходу.', match: (_m, s) => s.expression > 60 && s.order < 55 },
  { text: 'Сегодня вы собраны и держитесь за это как за опору.', match: (_m, s) => s.order > 60 },
];

const LEAD_OTHERS: { text: string; match: (m: RawMetrics, s: Scores) => boolean }[] = [
  { text: 'Люди рядом видят спокойного человека и не догадываются, чего это стоит.', match: (_m, s) => s.regulation > 58 },
  { text: 'Вас посчитают согласным, потому что вы не спорите при других.', match: (_m, s) => s.expression < 55 },
  { text: 'От вас ждут быстрого ответа. Внутри скорость может быть другой.', match: (m, _s) => m.meanSpeed > 380 },
  { text: 'К вам придут за точностью, а не за поддержкой.', match: (_m, s) => s.order > 56 },
  { text: 'Вас считают спокойным, хотя пауза — это не спокойствие, а сосредоточенность.', match: (m, _s) => m.pauseCount >= 2 },
];

function pickLead(metrics: RawMetrics, scores: Scores, seed: number): string {
  const open = pickFrom(LEAD_OPEN, metrics, scores, combineSeed(seed, 'open'));
  const others = pickFrom(LEAD_OTHERS, metrics, scores, combineSeed(seed, 'others'));
  return `${open} ${others} Сегодня это заметнее обычного.`;
}

function pickFrom(
  list: { text: string; match: (m: RawMetrics, s: Scores) => boolean }[],
  metrics: RawMetrics,
  scores: Scores,
  seed: number,
): string {
  const matches = list.filter((entry) => entry.match(metrics, scores));
  if (matches.length === 0) return list[0].text;
  return matches[seed % matches.length].text;
}

/* ---------------- «Как с вами сегодня» ---------------- */

function composeWithYou(
  role: RoleInfo,
  shadow: ShadowId,
  day: DayContext,
  scores: Scores,
  seed: number,
): string[] {
  const lines = [...role.withYou];
  const dayLines: string[] = [];
  if (day.holiday || day.isDayBeforeHoliday) {
    dayLines.push('Не задавайте сегодня рабочий вопрос в неуместный час: ответ будет, а вечер — испорчен.');
  }
  if (day.isMonthEnd) {
    dayLines.push('Не давайте новую порцию до конца месяца: у вас сейчас включается ревизия, а не приём.');
  }
  if (day.weather && describeWeather(day.weather.code).heaviness > 0.55) {
    dayLines.push('Формулируйте задачу письменно: сегодня тяжёлый фон съедает устные договорённости.');
  }
  if (scores.stamina < 48) {
    dayLines.push('Не назначайте вам вечернее решение: к вечеру точность у вас выше, чем терпение.');
  }
  if (shadow === 'hard_directness') {
    dayLines.push('Не просите вас сказать прямо сходу: вторая формулировка будет точнее и мягче.');
  }
  if (dayLines.length === 0) {
    dayLines.push('Сегодня вам полезно, чтобы условие «готово» было названо до начала работы.');
  }
  const merged = lines.concat(pickDeterministic(dayLines, combineSeed(seed, 'withYou', day.isoDate)));
  return merged.slice(0, 5);
}

/* ---------------- Главная сборка ---------------- */

export function buildProfile(
  metrics: RawMetrics,
  day: DayContext,
  birth: { day: number; month: number } | null,
): Profile {
  const seed = combineSeed(hashMetrics(metrics), day.isoDate, metrics.empty ? 'empty' : 'ink');
  const scores = computeScores(metrics);
  const scales = buildScales(scores);
  const role = pickRole(metrics, scores, seed);
  const roleInfo = ROLE_INFO[role];
  const shadow = pickShadow(metrics, scores, seed);
  const motive = pickMotive(roleInfo.motive, metrics, scores, seed);

  const insightCtx: InsightContext = {
    metrics,
    scores,
    weekday: day.weekdayName,
    weekdayIn: day.weekdayInPhrase,
    isMonday: day.weekday === 1,
    isTuesday: day.weekday === 2,
    isWednesday: day.weekday === 3,
    isThursday: day.weekday === 4,
    isFriday: day.weekday === 5,
    isWeekend: day.isWeekend,
    isHoliday: Boolean(day.holiday),
    holidayName: day.holiday?.name ?? null,
    isDayBeforeHoliday: day.isDayBeforeHoliday,
    isAfterHoliday: day.isAfterHoliday,
    isMonthEnd: day.isMonthEnd,
    isBirthdayWindow: day.isBirthdayWindow,
    weatherHeavy: Boolean(day.weather && describeWeather(day.weather.code).heaviness > 0.55),
    weatherBright: Boolean(day.weather && describeWeather(day.weather.code).brightness > 0.7),
    lunarBright: day.lunar.illumination > 0.7,
    lunarDark: day.lunar.illumination < 0.28,
  };

  const insights: Insight[] = selectInsights(insightCtx, seed, 4);
  const dayWhy = composeDayWhy(day, metrics, scores, seed, birth);
  const headline = pickHeadline(metrics, scores, seed);
  const lead = pickLead(metrics, scores, seed);

  const datePart = `${day.isoDate.replace(/-/g, '')}`;
  const number = `Ф60-${datePart}-${formatStampHash(metrics)}`;

  return {
    number,
    seed,
    headline,
    lead,
    insights,
    scores,
    scales,
    role,
    roleLabel: roleInfo.label,
    roleText: roleInfo.text,
    shadow,
    shadowLabel: SHADOW_INFO[shadow].label,
    shadowText: SHADOW_INFO[shadow].text,
    decision: roleInfo.decision,
    speech: roleInfo.speech,
    pressure: roleInfo.pressure,
    motive,
    motiveLabel: MOTIVE_INFO[motive].label,
    motiveText: MOTIVE_INFO[motive].text,
    withYou: composeWithYou(roleInfo, shadow, day, scores, seed),
    dayWhy,
  };
}
