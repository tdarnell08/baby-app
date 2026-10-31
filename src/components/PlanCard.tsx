import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';
import { useBabyProfile } from '@/hooks/useBabyProfile';

export function PlanCard() {
  const router = useRouter();
  const { profile, ageLabel, plan, tired, setTired } = useBabyProfile();
  const who = profile.name.trim();

  return (
    <View style={[styles.card, tired && styles.cardTired]}>
      <Text style={styles.kicker}>Today</Text>
      <Text style={styles.title}>{who ? `${who}’s Daily Play Plan` : 'Your Baby’s Daily Play Plan'}</Text>
      <Text style={styles.sub}>
        {profile.configured
          ? `${ageLabel} · about ${plan.totalMinutes} min${tired ? ' · low-effort mode' : ''}`
          : 'Set your baby’s age and interests to personalize today’s plan.'}
      </Text>

      <View style={styles.list}>
        {plan.items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>
                {item.label}
                {item.minutes ? ` · ${item.minutes} min` : ''}
              </Text>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(profile.configured ? '/plan' : '/profile')}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
      >
        <Text style={styles.primaryText}>{profile.configured ? 'Open today’s plan' : 'Personalize my plan'}</Text>
      </Pressable>

      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: tired }}
        onPress={() => setTired(!tired)}
        style={({ pressed }) => [styles.tired, tired && styles.tiredOn, pressed && styles.pressed]}
      >
        <Text style={styles.tiredEmoji}>{tired ? '☀️' : '🌙'}</Text>
        <View style={styles.rowText}>
          <Text style={[styles.tiredTitle, tired && styles.tiredTitleOn]}>
            {tired ? 'Back to the full plan' : 'We’re exhausted today'}
          </Text>
          <Text style={[styles.tiredHint, tired && styles.tiredHintOn]}>
            {tired ? 'Low-effort mode is on for today' : 'Switch to easy ideas for everyday routines'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    gap: spacing.sm,
    backgroundColor: colors.foam,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  cardTired: {
    backgroundColor: '#E9E4F2',
  },
  kicker: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.sageDeep,
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 26,
    lineHeight: 31,
    color: colors.ink,
  },
  sub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  list: {
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 24,
    width: 34,
    textAlign: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.sageDeep,
  },
  rowTitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  primary: {
    marginTop: spacing.sm,
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.foam,
  },
  tired: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: 'rgba(28,46,54,0.22)',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  tiredOn: {
    backgroundColor: '#5B4B8A',
    borderColor: '#5B4B8A',
  },
  tiredEmoji: { fontSize: 24 },
  tiredTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.ink,
  },
  tiredTitleOn: { color: colors.foam },
  tiredHint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.muted,
  },
  tiredHintOn: { color: '#E9E4F2' },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
