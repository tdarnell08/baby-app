import { defaultKidPrefs, sanitizeKidPrefs, type KidPrefs } from '@/lib/kidLogic';
import { secureDelete, secureGet, secureSet } from '@/lib/secureStorage';

export const KID_KEY = 'lulla.kid.v1';

export async function loadKidPrefs(): Promise<KidPrefs> {
  try {
    const raw = await secureGet(KID_KEY);
    return raw ? sanitizeKidPrefs(JSON.parse(raw)) : defaultKidPrefs();
  } catch {
    return defaultKidPrefs();
  }
}

export async function saveKidPrefs(prefs: KidPrefs): Promise<void> {
  await secureSet(KID_KEY, JSON.stringify(prefs));
}

export async function wipeKidPrefs(): Promise<void> {
  await secureDelete(KID_KEY);
}
