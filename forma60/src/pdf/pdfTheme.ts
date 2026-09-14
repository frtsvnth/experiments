import type { jsPDF } from 'jspdf';
import { PDF_FAMILIES } from './fonts';

export type Rgb = [number, number, number];

/** Печатная версия: белая бумага, тёмный текст, сдержанные акценты. */
export const C = {
  paper: [255, 255, 255] as Rgb,
  panel: [245, 246, 248] as Rgb,
  panel2: [236, 238, 242] as Rgb,
  ink: [31, 41, 51] as Rgb,
  muted: [89, 97, 110] as Rgb,
  faint: [122, 130, 143] as Rgb,
  accent: [31, 111, 99] as Rgb,
  gold: [138, 109, 18] as Rgb,
  line: [215, 219, 226] as Rgb,
  lineStrong: [31, 41, 51] as Rgb,
};

export const PAGE = {
  width: 210,
  height: 297,
  margin: 15,
  /** Ниже этой отметки ничего не рисуем: там колонтитул. */
  safeBottom: 276,
};

export function paintPage(doc: jsPDF, pageNumber: number, pageLabel: string): void {
  doc.setFillColor(...C.paper);
  doc.rect(0, 0, PAGE.width, PAGE.height, 'F');

  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.3);
  doc.roundedRect(PAGE.margin - 6, PAGE.margin - 6, PAGE.width - (PAGE.margin - 6) * 2, 282, 2, 2, 'S');

  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.25);
  doc.line(PAGE.margin, 279, PAGE.width - PAGE.margin, 279);

  setMono(doc, 6.6, C.faint);
  doc.text(`ФОРМА 60 · РАЗБОР ПО РИСУНКУ · ЛИСТ ${pageNumber} ИЗ 3`, PAGE.margin, 283.5);
  doc.text(pageLabel, PAGE.width - PAGE.margin, 283.5, { align: 'right' });
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
  const step = lineHeight(size, 1.18);
  let cursor = y;
  for (const line of lines) {
    doc.text(line, x, cursor);
    cursor += step;
  }
  return cursor;
}

export function monoLabel(doc: jsPDF, text: string, x: number, y: number, size = 6.5, color: Rgb = C.accent): void {
  setMono(doc, size, color);
  doc.text(text.toUpperCase(), x, y, { charSpace: 0.35 });
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
  doc.roundedRect(x, y, width, height, 1.5, 1.5, 'FD');
}

export function drawStamp(doc: jsPDF, x: number, y: number, size: number): void {
  doc.setFillColor(...C.paper);
  doc.setDrawColor(...C.lineStrong);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, size, size, 1.5, 1.5, 'FD');
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.15);
  for (let i = 1; i < 3; i++) {
    const offset = (size / 3) * i;
    doc.line(x + offset, y + 1.5, x + offset, y + size - 1.5);
    doc.line(x + 1.5, y + offset, x + size - 1.5, y + offset);
  }
  setMono(doc, 7.5, C.ink);
  doc.text('Ф60', x + size / 2, y + size / 2 + 1.2, { align: 'center' });
}

/** Плашка-ярлык. Возвращает высоту, которую занимает. */
export function drawChip(doc: jsPDF, text: string, x: number, y: number, color: Rgb = C.accent): number {
  setMono(doc, 6.2, color);
  const width = doc.getTextWidth(text.toUpperCase()) + 5;
  doc.setFillColor(...C.panel2);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y - 3, width, 4.4, 1, 1, 'FD');
  doc.text(text.toUpperCase(), x + 2.5, y, { charSpace: 0.3 });
  return 4.4;
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
  setBody(doc, 8.6, C.ink, true);
  doc.text(label, x, y);
  setBody(doc, 7.4, C.muted);
  doc.text(band, x + width, y, { align: 'right' });

  const trackY = y + 3;
  doc.setFillColor(...C.panel2);
  doc.roundedRect(x, trackY, width, 1.4, 0.7, 0.7, 'F');

  const markerX = x + (Math.max(0, Math.min(100, value)) / 100) * width;
  doc.setFillColor(...(value > 58 ? C.gold : value < 42 ? C.accent : C.ink));
  doc.circle(markerX, trackY + 0.7, 1.4, 'F');

  setBody(doc, 6.6, C.faint);
  doc.text(left, x, trackY + 5.4);
  doc.text(right, x + width, trackY + 5.4, { align: 'right' });
  return trackY + 9.4;
}

export function drawDrawing(doc: jsPDF, dataUrl: string, x: number, y: number, size: number): void {
  doc.setFillColor(...C.paper);
  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, size, size, 1.5, 1.5, 'FD');
  if (dataUrl) {
    try {
      doc.addImage(dataUrl, 'PNG', x + 1.5, y + 1.5, size - 3, size - 3);
    } catch {
      setBody(doc, 7.5, C.faint);
      doc.text('Рисунок недоступен', x + size / 2, y + size / 2, { align: 'center' });
    }
  } else {
    setBody(doc, 7.5, C.faint);
    doc.text('Лист пустой', x + size / 2, y + size / 2, { align: 'center' });
  }
}
