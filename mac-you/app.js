const PROFESSIONS = {
  student:{label:'Школьник / студент', profFit:38, altSuit:72, premiumDesire:8},
  office:{label:'Офис / менеджмент', profFit:56, altSuit:60, rationality:4},
  dev:{label:'Разработчик / IT', profFit:82, altSuit:46, techFlex:18},
  creative:{label:'Дизайн / видео / фото / креатив', profFit:88, altSuit:40, premiumDesire:10},
  entrepreneur:{label:'Предприниматель / управление', profFit:70, statusMot:12, mobility:8},
  marketing:{label:'Маркетинг / контент', profFit:72, mobility:10, premiumDesire:6},
  finance:{label:'Финансы / аналитика', profFit:64, rationality:10},
  science:{label:'Наука / инженерия', profFit:68, altSuit:54, techFlex:12},
  other:{label:'Другое', profFit:55, altSuit:58}
};

const SCREEN_HOURS_MAP = {
  '0-2':20,'3-4':42,'5-6':58,'7-8':74,'9-10':86,'11+':94
};
const SCREEN_HOURS_LABEL = {
  '0-2':2,'3-4':4,'5-6':6,'7-8':8,'9-10':10,'11+':12
};

const BUDGET_MAP = {
  minimal:{rationality:16,overpayRisk:18,premiumDesire:-10,label:'Экономный'},
  moderate:{rationality:10,overpayRisk:6,label:'Разумный'},
  invest:{premiumDesire:8,profFit:4,label:'Вложиться'},
  unlimited:{statusMot:10,premiumDesire:16,overpayRisk:-6,label:'Без границ'}
};

const SCENARIO_MAP = {
  browser:{profFit:30,altSuit:82,need:-14,label:'Браузер'},
  documents:{profFit:52,altSuit:70,need:-4,label:'Документы'},
  study:{profFit:44,altSuit:76,label:'Учёба'},
  code:{profFit:84,need:18,techFlex:8,altSuit:46,label:'Разработка'},
  'creative-pro':{profFit:90,need:22,premiumDesire:8,altSuit:40,label:'Креатив'},
  business:{profFit:72,mobility:16,need:10,altSuit:55,label:'Бизнес'},
  mixed:{profFit:58,altSuit:60,label:'Смешанный'}
};

const MOBILITY_MAP = {stationary:18,occasional:42,frequent:72,always:90};

const STATUS_MAP = {1:{s:12,p:18},2:{s:26,p:28},3:{s:44,p:46},4:{s:68,p:70},5:{s:88,p:90}};

const TOLERANCE_MAP = {
  1:{flex:18,alt:28,eco:84},2:{flex:34,alt:42,eco:72},
  3:{flex:50,alt:56,eco:58},4:{flex:72,alt:74,eco:42},5:{flex:88,alt:86,eco:28}
};

const AGE_RANGES = [
  {max:22,coeff:0.58},{max:29,coeff:0.72},{max:39,coeff:0.84},
  {max:49,coeff:0.78},{max:65,coeff:0.68},{max:Infinity,coeff:0.52}
];

const ARCHETYPES = [
  {
    id:'mobile_pragmatist',name:'Мобильный прагматик',
    desc:'Ты ценишь устройство не за символ, а за то, насколько оно облегчает жизнь в движении. Вес, автономность и предсказуемость — вот твои настоящие приоритеты.',
    match:(s)=>s.mobility>65&&s.emotionalBias<50
  },
  {
    id:'premium_rationalist',name:'Премиальный рационалист',
    desc:'Тебе подходит MacBook, но ты хочешь понимать, за что именно платишь. Ты не против премиальности, если она подтверждается ежедневной пользой.',
    match:(s)=>s.needScore>55&&s.rationality>55
  },
  {
    id:'digital_ascetic',name:'Цифровой аскет',
    desc:'Ты не гонишься за красивым символом. Тебе нужен надёжный инструмент, который решает задачи без лишних затрат и без лишнего пафоса.',
    match:(s)=>s.emotionalBias<35&&s.rationality>60&&s.statusMotivation<30
  },
  {
    id:'professional_creator',name:'Профессиональный создатель',
    desc:'Для тебя техника — это рабочий станок. Если устройство ускоряет создание результата, оно оправдывает себя сполна.',
    match:(s)=>s.profFit>75&&s.workloadProfile>65
  },
  {
    id:'comfort_techie',name:'Комфортный технарь',
    desc:'Ты разбираешься в технике, но ценишь не сложность, а комфортную, тихую и предсказуемую среду без лишнего шума.',
    match:(s)=>s.techFlex>50&&s.ecosystemComfort>55
  },
  {
    id:'status_user',name:'Пользователь статуса',
    desc:'Для тебя важна не только функция, но и то, что покупка говорит о твоём вкусе, уровне и собранности. И это нормально.',
    match:(s)=>s.statusMotivation>60&&s.premiumDesire>55
  },
  {
    id:'cautious_optimizer',name:'Осторожный оптимизатор',
    desc:'Ты проверяешь, не продают ли тебе красивую обёртку вместо реальной пользы. Твоё решение должно выдерживать спокойную перепроверку.',
    match:(s)=>s.rationality>65&&s.overpayRisk>50
  },
  {
    id:'overestimator',name:'В поиске вдохновения',
    desc:'У тебя есть искренний интерес к MacBook, и он не полностью про задачи. Часть мотивации — в образе, в ощущении, в предвкушении. И это тоже важная часть решения.',
    match:(s)=>s.needScore<50&&s.premiumDesire>55
  },
  {
    id:'ecosystem_person',name:'Человек экосистемы',
    desc:'Ты ценишь, когда техника не спорит с тобой в мелочах. Комфорт, интеграция и ощущение «всё просто работает» для тебя значат очень много.',
    match:(s)=>s.ecosystemComfort>65
  },
  {
    id:'platform_agnostic',name:'Непринципиальный пользователь',
    desc:'Ты не привязываешься к платформе. Если задача решается удобно и без боли — какая разница, что под капотом?',
    match:(s)=>s.ecosystemComfort<45&&s.altSuitability>55
  }
];

