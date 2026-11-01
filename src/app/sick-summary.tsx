import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, Share, Text, View } from 'react-native';
import { Body, Btn, Chip, Notice, Panel, Screen, Section, Title, uiStyles } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useCourses } from '@/hooks/useCourses';
import { useIllness } from '@/hooks/useIllness';
import { useSleepLog } from '@/hooks/useSleepLog';
import { summaryHtml, summaryText } from '@/lib/illnessExport';
import { whenLabel } from '@/lib/illnessLogic';
import { exportHtmlAsPdf } from '@/lib/pdf';
import { nowMs } from '@/lib/time';

const GRADIENT: [string, string, string] = ['#2B2437', '#3B3150', '#4A3D63'];

export default function DoctorSummaryScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { profile, ageLabel } = useBabyProfile();
  const ill = useIllness();
  const { courses } = useCourses();
  const { sessions } = useSleepLog();
  const [pickedId, setPickedId] = useState<string | null>(typeof params.id === 'string' ? params.id : null);
  const [message, setMessage] = useState<string | null>(null);

  const episode = ill.episodes.find((e) => e.id === pickedId) ?? ill.current ?? ill.episodes[0] ?? null;
  const opts = () => ({
    babyName: profile.name.trim(),
    ageLabel,
    unit: ill.unit,
    courses,
    sleep: sessions.map((s) => ({ start: s.start, end: s.end })),
    now: nowMs(),
  });
  const preview = episode ? summaryText(episode, opts()) : '';

  const share = async () => {
    if (!episode) return;
    const text = summaryText(episode, opts());
    if (Platform.OS === 'web') {
      setMessage('The summary is shown below. Select and copy it to share.');
      return;
    }
    try {
      await Share.share({ message: text, title: `${episode.title} record` });
      setMessage(null);
    } catch {
      setMessage('Sharing was cancelled. The summary is shown below.');
    }
  };

  const pdf = async () => {
    if (!episode) return;
    const result = await exportHtmlAsPdf(summaryHtml(episode, opts()), `${episode.title} record`);
    setMessage(result.ok ? null : (result.message ?? null));
  };

  return (
    <Screen gradient={GRADIENT} back="← Sick Day" backTo="/sick">
      <Title sub="Temperatures, medicines given, fluids, diapers, sleep, and notes in one place to show your doctor.">Doctor summary</Title>

      {!ill.ready ? <Body>Loading…</Body> : null}

      {ill.ready && !episode ? (
        <Panel>
          <Body>There is no illness log yet. Start a symptom log, add temperatures and notes, and the summary will be ready here.</Body>
          <Btn label="Open the symptom log" onPress={() => router.push('/sick-symptoms')} />
        </Panel>
      ) : null}

      {episode ? (
        <>
          {ill.episodes.length > 1 ? (
            <>
              <Section>Which illness</Section>
              <Panel>
                <View style={uiStyles.wrap}>
                  {ill.episodes.map((e) => (
                    <Chip key={e.id} label={`${e.title}, ${whenLabel(e.startedAt)}`} selected={e.id === episode.id} onPress={() => setPickedId(e.id)} />
                  ))}
                </View>
              </Panel>
            </>
          ) : null}

          <Panel>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 21, color: colors.foam }}>{episode.title}</Text>
            <Body>One tap to send it to your doctor, partner, or caregiver. Medicines come from your Medicine log for the same dates.</Body>
            <View style={uiStyles.row}>
              <Btn label="Share as text" onPress={share} style={uiStyles.flex} />
              <Btn label="Save as PDF" kind="secondary" onPress={pdf} style={uiStyles.flex} />
            </View>
            {message ? <Body tone="warn">{message}</Body> : null}
            <Body tone="muted">The summary is created on this phone and goes only where you choose to send it.</Body>
          </Panel>

          <Section>Preview</Section>
          <Panel>
            <Text selectable style={{ fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 11, lineHeight: 16, color: colors.mist }}>
              {preview}
            </Text>
          </Panel>
        </>
      ) : null}

      <Notice tone="info" title="A parent-kept record">
        The summary shows what you entered. It is not a diagnosis, and Lulla does not calculate or check doses.
      </Notice>
    </Screen>
  );
}
