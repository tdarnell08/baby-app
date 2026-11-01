import { sanitizeIllness, type IllnessData } from '@/lib/illnessLogic';
import { secureDelete, secureGet, secureSet } from '@/lib/secureStorage';

export const ILLNESS_KEY = 'lulla.illness.v1';

export const emptyIllness = (): IllnessData => ({ episodes: [], unit: 'F' });

export async function loadIllness(): Promise<IllnessData> {
  try {
    const raw = await secureGet(ILLNESS_KEY);
    return raw ? sanitizeIllness(JSON.parse(raw), Date.now()) : emptyIllness();
  } catch {
    return emptyIllness();
  }
}

export async function saveIllness(data: IllnessData): Promise<void> {
  await secureSet(ILLNESS_KEY, JSON.stringify(data));
}

export async function wipeIllness(): Promise<void> {
  await secureDelete(ILLNESS_KEY);
}
