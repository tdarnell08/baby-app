import { openSession, type SleepKind, type SleepSession } from '@/lib/sleepCoach';
import { secureDelete, secureGet, secureSet } from '@/lib/secureStorage';

export const SLEEP_KEY = 'lulla.sleep.v1';
export const SLEEP_PREFS_KEY = 'lulla.sleepPrefs.v1';

const DAY = 24 * 60 * 60 * 1000;
const KEEP_MS = 90 * DAY;
const MAX_SESSIONS = 600;
const MAX_SESSION_MS = 20 * 60 * 60 * 1000;

export type SleepPrefs = { remind: boolean; leadMinutes: number };

export const LEAD_OPTIONS = [5, 10, 15, 30];
export const defaultSleepPrefs = (): SleepPrefs => ({ remind: false, leadMinutes: 10 });

export function sanitizeSessions(raw: unknown, now = Date.now()): SleepSession[] {
  if (!Array.isArray(raw)) return [];
  const out: SleepSession[] = [];
  const seen = new Set<string>();
  for (const item of raw.slice(0, MAX_SESSIONS * 2)) {
    if (typeof item !== 'object' || item === null) continue;
    const r = item as Record<string, unknown>;
    const kind: SleepKind | null = r.kind === 'nap' || r.kind === 'night' ? r.kind : null;
    if (!kind || typeof r.id !== 'string' || r.id.length > 60 || seen.has(r.id)) continue;
    if (typeof r.start !== 'number' || !Number.isFinite(r.start)) continue;
    if (r.start < now - KEEP_MS || r.start > now + 60_000) continue;
    let end: number | null = null;
    if (r.end !== null && r.end !== undefined) {
      if (typeof r.end !== 'number' || !Number.isFinite(r.end)) continue;
      if (r.end < r.start || r.end > now + 60_000 || r.end - r.start > MAX_SESSION_MS) continue;
      end = r.end;
    }
    seen.add(r.id);
    out.push({ id: r.id, kind, start: r.start, end });
  }
  out.sort((a, b) => b.start - a.start);
  const trimmed = out.slice(0, MAX_SESSIONS);
  let seenOpen = false;
  return trimmed.map((s) => {
    if (s.end !== null) return s;
    if (!seenOpen) {
      seenOpen = true;
      return s;
    }
    return { ...s, end: s.start + 5 * 60 * 1000 };
  });
}

export async function loadSleep(): Promise<SleepSession[]> {
  try {
    const raw = await secureGet(SLEEP_KEY);
    return raw ? sanitizeSessions(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export async function saveSleep(sessions: SleepSession[]): Promise<void> {
  await secureSet(SLEEP_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
}

export function sanitizePrefs(raw: unknown): SleepPrefs {
  const base = defaultSleepPrefs();
  if (typeof raw !== 'object' || raw === null) return base;
  const r = raw as Record<string, unknown>;
  return {
    remind: r.remind === true,
    leadMinutes: typeof r.leadMinutes === 'number' && LEAD_OPTIONS.includes(r.leadMinutes) ? r.leadMinutes : base.leadMinutes,
  };
}

export async function loadSleepPrefs(): Promise<SleepPrefs> {
  try {
    const raw = await secureGet(SLEEP_PREFS_KEY);
    return raw ? sanitizePrefs(JSON.parse(raw)) : defaultSleepPrefs();
  } catch {
    return defaultSleepPrefs();
  }
}

export async function saveSleepPrefs(prefs: SleepPrefs): Promise<void> {
  await secureSet(SLEEP_PREFS_KEY, JSON.stringify(prefs));
}

export async function wipeSleep(): Promise<void> {
  await Promise.allSettled([secureDelete(SLEEP_KEY), secureDelete(SLEEP_PREFS_KEY)]);
}

export function hasOpenSession(sessions: SleepSession[]) {
  return openSession(sessions) !== null;
}
