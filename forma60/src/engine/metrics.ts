import type { Point, QuadrantMass, RawMetrics, Stroke, Zone } from './types';
import { distance, pathLength, turningAngles, zoneOf } from '../canvas/strokeMath';

export type CanvasGeometry = {
  size: number;
  gridSize: number;
};

const COVERAGE_BINS = 24;

export function computeMetrics(
  strokes: Stroke[],
  durationMs: number,
  geometry: CanvasGeometry,
): RawMetrics {
  const safeDuration = Math.max(1, durationMs);
  const size = geometry.size || 1;

  let totalLength = 0;
  let speedSum = 0;
  let speedSqSum = 0;
  let speedCount = 0;
  let maxSpeed = 0;
  let pauseCount = 0;
  let pauseMs = 0;
  let turnSum = 0;
  let turnCount = 0;
  let straightSum = 0;
  let straightWeight = 0;
  let pointCount = 0;
  let pxSum = 0;
  let pySum = 0;
  let minPressure = Infinity;
  let maxPressure = -Infinity;
  let gridAlignedPoints = 0;
  let first: Point | null = null;
  let last: Point | null = null;
  const cells = new Set<number>();
  const quadrantLength: QuadrantMass = [0, 0, 0, 0];
  let earlyLength = 0;

  for (const stroke of strokes) {
    const points = stroke.points;
    if (points.length === 0) continue;
    if (first === null) first = points[0];

    let strokeLength = 0;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      pointCount += 1;
      pxSum += p.x;
      pySum += p.y;
      if (p.p < minPressure) minPressure = p.p;
      if (p.p > maxPressure) maxPressure = p.p;

      const nx = p.x / size;
      const ny = p.y / size;
      const cellX = Math.min(COVERAGE_BINS - 1, Math.max(0, Math.floor(nx * COVERAGE_BINS)));
      const cellY = Math.min(COVERAGE_BINS - 1, Math.max(0, Math.floor(ny * COVERAGE_BINS)));
      cells.add(cellY * COVERAGE_BINS + cellX);

      const quadrant = (ny < 0.5 ? 0 : 2) + (nx < 0.5 ? 0 : 1);
      const gridDist = Math.min(
        distanceToGrid(p.x, geometry.gridSize),
        distanceToGrid(p.y, geometry.gridSize),
      );
      if (gridDist < 2.5) gridAlignedPoints += 1;

      if (i > 0) {
        const prev = points[i - 1];
        const segment = distance(prev, p);
        strokeLength += segment;
        quadrantLength[quadrant] += segment;
        if (p.t <= safeDuration / 2) earlyLength += segment;
        const dt = p.t - prev.t;
        if (dt > 0) {
          const speed = (segment / dt) * 1000;
          speedSum += speed;
          speedSqSum += speed * speed;
          speedCount += 1;
          if (speed > maxSpeed) maxSpeed = speed;
        }
        if (dt > 350) {
          pauseCount += 1;
          pauseMs += dt;
        }
      }
    }

    totalLength += strokeLength;
    if (points.length > 2) {
      const angles = turningAngles(points);
      for (const angle of angles) {
        turnSum += angle;
        turnCount += 1;
      }
    }
    const net = distance(points[0], points[points.length - 1]);
    if (strokeLength > 0) {
      straightSum += Math.min(1, net / strokeLength) * strokeLength;
      straightWeight += strokeLength;
    }
    last = points[points.length - 1];
  }

  const empty = totalLength < 8 || pointCount < 3;
  const meanSpeed = speedCount > 0 ? speedSum / speedCount : 0;
  const variance = speedCount > 0 ? Math.max(0, speedSqSum / speedCount - meanSpeed * meanSpeed) : 0;
  const centroid = pointCount > 0
    ? { x: pxSum / pointCount / size, y: pySum / pointCount / size }
    : { x: 0.5, y: 0.5 };
  const massTotal = totalLength > 0 ? totalLength : 1;
  const normalizedQuadrants: QuadrantMass = [
    quadrantLength[0] / massTotal,
    quadrantLength[1] / massTotal,
    quadrantLength[2] / massTotal,
    quadrantLength[3] / massTotal,
  ];
  const left = normalizedQuadrants[0] + normalizedQuadrants[2];
  const right = normalizedQuadrants[1] + normalizedQuadrants[3];
  const top = normalizedQuadrants[0] + normalizedQuadrants[1];
  const bottom = normalizedQuadrants[2] + normalizedQuadrants[3];
  const symmetry = 1 - (Math.abs(left - right) + Math.abs(top - bottom)) / 2;

  const gridAlignment = pointCount > 0 ? gridAlignedPoints / pointCount : 0;
  const coverage = cells.size / (COVERAGE_BINS * COVERAGE_BINS);
  const startZone: Zone = first ? zoneOf(first.x / size, first.y / size, 0.12) : 'center';
  const endZone: Zone = last ? zoneOf(last.x / size, last.y / size, 0.12) : 'center';
  const pressureTrusted =
    pointCount > 0 && Number.isFinite(minPressure) && maxPressure - minPressure > 0.15;

  return {
    strokeCount: strokes.filter((stroke) => stroke.points.length > 1).length,
    totalLength,
    meanSpeed,
    maxSpeed,
    speedStd: Math.sqrt(variance),
    pauseCount,
    idleRatio: Math.min(1, pauseMs / safeDuration),
    meanAbsTurn: turnCount > 0 ? turnSum / turnCount : 0,
    straightness: straightWeight > 0 ? straightSum / straightWeight : 0,
    coverage,
    centroid,
    quadrantMass: normalizedQuadrants,
    symmetry: Math.max(0, Math.min(1, symmetry)),
    gridAlignment,
    startZone,
    endZone,
    earlyLateBalance: totalLength > 0 ? earlyLength / totalLength : 0.5,
    colorCount: new Set(strokes.filter((s) => s.points.length > 1).map((s) => s.color)).size,
    empty,
    pressureTrusted,
    durationMs: safeDuration,
  };
}

function distanceToGrid(value: number, gridSize: number): number {
  if (!gridSize || gridSize <= 0) return Infinity;
  const mod = value % gridSize;
  return Math.min(mod, gridSize - mod);
}

export function totalInkTime(strokes: Stroke[]): number {
  let first = Infinity;
  let last = -Infinity;
  for (const stroke of strokes) {
    for (const point of stroke.points) {
      if (point.t < first) first = point.t;
      if (point.t > last) last = point.t;
    }
  }
  if (!Number.isFinite(first) || !Number.isFinite(last)) return 0;
  return last - first;
}

export function strokePathOf(stroke: Stroke): number {
  return pathLength(stroke.points);
}
