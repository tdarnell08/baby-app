import { interestOptions, timeTiers, type InterestId, type TimeTierId } from '@/data/plan';
import { MAX_AGE_MONTHS, type BabyProfile } from '@/lib/profileTypes';
import { migrateFromAsyncStorage, secureDelete, secureSet } from '@/lib/secureStorage';

export const PROFILE_KEY = 'lulla.profile.v2';
const LEGACY_PROFILE_KEY = 'lulla.babyProfile.v1';

export const defaultProfile = (): BabyProfile => ({
  name: '',
  ageMonths: 6,
  ageSetAt: Date.now(),
  birthDate: null,
  interests: [],
  time: 'standard',
  configured: false,
  tiredDate: null,
  achieved: {},
});

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const interestIds = interestOptions.map((i) => i.id);
const timeIds = timeTiers.map((t) => t.id);

function str(value: unknown, max: number, fallback = ''): string {
  return typeof value === 'string' ? value.slice(0, max) : fallback;
}

function num(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function date(value: unknown): string | null {
  return typeof value === 'string' && DATE_RE.test(value) ? value : null;
}

export function sanitizeProfile(raw: unknown): BabyProfile {
  const base = defaultProfile();
  if (typeof raw !== 'object' || raw === null) return base;
  const r = raw as Record<string, unknown>;

  const achieved: Record<string, string> = {};
  if (typeof r.achieved === 'object' && r.achieved !== null) {
    for (const [id, when] of Object.entries(r.achieved as Record<string, unknown>).slice(0, 300)) {
      const d = date(when);
      if (d && id.length <= 80) achieved[id] = d;
    }
  }

  const interests = Array.isArray(r.interests)
    ? (r.interests.filter((i): i is InterestId => typeof i === 'string' && interestIds.includes(i as InterestId)) as InterestId[])
    : [];

  return {
    name: str(r.name, 24),
    ageMonths: Math.round(num(r.ageMonths, 0, MAX_AGE_MONTHS) ?? base.ageMonths),
    ageSetAt: num(r.ageSetAt, 0, Number.MAX_SAFE_INTEGER) ?? base.ageSetAt,
    birthDate: date(r.birthDate),
    interests: Array.from(new Set(interests)),
    time: timeIds.includes(r.time as TimeTierId) ? (r.time as TimeTierId) : 'standard',
    configured: r.configured === true,
    tiredDate: date(r.tiredDate),
    achieved,
  };
}

let cache: Promise<BabyProfile> | null = null;

export function loadProfile(): Promise<BabyProfile> {
  if (!cache) {
    cache = migrateFromAsyncStorage(LEGACY_PROFILE_KEY, PROFILE_KEY)
      .then((raw) => {
        if (!raw) return defaultProfile();
        try {
          const parsed = JSON.parse(raw) as Record<string, unknown>;
          const clean = sanitizeProfile(parsed);
          // Weight was only used by the removed dose calculator, so it is dropped from storage.
          if (parsed && 'weightKg' in parsed) secureSet(PROFILE_KEY, JSON.stringify(clean)).catch(() => {});
          return clean;
        } catch {
          return defaultProfile();
        }
      })
      .catch(() => defaultProfile());
  }
  return cache;
}

export function saveProfile(profile: BabyProfile): void {
  cache = Promise.resolve(profile);
  secureSet(PROFILE_KEY, JSON.stringify(profile)).catch(() => {});
}

export async function wipeProfile(): Promise<void> {
  cache = Promise.resolve(defaultProfile());
  await secureDelete(PROFILE_KEY);
}

