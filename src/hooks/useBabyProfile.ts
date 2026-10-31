import { useCallback, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { formatAge, buildPlan, dateKey, type InterestId, type TimeTierId } from '@/data/plan';

const STORAGE_KEY = 'lulla.babyProfile.v1';
const MONTH_MS = 30.44 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_AGE_MONTHS = 30;

export type BabyProfile = {
  name: string;
  ageMonths: number;
  ageSetAt: number;
  birthDate: string | null;
  interests: InterestId[];
  time: TimeTierId;
  configured: boolean;
  tiredDate: string | null;
  achieved: Record<string, string>;
  weightKg: number | null;
  weightDate: string | null;
  weightUnit: 'lb' | 'kg';
};

const defaults = (): BabyProfile => ({
  name: '',
  ageMonths: 6,
  ageSetAt: Date.now(),
  birthDate: null,
  interests: [],
  time: 'standard',
  configured: false,
  tiredDate: null,
  achieved: {},
  weightKg: null,
  weightDate: null,
  weightUnit: 'lb',
});

async function load(): Promise<BabyProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults();
    return { ...defaults(), ...(JSON.parse(raw) as Partial<BabyProfile>) };
  } catch {
    return defaults();
  }
}

export function parseBirthDate(year: number, month: number, day: number, now: Date): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (date.getTime() > now.getTime()) return null;
  return dateKey(date);
}

function fromKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function monthsBetween(birth: Date, now: Date) {
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

export function useBabyProfile() {
  const [profile, setProfile] = useState<BabyProfile>(defaults);
  const [now, setNow] = useState(() => new Date());
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      load().then((loaded) => {
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
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
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

  const setWeight = useCallback(
    (kg: number | null) => update({ weightKg: kg, weightDate: kg === null ? null : dateKey(new Date()) }),
    [update],
  );

  const toggleMilestone = useCallback((id: string) => {
    setProfile((prev) => {
      const achieved = { ...prev.achieved };
      if (achieved[id]) delete achieved[id];
      else achieved[id] = dateKey(new Date());
      const next = { ...prev, achieved };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const today = dateKey(now);
  const tired = profile.tiredDate === today;

  const setTired = useCallback(
    (value: boolean) => update({ tiredDate: value ? dateKey(new Date()) : null }),
    [update],
  );

  const { ageMonths, ageLabel } = useMemo(() => {
    if (profile.birthDate) {
      const birth = fromKey(profile.birthDate);
      const months = Math.min(MAX_AGE_MONTHS, monthsBetween(birth, now));
      const days = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / DAY_MS));
      if (months < 3) {
        const weeks = Math.floor(days / 7);
        const label = days < 14 ? `${days} day${days === 1 ? '' : 's'}` : `${weeks} weeks`;
        return { ageMonths: months, ageLabel: label };
      }
      return { ageMonths: months, ageLabel: formatAge(months) };
    }
    const grown = Math.floor((now.getTime() - profile.ageSetAt) / MONTH_MS);
    const months = Math.max(0, Math.min(MAX_AGE_MONTHS, profile.ageMonths + Math.max(0, grown)));
    return { ageMonths: months, ageLabel: formatAge(months) };
  }, [now, profile.birthDate, profile.ageMonths, profile.ageSetAt]);

  const achievedIds = useMemo(() => Object.keys(profile.achieved), [profile.achieved]);

  const plan = useMemo(
    () =>
      buildPlan(
        {
          name: profile.name,
          ageMonths,
          interests: profile.interests,
          time: profile.time,
          achieved: achievedIds,
        },
        today,
        tired,
      ),
    [profile.name, ageMonths, profile.interests, profile.time, achievedIds, today, tired],
  );

  return {
    profile,
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
    setWeight,
    toggleMilestone,
  };
}
