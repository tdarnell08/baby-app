import type { InterestId, TimeTierId } from '@/data/plan';

export const MAX_AGE_MONTHS = 30;

export type BabyProfile = {
  name: string;
  ageMonths: number;
  ageSetAt: number;
  birthDate: string | null;
  interests: InterestId[];
  time: TimeTierId;
  configured: boolean;
  tiredDate: string | null;
  achieved: Record<string, string>;
};
