import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { kidColors } from '@/components/kid/kidUi';
import { gateQuestion, GATE_HOLD_MS, type GateQuestion } from '@/lib/kidLogic';

export function CornerHold({ onOpen }: { onOpen: () => void }) {
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);

  const cancel = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setProgress(0);
  };

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const begin = () => {
    cancel();
    startedAt.current = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - startedAt.current) / GATE_HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        cancel();
        onOpen();
      }
    }, 100);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Grown-ups: press and hold for 3 seconds to open parent options"
      onPressIn={begin}
      onPressOut={cancel}
      style={styles.corner}
    >
      <View style={[styles.cornerFill, { width: `${progress * 100}%` }]} />
      <Text style={styles.cornerText}>Grown-up · hold 3s</Text>
    </Pressable>
  );
}

export function ParentGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const [question, setQuestion] = useState<GateQuestion>(() => gateQuestion(Math.random));
  const [wrong, setWrong] = useState(false);
  const [locked, setLocked] = useState(false);

  const answer = (value: number) => {
    if (locked) return;
    if (value === question.answer) {
      onPass();
      return;
    }
    setWrong(true);
    setLocked(true);
    setTimeout(() => {
      setQuestion(gateQuestion(Math.random));
      setWrong(false);
      setLocked(false);
    }, 2500);
  };

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <View style={styles.card}>
        <Text style={styles.title}>Grown-ups only</Text>
        <Text style={styles.q}>{question.text}</Text>
        <View style={styles.options}>
          {question.options.map((o) => (
            <Pressable
              key={o}
              accessibilityRole="button"
              accessibilityLabel={`${o}`}
              onPress={() => answer(o)}
              style={({ pressed }) => [styles.option, pressed && { opacity: 0.8 }, locked && { opacity: 0.45 }]}
            >
              <Text style={styles.optionText}>{o}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.note}>{wrong ? 'Not quite. Here is a new question in a moment.' : 'Answer to open parent options.'}</Text>
        <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={10}>
          <Text style={styles.cancel}>Back to games</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    height: 30,
    minWidth: 130,
    borderRadius: 15,
    paddingHorizontal: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  cornerFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(74,90,92,0.25)' },
  cornerText: { fontFamily: 'Nunito_600SemiBold', fontSize: 11, color: 'rgba(74,90,92,0.8)' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(40,50,55,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 20 },
  card: { width: '100%', maxWidth: 380, borderRadius: 28, backgroundColor: '#F6F1E6', padding: 24, gap: 14, alignItems: 'center' },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 24, color: kidColors.ink },
  q: { fontFamily: 'Fraunces_700Bold', fontSize: 36, color: kidColors.ink },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  option: { minWidth: 120, paddingVertical: 14, borderRadius: 20, alignItems: 'center', backgroundColor: '#DCE8E4' },
  optionText: { fontFamily: 'Nunito_700Bold', fontSize: 22, color: kidColors.ink },
  note: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: kidColors.ink, textAlign: 'center' },
  cancel: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#4F6F63', textDecorationLine: 'underline' },
});