const VERDICTS = [
  {
    id:'BUY_MACBOOK_CONFIDENT',threshold:70,
    title:'MacBook тебе действительно нужен',
    sub:'В твоём профиле это не каприз, а осознанный рабочий инструмент.',
    exec:'Твоя нагрузка, сценарии и общая конфигурация потребностей дают достаточно оснований считать покупку практической. Здесь MacBook — не мечта, а логичное решение.'
  },
  {
    id:'BUY_MACBOOK_RATIONAL',threshold:56,
    title:'Скорее да, чем нет — в разумной конфигурации',
    sub:'Идея MacBook тебе подходит, а переплата за лишний запас — уже нет.',
    exec:'Аргументы в пользу MacBook есть, и они звучат убедительно. Но максимальная конфигурация здесь не обязательна — бери ровно столько, сколько нужно для дела.'
  },
  {
    id:'BUY_IF_ECOSYSTEM_MATTERS',threshold:42,
    title:'Хороший вариант, но не единственный',
    sub:'MacBook подходит, но у тебя есть и другие пути.',
    exec:'Ты получишь от MacBook приятный и цельный опыт, но твои задачи не делают его единственно правильным решением. Здесь вопрос скорее в удобстве и вкусе.'
  },
  {
    id:'GOOD_LAPTOP_NOT_NECESSARILY_MAC',threshold:28,
    title:'Тебе нужен отличный ноутбук — неважно, с каким логотипом',
    sub:'Потребность реальна. А вот бренд — не обязательное условие.',
    exec:'У тебя есть понятный сценарий для покупки, но MacBook не выглядит критически необходимым. Хорошая альтернатива может закрыть задачи не хуже, а иногда и рациональнее.'
  },
  {
    id:'DESIRE_STRONGER_THAN_NEED',threshold:14,
    title:'Желание здесь сильнее практической нужды — и это нормально',
    sub:'Тебя привлекает не только функция, но и образ. Это не плохо — это честно.',
    exec:'В твоём профиле заметна искренняя симпатия к MacBook, но функциональные аргументы не доминируют. Вопрос в другом: даст ли тебе эта покупка достаточно радости и комфорта, чтобы оправдать себя?'
  },
  {
    id:'EMOTIONAL_PURCHASE_ALERT',threshold:0,
    title:'Сейчас это скорее про эмоции, чем про задачи',
    sub:'В покупке больше красивого желания, чем рабочей необходимости.',
    exec:'При текущем сценарии и мотивации покупка больше похожа на эмоциональное решение. Это не стыдно, но стоит честно спросить себя: «Я покупаю инструмент или впечатление?» И если впечатление — сделает ли оно жизнь реально приятнее?'
  }
];

const INSIGHT_CATEGORIES = [
  {
    id:'bio',title:'Биометрические и возрастные',
    intro:'Эти выводы — не про цифры, а про ритм жизни и то, насколько ты готов к долгому осознанному решению.',
    pool:[
      (s)=>`Твой текущий жизненный этап ${s.ageCoeff>0.75?'скорее располагает':'скорее не располагает'} к осознанной долгой покупке — здесь важнее не возраст, а устойчивость твоих привычек.`,
      (s)=>`По возрастному коэффициенту (${(s.ageCoeff*100).toFixed(0)}%) твой профиль ближе к сценарию ${s.ageCoeff>0.8?'устоявшегося выбора':s.ageCoeff>0.65?'осмысленной покупки':'поиска с внутренним диалогом'}.`,
      (s)=>`Здесь важен не возраст сам по себе, а то, насколько твой ритм жизни уже требует предсказуемого и приятного инструмента.`
    ],
    severity:['','','']
  },
  {
    id:'work',title:'Рабочие привычки',
    intro:'Тут видно, насколько устройство должно вписываться в твой ежедневный ритм — или раздражать своей неидеальностью.',
    pool:[
      (s)=>`При нагрузке ${s.hoursLabel} часов в день автономность и стабильность — уже не рекламные обещания, а заметная часть ежедневного комфорта.`,
      (s)=>`Твой темп работы ${s.hoursLabel>6?'делает':'почти не делает'} бесшовность заметным фактором — но если она есть, ты это оценишь.`,
      (s)=>`Чем выше экранная нагрузка (${s.hoursLabel} ч/д), тем дороже обходятся не сам ноутбук, а мелкие раздражения от него.`,
      (s)=>`Твой режим ближе к профилю, где устройство либо незаметно помогает, либо ежедневно напоминает о себе неприятными мелочами.`
    ],
    severity:['','','','']
  },
  {
    id:'cognitive',title:'Когнитивный и поведенческий стиль',
    intro:'Этот слой — про то, сколько терпения у тебя к техническим мелочам и насколько ты готов мириться с неидеальностью.',
    pool:[
      (s)=>`В твоём профиле заметна ${s.techFlex<35?'низкая':s.techFlex<65?'умеренная':'высокая'} терпимость к техническому трению — и это серьёзно влияет на выбор.`,
      (s)=>`Ты ${s.techFlex>55?'скорее готов':'скорее не готов'} мириться с ручной донастройкой ради экономии — и это важный сигнал.`,
      (s)=>`Есть ощущение, что ты ценишь технику, которая не требует постоянного твоего внимания.`,
      (s)=>`Твой стиль — не максимум контроля, а минимум лишнего трения. И это нормально: хорошая техника не должна быть подвигом.`
    ],
    severity:['','','','']
  },
  {
    id:'mobility_life',title:'Мобильность и образ жизни',
    intro:'Здесь становится понятно, насколько тебе важен ноутбук как спутник, а не просто как стационарный инструмент.',
    pool:[
      (s)=>`Твоя подвижность ${s.mobility>55?'делает':'не делает'} лёгкость и автономность аргументами первой линии.`,
      (s)=>`Если ноутбук часто оказывается вне стола (индекс мобильности ${s.mobility}%), вес и скорость пробуждения начинают ощущаться иначе.`,
      (s)=>`Твой образ жизни ${s.mobility>60?'усиливает':'почти не усиливает'} ценность устройства как всегда готового рабочего объекта.`,
      (s)=>`Мобильность в твоём случае — это ${s.mobility>65?'реальный сценарий':s.mobility>35?'приятный бонус':'скорее стационарный вариант'}.`
    ],
    severity:['','','','']
  },
  {
    id:'financial',title:'Финансовая рациональность',
    intro:'Система смотрит, выдерживает ли идея покупки проверку бюджетом и здравым смыслом.',
    pool:[
      (s)=>`Идея покупки ${s.rationality>55?'вполне вписывается':'не очень вписывается'} в твой бюджетный контур — это стоит учитывать.`,
      (s)=>`Риск переплатить за бренд — ${s.overpayRisk<35?'ниже':s.overpayRisk<60?'в пределах нормы':'выше'} комфортного порога (${s.overpayRisk.toFixed(0)}%). Не критично, но повод подумать о конфигурации.`,
      (s)=>`Покупка будет ощущаться оправданной, если устройство действительно войдёт в частое использование — не дай ему пылиться.`,
      (s)=>`Здесь важно не купить не ноутбук, а красивую историю про него. Но если эта история делает тебя счастливее каждый день — может, оно того стоит?`
    ],
    severity:['rational','','warning','']
  },
  {
    id:'status',title:'Статусная мотивация',
    intro:'Этот блок не про осуждение — он про честность с самим собой.',
    pool:[
      (s)=>`В твоей мотивации ощущается ${s.statusMotivation<30?'лёгкий':s.statusMotivation<60?'заметный':'выраженный'} интерес к премиальному опыту.`,
      (s)=>`Часть привлекательности MacBook для тебя — не только в функциях, но и в ощущении качественного, законченного объекта. И это абсолютно нормально.`,
      (s)=>`Статусный компонент здесь ${s.statusMotivation<30?'не на первом месте':s.statusMotivation<60?'присутствует':'довольно заметен'}. Просто держи это в голове при выборе.`,
      (s)=>`Похоже, ты покупаешь не просто инструмент, а ещё и визуально-психологическое подтверждение своего вкуса. Это имеет ценность.`
    ],
    severity:['','','strong','']
  },
  {
    id:'ecosystem_insight',title:'Цифровая экосистема',
    intro:'Наличие Apple-устройств сильно меняет картину — бесшовность становится не абстракцией, а повседневным опытом.',
    pool:[
      (s)=>`У тебя ${s.appleCount>0?'есть Apple-устройства ('+s.appleCount+'), и это заметно повышает ценность экосистемного опыта.':'пока нет Apple-устройств — экосистемная бесшовность для тебя скорее гипотетический бонус.'}`,
      (s)=>`${s.appleCount>2?'С таким набором устройств MacBook станет не просто ноутбуком, а центром экосистемы.':s.appleCount>0?'Даже одно Apple-устройство делает связку с MacBook заметно приятнее.':'Без своего Apple-девайса эффект экосистемы ты ощутишь не сразу.'}`,
      (s)=>`${s.ecosystemComfort>60?'Экосистемный комфорт в твоём профиле — полноценное основание для выбора MacBook. Это не маркетинг, а реальный everyday-опыт.':''}`,
      (s)=>`Наличие iPhone и AirPods одновременно даёт особый уровень бесшовности, который сложно получить на других платформах.`
    ],
    severity:['','','rational','']
  },
  {
    id:'tech_tolerance',title:'Техническая терпимость',
    intro:'Тут понятно, насколько тебе подходит бесшовный опыт — и насколько ты готов за это платить.',
    pool:[
      (s)=>`Твоя терпимость к настройке ${s.techFlex>55?'снижает':'повышает'} ценность бесшовной системы — и это важный фактор.`,
      (s)=>`Чем меньше ты готов возиться с техникой, тем выше для тебя ценность скрытого ежедневного удобства.`,
      (s)=>`Ты ${s.techFlex>55?'способен':'не склонен'} обменять гладкость на гибкость — и это определяет, насколько для тебя интересны альтернативы.`,
      (s)=>`Этот параметр заметно влияет на то, насколько Windows-альтернативы выглядят для тебя живыми.`
    ],
    severity:['','','','']
  },
  {
    id:'professional',title:'Профессиональная совместимость',
    intro:'Здесь система связывает твои задачи с тем, что именно должен делать хороший ноутбук.',
    pool:[
      (s)=>`Твои задачи ${s.profFit>70?'поддерживают':s.profFit>50?'частично поддерживают':'почти не требуют'} выбора MacBook как рабочего инструмента.`,
      (s)=>`Профессиональный профиль ${s.profFit>65?'даёт':'не даёт'} веса аргументу «это нужно для работы».`,
      (s)=>`Твой сценарий ближе к ${s.profFit>70?'производственной необходимости':s.profFit>50?'комфортному предпочтению':'символической симпатии'}.`,
      (s)=>`Устройство может стать частью твоего рабочего потока, а не просто красивой покупкой — и это один из главных аргументов.`
    ],
    severity:['rational','','','']
  },
  {
    id:'risk',title:'Зона внимания',
    intro:'Не страшилка, а честный разговор: где решение выглядит устойчивым, а где стоит притормозить и подумать.',
    pool:[
      (s)=>`После спокойной перепроверки решение выглядит ${s.overpayRisk<35?'вполне устойчивым':s.overpayRisk<60?'обоснованным, но с нюансами':'таким, где стоит сделать паузу'}.`,
      (s)=>`Есть риск выбрать конфигурацию, которая радует на кассе больше, чем в повседневной жизни — присмотрись к базовой версии.`,
      (s)=>`В твоём профиле важно разделить «хочу законченный продукт» и «мне правда нужен именно он».`,
      (s)=>`Чем выше эмоциональная компонента (${s.emotionalBias.toFixed(0)}%), тем внимательнее стоит оценить реальную частоту использования — но сама по себе эмоция не делает решение плохим.`
    ],
    severity:['','risk','strong','warning']
  },
  {
    id:'alternative',title:'Альтернативный взгляд',
    intro:'Система показывает, насколько MacBook незаменим — или рядом есть другие достойные варианты.',
    pool:[
      (s)=>`Хорошая альтернатива на Windows ${s.altSuitability>65?'вполне может':s.altSuitability>40?'может частично':'вряд ли'} закрыть твой сценарий не хуже.`,
      (s)=>`Самая разумная версия решения здесь — это ${s.needScore>70?'MacBook Air в хорошей комплектации':s.needScore>55?'MacBook Pro в базе':s.altSuitability>60?'присмотреться к хорошему Windows-ультрабуку':'пока не торопиться с покупкой'}.`,
      (s)=>`Возможно, тебе нужен не конкретный бренд, а просто предсказуемый, приятный и тихий ноутбук.`,
      (s)=>`Если убрать из уравнения магию бренда, реальная потребность лежит в классе устройства, а не в названии. Но магия тоже имеет значение.`
    ],
    severity:['','rational','','']
  }
];

