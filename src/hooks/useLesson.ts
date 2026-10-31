import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { createAudioPlayer, type AudioPlayer, type AudioSource } from 'expo-audio';
import type { FirstWord } from '@/data/words';
import { clipsFor, finalPraiseClip, praiseClips } from '@/data/voiceAssets';
import type { ParentClips } from '@/hooks/useParentVoice';

export type LessonPhase = 'idle' | 'listen' | 'together' | 'turn' | 'cheer';
export type VoiceMode = 'app' | 'parent';

export const ROUNDS = 3;
export const TURN_MS = 5000;

const PRAISE = ['Yay!', 'Great job!', 'I love hearing you!', 'Wow, good talking!', 'Yay, you did it!'];
const FINAL_PRAISE = 'Yay! You did it! I love talking with you!';

const WORD_VOICE = { pitch: 1.25, rate: 0.6 };
const PHRASE_VOICE = { pitch: 1.15, rate: 0.78 };
const PRAISE_VOICE = { pitch: 1.3, rate: 0.88 };

const PREFERRED_NAMES = /samantha|ava|allison|zoe|nicky|serena|karen|moira|tessa|fiona|joelle|susan|jenny/i;

function pickVoice(voices: Speech.Voice[]): string | undefined {
  const english = voices.filter((v) => v.language?.toLowerCase().startsWith('en'));
  const pool = english.length > 0 ? english : voices;
  if (pool.length === 0) return undefined;
  const enhanced = pool.filter((v) => v.quality === Speech.VoiceQuality.Enhanced);
  const ranked = [...enhanced, ...pool];
  const named = ranked.find((v) => PREFERRED_NAMES.test(v.name));
  const usEnglish = ranked.find((v) => v.language?.toLowerCase().replace('_', '-') === 'en-us');
  return (named ?? usEnglish ?? ranked[0]).identifier;
}

function speakFallback(text: string, voice: string | undefined, style: { pitch: number; rate: number }) {
  return new Promise<void>((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve();
    };
    timer = setTimeout(finish, 1500 + (text.length * 170) / style.rate);
    Speech.speak(text, {
      language: 'en-US',
      voice,
      pitch: style.pitch,
      rate: style.rate,
      onDone: finish,
      onStopped: finish,
      onError: finish,
    });
  });
}

function playClip(source: AudioSource): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let player: AudioPlayer | null = null;
    let poll: ReturnType<typeof setInterval> | undefined;
    let watchdog: ReturnType<typeof setTimeout> | undefined;

    const finish = (err?: unknown) => {
      if (settled) return;
      settled = true;
      if (poll) clearInterval(poll);
      if (watchdog) clearTimeout(watchdog);
      try {
        player?.pause();
        player?.remove();
      } catch {
        // already released
      }
      if (err) reject(err);
      else resolve();
    };

    try {
      player = createAudioPlayer(source);
      player.volume = 1;
      player.play();
      watchdog = setTimeout(() => finish(), 12000);
      poll = setInterval(() => {
        if (!player) return;
        try {
          const status = player.currentStatus;
          if (
            status?.didJustFinish ||
            (status?.isLoaded && !status.playing && (status.currentTime ?? 0) > 0.05)
          ) {
            finish();
          }
        } catch {
          finish();
        }
      }, 120);
    } catch (err) {
      finish(err);
    }
  });
}

async function speakNatural(
  clip: AudioSource | undefined,
  fallbackText: string,
  voice: string | undefined,
  style: { pitch: number; rate: number },
) {
  if (clip !== undefined) {
    try {
      await playClip(clip);
      return;
    } catch {
      // fall through
    }
  }
  await speakFallback(fallbackText, voice, style);
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const buzz = (kind: 'light' | 'success') => {
  const run =
    kind === 'success'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  void run.catch(() => {});
};

export function useLesson(voiceMode: VoiceMode, parentClips: ParentClips = {}) {
  const [phase, setPhase] = useState<LessonPhase>('idle');
  const [round, setRound] = useState(0);
  const [voice, setVoice] = useState<string | undefined>(undefined);
  const runId = useRef(0);
  const voiceRef = useRef<string | undefined>(undefined);
  const parentRef = useRef(parentClips);

  useEffect(() => {
    parentRef.current = parentClips;
  }, [parentClips]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        if (!mounted) return;
        const chosen = pickVoice(voices);
        voiceRef.current = chosen;
        setVoice(chosen);
      } catch {
        // fall back to the system default voice
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const stop = useCallback(() => {
    runId.current += 1;
    void Speech.stop();
    setPhase('idle');
    setRound(0);
  }, []);

  useEffect(() => stop, [stop]);

  const hear = useCallback(async (word: FirstWord) => {
    runId.current += 1;
    await Speech.stop();
    setPhase('idle');
    const parentSay = parentRef.current.say;
    if (parentSay) {
      await speakNatural({ uri: parentSay }, word.say, voiceRef.current, WORD_VOICE);
      return;
    }
    const clips = clipsFor(word);
    await speakNatural(clips?.say, word.say, voiceRef.current, WORD_VOICE);
  }, []);

  const start = useCallback(
    async (word: FirstWord) => {
      const id = ++runId.current;
      const alive = () => runId.current === id;
      const usingParent = voiceMode === 'parent';
      const bundled = clipsFor(word);
      const parent = parentRef.current;
      await Speech.stop();

      for (let r = 1; r <= ROUNDS; r++) {
        if (!alive()) return;
        setRound(r);

        setPhase('listen');
        buzz('light');
        if (usingParent) {
          if (parent.say) {
            await speakNatural({ uri: parent.say }, word.say, voiceRef.current, WORD_VOICE);
          } else {
            // No recording yet — give the caregiver time to say it live.
            await wait(3200);
          }
        } else {
          await speakNatural(bundled?.say, word.say, voiceRef.current, WORD_VOICE);
        }
        if (!alive()) return;

        if (r === 1) {
          setPhase('together');
          await wait(350);
          if (!alive()) return;
          if (usingParent) {
            if (parent.phrase) {
              await speakNatural({ uri: parent.phrase }, word.phrase, voiceRef.current, PHRASE_VOICE);
            } else {
              await wait(4200);
            }
          } else {
            await speakNatural(bundled?.phrase, word.phrase, voiceRef.current, PHRASE_VOICE);
          }
          if (!alive()) return;
        }

        setPhase('turn');
        buzz('light');
        await wait(TURN_MS);
        if (!alive()) return;

        setPhase('cheer');
        buzz('success');
        if (usingParent) {
          // Keep praise warm and consistent from the app voice.
          if (r === ROUNDS) {
            await speakNatural(finalPraiseClip, FINAL_PRAISE, voiceRef.current, PRAISE_VOICE);
          } else {
            const praiseIndex = (r + word.id.length) % PRAISE.length;
            await speakNatural(praiseClips[praiseIndex], PRAISE[praiseIndex], voiceRef.current, PRAISE_VOICE);
          }
        } else if (r === ROUNDS) {
          await speakNatural(finalPraiseClip, FINAL_PRAISE, voiceRef.current, PRAISE_VOICE);
        } else {
          const praiseIndex = (r + word.id.length) % PRAISE.length;
          await speakNatural(praiseClips[praiseIndex], PRAISE[praiseIndex], voiceRef.current, PRAISE_VOICE);
        }
        if (!alive()) return;
        await wait(500);
      }

      if (alive()) {
        setPhase('idle');
        setRound(0);
      }
    },
    [voiceMode],
  );

  return { phase, round, voice, start, stop, hear };
}
