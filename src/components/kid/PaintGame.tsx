import { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BigButton, kidColors, makeBox, type GameProps } from '@/components/kid/kidUi';
import type { KidClip } from '@/data/kidVoice';
import { KID_COLORS, coverage, letterStrokes, letterTargets, type Pt } from '@/lib/kidLogic';

type Stroke = { color: string; pts: Pt[] };

const MAX_POINTS = 3000;

function pathOf(pts: Pt[]) {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0][0]} ${pts[0][1]} L${pts[0][0] + 0.1} ${pts[0][1]}`;
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`).join(' ');
}

export function PaintGame({ age, say }: GameProps) {
  const canTrace = !age.paintOnly;
  const [mode, setMode] = useState<'paint' | 'trace'>(canTrace ? 'trace' : 'paint');
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState<string>(KID_COLORS[1].hex);
  const [letterIndex, setLetterIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [live] = useState(() => makeBox({ mode, color, box, done, letter: age.letters[0] ?? 'a', touched: [] as Pt[], total: 0 }));

  const letter = age.letters[letterIndex % Math.max(1, age.letters.length)] ?? 'a';
  const side = Math.max(1, Math.min(box.w, box.h) * 0.92);
  const offX = (box.w - side) / 2;
  const offY = (box.h - side) / 2;

  useEffect(() => {
    live.patch({ mode, color, box, done, letter });
  });

  const [responder] = useState(() => {
    const add = (x: number, y: number, fresh: boolean) => {
      const l = live.get();
      if (l.total > MAX_POINTS) return;
      live.patch({ total: l.total + 1 });
      setStrokes((prev) => {
        if (fresh || prev.length === 0) return [...prev, { color: l.color, pts: [[x, y]] }];
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...last, pts: [...last.pts, [x, y]] }];
      });
      if (l.mode === 'trace' && !l.done) {
        const s = Math.max(1, Math.min(l.box.w, l.box.h) * 0.92);
        l.touched.push([((x - (l.box.w - s) / 2) / s) * 100, ((y - (l.box.h - s) / 2) / s) * 100]);
      }
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => add(e.nativeEvent.locationX, e.nativeEvent.locationY, true),
      onPanResponderMove: (e) => add(e.nativeEvent.locationX, e.nativeEvent.locationY, false),
    });
  });

  useEffect(() => {
    if (mode !== 'trace' || done) return;
    const id = setInterval(() => {
      const now = live.get();
      if (now.touched.length < 6) return;
      const c = coverage(letterTargets(now.letter), now.touched);
      if (c >= 0.85) {
        clearInterval(id);
        setDone(true);
        void say(`l-${live.get().letter}` as KidClip, 'p-yay');
      }
    }, 400);
    return () => clearInterval(id);
  }, [mode, done, letter, say, live]);

  useEffect(() => {
    if (mode === 'trace') void say(`l-${letter}` as KidClip);
  }, [mode, letter, say]);

  const reset = () => {
    live.patch({ touched: [], total: 0 });
    setStrokes([]);
  };

  const nextLetter = () => {
    reset();
    setDone(false);
    setLetterIndex((i) => i + 1);
  };

  const chooseMode = (m: 'paint' | 'trace') => {
    reset();
    setDone(false);
    setMode(m);
  };

  return (
    <View style={styles.root}>
      <View style={styles.bar}>
        {canTrace ? (
          <>
            <Pressable accessibilityRole="button" accessibilityLabel="Trace letters" onPress={() => chooseMode('trace')} style={[styles.mode, mode === 'trace' && styles.modeOn]}>
              <Text style={styles.modeText}>🔤</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Finger paint" onPress={() => chooseMode('paint')} style={[styles.mode, mode === 'paint' && styles.modeOn]}>
              <Text style={styles.modeText}>🎨</Text>
            </Pressable>
          </>
        ) : null}
        {KID_COLORS.slice(0, 6).map((c) => (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            accessibilityLabel={c.id}
            onPress={() => setColor(c.hex)}
            style={[styles.swatch, { backgroundColor: c.hex }, color === c.hex && styles.swatchOn]}
          />
        ))}
      </View>

      <View style={styles.canvas} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })} {...responder.panHandlers}>
        <Svg width={box.w} height={box.h} pointerEvents="none">
          {mode === 'trace'
            ? (letterStrokes[letter] ?? []).map((s, i) => (
                <Path
                  key={i}
                  d={pathOf(s.map(([x, y]) => [offX + (x / 100) * side, offY + (y / 100) * side] as Pt))}
                  stroke={done ? 'rgba(141,191,154,0.9)' : 'rgba(255,255,255,0.85)'}
                  strokeWidth={side * 0.16}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))
            : null}
          {strokes.map((s, i) => (
            <Path key={i} d={pathOf(s.pts)} stroke={s.color} strokeWidth={side * (mode === 'trace' ? 0.07 : 0.06) + 6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
        </Svg>
      </View>

      <View style={styles.bottom}>
        <BigButton label="🧽" accessibilityLabel="Start again" onPress={() => { reset(); setDone(false); }} />
        {mode === 'trace' ? <BigButton label="➜" accessibilityLabel="Next letter" onPress={nextLetter} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 8 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' },
  mode: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.4)' },
  modeOn: { backgroundColor: 'rgba(255,255,255,0.9)' },
  modeText: { fontSize: 26 },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: 'transparent' },
  swatchOn: { borderColor: kidColors.ink },
  canvas: { flex: 1, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  bottom: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
});
