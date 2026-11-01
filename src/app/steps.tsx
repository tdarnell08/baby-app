import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { MilestoneStrip } from '@/components/MilestoneStrip';
import { freeStepStages } from '@/data/pricing';
import { usePremium } from '@/providers/PremiumProvider';
import { colors, radii, spacing } from '@/constants/theme';
import {
  evidenceLabels,
  motorSkills,
  motorStages,
  movementDisclaimer,
  movementPrinciples,
  movementScience,
  type MotorStage,
} from '@/data/movement';

export default function StepsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = usePremium();
  const [stage, setStage] = useState<MotorStage>('head');
  const [index, setIndex] = useState(0);
  const [showScience, setShowScience] = useState(false);

  const skills = useMemo(() => motorSkills.filter((s) => s.stage === stage), [stage]);
  const skill = skills[index % Math.max(skills.length, 1)];
  const stageInfo = motorStages.find((s) => s.id === stage);

  const pickStage = (id: MotorStage) => {
    setStage(id);
    setIndex(0);
  };

  const go = (delta: number) => {
    if (skills.length === 0) return;
    setIndex((i) => (i + delta + skills.length) % skills.length);
  };

  return (
    <LinearGradient colors={['#1B3344', '#244556', '#2F5A5A']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <Pressable hitSlop={12} onPress={() => router.push('/')}>
            <Text style={styles.backText}>← Home</Text>
          </Pressable>
          <Text style={styles.title}>First steps</Text>
          <Text style={styles.subtitle}>Floor play. Tiny practice. Cheer every try.</Text>

          <MilestoneStrip domain="movement" />

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Movement principles</Text>
            {movementPrinciples.map((item) => (
              <View key={item} style={styles.noteRow}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>{item}</Text>
              </View>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {motorStages.map((s) => {
              const selected = s.id === stage;
              const locked = !isPremium && !freeStepStages.includes(s.id);
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="button"
                  onPress={() => (locked ? router.push('/paywall') : pickStage(s.id))}
                  style={[styles.chip, selected && styles.chipOn]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                    {s.label}
                    {locked ? ' 🔒' : ''}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.categoryBlurb}>{stageInfo?.blurb}</Text>

          {skill ? (
            <Animated.View
              key={skill.id}
              entering={FadeInRight.duration(280)}
              exiting={FadeOutLeft.duration(180)}
              style={[styles.card, { backgroundColor: skill.color }]}
            >
              <Text style={styles.emoji}>{skill.emoji}</Text>
              <Text style={styles.word}>{skill.name}</Text>
              <Text style={styles.window}>{skill.window}</Text>
              <Text style={styles.badge}>{evidenceLabels[skill.evidence]}</Text>

              <View style={styles.block}>
                <Text style={styles.blockLabel}>Goal</Text>
                <Text style={styles.blockBody}>{skill.goal}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Set up</Text>
                <Text style={styles.blockBody}>{skill.setup}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Try this</Text>
                {skill.steps.map((step, i) => (
                  <Text key={step} style={styles.stepLine}>
                    {i + 1}. {step}
                  </Text>
                ))}
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Coach tip</Text>
                <Text style={styles.blockBody}>{skill.coaching}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Avoid</Text>
                <Text style={styles.blockBody}>{skill.avoid}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>What the science says</Text>
                <Text style={styles.blockBody}>{skill.science}</Text>
              </View>
            </Animated.View>
          ) : null}

          <View style={styles.nav}>
            <Pressable accessibilityRole="button" onPress={() => go(-1)} style={styles.navBtn}>
              <Text style={styles.navLabel}>Previous</Text>
            </Pressable>
            <Text style={styles.progress}>
              {skills.length ? `${(index % skills.length) + 1} / ${skills.length}` : '0 / 0'}
            </Text>
            <Pressable accessibilityRole="button" onPress={() => go(1)} style={styles.navBtn}>
              <Text style={styles.navLabel}>Next</Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowScience((v) => !v)}
            style={styles.scienceToggle}
          >
            <Text style={styles.scienceToggleText}>
              {showScience ? 'Hide' : 'Show'} motor development research
            </Text>
          </Pressable>
          {showScience ? (
            <View style={styles.panel}>
              {movementScience.map((item) => (
                <View key={item.title} style={styles.sciItem}>
                  <Text style={styles.sciTitle}>{item.title}</Text>
                  <Text style={styles.noteText}>{item.body}</Text>
                </View>
              ))}
              <Text style={styles.disclaimer}>{movementDisclaimer}</Text>
            </View>
          ) : (
            <Text style={styles.disclaimer}>{movementDisclaimer}</Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  column: {
    width: '100%',
    maxWidth: 480,
  },
  backText: {
    fontFamily: 'Nunito_600SemiBold',
    color: colors.mist,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 34,
    color: colors.foam,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: 'rgba(247,243,234,0.7)',
    marginBottom: spacing.md,
  },
  panel: {
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  panelTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 18,
    color: colors.foam,
  },
  noteRow: { flexDirection: 'row', gap: spacing.sm },
  noteBullet: { color: colors.butter, fontSize: 14, lineHeight: 21 },
  noteText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: colors.mist,
  },
  chipRow: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  chipOn: {
    backgroundColor: colors.butter,
    borderColor: colors.butter,
  },
  chipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.mist,
  },
  chipTextOn: { color: colors.ink },
  categoryBlurb: {
    marginBottom: spacing.md,
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: 'rgba(247,243,234,0.6)',
  },
  card: {
    borderRadius: radii.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: { fontSize: 64 },
  word: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 34,
    color: colors.ink,
    textAlign: 'center',
  },
  window: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.sageDeep,
    textAlign: 'center',
  },
  badge: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.sageDeep,
  },
  block: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(28,46,54,0.1)',
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  blockLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.sageDeep,
  },
  blockBody: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  stepLine: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  nav: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  navLabel: {
    fontFamily: 'Nunito_700Bold',
    color: colors.foam,
    fontSize: 14,
  },
  progress: {
    fontFamily: 'Nunito_600SemiBold',
    color: colors.mist,
  },
  scienceToggle: { marginTop: spacing.lg, paddingVertical: spacing.sm },
  scienceToggleText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.butter,
    textDecorationLine: 'underline',
  },
  sciItem: { gap: 2 },
  sciTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 16,
    color: colors.foam,
  },
  disclaimer: {
    marginTop: spacing.md,
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(247,243,234,0.55)',
  },
});
