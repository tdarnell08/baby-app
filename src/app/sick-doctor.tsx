import { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { BulletItem, SourceList } from '@/components/Sources';
import { Body, Btn, Chip, Notice, Panel, Screen, Section, Title, uiStyles } from '@/components/ui';
import { colors } from '@/constants/theme';
import {
  ageBands,
  bandForMonths,
  emergencyTier,
  generalTips,
  nowByBand,
  redFlagDisclaimer,
  sources,
  type AgeBand,
  type FlagTier,
} from '@/data/sickGuide';
import { useBabyProfile } from '@/hooks/useBabyProfile';

const GRADIENT: [string, string, string] = ['#2B2437', '#3B3150', '#4A3D63'];

function Tier({ tier }: { tier: FlagTier }) {
  const danger = tier.tone === 'danger';
  return (
    <Panel style={{ borderColor: danger ? 'rgba(232,162,154,0.7)' : 'rgba(230,201,106,0.5)', borderWidth: 1 }}>
      <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 22, color: danger ? colors.blush : colors.butter }}>{tier.title}</Text>
      <Body>{tier.action}</Body>
      {tier.items.map((item) => (
        <BulletItem key={item.text} text={item.text} src={item.src} />
      ))}
    </Panel>
  );
}

export default function DoctorFlagsScreen() {
  const { ageMonths, ageLabel } = useBabyProfile();
  const [picked, setPicked] = useState<AgeBand | null>(null);
  const band = picked ?? bandForMonths(ageMonths);
  const bandLabel = ageBands.find((b) => b.id === band)?.label ?? '';

  const used = new Set<string>();
  [emergencyTier, nowByBand[band], { items: generalTips }].forEach((t) => t.items.forEach((i) => i.src.forEach((s) => used.add(s))));

  return (
    <Screen gradient={GRADIENT} back="← Sick Day" backTo="/sick">
      <Title sub="Warning signs from the AAP, CDC, and NHS, shown for your baby’s age.">When to call the doctor</Title>

      <Notice tone="warn" title="Not a diagnosis">
        {redFlagDisclaimer}
      </Notice>

      <Section>Age</Section>
      <Panel>
        <View style={uiStyles.wrap}>
          {ageBands.map((b) => (
            <Chip key={b.id} label={b.label} selected={band === b.id} onPress={() => setPicked(b.id)} />
          ))}
        </View>
        <Body tone="muted">
          {picked === null
            ? ageLabel
              ? `Showing the group for your baby’s age (${ageLabel}). Tap another to compare.`
              : 'Set your baby’s age in the profile to open the right group automatically.'
            : `Showing ${bandLabel}.`}
        </Body>
      </Panel>

      <Tier tier={emergencyTier} />
      <Btn label="Call 911" kind="danger" onPress={() => Linking.openURL('tel:911').catch(() => {})} />

      <Tier tier={nowByBand[band]} />

      <Section>Also remember</Section>
      <Panel>
        {generalTips.map((t) => (
          <BulletItem key={t.text} text={t.text} src={t.src} />
        ))}
        <Btn label="Poison Control: 1-800-222-1222" kind="secondary" small onPress={() => Linking.openURL('tel:18002221222').catch(() => {})} />
      </Panel>

      <Section>Sources</Section>
      <Panel>
        <Body tone="muted">Tap a source to read the full guidance. Thresholds and wording are summarized and may differ slightly between organizations. If they differ, follow your pediatrician.</Body>
        <SourceList ids={Object.keys(sources).filter((id) => used.has(id))} />
      </Panel>

      <Notice tone="danger" title="When in doubt, call">
        Trust your instincts. A baby can be seriously ill without matching anything on this list. Call your pediatrician, a nurse line, or 911.
      </Notice>
    </Screen>
  );
}
