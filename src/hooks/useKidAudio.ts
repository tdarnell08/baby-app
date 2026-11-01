import { useCallback, useEffect, useRef } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { kidVoice, type KidClip } from '@/data/kidVoice';

function playOne(source: number, hold: (p: AudioPlayer | null) => void): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    let poll: ReturnType<typeof setInterval> | undefined;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    let player: AudioPlayer | null = null;
    const finish = () => {
      if (done) return;
      done = true;
      if (poll) clearInterval(poll);
      if (watchdog) clearTimeout(watchdog);
      try {
        player?.pause();
        player?.remove();
      } catch {
        // already released
      }
      hold(null);
      resolve();
    };
    try {
      player = createAudioPlayer(source);
      player.volume = 0.9;
      hold(player);
      player.play();
      watchdog = setTimeout(finish, 6000);
      poll = setInterval(() => {
        try {
          const status = player?.currentStatus;
          if (status?.didJustFinish || (status?.isLoaded && !status.playing && (status.currentTime ?? 0) > 0.05)) finish();
        } catch {
          finish();
        }
      }, 100);
    } catch {
      finish();
    }
  });
}

export function useKidAudio(enabled: boolean) {
  const token = useRef(0);
  const current = useRef<AudioPlayer | null>(null);

  const hold = useCallback((p: AudioPlayer | null) => {
    current.current = p;
  }, []);

  const stop = useCallback(() => {
    token.current += 1;
    const p = current.current;
    current.current = null;
    try {
      p?.pause();
      p?.remove();
    } catch {
      // already released
    }
  }, []);

  const say = useCallback(
    async (...clips: KidClip[]) => {
      if (!enabled) return;
      stop();
      const mine = token.current;
      for (const clip of clips) {
        if (token.current !== mine) return;
        await playOne(kidVoice[clip], hold);
      }
    },
    [enabled, hold, stop],
  );

  useEffect(() => stop, [stop]);

  return { say, stop };
}
