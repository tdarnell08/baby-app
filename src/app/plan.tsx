import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '@/constants/theme';
import { interestOptions, timeTiers, type PlanItem } from '@/data/plan';
import { useBabyProfile } from '@/hooks/useBabyProfile';

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function PlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, isPremium, ageLabel, plan, tired, update, setTired } = useBabyProfile();

  const who = profile.name.trim();

  return (
    <LinearGradient
      colors={tired ? ['#241F3D', '#352E57', '#463F6B'] : ['#1E3144', '#27475A', '#2F5F5C']}
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.column}>
          <Pressable hitSlop={12} onPress={() => router.push('/')}>
            <Text style={styles.backText}>← Home</Text>
          </Pressable>
          <Text style={styles.date}>{todayLabel()}</Text>
          <Text style={styles.title}>{who ? `${who}’s Daily Play Plan` : 'Your Baby’s Daily Play Plan'}</Text>
          <Text style={styles.subtitle}>{plan.intro}</Text>

          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: tired }}
            onPress={() => setTired(!tired)}
            style={({ pressed }) => [styles.tired, tired && styles.tiredOn, pressed && styles.pressed]}
          >
            <Text style={styles.tiredEmoji}>{tired ? '☀️' : '🌙'}</Text>
            <View style={styles.flex}>
              <Text style={styles.tiredTitle}>{tired ? 'Back to the full plan' : 'We’re exhausted today'}</Text>
              <Text style={styles.tiredHint}>
                {tired
                  ? 'Low-effort mode is on. It resets tomorrow.'
                  : 'Tap for a low-effort plan built from everyday routines.'}
              </Text>
            </View>
          </Pressable>

          <View style={styles.panel}>
            <View style={styles.panelHead}>
              <View style={styles.flex}>
                <Text style={styles.panelTitle}>{profile.configured ? 'About your baby' : 'Set up your baby’s profile'}</Text>
                <Text style={styles.panelSummary}>
                  {profile.configured
                    ? `${ageLabel} · ${
                        profile.interests.length > 0
                          ? profile.interests.map((i) => interestOptions.find((o) => o.id === i)?.label).join(', ')
                          : 'No interests picked'
                      }`
                    : 'Add age and interests so the plan fits your baby.'}
                </Text>
              </View>
              <Pressable onPress={() => router.push('/profile')} hitSlop={8}>
                <Text style={styles.edit}>{profile.configured ? 'Edit' : 'Set up'}</Text>
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Time to play today</Text>
            <View style={styles.chips}>
              {timeTiers.map((tier) => {
                const on = profile.time === tier.id;
                return (
                  <Pressable
                    key={tier.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      if (!isPremium && tier.id !== 'standard') {
                        router.push('/paywall');
                        return;
                      }
                      update({ time: tier.id });
                    }}
                    style={[styles.tier, on && styles.chipOn]}
                  >
                    <Text style={[styles.tierLabel, on && styles.chipTextOn]}>{tier.label}</Text>
                    <Text style={[styles.tierHint, on && styles.tierHintOn]}>{tier.hint}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Text style={styles.section}>Today’s plan</Text>
          {plan.items.map((item, index) => (
            <PlanCardItem key={item.id} item={item} index={index + 1} onOpen={(href) => router.push(href)} />
          ))}

          <Text style={styles.disclaimer}>
            Lulla offers general ideas, not medical advice. Babies develop at their own pace. If you are concerned about
            feeding, movement, hearing, or speech, talk with your pediatrician.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function PlanCardItem({
  item,
  index,
  onOpen,
}: {
  item: PlanItem;
  index: number;
  onOpen: (href: NonNullable<PlanItem['cta']>['href']) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <View style={styles.flex}>
          <Text style={styles.cardLabel}>
            {index}. {item.label}
            {item.minutes ? ` · ${item.minutes} min` : ''}
          </Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </View>
      <View style={styles.steps}>
        {item.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <Text style={styles.stepBullet}>•</Text>
            <Text style={styles.stepBody}>{step}</Text>
          </View>
        ))}
      </View>
      {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
      {item.cta ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onOpen(item.cta!.href)}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText}>{item.cta.label} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  column: { width: '100%', maxWidth: 480 },
  flex: { flex: 1 },
  backText: {
    fontFamily: 'Nunito_600SemiBold',
    color: colors.mist,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  date: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.butter,
  },
  title: {
    marginTop: 4,
    fontFamily: 'Fraunces_700Bold',
    fontSize: 32,
    lineHeight: 38,
    color: colors.foam,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: spacing.md,
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(247,243,234,0.75)',
  },
  tired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(247,243,234,0.3)',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  tiredOn: {
    backgroundColor: '#5B4B8A',
    borderColor: '#8C7BC4',
  },
  tiredEmoji: { fontSize: 28 },
  tiredTitle: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: colors.foam },
  tiredHint: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 18, color: colors.mist },
  panel: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: spacing.md,
  },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  panelTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: colors.foam },
  panelSummary: {
    marginTop: 2,
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.mist,
  },
  edit: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.butter },
  editor: { marginTop: spacing.sm, gap: spacing.sm },
  fieldLabel: {
    marginTop: spacing.sm,
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.mist,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.foam,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: { opacity: 0.35 },
  stepText: { fontFamily: 'Nunito_700Bold', fontSize: 28, lineHeight: 32, color: colors.ink },
  ageValue: { fontFamily: 'Fraunces_700Bold', fontSize: 26, color: colors.foam },
  helper: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: 'rgba(247,243,234,0.6)' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  chipOn: { backgroundColor: colors.butter, borderColor: colors.butter },
  chipText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: colors.foam },
  chipTextOn: { color: colors.ink },
  tier: {
    flexGrow: 1,
    flexBasis: '30%',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tierLabel: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.foam },
  tierHint: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: colors.mist },
  tierHintOn: { color: colors.sageDeep },
  save: {
    marginTop: spacing.md,
    backgroundColor: colors.foam,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.ink },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.mist,
  },
  card: {
    marginBottom: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.foam,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardEmoji: { fontSize: 34 },
  cardLabel: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: colors.sageDeep },
  cardTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 20, lineHeight: 25, color: colors.ink },
  steps: { gap: 6 },
  stepRow: { flexDirection: 'row', gap: spacing.sm },
  stepBullet: { color: colors.sageDeep, fontSize: 15, lineHeight: 21 },
  stepBody: { flex: 1, fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 22, color: colors.ink },
  note: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    color: colors.muted,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  ctaText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.foam },
  disclaimer: {
    marginTop: spacing.sm,
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(247,243,234,0.55)',
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});
