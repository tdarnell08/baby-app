export type Schedule =
  | { kind: 'interval'; hours: number }
  | { kind: 'times'; times: number[] };

export type DoseLog = {
  id: string;
  slot: number | null;
  at: number;
  by: string;
  early: boolean;
  vomited: boolean;
};

export type CourseNote = { id: string; at: number; text: string };

export type MedMode = 'course' | 'asNeeded';

export type Course = {
  id: string;
  mode: MedMode;
  maxPer24: number | null;
  medName: string;
  doseText: string;
  schedule: Schedule;
  startAt: number;
  days: number;
  remind: boolean;
  createdAt: number;
  log: DoseLog[];
  skipped: number[];
  notes: CourseNote[];
  stoppedAt: number | null;
};

export const MIN = 60 * 1000;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;
export const MAX_DAYS = 30;
export const MAX_TIMES = 6;

export function timesPerDay(schedule: Schedule) {
  return schedule.kind === 'times' ? schedule.times.length : Math.max(1, Math.ceil(24 / schedule.hours));
}

export function totalDoses(course: Pick<Course, 'schedule' | 'days'> & { mode?: MedMode }) {
  if (course.mode === 'asNeeded') return 0;
  const { schedule, days } = course;
  if (schedule.kind === 'times') return schedule.times.length * days;
  return Math.max(1, Math.ceil((days * 24) / schedule.hours));
}

export function slotTimes(course: Pick<Course, 'schedule' | 'days' | 'startAt'> & { mode?: MedMode }): number[] {
  const total = totalDoses(course);
  if (total === 0) return [];
  const { schedule, startAt } = course;
  if (schedule.kind === 'interval') {
    return Array.from({ length: total }, (_, i) => startAt + i * schedule.hours * HOUR);
  }
  const out: number[] = [];
  const first = new Date(startAt);
  first.setHours(0, 0, 0, 0);
  for (let day = 0; out.length < total && day < MAX_DAYS + 2; day++) {
    for (const minutes of schedule.times) {
      const d = new Date(first);
      d.setDate(d.getDate() + day);
      d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
      if (d.getTime() >= startAt - MIN && out.length < total) out.push(d.getTime());
    }
  }
  return out;
}

export function minGapMs(schedule: Schedule) {
  if (schedule.kind === 'interval') return schedule.hours * HOUR;
  const t = schedule.times;
  if (t.length <= 1) return DAY;
  let gap = (t[0] + 1440 - t[t.length - 1]) * MIN;
  for (let i = 1; i < t.length; i++) gap = Math.min(gap, (t[i] - t[i - 1]) * MIN);
  return gap;
}

export function graceMs(schedule: Schedule) {
  return Math.min(2 * HOUR, Math.max(30 * MIN, minGapMs(schedule) * 0.25));
}

export function doneSlots(course: Course) {
  const done = new Set<number>(course.skipped);
  for (const entry of course.log) if (entry.slot !== null) done.add(entry.slot);
  return done;
}

export type CourseState = {
  slots: number[];
  total: number;
  given: number;
  skipped: number;
  extra: number;
  nextSlot: number | null;
  nextAt: number | null;
  missed: number[];
  due: boolean;
  finished: boolean;
  stopped: boolean;
  dayNumber: number;
  endsAt: number;
  hoursLeft: number;
  daysLeft: number;
  lastGivenAt: number | null;
  nextAllowedAt: number | null;
  allowedNow: boolean;
  count24: number;
};

