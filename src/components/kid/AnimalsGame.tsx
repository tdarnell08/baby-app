import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { kidColors, SoftBounce, type GameProps } from '@/components/kid/kidUi';
import type { KidClip } from '@/data/kidVoice';
import { ANIMALS, animalEmoji, type AnimalId } from '@/lib/kidLogic';

export function AnimalsGame({ age, say }: GameProps) {
  const animals = useMemo(() => ANIMALS.slice(0, age.animals), [age.animals]);
  const [taps, setTaps] = useState<Record<string, number>>({});
  const [active, setActive] = useState<AnimalId | null>(null);
  const cols = animals.length <= 6 ? 2 : 3;

  const tap = (id: AnimalId) => {
    setActive(id);
    setTaps((t) => ({ ...t, [id]: (t[id] ?? 0) + 1 }));
    void say(`as-${id}` as KidClip, `an-${id}` as KidClip);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.name}>{active ? active[0].toUpperCase() + active.slice(1) : ' '}</Text>
      <View style={styles.grid}>
        {animals.map((id, i) => (
          <View key={id} style={[styles.cell, { width: `${100 / cols}%` }]}>
            <SoftBounce trigger={taps[id] ?? 0} style={styles.fill}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={id}
                onPress={() => tap(id)}
                style={[styles.tile, { backgroundColor: kidColors.tiles[i % kidColors.tiles.length] }, active === id && styles.on]}
              >
                <Text style={[styles.emoji, { fontSize: cols === 2 ? 76 : animals.length > 9 ? 52 : 62 }]}>{animalEmoji[id]}</Text>
              </Pressable>
            </SoftBounce>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 8 },
  name: { fontFamily: 'Fraunces_700Bold', fontSize: 44, lineHeight: 52, textAlign: 'center', color: kidColors.ink, minHeight: 56 },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'stretch' },
  cell: { padding: 6, height: undefined, flexGrow: 1 },
  fill: { flex: 1 },
  tile: { flex: 1, minHeight: 90, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  on: { borderColor: 'rgba(255,255,255,0.95)' },
  emoji: {},
});
