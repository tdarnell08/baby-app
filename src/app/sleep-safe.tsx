import { PediatricianCard, SLEEP_GRADIENT } from '@/components/SleepHelpBits';
import { BulletItem, SourceList } from '@/components/Sources';
import { Body, Panel, Screen, Section, Title } from '@/components/ui';
import { sleepHelpDisclaimer, sleepSafeBasics } from '@/data/sleepHelp';

const SOURCES = ['aapSafeSleep', 'aap2022', 'aapSids', 'aapBackSleep', 'aapApnea', 'aapSleepHabits', 'aapGettingToSleep', 'aapToddlerSleep', 'chopSleep'];

export default function SleepSafeScreen() {
  return (
    <Screen gradient={SLEEP_GRADIENT} backTo="/sleep-help" back="← Sleep help">
      <Title sub="Safe sleep comes first, whatever else you try.">Safe sleep</Title>
      <Panel>
        {sleepSafeBasics.map((b) => (
          <BulletItem key={b.text} text={b.text} src={b.src} />
        ))}
      </Panel>

      <Section>Red flags</Section>
      <PediatricianCard />

      <Section>Sources</Section>
      <Panel>
        <SourceList ids={SOURCES} />
      </Panel>
      <Body tone="muted">{sleepHelpDisclaimer}</Body>
    </Screen>
  );
}
