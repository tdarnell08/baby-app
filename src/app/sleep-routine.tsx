import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlusLock } from '@/components/PlusLock';
import { SafeSleepStrip, SLEEP_GRADIENT } from '@/components/SleepHelpBits';
import { Body, Btn, Chip, Panel, ProgressBar, Screen, Section, Title, uiStyles } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { MAX_ROUTINE_STEPS, routineCatalog } from '@/data/sleepHelp';
import { useSleepHelp } from '@/hooks/useSleepHelp';
import { useSleepLog } from '@/hooks/useSleepLog';
import { clock, localDayStart } from '@/lib/sleepCoach';
import {
  defaultBedtimeMinutes,
  routinePosition,
  routineStartTime,
  routineStepEndSec,
  routineTotalMinutes,
} from '@/lib/sleepHelpLogic';
import { useNow } from '@/lib/time';
import { usePremium } from '@/providers/PremiumProvider';

const label = (id: string) => routineCatalog.find((c) => c.id === id)?.label ?? id;

function mmss(sec: number) {
  return `${Math.floor(sec / 60)}:${`${sec % 60}`.padStart(2, '0')}`;
}

export default function SleepRoutineScreen() {
  const { isPremium } = usePremium();
  const { routine, toggleStep, moveStep, stepMinutes, clearRoutine } = useSleepHelp();
  const { sessions } = useSleepLog();
  const now = useNow(60000);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const total = routineTotalMinutes(routine);
  const bedMinutes = defaultBedtimeMinutes(sessions, now);
  const bedAt = localDayStart(now) + bedMinutes * 60_000;
  const startAt = routineStartTime(bedMinutes, routine, now);
  const position = routinePosition(routine, elapsed);

  useEffect(() => {
    if (!running || paused) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running, paused]);

  const start = () => {
    setElapsed(0);
    setPaused(false);
    setRunning(true);
  };
  const stop = () => {
    setRunning(false);
    setPaused(false);
    setElapsed(0);
  };

  if (running && isPremium) {
    const step = routine[position.index];
    const next = routine[position.index + 1];
    return (
      <Screen gradient={SLEEP_GRADIENT} backTo="/sleep-help" back="← Sleep help">
        <Title>Routine</Title>
        <Panel style={{ alignItems: 'center' }}>
          {position.done ? (
            <>
              <Text style={styles.stepName}>Goodnight</Text>
              <Body tone="muted">Routine done. Lights out, back to sleep, bare crib.</Body>
            </>
          ) : (
            <>
              <Text style={styles.kicker}>
                Step {position.index + 1} of {routine.length}
              </Text>
              <Text style={styles.stepName}>{label(step.id)}</Text>
              <Text style={styles.clock}>{mmss(position.remainingSec)}</Text>
              <View style={{ width: '100%' }}>
                <ProgressBar value={(position.index + 1) / routine.length} />
              </View>
              <Body tone="muted">{next ? `Next: ${label(next.id)}` : 'Last step'}</Body>
            </>
          )}
        </Panel>
        {position.done ? (
          <Btn label="Done" onPress={stop} />
        ) : (
          <>
            <View style={uiStyles.row}>
              <Btn label={paused ? 'Resume' : 'Pause'} kind="secondary" onPress={() => setPaused((p) => !p)} style={uiStyles.flex} />
              <Btn label="Next step" kind="secondary" onPress={() => setElapsed(routineStepEndSec(routine, position.index))} style={uiStyles.flex} />
            </View>
            <Btn label="Stop" kind="ghost" onPress={stop} />
          </>
        )}
      </Screen>
    );
  }

  return (
    <Screen gradient={SLEEP_GRADIENT} backTo="/sleep-help" back="← Sleep help">
      <Title sub="Pick steps in the order you do them. Same steps, same order, every night.">Bedtime routine</Title>

      <Section>Your routine</Section>
      <Panel>
        {routine.length === 0 ? (
          <Body tone="muted">Tap steps below to add them.</Body>
        ) : (
          routine.map((step, i) => (
            <View key={step.id} style={styles.stepRow}>
              <Text style={styles.num}>{i + 1}</Text>
              <View style={uiStyles.flex}>
                <Text style={styles.stepLabel}>{label(step.id)}</Text>
                <View style={uiStyles.row}>
                  <Btn label="−" kind="secondary" small onPress={() => stepMinutes(step.id, step.minutes - 1)} accessibilityLabel={`Shorter ${label(step.id)}`} style={styles.mini} />
                  <Text style={styles.min}>{step.minutes} min</Text>
                  <Btn label="+" kind="secondary" small onPress={() => stepMinutes(step.id, step.minutes + 1)} accessibilityLabel={`Longer ${label(step.id)}`} style={styles.mini} />
                </View>
              </View>
              <Btn label="▲" kind="ghost" small disabled={i === 0} onPress={() => moveStep(i, -1)} accessibilityLabel={`Move ${label(step.id)} up`} style={styles.mini} />
              <Btn label="▼" kind="ghost" small disabled={i === routine.length - 1} onPress={() => moveStep(i, 1)} accessibilityLabel={`Move ${label(step.id)} down`} style={styles.mini} />
              <Btn label="✕" kind="ghost" small onPress={() => toggleStep(step.id)} accessibilityLabel={`Remove ${label(step.id)}`} style={styles.mini} />
            </View>
          ))
        )}
        {routine.length > 0 ? (
          <Body tone="muted">
            {total} min total. To finish by {clock(bedAt)}, start at {clock(startAt)}.
          </Body>
        ) : null}
      </Panel>

      <Section>Tap to add ({routine.length}/{MAX_ROUTINE_STEPS})</Section>
      <View style={uiStyles.wrap}>
        {routineCatalog
          .filter((c) => !routine.some((s) => s.id === c.id))
          .map((c) => (
            <Chip key={c.id} label={`+ ${c.label}`} onPress={() => toggleStep(c.id)} />
          ))}
      </View>
      {routine.length >= MAX_ROUTINE_STEPS ? <Body tone="muted">Eight steps is plenty. Short and steady works best.</Body> : null}

      <Section>Timer</Section>
      {isPremium ? (
        <Btn label="Walk me through it" disabled={routine.length === 0} onPress={start} />
      ) : (
        <PlusLock title="Guided routine timer" body="A timer that walks you through each step, one at a time, with a countdown and a next-step preview." />
      )}
      {routine.length > 0 ? <Btn label="Clear routine" kind="ghost" onPress={clearRoutine} /> : null}
      <SafeSleepStrip />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: spacing.sm },
  num: { width: 24, fontFamily: 'Fraunces_700Bold', fontSize: 18, color: colors.butter },
  stepLabel: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam },
  min: { minWidth: 54, textAlign: 'center', fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: colors.mist },
  mini: { minHeight: 36, paddingHorizontal: 10, paddingVertical: 6 },
  kicker: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.mist, textTransform: 'uppercase', letterSpacing: 1 },
  stepName: { fontFamily: 'Fraunces_700Bold', fontSize: 30, color: colors.foam, textAlign: 'center' },
  clock: { fontFamily: 'Fraunces_700Bold', fontSize: 56, color: colors.butter },
});
