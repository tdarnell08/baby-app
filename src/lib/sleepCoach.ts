export type SleepKind = 'nap' | 'night';

export type SleepSession = {
  id: string;
  kind: SleepKind;
  start: number;
  end: number | null;
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export type AgeGuide = {
  minWake: number;
  maxWake: number;
  naps: string;
  total: string;
  source: string;
};

const guides: { upTo: number; guide: AgeGuide }[] = [
  { upTo: 1, guide: { minWake: 45, maxWake: 60, naps: '4 or more short naps', total: '14 to 17 hours a day', source: 'NSF' } },
  { upTo: 2, guide: { minWake: 60, maxWake: 90, naps: '4 or 5 naps', total: '14 to 17 hours a day', source: 'NSF' } },
  { upTo: 3, guide: { minWake: 75, maxWake: 120, naps: '3 to 5 naps', total: '14 to 17 hours a day', source: 'NSF' } },
  { upTo: 5, guide: { minWake: 90, maxWake: 150, naps: '3 or 4 naps', total: '12 to 16 hours a day', source: 'AASM' } },
  { upTo: 7, guide: { minWake: 120, maxWake: 180, naps: '3 naps', total: '12 to 16 hours a day', source: 'AASM' } },
  { upTo: 10, guide: { minWake: 150, maxWake: 210, naps: '2 or 3 naps', total: '12 to 16 hours a day', source: 'AASM' } },
  { upTo: 14, guide: { minWake: 180, maxWake: 240, naps: '2 naps', total: '11 to 14 hours a day', source: 'AASM' } },
  { upTo: 24, guide: { minWake: 240, maxWake: 360, naps: '1 or 2 naps, usually down to 1 around 15 to 18 months', total: '11 to 14 hours a day', source: 'AASM' } },
  { upTo: 999, guide: { minWake: 300, maxWake: 420, naps: '0 or 1 nap', total: '11 to 14 hours a day', source: 'AASM' } },
];

export function ageGuide(ageMonths: number): AgeGuide {
  const months = Math.max(0, Math.round(ageMonths));
  return (guides.find((g) => months <= g.upTo) ?? guides[guides.length - 1]).guide;
}

export function formatMinutes(minutes: number) {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} h` : `${h} h ${rest} min`;
}

export function formatWakeRange(guide: AgeGuide) {
  const lo = guide.minWake;
  const hi = guide.maxWake;
  const fmt = (v: number) => (v < 60 ? `${v} min` : `${v / 60} h`);
  return `${fmt(lo)} to ${fmt(hi)}`;
}

export function localDayStart(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function minutesOfDay(ts: number) {
  const d = new Date(ts);
  return d.getHours() * 60 + d.getMinutes();
}

export function sortedSessions(sessions: SleepSession[]) {
  return [...sessions].sort((a, b) => a.start - b.start);
}

export function openSession(sessions: SleepSession[]) {
  return sessions.find((s) => s.end === null) ?? null;
}

export type Prediction = {
  kind: SleepKind;
  opensAt: number;
  closesAt: number;
  awakeSince: number;
  basis: 'pattern' | 'age';
  samples: number;
  wakeMinutes: number;
  guide: AgeGuide;
};

export const DEFAULT_BEDTIME_MINUTES = 19 * 60 + 30;

export function typicalBedtime(sessions: SleepSession[], now: number) {
  const nights = sessions
    .filter((s) => s.kind === 'night' && s.start >= now - 14 * DAY)
    .map((s) => {
      const m = minutesOfDay(s.start);
      return m < 240 ? m + 1440 : m;
    });
  if (nights.length < 3) return { minutes: DEFAULT_BEDTIME_MINUTES, samples: nights.length };
  const m = Math.round(median(nights));
  return { minutes: m >= 1440 ? m - 1440 : m, samples: nights.length };
}

export function predictNext(sessions: SleepSession[], ageMonths: number, now: number): Prediction | null {
  const sorted = sortedSessions(sessions);
  if (sorted.length === 0 || openSession(sorted)) return null;
  const last = sorted[sorted.length - 1];
  if (last.end === null || now - last.end > DAY) return null;

  const guide = ageGuide(ageMonths);
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const next = sorted[i];
    if (prev.end === null || next.kind !== 'nap' || next.start < now - 7 * DAY) continue;
    const gap = (next.start - prev.end) / MIN;
    if (gap >= guide.minWake * 0.5 && gap <= guide.maxWake * 1.6) gaps.push(gap);
  }

  const usePattern = gaps.length >= 3;
  const wake = usePattern
    ? Math.min(guide.maxWake * 1.25, Math.max(guide.minWake * 0.8, median(gaps)))
    : (guide.minWake + guide.maxWake) / 2;
  const spread = wake < 90 ? 10 : 15;
  let opensAt = last.end + (wake - spread) * MIN;
  let closesAt = last.end + (wake + spread) * MIN;
  let kind: SleepKind = 'nap';
  let basis: Prediction['basis'] = usePattern ? 'pattern' : 'age';
  let samples = gaps.length;

  const bedtime = typicalBedtime(sorted, now);
  const mid = (opensAt + closesAt) / 2;
  const bedtimeAt = localDayStart(mid) + bedtime.minutes * MIN;
  if (mid >= bedtimeAt - 75 * MIN && ageMonths >= 3) {
    kind = 'night';
    opensAt = bedtimeAt - 30 * MIN;
    closesAt = bedtimeAt + 15 * MIN;
    basis = bedtime.samples >= 3 ? 'pattern' : 'age';
    samples = bedtime.samples;
  }
  if (closesAt <= last.end) return null;

  return { kind, opensAt, closesAt, awakeSince: last.end, basis, samples, wakeMinutes: Math.round(wake), guide };
}

export type DaySummary = {
  key: string;
  start: number;
  napMs: number;
  nightMs: number;
  naps: number;
  totalMs: number;
};

export function splitByDay(session: SleepSession, now: number): { day: number; from: number; to: number }[] {
  const end = Math.min(session.end ?? now, now);
  if (end <= session.start) return [];
  const parts: { day: number; from: number; to: number }[] = [];
  let cursor = session.start;
  while (cursor < end) {
    const day = localDayStart(cursor);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const to = Math.min(end, next.getTime());
    parts.push({ day, from: cursor, to });
    cursor = to;
  }
  return parts;
}

export function daySummaries(sessions: SleepSession[], days: number, now: number): DaySummary[] {
  const today = localDayStart(now);
  const out: DaySummary[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({ key: dayKey(d.getTime()), start: d.getTime(), napMs: 0, nightMs: 0, naps: 0, totalMs: 0 });
  }
  const byKey = new Map(out.map((d) => [d.key, d]));
  for (const session of sessions) {
    const startDay = byKey.get(dayKey(session.start));
    if (startDay && session.kind === 'nap') startDay.naps += 1;
    for (const part of splitByDay(session, now)) {
      const target = byKey.get(dayKey(part.day));
      if (!target) continue;
      const ms = part.to - part.from;
      if (session.kind === 'nap') target.napMs += ms;
      else target.nightMs += ms;
      target.totalMs += ms;
    }
  }
  return out;
}

export type WeekSummary = {
  label: string;
  avgTotalMs: number;
  avgNaps: number;
  daysLogged: number;
};

export function weekSummaries(sessions: SleepSession[], weeks: number, now: number): WeekSummary[] {
  const all = daySummaries(sessions, weeks * 7, now);
  const out: WeekSummary[] = [];
  for (let w = 0; w < weeks; w++) {
    const slice = all.slice(w * 7, w * 7 + 7);
    const logged = slice.filter((d) => d.totalMs > 0);
    const total = logged.reduce((sum, d) => sum + d.totalMs, 0);
    const naps = logged.reduce((sum, d) => sum + d.naps, 0);
    const first = new Date(slice[0].start);
    out.push({
      label: first.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      avgTotalMs: logged.length ? total / logged.length : 0,
      avgNaps: logged.length ? naps / logged.length : 0,
      daysLogged: logged.length,
    });
  }
  return out;
}

export type Segment = { kind: SleepKind; from: number; to: number; startFrac: number; widthFrac: number };

export function todaySegments(sessions: SleepSession[], now: number): Segment[] {
  const dayStart = localDayStart(now);
  const out: Segment[] = [];
  for (const session of sessions) {
    for (const part of splitByDay(session, now)) {
      if (part.day !== dayStart) continue;
      out.push({
        kind: session.kind,
        from: part.from,
        to: part.to,
        startFrac: (part.from - dayStart) / DAY,
        widthFrac: Math.max(0.004, (part.to - part.from) / DAY),
      });
    }
  }
  return out;
}

export function sessionDurationMs(session: SleepSession, now: number) {
  return Math.max(0, (session.end ?? now) - session.start);
}

export function formatDuration(ms: number) {
  return formatMinutes(Math.round(ms / MIN));
}

export function clock(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function lastWakeTime(sessions: SleepSession[]) {
  const done = sortedSessions(sessions).filter((s) => s.end !== null);
  return done.length ? (done[done.length - 1].end as number) : null;
}
