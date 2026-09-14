export type Point = {
  x: number;
  y: number;
  t: number;
  p: number;
};

export type Stroke = {
  points: Point[];
  color: string;
  width: number;
};

export type InkId = 'phosphor' | 'gold' | 'violet';

export const INKS: { id: InkId; color: string; label: string }[] = [
  { id: 'phosphor', color: '#D7FBF4', label: 'Светлый' },
  { id: 'gold', color: '#E4C56A', label: 'Золотой' },
  { id: 'violet', color: '#7B6CFF', label: 'Фиолетовый' },
];

export type Zone =
  | 'top_left'
  | 'top_right'
  | 'bottom_left'
  | 'bottom_right'
  | 'center'
  | 'spread';

export type QuadrantMass = [number, number, number, number];

export type RawMetrics = {
  strokeCount: number;
  totalLength: number;
  meanSpeed: number;
  maxSpeed: number;
  speedStd: number;
  pauseCount: number;
  idleRatio: number;
  meanAbsTurn: number;
  straightness: number;
  coverage: number;
  centroid: { x: number; y: number };
  quadrantMass: QuadrantMass;
  symmetry: number;
  gridAlignment: number;
  startZone: Zone;
  endZone: Zone;
  earlyLateBalance: number;
  colorCount: number;
  empty: boolean;
  pressureTrusted: boolean;
  durationMs: number;
};

export type Scores = {
  regulation: number;
  order: number;
  expression: number;
  focus: number;
  stamina: number;
};

export type ScaleId = 'order' | 'expression' | 'regulation' | 'focus' | 'stamina';

export type Scale = {
  id: ScaleId;
  label: string;
  value: number;
  band: string;
  left: string;
  right: string;
};

export type RoleId =
  | 'closer'
  | 'framer'
  | 'starter'
  | 'quality'
  | 'quiet_veto'
  | 'pace'
  | 'glue'
  | 'solo'
  | 'mirror'
  | 'minimal';

export type ShadowId =
  | 'control_details'
  | 'speed_at_any_cost'
  | 'silence'
  | 'agreement_without_agreement'
  | 'new_idea_instead_of_finish'
  | 'hard_directness';

export type MotiveId =
  | 'clarity'
  | 'people'
  | 'order'
  | 'meaning'
  | 'finished_piece'
  | 'calm';

export type Lens =
  | 'side'
  | 'blind'
  | 'decisions'
  | 'contact'
  | 'pressure'
  | 'resource'
  | 'promises'
  | 'evening';

export const LENS_LABELS: Record<Lens, string> = {
  side: 'Со стороны',
  blind: 'Слепая зона',
  decisions: 'Решения',
  contact: 'Контакт',
  pressure: 'Под давлением',
  resource: 'Ресурс',
  promises: 'Обещания и края',
  evening: 'После 16:00',
};

export type Insight = {
  id: string;
  lens: Lens;
  label: string;
  claim: string;
  because: string;
  today: string;
  sting: string;
};

export type Participant = {
  name: string;
  birth: { day: number; month: number; year: number } | null;
};

export type WeatherSnapshot = {
  temperature: number;
  apparent: number;
  code: number;
  cloudCover: number;
  isDay: boolean;
  windSpeed: number;
  humidity: number;
  sunrise?: string;
  sunset?: string;
};

export type LocationSnapshot = {
  city: string;
  countryCode: string;
  resolved: boolean;
};

export type LunarSnapshot = {
  illumination: number;
  phase: number;
  phaseName: string;
  sunrise: string | null;
  sunset: string | null;
};

export type HolidaySnapshot = {
  name: string;
  localName: string | null;
  isPublic: boolean;
};

export type DayContext = {
  date: Date;
  isoDate: string;
  weekday: number;
  weekdayName: string;
  weekdayGenitive: string;
  weekdayInPhrase: string;
  isWeekend: boolean;
  location: LocationSnapshot | null;
  weather: WeatherSnapshot | null;
  lunar: LunarSnapshot;
  holiday: HolidaySnapshot | null;
  isDayBeforeHoliday: boolean;
  isAfterHoliday: boolean;
  isMonthEnd: boolean;
  isBirthdayWindow: boolean;
  birthdayDistance: number | null;
  season: 'winter' | 'spring' | 'summer' | 'autumn';
};

export type DayWindow = {
  morning: string;
  midday: string;
  evening: string;
};

export type DayWhy = {
  weekday: string;
  counterfactual: string;
  calendar: string;
  weather: string | null;
  lunar: string;
  birth: string | null;
  window: DayWindow;
  drop: string;
  closing: string;
};

export type Profile = {
  number: string;
  seed: number;
  headline: string;
  lead: string;
  insights: Insight[];
  scores: Scores;
  scales: Scale[];
  role: RoleId;
  roleLabel: string;
  roleText: string;
  shadow: ShadowId;
  shadowLabel: string;
  shadowText: string;
  decision: string;
  speech: string;
  pressure: string;
  motive: MotiveId;
  motiveLabel: string;
  motiveText: string;
  withYou: string[];
  dayWhy: DayWhy;
};
