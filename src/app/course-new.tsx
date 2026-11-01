import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Switch, Text, View } from 'react-native';
import { Body, Btn, Chip, Field, Notice, Panel, Screen, Section, Stepper, Title, uiStyles } from '@/components/ui';
import { colors } from '@/constants/theme';
import { courseDisclaimer } from '@/data/courses';
import { useCourses } from '@/hooks/useCourses';
import { clockLabel, MAX_DAYS, MAX_TIMES, sanitizeText, type Schedule } from '@/lib/courseLogic';
import { ensureNotificationPermission, remindersSupported } from '@/lib/reminders';

function roundedNow() {
  const d = new Date();
  const m = Math.ceil((d.getHours() * 60 + d.getMinutes()) / 15) * 15;
  return m >= 1440 ? 1425 : m;
}

function dayLabel(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const rel = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : offset === -1 ? 'Yesterday' : '';
  const date = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  return rel ? `${rel}, ${date}` : date;
}

export default function NewCourseScreen() {
  const router = useRouter();
  const { add } = useCourses();
  const [medName, setMedName] = useState('');
  const [doseText, setDoseText] = useState('');
  const [mode, setMode] = useState<'times' | 'interval'>('times');
  const [times, setTimes] = useState<number[]>([8 * 60, 20 * 60]);
  const [hours, setHours] = useState(8);
  const [dayOffset, setDayOffset] = useState(0);
  const [firstTime, setFirstTime] = useState(roundedNow);
  const [days, setDays] = useState(10);
  const [remind, setRemind] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const nameOk = sanitizeText(medName, 60).length > 0;
  const doseOk = sanitizeText(doseText, 80).length > 0;
  const canSave = nameOk && doseOk && confirmed;

  const shift = (i: number, delta: number) =>
    setTimes((prev) => prev.map((t, idx) => (idx === i ? (t + delta + 1440) % 1440 : t)));

  const save = async () => {
    if (!canSave) return;
    const start = new Date();
    start.setDate(start.getDate() + dayOffset);
    start.setHours(Math.floor(firstTime / 60), firstTime % 60, 0, 0);
    const schedule: Schedule =
      mode === 'times' ? { kind: 'times', times: Array.from(new Set(times)).sort((a, b) => a - b) } : { kind: 'interval', hours };
    let wantReminders = remind;
    if (remind && remindersSupported) {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        wantReminders = false;
        setNote('Notifications are off, so reminders were not turned on. You can still log doses here.');
      }
    }
    const id = add({
      medName: sanitizeText(medName, 60),
      doseText: sanitizeText(doseText, 80),
      schedule,
      startAt: start.getTime(),
      days,
      remind: wantReminders,
    });
    router.replace({ pathname: '/course', params: { id } });
  };

  return (
    <Screen gradient={['#1E2F33', '#26474A', '#2F5E55']} back="← Courses" backTo="/antibiotics">
      <Title sub="Copy these from the pharmacy label, exactly as written.">New medicine course</Title>

      <Notice tone="warn" title="Enter, don’t calculate">
        {courseDisclaimer}
      </Notice>

      <Panel>
        <Field label="Medicine name" value={medName} onChangeText={setMedName} placeholder="As on the label" maxLength={60} autoCapitalize="words" />
        <Field
          label="Dose, exactly as on the label"
          value={doseText}
          onChangeText={setDoseText}
          placeholder="Copy it word for word"
          maxLength={80}
          hint="Lulla only shows this back to you. It never checks or changes it."
        />
      </Panel>

      <Section>Schedule from the label</Section>
      <Panel>
        <View style={uiStyles.wrap}>
          <Chip label="Specific times each day" selected={mode === 'times'} onPress={() => setMode('times')} />
          <Chip label="Every few hours" selected={mode === 'interval'} onPress={() => setMode('interval')} />
        </View>
        {mode === 'times' ? (
          <>
            {times.map((t, i) => (
              <View key={i} style={{ gap: 6 }}>
                <Stepper label={`Dose ${i + 1}`} value={clockLabel(t)} onMinus={() => shift(i, -15)} onPlus={() => shift(i, 15)} />
                {times.length > 1 ? <Btn label="Remove this time" kind="ghost" small onPress={() => setTimes((p) => p.filter((_, idx) => idx !== i))} /> : null}
              </View>
            ))}
            {times.length < MAX_TIMES ? (
              <Btn
                label="Add another time"
                kind="secondary"
                small
                onPress={() => setTimes((p) => [...p, Math.min(1425, (p[p.length - 1] + 240) % 1440)])}
              />
            ) : null}
          </>
        ) : (
          <Stepper
            label="Every"
            value={`${hours} hour${hours === 1 ? '' : 's'}`}
            onMinus={() => setHours((h) => Math.max(1, h - 1))}
            onPlus={() => setHours((h) => Math.min(24, h + 1))}
            minusDisabled={hours <= 1}
            plusDisabled={hours >= 24}
          />
        )}
      </Panel>

      <Section>Start and length</Section>
      <Panel>
        <Stepper
          label="First dose day"
          value={dayLabel(dayOffset)}
          onMinus={() => setDayOffset((d) => Math.max(-3, d - 1))}
          onPlus={() => setDayOffset((d) => Math.min(3, d + 1))}
          minusDisabled={dayOffset <= -3}
          plusDisabled={dayOffset >= 3}
        />
        <Stepper
          label="First dose time"
          value={clockLabel(firstTime)}
          onMinus={() => setFirstTime((t) => (t + 1440 - 15) % 1440)}
          onPlus={() => setFirstTime((t) => (t + 15) % 1440)}
        />
        <Stepper
          label="Course length"
          value={`${days} day${days === 1 ? '' : 's'}`}
          onMinus={() => setDays((d) => Math.max(1, d - 1))}
          onPlus={() => setDays((d) => Math.min(MAX_DAYS, d + 1))}
          minusDisabled={days <= 1}
          plusDisabled={days >= MAX_DAYS}
        />
        <Body tone="muted">Use the number of days on the label. Lulla counts down to the last dose.</Body>
      </Panel>

      <Section>Reminders</Section>
      <Panel>
        <View style={uiStyles.row}>
          <View style={uiStyles.flex}>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam }}>Remind me at each dose time</Text>
            <Body tone="muted">
              Local notifications on this phone. They say “Medicine reminder” and never show the medicine name on your lock screen.
            </Body>
          </View>
          <Switch
            accessibilityLabel="Remind me at each dose time"
            value={remind}
            onValueChange={setRemind}
            trackColor={{ true: colors.butter, false: 'rgba(255,255,255,0.2)' }}
          />
        </View>
        {!remindersSupported ? <Body tone="muted">Reminders are available in the iPhone app.</Body> : null}
      </Panel>

      <Panel>
        <View style={uiStyles.row}>
          <View style={uiStyles.flex}>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam }}>
              I entered the medicine, dose, and schedule exactly as written on the label.
            </Text>
          </View>
          <Switch
            accessibilityLabel="I entered the label information exactly"
            value={confirmed}
            onValueChange={setConfirmed}
            trackColor={{ true: colors.butter, false: 'rgba(255,255,255,0.2)' }}
          />
        </View>
      </Panel>

      {note ? <Body tone="warn">{note}</Body> : null}
      <Btn label="Start tracking" onPress={save} disabled={!canSave} />
      {!canSave ? (
        <Body tone="muted">
          {!nameOk ? 'Add the medicine name. ' : ''}
          {!doseOk ? 'Add the dose from the label. ' : ''}
          {!confirmed ? 'Confirm the entry matches the label.' : ''}
        </Body>
      ) : null}
    </Screen>
  );
}
