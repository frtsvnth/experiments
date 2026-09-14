import type { RawMetrics } from './types';

export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function hashNumbers(values: number[]): number {
  let acc = 0x811c9dc5;
  for (const value of values) {
    const scaled = Math.round(value * 1000);
    acc ^= scaled & 0xff;
    acc = Math.imul(acc, 0x01000193);
    acc ^= (scaled >>> 8) & 0xff;
    acc = Math.imul(acc, 0x01000193);
    acc ^= (scaled >>> 16) & 0xff;
    acc = Math.imul(acc, 0x01000193);
  }
  return acc >>> 0;
}

export function hashMetrics(metrics: RawMetrics): number {
  const centroid = metrics.centroid;
  return hashNumbers([
    metrics.strokeCount,
    metrics.totalLength,
    metrics.meanSpeed,
    metrics.maxSpeed,
    metrics.speedStd,
    metrics.pauseCount,
    metrics.idleRatio,
    metrics.meanAbsTurn,
    metrics.straightness,
    metrics.coverage,
    centroid.x,
    centroid.y,
    metrics.symmetry,
    metrics.gridAlignment,
    metrics.earlyLateBalance,
    metrics.colorCount,
    metrics.empty ? 1 : 0,
    ...metrics.quadrantMass,
  ]);
}

export function combineSeed(...parts: (number | string)[]): number {
  return hashString(parts.map((part) => String(part)).join('|'));
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickDeterministic<T>(items: readonly T[], seed: number): T {
  if (items.length === 0) {
    throw new Error('pickDeterministic: empty list');
  }
  return items[seed % items.length];
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatStampHash(metrics: RawMetrics): string {
  const hex = hashMetrics(metrics).toString(16).toUpperCase().padStart(8, '0');
  return hex.slice(0, 4);
}
