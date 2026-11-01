import { MAX_ROUTINE_STEPS, routineCatalog, tipById } from '../data/sleepHelp';
import { ageGuide, dayKey, localDayStart, typicalBedtime, type AgeGuide, type SleepSession } from './sleepCoach';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export type PlanItem = { tipId: string; done: boolean };
export type RoutineStep = { id: string; minutes: number };
export type WakeKind = 'woke' | 'fed' | 'comforted' | 'long';
export type WakeEntry = { id: string; at: number; kind: WakeKind };

export type SleepHelpData = {
  night: string;
  plan: PlanItem[];
  routine: RoutineStep[];
  wakes: WakeEntry[];
};

export const wakeKinds: { id: WakeKind; label: string; hint: string }[] = [
  { id: 'woke', label: 'Woke up', hint: 'Settled quickly' },
  { id: 'fed', label: 'Fed', hint: 'Needed a feed' },
  { id: 'comforted', label: 'Comforted', hint: 'Needed me for a while' },
  { id: 'long', label: 'Awake 30+ min', hint: 'Hard to resettle' },
];

const KEEP_MS = 60 * DAY;
const MAX_WAKES = 600;
const MAX_PLAN = 12;

export function nightKey(ts: number) {
  const d = new Date(ts);
  if (d.getHours() < 12) d.setDate(d.getDate() - 1);
  return dayKey(d.getTime());
}

function nightWindow(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return { from: new Date(y, m - 1, d, 12).getTime(), to: new Date(y, m - 1, d + 1, 12).getTime() };
}

export const emptySleepHelp = (now: number): SleepHelpData => ({ night: nightKey(now), plan: [], routine: [], wakes: [] });

export function sanitizeSleepHelp(raw: unknown, now: number): SleepHelpData {
  const base = emptySleepHelp(now);
  if (typeof raw !== 'object' || raw === null) return base;
  const r = raw as Record<string, unknown>;

  const sameNight = r.night === base.night;
  const plan: PlanItem[] = [];
  if (sameNight && Array.isArray(r.plan)) {
    const seen = new Set<string>();
    for (const item of r.plan.slice(0, MAX_PLAN * 2)) {
      if (typeof item !== 'object' || item === null) continue;
      const p = item as Record<string, unknown>;
      if (typeof p.tipId !== 'string' || !tipById(p.tipId) || seen.has(p.tipId)) continue;
      seen.add(p.tipId);
      plan.push({ tipId: p.tipId, done: p.done === true });
      if (plan.length >= MAX_PLAN) break;
    }
  }

  const routine: RoutineStep[] = [];
  if (Array.isArray(r.routine)) {
    const seen = new Set<string>();
    for (const item of r.routine.slice(0, MAX_ROUTINE_STEPS * 2)) {
      if (typeof item !== 'object' || item === null) continue;
      const s = item as Record<string, unknown>;
      const entry = routineCatalog.find((c) => c.id === s.id);
      if (!entry || seen.has(entry.id)) continue;
      seen.add(entry.id);
      const minutes = typeof s.minutes === 'number' && Number.isFinite(s.minutes) ? Math.round(s.minutes) : entry.minutes;
      routine.push({ id: entry.id, minutes: Math.max(1, Math.min(30, minutes)) });
      if (routine.length >= MAX_ROUTINE_STEPS) break;
    }
  }

  const wakes: WakeEntry[] = [];
  if (Array.isArray(r.wakes)) {
    const seen = new Set<string>();
    for (const item of r.wakes.slice(0, MAX_WAKES * 2)) {
      if (typeof item !== 'object' || item === null) continue;
      const w = item as Record<string, unknown>;
      const kind = wakeKinds.find((k) => k.id === w.kind)?.id;
      if (!kind || typeof w.id !== 'string' || w.id.length > 60 || seen.has(w.id)) continue;
      if (typeof w.at !== 'number' || !Number.isFinite(w.at)) continue;
      if (w.at < now - KEEP_MS || w.at > now + 60_000) continue;
      seen.add(w.id);
      wakes.push({ id: w.id, at: w.at, kind });
    }
    wakes.sort((a, b) => b.at - a.at);
    wakes.length = Math.min(wakes.length, MAX_WAKES);
  }

  return { night: base.night, plan, routine, wakes };
}

