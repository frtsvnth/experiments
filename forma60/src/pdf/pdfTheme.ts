import type { jsPDF } from 'jspdf';
import { PDF_FAMILIES } from './fonts';

export type Rgb = [number, number, number];

export const C = {
  paper: [11, 16, 24] as Rgb,
  panel: [18, 24, 38] as Rgb,
  panel2: [23, 30, 44] as Rgb,
  ink: [232, 237, 245] as Rgb,
  muted: [139, 149, 168] as Rgb,
  faint: [92, 101, 120] as Rgb,
  cyan: [62, 224, 200] as Rgb,
  gold: [201, 162, 39] as Rgb,
  gold2: [228, 197, 106] as Rgb,
  line: [32, 40, 56] as Rgb,
  lineGold: [86, 71, 32] as Rgb,
};

export const PAGE = {
  width: 210,
  height: 297,
  margin: 15,
  bottom: 16,
};

export function paintPage(doc: jsPDF, pageNumber: number, pageLabel: string): void {
  doc.setFillColor(...C.paper);
  doc.rect(0, 0, PAGE.width, PAGE.height, 'F');

  doc.setDrawColor(...C.lineGold);
  doc.setLineWidth(0.35);
  doc.roundedRect(
    PAGE.margin - 6,
    PAGE.margin - 6,
    PAGE.width - (PAGE.margin - 6) * 2,
    PAGE.height - (PAGE.margin - 6) * 2,
    3,
    3,
    'S',
  );

  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.2);
  doc.line(PAGE.margin, PAGE.height - 12, PAGE.width - PAGE.margin, PAGE.height - 12);

  setMono(doc, 7, C.faint);
  doc.text(`ФОРМА 60 · ЭКСПРЕСС-СРЕЗ · ЛИСТ ${pageNumber} ИЗ 3`, PAGE.margin, PAGE.height - 8);
  doc.text(pageLabel, PAGE.width - PAGE.margin, PAGE.height - 8, { align: 'right' });
}

export function setBody(doc: jsPDF, size: number, color: Rgb, bold = false): void {
  doc.setFont(PDF_FAMILIES.body, bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

export function setDisplay(doc: jsPDF, size: number, color: Rgb): void {
  doc.setFont(PDF_FAMILIES.display, 'bold');
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

export function setMono(doc: jsPDF, size: number, color: Rgb): void {
  doc.setFont(PDF_FAMILIES.mono, 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
}

export function lineHeight(size: number, factor = 1.42): number {
  return size * 0.3528 * factor;
}

export function paragraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  size: number,
  color: Rgb,
  bold = false,
  factor = 1.42,
): number {
  if (!text) return y;
  setBody(doc, size, color, bold);
  const lines = doc.splitTextToSize(text, width) as string[];
  const step = lineHeight(size, factor);
  let cursor = y;
  for (const line of lines) {
    doc.text(line, x, cursor);
    cursor += step;
  }
  return cursor;
}

export function displayHeading(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  size: number,
  color: Rgb,
  width?: number,
): number {
  setDisplay(doc, size, color);
  const lines = width ? (doc.splitTextToSize(text, width) as string[]) : [text];
  const step = lineHeight(size, 1.2);
  let cursor = y;
  for (const line of lines) {
    doc.text(line, x, cursor);
    doc.text(line, x + 0.14, cursor);
    cursor += step;
  }
  return cursor;
}

export function monoLabel(doc: jsPDF, text: string, x: number, y: number, size = 7, color: Rgb = C.gold): void {
  setMono(doc, size, color);
  doc.text(text.toUpperCase(), x, y, { charSpace: 0.4 });
}

export function drawRule(doc: jsPDF, x: number, y: number, width: number, color: Rgb = C.line): void {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.25);
  doc.line(x, y, x + width, y);
}

export function drawPanel(doc: jsPDF, x: number, y: number, width: number, height: number): void {
  doc.setFillColor(...C.panel);
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, width, height, 2, 2, 'FD');
}

export function drawStamp(doc: jsPDF, x: number, y: number, size: number): void {
  doc.setFillColor(...C.panel2);
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, size, size, 2, 2, 'FD');
  doc.setDrawColor(...C.cyan);
  doc.setLineWidth(0.15);
  for (let i = 1; i < 3; i++) {
    const offset = (size / 3) * i;
    doc.line(x + offset, y + 2, x + offset, y + size - 2);
    doc.line(x + 2, y + offset, x + size - 2, y + offset);
  }
  setMono(doc, 8, C.ink);
  doc.text('Ф60', x + size / 2, y + size / 2 + 1.2, { align: 'center' });
}

export function drawChip(doc: jsPDF, text: string, x: number, y: number, color: Rgb = C.cyan): number {
  setMono(doc, 6.5, color);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.2);
  const width = doc.getTextWidth(text.toUpperCase()) + 5;
  doc.roundedRect(x, y - 3.2, width, 4.6, 1.2, 1.2, 'S');
  doc.text(text.toUpperCase(), x + 2.5, y, { charSpace: 0.3 });
  return width;
}

export function drawScaleBar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  value: number,
  label: string,
  band: string,
  left: string,
  right: string,
): number {
  setBody(doc, 9, C.ink, true);
  doc.text(label, x, y);
  setBody(doc, 8, C.muted);
  doc.text(band, x + width, y, { align: 'right' });

  const trackY = y + 3.2;
  doc.setFillColor(...C.line);
  doc.roundedRect(x, trackY, width, 1.6, 0.8, 0.8, 'F');

  const markerX = x + (Math.max(0, Math.min(100, value)) / 100) * width;
  doc.setFillColor(...(value > 58 ? C.gold2 : value < 42 ? C.cyan : C.ink));
  doc.circle(markerX, trackY + 0.8, 1.5, 'F');

  setBody(doc, 7, C.faint);
  doc.text(left, x, trackY + 6);
  doc.text(right, x + width, trackY + 6, { align: 'right' });
  return trackY + 10;
}

export function drawDrawing(
  doc: jsPDF,
  dataUrl: string,
  x: number,
  y: number,
  size: number,
): void {
  doc.setFillColor(10, 14, 22);
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, size, size, 2, 2, 'FD');
  if (dataUrl) {
    try {
      doc.addImage(dataUrl, 'PNG', x + 1.5, y + 1.5, size - 3, size - 3);
    } catch {
      setBody(doc, 8, C.faint);
      doc.text('След недоступен', x + size / 2, y + size / 2, { align: 'center' });
    }
  } else {
    setBody(doc, 8, C.faint);
    doc.text('Пустой след', x + size / 2, y + size / 2, { align: 'center' });
  }
}
