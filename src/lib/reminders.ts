import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { computeAge } from '@/lib/age';
import { courseState, MIN } from '@/lib/courseLogic';
import { loadCourses } from '@/lib/courseStore';
import { loadProfile } from '@/lib/profileStore';
import { clock, predictNext } from '@/lib/sleepCoach';
import { loadSleep, loadSleepPrefs } from '@/lib/sleepStore';

const isWeb = Platform.OS === 'web';
const CHANNEL = 'reminders';
const MAX_SLOTS_PER_COURSE = 6;

let premium = false;
let chain: Promise<void> = Promise.resolve();

if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const remindersSupported = !isWeb;

export function setReminderPremium(value: boolean) {
  if (premium === value) return;
  premium = value;
  void syncReminders();
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (isWeb) return false;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Reminders',
        // eslint-disable-next-line import/namespace
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain && current.status === 'denied') return false;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

async function hasPermission() {
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

async function schedule(identifier: string, title: string, body: string, at: number) {
  if (at <= Date.now() + 5000) return;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(at),
      ...(Platform.OS === 'android' ? { channelId: CHANNEL } : {}),
    },
  });
}

async function rebuild() {
  if (isWeb) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!(await hasPermission())) return;
    const now = Date.now();

    const [sleep, prefs, profile, courseData] = await Promise.all([
      loadSleep(),
      loadSleepPrefs(),
      loadProfile(),
      loadCourses(),
    ]);

    if (premium && prefs.remind) {
      const age = computeAge(profile, new Date(now)).ageMonths;
      const prediction = predictNext(sleep, age, now);
      if (prediction) {
        const what = prediction.kind === 'night' ? 'Bedtime' : 'A nap';
        await schedule(
          'lulla-sleep-window',
          'Sleep window opening soon',
          `${what} window opens around ${clock(prediction.opensAt)}. Open Lulla when you start.`,
          prediction.opensAt - prefs.leadMinutes * MIN,
        );
      }
    }

    for (const course of courseData.courses) {
      if (!course.remind) continue;
      const state = courseState(course, now);
      if (state.finished) continue;
      const done = new Set<number>([...course.skipped, ...course.log.filter((l) => l.slot !== null).map((l) => l.slot as number)]);
      let scheduled = 0;
      for (let i = 0; i < state.slots.length && scheduled < MAX_SLOTS_PER_COURSE; i++) {
        if (done.has(i) || state.slots[i] < now) continue;
        await schedule(
          `course-${course.id}-${i}-due`,
          'Medicine reminder',
          'A dose is due. Open Lulla to check the label and log it.',
          state.slots[i],
        );
        await schedule(
          `course-${course.id}-${i}-late`,
          'Dose not logged yet',
          'If a dose was missed, check the label and call your pharmacist or pediatrician.',
          state.slots[i] + 45 * MIN,
        );
        scheduled += 1;
      }
    }
  } catch {
    // reminders are best effort
  }
}

export function syncReminders(): Promise<void> {
  chain = chain.then(rebuild, rebuild);
  return chain;
}

export async function cancelAllReminders() {
  if (isWeb) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // nothing scheduled
  }
}
