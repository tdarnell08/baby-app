import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultKidPrefs, type KidPrefs } from '@/lib/kidLogic';
import { loadKidPrefs, saveKidPrefs } from '@/lib/kidStore';

export function useKidPrefs() {
  const [prefs, setPrefs] = useState<KidPrefs>(defaultKidPrefs);
  const [ready, setReady] = useState(false);
  const latest = useRef<KidPrefs>(prefs);

  useEffect(() => {
    let active = true;
    loadKidPrefs().then((loaded) => {
      if (!active) return;
      latest.current = loaded;
      setPrefs(loaded);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((patch: Partial<KidPrefs>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setPrefs(next);
    saveKidPrefs(next).catch(() => {});
  }, []);

  return { prefs, ready, update };
}
