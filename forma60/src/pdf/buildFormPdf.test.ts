// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, beforeAll } from 'vitest';
import { readLunar } from '../api/lunar';
import { buildDayContext } from '../engine/dayContext';
import { buildProfile } from '../engine/interpret';
import { computeMetrics } from '../engine/metrics';
import type { Point, Stroke, WeatherSnapshot } from '../engine/types';
import { buildFormDocument, pdfFileName, transliterate } from './buildFormPdf';

const here = dirname(fileURLToPath(import.meta.url));
const fontDir = join(here, '..', '..', 'public', 'fonts');

beforeAll(() => {
  // jsdom has no canvas implementation; the report degrades to "no drawing" there.
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    const file = url.split('/').pop() ?? '';
    const buffer = readFileSync(join(fontDir, file));
    return {
      ok: true,
      arrayBuffer: async () =>
        buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    } as unknown as Response;
  }) as typeof fetch;
});

function strokeOf(points: Array<[number, number]>, startT = 0, step = 24): Stroke {
  const mapped: Point[] = points.map(([x, y], index) => ({ x, y, t: startT + index * step, p: 0.5 }));
  return { points: mapped, color: '#D7FBF4', width: 2.6 };
}

const strokes = [
  strokeOf([[40, 40], [80, 70], [130, 110], [190, 170], [250, 220]]),
  strokeOf([[290, 70], [310, 90], [330, 120]]),
];

describe('pdf', () => {
  it('transliterates the file name', () => {
    expect(transliterate('Юлия')).toBe('yuliya');
    expect(pdfFileName('Юлия', '2026-09-14')).toBe('Forma60_yuliya_20260914.pdf');
    expect(pdfFileName('', '2026-09-14')).toBe('Forma60_participant_20260914.pdf');
  });

  it('builds a three page document with cyrillic fonts embedded', async () => {
    const metrics = computeMetrics(strokes, 42000, { size: 360, gridSize: 18 });
    const date = new Date(2026, 8, 14, 11, 20);
    const day = buildDayContext({
      date,
      birth: { day: 12, month: 4, year: 1990 },
      location: { city: 'Вроцлав', countryCode: 'PL', resolved: true },
      weather: null,
      lunar: readLunar(date, 51.1, 17.03),
      holiday: null,
    });
    const profile = buildProfile(metrics, day, { day: 12, month: 4 });

    const doc = await buildFormDocument(
      {
        profile,
        strokes,
        canvasSize: 360,
        day,
        participantName: 'Юлия',
        age: 36,
      },
      { strict: true },
    );

    expect(doc.getNumberOfPages()).toBe(3);
    const fonts = doc.getFontList();
    expect(Object.keys(fonts)).toContain('Manrope');
    expect(Object.keys(fonts)).toContain('Cormorant');
    expect(Object.keys(fonts)).toContain('PlexMono');

    const raw = Buffer.from(doc.output('arraybuffer')).toString('latin1');
    expect(raw).toContain('/Type /Page');
    expect(raw).toContain('Manrope');
  });

  it('keeps every layout variant inside the printable area', async () => {
    const rainy = new Date(2026, 8, 18, 15, 0);
    const cases: {
      label: string;
      strokes: Stroke[];
      date: Date;
      weather: WeatherSnapshot | null;
      holiday: { name: string; localName: string | null; isPublic: boolean } | null;
    }[] = [
      { label: 'плотная линия', strokes, date: new Date(2026, 8, 14, 9, 0), weather: null, holiday: null },
      {
        label: 'дождь в пятницу',
        strokes: [
          strokeOf([[40, 300], [80, 280]], 0, 300),
          strokeOf([[200, 80], [240, 120], [250, 200], [260, 300]], 4000, 60),
        ],
        date: rainy,
        weather: {
          temperature: 9,
          apparent: 7,
          code: 63,
          cloudCover: 92,
          isDay: true,
          windSpeed: 5,
          humidity: 85,
        },
        holiday: null,
      },
      {
        label: 'пустой след перед праздником',
        strokes: [],
        date: new Date(2026, 11, 31, 12, 0),
        weather: null,
        holiday: { name: 'Новый год', localName: 'Новый год', isPublic: true },
      },
      {
        label: 'много штрихов, поздний вечер',
        strokes: [
          strokeOf([[30, 30], [90, 60]], 0, 20),
          strokeOf([[300, 40], [250, 90]], 1500, 20),
          strokeOf([[60, 300], [120, 250]], 3000, 20),
          strokeOf([[300, 300], [250, 250]], 4500, 20),
          strokeOf([[150, 150], [200, 200], [180, 240]], 6000, 20),
        ],
        date: new Date(2026, 8, 16, 21, 0),
        weather: null,
        holiday: null,
      },
    ];

    for (const item of cases) {
      const metrics = computeMetrics(item.strokes, 48000, { size: 360, gridSize: 18 });
      const day = buildDayContext({
        date: item.date,
        birth: { day: 7, month: 11, year: 1985 },
        location: { city: 'Вроцлав', countryCode: 'PL', resolved: true },
        weather: item.weather,
        lunar: readLunar(item.date, 51.1, 17.03),
        holiday: item.holiday,
      });
      const profile = buildProfile(metrics, day, { day: 7, month: 11 });
      const doc = await buildFormDocument(
        {
          profile,
          strokes: item.strokes,
          canvasSize: 360,
          day,
          participantName: 'Пётр',
          age: 40,
        },
        { strict: true },
      );
      expect(doc.getNumberOfPages(), item.label).toBe(3);
    }
  });
});
