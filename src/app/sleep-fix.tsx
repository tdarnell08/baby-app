import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PediatricianCard, SafeSleepStrip, SLEEP_GRADIENT, TipCard } from '@/components/SleepHelpBits';
import { Body, Btn, Chip, Panel, ProgressBar, Screen, Title, uiStyles } from '@/components/ui';
import { colors, radii, spacing } from '@/constants/theme';
import { ageToBand, problems, ruleOutTips, sleepAges, tipsFor, type Problem, type SleepAge } from '@/data/sleepHelp';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useSleepHelp } from '@/hooks/useSleepHelp';

type Step = 'rule' | 'problem' | 'age' | 'tips';
const STEPS: Step[] = ['rule', 'problem', 'age', 'tips'];

export default function SleepFixScreen() {
  const router = useRouter();
  const { ageMonths, profile } = useBabyProfile();
  const { plan, addPlan } = useSleepHelp();
  const [step, setStep] = useState<Step>('rule');
  const [checked, setChecked] = useState<string[]>([]);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [pickedAge, setPickedAge] = useState<SleepAge | null>(null);

  const profileAge = profile.configured ? ageToBand(ageMonths) : null;
  const age = pickedAge ?? profileAge;
  const index = STEPS.indexOf(step);
  const inPlan = (id: string) => plan.some((p) => p.tipId === id);
  const toggleChecked = (id: string) => setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const tips = problem && age ? tipsFor(problem, age) : [];
  const problemLabel = problems.find((p) => p.id === problem)?.label;
  const ageLabel = sleepAges.find((a) => a.id === age)?.label;

  const back = () => {
    if (index === 0) router.push('/sleep-help');
    else setStep(STEPS[index - 1]);
  };

  return (
    <Screen gradient={SLEEP_GRADIENT} backTo="/sleep-help" back="← Sleep help">
      <ProgressBar value={(index + 1) / STEPS.length} />

      {step === 'rule' ? (
        <>
          <Title sub="Tap what you’ve checked. Add anything to tonight’s plan.">Rule out first</Title>
          {ruleOutTips
            .filter((t) => age === null || t.a.includes(age))
            .map((tip) => {
              const on = checked.includes(tip.id);
              return (
                <Panel key={tip.id}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    onPress={() => toggleChecked(tip.id)}
                    style={styles.ruleMain}
                  >
                    <View style={[styles.box, on && styles.boxOn]}>{on ? <Text style={styles.tick}>✓</Text> : null}</View>
                    <View style={uiStyles.flex}>
                      <Text style={styles.ruleHead}>{tip.head}</Text>
                      <Text style={styles.ruleText}>{tip.text}</Text>
                    </View>
                  </Pressable>
                  <View style={uiStyles.wrap}>
                    <Btn
                      label={inPlan(tip.id) ? 'In plan ✓' : 'Add to plan'}
                      kind="secondary"
                      small
                      disabled={inPlan(tip.id)}
                      onPress={() => addPlan(tip.id)}
                    />
                    {tip.link ? <Btn label={tip.link.label} kind="ghost" small onPress={() => router.push(tip.link!.href)} /> : null}
                  </View>
                </Panel>
              );
            })}
          <Btn label="Next" onPress={() => setStep('problem')} />
          <Btn label="Skip" kind="ghost" onPress={() => setStep('problem')} />
        </>
      ) : null}

      {step === 'problem' ? (
        <>
          <Title>What’s happening?</Title>
          {problems.map((p) => (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              onPress={() => {
                setProblem(p.id);
                setStep('age');
              }}
              style={({ pressed }) => [styles.option, problem === p.id && styles.optionOn, pressed && styles.pressed]}
            >
              <Text style={styles.optionLabel}>{p.label}</Text>
              <Text style={styles.optionHint}>{p.hint}</Text>
            </Pressable>
          ))}
          <Btn label="Back" kind="ghost" onPress={back} />
        </>
      ) : null}

      {step === 'age' ? (
        <>
          <Title sub={profileAge ? 'We started with your baby profile. Change it if needed.' : undefined}>How old are they?</Title>
          <View style={uiStyles.wrap}>
            {sleepAges.map((a) => (
              <Chip
                key={a.id}
                label={a.label}
                selected={age === a.id}
                onPress={() => {
                  setPickedAge(a.id);
                  setStep('tips');
                }}
              />
            ))}
          </View>
          {age ? <Btn label="Show tips" onPress={() => setStep('tips')} /> : null}
          <Btn label="Back" kind="ghost" onPress={back} />
        </>
      ) : null}

      {step === 'tips' ? (
        <>
          <Title sub={`${problemLabel ?? 'Sleep'} · ${ageLabel ?? ''}`}>Try these</Title>
          {tips.length === 0 ? <Body>Pick what’s happening and an age to see tips.</Body> : null}
          {tips.map((tip) => (
            <TipCard key={tip.id} tip={tip} added={inPlan(tip.id)} onTry={() => addPlan(tip.id)} />
          ))}
          {plan.length > 0 ? <Btn label={`Tonight’s plan (${plan.length})`} onPress={() => router.push('/sleep-help')} /> : null}
          <PediatricianCard expandable />
          <SafeSleepStrip />
          <View style={uiStyles.row}>
            <Btn label="Back" kind="ghost" onPress={back} style={uiStyles.flex} />
            <Btn
              label="Start over"
              kind="secondary"
              onPress={() => {
                setProblem(null);
                setPickedAge(null);
                setChecked([]);
                setStep('rule');
              }}
              style={uiStyles.flex}
            />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  ruleMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ruleHead: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: colors.foam },
  ruleText: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, color: colors.mistSoft },
  box: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.butter, borderColor: colors.butter },
  tick: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.ink },
  option: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 2,
  },
  optionOn: { borderColor: colors.butter },
  optionLabel: { fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: colors.foam },
  optionHint: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.mist },
  pressed: { opacity: 0.88 },
});
