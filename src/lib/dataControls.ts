import { tipById } from '@/data/sleepHelp';
import { wipeParentVoices } from '@/hooks/useParentVoice';
import { loadCharts, wipeCharts } from '@/lib/chartStore';
import { loadCourses, wipeCourses } from '@/lib/courseStore';
import { fmtBoth } from '@/lib/illnessLogic';
import { loadIllness, wipeIllness } from '@/lib/illnessStore';
import { wipeMediaFiles } from '@/lib/media';
import { loadMemories, wipeMemories } from '@/lib/memoryStore';
import { loadProfile, wipeProfile } from '@/lib/profileStore';
import { cancelAllReminders } from '@/lib/reminders';
import { loadKidPrefs, wipeKidPrefs } from '@/lib/kidStore';
import { loadSleepHelp, wipeSleepHelp } from '@/lib/sleepHelpStore';
import { loadSleep, wipeSleep } from '@/lib/sleepStore';

export async function buildExport(): Promise<string> {
  const [profile, sleep, courses, memories, illness, charts, sleepHelp, kid] = await Promise.all([
    loadProfile(),
    loadSleep(),
    loadCourses(),
    loadMemories(),
    loadIllness(),
    loadCharts(),
    loadSleepHelp(),
    loadKidPrefs(),
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
        interests: profile.interests,
        playTime: profile.time,
      },
      milestonesChecked: profile.achieved,
      sleepLog: sleep.map((s) => ({
        kind: s.kind,
        start: new Date(s.start).toISOString(),
        end: s.end ? new Date(s.end).toISOString() : null,
      })),
      kidModeSettings: { ageRange: kid.age, soundOn: kid.sound },
      sleepHelp: {
        tonightsPlan: sleepHelp.plan.map((p) => ({ tip: tipById(p.tipId)?.head ?? p.tipId, done: p.done })),
        bedtimeRoutine: sleepHelp.routine.map((r) => ({ step: r.id, minutes: r.minutes })),
        nightWakes: sleepHelp.wakes.map((w) => ({ at: new Date(w.at).toISOString(), kind: w.kind })),
      },
      medicineCourses: courses.courses.map((c) => ({
        type: c.mode === 'asNeeded' ? 'as needed' : 'course',
        maxDosesPer24HoursFromLabel: c.maxPer24,
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
      sickDayEpisodes: illness.episodes.map((e) => ({
        illness: e.title,
        startedAt: new Date(e.startedAt).toISOString(),
        endedAt: e.endedAt ? new Date(e.endedAt).toISOString() : null,
        entries: e.entries.map((x) => ({
          at: new Date(x.at).toISOString(),
          kind: x.kind,
          temperature: x.tempC === null ? null : fmtBoth(x.tempC),
          method: x.method,
          wetDiapers: x.count,
          text: x.text || null,
        })),
      })),
      medicineChartsFromPackages: charts.map((c) => ({
        name: c.name,
        activeIngredient: c.activeIngredient || null,
        note: c.note || null,
        rowsTypedByParent: c.rows,
        photos: c.photos.length,
      })),
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
    wipeParentVoices(),
    wipeSleep(),
    wipeSleepHelp(),
    wipeKidPrefs(),
    wipeCourses(),
    wipeIllness(),
    wipeCharts(),
    wipeMemories(),
    wipeMediaFiles(),
    cancelAllReminders(),
  ]);
}
