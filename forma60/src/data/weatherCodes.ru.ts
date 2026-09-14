export type WeatherFamily = 'clear' | 'cloudy' | 'drizzle' | 'rain' | 'snow' | 'storm' | 'fog';

export type WeatherDescriptor = {
  code: number;
  label: string;
  family: WeatherFamily;
  brightness: number;
  heaviness: number;
};

const TABLE: WeatherDescriptor[] = [
  { code: 0, label: 'ясно', family: 'clear', brightness: 1, heaviness: 0.1 },
  { code: 1, label: 'преимущественно ясно', family: 'clear', brightness: 0.9, heaviness: 0.15 },
  { code: 2, label: 'переменная облачность', family: 'cloudy', brightness: 0.6, heaviness: 0.3 },
  { code: 3, label: 'пасмурно', family: 'cloudy', brightness: 0.3, heaviness: 0.5 },
  { code: 45, label: 'туман', family: 'fog', brightness: 0.25, heaviness: 0.55 },
  { code: 48, label: 'изморозь и туман', family: 'fog', brightness: 0.25, heaviness: 0.6 },
  { code: 51, label: 'слабая морось', family: 'drizzle', brightness: 0.35, heaviness: 0.45 },
  { code: 53, label: 'морось', family: 'drizzle', brightness: 0.3, heaviness: 0.5 },
  { code: 55, label: 'плотная морось', family: 'drizzle', brightness: 0.25, heaviness: 0.6 },
  { code: 56, label: 'ледяная морось', family: 'drizzle', brightness: 0.3, heaviness: 0.65 },
  { code: 57, label: 'плотная ледяная морось', family: 'drizzle', brightness: 0.25, heaviness: 0.7 },
  { code: 61, label: 'небольшой дождь', family: 'rain', brightness: 0.35, heaviness: 0.5 },
  { code: 63, label: 'дождь', family: 'rain', brightness: 0.3, heaviness: 0.6 },
  { code: 65, label: 'сильный дождь', family: 'rain', brightness: 0.25, heaviness: 0.75 },
  { code: 66, label: 'ледяной дождь', family: 'rain', brightness: 0.3, heaviness: 0.75 },
  { code: 67, label: 'сильный ледяной дождь', family: 'rain', brightness: 0.25, heaviness: 0.8 },
  { code: 71, label: 'небольшой снег', family: 'snow', brightness: 0.7, heaviness: 0.45 },
  { code: 73, label: 'снег', family: 'snow', brightness: 0.65, heaviness: 0.55 },
  { code: 75, label: 'сильный снег', family: 'snow', brightness: 0.6, heaviness: 0.7 },
  { code: 77, label: 'снежные зёрна', family: 'snow', brightness: 0.6, heaviness: 0.5 },
  { code: 80, label: 'небольшой ливень', family: 'rain', brightness: 0.4, heaviness: 0.55 },
  { code: 81, label: 'ливень', family: 'rain', brightness: 0.35, heaviness: 0.65 },
  { code: 82, label: 'сильный ливень', family: 'rain', brightness: 0.3, heaviness: 0.8 },
  { code: 85, label: 'снежный ливень', family: 'snow', brightness: 0.6, heaviness: 0.65 },
  { code: 86, label: 'сильный снежный ливень', family: 'snow', brightness: 0.55, heaviness: 0.75 },
  { code: 95, label: 'гроза', family: 'storm', brightness: 0.35, heaviness: 0.8 },
  { code: 96, label: 'гроза с градом', family: 'storm', brightness: 0.3, heaviness: 0.85 },
  { code: 99, label: 'сильная гроза с градом', family: 'storm', brightness: 0.3, heaviness: 0.9 },
];

export const UNKNOWN_WEATHER: WeatherDescriptor = {
  code: -1,
  label: 'нет данных',
  family: 'cloudy',
  brightness: 0.5,
  heaviness: 0.5,
};

export function describeWeather(code: number): WeatherDescriptor {
  return TABLE.find((entry) => entry.code === code) ?? UNKNOWN_WEATHER;
}
