import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeInRight,
  FadeOutLeft,
  ZoomIn,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MilestoneStrip } from '@/components/MilestoneStrip';
import { PlusBadge } from '@/components/PlusBadge';
import { colors, radii, spacing } from '@/constants/theme';
import {
  firstWords,
  wordCategories,
  wordScience,
  wordTips,
  type WordCategory,
} from '@/data/words';
import { ROUNDS, TURN_MS, useLesson, type LessonPhase, type VoiceMode } from '@/hooks/useLesson';
import { freeWordIds } from '@/data/pricing';
import { usePremium } from '@/providers/PremiumProvider';
import { useParentVoice, type ParentClipKind } from '@/hooks/useParentVoice';

function TurnBar({ active }: { active: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(progress);
    if (active) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: TURN_MS, easing: Easing.linear });
    } else {
      progress.value = 0;
    }
  }, [active, progress]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, fill]} />
    </View>
  );
}

function phaseCopy(phase: LessonPhase, mode: VoiceMode, say: string, phrase: string, hasSay: boolean) {
  switch (phase) {
    case 'listen':
      return {
        title: mode === 'app' ? 'Watch my mouth' : hasSay ? 'Playing your voice' : 'You say it now',
        body:
          mode === 'app'
            ? `“${say}”`
            : hasSay
              ? `Hearing your recording of “${say}”.`
              : `Say “${say}” in a high, sing-song voice.`,
      };
    case 'together':
      return {
        title: mode === 'app' ? 'Now a little sentence' : 'Now the short sentence',
        body: `“${phrase}”`,
      };
    case 'turn':
      return {
        title: 'Baby’s turn!',
        body: 'Wait, smile, and lean in. Any sound, look, or wiggle counts.',
      };
    case 'cheer':
      return { title: 'Yay!', body: 'Cheer, clap, and celebrate right away.' };
    default:
      return null;
  }
}

