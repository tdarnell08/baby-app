import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';

const STAR_COUNT = 18;

function Star({ delay, left, top, size }: { delay: number; left: string; top: string; size: number }) {
  const twinkle = useSharedValue(0.2);

  useEffect(() => {
    twinkle.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1800 + delay, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
  }, [delay, twinkle]);

  const style = useAnimatedStyle(() => ({
    opacity: twinkle.value,
    transform: [{ scale: 0.7 + twinkle.value * 0.4 }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        style,
        {
          left: left as `${number}%`,
          top: top as `${number}%`,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    />
  );
}

export function Starfield() {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        delay: (i * 137) % 1600,
        left: `${(i * 37) % 92}%`,
        top: `${(i * 53) % 78}%`,
        size: 2 + (i % 3),
      })),
    [],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((star) => (
        <Star key={star.id} {...star} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: colors.mist,
  },
});
