import type { Point, Stroke } from '../engine/types';

export type InkTheme = {
  background: string;
  grid: string;
  gridStrong: string;
};

export const DEFAULT_INK_THEME: InkTheme = {
  background: '#0A0E16',
  grid: 'rgba(62, 224, 200, 0.11)',
  gridStrong: 'rgba(62, 224, 200, 0.18)',
};

/** Тот же след, но для печати: белая бумага, тёмные чернила. */
export const PRINT_INK_THEME: InkTheme = {
  background: '#FFFFFF',
  grid: 'rgba(31, 41, 51, 0.10)',
  gridStrong: 'rgba(31, 41, 51, 0.22)',
};

const PRINT_INK_COLORS: Record<string, string> = {
  '#D7FBF4': '#1F2933',
  '#E4C56A': '#8A6D12',
  '#7B6CFF': '#3B3AA0',
};

export function toPrintStrokes(strokes: Stroke[]): Stroke[] {
  return strokes.map((stroke) => ({
    ...stroke,
    color: PRINT_INK_COLORS[stroke.color.toUpperCase()] ?? '#1F2933',
  }));
}

export function paintGrid(
  ctx: CanvasRenderingContext2D,
  size: number,
  gridSize: number,
  theme: InkTheme = DEFAULT_INK_THEME,
): void {
  ctx.save();
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = gridSize; x < size; x += gridSize) {
    ctx.moveTo(Math.round(x) + 0.5, 0);
    ctx.lineTo(Math.round(x) + 0.5, size);
  }
  for (let y = gridSize; y < size; y += gridSize) {
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(size, Math.round(y) + 0.5);
  }
  ctx.stroke();

  ctx.strokeStyle = theme.gridStrong;
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  ctx.beginPath();
  ctx.moveTo(size / 2 + 0.5, 0);
  ctx.lineTo(size / 2 + 0.5, size);
  ctx.moveTo(0, size / 2 + 0.5);
  ctx.lineTo(size, size / 2 + 0.5);
  ctx.stroke();
  ctx.restore();
}

function strokeWidthFor(base: number, pressure: number, trusted: boolean): number {
  if (!trusted) return base;
  return base * (0.7 + 0.7 * pressure);
}

function paintStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  baseWidth: number,
  trusted: boolean,
): void {
  if (points.length === 0) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (points.length === 1) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, Math.max(0.8, baseWidth / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (points.length === 2) {
    ctx.lineWidth = strokeWidthFor(baseWidth, points[1].p, trusted);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
    ctx.restore();
    return;
  }

  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const next = points[i + 1];
    const midStart = { x: (previous.x + current.x) / 2, y: (previous.y + current.y) / 2 };
    const midEnd = { x: (current.x + next.x) / 2, y: (current.y + next.y) / 2 };
    ctx.lineWidth = strokeWidthFor(baseWidth, current.p, trusted);
    ctx.beginPath();
    ctx.moveTo(midStart.x, midStart.y);
    ctx.quadraticCurveTo(current.x, current.y, midEnd.x, midEnd.y);
    ctx.stroke();
  }
  ctx.restore();
}

export function paintStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  size: number,
  gridSize: number,
  theme: InkTheme = DEFAULT_INK_THEME,
): void {
  paintGrid(ctx, size, gridSize, theme);
  for (const stroke of strokes) {
    paintStroke(ctx, stroke.points, stroke.color, stroke.width, false);
  }
}

export function paintLastSegment(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  baseWidth: number,
  trusted: boolean,
): void {
  if (points.length < 2) return;
  const from = points[points.length - 2];
  const to = points[points.length - 1];
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = strokeWidthFor(baseWidth, to.p, trusted);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

export function renderStrokesToDataUrl(
  strokes: Stroke[],
  size: number,
  gridSize: number,
  theme: InkTheme = DEFAULT_INK_THEME,
  scale = 2,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(size * scale);
  canvas.height = Math.round(size * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.scale(scale, scale);
  paintStrokes(ctx, strokes, size, gridSize, theme);
  return canvas.toDataURL('image/png');
}

export function drawInkToCanvas(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  size: number,
  gridSize: number,
  theme: InkTheme = DEFAULT_INK_THEME,
): void {
  paintStrokes(ctx, strokes, size, gridSize, theme);
}

export function emptyTrace(): Stroke[] {
  return [];
}