const RUSSIAN_LABELS = {
  needScore:'Индекс совместимости','Professional Fit':'Проф. пригодность',
  Mobility:'Мобильность',Rationality:'Рациональность',
  statusMotivation:'Статусная мотивация',premiumDesire:'Премиальный интерес',
  altSuitability:'Альтернативы',overpayRisk:'Риск переплаты',
  ecosystemComfort:'Экосистемный комфорт'
};

const SEVERITY_CLASS_MAP = {
  'слабый сигнал':'','устойчивый паттерн':'strong','strong':'strong',
  'зона риска':'risk','risk':'risk','рациональное основание':'rational','rational':'rational',
  'эмоциональный маркер':'','практический аргумент':'rational',
  'сигнал комфорта':'','зона внимания':'warning','warning':'warning'
};

const SEVERITY_POOL = ['практический аргумент','устойчивый паттерн','зона внимания','рациональное основание','эмоциональный маркер','сигнал комфорта'];
const CONFIDENCE_POOL = ['низкая уверенность','умеренная уверенность','высокая уверенность'];

const NARRATIVE_SECTIONS = [
  {
    title:'Кто ты как пользователь техники',
    intro:'Портрет твоего взаимодействия с устройствами.',
    text:(s)=>`По твоему профилю ты не просто «пользователь ноутбука» — ты относишься к определённому типу взаимодействия с техникой. ${s.hoursLabel>6?'Твоя ежедневная нагрузка ('+s.hoursLabel+' ч) говорит о том, что компьютер для тебя — не эпизод, а среда обитания.':s.hoursLabel>3?'Компьютер занимает важное, но не тотальное место в твоём дне. Ты оцениваешь устройство по качеству ключевых сценариев.':'Экранное время невысоко — для тебя ноутбук скорее специализированный инструмент для конкретных задач.'} ${s.mobility>55?'Твой образ жизни достаточно подвижен, чтобы вес и автономность имели значение не на бумаге, а в реальном ежедневном опыте.':'Твой сценарий в основном стационарен, и портативность не является критическим фактором.'}`
  },
  {
    title:'Что для тебя реально важно в ноутбуке',
    intro:'Приоритеты, очищенные от маркетинга и рекламных обещаний.',
    text:(s)=>`Если убрать шум, в твоём случае на первый план выходят конкретные качества. ${s.ecosystemComfort>60?'Бесшовность и отсутствие трения в повседневном использовании — это то, что ты будешь замечать каждый день. И это дорогого стоит.':s.techFlex>55?'Гибкость и возможность настроить систему под себя для тебя важнее коробочного комфорта.':'Стабильность и предсказуемость — вот что действительно влияет на твой опыт.'} ${s.profFit>65?'Рабочие задачи формируют запрос на производительность — не рекордную, а предсказуемую и достаточную.':'Твой сценарий не требует максимальной мощности, и здесь комфорт использования весит больше, чем сырая производительность.'}`
  },
  {
    title:'Где MacBook для тебя оправдан',
    intro:'Факторы, которые работают в пользу этого решения.',
    text:(s)=>`В твоей конфигурации есть несколько факторов, которые делают идею MacBook сильнее, чем кажется на первый взгляд. ${s.ecosystemComfort>55?'Бесшовная экосистема, быстрый старт, минимальное трение — это те качества, за которые платят премию, и у тебя они не абстракция.':''} ${s.mobility>60?'Лёгкость, мгновенный выход из сна и долгая автономность — это не характеристики, а заметная разница в ежедневном опыте для твоего ритма жизни.':''} ${s.profFit>70?'С точки зрения профессиональных задач macOS предлагает среду, которая снижает количество мелких помех в работе.':''}`
  },
  {
    title:'Где MacBook может оказаться переоценён',
    intro:'Моменты, где стоит посмотреть на ситуацию чуть шире.',
    text:(s)=>`Одновременно есть точки, где привлекательность MacBook может превышать практическую пользу. ${s.altSuitability>55?'Твои задачи не настолько уникальны, чтобы их нельзя было закрыть качественной альтернативой за другие деньги. Это не отменяет MacBook, но снимает с него ореол единственности.':''} ${s.overpayRisk>45?'Риск переплаты заметен — не потому что ты неосмотрителен, а потому что часть мотивации лежит в эмоциональной плоскости.':''} ${s.statusMotivation>50?'Статусная составляющая есть, и если её не замечать, она может сместить фокус с поиска удобного инструмента на покупку красивого образа.':''}`
  },
  {
    title:'Что в твоей мотивации рационально, а что — эмоционально',
    intro:'Честное разделение прагматики и эстетики в твоём решении.',
    text:(s)=>`Твоё желание нельзя назвать чистым импульсом, но и чистой функцией оно тоже не исчерпывается. ${s.rationality>55?'Рациональная компонента достаточно сильна: ты склонен проверять, сравнивать и не поддаваться первому порыву.':''} С другой стороны, ${s.emotionalBias>45?'эмоциональный фон заметен — тебя привлекает не только то, что устройство делает, но и то, как оно выглядит и что означает.':''} ${s.premiumDesire>50?'Стремление к законченному премиальному продукту — это не ошибка. Важно понять, сколько в этом решении рабочей необходимости, а сколько — эстетического предпочтения. И то и другое имеет право на существование.':''}`
  },
  {
    title:'Где есть зона внимания',
    intro:'Не страшилка, а повод присмотреться внимательнее.',
    text:(s)=>`Ключевой вопрос не в том, «стоит ли покупать», а в том, какую именно ценность ты ищешь. ${s.overpayRisk>50?'Риск переплаты выше среднего — стоит быть внимательным при выборе конфигурации: не брать запас мощности, который не пригодится.':''} ${s.statusMotivation>55?'Если статусная мотивация не уравновешена рациональной проверкой, решение может сдвинуться в сторону максимальной конфигурации, которая радует на кассе больше, чем в работе.':''} ${s.premiumDesire>60?'Премиальный слой мотивации увеличивает готовность платить — и это нормально, если бюджет позволяет.':''} Главное — чтобы покупка оставалась радостью, а не поводом для оправданий.`
  },
  {
    title:'Какая стратегия выглядит разумной',
    intro:'Практичный план, как подойти к решению.',
    text:(s)=>`Самый здоровый путь — не отвечать на вопрос «хочу или не хочу», а разобрать решение по слоям. ${s.needScore>60?'Первый слой — функциональный: твой профиль показывает, что MacBook может быть не декорацией, а реальным инструментом.':''} ${s.rationality>50?'Второй слой — бюджетный: определи комфортную сумму и не выходи за неё в погоне за «премиальным запасом».':''} ${s.altSuitability>50?'Третий слой — сравнительный: посмотри на альтернативы не как на компромисс, а как на честную проверку — за что именно ты платишь разницу.':''} ${s.needScore>65?'Итог: покупка оправдана, но в разумной конфигурации под твои задачи, а не «на вырост».':s.needScore>45?'Итог: присмотреться, сравнить вживую, проверить свои ощущения.':'Итог: пока без спешки. Вернись к вопросу через пару месяцев — если желание останется, оно станет только осознаннее.'}`
  },
  {
    title:'Какие альтернативы стоит рассмотреть',
    intro:'Объективный взгляд на другие возможности — без иллюзий, но и без предубеждений.',
    text:(s)=>`Если смотреть на задачу честно, становятся видны и другие траектории. ${s.altSuitability>60?'Windows-ультрабуки высокого класса (Dell XPS, Lenovo Yoga, ASUS ZenBook) могут закрыть твой сценарий с минимальной разницей в опыте — особенно если ты не привязан к экосистеме.':''} ${s.altSuitability>45&&s.techFlex>50?'Хорошая рабочая станция на Windows с возможностью настройки может дать больше гибкости за те же или меньшие деньги.':''} ${s.ecosystemComfort<50?'Если экосистемная бесшовность для тебя не критична, альтернативы становятся ещё более привлекательными.':''} Самое главное — не давать красивой упаковке затмевать вопрос: сделает ли это устройство мою жизнь реально удобнее, приятнее и спокойнее?`
  }
];

