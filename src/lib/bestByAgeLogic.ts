export type BandId = '0-3m' | '3-6m' | '6-12m' | '1y' | '2y' | '3y' | '4-5y';

export type Band = { id: BandId; label: string; short: string; fromMonths: number; toMonths: number };

export const bands: readonly Band[] = [
  { id: '0-3m', label: '0 to 3 months', short: '0-3 mo', fromMonths: 0, toMonths: 3 },
  { id: '3-6m', label: '3 to 6 months', short: '3-6 mo', fromMonths: 3, toMonths: 6 },
  { id: '6-12m', label: '6 to 12 months', short: '6-12 mo', fromMonths: 6, toMonths: 12 },
  { id: '1y', label: '1 year', short: '1 yr', fromMonths: 12, toMonths: 24 },
  { id: '2y', label: '2 years', short: '2 yrs', fromMonths: 24, toMonths: 36 },
  { id: '3y', label: '3 years', short: '3 yrs', fromMonths: 36, toMonths: 48 },
  { id: '4-5y', label: '4 to 5 years', short: '4-5 yrs', fromMonths: 48, toMonths: 72 },
] as const;

export const MAX_BAND_MONTHS = 72;

export type CategoryId = 'toys' | 'feeding' | 'sleep' | 'bath' | 'gear';

export const categories: readonly { id: CategoryId; label: string }[] = [
  { id: 'toys', label: 'Toys' },
  { id: 'feeding', label: 'Feeding' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'bath', label: 'Bath' },
  { id: 'gear', label: 'Gear' },
];

export type GreenLevel = 'verified' | 'brand' | 'none';

export type Source = { label: string; url: string };

export type AgeItem = {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  /** Youngest age the maker's own label allows, in months. We never list an item below this. */
  officialMinMonths: number;
  /** Ages where we list the item: from (inclusive) to (exclusive), in months. */
  listFromMonths: number;
  listToMonths: number;
  ageLabel: string;
  why: string;
  safety: string[];
  green: { level: GreenLevel; note: string };
  sources: Source[];
  productUrl: string;
};

export function bandForMonths(months: number): Band | null {
  if (!Number.isFinite(months) || months < 0 || months >= MAX_BAND_MONTHS) return null;
  return bands.find((b) => months >= b.fromMonths && months < b.toMonths) ?? null;
}

export function bandById(id: string): Band | null {
  return bands.find((b) => b.id === id) ?? null;
}

export function inBand(item: Pick<AgeItem, 'listFromMonths' | 'listToMonths'>, band: Band): boolean {
  return item.listFromMonths < band.toMonths && item.listToMonths > band.fromMonths;
}

export function itemsFor<T extends AgeItem>(items: readonly T[], band: Band, category: CategoryId | 'all'): T[] {
  return items.filter((i) => inBand(i, band) && (category === 'all' || i.category === category));
}

export function categoryCounts(items: readonly AgeItem[], band: Band): Record<CategoryId | 'all', number> {
  const counts: Record<CategoryId | 'all', number> = { all: 0, toys: 0, feeding: 0, sleep: 0, bath: 0, gear: 0 };
  for (const item of items) {
    if (!inBand(item, band)) continue;
    counts.all += 1;
    counts[item.category] += 1;
  }
  return counts;
}

export type AgeUnit = 'months' | 'years';

export type AgeInput = { ok: true; months: number } | { ok: false; reason: 'empty' | 'invalid' | 'too-old' };

/** Parses what a parent typed: whole numbers, or halves for years (1.5). */
export function parseAgeInput(text: string, unit: AgeUnit): AgeInput {
  const clean = text.trim().replace(',', '.');
  if (!clean) return { ok: false, reason: 'empty' };
  if (!/^\d+(\.\d+)?$/.test(clean)) return { ok: false, reason: 'invalid' };
  const value = Number(clean);
  if (!Number.isFinite(value)) return { ok: false, reason: 'invalid' };
  const months = unit === 'years' ? Math.floor(value * 12 + 1e-6) : Math.floor(value);
  if (months >= MAX_BAND_MONTHS) return { ok: false, reason: 'too-old' };
  return { ok: true, months };
}

export function validateItems(items: readonly AgeItem[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const i of items) {
    if (ids.has(i.id)) problems.push(`${i.id}: duplicate id`);
    ids.add(i.id);
    if (i.listFromMonths < i.officialMinMonths) problems.push(`${i.id}: listed below its official minimum age`);
    if (i.listToMonths <= i.listFromMonths) problems.push(`${i.id}: empty age window`);
    if (!/^https:\/\//.test(i.productUrl)) problems.push(`${i.id}: productUrl must be https`);
    if (i.sources.length === 0) problems.push(`${i.id}: needs at least one source`);
    if (i.sources.some((s) => !/^https:\/\//.test(s.url))) problems.push(`${i.id}: source urls must be https`);
    if (i.safety.length === 0) problems.push(`${i.id}: needs a safety note`);
    if (i.green.level === 'verified' && !i.sources.some((s) => /ewg\.org|acmiart\.org|oeko-tex|greenguard/i.test(s.url)))
      problems.push(`${i.id}: verified green claim needs a third-party source`);
    if (/non-?toxic/i.test(i.why) && i.green.level !== 'verified') problems.push(`${i.id}: "non-toxic" only allowed with a verified seal`);
    if (/\b\d(\.\d)?\s*(\/|out of)\s*5\b|stars?\b|rated\s+\d/i.test(`${i.why} ${i.green.note} ${i.safety.join(' ')}`))
      problems.push(`${i.id}: do not include ratings`);
  }
  return problems;
}
