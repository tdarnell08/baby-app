import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { sanitizeText, type Course, type DoseLog, slotForLog } from '@/lib/courseLogic';
import { loadCourses, sanitizeCourseData, saveCourses, type CourseData } from '@/lib/courseStore';
import { syncReminders } from '@/lib/reminders';

const empty: CourseData = { courses: [], caregivers: [] };

export type NewCourse = Pick<Course, 'medName' | 'doseText' | 'schedule' | 'startAt' | 'days' | 'remind'>;

export function useCourses() {
  const [data, setData] = useState<CourseData>(empty);
  const [ready, setReady] = useState(false);
  const latest = useRef<CourseData>(empty);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadCourses().then((loaded) => {
        if (!active) return;
        latest.current = loaded;
        setData(loaded);
        setReady(true);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const commit = useCallback((next: CourseData) => {
    const clean = sanitizeCourseData(next);
    latest.current = clean;
    setData(clean);
    saveCourses(clean)
      .catch(() => {})
      .then(() => syncReminders());
    return clean;
  }, []);

  const update = useCallback(
    (id: string, change: (course: Course) => Course) => {
      const current = latest.current;
      commit({ ...current, courses: current.courses.map((c) => (c.id === id ? change(c) : c)) });
    },
    [commit],
  );

  const add = useCallback(
    (input: NewCourse) => {
      const now = Date.now();
      const course: Course = {
        ...input,
        id: `${now}-c`,
        createdAt: now,
        log: [],
        skipped: [],
        notes: [],
        stoppedAt: null,
      };
      commit({ ...latest.current, courses: [course, ...latest.current.courses] });
      return course.id;
    },
    [commit],
  );

  const remove = useCallback(
    (id: string) => commit({ ...latest.current, courses: latest.current.courses.filter((c) => c.id !== id) }),
    [commit],
  );

  const logDose = useCallback(
    (id: string, by: string, vomited: boolean) => {
      const now = Date.now();
      const who = sanitizeText(by, 20);
      const course = latest.current.courses.find((c) => c.id === id);
      if (!course) return;
      const { slot, early } = slotForLog(course, now);
      const entry: DoseLog = { id: `${now}-d`, slot, at: now, by: who, early, vomited };
      const caregivers = who
        ? [who, ...latest.current.caregivers.filter((c) => c !== who)].slice(0, 8)
        : latest.current.caregivers;
      commit({
        caregivers,
        courses: latest.current.courses.map((c) => (c.id === id ? { ...c, log: [entry, ...c.log] } : c)),
      });
    },
    [commit],
  );

  const logLate = useCallback(
    (id: string, slot: number, by: string) => {
      const now = Date.now();
      const who = sanitizeText(by, 20);
      update(id, (c) => ({
        ...c,
        log: [{ id: `${now}-d`, slot, at: now, by: who, early: false, vomited: false }, ...c.log],
      }));
    },
    [update],
  );

  const skipSlot = useCallback(
    (id: string, slot: number) => update(id, (c) => ({ ...c, skipped: [...c.skipped, slot] })),
    [update],
  );

  const removeDose = useCallback(
    (id: string, doseId: string) => update(id, (c) => ({ ...c, log: c.log.filter((l) => l.id !== doseId) })),
    [update],
  );

  const markVomited = useCallback(
    (id: string, doseId: string) =>
      update(id, (c) => ({ ...c, log: c.log.map((l) => (l.id === doseId ? { ...l, vomited: true } : l)) })),
    [update],
  );

  const addNote = useCallback(
    (id: string, text: string) => {
      const clean = sanitizeText(text, 240);
      if (!clean) return;
      const now = Date.now();
      update(id, (c) => ({ ...c, notes: [{ id: `${now}-n`, at: now, text: clean }, ...c.notes] }));
    },
    [update],
  );

  const removeNote = useCallback(
    (id: string, noteId: string) => update(id, (c) => ({ ...c, notes: c.notes.filter((n) => n.id !== noteId) })),
    [update],
  );

  const setRemind = useCallback((id: string, remind: boolean) => update(id, (c) => ({ ...c, remind })), [update]);

  const stopCourse = useCallback(
    (id: string) => update(id, (c) => ({ ...c, stoppedAt: Date.now() })),
    [update],
  );

  return {
    courses: data.courses,
    caregivers: data.caregivers,
    ready,
    add,
    remove,
    logDose,
    logLate,
    skipSlot,
    removeDose,
    markVomited,
    addNote,
    removeNote,
    setRemind,
    stopCourse,
  };
}
