import { loadMedLog, wipeMedLog } from '@/hooks/useMedLog';
import { wipeParentVoices } from '@/hooks/useParentVoice';
import { loadProfile, wipeProfile } from '@/lib/profileStore';

export async function buildExport(): Promise<string> {
  const [profile, doseLog] = await Promise.all([loadProfile(), loadMedLog()]);
  return JSON.stringify(
    {
      app: 'Lulla',
      exportedAt: new Date().toISOString(),
      note: 'Voice recordings are audio files on your device and are not included in this export.',
      babyProfile: {
        name: profile.name || null,
        birthDate: profile.birthDate,
        ageMonthsEntered: profile.ageMonths,
        weightKg: profile.weightKg,
        weightSavedOn: profile.weightDate,
        interests: profile.interests,
        playTime: profile.time,
      },
      milestonesChecked: profile.achieved,
      medicineDoseLog: doseLog.map((d) => ({
        medicine: d.med,
        amountMl: d.ml,
        givenAt: new Date(d.at).toISOString(),
      })),
    },
    null,
    2,
  );
}

export async function deleteEverything(): Promise<void> {
  await Promise.allSettled([wipeProfile(), wipeMedLog(), wipeParentVoices()]);
}
