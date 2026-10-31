import { useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '@/constants/theme';
import { currentBand, nextBand } from '@/data/milestones';
import { formatAge, interestOptions, timeTiers, type InterestId } from '@/data/plan';
import { MAX_AGE_MONTHS, parseBirthDate, useBabyProfile } from '@/hooks/useBabyProfile';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hook = useBabyProfile();

  return (
    <LinearGradient colors={['#1E3144', '#27475A', '#2F5F5C']} style={styles.root}>
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
          <Text style={styles.title}>Baby profile</Text>
          <Text style={styles.subtitle}>
            Tell Lulla a little about your baby. It personalizes the daily plan and finds the right milestones.
            Everything stays on this device.
          </Text>
          {hook.ready ? <ProfileForm hook={hook} /> : null}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function ProfileForm({ hook }: { hook: ReturnType<typeof useBabyProfile> }) {
  const router = useRouter();
  const { profile, ageMonths, ageLabel, update, setAge, setBirthDate } = hook;

  const initial = profile.birthDate ? profile.birthDate.split('-') : ['', '', ''];
  const [year, setYear] = useState(initial[0] ?? '');
  const [month, setMonth] = useState(initial[1] ? String(Number(initial[1])) : '');
  const [day, setDay] = useState(initial[2] ? String(Number(initial[2])) : '');
  const [error, setError] = useState<string | null>(null);

  const commit = (y: string, m: string, d: string) => {
    if (!y && !m && !d) {
      setError(null);
      return;
    }
    if (y.length < 4 || !m || !d) {
      setError(null);
      return;
    }
    const key = parseBirthDate(Number(y), Number(m), Number(d), new Date());
    if (!key) {
      setError('That date doesn’t look right, or it is in the future.');
      return;
    }
    setError(null);
    setBirthDate(key);
  };

  const digits = (text: string, max: number) => text.replace(/\D/g, '').slice(0, max);

  const toggleInterest = (id: InterestId) => {
    const has = profile.interests.includes(id);
    update({
      interests: has ? profile.interests.filter((i) => i !== id) : [...profile.interests, id],
      configured: true,
    });
  };

  const stepAge = (delta: number) => {
    setYear('');
    setMonth('');
    setDay('');
    setError(null);
    setAge(ageMonths + delta);
  };

  const band = currentBand(ageMonths);
  const upcoming = nextBand(ageMonths);
  const checked = Object.keys(profile.achieved).length;

  return (
    <View style={styles.form}>
      <View style={styles.ageCard}>
        <Text style={styles.ageKicker}>
          {profile.name.trim() ? `${profile.name.trim()} is` : 'Your baby is'}
        </Text>
        <Text style={styles.ageBig}>{ageLabel}</Text>
        <Text style={styles.ageSub}>
          {profile.birthDate ? 'Calculated from birth date' : 'Estimated from the age you entered'}
          {upcoming ? ` · next milestone list at ${upcoming} months` : ''}
        </Text>
        <View style={styles.ageActions}>
          <Pressable onPress={() => router.push('/milestones')} style={styles.ageBtn}>
            <Text style={styles.ageBtnText}>
              Milestones{band !== null ? ` (${checked} checked)` : ''} →
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.fieldLabel}>Name (optional)</Text>
      <TextInput
        value={profile.name}
        onChangeText={(name) => update({ name })}
        placeholder="Baby’s name"
        placeholderTextColor="rgba(247,243,234,0.4)"
        style={styles.input}
        maxLength={24}
        returnKeyType="done"
      />

      <Text style={styles.fieldLabel}>Birth date</Text>
      <View style={styles.dateRow}>
        <View style={styles.dateCell}>
          <TextInput
            value={month}
            onChangeText={(t) => {
              const v = digits(t, 2);
              setMonth(v);
              commit(year, v, day);
            }}
            placeholder="MM"
            placeholderTextColor="rgba(247,243,234,0.4)"
            keyboardType="number-pad"
            style={[styles.input, styles.dateInput]}
            accessibilityLabel="Birth month"
          />
        </View>
        <View style={styles.dateCell}>
          <TextInput
            value={day}
            onChangeText={(t) => {
              const v = digits(t, 2);
              setDay(v);
              commit(year, month, v);
            }}
            placeholder="DD"
            placeholderTextColor="rgba(247,243,234,0.4)"
            keyboardType="number-pad"
            style={[styles.input, styles.dateInput]}
            accessibilityLabel="Birth day"
          />
        </View>
        <View style={[styles.dateCell, styles.yearCell]}>
          <TextInput
            value={year}
            onChangeText={(t) => {
              const v = digits(t, 4);
              setYear(v);
              commit(v, month, day);
            }}
            placeholder="YYYY"
            placeholderTextColor="rgba(247,243,234,0.4)"
            keyboardType="number-pad"
            style={[styles.input, styles.dateInput]}
            accessibilityLabel="Birth year"
          />
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.helper}>
        With a birth date, age and milestone windows stay exact, down to the week.
        {profile.birthDate && ageMonths >= MAX_AGE_MONTHS ? ' Lulla covers up to 30 months.' : ''}
      </Text>

      <Text style={styles.fieldLabel}>Or set age in months</Text>
      <View style={styles.stepper}>
        <Pressable
          accessibilityLabel="One month younger"
          disabled={ageMonths <= 0}
          onPress={() => stepAge(-1)}
          style={[styles.stepBtn, ageMonths <= 0 && styles.stepDisabled]}
        >
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>{formatAge(ageMonths)}</Text>
        <Pressable
          accessibilityLabel="One month older"
          disabled={ageMonths >= MAX_AGE_MONTHS}
          onPress={() => stepAge(1)}
          style={[styles.stepBtn, ageMonths >= MAX_AGE_MONTHS && styles.stepDisabled]}
        >
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
      <Text style={styles.helper}>If you use this, we remove the birth date and age moves forward on its own.</Text>

      <Text style={styles.fieldLabel}>What does your baby love?</Text>
      <View style={styles.chips}>
        {interestOptions.map((option) => {
          const on = profile.interests.includes(option.id);
          return (
            <Pressable
              key={option.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => toggleInterest(option.id)}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>
                {option.emoji} {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>How much play time do you usually have?</Text>
      <View style={styles.chips}>
        {timeTiers.map((tier) => {
          const on = profile.time === tier.id;
          return (
            <Pressable
              key={tier.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => update({ time: tier.id, configured: true })}
              style={[styles.tier, on && styles.chipOn]}
            >
              <Text style={[styles.tierLabel, on && styles.chipTextOn]}>{tier.label}</Text>
              <Text style={[styles.tierHint, on && styles.tierHintOn]}>{tier.hint}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          update({ configured: true });
          router.push('/plan');
        }}
        style={({ pressed }) => [styles.save, pressed && styles.pressed]}
      >
        <Text style={styles.saveText}>See today’s plan</Text>
      </Pressable>
      <Text style={styles.helper}>Changes save automatically on this device.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  column: { width: '100%', maxWidth: 480 },
  backText: { fontFamily: 'Nunito_600SemiBold', color: colors.mist, fontSize: 15, marginBottom: spacing.sm },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 34, color: colors.foam },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(247,243,234,0.75)',
    marginBottom: spacing.md,
  },
  form: { gap: spacing.sm },
  ageCard: {
    backgroundColor: colors.foam,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: 2,
    marginBottom: spacing.sm,
  },
  ageKicker: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.sageDeep,
  },
  ageBig: { fontFamily: 'Fraunces_700Bold', fontSize: 40, color: colors.ink },
  ageSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 19, color: colors.muted },
  ageActions: { flexDirection: 'row', marginTop: spacing.sm },
  ageBtn: {
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  ageBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.foam },
  fieldLabel: {
    marginTop: spacing.md,
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
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateCell: { flex: 1 },
  yearCell: { flex: 1.4 },
  dateInput: { textAlign: 'center' },
  error: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: colors.blush },
  helper: { fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17, color: 'rgba(247,243,234,0.6)' },
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
  stepValue: { fontFamily: 'Fraunces_700Bold', fontSize: 24, color: colors.foam },
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
    marginTop: spacing.lg,
    backgroundColor: colors.foam,
    borderRadius: radii.pill,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.ink },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});
