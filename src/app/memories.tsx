import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Body, Btn, Notice, Panel, Screen, Title, uiStyles } from '@/components/ui';
import { PlusLock } from '@/components/PlusLock';
import { VoicePlay } from '@/components/VoicePlay';
import { colors, radii, spacing } from '@/constants/theme';
import { FREE_MEMORY_LIMIT } from '@/data/pricing';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useMemories } from '@/hooks/useMemories';
import { mediaUri } from '@/lib/media';
import { monthName } from '@/lib/keepsake';
import type { Memory } from '@/lib/memoryStore';

const kindEmoji = { milestone: '🌟', word: '🗣️', moment: '💛' } as const;

function prettyDate(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function MemoriesScreen() {
  const router = useRouter();
  const { isPremium } = useBabyProfile();
  const { memories, ready, remove } = useMemories();
  const [confirming, setConfirming] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, Memory[]>();
    for (const m of memories) map.set(m.date.slice(0, 7), [...(map.get(m.date.slice(0, 7)) ?? []), m]);
    return Array.from(map.entries());
  }, [memories]);

  const atLimit = !isPremium && memories.length >= FREE_MEMORY_LIMIT;

  return (
    <Screen gradient={['#3A2A3F', '#4B3452', '#5F4560']}>
      <Title sub="Photos, voice clips, and little moments, kept privately on this phone.">Memory book</Title>

      <View style={uiStyles.row}>
        <Btn label="Add a moment" onPress={() => router.push({ pathname: '/memory-new', params: { kind: 'moment' } })} style={uiStyles.flex} disabled={atLimit} />
        <Btn label="Monthly recap" kind="secondary" onPress={() => router.push('/recap')} style={uiStyles.flex} />
      </View>

      {!isPremium ? (
        atLimit ? (
          <PlusLock
            title={`${FREE_MEMORY_LIMIT} of ${FREE_MEMORY_LIMIT} free memories used`}
            body="Upgrade to keep unlimited memories, see the monthly recap, and export month or year keepsake PDFs."
          />
        ) : (
          <Body tone="muted">
            {memories.length} of {FREE_MEMORY_LIMIT} free memories used. Plus keeps unlimited memories and makes keepsake PDFs.
          </Body>
        )
      ) : null}

      {!ready ? <Body>Loading…</Body> : null}
      {ready && memories.length === 0 ? (
        <Panel>
          <Text style={styles.emptyTitle}>Your first memory starts here</Text>
          <Body>
            Tap “Add a moment”, or save a milestone from the Milestone tracker or a first word from First words. Add a photo or a voice clip if you like.
          </Body>
        </Panel>
      ) : null}

      {groups.map(([key, items]) => {
        const [y, m] = key.split('-').map(Number);
        return (
          <View key={key} style={{ gap: spacing.sm }}>
            <Text style={styles.month}>{monthName(y, m)}</Text>
            {items.map((memory) => (
              <Panel key={memory.id}>
                <Text style={styles.meta}>
                  {kindEmoji[memory.kind]} {prettyDate(memory.date)}
                  {memory.ageLabel ? ` · ${memory.ageLabel}` : ''}
                </Text>
                <Text style={styles.cardTitle}>{memory.title}</Text>
                {memory.note ? <Body>{memory.note}</Body> : null}
                {memory.photos.length > 0 ? (
                  <View style={styles.photos}>
                    {memory.photos.map((p) => (
                      <Image
                        key={p.slice(-24)}
                        source={{ uri: mediaUri(p) }}
                        accessibilityLabel={`Photo for ${memory.title}`}
                        style={[styles.photo, memory.photos.length === 1 && styles.photoSolo]}
                      />
                    ))}
                  </View>
                ) : null}
                {memory.voice ? <VoicePlay source={memory.voice} /> : null}
                {confirming === memory.id ? (
                  <View style={uiStyles.row}>
                    <Btn label="Keep it" kind="secondary" small onPress={() => setConfirming(null)} style={uiStyles.flex} />
                    <Btn
                      label="Delete memory"
                      kind="danger"
                      small
                      onPress={() => {
                        remove(memory.id);
                        setConfirming(null);
                      }}
                      style={uiStyles.flex}
                    />
                  </View>
                ) : (
                  <Btn label="Delete" kind="ghost" small onPress={() => setConfirming(memory.id)} style={{ alignSelf: 'flex-start' }} />
                )}
              </Panel>
            ))}
          </View>
        );
      })}

      {memories.length > 0 ? (
        isPremium ? (
          <Btn label="Make a keepsake PDF" kind="secondary" onPress={() => router.push('/recap')} />
        ) : (
          <PlusLock title="Keepsake PDFs" body="Turn any month or the whole year into a beautifully laid out PDF to print or share with grandparents. Made on your phone." />
        )
      ) : null}

      <Notice tone="info" title="Private by design">
        Memories are stored only on this device. Photos are resized and saved in Lulla’s private storage, and the memory text is kept in encrypted secure storage. Delete all data in Settings removes everything.
      </Notice>
    </Screen>
  );
}

const styles = StyleSheet.create({
  month: { fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: colors.foam, marginTop: spacing.sm },
  meta: { fontFamily: 'Nunito_700Bold', fontSize: 12, letterSpacing: 0.4, color: colors.mist },
  cardTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: colors.foam },
  emptyTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: colors.foam },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photo: { width: 96, height: 96, borderRadius: radii.sm, backgroundColor: 'rgba(255,255,255,0.1)' },
  photoSolo: { width: '100%', height: 220 },
});
