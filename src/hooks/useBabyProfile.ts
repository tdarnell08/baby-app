import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { buildPlan, dateKey } from '@/data/plan';
import { computeAge, fromKey, monthsBetween } from '@/lib/age';
import { defaultProfile, loadProfile, saveProfile } from '@/lib/profileStore';
import { MAX_AGE_MONTHS, type BabyProfile } from '@/lib/profileTypes';
import { usePremium } from '@/providers/PremiumProvider';

export { MAX_AGE_MONTHS };
export type { BabyProfile };

export function parseBirthDate(year: number, month: number, day: number, now: Date): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (date.getTime() > now.getTime()) return null;
  return dateKey(date);
}


export function useBabyProfile() {
  const [profile, setProfile] = useState<BabyProfile>(defaultProfile);
  const { isPremium } = usePremium();
  const [now, setNow] = useState(() => new Date());
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadProfile().then((loaded) => {
        if (!active) return;
        setProfile(loaded);
        setNow(new Date());
        setReady(true);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const update = useCallback((patch: Partial<BabyProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      saveProfile(next);
      return next;
    });
  }, []);

  const setAge = useCallback(
    (months: number) => {
      const clamped = Math.max(0, Math.min(MAX_AGE_MONTHS, months));
      update({ ageMonths: clamped, ageSetAt: Date.now(), birthDate: null, configured: true });
    },
    [update],
  );

  const setBirthDate = useCallback(
    (key: string | null) => {
      if (key === null) {
        update({ birthDate: null });
        return;
      }
      const months = Math.min(MAX_AGE_MONTHS, monthsBetween(fromKey(key), new Date()));
      update({ birthDate: key, ageMonths: months, ageSetAt: Date.now(), configured: true });
    },
    [update],
  );

  const toggleMilestone = useCallback((id: string) => {
    setProfile((prev) => {
      const achieved = { ...prev.achieved };
      if (achieved[id]) delete achieved[id];
      else achieved[id] = dateKey(new Date());
      const next = { ...prev, achieved };
      saveProfile(next);
      return next;
    });
  }, []);

  const today = dateKey(now);
  const tired = profile.tiredDate === today;

  const setTired = useCallback(
    (value: boolean) => update({ tiredDate: value ? dateKey(new Date()) : null }),
    [update],
  );

  const { ageMonths, ageLabel } = useMemo(
    () => computeAge({ birthDate: profile.birthDate, ageMonths: profile.ageMonths, ageSetAt: profile.ageSetAt }, now),
    [now, profile.birthDate, profile.ageMonths, profile.ageSetAt],
  );

  const achievedIds = useMemo(() => Object.keys(profile.achieved), [profile.achieved]);

  const plan = useMemo(
    () =>
      buildPlan(
        {
          name: profile.name,
          ageMonths,
          interests: isPremium ? profile.interests : [],
          time: isPremium ? profile.time : 'standard',
          achieved: achievedIds,
        },
        today,
        tired,
      ),
    [profile.name, ageMonths, profile.interests, profile.time, isPremium, achievedIds, today, tired],
  );

  return {
    profile,
    isPremium,
    ageMonths,
    ageLabel,
    plan,
    tired,
    today,
    ready,
    update,
    setAge,
    setBirthDate,
    setTired,
    toggleMilestone,
  };
}
