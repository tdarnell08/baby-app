import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Btn, Notice, Panel, Screen, Section, Title } from '@/components/ui';
import { colors, radii } from '@/constants/theme';
import { chartConfirmNote, chartSafetyRules } from '@/data/sickGuide';
import { useCharts } from '@/hooks/useCharts';
import { mediaUri } from '@/lib/media';

const GRADIENT: [string, string, string] = ['#2B2437', '#3B3150', '#4A3D63'];

export default function ChartsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { charts, ready, remove } = useCharts();
  const [zoom, setZoom] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  return (
    <Screen gradient={GRADIENT} back="← Sick Day" backTo="/sick">
      <Title sub="The dosing chart printed on the package, kept where you can find it at 3 a.m.">Package dosing charts</Title>

      <Notice tone="danger" title="Confirm with your pediatrician or pharmacist">
        {chartConfirmNote}
      </Notice>

      <Panel>
        <Body>
          Lulla does not calculate doses and does not suggest an amount. It only keeps the chart that came on the package, as a photo you took or a table you typed, so you can read it again.
        </Body>
        <Btn label="Add a package chart" onPress={() => router.push('/chart-new')} />
      </Panel>

      <Section>Saved charts</Section>
      {charts.length === 0 ? (
        <Panel>
          <Body>{ready ? 'No charts yet. Photograph the dosing chart on the box or bottle, or type its table from the label.' : 'Loading…'}</Body>
        </Panel>
      ) : (
        charts.map((c) => (
          <Panel key={c.id}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 21, color: colors.foam }}>{c.name}</Text>
            {c.activeIngredient ? <Body tone="muted">Active ingredient: {c.activeIngredient}</Body> : null}
            {c.photos.map((p) => (
              <Pressable key={p} accessibilityRole="button" accessibilityLabel={`Enlarge the chart photo for ${c.name}`} onPress={() => setZoom(p)}>
                <Image source={{ uri: mediaUri(p) }} style={{ width: '100%', height: 220, borderRadius: radii.sm, backgroundColor: 'rgba(0,0,0,0.25)' }} resizeMode="contain" />
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.butter, marginTop: 4 }}>Tap to enlarge</Text>
              </Pressable>
            ))}
            {c.rows.length > 0 ? (
              <View>
                <Body tone="muted">Typed from the label by you</Body>
                {c.rows.map((r, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingVertical: 8 }}>
                    <Text style={{ flex: 1, fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam }}>{r.range}</Text>
                    <Text style={{ flex: 1, fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: colors.butter }}>{r.dose}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {c.note ? <Body tone="muted">{c.note}</Body> : null}
            <Body tone="warn">Confirm with your pediatrician or pharmacist before giving.</Body>
            {confirm === c.id ? (
              <View style={{ gap: 8 }}>
                <Body tone="warn">Delete this chart and its photos from your phone?</Body>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Btn label="Cancel" kind="secondary" small onPress={() => setConfirm(null)} style={{ flex: 1 }} />
                  <Btn label="Delete" kind="danger" small onPress={() => { remove(c.id); setConfirm(null); }} style={{ flex: 1 }} />
                </View>
              </View>
            ) : (
              <Btn label="Delete chart" kind="ghost" small onPress={() => setConfirm(c.id)} />
            )}
          </Panel>
        ))
      )}

      <Section>Safe use</Section>
      <Panel>
        {chartSafetyRules.map((r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ color: colors.butter }}>•</Text>
            <View style={{ flex: 1 }}>
              <Body>{r}</Body>
            </View>
          </View>
        ))}
      </Panel>

      <Modal visible={zoom !== null} transparent animationType="fade" onRequestClose={() => setZoom(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}>
          <ScrollView maximumZoomScale={4} minimumZoomScale={1} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} centerContent>
            {zoom ? <Image source={{ uri: mediaUri(zoom) }} style={{ width: '100%', height: 560 }} resizeMode="contain" accessibilityLabel="Enlarged package dosing chart" /> : null}
          </ScrollView>
          <Text style={{ textAlign: 'center', color: colors.blush, fontFamily: 'Nunito_700Bold', fontSize: 13, paddingHorizontal: 20, paddingTop: 8 }}>
            Confirm with your pediatrician or pharmacist before giving any medicine.
          </Text>
          <View style={{ padding: 16 }}>
            <Btn label="Close" onPress={() => setZoom(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