export function courseState(course: Course, now: number): CourseState {
  const slots = slotTimes(course);
  const done = doneSlots(course);
  const grace = graceMs(course.schedule);
  const total = slots.length;
  const givenLogs = course.log.filter((l) => l.slot !== null);
  const missed: number[] = [];
  let nextSlot: number | null = null;
  for (let i = 0; i < slots.length; i++) {
    if (done.has(i)) continue;
    if (slots[i] + grace < now) missed.push(i);
    else if (nextSlot === null) nextSlot = i;
  }
  const endsAt = slots.length ? slots[slots.length - 1] : course.startAt + course.days * DAY;
  const stopped = course.stoppedAt !== null;
  const asNeededMode = course.mode === 'asNeeded';
  const finished = stopped || (!asNeededMode && ((done.size >= total && total > 0) || (nextSlot === null && now > endsAt + grace)));
  const nextAt = nextSlot === null ? null : slots[nextSlot];
  const lastGivenAt = course.log.length ? Math.max(...course.log.map((l) => l.at)) : null;
  const dayNumber = Math.max(1, Math.min(course.days, Math.floor((now - course.startAt) / DAY) + 1));
  const nextAllowedAt = lastGivenAt === null ? null : lastGivenAt + minGapMs(course.schedule);
  return {
    nextAllowedAt,
    allowedNow: nextAllowedAt === null || nextAllowedAt <= now,
    count24: course.log.filter((l) => l.at > now - DAY).length,
    slots,
    total,
    given: givenLogs.length,
    skipped: course.skipped.length,
    extra: course.log.length - givenLogs.length,
    nextSlot,
    nextAt,
    missed,
    due: nextAt !== null && nextAt <= now + 15 * MIN,
    finished,
    stopped,
    dayNumber,
    endsAt,
    hoursLeft: Math.max(0, (endsAt - now) / HOUR),
    daysLeft: Math.max(0, Math.ceil((endsAt - now) / DAY)),
    lastGivenAt,
  };
}

export function slotForLog(course: Course, now: number): { slot: number | null; early: boolean } {
  if (course.mode === 'asNeeded') return { slot: null, early: false };
  const slots = slotTimes(course);
  const done = doneSlots(course);
  const reach = minGapMs(course.schedule) * 0.75;
  let best: number | null = null;
  let bestDiff = Infinity;
  for (let i = 0; i < slots.length; i++) {
    if (done.has(i)) continue;
    const diff = Math.abs(slots[i] - now);
    if (diff < bestDiff) {
      best = i;
      bestDiff = diff;
    }
  }
  if (best === null || bestDiff > reach) return { slot: null, early: false };
  return { slot: best, early: slots[best] - now > graceMs(course.schedule) };
}

export type DoseWarning = { level: 'danger' | 'caution'; message: string };

function span(ms: number) {
  const mins = Math.round(ms / MIN);
  if (mins < 60) return `${mins} minutes`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hour${h === 1 ? '' : 's'}` : `${h} h ${m} min`;
}

export function asNeededLabel(course: Pick<Course, 'schedule' | 'maxPer24'>) {
  const hours = minGapMs(course.schedule) / HOUR;
  const base = `As needed, at least ${hours} hour${hours === 1 ? '' : 's'} apart`;
  return course.maxPer24 ? `${base}, no more than ${course.maxPer24} in 24 hours` : base;
}

export function scheduleLabel(schedule: Schedule) {
  if (schedule.kind === 'interval') return `Every ${schedule.hours} hour${schedule.hours === 1 ? '' : 's'}`;
  const times = schedule.times.map(clockLabel).join(', ');
  return `${schedule.times.length === 1 ? 'Once' : `${schedule.times.length} times`} a day at ${times}`;
}

export function clockLabel(minutes: number) {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${`${m}`.padStart(2, '0')} ${suffix}`;
}

