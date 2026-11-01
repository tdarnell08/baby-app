import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { clean, sanitizeIllness, type Episode, type IllnessData, type SymptomEntry, type TempUnit } from '@/lib/illnessLogic';
import { emptyIllness, loadIllness, saveIllness } from '@/lib/illnessStore';

export type NewEntry = Pick<SymptomEntry, 'kind' | 'tempC' | 'method' | 'count' | 'text'> & { at?: number };

export function useIllness() {
  const [data, setData] = useState<IllnessData>(emptyIllness);
  const [ready, setReady] = useState(false);
  const latest = useRef<IllnessData>(emptyIllness());

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadIllness().then((loaded) => {
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

  const commit = useCallback((next: IllnessData) => {
    const clear = sanitizeIllness(next, Date.now());
    latest.current = clear;
    setData(clear);
    saveIllness(clear).catch(() => {});
    return clear;
  }, []);

  const startEpisode = useCallback(
    (title: string) => {
      const now = Date.now();
      const episode: Episode = { id: `${now}-e`, title: clean(title, 40) || 'Sick day', startedAt: now, endedAt: null, entries: [] };
      commit({ ...latest.current, episodes: [episode, ...latest.current.episodes] });
      return episode.id;
    },
    [commit],
  );

  const updateEpisode = useCallback(
    (id: string, change: (e: Episode) => Episode) => {
      const cur = latest.current;
      commit({ ...cur, episodes: cur.episodes.map((e) => (e.id === id ? change(e) : e)) });
    },
    [commit],
  );

  const addEntry = useCallback(
    (episodeId: string, entry: NewEntry) => {
      const at = entry.at ?? Date.now();
      const full: SymptomEntry = {
        id: `${at}-${Math.random().toString(36).slice(2, 7)}`,
        at,
        kind: entry.kind,
        tempC: entry.tempC,
        method: entry.method,
        count: entry.count,
        text: clean(entry.text, 200),
      };
      updateEpisode(episodeId, (e) => ({ ...e, startedAt: Math.min(e.startedAt, at), entries: [full, ...e.entries] }));
    },
    [updateEpisode],
  );

  const removeEntry = useCallback(
    (episodeId: string, entryId: string) => updateEpisode(episodeId, (e) => ({ ...e, entries: e.entries.filter((x) => x.id !== entryId) })),
    [updateEpisode],
  );

  const endEpisode = useCallback((id: string) => updateEpisode(id, (e) => ({ ...e, endedAt: Date.now() })), [updateEpisode]);
  const reopenEpisode = useCallback((id: string) => updateEpisode(id, (e) => ({ ...e, endedAt: null })), [updateEpisode]);
  const renameEpisode = useCallback((id: string, title: string) => updateEpisode(id, (e) => ({ ...e, title: clean(title, 40) || e.title })), [updateEpisode]);

  const removeEpisode = useCallback(
    (id: string) => commit({ ...latest.current, episodes: latest.current.episodes.filter((e) => e.id !== id) }),
    [commit],
  );

  const setUnit = useCallback((unit: TempUnit) => commit({ ...latest.current, unit }), [commit]);

  return {
    episodes: data.episodes,
    unit: data.unit,
    current: data.episodes.find((e) => e.endedAt === null) ?? null,
    ready,
    startEpisode,
    addEntry,
    removeEntry,
    endEpisode,
    reopenEpisode,
    renameEpisode,
    removeEpisode,
    setUnit,
  };
}
