import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { MedId } from '@/data/medications';
import { migrateFromAsyncStorage, secureDelete, secureSet } from '@/lib/secureStorage';

export const MED_LOG_KEY = 'lulla.medlog.v2';
const LEGACY_KEY = 'lulla.medLog.v1';
const KEEP_MS = 7 * 24 * 60 * 60 * 1000;

export type DoseEntry = { id: string; med: MedId; at: number; ml: number };

function sanitize(raw: unknown): DoseEntry[] {
  if (!Array.isArray(raw)) return [];
  const cutoff = Date.now() - KEEP_MS;
  const out: DoseEntry[] = [];
  for (const item of raw.slice(0, 120)) {
    if (typeof item !== 'object' || item === null) continue;
    const e = item as Record<string, unknown>;
    const med = e.med === 'acetaminophen' || e.med === 'ibuprofen' ? e.med : null;
    if (
      med &&
      typeof e.id === 'string' &&
      e.id.length <= 60 &&
      typeof e.at === 'number' &&
      Number.isFinite(e.at) &&
      e.at >= cutoff &&
      e.at <= Date.now() + 60_000 &&
      typeof e.ml === 'number' &&
      e.ml > 0 &&
      e.ml <= 25
    ) {
      out.push({ id: e.id, med, at: e.at, ml: e.ml });
    }
  }
  return out;
}

export async function loadMedLog(): Promise<DoseEntry[]> {
  try {
    const raw = await migrateFromAsyncStorage(LEGACY_KEY, MED_LOG_KEY);
    return raw ? sanitize(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export async function wipeMedLog(): Promise<void> {
  await secureDelete(MED_LOG_KEY);
}

export function useMedLog() {
  const [entries, setEntries] = useState<DoseEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadMedLog().then((loaded) => {
        if (active) setEntries(loaded);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const persist = (next: DoseEntry[]) => {
    secureSet(MED_LOG_KEY, JSON.stringify(next)).catch(() => {});
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