const ANALYSIS_STAGES = [
  {name:'Обработка персональных данных',sub:'Нормализация входных параметров',logs:[0,1,2]},
  {name:'Определение жизненного этапа',sub:'Калибровка возрастного профиля',logs:[3,4,5]},
  {name:'Сборка рабочего профиля',sub:'Построение нагрузочной модели',logs:[6,7,8]},
  {name:'Анализ экранной нагрузки',sub:'Вычисление интенсивности использования',logs:[9,10,11]},
  {name:'Построение мобильного контура',sub:'Оценка подвижности и сценариев',logs:[12,13,14]},
  {name:'Отделение желания от необходимости',sub:'Анализ эмоциональной мотивации',logs:[15,16,17]},
  {name:'Сопоставление с архетипами',sub:'Поиск поведенческих паттернов',logs:[18,19,20]},
  {name:'Поиск внутренних противоречий',sub:'Проверка согласованности профиля',logs:[21,22,23]},
  {name:'Генерация инсайтов',sub:'Построение матрицы выводов',logs:[24,25,26]},
  {name:'Подготовка итогового досье',sub:'Сборка финального отчёта',logs:[27,28,29]}
];

const LOG_POOL = [
  'Подключение модуля поведенческой интерпретации…',
  'Нормализуем входные параметры…',
  'Уточняем контекст использования…',
  'Приводим возрастной профиль к рабочей модели…',
  'Оцениваем стабильность пользовательских привычек…',
  'Анализируем длительность экранной нагрузки…',
  'Формируем базовый нагрузочный профиль…',
  'Сверяем желание с необходимостью…',
  'Калибруем коэффициент жизненного этапа…',
  'Сопоставляем возраст с устойчивостью сценариев…',
  'Выделяем профессиональное ядро…',
  'Строим контур вычислительной нагрузки…',
  'Уточняем рабочую интенсивность…',
  'Анализируем тип цифровой усталости…',
  'Проверяем чувствительность к трению…',
  'Формируем модель мобильного поведения…',
  'Оцениваем частоту перемещений…',
  'Сверяем профиль с мобильным сценарием…',
  'Вычисляем ценность автономности…',
  'Уточняем влияние веса и форм-фактора…',
  'Анализируем вероятность покупки «ради ощущения»…',
  'Отделяем символ от функции…',
  'Оцениваем статусную составляющую…',
  'Проверяем премиальный уклон мотивации…',
  'Уточняем эмоциональную компоненту…',
  'Соотносим бюджет с ожидаемой ценностью…',
  'Оцениваем риск переплаты…',
  'Проверяем предел рационального бюджета…',
  'Сопоставляем сценарий с классом устройства…',
  'Ищем жизнеспособные альтернативы…',
  'Оцениваем терпимость к настройке…',
  'Уточняем совместимость с альтернативами…',
  'Анализируем склонность к экосистемному комфорту…',
  'Строим кривую чувствительности к трению…',
  'Сопоставляем нагрузку с типом устройства…',
  'Сравниваем с паттернами пользователей macOS…',
  'Ищем признаки избыточной конфигурации…',
  'Уточняем профессиональный профиль…',
  'Проверяем устойчивость решения при ограниченном бюджете…',
  'Сверяем мотивацию с реальной частотой использования…',
  'Выделяем сигнал профессиональной необходимости…',
  'Формируем объяснимый слой решения…',
  'Считаем индекс поведенческой совместимости…',
  'Проверяем конфликт рациональности и желания…',
  'Классифицируем по архетипическому ядру…',
  'Уточняем вторичный архетип…',
  'Генерируем карту аргументов «за»…',
  'Генерируем карту аргументов «против»…',
  'Считаем силу альтернативного сценария…',
  'Уточняем порог оправданности…',
  'Собираем объяснимые основания…',
  'Перепроверяем профиль на противоречия…',
  'Уточняем коэффициент премиального уклона…',
  'Проверяем риск эмоционального решения…',
  'Формируем структуру инсайтов…',
  'Упаковываем сводку…',
  'Собираем итоговое досье…',
  'Рендерим персональный профиль…',
  'Завершаем кросс-проверку…',
  'Готовим заключение…',
  'Финальная калибровка индексов…',
  'Подтверждаем согласованность вывода…',
  'Собираем финальную матрицу рекомендаций…',
  'Готовим расширенный отчёт…',
  'Структурируем итоговые выводы…',
  'Активируем режим вывода результатов…'
];