export function doseWarnings(course: Course, now: number): DoseWarning[] {
  const warnings: DoseWarning[] = [];
  const state = courseState(course, now);
  const gap = minGapMs(course.schedule);
  if (course.mode === 'asNeeded') {
    if (state.lastGivenAt !== null && state.nextAllowedAt !== null && state.nextAllowedAt > now) {
      warnings.push({
        level: 'danger',
        message: `The last dose was logged ${span(now - state.lastGivenAt)} ago. You entered at least ${span(gap)} between doses from the label, so the next dose is allowed at ${new Date(state.nextAllowedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`,
      });
    }
    if (course.maxPer24 && state.count24 >= course.maxPer24) {
      warnings.push({
        level: 'danger',
        message: `${state.count24} dose${state.count24 === 1 ? ' is' : 's are'} already logged in the last 24 hours, and you entered a limit of ${course.maxPer24} from the label.`,
      });
    }
    return warnings;
  }
  if (state.lastGivenAt !== null) {
    const since = now - state.lastGivenAt;
    if (since < gap * 0.75) {
      warnings.push({
        level: 'danger',
        message: `The last dose was logged ${span(since)} ago. Your schedule says doses are at least ${span(gap)} apart. Giving doses too close together can be dangerous.`,
      });
    }
  }
  const perDay = timesPerDay(course.schedule);
  const recent = course.log.filter((l) => l.at > now - DAY).length;
  if (recent >= perDay) {
    warnings.push({
      level: 'danger',
      message: `${recent} dose${recent === 1 ? ' is' : 's are'} already logged in the last 24 hours, and your schedule has ${perDay} a day.`,
    });
  }
  if (state.finished && !state.stopped) {
    warnings.push({ level: 'caution', message: 'Every dose in this course is already logged.' });
  }
  return warnings;
}

export function sanitizeText(value: unknown, max: number) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max) : '';
}

function slotLabel(ts: number) {
  return new Date(ts).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function courseSummary(course: Course, now: number): string {
  const state = courseState(course, now);
  const lines: string[] = [];
  lines.push('Medicine course record (from Lulla)');
  lines.push(`Created ${new Date(now).toLocaleString()}`);
  lines.push('');
  lines.push(`Medicine: ${course.medName}`);
  lines.push(`Dose as written on the pharmacy label: ${course.doseText}`);
  if (course.mode === 'asNeeded') {
    lines.push(`Timing as entered by the parent from the label: ${asNeededLabel(course)}`);
    lines.push(`Added: ${slotLabel(course.startAt)}`);
    lines.push(`Doses logged as given: ${state.given + state.extra}`);
  } else {
    lines.push(`Schedule as entered by the parent: ${scheduleLabel(course.schedule)}`);
    lines.push(`Started: ${slotLabel(course.startAt)}`);
    lines.push(`Course length entered: ${course.days} day${course.days === 1 ? '' : 's'} (${state.total} scheduled doses)`);
    lines.push(`Doses logged as given: ${state.given} of ${state.total}`);
  }
  if (state.skipped) lines.push(`Doses marked skipped: ${state.skipped}`);
  if (state.stopped) lines.push(`Stopped on: ${slotLabel(course.stoppedAt as number)}`);
  lines.push('');
  lines.push('Dose log');
  if (course.log.length === 0) lines.push('  (none logged)');
  const sorted = [...course.log].sort((a, b) => a.at - b.at);
  for (const entry of sorted) {
    const flags = [entry.slot === null ? 'unscheduled' : null, entry.early ? 'given earlier than scheduled' : null, entry.vomited ? 'vomited after dose' : null]
      .filter(Boolean)
      .join('; ');
    lines.push(`  ${slotLabel(entry.at)}, given by ${entry.by || 'not noted'}${flags ? ` (${flags})` : ''}`);
  }
  lines.push('');
  if (course.mode !== 'asNeeded') {
    lines.push('Missed doses (no dose logged)');
    if (state.missed.length === 0) lines.push('  (none)');
    for (const i of state.missed) lines.push(`  Scheduled ${slotLabel(state.slots[i])}`);
    lines.push('');
  }
  lines.push('Side effects and notes');
  if (course.notes.length === 0) lines.push('  (none)');
  for (const note of [...course.notes].sort((a, b) => a.at - b.at)) lines.push(`  ${slotLabel(note.at)}: ${note.text}`);
  lines.push('');
  lines.push('This is a parent-kept record. Lulla does not calculate or recommend doses. Follow the pharmacy label and your pharmacist or pediatrician.');
  return lines.join('\n');
}
