import { useCallback, useEffect, useRef, useState } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { sleepSounds, volumeOptions } from '@/data/sounds';

export type NightSoundId = 'white' | 'shush';

export const nightSounds: { id: NightSoundId; label: string; soundId: string }[] = [
  { id: 'white', label: 'White noise', soundId: 'balanced' },
  { id: 'shush', label: 'Shush', soundId: 'womb' },
];

const AUTO_OFF_MS = 30 * 60 * 1000;

export function useNightSound() {
  const playerRef = useRef<AudioPlayer | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState<NightSoundId | null>(null);
  const [volume, setVolumeState] = useState<number>(volumeOptions[0].value);
  const [error, setError] = useState<string | null>(null);

  const release = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const current = playerRef.current;
    playerRef.current = null;
    if (!current) return;
    try {
      current.pause();
      current.remove();
    } catch {
      // player already released
    }
  }, []);

  const stop = useCallback(() => {
    release();
    setActive(null);
  }, [release]);

  useEffect(() => release, [release]);

  const play = useCallback(
    async (id: NightSoundId) => {
      setError(null);
      const entry = nightSounds.find((n) => n.id === id);
      const sound = sleepSounds.find((s) => s.id === entry?.soundId);
      if (!sound) return;
      release();
      try {
        await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'duckOthers' });
        const player = createAudioPlayer(sound.source);
        player.loop = true;
        player.volume = volume;
        player.play();
        playerRef.current = player;
        timerRef.current = setTimeout(stop, AUTO_OFF_MS);
        setActive(id);
      } catch {
        setError('Could not start the sound. Try again.');
        setActive(null);
      }
    },
    [release, stop, volume],
  );

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    try {
      if (playerRef.current) playerRef.current.volume = value;
    } catch {
      // player released
    }
  }, []);

  return { active, volume, error, play, stop, setVolume };
}
