import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RecordingPresets,
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { deleteFileQuietly } from '@/lib/files';

export type ParentClipKind = 'say' | 'phrase';

export type ParentClips = {
  say?: string;
  phrase?: string;
};

type Library = Record<string, ParentClips>;

export const VOICE_STORAGE_KEY = 'lulla.parentVoices.v1';
const STORAGE_KEY = VOICE_STORAGE_KEY;

export async function wipeParentVoices() {
  try {
    const library = await loadLibrary();
    for (const clips of Object.values(library)) {
      deleteFileQuietly(clips?.say);
      deleteFileQuietly(clips?.phrase);
    }
  } finally {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}

async function loadLibrary(): Promise<Library> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Library;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function saveLibrary(library: Library) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

function formatMs(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function useParentVoice(wordId: string) {
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    directory: 'document',
  });
  const recorderState = useAudioRecorderState(recorder, 200);

  const [library, setLibrary] = useState<Library>({});
  const [ready, setReady] = useState(false);
  const [recordingKind, setRecordingKind] = useState<ParentClipKind | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clips = library[wordId] ?? {};

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const stored = await loadLibrary();
      if (mounted) {
        setLibrary(stored);
        setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const ensureMic = useCallback(async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      setPermissionDenied(true);
      setError('Allow the microphone, then try again.');
      return false;
    }
    setPermissionDenied(false);
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
    });
    return true;
  }, []);

  const startRecording = useCallback(
    async (kind: ParentClipKind) => {
      setError(null);
      const ok = await ensureMic();
      if (!ok) return;
      try {
        if (recorderState.isRecording) {
          await recorder.stop();
        }
        await recorder.prepareToRecordAsync();
        recorder.record();
        setRecordingKind(kind);
      } catch {
        setError('Could not start recording. Check the microphone and try again.');
        setRecordingKind(null);
      }
    },
    [ensureMic, recorder, recorderState.isRecording],
  );

  const stopRecording = useCallback(async () => {
    if (!recordingKind) return;
    const kind = recordingKind;
    try {
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) {
        setError('Nothing was captured. Tap record and speak a little louder.');
        setRecordingKind(null);
        return;
      }
      setLibrary((prev) => {
        const next: Library = {
          ...prev,
          [wordId]: {
            ...prev[wordId],
            [kind]: uri,
          },
        };
        void saveLibrary(next);
        return next;
      });
    } catch {
      setError('Could not save that recording. Please try again.');
    } finally {
      setRecordingKind(null);
      void setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
      }).catch(() => {});
    }
  }, [recordingKind, recorder, wordId]);

  const playClip = useCallback(
    async (kind: ParentClipKind) => {
      const uri = library[wordId]?.[kind];
      if (!uri) return;
      const player = createAudioPlayer({ uri });
      try {
        player.play();
        await new Promise<void>((resolve) => {
          const started = Date.now();
          const poll = setInterval(() => {
            try {
              const status = player.currentStatus;
              const done =
                status?.didJustFinish ||
                (status?.isLoaded && !status.playing && (status.currentTime ?? 0) > 0.05) ||
                Date.now() - started > 12000;
              if (done) {
                clearInterval(poll);
                resolve();
              }
            } catch {
              clearInterval(poll);
              resolve();
            }
          }, 120);
        });
      } finally {
        try {
          player.pause();
          player.remove();
        } catch {
          // released
        }
      }
    },
    [library, wordId],
  );

  const clearClip = useCallback(
    (kind: ParentClipKind) => {
      deleteFileQuietly(library[wordId]?.[kind]);
      setLibrary((prev) => {
        const current = { ...(prev[wordId] ?? {}) };
        delete current[kind];
        const next = { ...prev };
        if (!current.say && !current.phrase) delete next[wordId];
        else next[wordId] = current;
        void saveLibrary(next);
        return next;
      });
    },
    [library, wordId],
  );

  const clearWord = useCallback(() => {
    deleteFileQuietly(library[wordId]?.say);
    deleteFileQuietly(library[wordId]?.phrase);
    setLibrary((prev) => {
      const next = { ...prev };
      delete next[wordId];
      void saveLibrary(next);
      return next;
    });
  }, [library, wordId]);

  return {
    ready,
    clips,
    isRecording: !!recordingKind && recorderState.isRecording,
    recordingKind,
    recordingLabel: formatMs(recorderState.durationMillis ?? 0),
    permissionDenied,
    error,
    startRecording,
    stopRecording,
    playClip,
    clearClip,
    clearWord,
  };
}
