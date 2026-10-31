import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BreathingOrb } from '@/components/BreathingOrb';
import { Starfield } from '@/components/Starfield';
import { colors, radii, spacing } from '@/constants/theme';
import {
  categoryLabels,
  categoryOrder,
  evidenceLabels,
  sleepScienceNotes,
  sleepSounds,
  timerOptions,
  volumeOptions,
  type Evidence,
} from '@/data/sounds';

const FADE_SECONDS = 30;

const evidenceColor: Record<Evidence, string> = {
  infant: colors.butter,
  adult: '#9DC3E6',
  comfort: colors.mist,
};

function formatRemaining(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SleepScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [volume, setVolume] = useState<number>(volumeOptions[1].value);
  const [showScience, setShowScience] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);

  const stopPlayer = useCallback(() => {
    const current = playerRef.current;
    if (current) {
      try {
        current.pause();
        current.remove();
      } catch {
        // player may already be released
      }
      playerRef.current = null;
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      const current = playerRef.current;
      if (!current) return;
      try {
        current.pause();
        current.remove();
      } catch {
        // ignore
      }
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!playing || remaining === null) return;
    const id = setTimeout(() => {
      if (remaining <= 1) {
        stopPlayer();
        setActiveId(null);
        setRemaining(null);
      } else {
        setRemaining(remaining - 1);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [playing, remaining, stopPlayer]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const fade = remaining !== null ? Math.min(1, Math.max(0, remaining / FADE_SECONDS)) : 1;
    try {
      player.volume = volume * fade;
    } catch {
      // player released
    }
  }, [volume, remaining]);

  const startSound = async (soundId: string) => {
    setError(null);
    const sound = sleepSounds.find((s) => s.id === soundId);
    if (!sound) return;

    void Haptics.selectionAsync().catch(() => {});
    stopPlayer();

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
      });
      const next = createAudioPlayer(sound.source);
      next.loop = true;
      next.volume = volume;
      next.play();
      playerRef.current = next;
      setActiveId(soundId);
      setPlaying(true);
      setRemaining(timerMinutes > 0 ? timerMinutes * 60 : null);
    } catch {
      setError('Could not start the sound. Please try again.');
      setPlaying(false);
      setActiveId(null);
    }
  };

  const togglePlay = async () => {
    const player = playerRef.current;
    if (!player || !activeId) {
      await startSound(sleepSounds[0].id);
      return;
    }
    if (playing) {
      player.pause();
      setPlaying(false);
    } else {
      player.play();
      setPlaying(true);
      if (timerMinutes > 0 && remaining === null) setRemaining(timerMinutes * 60);
    }
  };

  const active = sleepSounds.find((s) => s.id === activeId) ?? sleepSounds[0];

  return (
    <LinearGradient colors={[colors.nightDeep, '#122F3C', '#1A3F48']} style={styles.root}>
      <Starfield />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <Pressable hitSlop={12} style={styles.back} onPress={() => router.push('/')}>
            <Text style={styles.backText}>← Home</Text>
          </Pressable>
          <Text style={styles.title}>Sleep sounds</Text>
          <Text style={styles.subtitle}>Dim the lights. Let the hush begin.</Text>

          <Animated.View entering={FadeIn.duration(600)} style={styles.stage}>
            <BreathingOrb active={playing} color={active.tint} size={168} />
            <Text style={styles.nowPlaying}>{active.name}</Text>
            {remaining !== null && playing ? (
              <Text style={styles.timer}>{formatRemaining(remaining)} left</Text>
            ) : (
              <Text style={styles.timerIdle}>
                {timerMinutes === 0 ? 'Plays until you stop' : `${timerMinutes} min timer`}
              </Text>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={togglePlay}
              style={({ pressed }) => [styles.playBtn, pressed && styles.pressed]}
            >
              <Text style={styles.playLabel}>{playing ? 'Pause' : 'Play'}</Text>
            </Pressable>
          </Animated.View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={[styles.dot, { backgroundColor: evidenceColor[active.evidence] }]} />
              <Text style={styles.infoBadge}>{evidenceLabels[active.evidence]}</Text>
            </View>
            <Text style={styles.infoTitle}>Why {active.name.toLowerCase()}?</Text>
            <Text style={styles.infoBody}>{active.science}</Text>
          </View>

          <Text style={styles.section}>Volume</Text>
          <View style={styles.chips}>
            {volumeOptions.map((opt) => {
              const selected = volume === opt.value;
              return (
                <Pressable
                  key={opt.label}
                  accessibilityRole="button"
                  onPress={() => setVolume(opt.value)}
                  style={[styles.chip, selected && styles.chipOn]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextOn]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.helper}>
            Keep it about as loud as a quiet conversation, with the phone across the room. The sound fades out over the
            last 30 seconds of the timer.
          </Text>

          <Text style={styles.section}>Timer</Text>
          <View style={styles.chips}>
            {timerOptions.map((opt) => {
              const selected = timerMinutes === opt.minutes;
              return (
                <Pressable
                  key={opt.label}
                  accessibilityRole="button"
                  onPress={() => {
                    setTimerMinutes(opt.minutes);
                    if (playing) setRemaining(opt.minutes > 0 ? opt.minutes * 60 : null);
                  }}
                  style={[styles.chip, selected && styles.chipOn]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextOn]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {categoryOrder.map((category) => {
            const items = sleepSounds.filter((s) => s.category === category);
            if (items.length === 0) return null;
            return (
              <View key={category}>
                <Text style={styles.section}>{categoryLabels[category]}</Text>
                <View style={styles.grid}>
                  {items.map((sound) => {
                    const selected = activeId === sound.id;
                    return (
                      <Pressable
                        key={sound.id}
                        accessibilityRole="button"
                        onPress={() => startSound(sound.id)}
                        style={({ pressed }) => [
                          styles.soundCard,
                          selected && { borderColor: sound.tint, backgroundColor: 'rgba(255,255,255,0.12)' },
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={[styles.swatch, { backgroundColor: sound.tint }]} />
                        <Text style={styles.soundName}>{sound.name}</Text>
                        <Text style={styles.soundBlurb}>{sound.blurb}</Text>
                        <Text style={[styles.soundEvidence, { color: evidenceColor[sound.evidence] }]}>
                          {evidenceLabels[sound.evidence]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowScience((v) => !v)}
            style={styles.scienceToggle}
          >
            <Text style={styles.scienceToggleText}>
              {showScience ? 'Hide' : 'Show'} what the research says and how to use sound safely
            </Text>
          </Pressable>
          {showScience ? (
            <View style={styles.scienceBox}>
              {sleepScienceNotes.map((note) => (
                <View key={note} style={styles.noteRow}>
                  <Text style={styles.noteBullet}>•</Text>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  column: {
    width: '100%',
    maxWidth: 560,
  },
  back: { alignSelf: 'flex-start', marginBottom: spacing.sm },
  backText: {
    fontFamily: 'Nunito_600SemiBold',
    color: colors.mist,
    fontSize: 15,
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 34,
    color: colors.foam,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: colors.muted,
  },
  stage: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  nowPlaying: {
    marginTop: spacing.md,
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 22,
    color: colors.foam,
  },
  timer: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.butter,
  },
  timerIdle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.muted,
  },
  playBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.butter,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
  },
  playLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.ink,
  },
  infoCard: {
    backgroundColor: colors.sleepCard,
    borderWidth: 1,
    borderColor: colors.sleepBorder,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 6,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  infoBadge: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.mist,
  },
  infoTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 17,
    color: colors.foam,
  },
  infoBody: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: colors.mist,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.sage,
  },
  helper: {
    marginTop: spacing.sm,
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  soundCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 150,
    backgroundColor: colors.sleepCard,
    borderWidth: 1,
    borderColor: colors.sleepBorder,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
  },
  swatch: {
    width: 28,
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  soundName: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 17,
    color: colors.foam,
  },
  soundBlurb: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
  },
  soundEvidence: {
    marginTop: 4,
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.sleepBorder,
    backgroundColor: colors.sleepCard,
  },
  chipOn: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  chipText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.mist,
  },
  chipTextOn: {
    color: colors.nightDeep,
  },
  scienceToggle: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  scienceToggleText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.butter,
    textDecorationLine: 'underline',
  },
  scienceBox: {
    marginTop: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.sleepCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.sleepBorder,
    padding: spacing.md,
  },
  noteRow: { flexDirection: 'row', gap: spacing.sm },
  noteBullet: { color: colors.sage, fontSize: 14, lineHeight: 21 },
  noteText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: colors.mist,
  },
  error: {
    marginTop: spacing.md,
    fontFamily: 'Nunito_600SemiBold',
    color: colors.blush,
  },
  pressed: { opacity: 0.9 },
});
