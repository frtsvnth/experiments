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
        'Этот курс — сатирический. Цель — разрядить напряжение без перехода на личности.',
        'Избегайте упоминаний людей и групп. Используйте предметы/явления: канцелярия, техника, абстракции.',
        'Правило: «Жёстко по проблеме — мягко к людям».',
      ],
      quiz: {
        scenario: 'Вы ведёте планёрку, сроки горят, у команды нервное напряжение. Нужно «выпустить пар», не укусив никого лично. Какую формулировку выбрать?',
        choices: [
          { text: '«Ты опять всё завалил»', isCorrect: false, onWrong: 'Это персональное обвинение — увеличит напряжение и недоверие в команде.' },
          { text: '«У нас подгоревший дедлайн, давайте остудим его планом»', isCorrect: true, onCorrect: 'Фокус на процессе («дедлайн»), не на людях. Даёт энергию на действие.', onWrong: '' },
          { text: '«Ну ты и… (личный признак)»', isCorrect: false, onWrong: 'Запрещённая зона: дискриминация разрушает психологическую безопасность.' },
        ],
      },
    },

    // 11 тематических уроков с предметными «оскорбительными» конструкциями
    {
      id: 'food-metaphors',
      title: 'Съедобные метафоры',
      summary: 'Как безопасно «раскритиковать» через еду.',
      content: [
        'Примеры: «Ты заплутавший чизкейк», «подгоревшая булочка», «пересоленный супчик KPI», «зажёванный багет отчёта».',
        'Фокус — абсурдность и несостыковка контекста.',
      ],
      quiz: {
        scenario: 'На демо макет развалился в последний момент. Надо выразить раздражение, не задев дизайнера.',
        choices: [
          { text: '«Ты сраный окорок!»', isCorrect: true, onCorrect: 'Абсурдная пищевая метафора смешит и выпускает пар — без личной критики навыков.', onWrong: '' },
          { text: '«Ты ничтожество!»', isCorrect: false, onWrong: 'Прямая личная агрессия рушит доверие и нарушает этику.' },
          { text: '«Твои гены виноваты»', isCorrect: false, onWrong: 'Запрещённый личностный/биологический заход. Риск жалоб и токсичности.' },
        ],
      },
    },
    {
      id: 'office-gear',
      title: 'Офисная техника и расходники',
      summary: 'Принтеры, картриджи и кабели как образные якоря.',
      content: [
        'Примеры: «вонючий картридж для принтера», «косой степлер», «заедающая скрепка», «залипшая мышь дедлайна», «припухший удлинитель согласований».',
      ],
      quiz: {
        scenario: 'Стендап затянулся, и конфкол зависает из-за кабеля. Нужно разрядить обстановку.',
        choices: [
          { text: '«Этот вонючий картридж снова сосёт внимание»', isCorrect: true, onCorrect: 'Объект агрессии — техника. Команда смеётся, никто не обижен.', onWrong: '' },
          { text: '«Опять ты все тормозишь»', isCorrect: false, onWrong: 'Личное обвинение усилит стресс у коллеги на связи.' },
          { text: '«Нормальных людей на проект не набрали»', isCorrect: false, onWrong: 'Удар по людям и команде в целом — токсично и непродуктивно.' },
        ],
      },
    },
    {
      id: 'abstracts',
      title: 'Абстракции и процессы',
      summary: 'Объективация проблем: регламенты, флоу, дедлайны.',
      content: [
        'Примеры: «хромающая диаграмма Ганта», «растрёпанный дедлайн», «свернувшийся регламент», «простуженный флоу отгрузки», «скрипучий процесс онбординга».',
      ],
      quiz: {
        scenario: 'План проекта пополз, задачи плавают между спринтами. Нужно обозначить проблему без персонализации.',
        choices: [
          { text: '«У нас хромающая диаграмма Ганта — подлечим планом»', isCorrect: true, onCorrect: 'Фокус на инструменте и процессе. Создаёт настрой на исправление.', onWrong: '' },
          { text: '«Команда ленивая»', isCorrect: false, onWrong: 'Наклеивает ярлык — демотивирует и не даёт решений.' },
          { text: '«Ты тупой»', isCorrect: false, onWrong: 'Ад хейта. Чувство безопасности исчезает.' },
        ],
      },
    },
    {
      id: 'transport',
      title: 'Транспорт и логистика',
      summary: 'Образы из перевозок и складов.',
      content: [
        'Примеры: «кособокий погрузчик», «просевший график отгрузок», «плавающий маршрут», «скособоченный паллет KPI», «хандрящий маршрут экспорта».',
      ],
      quiz: {
        scenario: 'Сроки поставок посыпались, партнёры задерживают груз. Нужно «уколоть» ситуацию, а не людей.',
        choices: [
          { text: '«Просевший график отгрузок — поддомкратим буфером»', isCorrect: true, onCorrect: 'Сарказм к графику и решение в виде буфера — безопасно и конструктивно.', onWrong: '' },
          { text: '«Люди в складе тупят»', isCorrect: false, onWrong: 'Снимает фокус с процесса на личности и разрушает сотрудничество.' },
          { text: '«У тебя акцент — вот и тормозишь»', isCorrect: false, onWrong: 'Дискриминационный выпад. Недопустимо.' },
        ],
      },
    },
    {
      id: 'calendar',
      title: 'Календарь и встречи',
      summary: 'Ирония над планёрками и слотами.',
      content: [
        'Примеры: «мятый таймслот», «скользкая повестка», «зевота календаря», «заикающийся слот синка», «свалившийся слот ретроспективы».',
      ],
      quiz: {
        scenario: 'Встречи накладываются, никто не пришёл вовремя. Нужно высказать недовольство, не обвиняя людей напрямую.',
        choices: [
          { text: '«Календарь зевнёт — мы правим повестку»', isCorrect: true, onCorrect: 'Оживляете «календарь» как объект проблемы. Никого не стыдите.', onWrong: '' },
          { text: '«Вы неорганизованные»', isCorrect: false, onWrong: 'Обвинение группы — мгновенный спад лояльности.' },
          { text: '«Некоторые возрастом уже…»', isCorrect: false, onWrong: 'Эйджизм запрещён. Рискуете репутацией и HR кейсом.' },
        ],
      },
    },
    {
      id: 'notifications',
      title: 'Почта и уведомления',
      summary: 'Пассивная агрессия — но к письмам, не к людям.',
      content: ['«Кликающий спам-фильтр», «сонный инбокс», «потный пуш», «задыхающаяся рассылка», «простывший SMTP».'],
      quiz: {
        scenario: 'Письмо с важной задачей утонуло в инбоксе. Нужно подколоть ситуацию без стыда адресата.',
        choices: [
          { text: '«Инбокс задремал, пни его упоминанием в треде»', isCorrect: true, onCorrect: 'Фокус на ящике. Даёт практическое решение — упоминание, а не упрёк.', onWrong: '' },
          { text: '«Ты вечно ничего не читаешь»', isCorrect: false, onWrong: 'Клеймение привычек — конфликт и оборона вместо решения.' },
          { text: '«Твоя внешность говорит сама за себя»', isCorrect: false, onWrong: 'Оскорбление внешности — табу.' },
        ],
      },
    },
    {
      id: 'meetings',
      title: 'Переговорки и оборудование',
      summary: 'Проектор виноват — и это удобно.',
      content: ['«Захлёбывающийся проектор», «писклявый спикерфон», «неровная флипчарт-нога», «хрипящий HDMI», «зализанный маркер».'],
      quiz: {
        scenario: 'Во время питча звук заикается. Нужно разрядить неловкость и продолжить.',
        choices: [
          { text: '«Спикерфон писклявит — перекатим на чат»', isCorrect: true, onCorrect: 'Виноват девайс, а вы предложили обходной путь. Все сохранены.', onWrong: '' },
          { text: '«Ораторам надо учиться говорить»', isCorrect: false, onWrong: 'Нападки на людей ломают доверие и сбивают темп.' },
          { text: '«Шутка про пол/внешность»', isCorrect: false, onWrong: 'Сексистские намёки — прямое нарушение корпоративной этики.' },
        ],
      },
    },
    {
      id: 'devops',
      title: 'IT-атрибуты',
      summary: 'Сервера, билды, кэши — золото сатиры.',
      content: ['«Залипающий пайплайн», «плесневелый кэш», «рассыпающийся релиз», «подгоревший контейнер», «зудящий веб-сокет».'],
      quiz: {
        scenario: 'Ночной билд упал из-за кэша, команда не спала. Нужно «укусить» систему и мотивировать на фиксы.',
        choices: [
          { text: '«Кэш отсырел — проветрим CI и пересоберём»', isCorrect: true, onCorrect: 'Метафора кэша с планом действия. Никого не вините лично.', onWrong: '' },
          { text: '«Кто-то опять всё сломал»', isCorrect: false, onWrong: 'Размытое обвинение — разводит охоту на ведьм.' },
          { text: '«У людей из той страны так всегда»', isCorrect: false, onWrong: 'Ксенофобия недопустима и опасна юридически.' },
        ],
      },
    },
    {
      id: 'security',
      title: 'Безопасность и комплаенс',
      summary: 'Сарказм к политикам, не к людям.',
      content: ['«Засыпающий аудит», «ржавый парольный замок», «плавающий регламент», «чихающий SOC», «сонный SIEM».'],
      quiz: {
        scenario: 'Аудит затянул релиз. Нужно «уколоть» процесс и сдвинуться дальше.',
        choices: [
          { text: '«Парольный замок проржавел — смазываем требованиями»', isCorrect: true, onCorrect: 'Объект — замок/процесс. Задаёте план действий без персонализации.', onWrong: '' },
          { text: '«Аудитор ничего не понимает»', isCorrect: false, onWrong: 'Личное обесценивание создаёт конфликт и задержки.' },
          { text: '«Религиозная подначка»', isCorrect: false, onWrong: 'Религиозные отсылки в работе — табу.' },
        ],
      },
    },
    {
      id: 'finance',
      title: 'Финансы и отчётность',
      summary: 'Относись строго к цифрам, а не к людям.',
      content: ['«Хлюпающий бюджет», «растрёпанные проводки», «заедающий отчёт», «застенчивый кэшфлоу», «мятый прогноз».'],
      quiz: {
        scenario: 'Бюджет квартала не сошёлся. Хотите показать недовольство и направить всех к фактам.',
        choices: [
          { text: '«Бюджет хлюпает — подсушим срезом затрат»', isCorrect: true, onCorrect: 'Критика адресована цифрам, а не людям. Есть предложенное действие.', onWrong: '' },
          { text: '«Финансист лузер»', isCorrect: false, onWrong: 'Персональная атака — убьёт открытость и качество данных.' },
          { text: '«Шутка про пол»', isCorrect: false, onWrong: 'Сексистская метафора: HR-инцидент вместо решения.' },
        ],
      },
    },
    {
      id: 'hr',
      title: 'HR и документы',
      summary: 'Пусть бумага виновата.',
      content: ['«Сморщенная анкета», «зудящий бланк», «скрипучий лифтинг оклада», «притворяющийся декрет чекбокс», «шепелявый оффер».'],
      quiz: {
        scenario: 'Оффер застрял в согласованиях. Нужно выпустить пар и сдвинуть процесс.',
        choices: [
          { text: '«Бланк зудит — почешем регламент коротким маршрутом»', isCorrect: true, onCorrect: 'Объект — документ. Ирония + конкретное действие по ускорению.', onWrong: '' },
          { text: '«HR некомпетентные»', isCorrect: false, onWrong: 'Обобщающее обвинение ломает кооперацию и не ускоряет процесс.' },
          { text: '«Этническая отсылка»', isCorrect: false, onWrong: 'Недопустимая дискриминация — провал культуры.' },
        ],
      },
    },
    {
      id: 'marketing',
      title: 'Маркетинг и контент',
      summary: 'Обижай макеты, а не людей.',
      content: ['«Пиксельная баннерная каша», «дрожащий калл-ту-экшен», «жадный UTM», «потеющий лендинг», «кашляющий ретаргет».'],
      quiz: {
        scenario: 'AB‑тест показал падение конверсии на новом баннере. Нужно пошутить и дать вектор на правку.',
        choices: [
          { text: '«CTA дрожит — согреем контрастом и текстом»', isCorrect: true, onCorrect: 'Метафора к элементу интерфейса + план исправления — безопасно.', onWrong: '' },
          { text: '«Маркетолог не умеет»', isCorrect: false, onWrong: 'Обесценивание специалиста — минус знания и мотивация.' },
          { text: '«Возрастная шпилька»', isCorrect: false, onWrong: 'Эйджизм: токсично и неэтично.' },
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
      summary: 'Бей скрепки, щади коллег.',
      content: ['«Грызущая линейка», «жаждущий степлер», «плавящийся маркер», «кислая бумажка для заметок».'],
      quiz: {
        scenario: 'В комнате закончились маркеры, диаграмму не нарисовать. Нужна ирония без упрёков.',
        choices: [
          { text: '«Маркер плавится — охладим закупкой»', isCorrect: true, onCorrect: 'Шутка на предмет и конкретное действие — заказать расходники.', onWrong: '' },
          { text: '«Вы безрукие»', isCorrect: false, onWrong: 'Удар по людям не ускорит поставку.' },
          { text: '«Отсылка к происхождению»', isCorrect: false, onWrong: 'Недопустимо и не относится к делу.' },
        ],
      },
    },
    {
      id: 'backoffice',
      title: 'Бэкофис артефакты',
      summary: 'Пусть формы виноваты.',
      content: ['«Скользкий акт сверки», «шуршащая заявка», «летающая накладная», «склеенный счёт».'],
      quiz: {
        scenario: 'Счёт снова вернулся на доработку. Нужно «уколоть» бумагу и двинуться дальше.',
        choices: [
          { text: '«Счёт склеился — распарим чеклистом»', isCorrect: true, onCorrect: 'Сарказм к документу + решение: пройтись чеклистом.', onWrong: '' },
          { text: '«Бухгалтер тормозит»', isCorrect: false, onWrong: 'Персональное обвинение ухудшит взаимодействие отделов.' },
          { text: '«Возрастной намёк»', isCorrect: false, onWrong: 'Дискриминация не шутка, а риск.' },
        ],
      },
    },
    {
      id: 'generator',
      title: 'Генератор выражений',
      summary: 'Собери свою безопасную «уколку».',
      content: ['Соберите фразу из блоков и скопируйте для чата. Держите тон дружелюбным.'],
      quiz: {
        scenario: 'Вы собираете «мягкую шпильку» в чате. Какой принцип соблюдаете?',
        choices: [
          { text: 'Бить по предметам/процессам', isCorrect: true, onCorrect: 'Именно так: ирония адресована объектам и процессам, не людям.', onWrong: '' },
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
    for (const l of lessons) {
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
    qs('#progressBar').style.width = pct + '%';
    qs('#progressText').textContent = `${pct}% пройдено`;
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

    // Рендер карточек курсов с изображениями (SVG data URI)
    const grid = qs('#coursesGrid');
    const items = lessons.filter(l => !l.exam).slice(0, 9); // ограничим список
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
        <div style="margin-top:12px;display:flex;gap:8px">
          ${done ? '<span class="badge">Урок пройден</span>' : ''}
          <a class="btn" href="#${nextUnfinishedLessonId()}">Далее</a>
        </div>
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
    // поддержка старого формата на всякий случай
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
    // соберём 10 вопросов из уроков, адаптированных к новой модели
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
        ${passed ? `<p>Поздравляем! Теперь вы умеете безопасно использовать корпоративные «уколы» вроде «Ты сраный окорок!» и «Вонючий картридж для принтера!» — направляя сарказм на предметы и процессы, а не на людей.</p>` : '<p>Не страшно. Пересдайте экзамен или повторите уроки.</p>'}
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
    loader.hidden = true;
    view.hidden = false;

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

    // Улучшение навигации SPA для GitHub Pages: делегируем клики по ссылкам '#'
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

  // boot
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


