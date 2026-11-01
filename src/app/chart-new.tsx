import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image, Platform, Switch, Text, View } from 'react-native';
import { Body, Btn, Field, Notice, Panel, Screen, Section, Title, uiStyles } from '@/components/ui';
import { colors, radii } from '@/constants/theme';
import { chartConfirmNote } from '@/data/sickGuide';
import { useCharts } from '@/hooks/useCharts';
import { MAX_CHART_PHOTOS, MAX_CHART_ROWS, type ChartRow } from '@/lib/chartStore';
import { sanitizeText } from '@/lib/courseLogic';
import { deleteMedia, mediaUri, savePhoto } from '@/lib/media';

const GRADIENT: [string, string, string] = ['#2B2437', '#3B3150', '#4A3D63'];

export default function NewChartScreen() {
  const router = useRouter();
  const { add, charts } = useCharts();
  const [name, setName] = useState('');
  const [ingredient, setIngredient] = useState('');
  const [note, setNote] = useState('');
  const [rows, setRows] = useState<ChartRow[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const photosRef = useRef(photos);
  const savedRef = useRef(false);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(
    () => () => {
      if (!savedRef.current) photosRef.current.forEach(deleteMedia);
    },
    [],
  );

  const remaining = MAX_CHART_PHOTOS - photos.length;
  const filledRows = rows.filter((r) => r.range.trim() || r.dose.trim());
  const nameOk = sanitizeText(name, 60).length > 0;
  const hasContent = photos.length > 0 || filledRows.length > 0;
  const canSave = nameOk && hasContent && (filledRows.length === 0 || confirmed) && !busy;

  const addAssets = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setBusy(true);
    try {
      const saved: string[] = [];
      for (const asset of assets.slice(0, remaining)) saved.push(await savePhoto(asset.uri, asset.width, true));
      setPhotos((prev) => [...prev, ...saved].slice(0, MAX_CHART_PHOTOS));
    } catch {
      setMessage('That photo could not be added. Please try another.');
    } finally {
      setBusy(false);
    }
  };

  const pick = async () => {
    setMessage(null);
    if (remaining <= 0) return;
    if (Platform.OS !== 'web') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setMessage('Allow photo access in your phone settings to add a photo.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: remaining, quality: 1, exif: false });
    if (!result.canceled) await addAssets(result.assets);
  };

  const snap = async () => {
    setMessage(null);
    if (remaining <= 0) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setMessage('Allow camera access in your phone settings to photograph the package.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1, exif: false });
    if (!result.canceled) await addAssets(result.assets);
  };

  const removePhoto = (ref: string) => {
    deleteMedia(ref);
    setPhotos((prev) => prev.filter((p) => p !== ref));
  };

  const setRow = (i: number, patch: Partial<ChartRow>) => setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const save = () => {
    if (!canSave) return;
    savedRef.current = true;
    add({
      name: sanitizeText(name, 60),
      activeIngredient: sanitizeText(ingredient, 60),
      note: sanitizeText(note, 200),
      rows: filledRows.map((r) => ({ range: sanitizeText(r.range, 40), dose: sanitizeText(r.dose, 60) })),
      photos,
    });
    router.replace('/sick-charts');
  };

  return (
    <Screen gradient={GRADIENT} back="← Dosing charts" backTo="/sick-charts">
      <Title sub="Save the chart from the package so it is handy when you need it.">Add a package chart</Title>

      <Notice tone="danger" title="Confirm before you give">
        {chartConfirmNote}
      </Notice>

      {charts.length >= 12 ? <Body tone="warn">You have saved the maximum number of charts. Delete one to add another.</Body> : null}

      <Panel>
        <Field label="Product name" value={name} onChangeText={setName} placeholder="As printed on the package" maxLength={60} autoCapitalize="words" />
        <Field label="Active ingredient (optional)" value={ingredient} onChangeText={setIngredient} placeholder="As printed in the Drug Facts" maxLength={60} hint="Helps you avoid giving the same ingredient twice." />
      </Panel>

      <Section>Photo of the package chart ({photos.length} of {MAX_CHART_PHOTOS})</Section>
      <Panel>
        {photos.length > 0 ? (
          <View style={{ gap: 10 }}>
            {photos.map((p) => (
              <View key={p} style={{ gap: 6 }}>
                <Image source={{ uri: mediaUri(p) }} style={{ width: '100%', height: 200, borderRadius: radii.sm, backgroundColor: 'rgba(0,0,0,0.25)' }} resizeMode="contain" accessibilityLabel="Photo of the package dosing chart" />
                <Btn label="Remove photo" kind="ghost" small onPress={() => removePhoto(p)} />
              </View>
            ))}
          </View>
        ) : (
          <Body tone="muted">Photograph the dosing chart on the box or bottle. Make sure every line is sharp and readable.</Body>
        )}
        <View style={uiStyles.row}>
          <Btn label="Take photo" kind="secondary" onPress={snap} disabled={busy || remaining <= 0} style={uiStyles.flex} />
          <Btn label="Choose photo" kind="secondary" onPress={pick} disabled={busy || remaining <= 0} style={uiStyles.flex} />
        </View>
        <Body tone="muted">The photo is saved only on this phone, in the app’s private storage.</Body>
        {message ? <Body tone="warn">{message}</Body> : null}
      </Panel>

      <Section>Or type the table from the label</Section>
      <Panel>
        <Body tone="muted">Copy each line exactly as printed on the package. Lulla never fills in or changes these amounts.</Body>
        {rows.map((r, i) => (
          <View key={i} style={{ gap: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 8 }}>
            <Field label={`Line ${i + 1}: weight or age`} value={r.range} onChangeText={(v) => setRow(i, { range: v })} placeholder="As printed on the package" maxLength={40} />
            <Field label={`Line ${i + 1}: dose`} value={r.dose} onChangeText={(v) => setRow(i, { dose: v })} placeholder="As printed on the package" maxLength={60} />
            <Btn label="Remove this line" kind="ghost" small onPress={() => setRows((prev) => prev.filter((_, idx) => idx !== i))} />
          </View>
        ))}
        {rows.length < MAX_CHART_ROWS ? (
          <Btn label={rows.length === 0 ? 'Add a line' : 'Add another line'} kind="secondary" small onPress={() => setRows((prev) => [...prev, { range: '', dose: '' }])} />
        ) : null}
        <Field label="Other text from the package (optional)" value={note} onChangeText={setNote} multiline maxLength={200} placeholder="For example: the strength or how often, as printed" />
      </Panel>

      {filledRows.length > 0 ? (
        <Panel>
          <View style={uiStyles.row}>
            <View style={uiStyles.flex}>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam }}>I copied this table exactly as printed on the package.</Text>
            </View>
            <Switch accessibilityLabel="I copied the table exactly" value={confirmed} onValueChange={setConfirmed} trackColor={{ true: colors.butter, false: 'rgba(255,255,255,0.2)' }} />
          </View>
        </Panel>
      ) : null}

      <Btn label="Save chart" onPress={save} disabled={!canSave} />
      {!canSave ? (
        <Body tone="muted">
          {!nameOk ? 'Add the product name. ' : ''}
          {!hasContent ? 'Add a photo or at least one line of the table. ' : ''}
          {filledRows.length > 0 && !confirmed ? 'Confirm the table matches the package.' : ''}
        </Body>
      ) : null}
    </Screen>
  );
}
