import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Btn, Notice, Panel, Screen, Section, Title } from '@/components/ui';
import { colors, radii, spacing } from '@/constants/theme';
import { sickDisclaimer } from '@/data/sickGuide';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useCourses } from '@/hooks/useCourses';
import { useIllness } from '@/hooks/useIllness';
import { courseState } from '@/lib/courseLogic';
import { feverAdvice, fmtTemp, latestTemp, wetDiapersLast24, whenLabel } from '@/lib/illnessLogic';
import { useNow } from '@/lib/time';

const GRADIENT: [string, string, string] = ['#2B2437', '#3B3150', '#4A3D63'];

const rows = [
  { href: '/sick-doctor' as const, label: 'When to call the doctor', hint: 'Red flags by age, with a 911 list', urgent: true },
  { href: '/sick-symptoms' as const, label: 'Symptom log', hint: 'Temperature, fluids, diapers, sleep, and behavior, per illness' },
  { href: '/sick-meds' as const, label: 'Medicine log', hint: 'Last given and next allowed, antibiotic courses, reminders' },
  { href: '/sick-charts' as const, label: 'Package dosing charts', hint: 'Keep a photo of the chart from the box, or type its table' },
  { href: '/sick-comfort' as const, label: 'Comfort tips', hint: 'Fluids, saline, humidifier, rest, by age' },
  { href: '/sick-summary' as const, label: 'Doctor summary', hint: 'Share the current illness as text or PDF' },
];

export default function SickHubScreen() {
  const router = useRouter();
  const now = useNow();
  const { ageMonths, ageLabel } = useBabyProfile();
  const { current, unit } = useIllness();
  const { courses } = useCourses();

  const advice = current ? feverAdvice(current, ageMonths, now) : null;
  const temp = current ? latestTemp(current) : null;
  const active = courses.filter((c) => !courseState(c, now).finished);
  const nextUp = active
    .map((c) => ({ c, s: courseState(c, now) }))
    .map(({ c, s }) => ({ name: c.medName, at: c.mode === 'asNeeded' ? s.nextAllowedAt : s.nextAt, asNeeded: c.mode === 'asNeeded', allowedNow: s.allowedNow }))
    .filter((x) => x.at !== null);

  return (
    <Screen gradient={GRADIENT}>
      <Title sub="Free for everyone. Everything stays on this phone.">Sick Day</Title>
      <Text style={styles.tagline}>When They’re Sick</Text>

      <View style={styles.emergency}>
        <Text style={styles.emergencyTitle}>Is this an emergency?</Text>
        <Text style={styles.emergencyBody}>
          Trouble breathing, blue or gray color, hard to wake, a seizure, or a rash that does not fade under a glass: call 911.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn label="Call 911" kind="danger" onPress={() => Linking.openURL('tel:911').catch(() => {})} style={{ flex: 1 }} />
          <Btn label="See all red flags" kind="secondary" onPress={() => router.push('/sick-doctor')} style={{ flex: 1 }} />
        </View>
      </View>

      {current ? (
        <Panel>
          <Text style={styles.cardTitle}>{current.title}</Text>
          <Body tone="muted">
            {ageLabel ? `${ageLabel} old · ` : ''}started {whenLabel(current.startedAt)}
          </Body>
          {temp && temp.tempC !== null ? <Body>Last temperature {fmtTemp(temp.tempC, unit)} at {whenLabel(temp.at)}</Body> : null}
          <Body tone="muted">{wetDiapersLast24(current, now)} wet diaper{wetDiapersLast24(current, now) === 1 ? '' : 's'} logged in the last 24 hours</Body>
          {advice ? (
            <Notice tone={advice.level === 'now' ? 'danger' : 'warn'} title={advice.level === 'now' ? 'Call your pediatrician now' : 'Consider calling your pediatrician'}>
              {advice.message}
            </Notice>
          ) : null}
          {nextUp.slice(0, 3).map((n) => (
            <Body key={n.name} tone={n.asNeeded && !n.allowedNow ? 'warn' : 'normal'}>
              {n.name}: {n.asNeeded ? (n.allowedNow ? 'next dose allowed now' : `next allowed at ${whenLabel(n.at as number)}`) : `next dose ${whenLabel(n.at as number)}`}
            </Body>
          ))}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Btn label="Add to log" small onPress={() => router.push('/sick-symptoms')} style={{ flex: 1 }} />
            <Btn label="Doctor summary" kind="secondary" small onPress={() => router.push('/sick-summary')} style={{ flex: 1 }} />
          </View>
        </Panel>
      ) : (
        <Panel>
          <Text style={styles.cardTitle}>No illness in progress</Text>
          <Body tone="muted">Start a symptom log when your baby gets sick, and everything you record can be shared with the doctor in one tap.</Body>
          <Btn label="Start a symptom log" onPress={() => router.push('/sick-symptoms')} />
          {nextUp.length > 0 ? (
            <>
              {nextUp.slice(0, 3).map((n) => (
                <Body key={n.name}>
                  {n.name}: {n.asNeeded ? (n.allowedNow ? 'next dose allowed now' : `next allowed at ${whenLabel(n.at as number)}`) : `next dose ${whenLabel(n.at as number)}`}
                </Body>
              ))}
            </>
          ) : null}
        </Panel>
      )}

      <Section>Tools</Section>
      <View style={{ gap: spacing.sm }}>
        {rows.map((r) => (
          <Pressable
            key={r.href}
            accessibilityRole="button"
            onPress={() => router.push(r.href)}
            style={({ pressed }) => [styles.row, r.urgent && styles.rowUrgent, pressed && { opacity: 0.88 }]}
          >
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Text style={styles.rowHint}>{r.hint}</Text>
          </Pressable>
        ))}
      </View>

      <Notice tone="info" title="Not medical advice">
        {sickDisclaimer}
      </Notice>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tagline: { marginTop: -8, fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: colors.butter },
  emergency: {
    backgroundColor: 'rgba(232,162,154,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(232,162,154,0.6)',
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 8,
  },
  emergencyTitle: { fontFamily: 'Fraunces_700Bold', fontSize: 20, color: colors.blush },
  emergencyBody: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, color: colors.foam },
  cardTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: colors.foam },
  row: {
    backgroundColor: 'rgba(215,230,225,0.1)',
    borderWidth: 1,
    borderColor: colors.sleepBorder,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowUrgent: { borderColor: 'rgba(232,162,154,0.55)' },
  rowLabel: { fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: colors.foam },
  rowHint: { marginTop: 2, fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.mist },
});
