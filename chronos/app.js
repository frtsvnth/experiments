/**
 * ========================================
 * CHRONOS INTELLIGENCE - AGE ANALYSIS TOOL
 * ========================================
 * Product: Premium age calculation utility
 * Edition: 1.0
 * Purpose: Accurate chronological analysis with premium UX
 */

// ========================================
// CONFIGURATION & CONSTANTS
// ========================================

const CONFIG = {
  // Processing configuration
  processing: {
    minDuration: 7000,
    maxDuration: 9000,
    initialDelay: 250,
    steps: {
      yearOnly: [
        { title: 'Инициализация возрастного модуля', subtitle: 'Поднимаем хронологические данные...' },
        { title: 'Проверка временного диапазона', subtitle: 'Проверяем календарную согласованность...' },
        { title: 'Сопоставление с текущим календарным годом', subtitle: 'Сверяем дату с текущим временным контуром...' },
        { title: 'Расчёт полного возраста', subtitle: 'Определяем возрастную дистанцию...' },
        { title: 'Подготовка итоговой карточки', subtitle: 'Формируем итоговый отчёт...' }
      ],
      fullDate: [
        { title: 'Инициализация хронологического модуля', subtitle: 'Поднимаем хронологические данные...' },
        { title: 'Проверка корректности календарной даты', subtitle: 'Проверяем календарную согласованность...' },
        { title: 'Сопоставление с текущим днём', subtitle: 'Сверяем дату с текущим временным контуром...' },
        { title: 'Расчёт полного возраста и временной дистанции', subtitle: 'Определяем возрастную дистанцию...' },
        { title: 'Определение дополнительных календарных признаков', subtitle: 'Определяем календарные параметры...' },
        { title: 'Формирование итогового отчёта', subtitle: 'Формируем итоговый отчёт...' }
      ]
    }
  },
  
  // Text labels
  labels: {
    analyzeBtn: {
      default: 'Запустить',
      processing: 'Анализ'
    },
    error: {
      yearEmpty: 'Введите год рождения.',
      yearFormat: 'Год должен состоять из 4 цифр.',
      yearRange: 'Год должен быть между 1900 и текущим годом.',
      dateEmpty: 'Заполните все поля даты.',
      dateInvalid: 'Похоже, эта дата не существует.',
      dateFuture: 'Дата рождения не может быть в будущем.',
      dayRange: 'Укажите корректный день месяца (1-31).',
      monthRange: 'Укажите корректный месяц (1-12).',
      futureDate: 'Дата рождения не может быть в будущем.'
    }
  },

  // Result copy
  resultCopy: {
    footer: 'Да, это был очень солидный способ узнать очевидное.',
    yearOnlySummary: 'Хронологический анализ завершён.',
    fullDateSummary: 'Анализ полного хронологического профиля завершён.'
  }
};

// ========================================
// STATE MANAGEMENT
// ========================================

const state = {
  mode: 'year', // 'year' or 'date'
  input: {
    year: '',
    day: '',
    month: '',
    yearFull: ''
  },
  validation: {
    isValid: false,
    errors: {
      year: null,
      date: null
    }
  },
  processing: {
    active: false,
    startTime: null,
    progress: 0,
    currentStep: 0
  },
  result: null
};

// ========================================
// DOM ELEMENTS
// ========================================

const elements = {
  // Tabs
  tabYear: document.getElementById('tab-year'),
  tabDate: document.getElementById('tab-date'),
  
  // Input containers
  yearInputContainer: document.getElementById('yearInputContainer'),
  dateInputContainer: document.getElementById('dateInputContainer'),
  
  // Inputs
  yearInput: document.getElementById('yearInput'),
  dayInput: document.getElementById('dayInput'),
  monthInput: document.getElementById('monthInput'),
  yearInputFull: document.getElementById('yearInputFull'),
  
  // Clear buttons
  clearYearBtn: document.getElementById('clearYearBtn'),
  clearBtn: document.getElementById('clearBtn'),
  
  // Helper/error texts
  yearHelper: document.getElementById('yearHelper'),
  yearError: document.getElementById('yearError'),
  dateError: document.getElementById('dateError'),
  
  // Quick fills
  quickFills: document.getElementById('quickFills'),
  
  // Buttons
  analyzeBtn: document.getElementById('analyzeBtn'),
  restartBtn: document.getElementById('restartBtn'),
  copyBtn: document.getElementById('copyBtn'),
  
  // States
  inputState: document.getElementById('inputState'),
  processingState: document.getElementById('processingState'),
  resultState: document.getElementById('resultState'),
  
  // Processing
  processingTitle: document.getElementById('processingTitle'),
  processingSubtitle: document.getElementById('processingSubtitle'),
  progressFill: document.getElementById('progressFill'),
  progressPercent: document.getElementById('progressPercent'),
  stepList: document.getElementById('stepList'),
  
  // Result
  resultAge: document.getElementById('resultAge'),
  resultSummary: document.getElementById('resultSummary'),
  metricsGrid: document.getElementById('metricsGrid'),
  resultInsights: document.getElementById('resultInsights'),
  insightsGrid: document.getElementById('insightsGrid'),
  resultFooter: document.getElementById('resultFooter'),
  
  // Info panel
  infoPanel: document.getElementById('infoPanel')
};

// ========================================
// UTILITIES
// ========================================

