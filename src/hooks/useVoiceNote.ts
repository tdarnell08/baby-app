import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

export const MAX_VOICE_MS = 60_000;

export function useVoiceNote() {
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, directory: 'document' });
  const state = useAudioRecorderState(recorder, 250);
  const [uri, setUri] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restoreMode = useCallback(
    () =>
      setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
      }).catch(() => {}),
    [],
  );

  const stop = useCallback(async () => {
    if (!recording) return;
    try {
      await recorder.stop();
      setUri(recorder.uri ?? null);
    } catch {
      setError('Could not save that recording. Please try again.');
    } finally {
      setRecording(false);
      void restoreMode();
    }
  }, [recording, recorder, restoreMode]);

  const start = useCallback(async () => {
    setError(null);
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      setError('Allow the microphone in your phone settings, then try again.');
      return;
    }
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
        shouldPlayInBackground: false,
        interruptionMode: 'doNotMix',
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setUri(null);
      setRecording(true);
    } catch {
      setError('Could not start recording. Check the microphone and try again.');
    }
  }, [recorder]);

  const stopRef = useRef(stop);
  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);
  useEffect(() => {
    if (!recording) return;
    const id = setTimeout(() => void stopRef.current(), MAX_VOICE_MS);
    return () => clearTimeout(id);
  }, [recording]);

  const discard = useCallback(() => setUri(null), []);

  return { uri, recording, durationMs: state.durationMillis ?? 0, error, start, stop, discard };
}
