import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { loadCharts, sanitizeCharts, saveCharts, type DoseChart } from '@/lib/chartStore';
import { deleteMedia } from '@/lib/media';

export function useCharts() {
  const [charts, setCharts] = useState<DoseChart[]>([]);
  const [ready, setReady] = useState(false);
  const latest = useRef<DoseChart[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadCharts().then((loaded) => {
        if (!active) return;
        latest.current = loaded;
        setCharts(loaded);
        setReady(true);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const commit = useCallback((next: DoseChart[]) => {
    const clean = sanitizeCharts(next);
    latest.current = clean;
    setCharts(clean);
    saveCharts(clean).catch(() => {});
  }, []);

  const add = useCallback(
    (chart: Omit<DoseChart, 'id' | 'createdAt'>) => {
      const now = Date.now();
      commit([{ ...chart, id: `${now}-ch`, createdAt: now }, ...latest.current]);
    },
    [commit],
  );

  const remove = useCallback(
    (id: string) => {
      latest.current.find((c) => c.id === id)?.photos.forEach(deleteMedia);
      commit(latest.current.filter((c) => c.id !== id));
    },
    [commit],
  );

  return { charts, ready, add, remove };
}
