import type { Point, Stroke, Zone } from '../engine/types';

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function pathLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += distance(points[i - 1], points[i]);
  }
  return total;
}

export function resample(points: Point[], spacing: number): Point[] {
  if (points.length < 2 || spacing <= 0) return points.slice();
  const out: Point[] = [points[0]];
  let carry = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const segment = distance(a, b);
    if (segment === 0) continue;
    let travelled = spacing - carry;
    while (travelled <= segment) {
      const k = travelled / segment;
      out.push({
        x: a.x + (b.x - a.x) * k,
        y: a.y + (b.y - a.y) * k,
        t: a.t + (b.t - a.t) * k,
        p: a.p + (b.p - a.p) * k,
      });
      travelled += spacing;
    }
    carry = segment - (travelled - spacing);
  }
  const last = points[points.length - 1];
  const tail = out[out.length - 1];
  if (distance(tail, last) > spacing * 0.25) out.push(last);
  return out;
}

export function simplify(points: Point[], tolerance: number): Point[] {
  if (points.length < 3) return points.slice();
  const keep = new Array<boolean>(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length > 0) {
    const [first, last] = stack.pop() as [number, number];
    let maxDist = 0;
    let index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = perpendicularDistance(points[i], points[first], points[last]);
      if (d > maxDist) {
        maxDist = d;
        index = i;
      }
    }
    if (maxDist > tolerance && index !== -1) {
      keep[index] = true;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function perpendicularDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const denom = Math.hypot(dx, dy);
  if (denom === 0) return distance(p, a);
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / denom;
}

export function turningAngles(points: Point[]): number[] {
  const angles: number[] = [];
  for (let i = 2; i < points.length; i++) {
    const a = points[i - 2];
    const b = points[i - 1];
    const c = points[i];
    const v1 = Math.atan2(b.y - a.y, b.x - a.x);
    const v2 = Math.atan2(c.y - b.y, c.x - b.x);
    let delta = Math.abs(v2 - v1);
    if (delta > Math.PI) delta = Math.PI * 2 - delta;
    angles.push(delta);
  }
  return angles;
}

export function bounds(points: Point[]): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  if (!Number.isFinite(minX)) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  return { minX, maxX, minY, maxY };
}

export function zoneOf(nx: number, ny: number, span: number): Zone {
  const margin = 0.16;
  const nearVerticalEdge = nx < margin || nx > 1 - margin;
  const nearHorizontalEdge = ny < margin || ny > 1 - margin;
  const isSpread = nearVerticalEdge && nearHorizontalEdge;
  if (isSpread) return 'spread';
  const cx = Math.abs(nx - 0.5);
  const cy = Math.abs(ny - 0.5);
  if (cx < span && cy < span) return 'center';
  if (nx < 0.5 && ny < 0.5) return 'top_left';
  if (nx >= 0.5 && ny < 0.5) return 'top_right';
  if (nx < 0.5 && ny >= 0.5) return 'bottom_left';
  return 'bottom_right';
}

export function catmullRomPath(points: Point[], smoothing = 0.5): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * smoothing * 2;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * smoothing * 2;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * smoothing * 2;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * smoothing * 2;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export function strokesLength(strokes: Stroke[]): number {
  return strokes.reduce((acc, stroke) => acc + pathLength(stroke.points), 0);
}

export function scaleStrokes(strokes: Stroke[], from: number, to: number): Stroke[] {
  const k = to / from;
  return strokes.map((stroke) => ({
    ...stroke,
    width: stroke.width * k,
    points: stroke.points.map((p) => ({ ...p, x: p.x * k, y: p.y * k })),
  }));
}
