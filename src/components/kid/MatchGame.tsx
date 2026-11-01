import { useEffect, useMemo, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { kidColors, makeBox, ShapeSvg, type GameProps } from '@/components/kid/kidUi';
import type { KidClip } from '@/data/kidVoice';
import { KID_COLORS, KID_SHAPES, pickMany, type KidShape } from '@/lib/kidLogic';

type Item = { id: string; shape: KidShape; color: string; colorId: string };

function Piece({ item, size, home, target, onDrop, placed }: { item: Item; size: number; home: { x: number; y: number }; target: { x: number; y: number }; onDrop: (ok: boolean) => void; placed: boolean }) {
  const [pan] = useState(() => new Animated.ValueXY());
  const [live] = useState(() => makeBox({ home, target, size, onDrop, base: { x: 0, y: 0 } }));
  useEffect(() => {
    live.patch({ home, target, size, onDrop });
  });
  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_e, g) => {
        const { base } = live.get();
        pan.setValue({ x: base.x + g.dx, y: base.y + g.dy });
      },
      onPanResponderRelease: (_e, g) => {
        const l = live.get();
        const x = l.base.x + g.dx;
        const y = l.base.y + g.dy;
        const ok = Math.hypot(l.home.x + x - l.target.x, l.home.y + y - l.target.y) < l.size * 0.7;
        const base = ok ? { x: l.target.x - l.home.x, y: l.target.y - l.home.y } : { x: 0, y: 0 };
        live.patch({ base });
        Animated.spring(pan, { toValue: base, useNativeDriver: false, friction: ok ? 8 : 7 }).start();
        l.onDrop(ok);
      },
    }),
  );

  return (
    <Animated.View
      {...(placed ? {} : responder.panHandlers)}
      style={[styles.abs, { left: home.x - size / 2, top: home.y - size / 2, width: size, height: size, transform: pan.getTranslateTransform() }]}
    >
      <ShapeSvg shape={item.shape} size={size} fill={item.color} stroke="rgba(255,255,255,0.9)" />
    </Animated.View>
  );
}

export function MatchGame({ age, say }: GameProps) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);

  const items = useMemo<Item[]>(() => {
    const n = age.holes;
    if (age.twoTraits) {
      const shapes = pickMany(KID_SHAPES, 2, Math.random);
      const colors = pickMany(KID_COLORS, 2, Math.random);
      return shapes.flatMap((s) => colors.map((c) => ({ id: `${s}-${c.id}`, shape: s, color: c.hex, colorId: c.id })));
    }
    if (age.holes === 2) {
      return pickMany(KID_COLORS, 2, Math.random).map((c) => ({ id: `circle-${c.id}`, shape: 'circle' as KidShape, color: c.hex, colorId: c.id }));
    }
    const shapes = pickMany(KID_SHAPES, n, Math.random);
    const colors = pickMany(KID_COLORS, n, Math.random);
    return shapes.map((s, i) => ({ id: `${s}-${colors[i].id}`, shape: s, color: colors[i].hex, colorId: colors[i].id }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [age.holes, age.twoTraits, round]);

  const layout = useMemo(() => {
    const n = items.length;
    const cols = n === 4 ? 2 : n;
    const rows = n === 4 ? 2 : 1;
    const size = Math.max(56, Math.min(96, box.w / (cols + 0.6), box.h / (rows * 2 + 1.4)));
    const holeCenters = items.map((_, i) => {
      const col = n === 4 ? i % 2 : i;
      const row = n === 4 ? Math.floor(i / 2) : 0;
      return { x: ((col + 0.5) * box.w) / cols, y: size * 0.9 + row * (size * 1.25) };
    });
    const order = pickMany(items.map((_, i) => i), n, Math.random);
    const homes = order.map((itemIndex, slot) => ({ itemIndex, x: ((slot + 0.5) * box.w) / n, y: Math.min(box.h - size * 0.9, size * 0.9 + rows * size * 1.25 + size * 2.4) }));
    return { size, holeCenters, homes };
  }, [items, box.w, box.h]);

  const onDrop = (item: Item, ok: boolean) => {
    if (!ok) return;
    const next = [...placed, item.id];
    setPlaced(next);
    const second: KidClip[] = age.twoTraits || age.holes > 2 ? [`sh-${item.shape}` as KidClip] : [];
    const clips: KidClip[] = [`c-${item.colorId}` as KidClip, ...second];
    if (next.length === items.length) clips.push('p-yay');
    void say(...clips);
    if (next.length === items.length) {
      setTimeout(() => {
        setPlaced([]);
        setRound((r) => r + 1);
      }, 2400);
    }
  };

  return (
    <View style={styles.root} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {box.w > 0 ? (
        <>
          {items.map((item, i) => {
            const c = layout.holeCenters[i];
            const done = placed.includes(item.id);
            return (
              <View key={`hole-${round}-${item.id}`} style={[styles.abs, styles.hole, { left: c.x - layout.size / 2 - 6, top: c.y - layout.size / 2 - 6, width: layout.size + 12, height: layout.size + 12 }]}>
                <ShapeSvg shape={item.shape} size={layout.size} fill={done ? 'transparent' : 'rgba(74,90,92,0.18)'} stroke="rgba(74,90,92,0.45)" dashed />
              </View>
            );
          })}
          {layout.homes.map((h) => {
            const item = items[h.itemIndex];
            return (
              <Piece
                key={`piece-${round}-${item.id}`}
                item={item}
                size={layout.size}
                home={{ x: h.x, y: h.y }}
                target={layout.holeCenters[h.itemIndex]}
                placed={placed.includes(item.id)}
                onDrop={(ok) => onDrop(item, ok)}
              />
            );
          })}
        </>
      ) : (
        <Text style={styles.hint}> </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  abs: { position: 'absolute' },
  hole: { alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.3)' },
  hint: { color: kidColors.ink },
});
