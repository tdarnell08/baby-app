import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeSleepStrip, SLEEP_GRADIENT } from '@/components/SleepHelpBits';
import { Body, Btn, Chip, Notice, Panel, Screen, Section, Stepper, Title, uiStyles } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useSleepLog } from '@/hooks/useSleepLog';
import { clock, formatDuration, formatWakeRange, lastWakeTime, localDayStart } from '@/lib/sleepCoach';
import { defaultBedtimeMinutes, suggestWindow } from '@/lib/sleepHelpLogic';
import { nowMs, useNow } from '@/lib/time';

const MIN = 60 * 1000;
const AGO = [0, 15, 30, 60, 120];

export default function SleepWindowScreen() {
  const router = useRouter();
  const now = useNow(20000);
  const { ageMonths, ageLabel, profile } = useBabyProfile();
  const { sessions } = useSleepLog();
  const [pickedWake, setPickedWake] = useState<number | null>(null);
  const [pickedBed, setPickedBed] = useState<number | null>(null);

  const logged = lastWakeTime(sessions);
  const defaultWake = logged !== null && now - logged < 8 * 60 * MIN ? logged : now;
  const wakeAt = Math.min(pickedWake ?? defaultWake, now);
  const bedMinutes = pickedBed ?? defaultBedtimeMinutes(sessions, now);
  const bedAt = localDayStart(now) + bedMinutes * MIN;
  const suggestion = suggestWindow(wakeAt, ageMonths, bedMinutes);
  const usesBedtime = ageMonths >= 3;

  return (
    <Screen gradient={SLEEP_GRADIENT} backTo="/sleep-help" back="← Sleep help">
      <Title sub={`${ageLabel}. Enter the last wake-up to see the next sleep window.`}>Wake windows</Title>

      <Panel>
        <Stepper
          label="Last woke up"
          value={clock(wakeAt)}
          onMinus={() => setPickedWake(wakeAt - 5 * MIN)}
          onPlus={() => setPickedWake(Math.min(nowMs(), wakeAt + 5 * MIN))}
          plusDisabled={wakeAt >= now}
        />
        <View style={uiStyles.wrap}>
          {AGO.map((m) => (
            <Chip key={m} label={m === 0 ? 'Just now' : m < 60 ? `${m} min ago` : `${m / 60} h ago`} onPress={() => setPickedWake(nowMs() - m * MIN)} />
          ))}
        </View>
        {usesBedtime ? (
          <Stepper
            label="Usual bedtime"
            value={clock(bedAt)}
            onMinus={() => setPickedBed(Math.max(17 * 60, bedMinutes - 15))}
            onPlus={() => setPickedBed(Math.min(22 * 60, bedMinutes + 15))}
            minusDisabled={bedMinutes <= 17 * 60}
            plusDisabled={bedMinutes >= 22 * 60}
          />
        ) : null}
        {logged !== null && pickedWake === null && defaultWake === logged ? (
          <Body tone="muted">Using the last wake-up from your Sleep coach log.</Body>
        ) : null}
      </Panel>

      <Section>Next sleep</Section>
      {suggestion ? (
        <Panel>
          <Text style={styles.big}>
            {clock(suggestion.opensAt)} to {clock(suggestion.closesAt)}
          </Text>
          <Text style={styles.kind}>{suggestion.kind === 'night' ? 'Bedtime window' : 'Nap window'}</Text>
          {now > suggestion.closesAt ? (
            <Body tone="warn">The window has passed. Watch for sleepy cues and start soon.</Body>
          ) : now >= suggestion.opensAt ? (
            <Body tone="good">Open now. Look for yawning, staring, or fussing.</Body>
          ) : (
            <Body tone="muted">Opens in {formatDuration(suggestion.opensAt - now)}.</Body>
          )}
          <Body>
            Typical awake time at this age: {formatWakeRange(suggestion.guide)}.
            {suggestion.kind === 'nap' && usesBedtime ? ` Bedtime around ${clock(bedAt)}.` : ''}
          </Body>
          <Body tone="muted">A common range, not a rule. Watch your baby, not just the clock.</Body>
        </Panel>
      ) : (
        <Notice tone="info" title="It’s overnight">
          This helper is for daytime wake-ups. For a night waking, try 3 a.m. mode.
        </Notice>
      )}

      {!profile.configured ? (
        <Notice tone="warn" title="Add your baby’s age">
          Windows change a lot with age. Set it in the baby profile.
        </Notice>
      ) : null}

      <Btn label="Open Sleep coach" kind="secondary" onPress={() => router.push('/coach')} />
      <SafeSleepStrip />
    </Screen>
  );
}

const styles = StyleSheet.create({
  big: { fontFamily: 'Fraunces_700Bold', fontSize: 30, color: colors.butter },
  kind: { fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: colors.foam },
});
