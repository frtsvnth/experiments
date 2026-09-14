import { jsPDF } from 'jspdf';
import { PRINT_INK_THEME, renderStrokesToDataUrl, toPrintStrokes } from '../canvas/inkEngine';
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

export type PdfOptions = {
  /** Падать, если контент заходит на колонтитул. Используется в тестах. */
  strict?: boolean;
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

/* ---------- измерение блоков ---------- */

function blockHeight(doc: jsPDF, text: string, width: number, size: number): number {
  setBody(doc, size, C.ink);
  const lines = doc.splitTextToSize(text, width) as string[];
  return 4.5 + 5 + lines.length * lineHeight(size, 1.4) + 4;
}

function drawBlock(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  text: string,
  size = 7.8,
): number {
  const height = blockHeight(doc, text, width - 8, size);
  drawPanel(doc, x, y, width, height);
  monoLabel(doc, title, x + 4, y + 5, 6, C.accent);
  paragraph(doc, text, x + 4, y + 10, width - 8, size, C.ink);
  return y + height + 3.5;
}

/* ---------- сборка ---------- */

export async function buildFormDocument(input: PdfInput, options: PdfOptions = {}): Promise<jsPDF> {
  const { profile, strokes, canvasSize, day, participantName, age } = input;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  await prepareFontsForDocument(doc);

  const x = PAGE.margin;
  const contentWidth = PAGE.width - PAGE.margin * 2;
  const bottoms: number[] = [];

  /* ---------------- Лист 1. Срез ---------------- */
  paintPage(doc, 1, 'СРЕЗ');

  drawStamp(doc, x, 22, 16);
  setBody(doc, 14, C.ink, true);
  doc.text(participantName, x + 22, 28);
  setBody(doc, 8.4, C.muted);
  const dateLine = `${String(day.date.getDate()).padStart(2, '0')}.${String(day.date.getMonth() + 1).padStart(2, '0')}.${day.date.getFullYear()} · ${day.weekdayName}${age !== null ? ` · ${age} лет` : ''}`;
  doc.text(dateLine, x + 22, 33.5);
  setMono(doc, 7.4, C.gold);
  doc.text('ФОРМА 60 · ЭКСПРЕСС-СРЕЗ ЛИЧНОСТИ НА ДЕНЬ', PAGE.width - PAGE.margin, 33.5, { align: 'right' });
  setMono(doc, 7, C.faint);
  doc.text(profile.number, PAGE.width - PAGE.margin, 28, { align: 'right' });
  drawRule(doc, x, 37.5, contentWidth, C.lineStrong);

  const drawingSize = 44;
  drawDrawing(
    doc,
    renderStrokesToDataUrl(toPrintStrokes(strokes), canvasSize || 360, 18, PRINT_INK_THEME, 3),
    x,
    42,
    drawingSize,
  );
  setMono(doc, 6, C.faint);
  doc.text('СЛЕД СЕАНСА · 60 СЕКУНД', x, 42 + drawingSize + 4);

  const rightX = x + drawingSize + 7;
  const rightWidth = contentWidth - drawingSize - 7;
  const afterHeadline = displayHeading(doc, profile.headline, rightX, 49, 15.5, C.ink, rightWidth);
  const afterLead = paragraph(doc, profile.lead, rightX, afterHeadline + 3, rightWidth, 8.2, C.muted);

  let y = Math.max(42 + drawingSize + 9, afterLead + 5);
  monoLabel(doc, 'Четыре попадания', x, y, 7.5, C.gold);
  y += 7;

  for (const insight of profile.insights) {
    setBody(doc, 9.4, C.ink, true);
    const claimLines = doc.splitTextToSize(insight.claim, contentWidth - 8) as string[];
    setBody(doc, 6.8, C.faint);
    const becauseLines = doc.splitTextToSize(insight.because, contentWidth - 8) as string[];
    setBody(doc, 7.6, C.ink);
    const todayLines = doc.splitTextToSize(insight.today, contentWidth - 8) as string[];
    setBody(doc, 6.8, C.gold);
    const stingLines = doc.splitTextToSize(`Цена, если не заметить: ${insight.sting}`, contentWidth - 8) as string[];

    const claimStep = lineHeight(9.4, 1.35);
    const becauseStep = lineHeight(6.8, 1.35);
    const todayStep = lineHeight(7.6, 1.35);
    const stingStep = lineHeight(6.8, 1.35);

    const height =
      5.5 +
      5.2 +
      claimLines.length * claimStep +
      1.2 +
      becauseLines.length * becauseStep +
      1.6 +
      todayLines.length * todayStep +
      1.6 +
      stingLines.length * stingStep +
      3.5;

    drawPanel(doc, x, y, contentWidth, height);
    const chipBaseline = y + 5.5;
    drawChip(doc, insight.label, x + 4, chipBaseline, C.accent);

    let cursor = chipBaseline + 5.2;
    cursor = paragraph(doc, insight.claim, x + 4, cursor, contentWidth - 8, 9.4, C.ink, true, 1.35) + 1.2;
    cursor = paragraph(doc, insight.because, x + 4, cursor, contentWidth - 8, 6.8, C.faint, false, 1.35) + 1.6;
    cursor = paragraph(doc, insight.today, x + 4, cursor, contentWidth - 8, 7.6, C.ink, false, 1.35) + 1.6;
    paragraph(doc, `Цена, если не заметить: ${insight.sting}`, x + 4, cursor, contentWidth - 8, 6.8, C.gold, false, 1.35);

    y += height + 2.5;
  }
  bottoms.push(y);

  /* ---------------- Лист 2. Личность ---------------- */
  doc.addPage();
  paintPage(doc, 2, 'ЛИЧНОСТЬ');
  y = 26;
  y = displayHeading(doc, 'Личность и связка с людьми', x, y, 21, C.ink) + 4;
  y = paragraph(doc, `Роль дня: ${profile.roleLabel}. ${profile.roleText}`, x, y, contentWidth, 8.8, C.muted) + 4;
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
    const leftHeight = blockHeight(doc, leftBlocks[i][1], colWidth - 8, 7.8);
    const rightHeight = blockHeight(doc, rightBlocks[i][1], colWidth - 8, 7.8);
    drawBlock(doc, x, y, colWidth, leftBlocks[i][0], leftBlocks[i][1], 7.8);
    drawBlock(doc, x + colWidth + 6, y, colWidth, rightBlocks[i][0], rightBlocks[i][1], 7.8);
    y += Math.max(leftHeight, rightHeight) + 3.5;
  }

  monoLabel(doc, 'Как с вами сегодня', x, y + 2, 7.5, C.gold);
  y += 7;
  for (const line of profile.withYou) {
    setBody(doc, 8.4, C.ink);
    doc.text('—', x + 1, y);
    y = paragraph(doc, line, x + 5, y, contentWidth - 5, 8.4, C.ink) + 1.6;
  }

  y += 4;
  monoLabel(doc, 'Пять шкал дня', x, y + 2, 7.5, C.gold);
  y += 8;
  for (const scale of profile.scales) {
    y = drawScaleBar(doc, x, y, contentWidth, scale.value, scale.label, scale.band, scale.left, scale.right);
  }
  bottoms.push(y);

  /* ---------------- Лист 3. Почему сегодня ---------------- */
  doc.addPage();
  paintPage(doc, 3, 'ПОЧЕМУ СЕГОДНЯ');
  y = 26;
  y = displayHeading(doc, 'Почему именно сегодня', x, y, 21, C.ink) + 4;

  const dayItems: [string, string][] = [
    ['ДЕНЬ НЕДЕЛИ', profile.dayWhy.weekday],
    ['ТА ЖЕ ЛИНИЯ В ДРУГОЙ ДЕНЬ', profile.dayWhy.counterfactual],
  ];
  if (profile.dayWhy.calendar) dayItems.push(['КАЛЕНДАРЬ', profile.dayWhy.calendar]);
  if (profile.dayWhy.weather) dayItems.push(['ПОГОДА', profile.dayWhy.weather]);
  dayItems.push(['ЛУНА', profile.dayWhy.lunar]);
  if (profile.dayWhy.birth) dayItems.push(['ДАТА РОЖДЕНИЯ', profile.dayWhy.birth]);

  const dayCol = (contentWidth - 6) / 2;
  for (let i = 0; i < dayItems.length; i += 2) {
    const leftItem = dayItems[i];
    const rightItem = dayItems[i + 1];
    const leftHeight = blockHeight(doc, leftItem[1], dayCol - 8, 7.4);
    drawBlock(doc, x, y, dayCol, leftItem[0], leftItem[1], 7.4);
    let rowHeight = leftHeight;
    if (rightItem) {
      const rightHeight = blockHeight(doc, rightItem[1], dayCol - 8, 7.4);
      drawBlock(doc, x + dayCol + 6, y, dayCol, rightItem[0], rightItem[1], 7.4);
      rowHeight = Math.max(rowHeight, rightHeight);
    }
    y += rowHeight + 3.5;
  }

  monoLabel(doc, 'Как идёт день', x, y + 2, 7.5, C.gold);
  y += 7;
  const windowCol = (contentWidth - 8) / 3;
  const windowItems: [string, string][] = [
    ['УТРО', profile.dayWhy.window.morning],
    ['ДЕНЬ', profile.dayWhy.window.midday],
    ['ВЕЧЕР', profile.dayWhy.window.evening],
  ];
  const windowHeights = windowItems.map((item) => blockHeight(doc, item[1], windowCol - 8, 7));
  const windowHeight = Math.max(...windowHeights);
  windowItems.forEach((item, index) => {
    const wx = x + index * (windowCol + 4);
    drawPanel(doc, wx, y, windowCol, windowHeight);
    monoLabel(doc, item[0], wx + 4, y + 5, 6, C.gold);
    paragraph(doc, item[1], wx + 4, y + 10, windowCol - 8, 7, C.ink);
  });
  y += windowHeight + 5;

  y = paragraph(doc, profile.dayWhy.closing, x, y, contentWidth, 8.6, C.ink) + 3;
  y = paragraph(doc, profile.dayWhy.drop, x, y, contentWidth, 6.8, C.faint) + 5;

  setBody(doc, 7.2, C.ink, true);
  doc.text('Как это считается', x, y);
  y += 4;
  const method = [
    'След превращается в набор точек: где была рука, в какой момент и с каким нажимом.',
    'Считаются длина линии, число штрихов, скорость и её перепады, паузы, повороты, занятое место и совпадение с клеткой.',
    'Отдельно считаются ровность, место старта и финиша, число использованных чернил.',
    'Пять показателей выводятся из этих величин по постоянным правилам.',
    'Выводы соединяют три вещи: как вы обычно ведёте линию, как провели эту минуту и какой сегодня день.',
    'День учитывается так: день недели, календарь, погода, луна и дата рождения.',
    'Один и тот же рисунок в один и тот же день даёт один и тот же текст.',
  ];
  for (const line of method) {
    setBody(doc, 6.8, C.muted);
    const lines = doc.splitTextToSize(`— ${line}`, contentWidth - 3) as string[];
    for (const wrapped of lines) {
      doc.text(wrapped, x + 1, y);
      y += lineHeight(6.8, 1.35);
    }
    y += 0.8;
  }

  y += 2.5;
  y = paragraph(
    doc,
    'Сформирован автоматически, не заменяет консультацию специалиста.',
    x,
    y,
    contentWidth,
    6.8,
    C.faint,
  );

  const stampY = Math.min(y + 8, PAGE.safeBottom - 8);
  doc.setDrawColor(...C.gold);
  doc.setLineWidth(0.3);
  doc.roundedRect(x - 1, stampY - 4.5, 58, 7, 1.5, 1.5, 'S');
  setDisplay(doc, 11, C.gold);
  doc.text('Ф60 · локальный срез', x + 2, stampY);
  bottoms.push(stampY);

  if (options.strict) {
    const overflow = bottoms.filter((value) => value > PAGE.safeBottom);
    if (overflow.length > 0) {
      throw new Error(`PDF overflow: ${overflow.map((v) => v.toFixed(1)).join(', ')} > ${PAGE.safeBottom}`);
    }
  }

  return doc;
}

export async function buildFormPdf(input: PdfInput): Promise<Blob> {
  const doc = await buildFormDocument(input);
  const buffer = doc.output('arraybuffer');
  return new Blob([buffer], { type: 'application/pdf' });
}
