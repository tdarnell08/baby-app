import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { syncReminders } from '@/lib/reminders';
import { openSession, type SleepKind, type SleepSession } from '@/lib/sleepCoach';
import {
  defaultSleepPrefs,
  loadSleep,
  loadSleepPrefs,
  sanitizeSessions,
  saveSleep,
  saveSleepPrefs,
  type SleepPrefs,
} from '@/lib/sleepStore';

const MIN = 60 * 1000;

export function useSleepLog() {
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [prefs, setPrefsState] = useState<SleepPrefs>(defaultSleepPrefs);
  const [ready, setReady] = useState(false);
  const latest = useRef<SleepSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([loadSleep(), loadSleepPrefs()]).then(([loaded, loadedPrefs]) => {
        if (!active) return;
        latest.current = loaded;
        setSessions(loaded);
        setPrefsState(loadedPrefs);
        setReady(true);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const commit = useCallback((next: SleepSession[]) => {
    const clean = sanitizeSessions(next);
    latest.current = clean;
    setSessions(clean);
    saveSleep(clean)
      .catch(() => {})
      .then(() => syncReminders());
  }, []);

  const start = useCallback(
    (kind: SleepKind, minutesAgo = 0) => {
      const current = latest.current;
      if (openSession(current)) return;
      const startedAt = Math.min(Date.now(), Date.now() - minutesAgo * MIN);
      commit([{ id: `${startedAt}-${kind}`, kind, start: startedAt, end: null }, ...current]);
    },
    [commit],
  );

  const stop = useCallback(
    (minutesAgo = 0) => {
      const current = latest.current;
      const open = openSession(current);
      if (!open) return;
      const endedAt = Math.max(open.start, Date.now() - minutesAgo * MIN);
      commit(current.map((s) => (s.id === open.id ? { ...s, end: endedAt } : s)));
    },
    [commit],
  );

  const remove = useCallback(
    (id: string) => commit(latest.current.filter((s) => s.id !== id)),
    [commit],
  );

  const setPrefs = useCallback((patch: Partial<SleepPrefs>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...patch };
      saveSleepPrefs(next)
        .catch(() => {})
        .then(() => syncReminders());
      return next;
    });
  }, []);

  return { sessions, prefs, ready, start, stop, remove, setPrefs };
}
