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
        question: 'Что из ниже безопаснее всего для офиса?',
        choices: [
          'Оценивать людей по личным признакам',
          'Использовать предметные метафоры (принтер, степлер)',
          'Упоминать происхождение коллег',
        ],
        correctIndex: 1,
      },
    },

    // 11 тематических уроков с предметными «оскорбительными» конструкциями
    {
      id: 'food-metaphors',
      title: 'Съедобные метафоры',
      summary: 'Как безопасно «раскритиковать» через еду.',
      content: [
        'Примеры: «Ты заплутавший чизкейк», «сраный окорок», «подгоревшая булочка», «пересоленный супчик KPI», «зажёванный багет отчёта».',
        'Фокус — абсурдность и несостыковка контекста.',
      ],
      quiz: {
        question: 'Какая фраза вписывается в подход?',
        choices: [
          'Ты сраный окорок!',
          'Ты ничтожество!',
          'Ты… (личный признак)…',
        ],
        correctIndex: 0,
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
        question: 'Что из этого соответствует корпоративной сатире?',
        choices: [
          'Вонючий картридж для принтера!',
          'Упоминание семейных обстоятельств',
          'Отсылка к внешности коллеги',
        ],
        correctIndex: 0,
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
        question: 'Какое выражение предметно критикует процесс?',
        choices: [
          'Хромающая диаграмма Ганта',
          'Ты тупой',
          'Твоя семья…',
        ],
        correctIndex: 0,
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
        question: 'Что подходит корпоративной иронии?',
        choices: ['Просевший график отгрузок', 'Оскорбление личности', 'Упоминание акцента'],
        correctIndex: 0,
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
        question: 'Безопасная конструкция:',
        choices: ['Мятый таймслот', 'Личное оскорбление', 'Стереотип'],
        correctIndex: 0,
      },
    },
    {
      id: 'notifications',
      title: 'Почта и уведомления',
      summary: 'Пассивная агрессия — но к письмам, не к людям.',
      content: ['«Кликающий спам-фильтр», «сонный инбокс», «потный пуш», «задыхающаяся рассылка», «простывший SMTP».'],
      quiz: {
        question: 'Что безопаснее?',
        choices: ['Сонный инбокс', 'Оскорбление внешности', 'Происхождение коллеги'],
        correctIndex: 0,
      },
    },
    {
      id: 'meetings',
      title: 'Переговорки и оборудование',
      summary: 'Проектор виноват — и это удобно.',
      content: ['«Захлёбывающийся проектор», «писклявый спикерфон», «неровная флипчарт-нога», «хрипящий HDMI», «зализанный маркер».'],
      quiz: {
        question: 'Выбери подходящее:',
        choices: ['Писклявый спикерфон', 'Оскорбление личности', 'Сексистская шутка'],
        correctIndex: 0,
      },
    },
    {
      id: 'devops',
      title: 'IT-атрибуты',
      summary: 'Сервера, билды, кэши — золото сатиры.',
      content: ['«Залипающий пайплайн», «плесневелый кэш», «рассыпающийся релиз», «подгоревший контейнер», «зудящий веб-сокет».'],
      quiz: {
        question: 'Корпоративная метафора:',
        choices: ['Плесневелый кэш', 'Оскорбление сотрудника', 'Национальный стереотип'],
        correctIndex: 0,
      },
    },
    {
      id: 'security',
      title: 'Безопасность и комплаенс',
      summary: 'Сарказм к политикам, не к людям.',
      content: ['«Засыпающий аудит», «ржавый парольный замок», «плавающий регламент», «чихающий SOC», «сонный SIEM».'],
      quiz: {
        question: 'Что корректно?',
        choices: ['Ржавый парольный замок', 'Личное унижение', 'Религиозная отсылка'],
        correctIndex: 0,
      },
    },
    {
      id: 'finance',
      title: 'Финансы и отчётность',
      summary: 'Относись строго к цифрам, а не к людям.',
      content: ['«Хлюпающий бюджет», «растрёпанные проводки», «заедающий отчёт», «застенчивый кэшфлоу», «мятый прогноз».'],
      quiz: {
        question: 'Выбери безопасный образ:',
        choices: ['Хлюпающий бюджет', 'Оскорбление коллеги', 'Сексистская метафора'],
        correctIndex: 0,
      },
    },
    {
      id: 'hr',
      title: 'HR и документы',
      summary: 'Пусть бумага виновата.',
      content: ['«Сморщенная анкета», «зудящий бланк», «скрипучий лифтинг оклада», «притворяющийся декрет чекбокс», «шепелявый оффер».'],
      quiz: {
        question: 'Что соответствует правилам?',
        choices: ['Зудящий бланк', 'Уничижительная личная оценка', 'Этническая отсылка'],
        correctIndex: 0,
      },
    },
    {
      id: 'marketing',
      title: 'Маркетинг и контент',
      summary: 'Обижай макеты, а не людей.',
      content: ['«Пиксельная баннерная каша», «дрожащий калл-ту-экшен», «жадный UTM», «потеющий лендинг», «кашляющий ретаргет».'],
      quiz: {
        question: 'Какая метафора уместна?',
        choices: ['Дрожащий калл-ту-экшен', 'Оскорбление личности', 'Возрастная дискриминация'],
        correctIndex: 0,
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
        question: 'Что безопасно использует предметную иронию?',
        choices: ['Жаждущий степлер', 'Оскорбление человека', 'Происхождение коллеги'],
        correctIndex: 0,
      },
    },
    {
      id: 'backoffice',
      title: 'Бэкофис артефакты',
      summary: 'Пусть формы виноваты.',
      content: ['«Скользкий акт сверки», «шуршащая заявка», «летающая накладная», «склеенный счёт».'],
      quiz: {
        question: 'Выбери корректную фразу:',
        choices: ['Склеенный счёт', 'Телесное унижение', 'Возрастной намёк'],
        correctIndex: 0,
      },
    },
    {
      id: 'generator',
      title: 'Генератор выражений',
      summary: 'Собери свою безопасную «уколку».',
      content: ['Соберите фразу из блоков и скопируйте для чата. Держите тон дружелюбным.'],
      quiz: {
        question: 'Какой принцип главнее?',
        choices: ['Бить по предметам/процессам', 'Бить по людям', 'Бить по признакам'],
        correctIndex: 0,
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
    const choices = q.choices.map((c, i) => `<div class="choice" data-i="${i}" role="button" tabindex="0">${c}</div>`).join('');
    return `
      <div class="quiz">
        <h3>Проверка</h3>
        <p>${q.question}</p>
        <div class="choices">${choices}</div>
      </div>
    `;
  }

  function bindQuizHandlers(lesson) {
    const nodes = qsa('.choice');
    const correct = lesson.quiz.correctIndex;
    const onPick = (el) => {
      const i = Number(el.dataset.i);
      nodes.forEach(n => n.classList.remove('correct', 'wrong'));
      if (i === correct) {
        el.classList.add('correct');
        state.progress.completed[lesson.id] = true;
        save();
        setProgressUI();
      } else {
        el.classList.add('wrong');
      }
    };
    nodes.forEach(n => {
      n.addEventListener('click', () => onPick(n));
      n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') onPick(n); });
    });
  }

  function renderExam() {
    // соберём 10 случайных вопросов из уроков
    const pool = lessons.filter(l => !l.exam && l.quiz).flatMap(l => ({ ...l.quiz, from: l.id }));
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
    shuffled.forEach((q, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'card';
      wrap.innerHTML = `
        <div class="quiz">
          <p><strong>Вопрос ${idx + 1}.</strong> ${q.question}</p>
          <div class="choices">
            ${q.choices.map((c, i) => `<label class="choice"><input type="radio" name="q${idx}" value="${i}"> ${c}</label>`).join('')}
          </div>
        </div>
      `;
      list.appendChild(wrap);
    });

    qs('#finishExam').onclick = () => {
      const answers = shuffled.map((q, idx) => {
        const checked = qs(`input[name="q${idx}"]:checked`);
        return Number(checked?.value);
      });
      const score = answers.reduce((acc, v, i) => acc + (v === shuffled[i].correctIndex ? 1 : 0), 0);
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