const MODULE_CHIPS = [
  'Когнитивный слой','Контур мобильности','Модуль мотива покупки','Модель трения',
  'Слой совместимости с macOS','Индекс рациональности','Датчик премиального уклона','Матрица альтернатив'
];

const REC_LIFE_IMPROVEMENTS = [
  'Меньше ежедневного трения и раздражения от мелочей',
  'Приятнее и спокойнее рабочий ритуал',
  'Больше желания садиться за задачи',
  'Меньше «танцев с бубном» и технических пауз',
  'Приятнее ежедневный контакт с инструментом',
  'Ощущение качества, собранности и завершённости'
];

const REC_CHECKS = [
  'как часто ноутбук реально будет использоваться — не купишь ли ты «писалку для одного письма в день»',
  'нужен ли именно MacBook — или просто тихий, лёгкий и приятный ноутбук',
  'насколько для тебя важна экосистемная бесшовность (iPhone, iPad, AirPods)',
  'будет ли удовольствие от использования частью реальной ценности',
  'не покупается ли устройство как очень краткая эмоциональная компенсация вместо долгого комфорта'
];

function calcAge(dateStr, yearOnly, yearVal) {
  const now = new Date();
  let birth;
  if (yearOnly && yearVal) {
    birth = new Date(+yearVal, 0, 1);
  } else if (dateStr) {
    birth = new Date(dateStr);
  } else {
    return {age:30,coeff:0.84};
  }
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  if (isNaN(age) || age < 16) age = 30;
  if (age > 90) age = 90;
  let coeff = 0.84;
  for (const r of AGE_RANGES) {
    if (age <= r.max) { coeff = r.coeff; break; }
  }
  return {age,coeff};
}

function calcFromForm(data) {
  const ageInfo = calcAge(data.birthDate, data.birthYearOnly, data.birthYear);
  const prof = PROFESSIONS[data.profession] || PROFESSIONS.other;
  const hours = SCREEN_HOURS_MAP[data.screenHours] || 58;
  const hoursLabel = SCREEN_HOURS_LABEL[data.screenHours] || 6;
  const budget = BUDGET_MAP[data.budget] || BUDGET_MAP.moderate;
  const scenario = SCENARIO_MAP[data.scenario] || SCENARIO_MAP.mixed;
  const mobilityRaw = MOBILITY_MAP[data.mobility] || 42;
  const statusInfo = STATUS_MAP[data.statusImportance] || STATUS_MAP[2];
  const tolInfo = TOLERANCE_MAP[data.techTolerance] || TOLERANCE_MAP[3];
  const appleDevices = data.appleDevices || [];
  const hasNone = appleDevices.includes('none') || appleDevices.length === 0;
  const appleCount = hasNone ? 0 : appleDevices.length;
  const appleEcosystemBonus = hasNone ? 0 : Math.min(30, appleCount * 6 + (appleDevices.includes('iphone') && appleDevices.includes('airpods') ? 8 : 0) + (appleDevices.includes('iphone') && appleDevices.includes('ipad') ? 6 : 0));

  const workload = hours;
  const professionalFitBase = prof.profFit;
  const scenarioNeedBase = scenario.need || 0;
  const scDelta = (scenario.profFit || 55) - 55;

  const workloadProfile = clamp(0.60 * workload + 0.25 * professionalFitBase + 0.15 * Math.max(0,scenarioNeedBase + 50));
  const mobilityProfile = clamp(0.70 * mobilityRaw + 0.20 * (scenario.mobility || 0) + 0.10 * (prof.mobility || 0));

  const ecosystemBase = tolInfo.eco;
  const professionEco = (data.profession === 'creative' || data.profession === 'dev') ? 10 : (data.profession === 'office' ? 5 : 0);
  const mobilityEcoBias = mobilityRaw > 60 ? 8 : 0;
  const ecosystemComfort = clamp(ecosystemBase + professionEco + mobilityEcoBias + appleEcosystemBonus);

  const statusMotivation = clamp(statusInfo.s + (prof.statusMot || 0) + (budget.statusMot || 0));
  const premiumDesire = clamp(statusInfo.p + (prof.premiumDesire || 0) + (scenario.premiumDesire || 0) + ecosystemComfort * 0.14);
  const rationality = clamp(50 + (budget.rationality || 0) + (prof.rationality || 0) - statusMotivation * 0.12 - premiumDesire * 0.06 + tolInfo.flex * 0.06);
  const techFlex = clamp(tolInfo.flex + (prof.techFlex || 0));
  const altSuitability = clamp((scenario.altSuit || 0) + techFlex * 0.20 + (budget.rationality ? budget.rationality * 0.3 : 0) - ecosystemComfort * 0.15 - mobilityRaw * 0.10);
  const overpayRisk = clamp(0.28 * statusMotivation + 0.18 * premiumDesire + 0.14 * altSuitability - 0.26 * rationality - 0.10 * professionalFitBase);

  const profFit = clamp(professionalFitBase + scDelta + workload * 0.22);
  const mobility = mobilityProfile;

  const emotionalBias = clamp(0.38 * statusMotivation + 0.28 * premiumDesire + 0.14 * ecosystemComfort - 0.18 * rationality);

  let needScore = clamp(
    0.26 * profFit + 0.20 * mobility + 0.20 * workloadProfile + 0.12 * ecosystemComfort +
    0.08 * (ageInfo.coeff * 100) + 0.14 * premiumDesire - 0.08 * altSuitability - 0.04 * overpayRisk
  );

  // Positive synergy bonuses
  let bonus = 0;
  if (profFit >= 75 && workloadProfile >= 70) bonus += 5;
  if (mobility >= 65 && ecosystemComfort >= 65) bonus += 4;
  if (premiumDesire >= 65 && rationality >= 45) bonus += 3;
  if (professionalFitBase >= 70 && mobilityRaw >= 65 && workload >= 65) bonus += 5;
  if (ecosystemComfort >= 70 && premiumDesire >= 60 && statusMotivation >= 50 && rationality >= 40) bonus += 3;
  needScore = clamp(needScore + bonus);

  return {
    needScore, profFit, mobility, rationality, statusMotivation,
    premiumDesire, altSuitability, techFlex, overpayRisk,
    workloadProfile, mobilityProfile, emotionalBias, ecosystemComfort,
    workload, hoursLabel, appleCount, ageCoeff:ageInfo.coeff, age:ageInfo.age
  };
}

