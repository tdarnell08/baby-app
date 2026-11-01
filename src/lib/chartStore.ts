import { sanitizeText } from '@/lib/courseLogic';
import { isValidMediaRef } from '@/lib/media';
import { secureDelete, secureGet, secureSet } from '@/lib/secureStorage';

export const CHARTS_KEY = 'lulla.charts.v1';
export const MAX_CHARTS = 12;
export const MAX_CHART_PHOTOS = 2;
export const MAX_CHART_ROWS = 14;

export type ChartRow = { range: string; dose: string };

export type DoseChart = {
  id: string;
  name: string;
  activeIngredient: string;
  note: string;
  rows: ChartRow[];
  photos: string[];
  createdAt: number;
};

export function sanitizeCharts(raw: unknown): DoseChart[] {
  if (!Array.isArray(raw)) return [];
  const out: DoseChart[] = [];
  const seen = new Set<string>();
  for (const item of raw.slice(0, MAX_CHARTS * 2)) {
    if (typeof item !== 'object' || item === null) continue;
    const r = item as Record<string, unknown>;
    if (typeof r.id !== 'string' || r.id.length > 60 || seen.has(r.id)) continue;
    const name = sanitizeText(r.name, 60);
    if (!name) continue;
    const rows: ChartRow[] = [];
    for (const row of (Array.isArray(r.rows) ? r.rows : []).slice(0, MAX_CHART_ROWS)) {
      if (typeof row !== 'object' || row === null) continue;
      const range = sanitizeText((row as Record<string, unknown>).range, 40);
      const dose = sanitizeText((row as Record<string, unknown>).dose, 60);
      if (range || dose) rows.push({ range, dose });
    }
    const photos = (Array.isArray(r.photos) ? r.photos : []).filter((p): p is string => isValidMediaRef(p, 'image')).slice(0, MAX_CHART_PHOTOS);
    if (rows.length === 0 && photos.length === 0) continue;
    seen.add(r.id);
    out.push({
      id: r.id,
      name,
      activeIngredient: sanitizeText(r.activeIngredient, 60),
      note: sanitizeText(r.note, 200),
      rows,
      photos,
      createdAt: typeof r.createdAt === 'number' && Number.isFinite(r.createdAt) ? r.createdAt : Date.now(),
    });
  }
  return out.sort((a, b) => b.createdAt - a.createdAt).slice(0, MAX_CHARTS);
}

export async function loadCharts(): Promise<DoseChart[]> {
  try {
    const raw = await secureGet(CHARTS_KEY);
    return raw ? sanitizeCharts(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export async function saveCharts(charts: DoseChart[]): Promise<void> {
  await secureSet(CHARTS_KEY, JSON.stringify(charts));
}

export async function wipeCharts(): Promise<void> {
  await secureDelete(CHARTS_KEY);
}
