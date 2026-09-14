import SunCalc from 'suncalc';
import type { LunarSnapshot } from '../engine/types';

const PHASE_NAMES: { limit: number; name: string }[] = [
  { limit: 0.03, name: 'новолуние' },
  { limit: 0.22, name: 'растущий серп' },
  { limit: 0.28, name: 'первая четверть' },
  { limit: 0.47, name: 'растущая луна' },
  { limit: 0.53, name: 'полнолуние' },
  { limit: 0.72, name: 'убывающая луна' },
  { limit: 0.78, name: 'последняя четверть' },
  { limit: 0.97, name: 'убывающий серп' },
  { limit: 1.01, name: 'новолуние' },
];

export function phaseName(phase: number): string {
  return PHASE_NAMES.find((entry) => phase < entry.limit)?.name ?? 'новолуние';
}

export function readLunar(date: Date, latitude: number, longitude: number): LunarSnapshot {
  const illumination = SunCalc.getMoonIllumination(date);
  let sunrise: string | null = null;
  let sunset: string | null = null;
  try {
    const times = SunCalc.getTimes(date, latitude, longitude);
    sunrise = toHm(times.sunrise);
    sunset = toHm(times.sunset);
  } catch {
    sunrise = null;
    sunset = null;
  }
  return {
    illumination: illumination.fraction,
    phase: illumination.phase,
    phaseName: phaseName(illumination.phase),
    sunrise,
    sunset,
  };
}

function toHm(value: Date | undefined): string | null {
  if (!value || Number.isNaN(value.getTime())) return null;
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

export function moonSymbol(illumination: number, phase: number): string {
  if (illumination < 0.04) return '●';
  if (phase < 0.5) return illumination > 0.5 ? '◕' : '◔';
  return illumination > 0.5 ? '◕' : '◑';
}
