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
import { weekdayModule } from '../data/weekdayPsychology';

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
    low: 'сегодня вы скорее идёте без рамки',
    high: 'сегодня вы держите форму и держитесь её',
    mid: 'сегодня форма ровно посередине',
  },
  {
    id: 'expression',
    label: 'Открытость контакту',
    left: 'беру паузу',
    right: 'говорю первым',
    low: 'слово сегодня дороже движения',
    high: 'контакт сегодня идёт через вас',
    mid: 'контакт по запросу, не по умолчанию',
  },
  {
    id: 'regulation',
    label: 'Потребность в ясности',
    left: 'могу начать в тумане',
    right: 'нужен названный край',
    low: 'вы способны начать, не зная всего пути',
    high: 'без названного края вы начинаете собирать его сами',
    mid: 'край нужен, но не любой ценой',
  },
  {
    id: 'focus',
    label: 'Темп решений',
    left: 'медленно и верно',
    right: 'быстро и с правкой',
    low: 'решение вы собираете дольше, чем произносите',
    high: 'решение вы отдаёте до того, как оно дозреет',
    mid: 'темп ровный: успеваете и то и другое',
  },
  {
    id: 'stamina',
    label: 'Запас на вечер',
    left: 'вечер тише утра',
    right: 'вечер сильнее утра',
    low: 'вечер топит то, что вы не закрыли днём',
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
    label: 'тот, кто сегодня закрывает',
    text: 'Сегодня у вас роль закрывающего: день сдвигается, когда вы ставите точку, и остальным проще двигаться за вашей точкой, чем искать свою.',
    decision: 'Вы решаете до конца, а не до удобного момента. Если что-то нельзя закрыть сегодня, вы честно переводите это в «завтра», и от этого становится легче всем, кроме вас.',
    speech: 'Вы говорите итогами. Собеседник может не согласиться с выводом, но перестаёт спорить о деталях.',
    pressure: 'Под давлением вы начинаете закрывать за других. Это выглядит как выручка и работает как перегруз: чужие задачи остаются вашими.',
    motive: 'finished_piece',
    withYou: [
      'Давайте вам то, у чего есть финал, а не открытую рамку.',
      'Не решайте за вас в момент, когда вы уже почти закрыли.',
      'Сообщайте о сдвиге срока сразу, а не в конце.',
    ],
  },
  framer: {
    label: 'тот, кто ставит край и критерии',
    text: 'Сегодня вы задаёте рамку: без вашего «до какого момента» день расплывается, и люди это чувствуют раньше, чем формулируют.',
    decision: 'Вы решаете, сначала назвав критерий. Если критерия нет, вы его придумаете — и это будет выглядеть строже, чем вы есть.',
    speech: 'Вы уточняете формулировки. Иногда это читают как недоверие, хотя это ваша способность держать общий смысл.',
    pressure: 'Под давлением рамка превращается в контроль мелочей: вы начинаете выравнивать то, что уже выровнено.',
    motive: 'clarity',
    withYou: [
      'Давайте открытую задачу только вместе с условием «что считается готовым».',
      'Не разбирайте ваш характер в момент, когда обсуждается край.',
      'Просите письменную формулировку, если решение важное.',
    ],
  },
  starter: {
    label: 'тот, кто запускает, но не дожимает',
    text: 'Сегодня вы — старт. Идея у вас появляется быстрее, чем план, и вы заражаете ею раньше, чем проверяете.',
    decision: 'Вы решаете в начале, пока видно движение. Дальше вам нужен человек, который будет держать хвост.',
    speech: 'Вы говорите образами и быстро. Слушатели ловят намерение, но теряют детали.',
    pressure: 'Под давлением вы открываете новую тему вместо завершения старой, и обе остаются вашими.',
    motive: 'meaning',
    withYou: [
      'Берите на себя запуск, но не берите один закрывать.',
      'Попросите у вас письменный итог первых десяти минут.',
      'Не ставьте рядом две новые темы: вы возьмёте обе.',
    ],
  },
  quality: {
    label: 'держатель качества и «подождите»',
    text: 'Сегодня на вас держится планка. Вы замечаете дефект раньше всех и не можете оставить его без внимания.',
    decision: 'Вы решаете медленнее, потому что видите цену ошибки. В задачах, где ошибка дешёвая, это тормозит вас и раздражает других.',
    speech: 'Вы говорите точнее, чем мягче. Ваше «пока рано» весит больше, чем чужое «погнали».',
    pressure: 'Под давлением вы переходите к перепроверке того, что уже проверено. Люди начинают приносить вам не проблемы, а готовые ответы.',
    motive: 'meaning',
    withYou: [
      'Давайте вам фазу проверки, а не фазу штурма.',
      'Не торопите вас фразой «и так сойдёт»: это увеличит срок.',
      'Спросите, где ваш стоп-критерий, до начала работы.',
    ],
  },
  quiet_veto: {
    label: 'тихий центр с внутренним нет',
    text: 'Сегодня вы почти не спорите, но внутри у вас есть чёткое «нет». Оно редко доходит до слов и поэтому часто доходит до действий.',
    decision: 'Вы решаете тихо и после. Внешне это выглядит как согласие, а на деле — отложенный выбор.',
    speech: 'Вы экономите слова. Паузу принимают за согласие, и это удобно вам ровно до первого обязательства.',
    pressure: 'Под давлением вы замолкаете сильнее и соглашаетесь без согласия. Возражение всплывёт позже и будет выглядеть как саботаж.',
    motive: 'calm',
    withYou: [
      'Спрашивайте прямо: «есть ли возражение», а не «согласны ли вы».',
      'Давайте вам время ответить письменно.',
      'Не считайте молчание поддержкой.',
    ],
  },
  pace: {
    label: 'тот, кто задаёт темп, сжигает запас',
    text: 'Сегодня вы ускоряете всех вокруг. День идёт по вашей скорости, и пока она совпадает со смыслом, это лучший режим.',
    decision: 'Вы решаете быстро, чтобы двигаться. Правки вносите потом и на ходу.',
    speech: 'Вы говорите коротко и по делу, без вступлений. Это экономит время и стоит вам части тепла.',
    pressure: 'Под давлением вы ускоряетесь любой ценой, включая работу, которую не нужно делать быстро.',
    motive: 'finished_piece',
    withYou: [
      'Давайте вам ограничение по времени, а не по объёму.',
      'Останавливайте вас на развилке, где нужно выбрать одно.',
      'Не ставьте вас в разговор, где нужна долгая мягкость.',
    ],
  },
  glue: {
    label: 'склеивает людей, теряет своё',
    text: 'Сегодня вы держите связку между людьми. Через вас передаётся смысл, и вы это делаете лучше, чем большинство.',
    decision: 'Вы решаете с оглядкой на людей: ищете вариант, который попадёт в большинство. Своё мнение появляется последним.',
    speech: 'Вы переводите чужие формулировки в понятные. Это мягче и медленнее, чем сказать прямо.',
    pressure: 'Под давлением вы берёте на себя чужие состояния и остаётесь без своего результата к вечеру.',
    motive: 'people',
    withYou: [
      'Не отправляйте вас мирить тех, у кого нет задачи договариваться.',
      'Давайте вам делать одну свою вещь до конца.',
      'Спрашивайте, чего хотите вы, и ждите ответа без подсказки.',
    ],
  },
  solo: {
    label: 'лучше автономия, чем синхрон',
    text: 'Сегодня вам выгоднее собственный участок. В синхроне вы тратите на согласование больше, чем делает сама работа.',
    decision: 'Вы решаете сами и быстро, потому что целиком держите контекст в голове.',
    speech: 'Вы объясняете ровно столько, сколько нужно. Остальное проявится в результате.',
    pressure: 'Под давлением вы замыкаетесь в задаче и перестаёте сообщать о ходе. Потом это выглядит как внезапный результат.',
    motive: 'calm',
    withYou: [
      'Ставьте задачу краем и оставляйте вас в покое.',
      'Не назначайте вас на общий штурм без роли.',
      'Просите статус коротко и в письме.',
    ],
  },
  mirror: {
    label: 'тонко читает других, медленно решает за себя',
    text: 'Сегодня вы лучше понимаете чужие состояния, чем свои. Комната у вас читается как текст, но собственный выбор остаётся неозвученным.',
    decision: 'Вы решаете после всех, потому что сначала собираете чужие ожидания.',
    speech: 'Вы подстраиваете тон под человека и почти не подстраиваете под себя.',
    pressure: 'Под давлением вы считываете всех и молчите, а решение принимают за вас.',
    motive: 'people',
    withYou: [
      'Не просите вас оценить человека — вы это сделаете в его пользу.',
      'Давайте вам вопрос, на который нужен ваш ответ, а не общий.',
      'Просите отдельный разговор, если хотите услышать ваше мнение.',
    ],
  },
  minimal: {
    label: 'режет лишнее, включая нужное',
    text: 'Сегодня вы упрощаете. Всё лишнее уходит, и это честный способ дожить до вечера с чистым столом.',
    decision: 'Вы решаете отсечением: убираете вариант, а не выбираете из списка.',
    speech: 'Вы говорите по минимуму и почти не украшаете. Это точно и иногда слишком.',
    pressure: 'Под давлением вы отсекаете то, что требовало только объяснения, — и остаётесь без союзников.',
    motive: 'calm',
    withYou: [
      'Давайте одну ясную задачу вместо трёх важных.',
      'Не зовите вас на обсуждение того, что уже решено.',
      'Спрашивайте прямо, если нужна причина, а не вывод.',
    ],
  },
};

