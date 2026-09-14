import { describe, expect, it } from 'vitest';
import { readLunar } from '../api/lunar';
import { buildDayContext, composeDayWhy, type DayContextInput } from './dayContext';
import { computeScores, buildProfile } from './interpret';
import { computeMetrics } from './metrics';
import type { Point, Stroke, WeatherSnapshot } from './types';

const GEOMETRY = { size: 360, gridSize: 18 };

function makeStroke(points: Array<[number, number]>, startT = 0, step = 16, color = '#D7FBF4'): Stroke {
  const mapped: Point[] = points.map(([x, y], index) => ({
    x,
    y,
    t: startT + index * step,
    p: 0.5,
  }));
  return { points: mapped, color, width: 2.6 };
}

const diagonal = makeStroke([
  [40, 40], [70, 66], [105, 95], [150, 130], [210, 180],
]);
const shortStart = makeStroke([[300, 60], [315, 70], [330, 88]], 900, 220);

function dayInput(overrides: Partial<DayContextInput> = {}): DayContextInput {
  const date = overrides.date ?? new Date(2026, 8, 14, 10, 30);
  return {
    date,
    birth: overrides.birth ?? { day: 12, month: 4, year: 1990 },
    location: overrides.location ?? { city: 'Вроцлав', countryCode: 'PL', resolved: true },
    weather: overrides.weather ?? null,
    lunar: overrides.lunar ?? readLunar(date, 51.1, 17.03),
    holiday: overrides.holiday ?? null,
  };
}

const rain: WeatherSnapshot = {
  temperature: 12,
  apparent: 10,
  code: 65,
  cloudCover: 95,
  isDay: true,
  windSpeed: 6,
  humidity: 88,
};

describe('metrics', () => {
  it('accepts an empty trace as a valid signal', () => {
    const metrics = computeMetrics([], 30000, GEOMETRY);
    expect(metrics.empty).toBe(true);
    expect(metrics.totalLength).toBe(0);
    expect(metrics.strokeCount).toBe(0);

    const scores = computeScores(metrics);
    for (const value of Object.values(scores)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it('measures a real trace', () => {
    const metrics = computeMetrics([diagonal, shortStart], 30000, GEOMETRY);
    expect(metrics.empty).toBe(false);
    expect(metrics.totalLength).toBeGreaterThan(100);
    expect(metrics.coverage).toBeGreaterThan(0);
    expect(metrics.colorCount).toBe(1);
  });
});

describe('interpretation', () => {
  it('is deterministic for the same trace and the same day', () => {
    const metrics = computeMetrics([diagonal, shortStart], 30000, GEOMETRY);
    const day = buildDayContext(dayInput());
    const first = buildProfile(metrics, day, { day: 12, month: 4 });
    const second = buildProfile(metrics, day, { day: 12, month: 4 });
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  it('produces four full insights even for an empty trace', () => {
    const metrics = computeMetrics([], 45000, GEOMETRY);
    const day = buildDayContext(dayInput());
    const profile = buildProfile(metrics, day, null);
    expect(profile.insights).toHaveLength(4);
    expect(new Set(profile.insights.map((insight) => insight.lens)).size).toBe(4);
    for (const insight of profile.insights) {
      expect(insight.claim.length).toBeGreaterThan(10);
      expect(insight.today.length).toBeGreaterThan(20);
      expect(insight.sting.length).toBeGreaterThan(10);
    }
  });

  it('changes the "why today" wording between thursday and friday', () => {
    const metrics = computeMetrics([diagonal], 30000, GEOMETRY);
    const thursday = buildDayContext(dayInput({ date: new Date(2026, 8, 17, 10, 0) }));
    const friday = buildDayContext(dayInput({ date: new Date(2026, 8, 18, 10, 0) }));
    const thursdayProfile = buildProfile(metrics, thursday, null);
    const fridayProfile = buildProfile(metrics, friday, null);

    expect(thursday.weekdayName).toBe('четверг');
    expect(friday.weekdayName).toBe('пятница');
    expect(fridayProfile.dayWhy.weekday).not.toBe(thursdayProfile.dayWhy.weekday);
    expect(fridayProfile.dayWhy.counterfactual).not.toBe(thursdayProfile.dayWhy.counterfactual);
  });

  it('does not turn a rainy day into a transport guide', () => {
    const metrics = computeMetrics([diagonal, shortStart], 30000, GEOMETRY);
    const day = buildDayContext(
      dayInput({ date: new Date(2026, 8, 14, 9, 0), weather: rain }),
    );
    const profile = buildProfile(metrics, day, null);
    const haystack = JSON.stringify(profile).toLowerCase();

    const forbidden = [
      'зонт',
      'метро',
      'такси',
      'пробк',
      'суп',
      'продукт',
      'рецепт',
      'наушник',
      'энтропи',
      'центроид',
      'loopiness',
      'архетип',
      'фрактал',
      'big five',
      'disc',
      'hogan',
      'ocean',
      'диагноз',
      'депресс',
      'тревожн',
      'расстройств',
    ];
    for (const word of forbidden) {
      expect(haystack).not.toContain(word);
    }
    expect(haystack).toContain('сегодня');
  });

  it('keeps the day metaphor connected to the trace', () => {
    const metrics = computeMetrics([diagonal, shortStart], 30000, GEOMETRY);
    const day = buildDayContext(dayInput({ date: new Date(2026, 8, 14, 9, 0), weather: rain }));
    const why = composeDayWhy(day, metrics, computeScores(metrics), 1234, { day: 12, month: 4 });
    expect(why.weather).toBeTruthy();
    expect(why.window.morning.length).toBeGreaterThan(20);
    expect(why.window.midday.length).toBeGreaterThan(20);
    expect(why.window.evening.length).toBeGreaterThan(20);
  });
});
