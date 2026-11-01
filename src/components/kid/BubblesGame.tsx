import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Dots, kidColors, type GameProps } from '@/components/kid/kidUi';
import type { KidClip } from '@/data/kidVoice';
import { pickMany } from '@/lib/kidLogic';

type Spot = { n: number; x: number; y: number; d: number; delay: number };

function Bubble({ spot, label, popped, wiggle, onPress }: { spot: Spot; label: string | null; popped: boolean; wiggle: number; onPress: () => void }) {
  const bob = useSharedValue(0);
  const pop = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(withTiming(1, { duration: 2600 + spot.delay, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [bob, spot.delay]);
  useEffect(() => {
    if (popped) pop.value = withTiming(0, { duration: 260 });
  }, [popped, pop]);
  useEffect(() => {
    if (wiggle > 0) shake.value = withSequence(withTiming(8, { duration: 90 }), withTiming(-8, { duration: 130 }), withTiming(0, { duration: 90 }));
  }, [wiggle, shake]);

  const animated = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{ translateY: bob.value * 10 - 5 }, { translateX: shake.value }, { scale: 0.6 + pop.value * 0.4 + (1 - pop.value) * 0.5 }],
  }));

  return (
    <Animated.View style={[styles.pos, { left: spot.x, top: spot.y, width: spot.d, height: spot.d }, animated]} pointerEvents={popped ? 'none' : 'auto'}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ? `Bubble ${label}` : 'Bubble'}
        onPress={onPress}
        style={[styles.bubble, { borderRadius: spot.d / 2 }]}
      >
        <View style={[styles.shine, { width: spot.d * 0.22, height: spot.d * 0.22, borderRadius: spot.d * 0.11 }]} />
        {label ? <Text style={[styles.num, { fontSize: spot.d * 0.46 }]}>{label}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

export function BubblesGame({ age, say }: GameProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [round, setRound] = useState(0);
  const [popped, setPopped] = useState<number[]>([]);
  const [wiggle, setWiggle] = useState<Record<number, number>>({});
  const [last, setLast] = useState<number | null>(null);

  const total = age.bubbles;

  const spots = useMemo<Spot[]>(() => {
    if (size.w === 0 || size.h === 0) return [];
    const cols = total <= 5 ? 2 : 3;
    const rows = Math.ceil(total / cols);
    const cellW = size.w / cols;
    const cellH = size.h / rows;
    const d = Math.min(cellW, cellH) * 0.78;
    const numbers = pickMany(Array.from({ length: total }, (_, i) => i + 1), total, Math.random);
    return numbers.map((n, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = ((i * 37) % 11) / 11 - 0.5;
      const jitterY = ((i * 53) % 7) / 7 - 0.5;
      return {
        n,
        d,
        x: col * cellW + (cellW - d) / 2 + jitterX * (cellW - d) * 0.5,
        y: row * cellH + (cellH - d) / 2 + jitterY * (cellH - d) * 0.5,
        delay: (i % 4) * 300,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, total, round]);

  const next = popped.length + 1;

  const onPop = (spot: Spot) => {
    if (popped.includes(spot.n)) return;
    if (age.ordered && spot.n !== next) {
      setWiggle((w) => ({ ...w, [spot.n]: (w[spot.n] ?? 0) + 1 }));
      return;
    }
    const spoken = age.numerals ? spot.n : next;
    const done = popped.length + 1 >= total;
    setPopped((p) => [...p, spot.n]);
    setLast(spoken);
    const clips: KidClip[] = [`n${spoken}` as KidClip];
    if (done) clips.push('p-yay');
    void say(...clips);
    if (done) {
      setTimeout(() => {
        setPopped([]);
        setLast(null);
        setWiggle({});
        setRound((r) => r + 1);
      }, 2200);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.top}>
        <Text style={styles.big}>{last ?? ' '}</Text>
        <Dots total={total} filled={popped.length} />
      </View>
      <View style={styles.field} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {spots.map((s) => (
          <Bubble
            key={`${round}-${s.n}`}
            spot={s}
            label={age.numerals ? `${s.n}` : null}
            popped={popped.includes(s.n)}
            wiggle={wiggle[s.n] ?? 0}
            onPress={() => onPop(s)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 8 },
  top: { alignItems: 'center', gap: 6, minHeight: 96 },
  big: { fontFamily: 'Fraunces_700Bold', fontSize: 64, lineHeight: 72, color: kidColors.ink },
  field: { flex: 1 },
  pos: { position: 'absolute' },
  bubble: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(190,225,240,0.75)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  shine: { position: 'absolute', top: '16%', left: '20%', backgroundColor: 'rgba(255,255,255,0.8)' },
  num: { fontFamily: 'Fraunces_700Bold', color: '#4A6A80' },
});
