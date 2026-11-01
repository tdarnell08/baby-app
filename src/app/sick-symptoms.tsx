import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Body, Btn, Chip, Field, Notice, Panel, Screen, Section, Title, uiStyles } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useIllness } from '@/hooks/useIllness';
import {
  entryLabel,
  feverAdvice,
  fmtTemp,
  highestTemp,
  lastWetDiaper,
  latestTemp,
  tempMethods,
  toC,
  validTemp,
  wetDiapersLast24,
  whenLabel,
  type EntryKind,
  type TempMethod,
} from '@/lib/illnessLogic';
import { nowMs, useNow } from '@/lib/time';

const GRADIENT: [string, string, string] = ['#2B2437', '#3B3150', '#4A3D63'];

const titles = ['Fever', 'Cold', 'Cough', 'Tummy bug', 'Ear ache', 'Other'];

const kinds: { id: EntryKind; label: string }[] = [
  { id: 'temp', label: 'Temperature' },
  { id: 'fluids', label: 'Fluids' },
  { id: 'diapers', label: 'Diapers' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'behavior', label: 'Behavior' },
  { id: 'note', label: 'Note' },
];

const fluidChips = ['Drinking well', 'Drinking less than usual', 'Only sips', 'Refusing fluids', 'Vomited after drinking'];
const sleepChips = ['Slept well', 'Restless', 'Woke often', 'Hard to settle', 'Sleeping more than usual'];
const behaviorChips = ['Playful', 'Fussy', 'Very sleepy', 'Hard to wake', 'Not eating', 'Cough', 'Runny nose', 'Vomiting', 'Diarrhea', 'Rash', 'Pulling at ear', 'Fast breathing'];
const redChips = ['Hard to wake', 'Fast breathing', 'Rash'];
const agoOptions = [
  { label: 'Now', mins: 0 },
  { label: '30 min ago', mins: 30 },
  { label: '1 hour ago', mins: 60 },
  { label: '2 hours ago', mins: 120 },
  { label: '4 hours ago', mins: 240 },
];