const Utils = {
  // Current date
  today: new Date(),
  
  // Generate random number in range
  randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  // Generate random float
  randomFloat: (min, max) => Math.random() * (max - min) + min,
  
  // Format number with leading zero
  pad: (num, size = 2) => String(num).padStart(size, '0'),
  
  // Check if year is leap year
  isLeapYear: (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  },
  
  // Get days in month
  getDaysInMonth: (year, month) => {
    return [31, Utils.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  },
  
  // Validate date
  isValidDate: (day, month, year) => {
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > Utils.today.getFullYear()) return false;
    if (day > Utils.getDaysInMonth(year, month)) return false;
    
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  },
  
  // Format number with spaces for thousands
  formatNumber: (num) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  },
  
  // Copy to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  },
  
  // Calculate zodiac sign
  getZodiacSign: (day, month) => {
    const zodiacs = [
      { name: 'Козерог', start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
      { name: 'Водолей', start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
      { name: 'Рыбы', start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
      { name: 'Овен', start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
      { name: 'Телец', start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
      { name: 'Близнецы', start: { month: 5, day: 21 }, end: { month: 6, day: 20 } },
      { name: 'Рак', start: { month: 6, day: 21 }, end: { month: 7, day: 22 } },
      { name: 'Лев', start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
      { name: 'Дева', start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
      { name: 'Весы', start: { month: 9, day: 23 }, end: { month: 10, day: 22 } },
      { name: 'Скорпион', start: { month: 10, day: 23 }, end: { month: 11, day: 21 } },
      { name: 'Стрелец', start: { month: 11, day: 22 }, end: { month: 12, day: 21 } }
    ];
    
    const inputDate = { month, day };
    
    for (const zodiac of zodiacs) {
      const startDate = { month: zodiac.start.month, day: zodiac.start.day };
      const endDate = { month: zodiac.end.month, day: zodiac.end.day };
      
      if (startDate.month <= endDate.month) {
        // Normal range (not crossing year boundary)
        if (inputDate.month > startDate.month || (inputDate.month === startDate.month && inputDate.day >= startDate.day)) {
          if (inputDate.month < endDate.month || (inputDate.month === endDate.month && inputDate.day <= endDate.day)) {
            return zodiac.name;
          }
        }
      } else {
        // Crosses year boundary (Capricorn, Aquarius)
        if (inputDate.month > startDate.month || (inputDate.month === startDate.month && inputDate.day >= startDate.day)) {
          return zodiac.name;
        }
        if (inputDate.month < endDate.month || (inputDate.month === endDate.month && inputDate.day <= endDate.day)) {
          return zodiac.name;
        }
      }
    }
    
    return 'Козерог';
  },
  
  // Get day of week name
  getDayOfWeek: (day, month, year) => {
    const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    return days[new Date(year, month - 1, day).getDay()];
  },
  
  // Get generation label
  getGeneration: (year) => {
    if (year >= 2013) return 'Поколение Alpha';
    if (year >= 1997) return 'Поколение Z';
    if (year >= 1981) return 'Миллениалы';
    if (year >= 1965) return 'Поколение X';
    return 'Индивидуальный календарный профиль';
  },
  
  // Calculate next birthday
  getNextBirthday: (day, month, year) => {
    const currentYear = Utils.today.getFullYear();
    const nextBirthday = new Date(currentYear, month - 1, day);
    
    if (nextBirthday < Utils.today) {
      nextBirthday.setFullYear(currentYear + 1);
    }
    
    const diffTime = nextBirthday - Utils.today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { days: diffDays, date: nextBirthday };
  },
  
  // Calculate days lived (approximate)
  getDaysLived: (birthDate) => {
    const diffTime = Utils.today - birthDate;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  },
  
  // Calculate next milestone birthday
  getNextMilestone: (currentAge) => {
    const next5 = Math.ceil(currentAge / 5) * 5;
    const next10 = Math.ceil(currentAge / 10) * 10;
    
    if (next5 < currentAge + 5) return { age: next5, is5: true };
    return { age: next10, is5: false };
  },
  
  // Calculate quarter
  getQuarter: (month) => {
    return `Q${Math.ceil(month / 3)} квартал`;
  },
  
  // Calculate season
  getSeason: (month) => {
    const seasons = ['зима', 'зима', 'весна', 'весна', 'весна', 'лето', 'лето', 'лето', 'осень', 'осень', 'осень', 'зима'];
    return seasons[month - 1];
  },
  
  // Get life cycle phase
  getLifeCyclePhase: (age) => {
    if (age < 13) return 'Детство';
    if (age < 20) return 'Подростковый возраст';
    if (age < 30) return 'Юность';
    if (age < 45) return 'Зрелость';
    if (age < 60) return 'Созревание';
    return 'Мудрость';
  },
  
  // Calculate numerology number (Life Path)
  getNumerologyNumber: (day, month, year) => {
    let sum = day + month + year;
    while (sum > 9 && sum !== 11 && sum !== 22) {
      sum = String(sum).split('').reduce((a, b) => a + parseInt(b), 0);
    }
    return sum;
  },
  
  // Get birthstone
  getBirthstone: (month) => {
    const stones = [
      'Гранат', 'Аметист', 'Аквамарин', 'Алмаз', 'Изумруд', 'Александрит',
      'Рубин', 'Сапфир', 'Яшма', 'Топаз', 'Лабрадор', 'Гранат'
    ];
    return stones[month - 1];
  },
  
  // Get lucky colors based on zodiac
  getLuckyColors: (zodiac) => {
    const colors = {
      'Овен': 'Красный, Желтый, Оранжевый',
      'Телец': 'Зеленый, Розовый, Бирюзовый',
      'Близнецы': 'Желтый, Голубой, Серебряный',
      'Рак': 'Серебряный, Морской, Кремовый',
      'Лев': 'Золотой, Красный, Фиолетовый',
      'Дева': 'Коричневый, Бежевый, Зеленый',
      'Весы': 'Розовый, Голубой, Пастельный',
      'Скорпион': 'Малиновый, Фиолетовый, Бордовый',
      'Стрелец': 'Фиолетовый, Красный, Пурпурный',
      'Козерог': 'Коричневый, Черный, Темно-синий',
      'Водолей': 'Синий, Голубой, Серебряный',
      'Рыбы': 'Морской, Голубой, Лавандовый'
    };
    return colors[zodiac] || 'Разноцветный';
  },
  
  // Get lucky numbers based on zodiac
  getLuckyNumbers: (zodiac) => {
    const numbers = {
      'Овен': '9, 1, 3, 5',
      'Телец': '6, 2, 5, 8',
      'Близнецы': '5, 7, 9, 2',
      'Рак': '2, 7, 8, 3',
      'Лев': '1, 3, 4, 5',
      'Дева': '5, 6, 8, 9',
      'Весы': '3, 5, 6, 9',
      'Скорпион': '9, 1, 7, 3',
      'Стрелец': '3, 5, 8, 9',
      'Козерог': '4, 8, 15, 24',
      'Водолей': '4, 7, 11, 22',
      'Рыбы': '3, 7, 9, 12'
    };
    return numbers[zodiac] || 'Счастливые числа';
  },
  
  // Get lucky days based on zodiac
  getLuckyDays: (zodiac) => {
    const days = {
      'Овен': 'Вторник',
      'Телец': 'Пятница',
      'Близнецы': 'Среда',
      'Рак': 'Понедельник',
      'Лев': 'Воскресенье',
      'Дева': 'Среда',
      'Весы': 'Пятница',
      'Скорпион': 'Понедельник',
      'Стрелец': 'Четверг',
      'Козерог': 'Суббота',
      'Водолей': 'Среда',
      'Рыбы': 'Пятница'
    };
    return days[zodiac] || 'Каждый день';
  },
  
  // Get Chinese zodiac
  getChineseZodiac: (year) => {
    const animals = ['Обезьяна', 'Петух', 'Собака', 'Свинья', 'Крыса', 'Бык',
                     'Тигр', 'Кролик', 'Дракон', 'Змея', 'Лошадь', 'Коза'];
    return animals[year % 12];
  },
  
  // Get day of year
  getDayOfYear: (day, month, year) => {
    const date = new Date(year, month - 1, day);
    const start = new Date(year, 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  },
  
  // Get next birthday day of week
  getNextBdayDayOfWeek: (day, month, year) => {
    const currentYear = Utils.today.getFullYear();
    let nextYear = currentYear;
    const nextBday = new Date(currentYear, month - 1, day);
    
    if (nextBday < Utils.today) {
      nextYear++;
    }
    
    return Utils.getDayOfWeek(day, month, nextYear);
  },
  
  // Get birth flower
  getBirthFlower: (month) => {
    const flowers = [
      'Альпийская анютины глазки', 'Алоказия', 'Апрельская ива', 'Рябина', 'Тюльпан',
      'Лилия', 'Георгины', 'Лаванда', 'Сирень', 'Хризантема', 'Бузина', 'Магнолия'
    ];
    return flowers[month - 1];
  },
  
  // Get birth period (start/middle/end of year)
  getBirthPeriod: (day) => {
    if (day <= 10) return 'в начале года';
    if (day <= 20) return 'в середине года';
    return 'в конце года';
  },
  
  // Get milestones
  getMilestones: (age) => {
    const milestones = [];
    for (let m = 10; m <= 100; m += 5) {
      if (m > age) milestones.push(m);
    }
    return milestones.slice(0, 5);
  }
};

// ========================================
// INPUT HANDLERS
// ========================================

// Tab switching
function switchMode(mode) {
  state.mode = mode;
  
  if (mode === 'year') {
    elements.tabYear.classList.add('segmented-control__tab--active');
    elements.tabDate.classList.remove('segmented-control__tab--active');
    elements.yearInputContainer.classList.remove('input-container--hidden');
    elements.dateInputContainer.classList.add('input-container--hidden');
    
    elements.tabYear.setAttribute('aria-selected', 'true');
    elements.tabDate.setAttribute('aria-selected', 'false');
  } else {
    elements.tabYear.classList.remove('segmented-control__tab--active');
    elements.tabDate.classList.add('segmented-control__tab--active');
    elements.yearInputContainer.classList.add('input-container--hidden');
    elements.dateInputContainer.classList.remove('input-container--hidden');
    
    elements.tabYear.setAttribute('aria-selected', 'false');
    elements.tabDate.setAttribute('aria-selected', 'true');
  }
  
  // Clear validation when switching
  state.validation.isValid = false;
  state.validation.errors.year = null;
  state.validation.errors.date = null;
  elements.yearError.textContent = '';
  elements.dateError.textContent = '';
  elements.analyzeBtn.disabled = true;
  
  // Clear result if visible
  if (!elements.resultState.classList.contains('card__content--hidden')) {
    resetToInput();
  }
}

// Year input validation
function validateYearInput() {
  const value = elements.yearInput.value.trim();
  
  if (!value) {
    state.validation.errors.year = CONFIG.labels.error.yearEmpty;
    elements.yearError.textContent = CONFIG.labels.error.yearEmpty;
    return false;
  }
  
  if (!/^\d{4}$/.test(value)) {
    state.validation.errors.year = CONFIG.labels.error.yearFormat;
    elements.yearError.textContent = CONFIG.labels.error.yearFormat;
    return false;
  }
  
  const year = parseInt(value, 10);
  const currentYear = Utils.today.getFullYear();
  
  if (year < 1900) {
    state.validation.errors.year = CONFIG.labels.error.yearRange;
    elements.yearError.textContent = CONFIG.labels.error.yearRange;
    return false;
  }
  
  if (year > currentYear) {
    state.validation.errors.year = CONFIG.labels.error.yearRange;
    elements.yearError.textContent = CONFIG.labels.error.yearRange;
    return false;
  }
  
  state.validation.errors.year = null;
  elements.yearError.textContent = '';
  return true;
}

// Full date validation
function validateDateInput() {
  const day = elements.dayInput.value.trim();
  const month = elements.monthInput.value.trim();
  const year = elements.yearInputFull.value.trim();
  
  if (!day || !month || !year) {
    state.validation.errors.date = CONFIG.labels.error.dateEmpty;
    elements.dateError.textContent = CONFIG.labels.error.dateEmpty;
    return false;
  }
  
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) {
    state.validation.errors.date = CONFIG.labels.error.dateInvalid;
    elements.dateError.textContent = CONFIG.labels.error.dateInvalid;
    return false;
  }
  
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  
  if (d < 1 || d > 31) {
    state.validation.errors.date = CONFIG.labels.error.dayRange;
    elements.dateError.textContent = CONFIG.labels.error.dayRange;
    return false;
  }
  
  if (m < 1 || m > 12) {
    state.validation.errors.date = CONFIG.labels.error.monthRange;
    elements.dateError.textContent = CONFIG.labels.error.monthRange;
    return false;
  }
  
  if (y < 1900 || y > Utils.today.getFullYear()) {
    state.validation.errors.date = CONFIG.labels.error.yearRange;
    elements.dateError.textContent = CONFIG.labels.error.yearRange;
    return false;
  }
  
  if (!Utils.isValidDate(d, m, y)) {
    state.validation.errors.date = CONFIG.labels.error.dateInvalid;
    elements.dateError.textContent = CONFIG.labels.error.dateInvalid;
    return false;
  }
  
  const date = new Date(y, m - 1, d);
  if (date > Utils.today) {
    state.validation.errors.date = CONFIG.labels.error.futureDate;
    elements.dateError.textContent = CONFIG.labels.error.futureDate;
    return false;
  }
  
  state.validation.errors.date = null;
  elements.dateError.textContent = '';
  return true;
}

// Check overall validation
function checkValidation() {
  if (state.mode === 'year') {
    state.validation.isValid = validateYearInput();
  } else {
    state.validation.isValid = validateDateInput();
  }

  elements.analyzeBtn.disabled = !state.validation.isValid;
  console.log('checkValidation:', state.mode, state.validation.isValid);
}

// Clear all inputs
function clearInputs() {
  elements.yearInput.value = '';
  elements.dayInput.value = '';
  elements.monthInput.value = '';
  elements.yearInputFull.value = '';
  
  state.validation.isValid = false;
  state.validation.errors.year = null;
  state.validation.errors.date = null;
  
  elements.yearError.textContent = '';
  elements.dateError.textContent = '';
  
  elements.analyzeBtn.disabled = true;
}

// ========================================
// PROCESSING SYSTEM
// ========================================

function getProcessingSteps() {
  return state.mode === 'year' 
    ? CONFIG.processing.steps.yearOnly
    : CONFIG.processing.steps.fullDate;
}

function createStepList() {
  const steps = getProcessingSteps();
  elements.stepList.innerHTML = '';
  
  steps.forEach((step, index) => {
    const stepItem = document.createElement('div');
    stepItem.className = 'step-item step-item--pending';
    stepItem.id = `step-${index}`;
    
    stepItem.innerHTML = `
      <div class="step-indicator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12L9 16L19 6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="step-text">${step.title}</div>
    `;
    
    elements.stepList.appendChild(stepItem);
  });
}

function updateStep(stepIndex, isCompleted = false, isActive = false) {
  const stepElement = document.getElementById(`step-${stepIndex}`);
  
  if (!stepElement) return;
  
  stepElement.classList.remove('step-item--pending');
  
  if (isActive) {
    stepElement.classList.add('step-item--active');
    stepElement.classList.remove('step-item--completed');
  } else if (isCompleted) {
    stepElement.classList.add('step-item--completed');
    stepElement.classList.remove('step-item--active');
  }
  
  // Update processing status
  const steps = getProcessingSteps();
  if (stepIndex < steps.length) {
    const currentStep = steps[stepIndex];
    elements.processingTitle.textContent = currentStep.title;
    elements.processingSubtitle.textContent = currentStep.subtitle;
  }
}

function getProcessingDuration() {
  return Utils.randomInt(CONFIG.processing.minDuration, CONFIG.processing.maxDuration);
}

async function runProcessing() {
  const steps = getProcessingSteps();
  const totalSteps = steps.length;
  const duration = getProcessingDuration() * 1.5;
  
  // Reset UI
  state.processing.active = true;
  state.processing.startTime = Date.now();
  state.processing.progress = 0;
  state.processing.currentStep = 0;
  
  elements.inputState.classList.add('card__content--hidden');
  elements.processingState.classList.remove('card__content--hidden');
  elements.resultState.classList.add('card__content--hidden');
  
  createStepList();
  
  // Update button
  elements.analyzeBtn.disabled = true;
  elements.analyzeBtn.innerHTML = `
    <span class="btn__text">${CONFIG.labels.analyzeBtn.processing}</span>
    <svg class="btn__icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `;
  
  // Start processing animation
  let startTime = Date.now();
  const stepDuration = duration / totalSteps;
  
  for (let i = 0; i < totalSteps; i++) {
    updateStep(i, false, true);
    
    const stepStartTime = Date.now();
    const stepProgressRate = 80 / stepDuration; // 0-80% during steps
    
    while (Date.now() - stepStartTime < stepDuration) {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(80, (elapsed / duration) * 100);
      
      elements.progressFill.style.width = `${progress}%`;
      elements.progressPercent.textContent = `${Math.round(progress)}%`;
      
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    updateStep(i, true, false);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Final 20% progress
  const finalDuration = Math.max(500, duration - (Date.now() - startTime));
  const finalStep = 20 / finalDuration;
  
  while (Date.now() - startTime < duration) {
    const elapsed = Date.now() - startTime;
    const progress = 80 + (elapsed / duration) * 20;
    
    elements.progressFill.style.width = `${progress}%`;
    elements.progressPercent.textContent = `${Math.round(progress)}%`;
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Update final step
  updateStep(totalSteps - 1, true, true);
  elements.progressFill.style.width = '100%';
  elements.progressPercent.textContent = '100%';

  // Longer pause before revealing result
  await new Promise(resolve => setTimeout(resolve, 800));

  // Show result
  elements.processingState.classList.add('card__content--hidden');
  elements.resultState.classList.remove('card__content--hidden');

  // Trigger animations with stagger
  setTimeout(() => {
    elements.resultHeader?.classList.remove('card__content--hidden');
    animateResultReveal();
  }, 100);
}

// ========================================
// RESULT CALCULATION
// ========================================

function calculateAgeResult() {
  const currentYear = Utils.today.getFullYear();
  const currentMonth = Utils.today.getMonth() + 1;
  const currentDay = Utils.today.getDate();
  
  if (state.mode === 'year') {
    const year = parseInt(elements.yearInput.value.trim(), 10);
    const age = currentYear - year;
    
    // Calculate next milestone
    const milestone = Math.ceil(age / 10) * 10;
    const nextMilestoneAge = milestone === age ? milestone + 10 : milestone;
    
    return {
      mode: 'year',
      age: age,
      birthYear: year,
      currentYear: currentYear,
      nextMilestone: nextMilestoneAge,
      generation: Utils.getGeneration(year),
      isMilestone: age % 10 === 0
    };
  } else {
    const day = parseInt(elements.dayInput.value.trim(), 10);
    const month = parseInt(elements.monthInput.value.trim(), 10);
    const year = parseInt(elements.yearInputFull.value.trim(), 10);
    
    // Calculate age
    let age = currentYear - year;
    if (currentMonth < month || (currentMonth === month && currentDay < day)) {
      age--;
    }
    
    // Calculate days lived
    const birthDate = new Date(year, month - 1, day);
    const daysLived = Utils.getDaysLived(birthDate);
    
    // Get next birthday
    const nextBirthday = Utils.getNextBirthday(day, month, year);

    // Calculate next milestone
    const milestone5 = Math.ceil(age / 5) * 5;
    const nextMilestoneAge = milestone5 === age ? milestone5 + 5 : milestone5;
    
    // Calculate quarter and season
    const quarter = Utils.getQuarter(month);
    const season = Utils.getSeason(month);

    // Calculate Chinese zodiac
    const chineseZodiac = Utils.getChineseZodiac(year);

    // Calculate day of year
    const dayOfYear = Utils.getDayOfYear(day, month, year);

    // Is leap year
    const isLeapYear = Utils.isLeapYear(year);

    // Next birthday day of week
    const nextBdayDayOfWeek = Utils.getNextBdayDayOfWeek(day, month, year);

    // Age in weeks, hours, minutes
    const weeksLived = Math.floor(daysLived / 7);
    const hoursLived = daysLived * 24;
    const minutesLived = hoursLived * 60;

    return {
      mode: 'date',
      age: age,
      birthDate: birthDate,
      birthYear: year,
      birthMonth: month,
      birthDay: day,
      currentYear: currentYear,
      currentMonth: currentMonth,
      currentDay: currentDay,
      zodiac: Utils.getZodiacSign(day, month),
      dayOfWeek: Utils.getDayOfWeek(day, month, year),
      chineseZodiac: chineseZodiac,
      daysLived: daysLived,
      weeksLived: weeksLived,
      hoursLived: hoursLived,
      minutesLived: minutesLived,
      nextBirthday: nextBirthday,
      nextMilestone: nextMilestoneAge,
      nextMilestoneAge: nextMilestoneAge,
      generation: Utils.getGeneration(year),
      quarter: quarter,
      season: season,
      dayOfYear: dayOfYear,
      isLeapYear: isLeapYear,
      nextBdayDayOfWeek: nextBdayDayOfWeek,
      birthQuarter: Math.ceil(month / 3),
      birthSeason: season,
      numerologyNumber: Utils.getNumerologyNumber(day, month, year),
      birthstone: Utils.getBirthstone(month),
      birthFlower: Utils.getBirthFlower(month),
      lifeCyclePhase: Utils.getLifeCyclePhase(age),
      birthPeriod: Utils.getBirthPeriod(day),
      milestones: Utils.getMilestones(age)
    };
  }
}

function renderResult(result) {
  // Store the actual age
  state.displayAge = result.age;

  // Summary
  elements.resultSummary.textContent = state.mode === 'year'
    ? CONFIG.resultCopy.yearOnlySummary
    : CONFIG.resultCopy.fullDateSummary;

  if (state.mode === 'year') {
    // YEAR ONLY MODE
    const metricsHTML = `
      <div class="metric-card metric-card--primary">
        <div class="metric-label">Текущий возраст</div>
        <div class="metric-value">${result.age}</div>
        <div class="metric-sub">полных лет</div>
      </div>
      <div class="metric-card metric-card--secondary">
        <div class="metric-label">Следующий юбилей</div>
        <div class="metric-value">${result.nextMilestone} лет</div>
      </div>
      <div class="metric-card metric-card--secondary">
        <div class="metric-label">Год рождения</div>
        <div class="metric-value">${result.birthYear}</div>
      </div>
      <div class="metric-card metric-card--secondary">
        <div class="metric-label">Поколение</div>
        <div class="metric-value">${result.generation}</div>
      </div>
    `;
    elements.metricsGrid.innerHTML = metricsHTML;
    elements.resultInsights.style.display = 'none';
  } else {
    // FULL DATE MODE
    const nextBdayDate = new Date(result.currentYear, result.birthMonth - 1, result.birthDay);
    if (nextBdayDate < Utils.today) {
      nextBdayDate.setFullYear(result.currentYear + 1);
    }
    const daysUntilNextBday = Math.ceil((nextBdayDate - Utils.today) / (1000 * 60 * 60 * 24));
    const nextMilestoneAge = result.nextMilestone;

    // Block 1: Main Result - Tier 1 KPIs
    const mainHTML = `
      <div class="metric-card metric-card--primary">
        <div class="metric-label">Текущий возраст</div>
        <div class="metric-value">${result.age}</div>
        <div class="metric-sub">полных лет</div>
      </div>
      <div class="metric-card metric-card--secondary">
        <div class="metric-label">Следующий день рождения</div>
        <div class="metric-value">${result.nextBirthday.days} дней</div>
        <div class="metric-sub">до ${nextBdayDate.getDate()}.${nextBdayDate.getMonth()+1}</div>
      </div>
      <div class="metric-card metric-card--secondary">
        <div class="metric-label">Ближайший круглый юбилей</div>
        <div class="metric-value">${nextMilestoneAge} лет</div>
        <div class="metric-sub">через ${nextMilestoneAge - result.age} лет</div>
      </div>
      <div class="metric-card metric-card--secondary">
        <div class="metric-label">Прожито дней</div>
        <div class="metric-value">${Utils.formatNumber(result.daysLived)}</div>
        <div class="metric-sub">дней</div>
      </div>
    `;
    
    // Block 2: Calendar Profile
    const calendarHTML = `
      <div class="metric-card">
        <div class="metric-label">День недели</div>
        <div class="metric-value">${result.dayOfWeek}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Знак зодиака</div>
        <div class="metric-value">${result.zodiac}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Китайский знак</div>
        <div class="metric-value">${result.chineseZodiac}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Сезон</div>
        <div class="metric-value">${result.season}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Квартал</div>
        <div class="metric-value">${result.quarter}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">День года</div>
        <div class="metric-value">${result.dayOfYear}</div>
        <div class="metric-sub">день</div>
      </div>
    `;
    
    // Block 3: Life Stats
    const lifeStatsHTML = `
      <div class="metric-card">
        <div class="metric-label">Недель</div>
        <div class="metric-value" style="font-size: 24px;">${Utils.formatNumber(result.weeksLived)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Часов</div>
        <div class="metric-value" style="font-size: 24px;">${Utils.formatNumber(result.hoursLived)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Минут</div>
        <div class="metric-value" style="font-size: 24px;">${Utils.formatNumber(result.minutesLived)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">До юбилея</div>
        <div class="metric-value">${nextMilestoneAge - result.age} лет</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Високосный</div>
        <div class="metric-value">${result.isLeapYear ? 'Да' : 'Нет'}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Путь к 100</div>
        <div class="metric-value">${Math.min(100, Math.round((result.age / 100) * 100))}%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Лет до пенсии</div>
        <div class="metric-value">${Math.max(0, 63 - result.age)} лет</div>
      </div>
    `;
    
    // Block 4: Fun Profile
    const funProfileHTML = `
      <div class="metric-card">
        <div class="metric-label">Поколение</div>
        <div class="metric-value">${result.generation}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Life Path</div>
        <div class="metric-value">${result.numerologyNumber}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Родной камень</div>
        <div class="metric-value">${result.birthstone}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Цветок</div>
        <div class="metric-value">${result.birthFlower}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Фаза жизни</div>
        <div class="metric-value">${result.lifeCyclePhase}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Период</div>
        <div class="metric-value">${result.birthPeriod}</div>
      </div>
    `;

    elements.metricsGrid.innerHTML = `
      <div class="metrics-block">
        <div class="metrics-block__title">Основной результат</div>
        <div class="metrics-grid metrics-grid--main">${mainHTML}</div>
      </div>
      <div class="metrics-block">
        <div class="metrics-block__title">Календарный профиль</div>
        <div class="metrics-grid">${calendarHTML}</div>
      </div>
      <div class="metrics-block">
        <div class="metrics-block__title">Life stats</div>
        <div class="metrics-grid">${lifeStatsHTML}</div>
      </div>
      <div class="metrics-block">
        <div class="metrics-block__title">Fun profile</div>
        <div class="metrics-grid">${funProfileHTML}</div>
      </div>
    `;
    elements.resultInsights.style.display = 'none';
  }

  // Footer
  elements.resultFooter.textContent = state.mode === 'year'
    ? CONFIG.resultCopy.footer
    : 'Календарь подтверждает: время действительно идёт.';
}

function animateResultReveal() {
  const cards = document.querySelectorAll('.metric-card');
  const kpiValue = document.querySelector('.result-kpi__value');
  const kpiUnit = document.querySelector('.result-kpi__unit');

  // Use stored display age
  const startAge = state.displayAge || 0;
  let currentAge = 0;
  const duration = 1600;
  const startTime = Date.now();
  
  const animateCountUp = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    
    // Easing: cubic-bezier(0.16, 1, 0.3, 1)
    const easedProgress = Math.pow(progress, 3);
    
    currentAge = Math.floor(startAge * easedProgress);
    elements.resultAge.textContent = currentAge;
    
    if (progress < 1) {
      requestAnimationFrame(animateCountUp);
    } else {
      elements.resultAge.textContent = startAge;
    }
  };
  
  animateCountUp();
  
  // Animate cards with stagger - slower
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(10px)';

    setTimeout(() => {
      card.style.transition = 'opacity 600ms var(--ease-primary), transform 600ms var(--ease-primary)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 300 + (index * 150));
  });

  // Animate success badge - slower
  const badge = document.querySelector('.success-badge');
  if (badge) {
    badge.style.opacity = '0';
    setTimeout(() => {
      badge.style.transition = 'opacity 600ms var(--ease-primary)';
      badge.style.opacity = '1';
    }, 400);
  }
}

// ========================================
// RESET FUNCTION
// ========================================

function resetToInput() {
  state.processing.active = false;
  
  elements.processingState.classList.add('card__content--hidden');
  elements.resultState.classList.add('card__content--hidden');
  elements.inputState.classList.remove('card__content--hidden');
  
  // Reset button
  elements.analyzeBtn.disabled = !state.validation.isValid;
  elements.analyzeBtn.innerHTML = `
    <span class="btn__text">Запустить</span>
    <svg class="btn__icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

// ========================================
// INITIALIZATION
// ========================================

let isInitialized = false;

function init() {
  if (isInitialized) return;
  isInitialized = true;
  
  console.log('Initializing Chronos Intelligence...');
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.body.classList.add('reduced-motion');
  }

  // Get DOM elements
  elements.tabYear = document.getElementById('tab-year');
  elements.tabDate = document.getElementById('tab-date');
  elements.yearInputContainer = document.getElementById('yearInputContainer');
  elements.dateInputContainer = document.getElementById('dateInputContainer');
  elements.yearInput = document.getElementById('yearInput');
  elements.dayInput = document.getElementById('dayInput');
  elements.monthInput = document.getElementById('monthInput');
  elements.yearInputFull = document.getElementById('yearInputFull');
  elements.clearYearBtn = document.getElementById('clearYearBtn');
  elements.analyzeBtn = document.getElementById('analyzeBtn');
  elements.restartBtn = document.getElementById('restartBtn');
  elements.copyBtn = document.getElementById('copyBtn');
  elements.inputState = document.getElementById('inputState');
  elements.processingState = document.getElementById('processingState');
  elements.resultState = document.getElementById('resultState');
  elements.processingTitle = document.getElementById('processingTitle');
  elements.processingSubtitle = document.getElementById('processingSubtitle');
  elements.progressFill = document.getElementById('progressFill');
  elements.progressPercent = document.getElementById('progressPercent');
  elements.stepList = document.getElementById('stepList');
  elements.resultAge = document.getElementById('resultAge');
  elements.resultSummary = document.getElementById('resultSummary');
  elements.metricsGrid = document.getElementById('metricsGrid');
  elements.resultInsights = document.getElementById('resultInsights');
  elements.insightsGrid = document.getElementById('insightsGrid');
  elements.resultFooter = document.getElementById('resultFooter');
  elements.infoPanel = document.getElementById('infoPanel');
  elements.yearHelper = document.getElementById('yearHelper');
  elements.yearError = document.getElementById('yearError');
  elements.dateError = document.getElementById('dateError');
  elements.quickFills = document.getElementById('quickFills');
  
  // Event listeners for quick fill chips
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const value = chip.dataset.value;
      
      if (value.includes('.')) {
        // Full date
        switchMode('date');
        const parts = value.split('.');
        elements.dayInput.value = parts[0];
        elements.monthInput.value = parts[1];
        elements.yearInputFull.value = parts[2];
      } else {
        // Year only - REPLACE instead of append
        switchMode('year');
        elements.yearInput.value = value;
      }
      
      checkValidation();
    });
  });
  
  // Event listeners for tabs
  elements.tabYear.addEventListener('click', () => switchMode('year'));
  elements.tabDate.addEventListener('click', () => switchMode('date'));
  
  // Input validation
  elements.yearInput.addEventListener('input', () => {
    elements.yearInput.value = elements.yearInput.value.replace(/\D/g, '').slice(0, 4);
    checkValidation();
  });
  
  elements.yearInput.addEventListener('blur', () => {
    if (elements.yearInput.value.length === 4) {
      validateYearInput();
    }
  });
  
  // Clear buttons
  elements.clearYearBtn.addEventListener('click', () => {
    elements.yearInput.value = '';
    checkValidation();
  });

  // Analyze button
  elements.analyzeBtn.addEventListener('click', async () => {
    console.log('=== ANALYZE BUTTON CLICKED ===');
    console.log('isValid:', state.validation.isValid);
    console.log('mode:', state.mode);
    
    if (!state.validation.isValid) {
      console.log('Validation failed');
      return;
    }

    console.log('Starting analysis...');
    
    // Scroll to processing block
    const card = document.getElementById('mainCard');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    await runProcessing();

    const result = calculateAgeResult();
    state.result = result;

    renderResult(result);
    console.log('Analysis completed');
  });
  
  // Restart button
  elements.restartBtn.addEventListener('click', () => {
    resetToInput();
  });
  
  // Copy button
  elements.copyBtn.addEventListener('click', async () => {
    const result = state.result;

    let copyText = '';

    if (state.mode === 'year') {
      copyText = `Мне провели хронологический анализ: ${result.age} лет, ${result.generation}. Да, это оказалось неожиданно солидно.`;
    } else {
      copyText = `Мне провели хронологический анализ: ${result.age} лет, знак зодиака — ${result.zodiac}, день недели рождения — ${result.dayOfWeek}. Да, это оказалось неожиданно солидно.`;
    }

    const success = await Utils.copyToClipboard(copyText);

    const originalText = elements.copyBtn.innerHTML;
    elements.copyBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17L4 12" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Скопировано!</span>
    `;

    setTimeout(() => {
      elements.copyBtn.innerHTML = originalText;
    }, 2000);
  });

  // Initial validation check
  console.log('Before checkValidation:', state.mode);
  checkValidation();
  console.log('After checkValidation:', state.mode, 'isValid:', state.validation.isValid);

  // Add date input event listeners for validation - on INPUT not blur
  const dayInput = document.getElementById('dayInput');
  const monthInput = document.getElementById('monthInput');
  const yearInputFull = document.getElementById('yearInputFull');

  if (dayInput) {
    dayInput.addEventListener('input', () => {
      checkValidation();
    });
  }
  if (monthInput) {
    monthInput.addEventListener('input', () => {
      checkValidation();
    });
  }
  if (yearInputFull) {
    yearInputFull.addEventListener('input', () => {
      checkValidation();
    });
  }

  // Add aria-live region for processing status
  const ariaLive = document.createElement('div');
  ariaLive.setAttribute('aria-live', 'polite');
  ariaLive.setAttribute('aria-atomic', 'true');
  ariaLive.className = 'visually-hidden';
  ariaLive.style.position = 'absolute';
  ariaLive.style.width = '1px';
  ariaLive.style.height = '1px';
  ariaLive.style.padding = '0';
  ariaLive.style.margin = '-1px';
  ariaLive.style.overflow = 'hidden';
  ariaLive.style.clip = 'rect(0, 0, 0, 0)';
  ariaLive.style.border = '0';
  document.body.appendChild(ariaLive);

  console.log('Chronos Intelligence initialized');
}

// Run initialization after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  init();
  
  // Add date input auto-advance after DOM is ready
  const dayInput = document.getElementById('dayInput');
  const monthInput = document.getElementById('monthInput');
  const yearInputFull = document.getElementById('yearInputFull');
  
  if (dayInput && monthInput && yearInputFull) {
    dayInput.addEventListener('input', () => {
      if (dayInput.value.length === 2) {
        monthInput.focus();
      }
    });
    
    monthInput.addEventListener('input', () => {
      if (monthInput.value.length === 2) {
        yearInputFull.focus();
      }
    });
    
    dayInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && dayInput.value.length === 0) {
        e.preventDefault();
        monthInput.focus();
      }
    });
    
    monthInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && monthInput.value.length === 0) {
        e.preventDefault();
        dayInput.focus();
      }
    });

    // Add year input auto-advance
    yearInputFull.addEventListener('input', () => {
      if (yearInputFull.value.length === 4) {
        const btn = document.getElementById('analyzeBtn');
        if (btn) btn.focus();
      }
    });
  }
});