export function addToPlan(plan: PlanItem[], tipId: string): PlanItem[] {
  if (plan.some((p) => p.tipId === tipId) || plan.length >= MAX_PLAN) return plan;
  return [...plan, { tipId, done: false }];
}

export function togglePlanItem(plan: PlanItem[], tipId: string): PlanItem[] {
  return plan.map((p) => (p.tipId === tipId ? { ...p, done: !p.done } : p));
}

export function removeFromPlan(plan: PlanItem[], tipId: string): PlanItem[] {
  return plan.filter((p) => p.tipId !== tipId);
}

export function toggleRoutineStep(routine: RoutineStep[], id: string): RoutineStep[] {
  if (routine.some((s) => s.id === id)) return routine.filter((s) => s.id !== id);
  const entry = routineCatalog.find((c) => c.id === id);
  if (!entry || routine.length >= MAX_ROUTINE_STEPS) return routine;
  return [...routine, { id, minutes: entry.minutes }];
}

export function moveRoutineStep(routine: RoutineStep[], index: number, dir: -1 | 1): RoutineStep[] {
  const to = index + dir;
  if (index < 0 || index >= routine.length || to < 0 || to >= routine.length) return routine;
  const next = [...routine];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

export function setStepMinutes(routine: RoutineStep[], id: string, minutes: number): RoutineStep[] {
  const m = Math.max(1, Math.min(30, Math.round(minutes)));
  return routine.map((s) => (s.id === id ? { ...s, minutes: m } : s));
}

export function routineTotalMinutes(routine: RoutineStep[]) {
  return routine.reduce((sum, s) => sum + s.minutes, 0);
}

export function routineStartTime(bedtimeMinutes: number, routine: RoutineStep[], now: number) {
  const day = localDayStart(now);
  return day + bedtimeMinutes * MIN - routineTotalMinutes(routine) * MIN;
}

export type TimerPosition = { index: number; remainingSec: number; done: boolean };

export function routinePosition(routine: RoutineStep[], elapsedSec: number): TimerPosition {
  let cursor = 0;
  for (let i = 0; i < routine.length; i++) {
    const length = routine[i].minutes * 60;
    if (elapsedSec < cursor + length) return { index: i, remainingSec: Math.ceil(cursor + length - elapsedSec), done: false };
    cursor += length;
  }
  return { index: routine.length, remainingSec: 0, done: true };
}

export type WindowSuggestion = {
  kind: 'nap' | 'night';
  opensAt: number;
  closesAt: number;
  awakeUntilBedtimeMin: number;
  bedtimeAt: number;
  guide: AgeGuide;
};

export function isOvernight(ts: number) {
  const h = new Date(ts).getHours();
  return h >= 22 || h < 5;
}

export function suggestWindow(wakeAt: number, ageMonths: number, bedtimeMinutes: number): WindowSuggestion | null {
  if (isOvernight(wakeAt)) return null;
  const guide = ageGuide(ageMonths);
  let opensAt = wakeAt + guide.minWake * MIN;
  let closesAt = wakeAt + guide.maxWake * MIN;
  const mid = (opensAt + closesAt) / 2;
  const bedtimeAt = localDayStart(wakeAt) + bedtimeMinutes * MIN;
  let kind: 'nap' | 'night' = 'nap';
  if (ageMonths >= 3 && mid >= bedtimeAt - 75 * MIN) {
    kind = 'night';
    opensAt = bedtimeAt - 30 * MIN;
    closesAt = bedtimeAt + 15 * MIN;
  }
  return { kind, opensAt, closesAt, bedtimeAt, awakeUntilBedtimeMin: Math.round((bedtimeAt - wakeAt) / MIN), guide };
}

export function defaultBedtimeMinutes(sessions: SleepSession[], now: number) {
  return typicalBedtime(sessions, now).minutes;
}

export type NightRow = { key: string; from: number; count: number; long: number; nightSleepMs: number };

export function nightRows(wakes: WakeEntry[], sessions: SleepSession[], nights: number, now: number): NightRow[] {
  const rows: NightRow[] = [];
  const current = nightWindow(nightKey(now));
  for (let i = nights - 1; i >= 0; i--) {
    const d = new Date(current.from);
    d.setDate(d.getDate() - i);
    const key = dayKey(d.getTime());
    const win = nightWindow(key);
    const inNight = wakes.filter((w) => nightKey(w.at) === key);
    let nightSleepMs = 0;
    for (const s of sessions) {
      if (s.kind !== 'night') continue;
      const overlap = Math.min(s.end ?? now, win.to) - Math.max(s.start, win.from);
      if (overlap > 0) nightSleepMs += overlap;
    }
    rows.push({ key, from: win.from, count: inNight.length, long: inNight.filter((w) => w.kind === 'long').length, nightSleepMs });
  }
  return rows;
}

export type HourBucket = { label: string; from: number; to: number; count: number };

const bucketDefs: { label: string; from: number; to: number }[] = [
  { label: '6–8 PM', from: 18, to: 20 },
  { label: '8–10 PM', from: 20, to: 22 },
  { label: '10 PM–12 AM', from: 22, to: 24 },
  { label: '12–2 AM', from: 0, to: 2 },
  { label: '2–4 AM', from: 2, to: 4 },
  { label: '4–6 AM', from: 4, to: 6 },
  { label: '6–8 AM', from: 6, to: 8 },
];

export function hourBuckets(wakes: WakeEntry[], nights: number, now: number): HourBucket[] {
  const keys = new Set(nightRows(wakes, [], nights, now).map((r) => r.key));
  const buckets = bucketDefs.map((b) => ({ ...b, count: 0 }));
  for (const w of wakes) {
    if (!keys.has(nightKey(w.at))) continue;
    const h = new Date(w.at).getHours();
    const bucket = buckets.find((b) => h >= b.from && h < b.to);
    if (bucket) bucket.count += 1;
  }
  return buckets;
}

export function peakBucket(buckets: HourBucket[], minTotal = 3): HourBucket | null {
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  if (total < minTotal) return null;
  const top = buckets.reduce((best, b) => (b.count > best.count ? b : best), buckets[0]);
  return top.count >= 2 ? top : null;
}

export type WeekStats = {
  total: number;
  nightsCounted: number;
  avgPerNight: number;
  prevAvg: number | null;
};

export function weekStats(wakes: WakeEntry[], now: number): WeekStats {
  const rows = nightRows(wakes, [], 14, now);
  const first = wakes.length ? nightKey(Math.min(...wakes.map((w) => w.at))) : null;
  const counted = (list: NightRow[]) => (first ? list.filter((r) => r.key >= first) : []);
  const thisWeek = counted(rows.slice(7));
  const lastWeek = counted(rows.slice(0, 7));
  const total = thisWeek.reduce((s, r) => s + r.count, 0);
  const avg = (list: NightRow[]) => (list.length ? list.reduce((s, r) => s + r.count, 0) / list.length : 0);
  return {
    total,
    nightsCounted: thisWeek.length,
    avgPerNight: avg(thisWeek),
    prevAvg: lastWeek.length >= 3 ? avg(lastWeek) : null,
  };
}

export function tonightCount(wakes: WakeEntry[], now: number) {
  const key = nightKey(now);
  return wakes.filter((w) => nightKey(w.at) === key).length;
}

export function routineStepEndSec(routine: RoutineStep[], index: number) {
  return routine.slice(0, index + 1).reduce((sum, s) => sum + s.minutes * 60, 0);
}
