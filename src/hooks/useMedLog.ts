import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import type { MedId } from '@/data/medications';

const STORAGE_KEY = 'lulla.medLog.v1';
const KEEP_MS = 7 * 24 * 60 * 60 * 1000;

export type DoseEntry = { id: string; med: MedId; at: number; ml: number };

async function load(): Promise<DoseEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DoseEntry[];
    const cutoff = Date.now() - KEEP_MS;
    return parsed.filter((e) => e.at >= cutoff);
  } catch {
    return [];
  }
}

export function useMedLog() {
  const [entries, setEntries] = useState<DoseEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      load().then((loaded) => {
        if (active) setEntries(loaded);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const persist = (next: DoseEntry[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    return next;
  };

  const add = useCallback((med: MedId, ml: number) => {
    setEntries((prev) =>
      persist([{ id: `${Date.now()}-${med}`, med, ml, at: Date.now() }, ...prev].slice(0, 60)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => persist(prev.filter((e) => e.id !== id)));
  }, []);

  const clear = useCallback(() => setEntries(persist([])), []);

  return { entries, add, remove, clear };
}
