import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { Body, Btn, Chip, Field, Notice, Panel, Screen, Section, Stepper, Title, uiStyles } from '@/components/ui';
import { PlusLock } from '@/components/PlusLock';
import { VoicePlay } from '@/components/VoicePlay';
import { colors, radii } from '@/constants/theme';
import { dateKey } from '@/data/plan';
import { FREE_MEMORY_LIMIT } from '@/data/pricing';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useMemories } from '@/hooks/useMemories';
import { MAX_VOICE_MS, useVoiceNote } from '@/hooks/useVoiceNote';
import { computeAge } from '@/lib/age';
import { sanitizeText } from '@/lib/courseLogic';
import { deleteMedia, mediaUri, saveAudio, savePhoto } from '@/lib/media';
import { MAX_PHOTOS, type MemoryKind } from '@/lib/memoryStore';

function secs(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${`${s % 60}`.padStart(2, '0')}`;
}

function dayLabel(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const rel = offset === 0 ? 'Today' : offset === -1 ? 'Yesterday' : '';
  const text = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: offset < -300 ? 'numeric' : undefined });
  return rel ? `${rel}, ${text}` : text;
}

export default function NewMemoryScreen() {
  const params = useLocalSearchParams<{ kind?: string; refId?: string; title?: string }>();
  const router = useRouter();
  const { profile, isPremium } = useBabyProfile();
  const { memories, add, ready } = useMemories();
  const voice = useVoiceNote();

  const kind: MemoryKind = params.kind === 'milestone' || params.kind === 'word' ? params.kind : 'moment';
  const [title, setTitle] = useState(() => (typeof params.title === 'string' ? params.title.slice(0, 80) : ''));
  const [note, setNote] = useState('');
  const [dayOffset, setDayOffset] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [voiceRef, setVoiceRef] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mediaRef = useRef({ photos, voiceRef });
  const savedRef = useRef(false);
  useEffect(() => {
    mediaRef.current = { photos, voiceRef };
  }, [photos, voiceRef]);
  useEffect(
    () => () => {
      if (savedRef.current) return;
      mediaRef.current.photos.forEach(deleteMedia);
      deleteMedia(mediaRef.current.voiceRef);
    },
    [],
  );

  const { uri: recordedUri, discard } = voice;
  useEffect(() => {
    if (!recordedUri || voice.recording) return;
    let alive = true;
    saveAudio(recordedUri)
      .then((ref) => {
        if (!alive) {
          deleteMedia(ref);
          return;
        }
        setVoiceRef((prev) => {
          deleteMedia(prev);
          return ref;
        });
      })
      .catch(() => setMessage('Could not save that voice clip.'))
      .finally(discard);
    return () => {
      alive = false;
    };
  }, [recordedUri, voice.recording, discard]);

  const overLimit = ready && !isPremium && memories.length >= FREE_MEMORY_LIMIT;
  const remaining = MAX_PHOTOS - photos.length;

  const addAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setBusy(true);
    try {
      const saved: string[] = [];
      for (const asset of assets.slice(0, remaining)) saved.push(await savePhoto(asset.uri, asset.width));
      setPhotos((prev) => [...prev, ...saved].slice(0, MAX_PHOTOS));
    } catch {
      setMessage('That photo could not be added. Please try another.');
    } finally {
      setBusy(false);
    }
  };

  const pickPhotos = async () => {
    setMessage(null);
    if (remaining <= 0) return;
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setMessage('Allow photo access in your phone settings to add photos.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 1,
      exif: false,
    });
    if (!result.canceled) await addAssets(result.assets);
  };

  const takePhoto = async () => {
    setMessage(null);
    if (remaining <= 0) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setMessage('Allow camera access in your phone settings to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1, exif: false });
    if (!result.canceled) await addAssets(result.assets);
  };

  const removePhoto = (ref: string) => {
    deleteMedia(ref);
    setPhotos((prev) => prev.filter((p) => p !== ref));
  };

  const clean = sanitizeText(title, 80);
  const canSave = !overLimit && clean.length > 0 && !busy && !voice.recording;

  const save = () => {
    if (!canSave) return;
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    savedRef.current = true;
    add({
      kind,
      refId: typeof params.refId === 'string' ? params.refId.slice(0, 80) : null,
      title: clean,
      note: sanitizeText(note, 300),
      date: dateKey(date),
      ageLabel: computeAge(profile, date).ageLabel,
      photos,
      voice: voiceRef,
    });
    router.replace('/memories');
  };

  const heading = kind === 'milestone' ? 'Save this milestone' : kind === 'word' ? 'Save a first word' : 'Save a moment';

  return (
    <Screen gradient={['#3A2A3F', '#4B3452', '#5F4560']} back="← Memory book" backTo="/memories">
      <Title sub="Stays on this phone, in the app’s private storage. Nothing is uploaded.">{heading}</Title>

      {overLimit ? (
        <PlusLock
          title={`You’ve saved ${FREE_MEMORY_LIMIT} free memories`}
          body="Lulla Plus lets you keep as many as you like, with the monthly recap and keepsake PDFs. Your saved memories stay free to view."
        />
      ) : !isPremium ? (
        <Body tone="muted">
          {memories.length} of {FREE_MEMORY_LIMIT} free memories used.
        </Body>
      ) : null}

      <Panel>
        <Field
          label={kind === 'moment' ? 'Today they…' : kind === 'word' ? 'The word' : 'Milestone'}
          value={title}
          onChangeText={setTitle}
          placeholder={kind === 'moment' ? 'laughed at the dog for the first time' : ''}
          maxLength={80}
        />
        <Field label="A note (optional)" value={note} onChangeText={setNote} multiline maxLength={300} placeholder="Who was there? What made it special?" />
        <Stepper
          label="When"
          value={dayLabel(dayOffset)}
          onMinus={() => setDayOffset((d) => Math.max(-730, d - 1))}
          onPlus={() => setDayOffset((d) => Math.min(0, d + 1))}
          plusDisabled={dayOffset >= 0}
        />
        <View style={uiStyles.wrap}>
          <Chip label="Today" selected={dayOffset === 0} onPress={() => setDayOffset(0)} />
          <Chip label="Yesterday" selected={dayOffset === -1} onPress={() => setDayOffset(-1)} />
          <Chip label="Last week" selected={dayOffset === -7} onPress={() => setDayOffset(-7)} />
        </View>
      </Panel>

      <Section>Photos ({photos.length} of {MAX_PHOTOS})</Section>
      <Panel>
        {photos.length > 0 ? (
          <View style={uiStyles.wrap}>
            {photos.map((p) => (
              <View key={p} style={{ gap: 4 }}>
                <Image source={{ uri: mediaUri(p) }} style={styles.thumb} accessibilityLabel="Attached photo" />
                <Btn label="Remove" kind="ghost" small onPress={() => removePhoto(p)} />
              </View>
            ))}
          </View>
        ) : (
          <Body tone="muted">Add up to {MAX_PHOTOS} photos. They’re resized and saved privately in Lulla.</Body>
        )}
        <View style={uiStyles.row}>
          <Btn label={busy ? 'Adding…' : 'Choose photos'} kind="secondary" small disabled={remaining <= 0 || busy} onPress={pickPhotos} style={uiStyles.flex} />
          {Platform.OS !== 'web' ? (
            <Btn label="Take a photo" kind="secondary" small disabled={remaining <= 0 || busy} onPress={takePhoto} style={uiStyles.flex} />
          ) : null}
        </View>
      </Panel>

      <Section>Voice clip</Section>
      <Panel>
        {voice.recording ? (
          <>
            <Text style={styles.rec}>● Recording {secs(voice.durationMs)} / {secs(MAX_VOICE_MS)}</Text>
            <Btn label="Stop" onPress={() => void voice.stop()} />
          </>
        ) : voiceRef ? (
          <>
            <VoicePlay source={voiceRef} />
            <Btn
              label="Remove clip"
              kind="ghost"
              small
              onPress={() => {
                deleteMedia(voiceRef);
                setVoiceRef(null);
              }}
            />
          </>
        ) : (
          <>
            <Body tone="muted">Record up to a minute: a giggle, a first word, or a family member saying hello.</Body>
            <Btn label="Record a clip" kind="secondary" small onPress={() => void voice.start()} />
          </>
        )}
        {voice.error ? <Body tone="warn">{voice.error}</Body> : null}
      </Panel>

      {message ? <Notice tone="warn">{message}</Notice> : null}
      <Btn label="Save to memory book" onPress={save} disabled={!canSave} />
      {!clean ? <Body tone="muted">Add a few words to describe the memory.</Body> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  thumb: { width: 96, height: 96, borderRadius: radii.sm, backgroundColor: 'rgba(255,255,255,0.1)' },
  rec: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.blush },
});