function RecordRow({
  label,
  prompt,
  kind,
  hasClip,
  disabled,
  isRecordingThis,
  recordingLabel,
  onRecord,
  onStop,
  onPlay,
  onClear,
}: {
  label: string;
  prompt: string;
  kind: ParentClipKind;
  hasClip: boolean;
  disabled: boolean;
  isRecordingThis: boolean;
  recordingLabel: string;
  onRecord: (kind: ParentClipKind) => void;
  onStop: () => void;
  onPlay: (kind: ParentClipKind) => void;
  onClear: (kind: ParentClipKind) => void;
}) {
  return (
    <View style={styles.recordRow}>
      <View style={styles.recordCopy}>
        <Text style={styles.recordLabel}>{label}</Text>
        <Text style={styles.recordPrompt}>{prompt}</Text>
        <Text style={styles.recordStatus}>
          {isRecordingThis ? `Recording… ${recordingLabel}` : hasClip ? 'Saved' : 'Not recorded yet'}
        </Text>
      </View>
      <View style={styles.recordActions}>
        {isRecordingThis ? (
          <Pressable
            accessibilityRole="button"
            onPress={onStop}
            style={({ pressed }) => [styles.stopBtn, pressed && styles.pressed]}
          >
            <Text style={styles.stopBtnText}>Stop</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => onRecord(kind)}
            style={({ pressed }) => [
              styles.micBtn,
              hasClip && styles.micBtnSaved,
              disabled && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.micBtnText, hasClip && styles.micBtnTextSaved]}>
              {hasClip ? 'Re-record' : 'Record'}
            </Text>
          </Pressable>
        )}
        {hasClip && !isRecordingThis ? (
          <>
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={() => onPlay(kind)}
              style={({ pressed }) => [styles.smallBtn, pressed && styles.pressed]}
            >
              <Text style={styles.smallBtnText}>Play</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={() => onClear(kind)}
              style={({ pressed }) => [styles.smallBtn, pressed && styles.pressed]}
            >
              <Text style={styles.smallBtnText}>Delete</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}

export default function WordsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = usePremium();
  const [category, setCategory] = useState<WordCategory>('people');
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<VoiceMode>('app');
  const [showScience, setShowScience] = useState(false);

  const words = useMemo(() => firstWords.filter((w) => w.category === category), [category]);
  const word = words[index % words.length];
  const wordLocked = !isPremium && !freeWordIds.includes(word.id);
  const parentVoice = useParentVoice(word.id);
  const { phase, round, start, stop, hear } = useLesson(mode, parentVoice.clips);

  const running = phase !== 'idle';
  const copy = phaseCopy(phase, mode, word.say, word.phrase, !!parentVoice.clips.say);
  const categoryInfo = wordCategories.find((c) => c.id === category);
  const busyRecording = parentVoice.isRecording;

  const go = (delta: number) => {
    stop();
    if (busyRecording) void parentVoice.stopRecording();
    setIndex((i) => (i + delta + words.length) % words.length);
  };

  const pickCategory = (id: WordCategory) => {
    stop();
    if (busyRecording) void parentVoice.stopRecording();
    setCategory(id);
    setIndex(0);
  };

  const pickMode = (next: VoiceMode) => {
    if (next === 'parent' && !isPremium) {
      router.push('/paywall');
      return;
    }
    stop();
    if (busyRecording) void parentVoice.stopRecording();
    setMode(next);
  };

  const startLesson = () => {
    if (wordLocked) {
      router.push('/paywall');
      return;
    }
    if (running) {
      stop();
      return;
    }
    void start(word);
  };

  return (
    <LinearGradient colors={['#1A3A3A', '#234848', '#2F5A4E']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <Pressable hitSlop={12} onPress={() => router.push('/')}>
            <Text style={styles.backText}>← Home</Text>
          </Pressable>
          <Text style={styles.title}>First words</Text>
          <Text style={styles.subtitle}>Say it. Pause. Cheer. Repeat.</Text>

          <MilestoneStrip domain="language" />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {wordCategories.map((c) => {
              const selected = c.id === category;
              return (
                <Pressable
                  key={c.id}
                  accessibilityRole="button"
                  onPress={() => pickCategory(c.id)}
                  style={[styles.chip, selected && styles.chipOn]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextOn]}>{c.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Text style={styles.categoryBlurb}>{categoryInfo?.blurb}</Text>

          <Animated.View
            key={word.id}
            entering={FadeInRight.duration(280)}
            exiting={FadeOutLeft.duration(180)}
            style={[styles.card, { backgroundColor: word.color }]}
          >
            <Animated.Text entering={ZoomIn.duration(320)} style={styles.emoji}>
              {word.emoji}
            </Animated.Text>
            {wordLocked ? <PlusBadge dark /> : null}
            <Text style={styles.word}>{word.word}</Text>
            <Text style={styles.phrase}>{word.phrase}</Text>
            <View style={styles.gestureBox}>
              <Text style={styles.gestureLabel}>Try this gesture</Text>
              <Text style={styles.gestureText}>{word.gesture}</Text>
            </View>
          </Animated.View>

          <View style={styles.nav}>
            <Pressable accessibilityRole="button" onPress={() => go(-1)} style={styles.navBtn}>
              <Text style={styles.navLabel}>Previous</Text>
            </Pressable>
            <Text style={styles.progress}>
              {(index % words.length) + 1} / {words.length}
            </Text>
            <Pressable accessibilityRole="button" onPress={() => go(1)} style={styles.navBtn}>
              <Text style={styles.navLabel}>Next</Text>
            </Pressable>
          </View>

          <View style={styles.modeRow}>
            {(['app', 'parent'] as const).map((m) => {
              const selected = mode === m;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  onPress={() => pickMode(m)}
                  style={[styles.modeBtn, selected && styles.modeBtnOn]}
                >
                  <Text style={[styles.modeText, selected && styles.modeTextOn]}>
                    {m === 'app' ? 'App voice' : isPremium ? 'My voice' : 'My voice 🔒'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {mode === 'app' ? (
            <Text style={styles.modeHint}>
              Warm app voice for demos. Switch to My voice to record yourself — babies learn best from you.
            </Text>
          ) : (
            <View style={styles.recordPanel}>
              <Text style={styles.recordTitle}>Record your voice in 2 taps</Text>
              <Text style={styles.modeHint}>
                1) Record the word · 2) Optional: record the short sentence · 3) Start the lesson
              </Text>

              <RecordRow
                label="1. The word"
                prompt={`Say “${word.say}” slowly and cheerfully`}
                kind="say"
                hasClip={!!parentVoice.clips.say}
                disabled={running || (busyRecording && parentVoice.recordingKind !== 'say')}
                isRecordingThis={parentVoice.recordingKind === 'say'}
                recordingLabel={parentVoice.recordingLabel}
                onRecord={(kind) => void parentVoice.startRecording(kind)}
                onStop={() => void parentVoice.stopRecording()}
                onPlay={(kind) => void parentVoice.playClip(kind)}
                onClear={parentVoice.clearClip}
              />

              <RecordRow
                label="2. The sentence (optional)"
                prompt={`Say “${word.phrase}”`}
                kind="phrase"
                hasClip={!!parentVoice.clips.phrase}
                disabled={running || (busyRecording && parentVoice.recordingKind !== 'phrase')}
                isRecordingThis={parentVoice.recordingKind === 'phrase'}
                recordingLabel={parentVoice.recordingLabel}
                onRecord={(kind) => void parentVoice.startRecording(kind)}
                onStop={() => void parentVoice.stopRecording()}
                onPlay={(kind) => void parentVoice.playClip(kind)}
                onClear={parentVoice.clearClip}
              />

              {parentVoice.error ? <Text style={styles.errorText}>{parentVoice.error}</Text> : null}
              {parentVoice.permissionDenied ? (
                <Text style={styles.errorText}>
                  Microphone is blocked. Enable it in your browser or phone settings for this site/app.
                </Text>
              ) : null}

              {!parentVoice.clips.say ? (
                <Text style={styles.recordNudge}>
                  Tip: record the word once. The lesson will replay your voice, then pause for baby.
                </Text>
              ) : (
                <Text style={styles.recordReady}>Ready — your word recording will play in the lesson.</Text>
              )}
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={startLesson}
            disabled={busyRecording}
            style={({ pressed }) => [
              styles.primary,
              busyRecording && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryText}>
              {running
                ? 'Stop lesson'
                : mode === 'parent' && !parentVoice.clips.say
                  ? `Start lesson (I’ll say it live)`
                  : `Start ${ROUNDS}-round lesson`}
            </Text>
          </Pressable>
          {!running ? (
            <Pressable
              accessibilityRole="button"
              disabled={busyRecording}
              onPress={() => (wordLocked ? router.push('/paywall') : void hear(word))}
              style={({ pressed }) => [
                styles.secondary,
                busyRecording && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryText}>
                {mode === 'parent' && parentVoice.clips.say ? 'Play my recording' : 'Just hear the word'}
              </Text>
            </Pressable>
          ) : null}

          {copy ? (
            <Animated.View key={phase + round} entering={FadeIn.duration(200)} style={styles.coach}>
              <View style={styles.dots}>
                {Array.from({ length: ROUNDS }, (_, i) => (
                  <View key={i} style={[styles.dot, i < round && styles.dotOn]} />
                ))}
                <Text style={styles.roundText}>
                  Round {round} of {ROUNDS}
                </Text>
              </View>
              <Text style={styles.coachTitle}>{copy.title}</Text>
              <Text style={styles.coachBody}>{copy.body}</Text>
              {phase === 'turn' ? <TurnBar active /> : null}
            </Animated.View>
          ) : null}

          <Text style={styles.section}>Tips for you</Text>
          <View style={styles.panel}>
            {wordTips.map((tip) => (
              <View key={tip} style={styles.noteRow}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>{tip}</Text>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowScience((v) => !v)}
            style={styles.scienceToggle}
          >
            <Text style={styles.scienceToggleText}>
              {showScience ? 'Hide' : 'Show'} the research behind this
            </Text>
          </Pressable>
          {showScience ? (
            <View style={styles.panel}>
              {wordScience.map((item) => (
                <View key={item.title} style={styles.sciItem}>
                  <Text style={styles.sciTitle}>{item.title}</Text>
                  <Text style={styles.noteText}>{item.body}</Text>
                </View>
              ))}
              <Text style={styles.disclaimer}>
                Lulla uses research-backed teaching ideas, but it is not affiliated with any show and does not copy
                anyone’s voice. General information, not medical advice.
              </Text>
            </View>
          ) : null}
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
    maxWidth: 480,
  },
  backText: {
    fontFamily: 'Nunito_600SemiBold',
    color: colors.mist,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 34,
    color: colors.foam,
  },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: 'rgba(247,243,234,0.7)',
    marginBottom: spacing.md,
  },
  chipRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  chipOn: {
    backgroundColor: colors.butter,
    borderColor: colors.butter,
  },
  chipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.mist,
  },
  chipTextOn: { color: colors.ink },
  categoryBlurb: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: 'rgba(247,243,234,0.6)',
  },
  card: {
    borderRadius: radii.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emoji: { fontSize: 72 },
  word: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 48,
    color: colors.ink,
    letterSpacing: -1,
    textAlign: 'center',
  },
  phrase: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
    color: colors.sageDeep,
    textAlign: 'center',
  },
  gestureBox: {
    marginTop: spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(28,46,54,0.1)',
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  gestureLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.sageDeep,
  },
  gestureText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.ink,
  },
  nav: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  navLabel: {
    fontFamily: 'Nunito_700Bold',
    color: colors.foam,
    fontSize: 14,
  },
  progress: {
    fontFamily: 'Nunito_600SemiBold',
    color: colors.mist,
  },
  modeRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: radii.pill,
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  modeBtnOn: { backgroundColor: colors.foam },
  modeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.mist,
  },
  modeTextOn: { color: colors.ink },
  modeHint: {
    marginTop: spacing.sm,
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(247,243,234,0.65)',
  },
  recordPanel: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  recordTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 20,
    color: colors.foam,
  },
  recordRow: {
    marginTop: spacing.xs,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  recordCopy: { gap: 2 },
  recordLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.butter,
  },
  recordPrompt: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    lineHeight: 21,
    color: colors.foam,
  },
  recordStatus: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: 'rgba(247,243,234,0.65)',
  },
  recordActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  micBtn: {
    backgroundColor: colors.blush,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  micBtnSaved: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  micBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.ink,
  },
  micBtnTextSaved: { color: colors.foam },
  stopBtn: {
    backgroundColor: colors.butter,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  stopBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.ink,
  },
  smallBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  smallBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.foam,
  },
  recordNudge: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(247,243,234,0.65)',
  },
  recordReady: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.butter,
  },
  errorText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    lineHeight: 19,
    color: '#FFB4A8',
  },
  primary: {
    marginTop: spacing.md,
    backgroundColor: colors.butter,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.ink,
  },
  secondary: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  secondaryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.foam,
  },
  coach: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: spacing.md,
    gap: 6,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotOn: { backgroundColor: colors.butter },
  roundText: {
    marginLeft: spacing.xs,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.mist,
  },
  coachTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 24,
    color: colors.foam,
  },
  coachBody: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
    color: colors.mist,
  },
  barTrack: {
    marginTop: spacing.xs,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.butter,
    borderRadius: 5,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.mist,
  },
  panel: {
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: spacing.md,
  },
  noteRow: { flexDirection: 'row', gap: spacing.sm },
  noteBullet: { color: colors.butter, fontSize: 14, lineHeight: 21 },
  noteText: {
    flex: 1,
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    lineHeight: 21,
    color: colors.mist,
  },
  scienceToggle: { marginTop: spacing.lg, paddingVertical: spacing.sm },
  scienceToggleText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.butter,
    textDecorationLine: 'underline',
  },
  sciItem: { gap: 2 },
  sciTitle: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 16,
    color: colors.foam,
  },
  disclaimer: {
    marginTop: spacing.xs,
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(247,243,234,0.55)',
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
});
