import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlanList, SafeSleepStrip, SLEEP_GRADIENT } from '@/components/SleepHelpBits';
import { Body, Btn, Panel, Screen, Section, Title, uiStyles } from '@/components/ui';
import { colors, radii, spacing } from '@/constants/theme';
import { sleepHelpDisclaimer, tipById } from '@/data/sleepHelp';
import { useSleepHelp } from '@/hooks/useSleepHelp';

const tools = [
  { href: '/sleep-night' as const, label: '3 a.m. mode', hint: 'Dark screen, sound, breathing' },
  { href: '/sleep-window' as const, label: 'Wake windows', hint: 'When is the next sleep due?' },
  { href: '/sleep-routine' as const, label: 'Bedtime routine', hint: 'Build it. Plus walks you through it.' },
  { href: '/sleep-wakes' as const, label: 'Night wake log', hint: 'One tap each. Plus shows weekly patterns.' },
  { href: '/sleep-safe' as const, label: 'Safe sleep and red flags', hint: 'AAP guidance and when to call' },
];

export default function SleepHelpScreen() {
  const router = useRouter();
  const { plan, togglePlan, removePlan, clearPlan } = useSleepHelp();
  const done = plan.filter((p) => p.done).length;

  return (
    <Screen gradient={SLEEP_GRADIENT} backTo="/coach" back="← Sleep coach">
      <Title sub="Tap through to find what might help tonight.">Sleep help</Title>

      <Btn label="What’s happening?" onPress={() => router.push('/sleep-fix')} />

      <Section>Tonight’s plan</Section>
      <Panel>
        {plan.length === 0 ? (
          <Body tone="muted">Nothing yet. Tap “I’ll try this” on a tip and it lands here.</Body>
        ) : (
          <>
            <Text style={styles.count}>
              {done} of {plan.length} done
            </Text>
            <PlanList plan={plan} onToggle={togglePlan} onRemove={removePlan} tipTitle={(id) => tipById(id)?.head ?? 'Tip'} />
            <View style={uiStyles.wrap}>
              <Btn label="Add more tips" kind="secondary" small onPress={() => router.push('/sleep-fix')} />
              <Btn label="Clear plan" kind="ghost" small onPress={clearPlan} />
            </View>
          </>
        )}
      </Panel>

      <Section>Tools</Section>
      {tools.map((tool) => (
        <Pressable
          key={tool.href}
          accessibilityRole="button"
          onPress={() => router.push(tool.href)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View style={uiStyles.flex}>
            <Text style={styles.rowLabel}>{tool.label}</Text>
            <Text style={styles.rowHint}>{tool.hint}</Text>
          </View>
          <Text style={styles.chev}>›</Text>
        </Pressable>
      ))}

      <SafeSleepStrip />
      <Body tone="muted">{sleepHelpDisclaimer}</Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  count: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.butter },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowLabel: { fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: colors.foam },
  rowHint: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.mist, marginTop: 2 },
  chev: { fontFamily: 'Nunito_700Bold', fontSize: 24, color: colors.mist },
  pressed: { opacity: 0.88 },
});
