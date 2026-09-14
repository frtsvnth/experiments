import { COPY_BANK, type InsightContext, type InsightTemplate } from './copyBank';
import { combineSeed } from './seed';
import { LENS_LABELS, type Insight, type Lens } from './types';

export type { InsightContext, InsightTemplate } from './copyBank';

const LENS_ORDER: Lens[] = [
  'blind',
  'side',
  'decisions',
  'pressure',
  'contact',
  'resource',
  'promises',
  'evening',
];

function rotate<T>(items: T[], offset: number): T[] {
  const start = ((offset % items.length) + items.length) % items.length;
  return items.slice(start).concat(items.slice(0, start));
}

function fill(template: InsightTemplate, ctx: InsightContext): Insight {
  return {
    id: template.id,
    lens: template.lens,
    label: template.label ?? LENS_LABELS[template.lens],
    claim: template.claim,
    because: template.because,
    today: template.today(ctx),
    sting: template.sting,
  };
}

export function selectInsights(ctx: InsightContext, seed: number, count = 4): Insight[] {
  const order = rotate(LENS_ORDER, seed);
  const chosen: Insight[] = [];
  const usedLenses = new Set<Lens>();

  for (const lens of order) {
    if (chosen.length >= count) break;
    const candidates = COPY_BANK.filter((template) => template.lens === lens && template.match(ctx));
    if (candidates.length === 0 || usedLenses.has(lens)) continue;
    const index = combineSeed(seed, lens, 'pick') % candidates.length;
    chosen.push(fill(candidates[index], ctx));
    usedLenses.add(lens);
  }

  if (chosen.length < count) {
    for (const template of COPY_BANK) {
      if (chosen.length >= count) break;
      if (usedLenses.has(template.lens)) continue;
      chosen.push(fill(template, ctx));
      usedLenses.add(template.lens);
    }
  }

  return chosen.slice(0, count);
}

export function allInsightTemplates(): InsightTemplate[] {
  return COPY_BANK.slice();
}
