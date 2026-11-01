import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Dots, kidColors, type GameProps } from '@/components/kid/kidUi';

const SPOKEN_BREATHS = 4;

export function BuddyGame({ age, say, slow }: GameProps & { slow?: boolean }) {
  const inSec = slow ? age.breathIn + 1 : age.breathIn;
  const outSec = slow ? age.breathOut + 2 : age.breathOut;
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [breaths, setBreaths] = useState(0);
  const breathsRef = useRef(0);
  const scale = useSharedValue(0.62);

  useEffect(() => {
    const seconds = phase === 'in' ? inSec : outSec;
    scale.value = withTiming(phase === 'in' ? 1 : 0.62, { duration: seconds * 1000, easing: Easing.inOut(Easing.sin) });
    if (breathsRef.current < SPOKEN_BREATHS && !slow) void say(phase === 'in' ? 'p-smell' : 'p-blow');
    const id = setTimeout(() => {
      if (phase === 'out') {
        breathsRef.current += 1;
        setBreaths(breathsRef.current);
      }
      setPhase(phase === 'in' ? 'out' : 'in');
    }, seconds * 1000);
    return () => clearTimeout(id);
  }, [phase, inSec, outSec, scale, say, slow]);

  const body = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.root}>
      <View style={styles.prompt}>
        <Text style={styles.icon}>{phase === 'in' ? '🌸' : '🕯️'}</Text>
        <Text style={styles.label}>{phase === 'in' ? 'Smell the flower' : 'Blow the candle'}</Text>
      </View>
      <View style={styles.stage}>
        <Animated.View style={[styles.belly, body]}>
          <Text style={styles.bear}>🐻</Text>
        </Animated.View>
      </View>
      <Dots total={5} filled={Math.min(5, breaths)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  prompt: { alignItems: 'center', gap: 4 },
  icon: { fontSize: 56 },
  label: { fontFamily: 'Fraunces_700Bold', fontSize: 32, color: kidColors.ink, textAlign: 'center' },
  stage: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  belly: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(240,214,190,0.85)',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bear: { fontSize: 130 },
});
