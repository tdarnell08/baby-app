import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  addToPlan,
  emptySleepHelp,
  moveRoutineStep,
  removeFromPlan,
  sanitizeSleepHelp,
  setStepMinutes,
  toggleRoutineStep,
  togglePlanItem,
  type SleepHelpData,
  type WakeKind,
} from '@/lib/sleepHelpLogic';
import { loadSleepHelp, saveSleepHelp } from '@/lib/sleepHelpStore';
import { nowMs } from '@/lib/time';

export function useSleepHelp() {
  const [data, setData] = useState<SleepHelpData>(() => emptySleepHelp(nowMs()));
  const [ready, setReady] = useState(false);
  const latest = useRef<SleepHelpData>(data);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadSleepHelp().then((loaded) => {
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

  const commit = useCallback((next: SleepHelpData) => {
    const clear = sanitizeSleepHelp(next, nowMs());
    latest.current = clear;
    setData(clear);
    saveSleepHelp(clear).catch(() => {});
  }, []);

  const addPlan = useCallback((tipId: string) => commit({ ...latest.current, plan: addToPlan(latest.current.plan, tipId) }), [commit]);
  const togglePlan = useCallback((tipId: string) => commit({ ...latest.current, plan: togglePlanItem(latest.current.plan, tipId) }), [commit]);
  const removePlan = useCallback((tipId: string) => commit({ ...latest.current, plan: removeFromPlan(latest.current.plan, tipId) }), [commit]);
  const clearPlan = useCallback(() => commit({ ...latest.current, plan: [] }), [commit]);

  const toggleStep = useCallback((id: string) => commit({ ...latest.current, routine: toggleRoutineStep(latest.current.routine, id) }), [commit]);
  const moveStep = useCallback(
    (index: number, dir: -1 | 1) => commit({ ...latest.current, routine: moveRoutineStep(latest.current.routine, index, dir) }),
    [commit],
  );
  const stepMinutes = useCallback(
    (id: string, minutes: number) => commit({ ...latest.current, routine: setStepMinutes(latest.current.routine, id, minutes) }),
    [commit],
  );
  const clearRoutine = useCallback(() => commit({ ...latest.current, routine: [] }), [commit]);

  const logWake = useCallback(
    (kind: WakeKind, minutesAgo = 0) => {
      const at = nowMs() - minutesAgo * 60_000;
      const id = `${at}-${Math.random().toString(36).slice(2, 7)}`;
      commit({ ...latest.current, wakes: [{ id, at, kind }, ...latest.current.wakes] });
    },
    [commit],
  );
  const removeWake = useCallback(
    (id: string) => commit({ ...latest.current, wakes: latest.current.wakes.filter((w) => w.id !== id) }),
    [commit],
  );

  return {
    plan: data.plan,
    routine: data.routine,
    wakes: data.wakes,
    ready,
    addPlan,
    togglePlan,
    removePlan,
    clearPlan,
    toggleStep,
    moveStep,
    stepMinutes,
    clearRoutine,
    logWake,
    removeWake,
  };
}
