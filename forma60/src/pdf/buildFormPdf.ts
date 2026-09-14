import { jsPDF } from 'jspdf';
import { renderStrokesToDataUrl } from '../canvas/inkEngine';
import type { DayContext, Profile, Stroke } from '../engine/types';
import { prepareFontsForDocument } from './fonts';
import {
  C,
  PAGE,
  displayHeading,
  drawChip,
  drawDrawing,
  drawPanel,
  drawRule,
  drawScaleBar,
  drawStamp,
  lineHeight,
  monoLabel,
  paintPage,
  paragraph,
  setBody,
  setDisplay,
  setMono,
} from './pdfTheme';

export type PdfInput = {
  profile: Profile;
  strokes: Stroke[];
  canvasSize: number;
  day: DayContext;
  participantName: string;
  age: number | null;
};

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
};

export function transliterate(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map((char) => TRANSLIT[char] ?? char)
    .join('');
}

export function pdfFileName(name: string, isoDate: string): string {
  const safe = transliterate(name).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `Forma60_${safe || 'participant'}_${isoDate.replace(/-/g, '')}.pdf`;
}

function infoBlockHeight(doc: jsPDF, text: string, width: number, size: number): number {
  setBody(doc, size, C.ink);
  const lines = doc.splitTextToSize(text, width) as string[];
  return 5 + lines.length * lineHeight(size) + 5;
}

function drawInfoBlock(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  text: string,
  size = 8.4,
): number {
  const height = infoBlockHeight(doc, text, width - 8, size);
  drawPanel(doc, x, y, width, height);
  monoLabel(doc, title, x + 4, y + 5, 6.2, C.cyan);
  paragraph(doc, text, x + 4, y + 10, width - 8, size, C.ink);
  return y + height + 4;
}

