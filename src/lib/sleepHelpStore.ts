import { emptySleepHelp, sanitizeSleepHelp, type SleepHelpData } from '@/lib/sleepHelpLogic';
import { secureDelete, secureGet, secureSet } from '@/lib/secureStorage';
import { nowMs } from '@/lib/time';

export const SLEEP_HELP_KEY = 'lulla.sleepHelp.v1';

export async function loadSleepHelp(): Promise<SleepHelpData> {
  try {
    const raw = await secureGet(SLEEP_HELP_KEY);
    return raw ? sanitizeSleepHelp(JSON.parse(raw), nowMs()) : emptySleepHelp(nowMs());
  } catch {
    return emptySleepHelp(nowMs());
  }
}

export async function saveSleepHelp(data: SleepHelpData): Promise<void> {
  await secureSet(SLEEP_HELP_KEY, JSON.stringify(data));
}

export async function wipeSleepHelp(): Promise<void> {
  await secureDelete(SLEEP_HELP_KEY);
}
