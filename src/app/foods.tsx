import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { MilestoneStrip } from '@/components/MilestoneStrip';
import { colors, radii, spacing } from '@/constants/theme';
import {
  chokingRules,
  evidenceLabels,
  firstFoods,
  foodDisclaimer,
  foodScience,
  foodStages,
  readinessSigns,
  type FoodStage,
} from '@/data/foods';

export default function FoodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stage, setStage] = useState<FoodStage>('start');
  const [index, setIndex] = useState(0);
  const [showScience, setShowScience] = useState(false);

  const foods = useMemo(() => firstFoods.filter((f) => f.stage === stage), [stage]);
  const food = foods[index % Math.max(foods.length, 1)];
  const stageInfo = foodStages.find((s) => s.id === stage);

  const pickStage = (id: FoodStage) => {
    setStage(id);
    setIndex(0);
  };

  const go = (delta: number) => {
    if (foods.length === 0) return;
    setIndex((i) => (i + delta + foods.length) % foods.length);
  };

  return (
    <LinearGradient colors={['#2A3A28', '#3A4F3A', '#4A5F45']} style={styles.root}>
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
          <Text style={styles.title}>First foods</Text>
          <Text style={styles.subtitle}>Soft textures. Safe shapes. Sit and stay close.</Text>

          <MilestoneStrip domain="feeding" />

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Ready to start?</Text>
            {readinessSigns.map((sign) => (
              <View key={sign} style={styles.noteRow}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>{sign}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>Choking safety basics</Text>
          <View style={styles.panel}>
            {chokingRules.map((rule) => (
              <View key={rule} style={styles.noteRow}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>{rule}</Text>
              </View>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {foodStages.map((s) => {
              const selected = s.id === stage;
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="button"
                  onPress={() => pickStage(s.id)}
                  style={[styles.chip, selected && styles.chipOn]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextOn]}>{s.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.categoryBlurb}>{stageInfo?.blurb}</Text>

          {food ? (
            <Animated.View
              key={food.id}
              entering={FadeInRight.duration(280)}
              exiting={FadeOutLeft.duration(180)}
              style={[styles.card, { backgroundColor: food.color }]}
            >
              <Text style={styles.emoji}>{food.emoji}</Text>
              <Text style={styles.word}>{food.name}</Text>
              {food.allergens ? (
                <View style={styles.allergenPill}>
                  <Text style={styles.allergenText}>Common allergen — introduce thoughtfully</Text>
                </View>
              ) : null}
              <Text style={styles.badge}>{evidenceLabels[food.evidence]}</Text>

              <View style={styles.block}>
                <Text style={styles.blockLabel}>How to slice / serve</Text>
                <Text style={styles.blockBody}>{food.slice}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Why this food</Text>
                <Text style={styles.blockBody}>{food.why}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Skip this form</Text>
                <Text style={styles.blockBody}>{food.avoid}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Serving tip</Text>
                <Text style={styles.blockBody}>{food.serve}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>What the science says</Text>
                <Text style={styles.blockBody}>{food.science}</Text>
              </View>
            </Animated.View>
          ) : null}

          <View style={styles.nav}>
            <Pressable accessibilityRole="button" onPress={() => go(-1)} style={styles.navBtn}>
              <Text style={styles.navLabel}>Previous</Text>
            </Pressable>
            <Text style={styles.progress}>
              {foods.length ? `${(index % foods.length) + 1} / ${foods.length}` : '0 / 0'}
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
              {showScience ? 'Hide' : 'Show'} feeding research overview
            </Text>
          </Pressable>
          {showScience ? (
            <View style={styles.panel}>
              {foodScience.map((item) => (
                <View key={item.title} style={styles.sciItem}>
                  <Text style={styles.sciTitle}>{item.title}</Text>
                  <Text style={styles.noteText}>{item.body}</Text>
                </View>
              ))}
              <Text style={styles.disclaimer}>{foodDisclaimer}</Text>
            </View>
          ) : (
            <Text style={styles.disclaimer}>{foodDisclaimer}</Text>
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
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.mist,
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
    fontSize: 36,
    color: colors.ink,
    textAlign: 'center',
  },
  allergenPill: {
    backgroundColor: 'rgba(28,46,54,0.14)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  allergenText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.ink,
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
    gap: 2,
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