export async function buildFormDocument(input: PdfInput): Promise<jsPDF> {
  const { profile, strokes, canvasSize, day, participantName, age } = input;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  await prepareFontsForDocument(doc);

  const x = PAGE.margin;
  const contentWidth = PAGE.width - PAGE.margin * 2;

  /* ---------------- Лист 1. Срез ---------------- */
  paintPage(doc, 1, 'СРЕЗ');

  drawStamp(doc, x, 20, 17);
  setMono(doc, 7, C.faint);
  doc.text(profile.number, PAGE.width - PAGE.margin, 25, { align: 'right' });

  setBody(doc, 15, C.ink, true);
  doc.text(participantName, x + 23, 27);
  setBody(doc, 9, C.muted);
  const dateLine = `${String(day.date.getDate()).padStart(2, '0')}.${String(day.date.getMonth() + 1).padStart(2, '0')}.${day.date.getFullYear()} · ${day.weekdayName}${age !== null ? ` · ${age} лет` : ''}`;
  doc.text(dateLine, x + 23, 33);
  setMono(doc, 8, C.gold);
  doc.text('ФОРМА 60 · ЭКСПРЕСС-СРЕЗ ЛИЧНОСТИ НА ДЕНЬ', PAGE.width - PAGE.margin, 33, { align: 'right' });

  drawRule(doc, x, 38, contentWidth, C.lineGold);

  const drawingSize = 58;
  drawDrawing(doc, renderStrokesToDataUrl(strokes, canvasSize || 360, 18, undefined, 3), x, 44, drawingSize);
  setMono(doc, 6, C.faint);
  doc.text('СЛЕД СЕАНСА · 60 СЕКУНД', x, 44 + drawingSize + 4);

  const rightX = x + drawingSize + 8;
  const rightWidth = contentWidth - drawingSize - 8;
  let rightY = displayHeading(doc, profile.headline, rightX, 52, 17, C.ink, rightWidth);
  rightY = paragraph(doc, profile.lead, rightX, rightY + 4, rightWidth, 8.6, C.muted);

  let y = Math.max(44 + drawingSize + 12, rightY + 6);
  monoLabel(doc, 'Четыре попадания', x, y, 8, C.gold2);
  y += 6;

  for (const insight of profile.insights) {
    setBody(doc, 10, C.ink, true);
    const claimLines = doc.splitTextToSize(insight.claim, contentWidth - 8) as string[];
    setBody(doc, 7.4, C.faint);
    const becauseLines = doc.splitTextToSize(insight.because, contentWidth - 8) as string[];
    setBody(doc, 8.4, C.ink);
    const todayLines = doc.splitTextToSize(insight.today, contentWidth - 8) as string[];
    setBody(doc, 7.4, C.gold2);
    const stingLines = doc.splitTextToSize(`Цена, если не заметить: ${insight.sting}`, contentWidth - 8) as string[];

    const height =
      6 +
      claimLines.length * lineHeight(10) +
      becauseLines.length * lineHeight(7.4) +
      todayLines.length * lineHeight(8.4) +
      stingLines.length * lineHeight(7.4) +
      4;

    drawPanel(doc, x, y, contentWidth, height);
    drawChip(doc, insight.label, x + 4, y + 6, C.cyan);
    paragraph(doc, insight.claim, x + 4, y + 6, contentWidth - 8, 10, C.ink, true);
    const afterBecause = paragraph(
      doc,
      insight.because,
      x + 4,
      y + 6 + claimLines.length * lineHeight(10) + 1,
      contentWidth - 8,
      7.4,
      C.faint,
    );
    const afterToday = paragraph(doc, insight.today, x + 4, afterBecause + 1.5, contentWidth - 8, 8.4, C.ink);
    paragraph(
      doc,
      `Цена, если не заметить: ${insight.sting}`,
      x + 4,
      afterToday + 1.5,
      contentWidth - 8,
      7.4,
      C.gold2,
    );

    y += height + 4;
  }

  /* ---------------- Лист 2. Личность ---------------- */
  doc.addPage();
  paintPage(doc, 2, 'ЛИЧНОСТЬ');
  y = 26;
  y = displayHeading(doc, 'Личность и связка с людьми', x, y, 22, C.ink) + 4;
  y = paragraph(
    doc,
    `Роль дня: ${profile.roleLabel}. ${profile.roleText}`,
    x,
    y,
    contentWidth,
    9,
    C.muted,
  ) + 4;
  drawRule(doc, x, y, contentWidth);
  y += 6;

  const colWidth = (contentWidth - 6) / 2;
  const leftBlocks: [string, string][] = [
    ['КАК РЕШАЕТЕ', profile.decision],
    ['ПОД ДАВЛЕНИЕМ', `${profile.shadowLabel[0].toUpperCase()}${profile.shadowLabel.slice(1)}. ${profile.shadowText} ${profile.pressure}`],
  ];
  const rightBlocks: [string, string][] = [
    ['КАК ГОВОРИТЕ', profile.speech],
    ['ЧТО ДВИЖЕТ', `${profile.motiveLabel[0].toUpperCase()}${profile.motiveLabel.slice(1)}. ${profile.motiveText}`],
  ];

  for (let i = 0; i < 2; i++) {
    const leftHeight = infoBlockHeight(doc, leftBlocks[i][1], colWidth - 8, 8.2);
    const rightHeight = infoBlockHeight(doc, rightBlocks[i][1], colWidth - 8, 8.2);
    drawInfoBlock(doc, x, y, colWidth, leftBlocks[i][0], leftBlocks[i][1], 8.2);
    drawInfoBlock(doc, x + colWidth + 6, y, colWidth, rightBlocks[i][0], rightBlocks[i][1], 8.2);
    y += Math.max(leftHeight, rightHeight) + 4;
  }

  monoLabel(doc, 'Как с вами сегодня', x, y + 2, 8, C.gold2);
  y += 7;
  for (const line of profile.withYou) {
    setBody(doc, 8.6, C.ink);
    doc.text('—', x + 1, y);
    y = paragraph(doc, line, x + 5, y, contentWidth - 5, 8.6, C.ink) + 2;
  }

  y += 4;
  monoLabel(doc, 'Пять шкал дня', x, y + 2, 8, C.gold2);
  y += 8;
  for (const scale of profile.scales) {
    y = drawScaleBar(doc, x, y, contentWidth, scale.value, scale.label, scale.band, scale.left, scale.right);
  }

  /* ---------------- Лист 3. Почему сегодня ---------------- */
  doc.addPage();
  paintPage(doc, 3, 'ПОЧЕМУ СЕГОДНЯ');
  y = 26;
  y = displayHeading(doc, 'Почему именно сегодня', x, y, 22, C.ink) + 5;

  const dayItems: [string, string][] = [
    ['ДЕНЬ НЕДЕЛИ', profile.dayWhy.weekday],
    ['ТА ЖЕ ЛИНИЯ В ДРУГОЙ ДЕНЬ', profile.dayWhy.counterfactual],
  ];
  if (profile.dayWhy.calendar) dayItems.push(['КАЛЕНДАРЬ', profile.dayWhy.calendar]);
  if (profile.dayWhy.weather) dayItems.push(['СРЕДА ДНЯ', profile.dayWhy.weather]);
  dayItems.push(['СВЕТ', profile.dayWhy.lunar]);
  if (profile.dayWhy.birth) dayItems.push(['КОНТУР ДАТЫ', profile.dayWhy.birth]);

  const dayCol = (contentWidth - 6) / 2;
  for (let i = 0; i < dayItems.length; i += 2) {
    const leftItem = dayItems[i];
    const rightItem = dayItems[i + 1];
    const leftHeight = infoBlockHeight(doc, leftItem[1], dayCol - 8, 7.8);
    drawInfoBlock(doc, x, y, dayCol, leftItem[0], leftItem[1], 7.8);
    let rowHeight = leftHeight;
    if (rightItem) {
      const rightHeight = infoBlockHeight(doc, rightItem[1], dayCol - 8, 7.8);
      drawInfoBlock(doc, x + dayCol + 6, y, dayCol, rightItem[0], rightItem[1], 7.8);
      rowHeight = Math.max(rowHeight, rightHeight);
    }
    y += rowHeight + 4;
  }

  monoLabel(doc, 'Окно дня', x, y + 2, 8, C.gold2);
  y += 7;
  const windowCol = (contentWidth - 8) / 3;
  const windowItems: [string, string][] = [
    ['УТРО', profile.dayWhy.window.morning],
    ['СЕРЕДИНА', profile.dayWhy.window.midday],
    ['ВЕЧЕР', profile.dayWhy.window.evening],
  ];
  const windowHeights = windowItems.map((item) => infoBlockHeight(doc, item[1], windowCol - 8, 7.4));
  const windowHeight = Math.max(...windowHeights);
  windowItems.forEach((item, index) => {
    const wx = x + index * (windowCol + 4);
    drawPanel(doc, wx, y, windowCol, windowHeight);
    monoLabel(doc, item[0], wx + 4, y + 5, 6.2, C.gold);
    paragraph(doc, item[1], wx + 4, y + 10, windowCol - 8, 7.4, C.ink);
  });
  y += windowHeight + 6;

  y = paragraph(doc, profile.dayWhy.closing, x, y, contentWidth, 9, C.ink) + 3;
  setBody(doc, 7, C.faint);
  y = paragraph(doc, profile.dayWhy.drop, x, y, contentWidth, 7, C.faint) + 5;

  setBody(doc, 7.4, C.muted, true);
  doc.text('Как это считается', x, y);
  y += 4;
  const method = [
    'След оцифровывается как последовательность точек: координата, время, нажим.',
    'Считаются длина, число штрихов, скорость и её разброс, паузы, кривизна, покрытие плоскости, совпадение с сеткой и распределение по четвертям.',
    'Отдельно измеряются симметрия, зоны старта и финиша, баланс начала и конца, число чернил.',
    'Пять внутренних индексов выводятся из этих величин по фиксированным правилам.',
    'Интерпретация соединяет стиль линии, состояние минуты и контекст дня: день недели, календарь, погоду, свет и контур даты рождения.',
    'Один и тот же след в один и тот же день даёт один и тот же текст.',
  ];
  for (const line of method) {
    setBody(doc, 7, C.muted);
    const lines = doc.splitTextToSize(`— ${line}`, contentWidth - 4) as string[];
    for (const wrapped of lines) {
      doc.text(wrapped, x + 1, y);
      y += lineHeight(7);
    }
    y += 1;
  }

  y += 3;
  setBody(doc, 7, C.faint);
  y = paragraph(
    doc,
    'Сформирован автоматически, не заменяет консультацию специалиста.',
    x,
    y,
    contentWidth,
    7,
    C.faint,
  );

  setDisplay(doc, 13, C.gold);
  doc.text('Ф60 · локальный срез', x, Math.min(y + 10, PAGE.height - 20));
  doc.setDrawColor(...C.lineGold);
  doc.setLineWidth(0.3);
  doc.roundedRect(x - 2, Math.min(y + 10, PAGE.height - 20) - 5, 62, 8, 2, 2, 'S');

  return doc;
}

export async function buildFormPdf(input: PdfInput): Promise<Blob> {
  const doc = await buildFormDocument(input);
  const buffer = doc.output('arraybuffer');
  return new Blob([buffer], { type: 'application/pdf' });
}