function clamp(v) { return Math.max(0, Math.min(100, v)); }

function findArchetypes(scores) {
  const matches = ARCHETYPES.map(a => ({...a, score: a.match(scores) ? 1 : 0}))
    .filter(m => m.score > 0);
  if (matches.length === 0) return {primary:ARCHETYPES[1], secondary:ARCHETYPES[6]};
  if (matches.length === 1) return {primary:matches[0], secondary:ARCHETYPES[6]};
  return {primary:matches[0], secondary:matches[1]};
}

function findVerdict(needScore) {
  for (const v of VERDICTS) {
    if (needScore >= v.threshold) return v;
  }
  return VERDICTS[VERDICTS.length - 1];
}

function generateInsights(scores) {
  const used = new Set();
  const insights = [];
  let cardIdx = 0;
  for (const cat of INSIGHT_CATEGORIES) {
    const cards = [];
    for (const gen of cat.pool) {
      const raw = gen(scores);
      const text = (typeof raw === 'string') ? raw : '';
      if (!text || used.has(text)) continue;
      used.add(text);
      const sevIdx = cat.severity[cards.length] || '';
      const sevLabel = sevIdx || SEVERITY_POOL[cardIdx % SEVERITY_POOL.length];
      cards.push({text, severity:sevLabel});
      cardIdx++;
    }
    insights.push({...cat, cards});
  }
  return insights;
}

