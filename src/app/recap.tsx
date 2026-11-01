import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Body, Btn, Notice, Panel, Screen, Section, Title, uiStyles } from '@/components/ui';
import { PlusLock } from '@/components/PlusLock';
import { colors, radii, spacing } from '@/constants/theme';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useMemories } from '@/hooks/useMemories';
import { buildKeepsakeHtml, inScope, milestonesInScope, monthName, type KeepsakeScope } from '@/lib/keepsake';
import { mediaUri } from '@/lib/media';
import { exportHtmlAsPdf } from '@/lib/pdf';
import { daySummaries, formatDuration } from '@/lib/sleepCoach';
import { loadSleep } from '@/lib/sleepStore';
import { nowMs } from '@/lib/time';
import type { SleepSession } from '@/lib/sleepCoach';

function prettyDate(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function RecapScreen() {
  const router = useRouter();
  const { profile, isPremium, ageLabel } = useBabyProfile();
  const { memories, ready } = useMemories();
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() + 1 });
  const [sleep, setSleep] = useState<SleepSession[]>([]);
  const [busy, setBusy] = useState<'month' | 'year' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadSleep().then((s) => alive && setSleep(s));
    return () => {
      alive = false;
    };
  }, []);

  const scope: KeepsakeScope = { kind: 'month', year: cursor.year, month: cursor.month };
  const mine = useMemo(() => memories.filter((m) => inScope(m.date, scope)), [memories, cursor.year, cursor.month]); // eslint-disable-line react-hooks/exhaustive-deps
  const wins = useMemo(() => milestonesInScope(profile.achieved, scope), [profile.achieved, cursor.year, cursor.month]); // eslint-disable-line react-hooks/exhaustive-deps
  const photos = mine.flatMap((m) => m.photos);
  const words = mine.filter((m) => m.kind === 'word');
  const isCurrent = cursor.year === today.getFullYear() && cursor.month === today.getMonth() + 1;
  const who = profile.name.trim();

  const sleepStats = useMemo(() => {
    const first = new Date(cursor.year, cursor.month - 1, 1).getTime();
    const last = new Date(cursor.year, cursor.month, 0).getTime();
    const summaries = daySummaries(sleep, 90, nowMs()).filter((d) => d.start >= first && d.start <= last && d.totalMs > 0);
    if (summaries.length < 3) return null;
    return {
      avg: summaries.reduce((sum, d) => sum + d.totalMs, 0) / summaries.length,
      days: summaries.length,
    };
  }, [sleep, cursor.year, cursor.month]);

  const move = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.year, c.month - 1 + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });

  const exportPdf = async (kind: 'month' | 'year') => {
    setBusy(kind);
    setMessage(null);
    const exportScope: KeepsakeScope = kind === 'month' ? scope : { kind: 'year', year: cursor.year };
    const { html, skippedPhotos } = await buildKeepsakeHtml({ scope: exportScope, memories, achieved: profile.achieved, babyName: profile.name });
    const result = await exportHtmlAsPdf(html, kind === 'month' ? `${monthName(cursor.year, cursor.month)} keepsake` : `${cursor.year} keepsake`);
    setBusy(null);
    if (!result.ok) setMessage(result.message ?? null);
    else if (skippedPhotos > 0) setMessage(`Your PDF includes the first 48 photos. ${skippedPhotos} more were left out to keep the file a reasonable size. Try a single month to include them all.`);
  };

  return (
    <Screen gradient={['#3A2A3F', '#4B3452', '#5F4560']} back="← Memory book" backTo="/memories">
      <Title sub={`${who ? `${who}, ` : ''}${ageLabel}`}>Monthly recap</Title>

      {!isPremium ? (
        <PlusLock
          title="Monthly recap and keepsake PDFs"
          body="See each month at a glance, with milestones, first words, photos, and sleep, then export a month or the whole year as a PDF keepsake for family."
        />
      ) : null}

      <View style={uiStyles.between}>
        <Btn label="‹" kind="secondary" small onPress={() => move(-1)} accessibilityLabel="Previous month" />
        <Text style={styles.monthTitle}>{monthName(cursor.year, cursor.month)}</Text>
        <Btn label="›" kind="secondary" small onPress={() => move(1)} disabled={isCurrent} accessibilityLabel="Next month" />
      </View>

      {isPremium ? (
        <>
          <View style={uiStyles.row}>
            <Tile label="Memories" value={mine.length} />
            <Tile label="Milestones" value={wins.length} />
            <Tile label="First words" value={words.length} />
          </View>

          {sleepStats ? (
            <Panel>
              <Text style={styles.big}>{formatDuration(sleepStats.avg)}</Text>
              <Body>average sleep per day, over {sleepStats.days} logged days this month.</Body>
            </Panel>
          ) : null}

          {photos.length > 0 ? (
            <>
              <Section>Photos</Section>
              <View style={styles.mosaic}>
                {photos.slice(0, 9).map((p) => (
                  <Image key={p.slice(-24)} source={{ uri: mediaUri(p) }} style={styles.mosaicPhoto} accessibilityLabel="Photo from this month" />
                ))}
              </View>
            </>
          ) : null}

          {wins.length > 0 ? (
            <>
              <Section>Milestones reached</Section>
              <Panel>
                {wins.map((w) => (
                  <Body key={`${w.date}-${w.text}`}>
                    🌟 {w.text} <Text style={styles.dim}>· {prettyDate(w.date)}</Text>
                  </Body>
                ))}
              </Panel>
            </>
          ) : null}

          {mine.length > 0 ? (
            <>
              <Section>Moments</Section>
              <Panel>
                {mine.map((m) => (
                  <Body key={m.id}>
                    {m.kind === 'word' ? '🗣️' : m.kind === 'milestone' ? '🌟' : '💛'} {m.title} <Text style={styles.dim}>· {prettyDate(m.date)}</Text>
                  </Body>
                ))}
              </Panel>
            </>
          ) : null}

          {ready && mine.length === 0 && wins.length === 0 ? (
            <Panel>
              <Body>Nothing saved for {monthName(cursor.year, cursor.month)} yet.</Body>
              <Btn label="Add a moment" kind="secondary" small onPress={() => router.push({ pathname: '/memory-new', params: { kind: 'moment' } })} />
            </Panel>
          ) : null}

          <Section>Keepsake PDF</Section>
          <Panel>
            <Body>Made on your phone. Photos stay on the device until you choose where to send the PDF.</Body>
            <Btn label={busy === 'month' ? 'Making your PDF…' : `Export ${monthName(cursor.year, cursor.month)}`} onPress={() => exportPdf('month')} disabled={busy !== null} />
            <Btn label={busy === 'year' ? 'Making your PDF…' : `Export all of ${cursor.year}`} kind="secondary" onPress={() => exportPdf('year')} disabled={busy !== null} />
            {message ? <Body tone="warn">{message}</Body> : null}
          </Panel>
        </>
      ) : (
        <Notice tone="info">Your saved memories stay free to view in the Memory book.</Notice>
      )}
    </Screen>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  monthTitle: { fontFamily: 'Fraunces_700Bold', fontSize: 24, color: colors.foam },
  big: { fontFamily: 'Fraunces_700Bold', fontSize: 30, color: colors.butter },
  dim: { color: 'rgba(215,230,225,0.65)' },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: spacing.md,
  },
  tileValue: { fontFamily: 'Fraunces_700Bold', fontSize: 30, color: colors.butter },
  tileLabel: { fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: colors.mist },
  mosaic: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  mosaicPhoto: { width: '32%', aspectRatio: 1, borderRadius: radii.sm, backgroundColor: 'rgba(255,255,255,0.1)' },
});
