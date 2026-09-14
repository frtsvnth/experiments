import { fetchJson, withTimeout } from './http';
import type { WeatherSnapshot } from '../engine/types';

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    cloud_cover?: number;
    is_day?: number;
    wind_speed_10m?: number;
    relative_humidity_2m?: number;
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
  };
};

export async function resolveWeather(
  latitude: number,
  longitude: number,
  isoDate: string,
): Promise<WeatherSnapshot | null> {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current:
      'temperature_2m,apparent_temperature,weather_code,cloud_cover,is_day,wind_speed_10m,relative_humidity_2m',
    daily: 'sunrise,sunset',
    timezone: 'auto',
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  try {
    const data = await withTimeout(
      fetchJson<OpenMeteoResponse>(url, 2500, { key: `f60.weather.${isoDate}` }),
      3000,
    );
    const current = data.current;
    if (!current || typeof current.temperature_2m !== 'number') return null;
    return {
      temperature: current.temperature_2m,
      apparent: current.apparent_temperature ?? current.temperature_2m,
      code: current.weather_code ?? -1,
      cloudCover: current.cloud_cover ?? 50,
      isDay: (current.is_day ?? 1) === 1,
      windSpeed: current.wind_speed_10m ?? 0,
      humidity: current.relative_humidity_2m ?? 60,
      sunrise: data.daily?.sunrise?.[0],
      sunset: data.daily?.sunset?.[0],
    };
  } catch {
    return null;
  }
}
