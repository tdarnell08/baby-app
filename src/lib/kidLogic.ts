export type KidAge = 'a1' | 'a3' | 'a4';
export type KidGameId = 'bubbles' | 'animals' | 'buddy' | 'match' | 'paint' | 'peek';

export type KidPrefs = { age: KidAge; setup: boolean; sound: boolean };

export const kidAges: { id: KidAge; label: string }[] = [
  { id: 'a1', label: '1 to 2 years' },
  { id: 'a3', label: '3 years' },
  { id: 'a4', label: '4 to 5 years' },
];

export const defaultKidPrefs = (): KidPrefs => ({ age: 'a3', setup: false, sound: true });

export function sanitizeKidPrefs(raw: unknown): KidPrefs {
  const base = defaultKidPrefs();
  if (typeof raw !== 'object' || raw === null) return base;
  const r = raw as Record<string, unknown>;
  return {
    age: r.age === 'a1' || r.age === 'a3' || r.age === 'a4' ? r.age : base.age,
    setup: r.setup === true,
    sound: r.sound !== false,
  };
}

export type AgePlan = {
  bubbles: number;
  numerals: boolean;
  ordered: boolean;
  animals: number;
  holes: number;
  twoTraits: boolean;
  spots: number;
  hint: boolean;
  breathIn: number;
  breathOut: number;
  letters: string[];
  paintOnly: boolean;
};

export const agePlans: Record<KidAge, AgePlan> = {
  a1: { bubbles: 5, numerals: false, ordered: false, animals: 6, holes: 2, twoTraits: false, spots: 3, hint: true, breathIn: 3, breathOut: 4, letters: [], paintOnly: true },
  a3: { bubbles: 8, numerals: true, ordered: false, animals: 9, holes: 3, twoTraits: false, spots: 4, hint: false, breathIn: 4, breathOut: 5, letters: ['o', 'l', 'i', 't', 'c', 'u', 'v', 'a'], paintOnly: false },
  a4: { bubbles: 10, numerals: true, ordered: true, animals: 12, holes: 4, twoTraits: true, spots: 6, hint: false, breathIn: 4, breathOut: 6, letters: 'abcdefghijklmnopqrstuvwxyz'.split(''), paintOnly: false },
};

export const kidGames: { id: KidGameId; label: string; emoji: string; plus: boolean; blurb: string }[] = [
  { id: 'bubbles', label: 'Pop bubbles', emoji: '🫧', plus: false, blurb: 'Count from 1 to 10 with a friendly voice' },
  { id: 'animals', label: 'Animal friends', emoji: '🐮', plus: false, blurb: 'Tap an animal to hear its name and sound' },
  { id: 'buddy', label: 'Breathing buddy', emoji: '🐻', plus: false, blurb: 'Smell the flower, blow the candle' },
  { id: 'match', label: 'Match the holes', emoji: '🔷', plus: true, blurb: 'Drag colors and shapes into the right hole' },
  { id: 'paint', label: 'Paint and trace', emoji: '🎨', plus: true, blurb: 'Finger paint, or trace a letter' },
  { id: 'peek', label: 'Peekaboo', emoji: '🙈', plus: true, blurb: 'Find the hidden animal' },
];

export const TIMER_OPTIONS = [5, 10, 15] as const;
export const GATE_HOLD_MS = 3000;

export function timerRemainingSec(startedAt: number, minutes: number, now: number) {
  return Math.max(0, Math.ceil((startedAt + minutes * 60_000 - now) / 1000));
}

export type GateQuestion = { text: string; options: number[]; answer: number };

export function gateQuestion(rand: () => number): GateQuestion {
  const a = 13 + Math.floor(rand() * 17);
  const b = 3 + Math.floor(rand() * 7);
  const answer = a * b;
  const pool = [answer + 10, answer - 10, answer + a, answer - b, answer + b, answer - a, answer + 1, answer - 1];
  const wrong: number[] = [];
  while (wrong.length < 3) {
    const pick = pool.splice(Math.floor(rand() * pool.length), 1)[0];
    if (pick > 0 && pick !== answer && !wrong.includes(pick)) wrong.push(pick);
  }
  const options = [...wrong, answer];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { text: `What is ${a} × ${b}?`, options, answer };
}

export type Pt = [number, number];

function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number, steps = 14): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    out.push([Math.round((cx + rx * Math.cos(t)) * 10) / 10, Math.round((cy + ry * Math.sin(t)) * 10) / 10]);
  }
  return out;
}