class App {
  constructor() {
    this.state = 'hero';
    this.data = null;
    this.scores = null;
    this.archTypes = null;
    this.verdict = null;
    this.insights = null;
    this.mode = 'full';
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]');
      if (!action) return;
      const act = action.dataset.action;
      switch(act) {
        case 'start': this.go('mode'); break;
        case 'back-hero': this.go('hero'); break;
        case 'back-mode': this.go('mode'); break;
        case 'start-form':
          document.getElementById('advancedFields').style.display = this.mode === 'quick' ? 'none' : '';
          this.go('form');
          break;
        case 'show-report': this.buildReport(); this.go('report'); break;
        case 'export-txt': this.exportTXT(); break;
        case 'export-json': this.exportJSON(); break;
        case 'print': window.print(); break;
        case 'restart': this.restart(); break;
      }
    });

    document.querySelectorAll('.mode-card').forEach(c => {
      c.addEventListener('click', () => {
        document.querySelectorAll('.mode-card').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        this.mode = c.dataset.mode;
      });
    });

    ['height','weight','statusImportance','techTolerance'].forEach(id => {
      const el = document.getElementById(id);
      const val = document.getElementById(id + 'Val');
      if (el && val) el.addEventListener('input', () => val.textContent = el.value);
    });

    const yoToggle = document.getElementById('birthYearOnly');
    const yoGroup = document.getElementById('birthYearGroup');
    if (yoToggle) {
      yoToggle.addEventListener('change', () => {
        yoGroup.style.display = yoToggle.checked ? 'block' : 'none';
      });
    }

    document.querySelectorAll('.card-select').forEach(group => {
      const isMulti = group.classList.contains('multi');
      group.querySelectorAll('.card-select-item').forEach(item => {
        item.addEventListener('click', () => {
          if (isMulti) {
            if (item.dataset.value === 'none') {
              group.querySelectorAll('.card-select-item').forEach(x => x.classList.remove('active'));
              item.classList.add('active');
            } else {
              group.querySelector('[data-value="none"]').classList.remove('active');
              item.classList.toggle('active');
            }
          } else {
            group.querySelectorAll('.card-select-item').forEach(x => x.classList.remove('active'));
            item.classList.add('active');
          }
        });
      });
    });

    document.querySelectorAll('.segmented-control').forEach(group => {
      group.querySelectorAll('.seg-item').forEach(item => {
        item.addEventListener('click', () => {
          group.querySelectorAll('.seg-item').forEach(x => x.classList.remove('active'));
          item.classList.add('active');
        });
      });
    });

    document.getElementById('userForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.collectFormData();
      this.renderPrelaunchChips();
      this.go('prelaunch');
    });

    document.getElementById('startAnalysisBtn').addEventListener('click', () => {
      this.runAnalysis();
    });

    this.go('hero');
  }

  renderPrelaunchChips() {
    const container = document.getElementById('prelaunchModules');
    container.innerHTML = '';
    MODULE_CHIPS.forEach(chip => {
      const el = document.createElement('span');
      el.className = 'module-chip';
      el.textContent = chip;
      container.appendChild(el);
    });
  }

  go(state) {
    this.state = state;
    document.body.dataset.state = state;
    window.scrollTo({top:0, behavior:'smooth'});
  }

  getSelected(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return null;
    const active = group.querySelector('.active');
    return active ? active.dataset.value : null;
  }

  getSelectedMulti(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return [];
    const active = group.querySelectorAll('.active');
    const values = Array.from(active).map(el => el.dataset.value);
    if (values.includes('none')) return ['none'];
    return values;
  }

  collectFormData() {
    this.data = {
      height: +document.getElementById('height').value,
      weight: +document.getElementById('weight').value,
      birthDate: document.getElementById('birthDate').value,
      birthYearOnly: document.getElementById('birthYearOnly').checked,
      birthYear: document.getElementById('birthYear').value,
      profession: this.getSelected('profession') || 'other',
      screenHours: this.getSelected('screenHours') || '5-6',
      budget: this.getSelected('budget') || 'moderate',
      scenario: this.getSelected('scenario') || 'mixed',
      mobility: this.getSelected('mobility') || 'occasional',
      appleDevices: this.getSelectedMulti('appleDevices'),
      statusImportance: +document.getElementById('statusImportance').value,
      techTolerance: +document.getElementById('techTolerance').value
    };
  }

  async runAnalysis() {
    this.go('analysis');
    this.scores = calcFromForm(this.data);
    this.archTypes = findArchetypes(this.scores);
    this.verdict = findVerdict(this.scores.needScore);
    this.insights = generateInsights(this.scores);

    const totalStages = ANALYSIS_STAGES.length;
    const totalDuration = this.mode === 'quick' ? 25000 : 50000;
    const progressCircle = document.getElementById('progressCircle');
    const percentEl = document.getElementById('analysisPercent');
    const stageEl = document.getElementById('analysisStage');
    const subEl = document.getElementById('analysisSub');
    const timeline = document.getElementById('analysisTimeline');
    const logEl = document.getElementById('analysisLog');
    const chipsEl = document.getElementById('analysisChips');
    const circumference = 427.3;

    // Build timeline dots once
    timeline.innerHTML = '';
    for (let j = 0; j < totalStages; j++) {
      const dot = document.createElement('span');
      dot.className = 'tl-dot';
      timeline.appendChild(dot);
    }

    this.animateChips(chipsEl);

    for (let i = 0; i < totalStages; i++) {
      const stage = ANALYSIS_STAGES[i];
      stageEl.textContent = stage.name;
      subEl.textContent = stage.sub;

      // Update timeline dots in-place
      const dots = timeline.children;
      for (let j = 0; j < totalStages; j++) {
        dots[j].className = 'tl-dot';
        if (j < i) dots[j].classList.add('done');
        if (j === i) dots[j].classList.add('current', 'pulse-dot');
      }

      // Progress
      const pct = Math.round(((i + 1) / totalStages) * 100);
      percentEl.textContent = pct;
      progressCircle.style.strokeDashoffset = circumference - (circumference * pct / 100);

      // Logs
      for (const li of stage.logs) {
        if (li < LOG_POOL.length) {
          await this.delay(400 + Math.random() * 300);
          const entry = document.createElement('div');
          entry.className = 'log-entry log-active';
          entry.textContent = LOG_POOL[li];
          logEl.appendChild(entry);
          logEl.scrollTop = 0;
          logEl.scrollTop = logEl.scrollHeight;
        }
      }

      if (i < totalStages - 1) {
        await this.delay(this.stageDelay(totalDuration, totalStages));
      } else {
        await this.delay(800);
        for (let k = 30; k < 40; k++) {
          if (k < LOG_POOL.length) {
            await this.delay(250);
            const entry = document.createElement('div');
            entry.className = 'log-entry log-active';
            entry.textContent = LOG_POOL[k];
            logEl.appendChild(entry);
            logEl.scrollTop = logEl.scrollHeight;
          }
        }
        await this.delay(600);
      }
    }

    percentEl.textContent = '100';
    progressCircle.style.strokeDashoffset = '0';
    stageEl.textContent = 'Анализ завершён';
    subEl.textContent = 'Формирую твоё персональное досье…';
    await this.delay(1000);
    this.showVerdict();
  }

  stageDelay(total, stages) { return (total / (stages * stages)) * (2 + Math.random()); }

  animateChips(container) {
    container.innerHTML = '';
    const shuffled = [...MODULE_CHIPS].sort(() => Math.random() - 0.5);
    shuffled.forEach((chip, i) => {
      setTimeout(() => {
        const el = document.createElement('span');
        el.className = 'module-chip active';
        el.textContent = chip;
        container.appendChild(el);
      }, i * 800);
    });
  }

  delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  showVerdict() {
    document.getElementById('verdictTitle').textContent = this.verdict.title;
    document.getElementById('verdictSub').textContent = this.verdict.sub;
    document.getElementById('verdictExecutive').textContent = this.verdict.exec;

    const ring = document.getElementById('verdictScoreRing');
    const num = document.getElementById('verdictScoreNum');
    const target = Math.round(this.scores.needScore);
    const circumference = 490.1;

    this.go('verdict');

    let current = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      num.textContent = current;
      ring.style.strokeDashoffset = circumference - (circumference * current / 100);
    }, 25);
  }

  buildReport() {
    if (!this.scores) return;
    const s = this.scores;

    document.getElementById('reportVerdictTitle').textContent = this.verdict.title;
    document.getElementById('reportVerdictSub').textContent = this.verdict.sub;
    document.getElementById('reportScoreNum').textContent = Math.round(s.needScore);

    this.buildDiagnosticsStrip(s);
    document.getElementById('archPrimaryName').textContent = this.archTypes.primary.name;
    document.getElementById('archPrimaryDesc').textContent = this.archTypes.primary.desc;
    document.getElementById('archSecondaryName').textContent = this.archTypes.secondary.name;
    document.getElementById('archSecondaryDesc').textContent = this.archTypes.secondary.desc;
    this.buildInsights();
    this.buildNarrative();
    this.buildRecommendation();
  }

  buildDiagnosticsStrip(s) {
    const items = [
      {key:'needScore',value:Math.round(s.needScore),pct:s.needScore},
      {key:'profFit',value:Math.round(s.profFit),pct:s.profFit,label:'Проф. пригодность'},
      {key:'mobility',value:Math.round(s.mobility),pct:s.mobility,label:'Мобильность'},
      {key:'rationality',value:Math.round(s.rationality),pct:s.rationality,label:'Рациональность'},
      {key:'status',value:Math.round(s.statusMotivation),pct:s.statusMotivation,label:'Статусная мотивация'},
      {key:'premium',value:Math.round(s.premiumDesire),pct:s.premiumDesire,label:'Премиальный интерес'},
      {key:'alt',value:Math.round(s.altSuitability),pct:s.altSuitability,label:'Альтернативы'},
      {key:'overpay',value:Math.round(s.overpayRisk),pct:s.overpayRisk,label:'Риск переплаты'},
      {key:'eco',value:Math.round(s.ecosystemComfort),pct:s.ecosystemComfort,label:'Экосистема'}
    ];

    const strip = document.getElementById('diagnosticsStrip');
    strip.innerHTML = items.map(item => {
      let cls = 'medium';
      if (item.pct > 66) cls = 'high';
      else if (item.pct < 33) cls = 'low';
      return `<div class="diag-item">
        <div class="diag-value">${item.value}</div>
        <div class="diag-label">${item.label}</div>
        <div class="diag-bar"><div class="diag-bar-fill ${cls}" style="width:${item.pct}%"></div></div>
      </div>`;
    }).join('');
  }

  buildInsights() {
    const matrix = document.getElementById('insightMatrix');
    matrix.innerHTML = this.insights.map(cat => {
      const cards = cat.cards.map(c => {
        const sev = c.severity || '';
        const txt = c.text || '';
        const cls = SEVERITY_CLASS_MAP[sev] || '';
        return `<div class="insight-card">
          <span class="insight-severity ${cls}">${sev}</span>
          <span class="insight-text">${txt}</span>
        </div>`;
      }).join('');
      return `<div class="insight-category">
        <h4 class="insight-category-title">${cat.title}</h4>
        <p class="insight-category-intro">${cat.intro}</p>
        <div class="insight-cards">${cards}</div>
      </div>`;
    }).join('');
  }

  buildNarrative() {
    const container = document.getElementById('narrativeReport');
    container.innerHTML = NARRATIVE_SECTIONS.map(s => {
      return `<div class="narrative-section">
        <h4 class="narrative-section-title">${s.title}</h4>
        <p class="narrative-intro">${s.intro}</p>
        <div class="narrative-text"><p>${s.text(this.scores)}</p></div>
      </div>`;
    }).join('');
  }

  buildRecommendation() {
    const s = this.scores;
    const container = document.getElementById('recommendationBlock');

    let deviceClass = 'MacBook Air';
    if (s.needScore > 70 && s.hoursLabel > 7) deviceClass = 'MacBook Pro';
    else if (s.altSuitability > 65) deviceClass = 'Windows-ультрабук высокого класса';

    container.innerHTML = `
      <div class="recommendation-final">
        <h4 class="rec-title">${this.verdict.title}</h4>
        <p class="rec-text">${this.verdict.exec}</p>
        <div class="rec-detail">
          <strong>Рекомендуемый класс:</strong> ${deviceClass}<br>
          <strong>Общий индекс совместимости:</strong> ${Math.round(s.needScore)}%<br>
          <strong>Уверенность вывода:</strong> ${s.needScore > 65 ? 'высокая' : s.needScore > 40 ? 'умеренная' : 'средняя'}<br>
          <strong>Стратегия:</strong> ${s.overpayRisk > 50 ? 'рациональная базовая конфигурация — бери ровно столько, сколько нужно для твоих задач' : 'комфортная конфигурация, соответствующая твоему сценарию'}
        </div>
      </div>
      <div class="rec-section">
        <h5 class="rec-section-title">Что эта покупка может упростить в твоей жизни</h5>
        <div class="rec-checklist">
          ${REC_LIFE_IMPROVEMENTS.map(i => `<div class="rec-check-item">${i}</div>`).join('')}
        </div>
      </div>
      <div class="rec-section">
        <h5 class="rec-section-title">Что стоит честно проверить перед покупкой</h5>
        <div class="rec-checklist">
          ${REC_CHECKS.map(c => `<div class="rec-check-item">${c}</div>`).join('')}
        </div>
      </div>
      <div class="rec-section">
        <h5 class="rec-section-title">Тактика решения</h5>
        <p style="font-size:0.9rem;color:var(--text-2);line-height:1.6">
          ${s.needScore > 60 ? 'Покупка оправдана. Выбирай объём памяти и диска под реальные задачи, а не «на всякий случай». Присмотрись к базовой или средней конфигурации.' : ''}
          ${s.needScore > 40 && s.needScore <= 60 ? 'Сравни с альтернативами вживую — обрати внимание на клавиатуру, экран и вес. Не торопись, дай себе пару дней подумать.' : ''}
          ${s.needScore <= 40 ? 'Пока без спешки. Проверь, не изменится ли твоя потребность через пару месяцев. Если желание останется — оно станет только осознаннее.' : ''}
          ${s.overpayRisk > 50 ? 'Особое внимание удели конфигурации: не переплачивай за запас мощности, который не будет использован. Базовая версия часто оказывается самой разумной.' : ''}
          ${s.ecosystemComfort > 60 ? 'Если у тебя уже есть iPhone, iPad или AirPods — экосистемный эффект сделает опыт заметно приятнее. Это реальная ценность, а не реклама.' : ''}
        </p>
      </div>`;
  }

  exportTXT() {
    const s = this.scores;
    const lines = [
      '========================================',
      'MACBOOK DECISION — Личное досье совместимости',
      '========================================',
      '',
      'Вердикт: ' + this.verdict.title,
      this.verdict.sub,
      '',
      'Индекс совместимости: ' + Math.round(s.needScore) + '%',
      '',
      '--- Индексы ---',
      'Проф. пригодность: ' + Math.round(s.profFit) + '%',
      'Мобильность: ' + Math.round(s.mobility) + '%',
      'Рациональность: ' + Math.round(s.rationality) + '%',
      'Статусная мотивация: ' + Math.round(s.statusMotivation) + '%',
      'Премиальный интерес: ' + Math.round(s.premiumDesire) + '%',
      'Альтернативы: ' + Math.round(s.altSuitability) + '%',
      'Риск переплаты: ' + Math.round(s.overpayRisk) + '%',
      'Техническая гибкость: ' + Math.round(s.techFlex) + '%',
      'Экосистемный комфорт: ' + Math.round(s.ecosystemComfort) + '%',
      '',
      '--- Архетипы ---',
      'Основной: ' + this.archTypes.primary.name,
      'Вторичный: ' + this.archTypes.secondary.name,
      '',
      '--- Executive Summary ---',
      this.verdict.exec,
      '',
      '--- Инсайты ---',
    ];

    for (const cat of this.insights) {
      lines.push('');
      lines.push(cat.title);
      for (const card of cat.cards) {
        lines.push('  [' + card.severity + '] ' + card.text);
      }
    }

    this.downloadFile(lines.join('\n'), 'macbook-decision-report.txt', 'text/plain');
  }

  exportJSON() {
    const data = {
      verdict: this.verdict.id,
      compatibilityScore: Math.round(this.scores.needScore),
      scores: {
        profFit: Math.round(this.scores.profFit),
        mobility: Math.round(this.scores.mobility),
        rationality: Math.round(this.scores.rationality),
        statusMotivation: Math.round(this.scores.statusMotivation),
        premiumDesire: Math.round(this.scores.premiumDesire),
        altSuitability: Math.round(this.scores.altSuitability),
        overpayRisk: Math.round(this.scores.overpayRisk),
        techFlex: Math.round(this.scores.techFlex),
        ecosystemComfort: Math.round(this.scores.ecosystemComfort)
      },
      archetypes: {
        primary: this.archTypes.primary.name,
        secondary: this.archTypes.secondary.name
      },
      verdictSummary: this.verdict.exec
    };
    this.downloadFile(JSON.stringify(data, null, 2), 'macbook-decision-data.json', 'application/json');
  }

  downloadFile(content, filename, mime) {
    const blob = new Blob([content], {type: mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  restart() {
    this.data = null;
    this.scores = null;
    this.archTypes = null;
    this.verdict = null;
    this.insights = null;
    document.getElementById('analysisLog').innerHTML = '';
    document.getElementById('analysisTimeline').innerHTML = '';
    document.getElementById('analysisChips').innerHTML = '';
    document.getElementById('analysisPercent').textContent = '0';
    document.getElementById('progressCircle').style.strokeDashoffset = '427.3';
    this.go('hero');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
