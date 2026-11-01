import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '@/constants/theme';
import {
  currentBand,
  domainInfo,
  domainOrder,
  milestoneAdvice,
  milestoneBandMonths,
  milestoneSource,
  milestones,
  nextBand,
  type MilestoneDomain,
} from '@/data/milestones';
import { useBabyProfile } from '@/hooks/useBabyProfile';

function noted(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function MilestonesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, ageMonths, ageLabel, toggleMilestone } = useBabyProfile();
  const [domain, setDomain] = useState<MilestoneDomain | 'all'>('all');
  const [overrides, setOverrides] = useState<Record<number, boolean>>({});

  const current = currentBand(ageMonths);
  const upcoming = nextBand(ageMonths);
  const visible = useMemo(
    () => milestones.filter((x) => domain === 'all' || x.domain === domain),
    [domain],
  );

  const dueSoFar = visible.filter((x) => current !== null && x.months <= current);
  const doneSoFar = dueSoFar.filter((x) => profile.achieved[x.id]).length;
  const progress = dueSoFar.length > 0 ? doneSoFar / dueSoFar.length : 0;

  const lagging = milestones.filter((x) => x.months <= ageMonths - 3 && !profile.achieved[x.id]).length;
  const who = profile.name.trim();

  return (
    <LinearGradient colors={['#2B2A4A', '#3A3A66', '#46508A']} style={styles.root}>
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
          <Text style={styles.title}>Milestone tracker</Text>
          <Text style={styles.subtitle}>
            {profile.configured
              ? `${who ? `${who} is` : 'Your baby is'} ${ageLabel} old. Tap a milestone when you see it.`
              : 'Tap a milestone when you see it. Add your baby’s age to highlight the right ones.'}
          </Text>

          {!profile.configured && (
            <Pressable onPress={() => router.push('/profile')} style={styles.setup}>
              <Text style={styles.setupText}>Set up baby profile →</Text>
            </Pressable>
          )}

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryBig}>
                {current !== null ? `${doneSoFar} of ${dueSoFar.length}` : 'Getting started'}
              </Text>
              <Text style={styles.summaryLabel}>
                {current !== null ? `checked through the ${current}-month list` : 'The first checklist starts at 2 months'}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            {upcoming !== null && (
              <Text style={styles.summaryHint}>Next up: the {upcoming}-month list</Text>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {(['all', ...domainOrder] as const).map((id) => {
              const on = domain === id;
              return (
                <Pressable key={id} onPress={() => setDomain(id)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {id === 'all' ? 'All' : `${domainInfo[id].emoji} ${domainInfo[id].label}`}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {lagging > 0 && (
            <View style={styles.nudge}>
              <Text style={styles.nudgeTitle}>{lagging} earlier {lagging === 1 ? 'skill isn’t' : 'skills aren’t'} checked</Text>
              <Text style={styles.nudgeBody}>
                Maybe you just haven’t noticed or logged them yet. {milestoneAdvice}
              </Text>
            </View>
          )}

          {milestoneBandMonths.map((band) => {
            const items = visible.filter((x) => x.months === band);
            if (items.length === 0) return null;
            const done = items.filter((x) => profile.achieved[x.id]).length;
            const isCurrent = band === current;
            const isNext = band === upcoming;
            const open = overrides[band] ?? (isCurrent || isNext);
            const status = isCurrent ? 'Current window' : isNext ? 'Coming up' : current !== null && band < current ? 'Earlier' : 'Later';
            return (
              <View key={band} style={[styles.band, isCurrent && styles.bandCurrent]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  onPress={() => setOverrides((prev) => ({ ...prev, [band]: !open }))}
                  style={styles.bandHead}
                >
                  <View style={styles.flex}>
                    <Text style={styles.bandTitle}>By {band} months</Text>
                    <Text style={styles.bandStatus}>{status}</Text>
                  </View>
                  <Text style={styles.bandCount}>
                    {done}/{items.length}
                  </Text>
                  <Text style={styles.chevron}>{open ? '▾' : '▸'}</Text>
                </Pressable>
                {open &&
                  items.map((item) => {
                    const when = profile.achieved[item.id];
                    return (
                      <Pressable
                        key={item.id}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: Boolean(when) }}
                        onPress={() => toggleMilestone(item.id)}
                        style={styles.row}
                      >
                        <View style={[styles.box, when ? styles.boxOn : null]}>
                          {when ? <Text style={styles.tick}>✓</Text> : null}
                        </View>
                        <View style={styles.flex}>
                          <Text style={[styles.rowText, when ? styles.rowDone : null]}>{item.text}</Text>
                          <Text style={styles.rowMeta}>
                            {domainInfo[item.domain].emoji} {domainInfo[item.domain].label}
                            {when ? ` · Noted ${noted(when)}` : ''}
                          </Text>
                          {!when && (isCurrent || isNext) ? <Text style={styles.rowTip}>Try: {item.tip}</Text> : null}
                          {when ? (
                            <Pressable
                              accessibilityRole="button"
                              hitSlop={8}
                              onPress={() =>
                                router.push({
                                  pathname: '/memory-new',
                                  params: { kind: 'milestone', refId: item.id, title: item.text },
                                })
                              }
                            >
                              <Text style={styles.memoryLink}>📸 Save as a memory</Text>
                            </Pressable>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
              </View>
            );
          })}

          <Text style={styles.disclaimer}>{milestoneSource}</Text>
          <Text style={styles.disclaimer}>{milestoneAdvice}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  column: { width: '100%', maxWidth: 480 },
  flex: { flex: 1 },
  memoryLink: { marginTop: 4, fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.butter },
  backText: { fontFamily: 'Nunito_600SemiBold', color: colors.mist, fontSize: 15, marginBottom: spacing.sm },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 34, color: colors.foam },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(247,243,234,0.75)',
    marginBottom: spacing.md,
  },
  setup: {
    alignSelf: 'flex-start',
    backgroundColor: colors.butter,
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  setupText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.ink },
  summary: {
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: spacing.sm },
  summaryBig: { fontFamily: 'Fraunces_700Bold', fontSize: 28, color: colors.foam },
  summaryLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: colors.mist },
  summaryHint: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.mist },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.butter },
  chipRow: { gap: spacing.sm, paddingBottom: spacing.md },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipOn: { backgroundColor: colors.butter, borderColor: colors.butter },
  chipText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: colors.foam },
  chipTextOn: { color: colors.ink },
  nudge: {
    gap: 4,
    backgroundColor: 'rgba(232,162,154,0.16)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(232,162,154,0.45)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  nudgeTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam },
  nudgeBody: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 19, color: colors.mist },
  band: {
    marginBottom: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  bandCurrent: { borderColor: colors.butter, backgroundColor: 'rgba(230,201,106,0.12)' },
  bandHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  bandTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: colors.foam },
  bandStatus: { fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: colors.butter },
  bandCount: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.mist },
  chevron: { fontSize: 16, color: colors.mist, width: 16, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 10 },
  box: {
    width: 26,
    height: 26,
    marginTop: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.butter },
  tick: { fontFamily: 'Nunito_700Bold', fontSize: 16, lineHeight: 20, color: colors.ink },
  rowText: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, lineHeight: 21, color: colors.foam },
  rowDone: { color: colors.mist, textDecorationLine: 'line-through' },
  rowMeta: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: colors.mist, marginTop: 2 },
  rowTip: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 18, color: 'rgba(247,243,234,0.7)', marginTop: 4 },
  disclaimer: {
    marginTop: spacing.sm,
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(247,243,234,0.55)',
  },
});
