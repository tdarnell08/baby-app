import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { deleteMedia } from '@/lib/media';
import { loadMemories, sanitizeMemories, saveMemories, type Memory } from '@/lib/memoryStore';

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [ready, setReady] = useState(false);
  const latest = useRef<Memory[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadMemories().then((loaded) => {
        if (!active) return;
        latest.current = loaded;
        setMemories(loaded);
        setReady(true);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const commit = useCallback((next: Memory[]) => {
    const clean = sanitizeMemories(next);
    latest.current = clean;
    setMemories(clean);
    saveMemories(clean).catch(() => {});
  }, []);

  const add = useCallback(
    (memory: Omit<Memory, 'id' | 'createdAt'>) => {
      const now = Date.now();
      commit([{ ...memory, id: `${now}-m`, createdAt: now }, ...latest.current]);
    },
    [commit],
  );

  const remove = useCallback(
    (id: string) => {
      const target = latest.current.find((m) => m.id === id);
      if (target) {
        target.photos.forEach(deleteMedia);
        deleteMedia(target.voice);
      }
      commit(latest.current.filter((m) => m.id !== id));
    },
    [commit],
  );

  return { memories, ready, add, remove };
}
