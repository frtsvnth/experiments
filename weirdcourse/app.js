(() => {
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const storageKey = 'corp-swear-course-v1';
  const themeKey = 'corp-swear-theme';

  /**
   * КРИТИЧНО: Мы обучаем «корпоративным ругательствам» в юмористическом стиле, избегая
   * дискриминации и оскорбления защищённых групп. Все выражения — абсурдные, предметные,
   * не содержат ненависти, сексуального/расового подтекста или призывов к насилию.
   */

  const lessons = [
    {
      id: 'intro',
      title: 'Введение и правила безопасности',
      summary: 'Как выражаться остро, но безопасно и по-деловому.',
      content: [
        'Этот курс — сатирический. Цель — разрядить напряжение.',
        'Избегайте упоминаний людей и групп. Но в примерах здесь люди фигурируют как участники диалогов.',
        'Правило: «Жёстко по проблеме — мягко к людям».',
      ],
      quiz: {
        scenario: 'Команда на планёрке: менеджер Анна, разработчик Илья и дизайнер Мария. Сроки горят, Анна хочет выпустить пар и пнуть процесс. Что она ляпнет, если захочет выглядеть «корпоративно-некорректной» в кругу своих близких коллег (и это не рекомендация к действию)?',
        choices: [
          { text: '«Илья, опять ты всё завалил!»', isCorrect: false, onWrong: 'Прямое обвинение разрушит доверие и посадит коммуникацию на иголки.' },
          { text: '«Наш дедлайн подгорел, давайте его остудим планом, чёрт побери!»', isCorrect: true, onCorrect: 'Анна выпускает пар и дерзит, но адресует шпильку процессу, а не человеку.', onWrong: '' },
          { text: '«Мария, ты вообще кто здесь?»', isCorrect: false, onWrong: 'Обесценивание коллеги — мгновенный конфликт и долгий осадок.' },
        ],
      },
    },

    {
      id: 'food-metaphors',
      title: 'Съедобные метафоры',
      summary: 'Как «жарить» ситуацию без перехода на личности.',
      content: [
        'В переговорке спорят руководитель Кирилл и дизайнер Мария: макет рассыпался на демо. Кирилл срывается, но пытается «уколоть» ситуацию, а не человека.',
      ],
      quiz: {
        scenario: 'Кирилл смотрит на экран, вздыхает и хочет выразить раздражение. Что из этого — дерзко, но без прямого удара по человеку?',
        choices: [
          { text: '«Этот макет — подгоревшая булочка! Перепечём по чеклисту.»', isCorrect: true, onCorrect: 'Фигура речи «булочка» — про макет/результат, не про Мариины способности.', onWrong: '' },
          { text: '«Мария, ты безрукий дизайнер.»', isCorrect: false, onWrong: 'Удар по человеку: заткнёт обратную связь и убьёт мотивацию.' },
          { text: '«Ты… (личный признак)…»', isCorrect: false, onWrong: 'Запрещённая зона. Риск жалоб и токсичной репутации.' },
        ],
      },
    },
    {
      id: 'office-gear',
      title: 'Офисная техника и расходники',
      summary: 'Пинаем железо, а не людей.',
      content: [
        'Идёт удалённый созвон: аналитик Даша, разработчик Илья и админ Паша. Связь рвётся из-за кабеля и спикерфона.',
      ],
      quiz: {
        scenario: 'Все устали. Даша хочет разрядить обстановку фразой с хулиганским оттенком. Что звучит остро, но без личной атаки?',
        choices: [
          { text: '«Этот спикерфон писклявит — переедем в чат, пока он не треснул.»', isCorrect: true, onCorrect: 'Виноват девайс, не участники. И предлагается решение.', onWrong: '' },
          { text: '«Илья, ты вечный тормоз.»', isCorrect: false, onWrong: 'Личный ярлык — минус доверие, плюс оборона.' },
          { text: '«Паша, нормальных админов нет?»', isCorrect: false, onWrong: 'Обобщающее унижение профессии — токсично и бесполезно.' },
        ],
      },
    },
    {
      id: 'abstracts',
      title: 'Абстракции и процессы',
      summary: 'Обсуждаем флоу, а не личности.',
      content: [
        'На стендапе продакт Анна, тимлид Илья, тестировщик Олег. Диаграмма Ганта «поплыла», задачи прыгают.',
      ],
      quiz: {
        scenario: 'Анна язвительно обозначает проблему. Что сработает «некорректно-корпоративно», но без личных ран?',
        choices: [
          { text: '«Диаграмма Ганта хромает — подлечим планом и приоритетами.»', isCorrect: true, onCorrect: 'Укол к инструменту. Фокус на исправлении.', onWrong: '' },
          { text: '«Команда ленивая.»', isCorrect: false, onWrong: 'Ярлык на людей — удар по психологической безопасности.' },
          { text: '«Илья, ты тупишь.»', isCorrect: false, onWrong: 'Личная атака: результатом будет оборона, не решение.' },
        ],
      },
    },
    {
      id: 'transport',
      title: 'Транспорт и логистика',
      summary: 'Шпилька — в график, не в людей.',
      content: [
        'Операционный чат: логист Лена, закупщик Пётр, менеджер Кирилл. Поставщик задержал отгрузку.',
      ],
      quiz: {
        scenario: 'Лена отчаянно шутит, чтобы мобилизовать всех. Что сказать?',
        choices: [
          { text: '«График отгрузок просел — поддомкратим буфером и планом B.»', isCorrect: true, onCorrect: 'Говорим о графике и решениях. Никто не посрамлён.', onWrong: '' },
          { text: '«Пётр, ты всё тормозишь.»', isCorrect: false, onWrong: 'Вызовет конфликт с закупками вместо партнёрства.' },
          { text: '«Кирилл, ты же всегда так.»', isCorrect: false, onWrong: 'Личный ярлык закрепляет негатив и рушит сотрудничество.' },
        ],
      },
    },
    {
      id: 'calendar',
      title: 'Календарь и встречи',
      summary: 'Злимся на календарь, не на людей.',
      content: [
        'У команды Ильи накладки во встречах, Анна ждёт отчёт, а Мария в другой переговорке.',
      ],
      quiz: {
        scenario: 'Как Анне «укусить» ситуацию, сохранив отношения?',
        choices: [
          { text: '«Календарь зевнёт — подчиним повестку и сдвинем таймслоты.»', isCorrect: true, onCorrect: 'Адресовано «календарю». Призыв к действию, а не к стыду.', onWrong: '' },
          { text: '«Вы неорганизованные.»', isCorrect: false, onWrong: 'Обвинение группы — ступор и сопротивление.' },
          { text: '«Мария, тебя никогда не дождёшься.»', isCorrect: false, onWrong: 'Личная шпилька — обида и эскалация.' },
        ],
      },
    },
    {
      id: 'notifications',
      title: 'Почта и уведомления',
      summary: 'Пинаем инбокс, а не коллег.',
      content: ['Мария тегнула Илью, письмо утонуло. Нужно оживить тред без стыда.'],
      quiz: {
        scenario: 'Что скажет Мария, если захочет быть хулиганской, но не токсичной?',
        choices: [
          { text: '«Инбокс задремал — пну его упоминанием. Илья, глянешь?»', isCorrect: true, onCorrect: 'Шутка к инбоксу и мягкий призыв к действию.', onWrong: '' },
          { text: '«Илья, ты вечно ничего не читаешь.»', isCorrect: false, onWrong: 'Клеймо на привычке породит оборону и спор.' },
          { text: '«Ты выглядишь соответствующе.»', isCorrect: false, onWrong: 'Оскорбление внешности — табу.' },
        ],
      },
    },
    {
      id: 'meetings',
      title: 'Переговорки и оборудование',
      summary: 'Проблема — в железе, не в людях.',
      content: ['Мария презентует макет, Илья подключился с кухни, спикерфон шумит.'],
      quiz: {
        scenario: 'Мария хочет пошутить, не обидев Илью. Какую фразу выбрать?',
        choices: [
          { text: '«Спикерфон писклявит — уводим голос в чат и продолжаем.»', isCorrect: true, onCorrect: 'Девайс виноват, люди сохранены. Продолжаем без паузы.', onWrong: '' },
          { text: '«Илья, учись говорить нормально.»', isCorrect: false, onWrong: 'Личный укол — ломает темп и доверие.' },
          { text: '«Шутка про внешность»', isCorrect: false, onWrong: 'Неуместно и рискованно.' },
        ],
      },
    },
    {
      id: 'devops',
      title: 'IT-атрибуты',
      summary: 'Кусайте пайплайн, а не коллег.',
      content: ['Ночной билд пал. Анна пишет Илье и Паше в чат.'],
      quiz: {
        scenario: 'Анна хочет бодро пнуть систему. Что напишет?',
        choices: [
          { text: '«Кэш отсырел — проветрим CI, ребилд — и в прод.»', isCorrect: true, onCorrect: 'Адресовано системе и сразу предлагается план.', onWrong: '' },
          { text: '«Кто-то опять всё сломал.»', isCorrect: false, onWrong: 'Охота на ведьм — минус скорость и плюс обиды.' },
          { text: '«У некоторых так всегда.»', isCorrect: false, onWrong: 'Обобщение на людей — токсично и бесполезно.' },
        ],
      },
    },
    {
      id: 'security',
      title: 'Безопасность и комплаенс',
      summary: 'Жалуемся на регламенты, а не на коллег.',
      content: ['Проверка застряла на аудитах. Кирилл пишет Анне и Олегу.'],
      quiz: {
        scenario: 'Как Кирилл может «уколоть» процесс, не задевая людей?',
        choices: [
          { text: '«Замок паролей заржавел — смажем требованиями и пойдём дальше.»', isCorrect: true, onCorrect: 'Процесс — объект шутки. Дальше — шаги.', onWrong: '' },
          { text: '«Аудитор ничего не понимает.»', isCorrect: false, onWrong: 'Личный укол обернётся встречным сопротивлением.' },
          { text: '«Религиозная подначка.»', isCorrect: false, onWrong: 'Запрещённая тема для работы.' },
        ],
      },
    },
    {
      id: 'finance',
      title: 'Финансы и отчётность',
      summary: 'Говорим о цифрах, а не о людях.',
      content: ['Финансовый отчёт просел, продакт Анна обсуждает с финансистом Олей и маркетологом Марией.'],
      quiz: {
        scenario: 'Анна язвит, но ведёт к делу. Какой вариант годится?',
        choices: [
          { text: '«Бюджет хлюпает — подсушим срезом затрат и планом продаж.»', isCorrect: true, onCorrect: 'Фокус на бюджете и действии, не на людях.', onWrong: '' },
          { text: '«Оля, ну ты и устроила.»', isCorrect: false, onWrong: 'Личное обвинение — плохая идея для командной работы.' },
          { text: '«Шутка про пол.»', isCorrect: false, onWrong: 'Нарушение этики и здравого смысла.' },
        ],
      },
    },

    // Итог
    {
      id: 'final',
      title: 'Итоговый экзамен',
      summary: 'Собери всё вместе и ответь на 10 вопросов.',
      exam: true,
    },
    // Новые уроки
    {
      id: 'stationery',
      title: 'Канцелярия и мелочи',
      summary: 'Шутим на тему расходников.',
      content: ['Илья ищет маркер, Мария рисует схему, Анна ждёт.'],
      quiz: {
        scenario: 'Маркер еле пишет, времени нет. Что скажет Анна?',
        choices: [
          { text: '«Маркер плавится — охладим закупкой и погнали.»', isCorrect: true, onCorrect: 'Шпилька к предмету + решение заказать.', onWrong: '' },
          { text: '«Вы безрукие, что ли?»', isCorrect: false, onWrong: 'Удар по людям — конфликт и пауза в деле.' },
          { text: '«Отсылка к происхождению.»', isCorrect: false, onWrong: 'Недопустимо и не относится к делу.' },
        ],
      },
    },
    {
      id: 'backoffice',
      title: 'Бэкофис артефакты',
      summary: 'Пинаем бумагу, двигаем процесс.',
      content: ['Оля вернула счёт на доработку, Кирилл кипит, Анна предлагает план.'],
      quiz: {
        scenario: 'Как Кирилл язвительно, но конструктивно отреагирует?',
        choices: [
          { text: '«Счёт склеился — распарим чеклистом и отправим снова.»', isCorrect: true, onCorrect: 'Шутка к документу и шаги по исправлению.', onWrong: '' },
          { text: '«Оля тормозит.»', isCorrect: false, onWrong: 'Личный укол ломает взаимодействие отделов.' },
          { text: '«Возрастной намёк.»', isCorrect: false, onWrong: 'Дискриминация — не шутка.' },
        ],
      },
    },
    {
      id: 'generator',
      title: 'Генератор выражений',
      summary: 'Собери свою «уколку».',
      content: ['Соберите фразу из блоков и скопируйте для чата. Держите тон дружелюбным.'],
      quiz: {
        scenario: 'Вы собираете «мягкую шпильку» для коллеги, с кем есть взаимное доверие. Какой принцип соблюдаете?',
        choices: [
          { text: 'Бить по предметам/процессам', isCorrect: true, onCorrect: 'Ирония адресована объектам и процессам, не людям.', onWrong: '' },
          { text: 'Бить по людям', isCorrect: false, onWrong: 'Персональные уколы ломают культуру и не лечат проблему.' },
          { text: 'Бить по признакам', isCorrect: false, onWrong: 'Дискриминация — вне правил и закона.' },
        ],
      },
    },
  ];

  const state = {
    progress: { completed: {}, exam: { score: 0, done: false } },
    currentId: 'intro',
  };

  const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
  const load = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) Object.assign(state, JSON.parse(raw));
    } catch {}
  };

  const setTheme = (mode) => {
    const root = document.documentElement;
    if (mode === 'light') root.classList.add('light');
    else root.classList.remove('light');
    localStorage.setItem(themeKey, mode);
  };

  const toggleTheme = () => {
    const isLight = document.documentElement.classList.toggle('light');
    localStorage.setItem(themeKey, isLight ? 'light' : 'dark');
  };

  function computeProgressPct() {
    const lessonCount = lessons.filter(l => !l.exam).length;
    const doneCount = Object.values(state.progress.completed).filter(Boolean).length;
    const pct = Math.min(100, Math.round((doneCount / lessonCount) * 100));
    return isNaN(pct) ? 0 : pct;
  }

  function renderNav() {
    const nav = qs('#navList');
    nav.innerHTML = '';
    const ordered = [...lessons].sort((a,b)=>{
      if (a.exam && !b.exam) return 1;
      if (!a.exam && b.exam) return -1;
      return 0;
    });
    for (const l of ordered) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${l.id}`;
      a.textContent = l.title + (l.exam ? ' 🎓' : '');
      if (state.currentId === l.id) a.classList.add('active');
      li.appendChild(a);
      nav.appendChild(li);
    }
  }

  function setProgressUI() {
    const pct = computeProgressPct();
    const bar = qs('#progressBar');
    const text = qs('#progressText');
    if (bar) bar.style.width = pct + '%';
    if (text) text.textContent = `${pct}% пройдено`;
  }

  function renderHome() {
    const view = qs('#view');
    view.innerHTML = `
      <div class="card hero">
        <h2>Корпоративный лексикон</h2>
        <p class="muted">Сатирический курс о том, как выпускать пар корректно и безопасно.</p>
        <div class="inline-list">
          <span class="badge">12 уроков</span>
          <span class="badge">Итоговый экзамен</span>
          <span class="badge">Сохранение прогресса</span>
        </div>
        <div class="hero-cta">
          <a class="btn primary" href="#intro">Начать</a>
          <button class="btn" id="continueBtn">Продолжить</button>
        </div>
      </div>

      <div class="course-grid" id="coursesGrid"></div>
    `;
    const nextId = nextUnfinishedLessonId();
    const btn = qs('#continueBtn');
    btn.onclick = () => { location.hash = `#${nextId}`; };

    const grid = qs('#coursesGrid');
    const items = lessons.filter(l => !l.exam).slice(0, 9);
    grid.innerHTML = items.map((l, idx) => {
      const svg = courseCoverSvg(idx);
      const img = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      return `
        <a class="course-card" href="#${l.id}">
          <img class="course-img" src="${img}" alt="Обложка: ${l.title}">
          <div class="course-body">
            <h3 class="course-title">${l.title}</h3>
            <p class="course-summary">${l.summary || ''}</p>
          </div>
        </a>
      `;
    }).join('');
  }

  function nextUnfinishedLessonId() {
    const regular = lessons.filter(l => !l.exam);
    for (const l of regular) {
      if (!state.progress.completed[l.id]) return l.id;
    }
    return 'final';
  }

  function renderLesson(lesson) {
    const view = qs('#view');
    const done = !!state.progress.completed[lesson.id];
    const contentHtml = (lesson.content || []).map(p => `<p>${p}</p>`).join('');
    const quiz = lesson.quiz;
    const extra = lesson.id === 'generator' ? generatorHtml() : '';
    view.innerHTML = `
      <article class="card">
        <h2 class="lesson-title">${lesson.title}</h2>
        <p class="muted">${lesson.summary || ''}</p>
        <div class="grid">${contentHtml}${extra}</div>
        ${quiz ? renderQuizHtml(lesson) : ''}
        <div class="inline-list" style="margin-top:12px;align-items:center;justify-content:space-between">
          <div>${done ? '<span class=\"badge\">Урок пройден</span>' : ''}</div>
          <a class="btn primary" href="#${nextUnfinishedLessonId()}">Далее</a>
        </div>
        <p class="muted" style="font-size:12px;margin-top:8px">Конечно же, вы никогда так не делайте.</p>
      </article>
    `;
    if (lesson.id === 'generator') bindGenerator();
    if (quiz) bindQuizHandlers(lesson);
  }

  function generatorHtml() {
    return `
      <div class="card">
        <h3>Соберите фразу</h3>
        <div class="grid cols-2">
          <div>
            <label class="muted">Старт</label>
            <select id="gStart" class="btn" style="width:100%">
              <option>Ты</option>
              <option>Этот</option>
              <option>Ваш</option>
            </select>
          </div>
          <div>
            <label class="muted">Интенсивность</label>
            <select id="gInt" class="btn" style="width:100%">
              <option>сраный</option>
              <option>вонючий</option>
              <option>кособокий</option>
              <option>подгоревший</option>
            </select>
          </div>
          <div>
            <label class="muted">Объект</label>
            <select id="gObj" class="btn" style="width:100%">
              <option>окорок</option>
              <option>картридж для принтера</option>
              <option>пайплайн релиза</option>
              <option>скрепка согласований</option>
              <option>диаграмма Ганта</option>
            </select>
          </div>
          <div>
            <label class="muted">Хвост</label>
            <select id="gTail" class="btn" style="width:100%">
              <option>с KPI на боку</option>
              <option>из запаха дедлайна</option>
              <option>с заусенцами регламента</option>
              <option>с привкусом бэклога</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button id="gMake" class="btn primary">Сгенерировать</button>
          <button id="gCopy" class="btn">Скопировать</button>
        </div>
        <p id="gOut" class="muted"></p>
      </div>
    `;
  }

  function bindGenerator() {
    const out = qs('#gOut');
    const make = () => {
      const s = qs('#gStart').value;
      const i = qs('#gInt').value;
      const o = qs('#gObj').value;
      const t = qs('#gTail').value;
      out.textContent = `${s} ${i} ${o} ${t}!`;
    };
    qs('#gMake').onclick = make;
    qs('#gCopy').onclick = async () => {
      if (!out.textContent) make();
      try { await navigator.clipboard.writeText(out.textContent); } catch {}
    };
  }

  function renderQuizHtml(lesson) {
    const q = lesson.quiz;
    if (Array.isArray(q.choices) && typeof q.choices[0] === 'string') {
      const choicesLegacy = q.choices.map((c, i) => `<div class="choice" data-i="${i}" role="button" tabindex="0">${c}</div>`).join('');
      return `
        <div class="quiz">
          <h3>Проверка</h3>
          <p>${q.question || ''}</p>
          <div class="choices">${choicesLegacy}</div>
          <div class="muted" id="feedback"></div>
        </div>
      `;
    }

    const choices = q.choices.map((c, i) => `<div class="choice" data-i="${i}" role="button" tabindex="0">${c.text}</div>`).join('');
    return `
      <div class="quiz">
        <h3>Ситуация</h3>
        <p>${q.scenario}</p>
        <div class="choices">${choices}</div>
        <div class="muted feedback" id="feedback"></div>
      </div>
    `;
  }

  function bindQuizHandlers(lesson) {
    const nodes = qsa('.choice');
    const q = lesson.quiz;
    const feedback = qs('#feedback');
    const legacy = Array.isArray(q.choices) && typeof q.choices[0] === 'string';
    const correctIdx = legacy ? q.correctIndex : q.choices.findIndex(c => c.isCorrect);

    const onPick = (el) => {
      const i = Number(el.dataset.i);
      nodes.forEach(n => n.classList.remove('correct', 'wrong'));
      const isCorrect = i === correctIdx;
      if (isCorrect) {
        el.classList.add('correct');
        state.progress.completed[lesson.id] = true;
        save();
        setProgressUI();
        const text = !legacy ? (q.choices[i].onCorrect || 'Верно!') : 'Верно!';
        feedback.classList.remove('no');
        feedback.classList.add('ok');
        feedback.textContent = `✅ ${text}`;
      } else {
        el.classList.add('wrong');
        const text = !legacy ? (q.choices[i].onWrong || 'Неверно.') : 'Неверно.';
        feedback.classList.remove('ok');
        feedback.classList.add('no');
        feedback.textContent = `❌ ${text}`;
      }
    };

    nodes.forEach(n => {
      n.addEventListener('click', () => onPick(n));
      n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') onPick(n); });
    });
  }

  function renderExam() {
    const pool = lessons.filter(l => !l.exam && l.quiz).map(l => ({ lessonId: l.id, quiz: l.quiz }));
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 10);
    const view = qs('#view');
    view.innerHTML = `
      <article class="card">
        <h2 class="lesson-title">Итоговый экзамен</h2>
        <p class="muted">Ответь на 10 вопросов. Нужно 7/10 для зачёта.</p>
        <div id="examList" class="grid"></div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn primary" id="finishExam">Завершить</button>
          <button class="btn" id="retryExam">Пересдать</button>
        </div>
      </article>
    `;
    const list = qs('#examList');
    list.innerHTML = '';
    shuffled.forEach((item, idx) => {
      const q = item.quiz;
      const legacy = Array.isArray(q.choices) && typeof q.choices[0] === 'string';
      const wrap = document.createElement('div');
      wrap.className = 'card';
      const prompt = legacy ? (q.question || 'Выберите лучший вариант') : q.scenario;
      const choices = legacy ? q.choices : q.choices.map(c => c.text);
      wrap.innerHTML = `
        <div class="quiz">
          <p><strong>Вопрос ${idx + 1}.</strong> ${prompt}</p>
          <div class="choices">
            ${choices.map((c, i) => `<label class="choice"><input type="radio" name="q${idx}" value="${i}"> ${c}</label>`).join('')}
          </div>
        </div>
      `;
      list.appendChild(wrap);
    });

    qs('#finishExam').onclick = () => {
      const answers = shuffled.map((item, idx) => {
        const checked = qs(`input[name="q${idx}"]:checked`);
        return Number(checked?.value);
      });
      const score = answers.reduce((acc, v, i) => {
        const q = shuffled[i].quiz;
        const legacy = Array.isArray(q.choices) && typeof q.choices[0] === 'string';
        const correctIdx = legacy ? q.correctIndex : q.choices.findIndex(c => c.isCorrect);
        return acc + (v === correctIdx ? 1 : 0);
      }, 0);
      state.progress.exam = { score, done: true };
      save();
      renderCompletion();
    };
    qs('#retryExam').onclick = () => renderExam();
  }

  function renderCompletion() {
    const { score } = state.progress.exam;
    const passed = score >= 7;
    const view = qs('#view');
    view.innerHTML = `
      <article class="card">
        <h2>Курс завершён ${passed ? '✅' : '❌'}</h2>
        <p class="muted">Результат экзамена: ${score}/10.</p>
        ${passed ? `<p>Поздравляем! Теперь вы умеете шутить остро, но безопасно — направляя сарказм на процессы и артефакты, не на людей.</p>` : '<p>Не страшно. Пересдайте экзамен или повторите уроки.</p>'}
        <div class="inline-list">
          <button class="btn primary" id="shareBtn">Поделиться бейджем</button>
          <a class="btn" href="#intro">К урокам</a>
        </div>
      </article>
    `;
    qs('#shareBtn').onclick = async () => {
      const text = `Я прошёл курс «Корпоративный лексикон»: ${score}/10!`;
      try {
        await navigator.share?.({ text });
      } catch {}
      try {
        await navigator.clipboard.writeText(text);
        alert('Текст скопирован.');
      } catch {}
    };
  }

  function router() {
    const hash = location.hash.replace('#', '');
    const id = hash || '';
    state.currentId = id || 'home';
    renderNav();
    setProgressUI();
    const loader = qs('#loader');
    const view = qs('#view');
    if (loader) loader.hidden = true;
    if (view) view.hidden = false;

    if (!id || id === 'home') return renderHome();
    const lesson = lessons.find(l => l.id === id);
    if (!lesson) return renderHome();
    if (lesson.exam) return renderExam();
    renderLesson(lesson);
  }

  function initUI() {
    qs('#menuBtn').onclick = () => qs('#sidebar').classList.toggle('open');
    qs('#themeToggle').onclick = toggleTheme;
    const savedTheme = localStorage.getItem(themeKey);
    if (savedTheme) setTheme(savedTheme);

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) {
        e.preventDefault();
        const id = href.slice(1);
        if (location.hash.slice(1) !== id) location.hash = `#${id}`; else router();
      }
    });
  }

  load();
  initUI();
  window.addEventListener('hashchange', router);
  window.addEventListener('load', router);

  function courseCoverSvg(seed){
    const palettes = [
      ['#0ea5e9','#22c55e','#a78bfa'],
      ['#f59e0b','#10b981','#3b82f6'],
      ['#ef4444','#06b6d4','#84cc16']
    ];
    const p = palettes[seed % palettes.length];
    return `<?xml version="1.0" encoding="UTF-8"?>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${p[0]}"/>
          <stop offset="100%" stop-color="${p[1]}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#g)"/>
      <circle cx="220" cy="160" r="140" fill="${p[2]}" opacity="0.35"/>
      <circle cx="980" cy="520" r="180" fill="${p[2]}" opacity="0.25"/>
      <text x="60" y="620" fill="rgba(255,255,255,.9)" font-family="-apple-system,Helvetica,Arial" font-size="54" font-weight="700">Курс</text>
    </svg>`;
  }
})();


