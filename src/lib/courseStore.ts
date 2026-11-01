import {
  DAY,
  MAX_DAYS,
  MAX_TIMES,
  sanitizeText,
  type Course,
  type CourseNote,
  type DoseLog,
  type Schedule,
} from '@/lib/courseLogic';
import { secureDelete, secureGet, secureSet } from '@/lib/secureStorage';

export const COURSES_KEY = 'lulla.courses.v1';
const MAX_COURSES = 12;
const KEEP_FINISHED_MS = 150 * DAY;

export type CourseData = { courses: Course[]; caregivers: string[] };

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function sanitizeSchedule(raw: unknown): Schedule | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (r.kind === 'interval' && isNum(r.hours) && Number.isInteger(r.hours) && r.hours >= 1 && r.hours <= 24) {
    return { kind: 'interval', hours: r.hours };
  }
  if (r.kind === 'times' && Array.isArray(r.times)) {
    const times = Array.from(
      new Set(r.times.filter((t): t is number => isNum(t) && Number.isInteger(t) && t >= 0 && t < 1440)),
    )
      .sort((a, b) => a - b)
      .slice(0, MAX_TIMES);
    return times.length ? { kind: 'times', times } : null;
  }
  return null;
}

function sanitizeCourse(raw: unknown, now: number): Course | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const schedule = sanitizeSchedule(r.schedule);
  const medName = sanitizeText(r.medName, 60);
  const doseText = sanitizeText(r.doseText, 80);
  if (!schedule || !medName || !doseText) return null;
  if (typeof r.id !== 'string' || r.id.length > 60) return null;
  if (!isNum(r.startAt) || r.startAt < now - 400 * DAY || r.startAt > now + 60 * DAY) return null;
  if (!isNum(r.days) || !Number.isInteger(r.days) || r.days < 1 || r.days > MAX_DAYS) return null;

  const log: DoseLog[] = [];
  if (Array.isArray(r.log)) {
    for (const item of r.log.slice(0, 250)) {
      if (typeof item !== 'object' || item === null) continue;
      const e = item as Record<string, unknown>;
      if (typeof e.id !== 'string' || e.id.length > 60 || !isNum(e.at) || e.at > now + 60_000) continue;
      const slot = e.slot === null ? null : isNum(e.slot) && Number.isInteger(e.slot) && e.slot >= 0 && e.slot < 400 ? e.slot : null;
      log.push({
        id: e.id,
        slot,
        at: e.at,
        by: sanitizeText(e.by, 20),
        early: e.early === true,
        vomited: e.vomited === true,
      });
    }
  }
  const skipped = Array.isArray(r.skipped)
    ? Array.from(new Set(r.skipped.filter((s): s is number => isNum(s) && Number.isInteger(s) && s >= 0 && s < 400))).slice(0, 250)
    : [];
  const notes: CourseNote[] = [];
  if (Array.isArray(r.notes)) {
    for (const item of r.notes.slice(0, 60)) {
      if (typeof item !== 'object' || item === null) continue;
      const n = item as Record<string, unknown>;
      const text = sanitizeText(n.text, 240);
      if (typeof n.id === 'string' && n.id.length <= 60 && isNum(n.at) && text) notes.push({ id: n.id, at: n.at, text });
    }
  }
  return {
    id: r.id,
    medName,
    doseText,
    schedule,
    startAt: r.startAt,
    days: r.days,
    remind: r.remind === true,
    createdAt: isNum(r.createdAt) ? r.createdAt : now,
    log,
    skipped,
    notes,
    stoppedAt: isNum(r.stoppedAt) ? r.stoppedAt : null,
  };
}

export function sanitizeCourseData(raw: unknown, now = Date.now()): CourseData {
  if (typeof raw !== 'object' || raw === null) return { courses: [], caregivers: [] };
  const r = raw as Record<string, unknown>;
  const courses = (Array.isArray(r.courses) ? r.courses : [])
    .slice(0, MAX_COURSES * 2)
    .map((c) => sanitizeCourse(c, now))
    .filter((c): c is Course => c !== null)
    .filter((c) => c.startAt + (c.days + 1) * DAY > now - KEEP_FINISHED_MS)
    .sort((a, b) => b.startAt - a.startAt)
    .slice(0, MAX_COURSES);
  const caregivers = Array.from(
    new Set((Array.isArray(r.caregivers) ? r.caregivers : []).map((c) => sanitizeText(c, 20)).filter(Boolean)),
  ).slice(0, 8);
  return { courses, caregivers };
}

export async function loadCourses(): Promise<CourseData> {
  try {
    const raw = await secureGet(COURSES_KEY);
    return raw ? sanitizeCourseData(JSON.parse(raw)) : { courses: [], caregivers: [] };
  } catch {
    return { courses: [], caregivers: [] };
  }
}

export async function saveCourses(data: CourseData): Promise<void> {
  await secureSet(COURSES_KEY, JSON.stringify(data));
}

export async function wipeCourses(): Promise<void> {
  await secureDelete(COURSES_KEY);
}
