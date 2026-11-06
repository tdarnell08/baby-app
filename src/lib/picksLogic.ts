export type Pick = {
  id: string;
  name: string;
  brand: string;
  category: string;
  ageFit: string;
  tagline: string;
  whyWeLike: string;
  brandSays: string[];
  worthKnowing: string[];
  checkIt: { label: string; url: string }[];
  productUrl: string;
};

export const MS_DAY = 24 * 60 * 60 * 1000;

/** Monday 00:00 local time of the week containing `date`. */
export function weekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const sinceMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - sinceMonday);
  return d;
}

/** Whole weeks since a fixed Monday, so every device agrees on which week it is. */
export function weekNumber(date: Date): number {
  const anchor = new Date(2024, 0, 1);
  const diff = weekStart(date).getTime() - anchor.getTime();
  return Math.round(diff / (7 * MS_DAY));
}

export function pickOfWeek<T>(picks: readonly T[], date: Date): T | null {
  if (picks.length === 0) return null;
  const n = weekNumber(date);
  return picks[((n % picks.length) + picks.length) % picks.length];
}

export function weekLabel(date: Date): string {
  return weekStart(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function resolveLink(affiliateUrl: string, productUrl: string): { url: string; affiliate: boolean } {
  const clean = affiliateUrl.trim();
  if (/^https:\/\//i.test(clean)) return { url: clean, affiliate: true };
  return { url: productUrl, affiliate: false };
}

export type PicksPrefs = { show: boolean };

export const defaultPicksPrefs = (): PicksPrefs => ({ show: true });

export function sanitizePicksPrefs(raw: unknown): PicksPrefs {
  const r = (raw ?? {}) as Partial<PicksPrefs>;
  return { show: r.show !== false };
}
