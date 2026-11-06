import { defaultPicksPrefs, sanitizePicksPrefs, type PicksPrefs } from '@/lib/picksLogic';
import { secureDelete, secureGet, secureSet } from '@/lib/secureStorage';

export const PICKS_KEY = 'lulla.picks.v1';

export async function loadPicksPrefs(): Promise<PicksPrefs> {
  try {
    const raw = await secureGet(PICKS_KEY);
    return raw ? sanitizePicksPrefs(JSON.parse(raw)) : defaultPicksPrefs();
  } catch {
    return defaultPicksPrefs();
  }
}

export async function savePicksPrefs(prefs: PicksPrefs): Promise<void> {
  await secureSet(PICKS_KEY, JSON.stringify(prefs));
}

export async function wipePicksPrefs(): Promise<void> {
  await secureDelete(PICKS_KEY);
}
