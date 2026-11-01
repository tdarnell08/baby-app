import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BulletItem, SourceTags } from '@/components/Sources';
import { Btn, Notice, Panel, uiStyles } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { emergencyFlags, pediatricianFlags, type Tip } from '@/data/sleepHelp';
import type { PlanItem } from '@/lib/sleepHelpLogic';

export const SLEEP_GRADIENT: [string, string, string] = ['#142238', '#1B3350', '#244A5E'];

export function SafeSleepStrip() {
  const router = useRouter();
  return (
    <Notice tone="info" title="Safe sleep, every sleep">
      On their back, in a bare crib, in your room. No pillows, bumpers, or loose blankets. (AAP){' '}
      <Text style={styles.link} accessibilityRole="link" onPress={() => router.push('/sleep-safe')}>
        Read more
      </Text>
    </Notice>
  );
}

export function TipCard({ tip, added, onTry }: { tip: Tip; added: boolean; onTry: () => void }) {
  const router = useRouter();
  return (
    <Panel>
      <Text style={styles.tipHead}>{tip.head}</Text>
      <Text style={styles.tipText}>{tip.text}</Text>
      <SourceTags ids={tip.src} />
      <View style={uiStyles.wrap}>
        <Btn
          label={added ? 'In tonight’s plan ✓' : 'I’ll try this'}
          kind={added ? 'secondary' : 'primary'}
          small
          disabled={added}
          onPress={onTry}
        />
        {tip.link ? <Btn label={tip.link.label} kind="ghost" small onPress={() => router.push(tip.link!.href)} /> : null}
      </View>
    </Panel>
  );
}

export function PlanList({
  plan,
  onToggle,
  onRemove,
  tipTitle,
}: {
  plan: PlanItem[];
  onToggle: (tipId: string) => void;
  onRemove: (tipId: string) => void;
  tipTitle: (tipId: string) => string;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      {plan.map((item) => (
        <View key={item.tipId} style={styles.planRow}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.done }}
            accessibilityLabel={tipTitle(item.tipId)}
            onPress={() => onToggle(item.tipId)}
            style={styles.planMain}
            hitSlop={6}
          >
            <View style={[styles.box, item.done && styles.boxOn]}>{item.done ? <Text style={styles.tick}>✓</Text> : null}</View>
            <Text style={[styles.planText, item.done && styles.planDone]}>{tipTitle(item.tipId)}</Text>
          </Pressable>
          <Btn label="Remove" kind="ghost" small onPress={() => onRemove(item.tipId)} accessibilityLabel={`Remove ${tipTitle(item.tipId)}`} />
        </View>
      ))}
    </View>
  );
}

export function PediatricianCard({ expandable = false }: { expandable?: boolean }) {
  const [open, setOpen] = useState(!expandable);
  return (
    <Panel>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        disabled={!expandable}
        onPress={() => setOpen((v) => !v)}
        style={uiStyles.between}
      >
        <Text style={styles.tipHead}>Talk to your pediatrician if…</Text>
        {expandable ? <Text style={styles.link}>{open ? 'Hide' : 'Show'}</Text> : null}
      </Pressable>
      {open ? (
        <>
          {pediatricianFlags.map((f) => (
            <BulletItem key={f.text} text={f.text} src={f.src} />
          ))}
          <Notice tone="danger" title="Call 911 if">
            {emergencyFlags.map((f) => `• ${f.text}`).join('\n')}
          </Notice>
        </>
      ) : null}
    </Panel>
  );
}

const styles = StyleSheet.create({
  tipHead: { fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: colors.foam },
  tipText: { fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 21, color: colors.mistSoft },
  link: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.butter, textDecorationLine: 'underline' },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  planMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 44 },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.butter, borderColor: colors.butter },
  tick: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.ink },
  planText: { flex: 1, fontFamily: 'Nunito_600SemiBold', fontSize: 15, lineHeight: 20, color: colors.foam },
  planDone: { textDecorationLine: 'line-through', opacity: 0.6 },
});
