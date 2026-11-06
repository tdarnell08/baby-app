import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultPicksPrefs, type PicksPrefs } from '@/lib/picksLogic';
import { loadPicksPrefs, savePicksPrefs } from '@/lib/picksStore';

export function usePicksPrefs() {
  const [prefs, setPrefs] = useState<PicksPrefs>(defaultPicksPrefs);
  const [ready, setReady] = useState(false);
  const latest = useRef<PicksPrefs>(prefs);

  useEffect(() => {
    let active = true;
    loadPicksPrefs().then((loaded) => {
      if (!active) return;
      latest.current = loaded;
      setPrefs(loaded);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((patch: Partial<PicksPrefs>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setPrefs(next);
    savePicksPrefs(next).catch(() => {});
  }, []);

  return { prefs, ready, update };
}
