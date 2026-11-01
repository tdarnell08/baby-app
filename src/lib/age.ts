import { formatAge } from '@/data/plan';
import { MAX_AGE_MONTHS, type BabyProfile } from '@/lib/profileTypes';

const MONTH_MS = 30.44 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function fromKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function monthsBetween(birth: Date, now: Date) {
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

export function computeAge(
  profile: Pick<BabyProfile, 'birthDate' | 'ageMonths' | 'ageSetAt'>,
  now: Date,
): { ageMonths: number; ageLabel: string } {
  if (profile.birthDate) {
    const birth = fromKey(profile.birthDate);
    const months = Math.min(MAX_AGE_MONTHS, monthsBetween(birth, now));
    const days = Math.max(0, Math.floor((now.getTime() - birth.getTime()) / DAY_MS));
    if (months < 3) {
      const weeks = Math.floor(days / 7);
      const label = days < 14 ? `${days} day${days === 1 ? '' : 's'}` : `${weeks} weeks`;
      return { ageMonths: months, ageLabel: label };
    }
    return { ageMonths: months, ageLabel: formatAge(months) };
  }
  const grown = Math.floor((now.getTime() - profile.ageSetAt) / MONTH_MS);
  const months = Math.max(0, Math.min(MAX_AGE_MONTHS, profile.ageMonths + Math.max(0, grown)));
  return { ageMonths: months, ageLabel: formatAge(months) };
}
