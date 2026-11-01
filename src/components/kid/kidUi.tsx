import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { shapePaths, type KidShape } from '@/lib/kidLogic';
import type { KidClip } from '@/data/kidVoice';

export const kidColors = {
  ink: '#4A5A5C',
  card: 'rgba(255,255,255,0.55)',
  tiles: ['#CFE3EE', '#F2DDC8', '#DCEBD5', '#EFD3DA', '#E2D9EE', '#F3E8BC'],
  gradient: ['#BFDDE0', '#E9E0CC', '#EBCFCB'] as [string, string, string],
  dim: ['#8FA7B3', '#A99FA6', '#B5959B'] as [string, string, string],
};

export type GameProps = {
  age: import('@/lib/kidLogic').AgePlan;
  say: (...clips: KidClip[]) => Promise<void>;
  stopAudio: () => void;
};

export function ShapeSvg({
  shape,
  size,
  fill,
  stroke,
  dashed,
}: {
  shape: KidShape;
  size: number;
  fill: string;
  stroke?: string;
  dashed?: boolean;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d={shapePaths[shape]}
        fill={fill}
        stroke={stroke ?? 'none'}
        strokeWidth={stroke ? 4 : 0}
        strokeDasharray={dashed ? '8 6' : undefined}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SoftBounce({ trigger, children, style }: { trigger: number; children: React.ReactNode; style?: object }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (trigger === 0) return;
    scale.value = withSequence(withTiming(1.12, { duration: 220 }), withTiming(1, { duration: 380 }));
  }, [trigger, scale]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={[animated, style]}>{children}</Animated.View>;
}

export function BigButton({ label, onPress, accessibilityLabel }: { label: string; onPress: () => void; accessibilityLabel: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.big, pressed && { opacity: 0.8 }]}
    >
      <Text style={styles.bigText}>{label}</Text>
    </Pressable>
  );
}

export function Dots({ total, filled }: { total: number; filled: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i < filled && styles.dotOn]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  big: {
    minWidth: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bigText: { fontSize: 34 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(74,90,92,0.2)' },
  dotOn: { backgroundColor: '#7FA6D6' },
});

export function makeBox<T>(initial: T) {
  let value = initial;
  return {
    get: () => value,
    patch: (change: Partial<T>) => {
      value = { ...value, ...change };
    },
  };
}
