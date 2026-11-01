import { loadMedLog, wipeMedLog } from '@/hooks/useMedLog';
import { wipeParentVoices } from '@/hooks/useParentVoice';
import { loadCourses, wipeCourses } from '@/lib/courseStore';
import { wipeMediaFiles } from '@/lib/media';
import { loadMemories, wipeMemories } from '@/lib/memoryStore';
import { loadProfile, wipeProfile } from '@/lib/profileStore';
import { cancelAllReminders } from '@/lib/reminders';
import { loadSleep, wipeSleep } from '@/lib/sleepStore';

export async function buildExport(): Promise<string> {
  const [profile, doseLog, sleep, courses, memories] = await Promise.all([
    loadProfile(),
    loadMedLog(),
    loadSleep(),
    loadCourses(),
    loadMemories(),
  ]);
  return JSON.stringify(
    {
      app: 'Lulla',
      exportedAt: new Date().toISOString(),
      note: 'Photos and voice recordings are files on your device and are not included in this export. Memory entries list how many were attached.',
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
      sleepLog: sleep.map((s) => ({
        kind: s.kind,
        start: new Date(s.start).toISOString(),
        end: s.end ? new Date(s.end).toISOString() : null,
      })),
      medicineCourses: courses.courses.map((c) => ({
        medicine: c.medName,
        doseAsWrittenOnLabel: c.doseText,
        schedule: c.schedule,
        startedAt: new Date(c.startAt).toISOString(),
        courseDays: c.days,
        stoppedAt: c.stoppedAt ? new Date(c.stoppedAt).toISOString() : null,
        remindersOn: c.remind,
        doses: c.log.map((l) => ({
          at: new Date(l.at).toISOString(),
          givenBy: l.by || null,
          scheduledSlot: l.slot,
          earlierThanScheduled: l.early,
          vomited: l.vomited,
        })),
        skippedSlots: c.skipped,
        notes: c.notes.map((n) => ({ at: new Date(n.at).toISOString(), text: n.text })),
      })),
      caregiverNames: courses.caregivers,
      memories: memories.map((m) => ({
        kind: m.kind,
        title: m.title,
        note: m.note || null,
        date: m.date,
        age: m.ageLabel || null,
        photos: m.photos.length,
        hasVoiceClip: m.voice !== null,
      })),
    },
    null,
    2,
  );
}

export async function deleteEverything(): Promise<void> {
  await Promise.allSettled([
    wipeProfile(),
    wipeMedLog(),
    wipeParentVoices(),
    wipeSleep(),
    wipeCourses(),
    wipeMemories(),
    wipeMediaFiles(),
    cancelAllReminders(),
  ]);
}
