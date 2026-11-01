import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { Body, Btn, Chip, Notice, Panel, Screen, Section, Title, uiStyles } from '@/components/ui';
import { PlusLock } from '@/components/PlusLock';
import { colors, radii, spacing } from '@/constants/theme';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useSleepLog } from '@/hooks/useSleepLog';
import { useNow } from '@/lib/time';
import { ensureNotificationPermission, remindersSupported } from '@/lib/reminders';
import {
  ageGuide,
  clock,
  dayKey,
  daySummaries,
  formatDuration,
  formatMinutes,
  formatWakeRange,
  lastWakeTime,
  openSession,
  predictNext,
  sessionDurationMs,
  sortedSessions,
  todaySegments,
  weekSummaries,
} from '@/lib/sleepCoach';
import { LEAD_OPTIONS } from '@/lib/sleepStore';

const HOUR = 60 * 60 * 1000;
const AGO = [0, 5, 15, 30];

export default function CoachScreen() {
  const router = useRouter();
  const { ageMonths, ageLabel, isPremium, profile } = useBabyProfile();
  const { sessions, prefs, start, stop, remove, setPrefs } = useSleepLog();
  const now = useNow(20000);
  const [ago, setAgo] = useState(0);
  const [note, setNote] = useState<string | null>(null);

  const open = openSession(sessions);
  const guide = ageGuide(ageMonths);
  const todayKey = dayKey(now);
  const todays = useMemo(
    () => sortedSessions(sessions).filter((s) => dayKey(s.start) === todayKey || (s.end !== null && dayKey(s.end) === todayKey)),
    [sessions, todayKey],
  );
  const days = useMemo(() => daySummaries(sessions, 7, now), [sessions, now]);
  const today = days[days.length - 1];
  const weeks = useMemo(() => weekSummaries(sessions, 4, now), [sessions, now]);
  const segments = useMemo(() => todaySegments(sessions, now), [sessions, now]);
  const prediction = useMemo(() => (isPremium ? predictNext(sessions, ageMonths, now) : null), [isPremium, sessions, ageMonths, now]);
  const awakeSince = open ? null : lastWakeTime(sessions);
  const who = profile.name.trim() || 'Baby';

  const toggleRemind = async (value: boolean) => {
    setNote(null);
    if (!value) {
      setPrefs({ remind: false });
      return;
    }
    if (!remindersSupported) {
      setNote('Reminders work in the iPhone app. This browser preview cannot schedule them.');
      return;
    }
    const ok = await ensureNotificationPermission();
    if (!ok) {
      setNote('Notifications are off for Lulla. Turn them on in your phone settings, then try again.');
      return;
    }
    setPrefs({ remind: true });
  };

  const maxHours = Math.max(14, ...days.map((d) => d.totalMs / HOUR));

  return (
    <Screen gradient={['#142238', '#1B3350', '#244A5E']}>
      <Title sub={`${ageLabel}. Log sleep with one tap and see when the next window opens.`}>Sleep coach</Title>

      <Panel>
        {open ? (
          <>
            <Text style={styles.stateTitle}>{who} is asleep</Text>
            <Text style={styles.big}>{formatDuration(sessionDurationMs(open, now))}</Text>
            <Body tone="muted">
              {open.kind === 'night' ? 'Night sleep' : 'Nap'} since {clock(open.start)}
            </Body>
            <Btn label="Baby woke up" onPress={() => { stop(ago); setAgo(0); }} />
            <Text style={styles.small}>Woke up earlier? Choose when, then tap the button.</Text>
            <View style={uiStyles.wrap}>
              {AGO.map((m) => (
                <Chip key={m} label={m === 0 ? 'Just now' : `${m} min ago`} selected={ago === m} onPress={() => setAgo(m)} />
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.stateTitle}>{awakeSince ? `Awake for ${formatDuration(now - awakeSince)}` : `Ready when ${who} is`}</Text>
            <View style={uiStyles.row}>
              <Btn label="Start nap" onPress={() => { start('nap', ago); setAgo(0); }} style={uiStyles.flex} />
              <Btn label="Start night sleep" kind="secondary" onPress={() => { start('night', ago); setAgo(0); }} style={uiStyles.flex} />
            </View>
            <Text style={styles.small}>Already asleep a while? Choose when they dozed off first.</Text>
            <View style={uiStyles.wrap}>
              {AGO.map((m) => (
                <Chip key={m} label={m === 0 ? 'Just now' : `${m} min ago`} selected={ago === m} onPress={() => setAgo(m)} />
              ))}
            </View>
          </>
        )}
      </Panel>

      <Section>Today</Section>
      <Panel>
        <View style={uiStyles.between}>
          <Stat label="Sleep so far" value={formatDuration(today.totalMs)} />
          <Stat label="Naps" value={`${today.naps}`} />
          <Stat label="Typical total" value={guide.total.replace(' a day', '')} small />
        </View>
        <View style={styles.strip} accessibilityLabel="Today's sleep timeline">
          {segments.map((s) => (
            <View
              key={`${s.from}-${s.kind}`}
              style={[
                styles.segment,
                { left: `${s.startFrac * 100}%`, width: `${s.widthFrac * 100}%` },
                s.kind === 'night' ? styles.segNight : styles.segNap,
              ]}
            />
          ))}
        </View>
        <View style={uiStyles.between}>
          <Text style={styles.tick}>12 AM</Text>
          <Text style={styles.tick}>6 AM</Text>
          <Text style={styles.tick}>12 PM</Text>
          <Text style={styles.tick}>6 PM</Text>
          <Text style={styles.tick}>12 AM</Text>
        </View>
        {todays.length === 0 ? (
          <Body tone="muted">Nothing logged today yet. Tap Start nap or Start night sleep above.</Body>
        ) : (
          todays
            .slice()
            .reverse()
            .map((s) => (
              <View key={s.id} style={styles.logRow}>
                <View style={uiStyles.flex}>
                  <Text style={styles.logTitle}>{s.kind === 'night' ? 'Night sleep' : 'Nap'}</Text>
                  <Text style={styles.logSub}>
                    {clock(s.start)} to {s.end ? clock(s.end) : 'now'} · {formatDuration(sessionDurationMs(s, now))}
                  </Text>
                </View>
                <Btn label="Delete" kind="ghost" small onPress={() => remove(s.id)} />
              </View>
            ))
        )}
      </Panel>

      <Section>Typical for {ageLabel}</Section>
      <Panel>
        <Text style={styles.stateTitle}>Awake time between sleeps: {formatWakeRange(guide)}</Text>
        <Body>Naps: {guide.naps}.</Body>
        <Body>Total sleep: {guide.total}.</Body>
        <Body tone="muted">
          These are common ranges, and every baby is different. Total sleep ranges are from the {guide.source === 'AASM' ? 'American Academy of Sleep Medicine consensus (Paruthi 2016)' : 'National Sleep Foundation (Hirshkowitz 2015)'}. Awake-time ranges are widely used coaching guidance, not a rule.
        </Body>
      </Panel>

      <Section>Next sleep window</Section>
      {isPremium ? (
        <Panel>
          {open ? (
            <Body>{who} is asleep now. A new prediction appears when you tap “Baby woke up”.</Body>
          ) : prediction ? (
            <>
              <Text style={styles.big}>
                {clock(prediction.opensAt)} to {clock(prediction.closesAt)}
              </Text>
              <Text style={styles.stateTitle}>{prediction.kind === 'night' ? 'Bedtime window' : 'Nap window'}</Text>
              <Body>
                {prediction.basis === 'pattern'
                  ? `Based on ${who === 'Baby' ? 'your baby' : who}’s last ${prediction.samples} logged ${prediction.kind === 'night' ? 'bedtimes' : 'wake-ups before naps'}${prediction.kind === 'night' ? '' : ` (usually awake about ${formatMinutes(prediction.wakeMinutes)})`}.`
                  : `Based on typical awake time for ${ageLabel}. It gets more personal after a few days of logging.`}
              </Body>
              {now > prediction.closesAt ? (
                <Body tone="warn">The window has passed. Watch for sleepy cues and start whenever {who} seems ready.</Body>
              ) : now >= prediction.opensAt ? (
                <Body tone="good">The window is open now. Look for yawning, staring, or fussing.</Body>
              ) : (
                <Body tone="muted">Opens in {formatDuration(prediction.opensAt - now)}.</Body>
              )}
            </>
          ) : (
            <Body>Log a few sleeps and we’ll predict the next window. Once there is a wake-up logged, it shows here.</Body>
          )}
          <View style={styles.switchRow}>
            <View style={uiStyles.flex}>
              <Text style={styles.logTitle}>Remind me before the window</Text>
              <Text style={styles.logSub}>
                A notification on this phone. Nothing leaves your device.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Remind me before the window"
              value={prefs.remind}
              onValueChange={toggleRemind}
              trackColor={{ true: colors.butter, false: 'rgba(255,255,255,0.2)' }}
            />
          </View>
          {prefs.remind ? (
            <View style={uiStyles.wrap}>
              {LEAD_OPTIONS.map((m) => (
                <Chip key={m} label={`${m} min before`} selected={prefs.leadMinutes === m} onPress={() => setPrefs({ leadMinutes: m })} />
              ))}
            </View>
          ) : null}
          {note ? <Body tone="warn">{note}</Body> : null}
          {Platform.OS === 'web' ? <Body tone="muted">Reminders are available in the iPhone app.</Body> : null}
        </Panel>
      ) : (
        <PlusLock
          title="Predicted next sleep window"
          body="See when the next nap or bedtime window opens, learned from your baby’s own recent patterns, with a notification before it starts."
        />
      )}

      <Section>Sleep history</Section>
      {isPremium ? (
        <Panel>
          <Text style={styles.stateTitle}>Last 7 days</Text>
          <View style={styles.chart} accessibilityLabel="Daily sleep chart">
            {days.map((d) => (
              <View key={d.key} style={styles.col}>
                <Text style={styles.colValue}>{d.totalMs > 0 ? (d.totalMs / HOUR).toFixed(1) : '–'}</Text>
                <View style={styles.colTrack}>
                  <View style={[styles.barNight, { height: `${(d.nightMs / HOUR / maxHours) * 100}%` }]} />
                  <View style={[styles.barNap, { height: `${(d.napMs / HOUR / maxHours) * 100}%` }]} />
                </View>
                <Text style={styles.colLabel}>{new Date(d.start).toLocaleDateString(undefined, { weekday: 'narrow' })}</Text>
              </View>
            ))}
          </View>
          <View style={uiStyles.row}>
            <Legend color={colors.butter} label="Naps" />
            <Legend color="#7FA6C9" label="Night" />
            <Text style={styles.tick}>hours per day</Text>
          </View>

          <Text style={[styles.stateTitle, { marginTop: spacing.sm }]}>Weekly average</Text>
          {weeks
            .slice()
            .reverse()
            .map((w) => (
              <View key={w.label} style={styles.weekRow}>
                <Text style={styles.weekLabel}>Week of {w.label}</Text>
                <View style={styles.weekTrack}>
                  <View style={[styles.weekFill, { width: `${Math.min(100, (w.avgTotalMs / HOUR / 17) * 100)}%` }]} />
                </View>
                <Text style={styles.weekValue}>{w.daysLogged ? `${(w.avgTotalMs / HOUR).toFixed(1)} h` : '–'}</Text>
              </View>
            ))}
          <Body tone="muted">Average sleep per logged day, including naps. Compare with {guide.total}.</Body>
        </Panel>
      ) : (
        <PlusLock
          title="Daily and weekly sleep charts"
          body="See naps and night sleep side by side for the last 7 days, plus weekly averages, so you can spot patterns and share them with your pediatrician."
        />
      )}

      <Notice tone="info" title="Safe sleep first">
        Always place babies on their back, on a firm, flat sleep surface with nothing else in the crib. Sleep sounds should stay quiet and across the room. Lulla is not medical advice. Talk to your pediatrician about sleep concerns.
      </Notice>
      <Btn label="Open sleep sounds" kind="secondary" onPress={() => router.push('/sleep')} />
    </Screen>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, small && styles.statValueSmall]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={uiStyles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.tick}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stateTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: colors.foam },
  big: { fontFamily: 'Fraunces_700Bold', fontSize: 32, color: colors.butter },
  small: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.mist },
  stat: { flex: 1, gap: 2 },
  statValue: { fontFamily: 'Fraunces_700Bold', fontSize: 24, color: colors.foam },
  statValueSmall: { fontSize: 15, lineHeight: 28 },
  statLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: colors.mist },
  strip: {
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  segment: { position: 'absolute', top: 0, bottom: 0, borderRadius: 6 },
  segNap: { backgroundColor: colors.butter },
  segNight: { backgroundColor: '#7FA6C9' },
  tick: { fontFamily: 'Nunito_600SemiBold', fontSize: 11, color: 'rgba(215,230,225,0.75)' },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: spacing.sm },
  logTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam },
  logSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.mist },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: spacing.sm },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 170 },
  col: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  colValue: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: colors.mist },
  colTrack: { width: '100%', flex: 1, justifyContent: 'flex-end', borderRadius: radii.sm / 2, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  barNap: { backgroundColor: colors.butter, width: '100%' },
  barNight: { backgroundColor: '#7FA6C9', width: '100%' },
  colLabel: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: colors.foam },
  dot: { width: 10, height: 10, borderRadius: 5 },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  weekLabel: { width: 108, fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: colors.mist },
  weekTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  weekFill: { height: '100%', backgroundColor: colors.sage, borderRadius: 5 },
  weekValue: { width: 52, textAlign: 'right', fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.foam },
});
