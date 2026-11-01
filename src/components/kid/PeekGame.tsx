import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { kidColors, SoftBounce, type GameProps } from '@/components/kid/kidUi';
import type { KidClip } from '@/data/kidVoice';
import { ANIMALS, animalEmoji, pickMany } from '@/lib/kidLogic';

const COVERS = ['🌳', '🧺', '📦', '🌲', '🪴', '🏠'];

function makeScene(spots: number) {
  return { animal: pickMany(ANIMALS, 1, Math.random)[0], spot: Math.floor(Math.random() * spots) };
}

export function PeekGame({ age, say }: GameProps) {
  const [round, setRound] = useState(0);
  const [opened, setOpened] = useState<number[]>([]);
  const [found, setFound] = useState(false);
  const [bounce, setBounce] = useState(0);

  const [scene, setScene] = useState(() => makeScene(age.spots));

  const cols = age.spots <= 4 ? 2 : 3;

  useEffect(() => {
    void say(`aw-${scene.animal}` as KidClip);
  }, [scene.animal, round, say]);

  const ask = () => void say(`aw-${scene.animal}` as KidClip);

  const tap = (i: number) => {
    if (found || opened.includes(i)) return;
    setOpened((o) => [...o, i]);
    if (i === scene.spot) {
      setFound(true);
      setBounce((b) => b + 1);
      void say('p-peekaboo', `as-${scene.animal}` as KidClip, 'p-found');
      setTimeout(() => {
        setOpened([]);
        setFound(false);
        setScene(makeScene(age.spots));
        setRound((r) => r + 1);
      }, 3600);
    } else {
      void say('p-notthere');
    }
  };

  return (
    <View style={styles.root}>
      <Pressable accessibilityRole="button" accessibilityLabel="Hear the question again" onPress={ask} style={styles.ask}>
        <Text style={styles.askEmoji}>{animalEmoji[scene.animal]}</Text>
        <Text style={styles.askText}>❓</Text>
      </Pressable>
      <View style={styles.grid}>
        {Array.from({ length: age.spots }, (_, i) => {
          const open = opened.includes(i);
          const hasAnimal = i === scene.spot;
          return (
            <View key={`${round}-${i}`} style={[styles.cell, { width: `${100 / cols}%` }]}>
              <SoftBounce trigger={open && hasAnimal ? bounce : 0} style={styles.fill}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Hiding spot ${i + 1}`}
                  onPress={() => tap(i)}
                  style={[styles.tile, { backgroundColor: open ? 'rgba(255,255,255,0.45)' : kidColors.tiles[i % kidColors.tiles.length] }]}
                >
                  {open ? (
                    <Text style={styles.big}>{hasAnimal ? animalEmoji[scene.animal] : '·'}</Text>
                  ) : (
                    <>
                      <Text style={styles.big}>{COVERS[i % COVERS.length]}</Text>
                      {age.hint && hasAnimal ? <Text style={styles.peek}>{animalEmoji[scene.animal]}</Text> : null}
                    </>
                  )}
                </Pressable>
              </SoftBounce>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 8 },
  ask: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 36, paddingHorizontal: 22, paddingVertical: 8 },
  askEmoji: { fontSize: 54 },
  askText: { fontSize: 34 },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'stretch', justifyContent: 'center' },
  cell: { padding: 6, minHeight: 130, flexGrow: 0 },
  fill: { flex: 1 },
  tile: { flex: 1, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  big: { fontSize: 64 },
  peek: { position: 'absolute', top: 6, right: 10, fontSize: 24 },
});
