import { isValidMediaRef } from '@/lib/media';
import { sanitizeText } from '@/lib/courseLogic';
import { secureDelete, secureGet, secureSet } from '@/lib/secureStorage';

export const MEMORIES_KEY = 'lulla.memories.v1';
export const MAX_MEMORIES = 250;
export const MAX_PHOTOS = 3;

export type MemoryKind = 'milestone' | 'word' | 'moment';

export type Memory = {
  id: string;
  kind: MemoryKind;
  refId: string | null;
  title: string;
  note: string;
  date: string;
  createdAt: number;
  ageLabel: string;
  photos: string[];
  voice: string | null;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function sanitizeMemories(raw: unknown): Memory[] {
  if (!Array.isArray(raw)) return [];
  const out: Memory[] = [];
  const seen = new Set<string>();
  for (const item of raw.slice(0, MAX_MEMORIES * 2)) {
    if (typeof item !== 'object' || item === null) continue;
    const r = item as Record<string, unknown>;
    const kind: MemoryKind | null = r.kind === 'milestone' || r.kind === 'word' || r.kind === 'moment' ? r.kind : null;
    if (!kind || typeof r.id !== 'string' || r.id.length > 60 || seen.has(r.id)) continue;
    if (typeof r.date !== 'string' || !DATE_RE.test(r.date)) continue;
    const title = sanitizeText(r.title, 80);
    if (!title) continue;
    seen.add(r.id);
    out.push({
      id: r.id,
      kind,
      refId: typeof r.refId === 'string' && r.refId.length <= 80 ? r.refId : null,
      title,
      note: sanitizeText(r.note, 300),
      date: r.date,
      createdAt: typeof r.createdAt === 'number' && Number.isFinite(r.createdAt) ? r.createdAt : Date.now(),
      ageLabel: sanitizeText(r.ageLabel, 30),
      photos: (Array.isArray(r.photos) ? r.photos : []).filter((p): p is string => isValidMediaRef(p, 'image')).slice(0, MAX_PHOTOS),
      voice: isValidMediaRef(r.voice, 'audio') ? r.voice : null,
    });
  }
  return out.sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1)).slice(0, MAX_MEMORIES);
}

export async function loadMemories(): Promise<Memory[]> {
  try {
    const raw = await secureGet(MEMORIES_KEY);
    return raw ? sanitizeMemories(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export async function saveMemories(memories: Memory[]): Promise<void> {
  await secureSet(MEMORIES_KEY, JSON.stringify(memories));
}

export async function wipeMemories(): Promise<void> {
  await secureDelete(MEMORIES_KEY);
}
