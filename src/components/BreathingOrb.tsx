import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';

type Props = {
  active?: boolean;
  color?: string;
  size?: number;
};

export function BreathingOrb({
  active = true,
  color = colors.sage,
  size = 180,
}: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      pulse.value = withTiming(0, { duration: 600 });
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [active, pulse]);

  const outer = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.92, 1.08]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.35, 0.55]),
  }));

  const inner = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.96, 1.04]) }],
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.halo,
          outer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.core,
          inner,
          {
            width: size * 0.58,
            height: size * 0.58,
            borderRadius: size * 0.29,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
  core: {
    opacity: 0.9,
  },
});
