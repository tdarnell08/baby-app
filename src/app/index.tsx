import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { BreathingOrb } from '@/components/BreathingOrb';
import { HomeTiles } from '@/components/HomeTiles';
import { PlanCard } from '@/components/PlanCard';
import { Starfield } from '@/components/Starfield';
import { colors, radii, spacing } from '@/constants/theme';

const actions = [
  {
    href: '/sleep' as const,
    label: 'Sleep sounds',
    hint: 'Rain, hush, heartbeat & more',
    primary: true,
  },
  {
    href: '/words' as const,
    label: 'First words',
    hint: 'Parentese lessons with warm voice clips',
    primary: false,
  },
  {
    href: '/foods' as const,
    label: 'First foods',
    hint: 'Safe slices and choking guidance',
    primary: false,
  },
  {
    href: '/steps' as const,
    label: 'First steps',
    hint: 'Tummy time to walking practice',
    primary: false,
  },
  {
    href: '/medicine' as const,
    label: 'Medicine doses',
    hint: 'Weight-based fever and pain doses, with a dose log',
    primary: false,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const columnWidth = Math.min(width - spacing.lg * 2, 400);

  return (
    <LinearGradient
      colors={[colors.nightDeep, '#163645', '#1F4A4A']}
      locations={[0, 0.55, 1]}
      style={styles.root}
    >
      <Starfield />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
            width: columnWidth,
            alignSelf: 'center',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(700)} style={styles.hero}>
          <BreathingOrb size={88} color={colors.sage} />
          <Text style={styles.brand}>Lulla</Text>
          <Text style={styles.tagline}>Sleep. Words. Food. First steps.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).duration(700)} style={styles.actions}>
          <PlanCard />
          <HomeTiles />
          {actions.map((action) => (
            <Pressable
              key={action.href}
              accessibilityRole="button"
              onPress={() => router.push(action.href)}
              style={({ pressed }) => [
                action.primary ? styles.primary : styles.secondary,
                pressed && styles.pressed,
              ]}
            >
              <Text style={action.primary ? styles.primaryLabel : styles.secondaryLabel}>{action.label}</Text>
              <Text style={action.primary ? styles.primaryHint : styles.secondaryHint}>{action.hint}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  brand: {
    marginTop: spacing.sm,
    fontFamily: 'Fraunces_700Bold',
    fontSize: 44,
    letterSpacing: -1,
    color: colors.foam,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 17,
    color: colors.mist,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  primary: {
    width: '100%',
    backgroundColor: colors.butter,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  primaryLabel: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 24,
    color: colors.ink,
  },
  primaryHint: {
    marginTop: 4,
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.sageDeep,
  },
  secondary: {
    width: '100%',
    backgroundColor: 'rgba(215,230,225,0.12)',
    borderWidth: 1,
    borderColor: colors.sleepBorder,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  secondaryLabel: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 24,
    color: colors.foam,
  },
  secondaryHint: {
    marginTop: 4,
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.mist,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
});
