import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { Point, Stroke } from '../engine/types';
import {
  DEFAULT_INK_THEME,
  paintLastSegment,
  paintStrokes,
  type InkTheme,
} from './inkEngine';

type Props = {
  strokes: Stroke[];
  onStrokesChange: (strokes: Stroke[]) => void;
  color: string;
  baseWidth?: number;
  gridSize?: number;
  disabled?: boolean;
  theme?: InkTheme;
  className?: string;
  onSizeChange?: (size: number) => void;
};

export function GridCanvas({
  strokes,
  onStrokesChange,
  color,
  baseWidth = 2.6,
  gridSize = 18,
  disabled = false,
  theme = DEFAULT_INK_THEME,
  className,
  onSizeChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState(0);
  const activeRef = useRef<{ stroke: Stroke; pointerId: number } | null>(null);
  const colorRef = useRef(color);
  const widthRef = useRef(baseWidth);
  const disabledRef = useRef(disabled);

  colorRef.current = color;
  widthRef.current = baseWidth;
  disabledRef.current = disabled;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const rect = container.getBoundingClientRect();
      const next = Math.max(0, Math.floor(Math.min(rect.width, rect.height)));
      setSize(next);
      onSizeChange?.(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [onSizeChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size === 0) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintStrokes(ctx, strokes, size, gridSize, theme);
  }, [strokes, size, gridSize, theme]);

  const toPoint = useCallback((event: ReactPointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const pressure = event.pointerType === 'pen' && event.pressure > 0 ? event.pressure : 0.5;
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      t: performance.now(),
      p: pressure,
    };
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabledRef.current) return;
      const point = toPoint(event);
      if (!point) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      activeRef.current = {
        pointerId: event.pointerId,
        stroke: { points: [point], color: colorRef.current, width: widthRef.current },
      };
    },
    [toPoint],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const active = activeRef.current;
      if (!active || active.pointerId !== event.pointerId) return;
      const point = toPoint(event);
      if (!point) return;
      const points = active.stroke.points;
      const last = points[points.length - 1];
      if (last && Math.hypot(point.x - last.x, point.y - last.y) < 0.6) return;
      points.push(point);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        paintLastSegment(ctx, points, active.stroke.color, active.stroke.width, false);
      }
    },
    [toPoint],
  );

  const finishStroke = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const active = activeRef.current;
      if (!active || active.pointerId !== event.pointerId) return;
      activeRef.current = null;
      const finished: Stroke = {
        points: active.stroke.points.slice(),
        color: active.stroke.color,
        width: active.stroke.width,
      };
      onStrokesChange(strokes.concat(finished));
    },
    [onStrokesChange, strokes],
  );

  return (
    <div ref={containerRef} className={`grid-canvas ${className ?? ''}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        onPointerLeave={(event) => {
          if (activeRef.current?.pointerId === event.pointerId) finishStroke(event);
        }}
      />
    </div>
  );
}
