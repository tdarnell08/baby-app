import { useState } from 'react';
import { View } from 'react-native';
import { BulletItem, SourceList } from '@/components/Sources';
import { Body, Chip, Notice, Panel, Screen, Section, Title, uiStyles } from '@/components/ui';
import { ageBands, bandForMonths, comfortDisclaimer, sources, tipsForAge, type AgeBand } from '@/data/sickGuide';
import { useBabyProfile } from '@/hooks/useBabyProfile';

const GRADIENT: [string, string, string] = ['#2B2437', '#3B3150', '#4A3D63'];
const BAND_MONTHS: Record<AgeBand, number> = { under3: 1, m3to6: 4, m6to12: 8, over12: 18 };

export default function ComfortScreen() {
  const { ageMonths, ageLabel } = useBabyProfile();
  const [picked, setPicked] = useState<AgeBand | null>(null);
  const band = picked ?? bandForMonths(ageMonths);
  const groups = tipsForAge(picked === null ? ageMonths : BAND_MONTHS[band]);
  const used = new Set<string>();
  groups.forEach((g) => g.tips.forEach((t) => t.src.forEach((s) => used.add(s))));

  return (
    <Screen gradient={GRADIENT} back="← Sick Day" backTo="/sick">
      <Title sub="Simple ways to help a sick baby feel better, from public health guidance.">Comfort tips</Title>

      <Notice tone="info" title="Check with your doctor">
        {comfortDisclaimer}
      </Notice>

      <Section>Age</Section>
      <Panel>
        <View style={uiStyles.wrap}>
          {ageBands.map((b) => (
            <Chip key={b.id} label={b.label} selected={band === b.id} onPress={() => setPicked(b.id)} />
          ))}
        </View>
        <Body tone="muted">{picked === null && ageLabel ? `Tips for your baby’s age (${ageLabel}). Tap another to compare.` : 'Tips are filtered by age.'}</Body>
      </Panel>

      {groups.map((g) => (
        <View key={g.title} style={{ gap: 10 }}>
          <Section>{g.title}</Section>
          <Panel>
            {g.tips.map((t) => (
              <BulletItem key={t.text} text={t.text} src={t.src} />
            ))}
          </Panel>
        </View>
      ))}

      <Section>Sources</Section>
      <Panel>
        <SourceList ids={Object.keys(sources).filter((id) => used.has(id))} />
      </Panel>

      <Notice tone="warn" title="Know the red flags">
        Comfort measures do not replace medical care. Trouble breathing, signs of dehydration, hard to wake, or a young baby with a fever need a call or 911. See “When to call the doctor.”
      </Notice>
    </Screen>
  );
}
