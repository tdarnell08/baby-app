import { useEffect, useRef, useState } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';
import { mediaUri } from '@/lib/media';

export function VoicePlay({ source, label = 'Play voice clip', raw = false }: { source: string; label?: string; raw?: boolean }) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(
    () => () => {
      try {
        playerRef.current?.remove();
      } catch {
        // already released
      }
    },
    [],
  );

  const toggle = () => {
    try {
      if (playing && playerRef.current) {
        playerRef.current.pause();
        setPlaying(false);
        return;
      }
      playerRef.current?.remove();
      const player = createAudioPlayer({ uri: raw ? source : mediaUri(source) });
      playerRef.current = player;
      player.play();
      setPlaying(true);
      const poll = setInterval(() => {
        try {
          const status = player.currentStatus;
          if (status?.didJustFinish || (status?.isLoaded && !status.playing && (status.currentTime ?? 0) > 0.05)) {
            clearInterval(poll);
            setPlaying(false);
          }
        } catch {
          clearInterval(poll);
          setPlaying(false);
        }
      }, 300);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={toggle} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}>
      <Text style={styles.text}>{playing ? '⏸ Pause' : '▶ Play voice clip'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  text: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.foam },
});