export const letterStrokes: Record<string, Pt[][]> = {
  a: [[[15, 90], [50, 10], [85, 90]], [[28, 60], [72, 60]]],
  b: [[[22, 10], [22, 90]], [[22, 10], [52, 10], ...arc(52, 30, 22, 20, -90, 90), [22, 50]], [[22, 50], [58, 50], ...arc(58, 70, 22, 20, -90, 90), [22, 90]]],
  c: [arc(52, 50, 38, 40, -45, -315)],
  d: [[[22, 10], [22, 90]], [[22, 10], [45, 10], ...arc(45, 50, 38, 40, -90, 90), [22, 90]]],
  e: [[[78, 10], [22, 10], [22, 90], [78, 90]], [[22, 50], [66, 50]]],
  f: [[[78, 10], [22, 10], [22, 90]], [[22, 50], [66, 50]]],
  g: [[...arc(50, 50, 38, 40, -40, -320), [80, 52], [54, 52]]],
  h: [[[20, 10], [20, 90]], [[80, 10], [80, 90]], [[20, 50], [80, 50]]],
  i: [[[35, 10], [65, 10]], [[50, 10], [50, 90]], [[35, 90], [65, 90]]],
  j: [[[70, 10], [70, 62], ...arc(45, 62, 25, 25, 0, 180)]],
  k: [[[22, 10], [22, 90]], [[76, 10], [22, 56]], [[40, 44], [78, 90]]],
  l: [[[22, 10], [22, 90], [78, 90]]],
  m: [[[14, 90], [14, 10], [50, 62], [86, 10], [86, 90]]],
  n: [[[20, 90], [20, 10], [80, 90], [80, 10]]],
  o: [arc(50, 50, 36, 42, -90, 270, 20)],
  p: [[[24, 90], [24, 10]], [[24, 10], [52, 10], ...arc(52, 32, 24, 22, -90, 90), [24, 54]]],
  q: [arc(50, 46, 36, 38, -90, 270, 20), [[58, 66], [86, 92]]],
  r: [[[24, 90], [24, 10]], [[24, 10], [52, 10], ...arc(52, 32, 24, 22, -90, 90), [24, 54]], [[46, 54], [80, 90]]],
  s: [[...arc(50, 30, 26, 20, -30, -270), ...arc(50, 70, 26, 20, -90, 150)]],
  t: [[[15, 10], [85, 10]], [[50, 10], [50, 90]]],
  u: [[[20, 10], [20, 55], ...arc(50, 55, 30, 35, 180, 0), [80, 10]]],
  v: [[[14, 10], [50, 90], [86, 10]]],
  w: [[[8, 10], [28, 90], [50, 35], [72, 90], [92, 10]]],
  x: [[[18, 10], [82, 90]], [[82, 10], [18, 90]]],
  y: [[[18, 10], [50, 50], [82, 10]], [[50, 50], [50, 90]]],
  z: [[[20, 10], [80, 10], [20, 90], [80, 90]]],
};

export function letterTargets(letter: string, spacing = 7): Pt[] {
  const strokes = letterStrokes[letter] ?? [];
  const out: Pt[] = [];
  for (const stroke of strokes) {
    for (let i = 0; i < stroke.length - 1; i++) {
      const [x1, y1] = stroke[i];
      const [x2, y2] = stroke[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const n = Math.max(1, Math.round(len / spacing));
      for (let k = 0; k < n; k++) out.push([x1 + ((x2 - x1) * k) / n, y1 + ((y2 - y1) * k) / n]);
    }
    out.push(stroke[stroke.length - 1]);
  }
  return out;
}

export function coverage(targets: Pt[], touched: Pt[], radius = 13): number {
  if (targets.length === 0) return 0;
  let hit = 0;
  for (const [tx, ty] of targets) {
    if (touched.some(([x, y]) => Math.hypot(x - tx, y - ty) <= radius)) hit++;
  }
  return hit / targets.length;
}

export const ANIMALS = ['cow', 'dog', 'cat', 'duck', 'sheep', 'pig', 'horse', 'frog', 'lion', 'chick', 'owl', 'bee'] as const;
export type AnimalId = (typeof ANIMALS)[number];

export const animalEmoji: Record<AnimalId, string> = {
  cow: '🐮',
  dog: '🐶',
  cat: '🐱',
  duck: '🦆',
  sheep: '🐑',
  pig: '🐷',
  horse: '🐴',
  frog: '🐸',
  lion: '🦁',
  chick: '🐥',
  owl: '🦉',
  bee: '🐝',
};

export const KID_COLORS = [
  { id: 'red', hex: '#E58C86' },
  { id: 'blue', hex: '#7FA6D6' },
  { id: 'yellow', hex: '#EBD27E' },
  { id: 'green', hex: '#8DBF9A' },
  { id: 'orange', hex: '#EDAA7B' },
  { id: 'purple', hex: '#A99AD1' },
  { id: 'pink', hex: '#EDA9C4' },
] as const;

export const KID_SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'] as const;
export type KidShape = (typeof KID_SHAPES)[number];

export const shapePaths: Record<KidShape, string> = {
  circle: 'M50 8 A42 42 0 1 1 49.99 8 Z',
  square: 'M14 14 H86 V86 H14 Z',
  triangle: 'M50 10 L92 88 H8 Z',
  star: 'M50 6 L61 37 L94 38 L68 58 L77 91 L50 72 L23 91 L32 58 L6 38 L39 37 Z',
  heart: 'M50 90 C10 58 6 32 24 20 C38 11 48 20 50 30 C52 20 62 11 76 20 C94 32 90 58 50 90 Z',
};

export function pickMany<T>(list: readonly T[], count: number, rand: () => number): T[] {
  const pool = [...list];
  const out: T[] = [];
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  return out;
}