export default function SymptomLogScreen() {
  const router = useRouter();
  const now = useNow();
  const { ageMonths, ageLabel } = useBabyProfile();
  const ill = useIllness();
  const [viewId, setViewId] = useState<string | null>(null);
  const [startTitle, setStartTitle] = useState('Fever');
  const [custom, setCustom] = useState('');
  const [kind, setKind] = useState<EntryKind>('temp');
  const [temp, setTemp] = useState('');
  const [method, setMethod] = useState<TempMethod>('rectal');
  const [chips, setChips] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [ago, setAgo] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const episode = ill.episodes.find((e) => e.id === viewId) ?? ill.current;
  const past = ill.episodes.filter((e) => e.id !== episode?.id);
  const unit = ill.unit;

  const resetForm = () => {
    setTemp('');
    setChips([]);
    setText('');
    setError(null);
  };

  const toggleChip = (label: string, single: boolean) =>
    setChips((prev) => (single ? (prev[0] === label ? [] : [label]) : prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]));

  const start = () => {
    const title = startTitle === 'Other' ? custom.trim() || 'Sick day' : startTitle;
    const id = ill.startEpisode(title);
    setViewId(id);
    setCustom('');
  };

  const save = () => {
    if (!episode) return;
    const at = nowMs() - ago * 60 * 1000;
    setError(null);
    if (kind === 'temp') {
      const value = Number(temp.replace(',', '.'));
      const c = toC(value, unit);
      if (!temp.trim() || !validTemp(c)) {
        setError(unit === 'F' ? 'Enter a temperature between 90 and 109°F, for example 100.4.' : 'Enter a temperature between 32 and 43°C, for example 38.0.');
        return;
      }
      ill.addEntry(episode.id, { kind, tempC: c, method, count: null, text: '', at });
    } else if (kind !== 'diapers') {
      const combined = [...chips, text.trim()].filter(Boolean).join(', ');
      if (!combined) {
        setError(kind === 'note' ? 'Write a note first.' : 'Pick an option or write a note first.');
        return;
      }
      ill.addEntry(episode.id, { kind, tempC: null, method: null, count: null, text: combined, at });
    }
    resetForm();
  };

  const addDiaper = (wet: boolean) => {
    if (!episode) return;
    ill.addEntry(episode.id, { kind: 'diapers', tempC: null, method: null, count: wet ? 1 : 0, text: chips.join(', '), at: nowMs() - ago * 60 * 1000 });
    resetForm();
  };

  const advice = episode && !episode.endedAt ? feverAdvice(episode, ageMonths, now) : null;
  const last = episode ? latestTemp(episode) : null;
  const high = episode ? highestTemp(episode) : null;
  const lastWet = episode ? lastWetDiaper(episode) : null;
  const showRed = kind === 'behavior' && chips.some((c) => redChips.includes(c));

  return (
    <Screen gradient={GRADIENT} back="← Sick Day" backTo="/sick">
      <Title sub="Record what you see, then share it with the doctor.">Symptom log</Title>

      {!ill.ready ? <Body>Loading…</Body> : null}

      {ill.ready && !ill.current ? (
        <Panel>
          <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: colors.foam }}>Start a new illness</Text>
          <Body tone="muted">One log per illness keeps temperatures, fluids, medicines, and notes together on a timeline.</Body>
          <View style={uiStyles.wrap}>
            {titles.map((t) => (
              <Chip key={t} label={t} selected={startTitle === t} onPress={() => setStartTitle(t)} />
            ))}
          </View>
          {startTitle === 'Other' ? <Field label="What is going on?" value={custom} onChangeText={setCustom} maxLength={40} placeholder="For example: sore throat" /> : null}
          <Btn label="Start symptom log" onPress={start} />
        </Panel>
      ) : null}

      {episode ? (
        <>
          <Panel>
            <View style={uiStyles.between}>
              <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: colors.foam }}>{episode.title}</Text>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 13, color: episode.endedAt ? colors.mist : colors.butter }}>
                {episode.endedAt ? 'Ended' : 'Ongoing'}
              </Text>
            </View>
            <Body tone="muted">
              {ageLabel ? `${ageLabel} old · ` : ''}started {whenLabel(episode.startedAt)}
              {episode.endedAt ? ` · ended ${whenLabel(episode.endedAt)}` : ''}
            </Body>
            <Body>
              {last && last.tempC !== null ? `Last temperature ${fmtTemp(last.tempC, unit)} (${whenLabel(last.at)}). ` : 'No temperature yet. '}
              {high && high.tempC !== null && high.id !== last?.id ? `Highest ${fmtTemp(high.tempC, unit)}. ` : ''}
            </Body>
            <Body>
              {wetDiapersLast24(episode, now)} wet diaper{wetDiapersLast24(episode, now) === 1 ? '' : 's'} logged in the last 24 hours
              {lastWet ? `, last at ${whenLabel(lastWet.at)}` : ''}.
            </Body>
          </Panel>

          {advice ? (
            <Notice tone={advice.level === 'now' ? 'danger' : 'warn'} title={advice.level === 'now' ? 'Call your pediatrician now' : 'Consider calling your pediatrician'}>
              {advice.message}
            </Notice>
          ) : null}

          {!episode.endedAt ? (
            <>
              <Section>Add to the log</Section>
              <Panel>
                <View style={uiStyles.wrap}>
                  {kinds.map((k) => (
                    <Chip
                      key={k.id}
                      label={k.label}
                      selected={kind === k.id}
                      onPress={() => {
                        setKind(k.id);
                        resetForm();
                      }}
                    />
                  ))}
                </View>

                {kind === 'temp' ? (
                  <>
                    <View style={uiStyles.wrap}>
                      <Chip label="°F" selected={unit === 'F'} onPress={() => { ill.setUnit('F'); setTemp(''); }} />
                      <Chip label="°C" selected={unit === 'C'} onPress={() => { ill.setUnit('C'); setTemp(''); }} />
                    </View>
                    <Field
                      label={`Temperature (°${unit})`}
                      value={temp}
                      onChangeText={setTemp}
                      keyboardType="decimal-pad"
                      placeholder={unit === 'F' ? 'For example 100.4' : 'For example 38.0'}
                      maxLength={5}
                    />
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.foam }}>How was it taken?</Text>
                    <View style={uiStyles.wrap}>
                      {tempMethods.map((m) => (
                        <Chip key={m.id} label={m.label} selected={method === m.id} onPress={() => setMethod(m.id)} />
                      ))}
                    </View>
                    <Body tone="muted">
                      Rectal is the most accurate for babies under 3 months (AAP). Underarm readings can be lower than the real temperature.
                    </Body>
                  </>
                ) : null}

                {kind === 'fluids' ? (
                  <ChipPick options={fluidChips} chips={chips} onToggle={(l) => toggleChip(l, true)} />
                ) : null}
                {kind === 'sleep' ? <ChipPick options={sleepChips} chips={chips} onToggle={(l) => toggleChip(l, true)} /> : null}
                {kind === 'behavior' ? <ChipPick options={behaviorChips} chips={chips} onToggle={(l) => toggleChip(l, false)} /> : null}

                {showRed ? (
                  <Notice tone="danger" title="Check the red flags">
                    Hard to wake, fast breathing, or a rash can be warning signs. Open “When to call the doctor,” and call your pediatrician or 911 if any apply.
                  </Notice>
                ) : null}

                {kind === 'diapers' ? (
                  <>
                    <Body tone="muted">Log each diaper as you change it. Fewer than 6 wet diapers a day in a baby can be a sign of dehydration (AAP).</Body>
                    <ChipPick options={['Loose or watery stool', 'Dark urine', 'Blood in stool']} chips={chips} onToggle={(l) => toggleChip(l, false)} />
                  </>
                ) : null}

                {kind !== 'temp' && kind !== 'diapers' ? (
                  <Field
                    label={kind === 'note' ? 'Note' : 'Details (optional)'}
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={140}
                    placeholder={kind === 'fluids' ? 'For example: 3 oz in 30 minutes' : kind === 'sleep' ? 'For example: nap 40 minutes' : 'Anything else you noticed'}
                  />
                ) : null}

                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.foam }}>When</Text>
                <View style={uiStyles.wrap}>
                  {agoOptions.map((o) => (
                    <Chip key={o.mins} label={o.label} selected={ago === o.mins} onPress={() => setAgo(o.mins)} />
                  ))}
                </View>

                {error ? <Body tone="warn">{error}</Body> : null}
                {kind === 'diapers' ? (
                  <View style={uiStyles.row}>
                    <Btn label="Wet diaper" onPress={() => addDiaper(true)} style={uiStyles.flex} />
                    <Btn label="Dry diaper" kind="secondary" onPress={() => addDiaper(false)} style={uiStyles.flex} />
                  </View>
                ) : (
                  <Btn label="Save entry" onPress={save} />
                )}
              </Panel>
            </>
          ) : null}

          <Section>Timeline</Section>
          <Panel>
            {episode.entries.length === 0 ? <Body tone="muted">Nothing logged yet.</Body> : null}
            {episode.entries.map((e) => (
              <View key={e.id} style={{ gap: 2, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 8 }}>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.mist }}>{whenLabel(e.at)}</Text>
                <Body>{entryLabel(e, unit)}</Body>
                <Btn label="Delete entry" kind="ghost" small onPress={() => ill.removeEntry(episode.id, e.id)} />
              </View>
            ))}
            <Body tone="muted">Medicines you log in the Medicine log appear in the doctor summary automatically.</Body>
          </Panel>

          <Panel>
            <Btn label="Doctor summary" onPress={() => router.push({ pathname: '/sick-summary', params: { id: episode.id } })} />
            <Btn label="When to call the doctor" kind="secondary" onPress={() => router.push('/sick-doctor')} />
            {!episode.endedAt ? (
              <Btn label="My baby is better: end this illness" kind="secondary" onPress={() => ill.endEpisode(episode.id)} />
            ) : (
              <Btn label="Reopen this illness" kind="secondary" onPress={() => ill.reopenEpisode(episode.id)} />
            )}
            {!confirmDelete ? (
              <Btn label="Delete this illness log" kind="ghost" onPress={() => setConfirmDelete(true)} />
            ) : (
              <View style={{ gap: 8 }}>
                <Body tone="warn">Delete this illness and everything logged in it? It can’t be undone.</Body>
                <View style={uiStyles.row}>
                  <Btn label="Cancel" kind="secondary" onPress={() => setConfirmDelete(false)} style={uiStyles.flex} />
                  <Btn
                    label="Delete"
                    kind="danger"
                    onPress={() => {
                      ill.removeEpisode(episode.id);
                      setConfirmDelete(false);
                      setViewId(null);
                    }}
                    style={uiStyles.flex}
                  />
                </View>
              </View>
            )}
          </Panel>
        </>
      ) : null}

      {past.length > 0 ? (
        <>
          <Section>{episode ? 'Other illnesses' : 'Past illnesses'}</Section>
          <Panel>
            {past.map((e) => (
              <View key={e.id} style={{ gap: 4 }}>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.foam }}>{e.title}</Text>
                <Body tone="muted">
                  {whenLabel(e.startedAt)} · {e.entries.length} entr{e.entries.length === 1 ? 'y' : 'ies'}
                  {e.endedAt ? '' : ' · ongoing'}
                </Body>
                <Btn label="Open" kind="secondary" small onPress={() => setViewId(e.id)} />
              </View>
            ))}
          </Panel>
        </>
      ) : null}

      <Notice tone="info" title="A log, not a diagnosis">
        Lulla records what you enter. It does not diagnose illness or tell you what to give. Fever guidance is a summary of AAP advice for your baby’s age. When worried, call your pediatrician, or 911 in an emergency.
      </Notice>
    </Screen>
  );
}

function ChipPick({ options, chips, onToggle }: { options: string[]; chips: string[]; onToggle: (label: string) => void }) {
  return (
    <View style={uiStyles.wrap}>
      {options.map((o) => (
        <Chip key={o} label={o} selected={chips.includes(o)} onPress={() => onToggle(o)} />
      ))}
    </View>
  );
}
