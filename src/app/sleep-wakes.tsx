import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PlusLock } from '@/components/PlusLock';
import { SafeSleepStrip, SLEEP_GRADIENT } from '@/components/SleepHelpBits';
import { Body, Btn, Chip, Notice, Panel, Screen, Section, Title, uiStyles } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { useSleepHelp } from '@/hooks/useSleepHelp';
import { useSleepLog } from '@/hooks/useSleepLog';
import { clock, formatDuration } from '@/lib/sleepCoach';
import { hourBuckets, nightKey, nightRows, peakBucket, wakeKinds, weekStats } from '@/lib/sleepHelpLogic';
import { useNow } from '@/lib/time';
import { usePremium } from '@/providers/PremiumProvider';

const AGO = [0, 15, 30, 60];
const kindLabel = (id: string) => wakeKinds.find((k) => k.id === id)?.label ?? id;

export default function SleepWakesScreen() {
  const router = useRouter();
  const now = useNow(30000);
  const { isPremium } = usePremium();
  const { wakes, logWake, removeWake } = useSleepHelp();
  const { sessions } = useSleepLog();
  const [ago, setAgo] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  const key = nightKey(now);
  const tonight = useMemo(() => wakes.filter((w) => nightKey(w.at) === key), [wakes, key]);
  const rows = useMemo(() => nightRows(wakes, sessions, 7, now), [wakes, sessions, now]);
  const buckets = useMemo(() => hourBuckets(wakes, 7, now), [wakes, now]);
  const stats = useMemo(() => weekStats(wakes, now), [wakes, now]);
  const peak = peakBucket(buckets);
  const maxCount = Math.max(3, ...rows.map((r) => r.count));
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));

  const log = (kind: (typeof wakeKinds)[number]['id']) => {
    logWake(kind, ago);
    setAgo(0);
    setFlash(`${kindLabel(kind)} logged`);
  };

  return (
    <Screen gradient={SLEEP_GRADIENT} backTo="/sleep-help" back="← Sleep help">
      <Title sub="One tap each time they wake. Nothing leaves your phone.">Night wake log</Title>

      <Panel>
        <View style={styles.grid}>
          {wakeKinds.map((k) => (
            <Btn key={k.id} label={k.label} kind={k.id === 'woke' ? 'primary' : 'secondary'} onPress={() => log(k.id)} style={styles.gridBtn} />
          ))}
        </View>
        <Text style={styles.small}>Happened earlier? Choose when, then tap.</Text>
        <View style={uiStyles.wrap}>
          {AGO.map((m) => (
            <Chip key={m} label={m === 0 ? 'Just now' : m < 60 ? `${m} min ago` : '1 h ago'} selected={ago === m} onPress={() => setAgo(m)} />
          ))}
        </View>
        {flash ? <Body tone="good">{flash}</Body> : null}
      </Panel>

      <Section>Tonight</Section>
      <Panel>
        <Text style={styles.big}>
          {tonight.length} {tonight.length === 1 ? 'wake' : 'wakes'}
        </Text>
        {tonight.length === 0 ? (
          <Body tone="muted">Nothing logged yet.</Body>
        ) : (
          tonight.map((w) => (
            <View key={w.id} style={styles.logRow}>
              <View style={uiStyles.flex}>
                <Text style={styles.logTitle}>{kindLabel(w.kind)}</Text>
                <Text style={styles.logSub}>{clock(w.at)}</Text>
              </View>
              <Btn label="Delete" kind="ghost" small onPress={() => removeWake(w.id)} />
            </View>
          ))
        )}
      </Panel>

      <Section>This week</Section>
      {isPremium ? (
        <Panel>
          {wakes.length === 0 ? (
            <Body>Log a few nights and your pattern shows up here.</Body>
          ) : (
            <>
              <View style={styles.chart} accessibilityLabel="Night wakes per night">
                {rows.map((r) => (
                  <View key={r.key} style={styles.col}>
                    <Text style={styles.colValue}>{r.count}</Text>
                    <View style={styles.colTrack}>
                      <View style={[styles.bar, { height: `${(r.count / maxCount) * 100}%` }]} />
                    </View>
                    <Text style={styles.colLabel}>{new Date(r.from).toLocaleDateString(undefined, { weekday: 'narrow' })}</Text>
                    <Text style={styles.colSleep}>{r.nightSleepMs > 0 ? `${(r.nightSleepMs / 3600000).toFixed(1)}h` : '–'}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.small}>Wakes per night (bars). Night sleep from your Sleep coach log (below).</Text>

              <Text style={styles.logTitle}>
                Average {stats.avgPerNight.toFixed(1)} a night
                {stats.prevAvg !== null ? `, last week ${stats.prevAvg.toFixed(1)}` : ''}
              </Text>
              {stats.prevAvg !== null && stats.avgPerNight < stats.prevAvg - 0.4 ? <Body tone="good">Fewer wakes than last week.</Body> : null}
              {stats.prevAvg !== null && stats.avgPerNight > stats.prevAvg + 0.4 ? (
                <Body>More wakes than last week. Rough patches pass. Check Rule out first.</Body>
              ) : null}

              <Text style={[styles.logTitle, { marginTop: spacing.sm }]}>When it happens</Text>
              {buckets.map((b) => (
                <View key={b.label} style={styles.hourRow}>
                  <Text style={styles.hourLabel}>{b.label}</Text>
                  <View style={styles.hourTrack}>
                    <View style={[styles.hourFill, { width: `${(b.count / maxBucket) * 100}%` }]} />
                  </View>
                  <Text style={styles.hourCount}>{b.count}</Text>
                </View>
              ))}
              {peak ? <Body tone="good">Most wakes: {peak.label}.</Body> : <Body tone="muted">No clear time yet. A few more nights will show one.</Body>}
              <Body tone="muted">
                {rows[rows.length - 1].nightSleepMs > 0
                  ? `Coach logged ${formatDuration(rows[rows.length - 1].nightSleepMs)} of night sleep for this night so far.`
                  : 'Log night sleep in Sleep coach to see it next to your wakes.'}
              </Body>
              <Btn label="Open Sleep coach" kind="secondary" small onPress={() => router.push('/coach')} />
            </>
          )}
        </Panel>
      ) : (
        <PlusLock
          title="Weekly night-wake patterns"
          body="See wakes per night, the hours they cluster in, and how this week compares with last, next to your Sleep coach totals."
        />
      )}

      <Notice tone="info" title="Just for you">
        A pattern is a conversation starter, not a diagnosis. Bring it to your pediatrician if you’re worried.
      </Notice>
      <SafeSleepStrip />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  gridBtn: { flexBasis: '47%', flexGrow: 1 },
  small: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.mist },
  big: { fontFamily: 'Fraunces_700Bold', fontSize: 30, color: colors.butter },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: spacing.sm },
  logTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam },
  logSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.mist },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 170 },
  col: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  colValue: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: colors.foam },
  colTrack: { width: '100%', flex: 1, justifyContent: 'flex-end', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  bar: { width: '100%', backgroundColor: colors.butter },
  colLabel: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: colors.foam },
  colSleep: { fontFamily: 'Nunito_600SemiBold', fontSize: 10, color: colors.mist },
  hourRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hourLabel: { width: 96, fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: colors.mist },
  hourTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  hourFill: { height: '100%', backgroundColor: '#7FA6C9', borderRadius: 5 },
  hourCount: { width: 24, textAlign: 'right', fontFamily: 'Nunito_700Bold', fontSize: 12, color: colors.foam },
});