const SHADOW_INFO: Record<ShadowId, { label: string; text: string }> = {
  control_details: {
    label: 'контроль мелочей',
    text: 'Сегодня при давлении вы наводите порядок в деталях: не потому, что они важны, а потому что они управляемы.',
  },
  speed_at_any_cost: {
    label: 'ускорение любой ценой',
    text: 'Сегодня при давлении вы ускоряетесь, чтобы не чувствовать тяжесть. Скорость лечит на час и стоит переделки.',
  },
  silence: {
    label: 'уход в молчание',
    text: 'Сегодня при давлении вы замолкаете: не отступаете, а замираете. Это редко прочитают правильно.',
  },
  agreement_without_agreement: {
    label: 'согласие без согласия',
    text: 'Сегодня при давлении вы соглашаетесь, чтобы закончить разговор. Возражение останется и вернётся позже.',
  },
  new_idea_instead_of_finish: {
    label: 'новая идея вместо завершения',
    text: 'Сегодня при давлении вы открываете новое вместо старого: так проще, чем держать скучный хвост.',
  },
  hard_directness: {
    label: 'жёсткая прямота',
    text: 'Сегодня при давлении ваша прямота теряет мягкость первой. Смысл остаётся верным, форма запомнится дольше.',
  },
};

const MOTIVE_INFO: Record<MotiveId, { label: string; text: string }> = {
  clarity: {
    label: 'ясность',
    text: 'Сегодня вами движет ясность: пока край назван, вы способны на многое; пока нет — вы тратите силы на угадывание.',
  },
  people: {
    label: 'люди',
    text: 'Сегодня вами движет контакт: через людей вы понимаете задачу быстрее, чем через документы.',
  },
  order: {
    label: 'порядок',
    text: 'Сегодня вами движет порядок: убранное пространство даёт вам больше, чем убранный список дел.',
  },
  meaning: {
    label: 'смысл',
    text: 'Сегодня вам нужен смысл, а не активность. Бессмысленная часть дня кажется вам дороже, чем она есть.',
  },
  finished_piece: {
    label: 'законченный кусок',
    text: 'Сегодня вам нужен законченный кусок: не задача целиком, а честно закрытая часть, за которую не придётся возвращаться.',
  },
  calm: {
    label: 'спокойствие',
    text: 'Сегодня вами движет спокойствие: вы готовы потерять в скорости, чтобы не потерять ровность.',
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
  { text: 'Сегодня вы держите лицо ровнее, чем линию.', match: (m, s) => s.regulation > 55 && m.meanAbsTurn > 0.75 },
  { text: 'Вы уже всё решили — и всё ещё проверяете.', match: (m, s) => m.straightness > 0.58 && m.pauseCount >= 2 && s.focus > 45 },
  { text: 'Вам нужен край задачи, иначе день расползётся.', match: (m, s) => s.order > 56 && m.coverage > 0.12 },
  { text: 'Сегодня вы соглашаетесь быстрее, чем понимаете.', match: (m, s) => m.meanSpeed > 430 && s.regulation < 62 },
  { text: 'Вы не устали от людей. Вы устали от незакрытых разговоров.', match: (m, s) => m.pauseCount >= 3 && s.expression < 58 },
  { text: 'Ваш день заканчивается раньше ваших планов.', match: (_m, s) => s.stamina < 46 },
  { text: 'Сегодня у вас сильный старт и слабый вечер.', match: (m) => m.earlyLateBalance > 0.62 },
  { text: 'Ваш лучший час сегодня позже, чем вы думаете.', match: (m) => m.earlyLateBalance < 0.38 },
  { text: 'Вы держите качество там, где его никто не просил.', match: (m, s) => s.order > 60 && m.coverage > 0.15 },
  { text: 'Сегодня вам дешевле работать в своём углу.', match: (m, s) => m.coverage < 0.13 && s.focus > 48 },
  { text: 'Вы говорите итогами и теряете на этом детали.', match: (m, s) => s.expression > 58 && m.strokeCount <= 3 },
  { text: 'Сегодня вы выглядите спокойнее, чем вам есть.', match: (_m, s) => s.regulation > 62 },
  { text: 'День просит от вас прямоты, а вы экономите слово.', match: (m, s) => s.expression < 46 && m.totalLength > 0 },
  { text: 'Вы не оставили след — и это тоже форма сегодня.', match: (m) => m.empty },
  { text: 'Вы уже начали заново больше, чем один раз.', match: (m) => m.strokeCount >= 5 },
];

const HEADLINE_FALLBACK = 'Сегодня вы держите форму ровно так, как шла линия.';

function pickHeadline(metrics: RawMetrics, scores: Scores, seed: number): string {
  const matches = HEADLINES.filter((rule) => rule.match(metrics, scores));
  if (matches.length === 0) return HEADLINE_FALLBACK;
  return matches[combineSeed(seed, 'headline') % matches.length].text;
}

const LEAD_OPEN: { text: string; match: (m: RawMetrics, s: Scores) => boolean }[] = [
  { text: 'Сегодня вы вошли в день с ровным внутренним счётом: сколько можно, сколько нужно, где остановиться.', match: (_m, s) => s.regulation > 58 },
  { text: 'Сегодня состояние у вас рабочее, но неровное: вы способны на многое, если не тратить это на объяснения.', match: (m, _s) => m.speedStd > 280 },
  { text: 'Сегодня вы в режиме экономии: жесты короткие, слова по делу, пауза вместо лишнего.', match: (_m, s) => s.expression < 50 },
  { text: 'Сегодня энергии больше, чем структуры: движение есть, а куда именно — решается на ходу.', match: (_m, s) => s.expression > 60 && s.order < 55 },
  { text: 'Сегодня вы собраннее, чем обычно, и держитесь этого как опоры.', match: (_m, s) => s.order > 60 },
];

const LEAD_OTHERS: { text: string; match: (m: RawMetrics, s: Scores) => boolean }[] = [
  { text: 'Окружающие видят человека, у которого всё под контролем, и не догадываются, сколько это стоит.', match: (_m, s) => s.regulation > 58 },
  { text: 'Вас прочтут как согласного, потому что вы не спорите при свидетелях.', match: (_m, s) => s.expression < 55 },
  { text: 'От вас ждут быстрого ответа: темп линии обещает скорость, которой внутри может не быть.', match: (m, _s) => m.meanSpeed > 380 },
  { text: 'К вам придут за точностью, а не за поддержкой: форма следа держит обещание качества.', match: (_m, s) => s.order > 56 },
  { text: 'Вас сегодня видят спокойным, даже когда пауза у вас — это не спокойствие, а сбор.', match: (m, _s) => m.pauseCount >= 2 },
];

function pickLead(metrics: RawMetrics, scores: Scores, day: DayContext, seed: number): string {
  const open = pickFrom(LEAD_OPEN, metrics, scores, combineSeed(seed, 'open'));
  const others = pickFrom(LEAD_OTHERS, metrics, scores, combineSeed(seed, 'others'));
  const module = weekdayModule(day.weekday);
  const discrepancy = `${capitalize(module.reading)} — и это расхождение сегодня будет заметнее обычного.`;
  return `${open} ${others} ${discrepancy}`;
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

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
    weekdayGen: day.weekdayGenitive,
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
  const lead = pickLead(metrics, scores, day, seed);

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
