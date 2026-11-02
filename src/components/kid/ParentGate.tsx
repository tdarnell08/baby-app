import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { kidColors } from '@/components/kid/kidUi';
import { guardHoldTarget, KID_HOLD_ID } from '@/lib/kidWebGuard';
import { gateQuestion, GATE_HOLD_MS, type GateQuestion } from '@/lib/kidLogic';

const RING = 38;
const RING_STROKE = 4;
const RING_R = (RING - RING_STROKE) / 2;
const RING_LEN = 2 * Math.PI * RING_R;

export function CornerHold({ onOpen }: { onOpen: () => void }) {
  const [progress, setProgress] = useState(0);
  const [hint, setHint] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const done = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef(0);
  const openRef = useRef(onOpen);

  useEffect(() => {
    openRef.current = onOpen;
  }, [onOpen]);

  const stopTimers = useCallback(() => {
    if (tick.current) clearInterval(tick.current);
    if (done.current) clearTimeout(done.current);
    tick.current = null;
    done.current = null;
  }, []);

  useEffect(() => guardHoldTarget(), []);

  useEffect(
    () => () => {
      stopTimers();
      if (hintTimer.current) clearTimeout(hintTimer.current);
    },
    [stopTimers],
  );

  const begin = () => {
    if (tick.current) return;
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setHint(false);
    startedAt.current = Date.now();
    setProgress(0.02);
    tick.current = setInterval(() => {
      setProgress(Math.min(1, (Date.now() - startedAt.current) / GATE_HOLD_MS));
    }, 50);
    done.current = setTimeout(() => {
      stopTimers();
      setProgress(0);
      openRef.current();
    }, GATE_HOLD_MS);
  };

  const end = () => {
    if (!tick.current) return;
    stopTimers();
    setProgress(0);
    setHint(true);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(false), 2200);
  };

  const holding = progress > 0;

  return (
    <Pressable
      nativeID={KID_HOLD_ID}
      accessibilityRole="button"
      accessibilityLabel="Grown-ups: press and hold for 3 seconds to open parent options"
      onPressIn={begin}
      onPressOut={end}
      delayLongPress={100000}
      style={[styles.corner, holding && styles.cornerActive]}
    >
      <View style={styles.ring} pointerEvents="none">
        <Svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`}>
          <Circle cx={RING / 2} cy={RING / 2} r={RING_R} stroke="rgba(74,90,92,0.22)" strokeWidth={RING_STROKE} fill="none" />
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={RING_R}
            stroke="#4F6F63"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${RING_LEN} ${RING_LEN}`}
            strokeDashoffset={RING_LEN * (1 - progress)}
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
          />
        </Svg>
        <Text selectable={false} style={styles.lock}>
          🔒
        </Text>
      </View>
      <Text selectable={false} style={styles.cornerText}>
        {holding ? 'Keep holding…' : hint ? 'Hold for 3 seconds' : 'Grown-ups'}
      </Text>
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
        <Text selectable={false} style={styles.title}>Grown-ups only</Text>
        <Text selectable={false} style={styles.q}>{question.text}</Text>
        <View style={styles.options}>
          {question.options.map((o) => (
            <Pressable
              key={o}
              accessibilityRole="button"
              accessibilityLabel={`${o}`}
              onPress={() => answer(o)}
              style={({ pressed }) => [styles.option, pressed && { opacity: 0.8 }, locked && { opacity: 0.45 }]}
            >
              <Text selectable={false} style={styles.optionText}>{o}</Text>
            </Pressable>
          ))}
        </View>
        <Text selectable={false} style={styles.note}>{wrong ? 'Not quite. Here is a new question in a moment.' : 'Answer to open parent options.'}</Text>
        <Pressable accessibilityRole="button" onPress={onCancel} hitSlop={10}>
          <Text selectable={false} style={styles.cancel}>Back to games</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    height: 46,
    paddingLeft: 4,
    paddingRight: 14,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(74,90,92,0.18)',
  },
  cornerActive: { backgroundColor: 'rgba(255,255,255,0.92)' },
  ring: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center' },
  lock: { position: 'absolute', fontSize: 15 },
  cornerText: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: kidColors.ink },
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
