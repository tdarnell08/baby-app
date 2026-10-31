export type SoundCategory = 'background' | 'steady' | 'womb' | 'nature' | 'home' | 'music';

export type Evidence = 'infant' | 'adult' | 'comfort';

export type SleepSound = {
  id: string;
  name: string;
  blurb: string;
  category: SoundCategory;
  evidence: Evidence;
  science: string;
  source: number;
  tint: string;
};

export const categoryLabels: Record<SoundCategory, string> = {
  background: 'Background sounds',
  steady: 'More steady noise',
  womb: 'Womb & heartbeat',
  nature: 'Nature at night',
  home: 'Home & travel',
  music: 'Gentle music',
};

export const categoryOrder: SoundCategory[] = [
  'background',
  'steady',
  'womb',
  'nature',
  'home',
  'music',
];

export const evidenceLabels: Record<Evidence, string> = {
  infant: 'Studied in babies',
  adult: 'Adult research',
  comfort: 'Comfort sound',
};

const NATURE_NOTE =
  'Steady, low-surprise sounds like this work much like white noise by masking sudden household noise. No studies have tested this exact recording in infants, so treat it as a comfort sound.';

export const sleepSounds: SleepSound[] = [
  {
    id: 'balanced',
    name: 'Balanced noise',
    blurb: 'Even, mid-focused hush',
    category: 'background',
    evidence: 'comfort',
    science:
      'Balanced noise is a steady mid-range masker in the same family as white noise. Soft continuous sound can help some babies settle by covering sudden household noise.',
    source: require('../../assets/sounds/balanced.wav'),
    tint: '#9DB8B0',
  },
  {
    id: 'bright',
    name: 'Bright noise',
    blurb: 'Airier, higher hush',
    category: 'background',
    evidence: 'comfort',
    science:
      'Bright noise has more high frequencies. Keep volume lower — bright hiss can feel sharp in a quiet nursery. Comfort sound only for infants.',
    source: require('../../assets/sounds/bright.wav'),
    tint: '#E6C96A',
  },
  {
    id: 'dark',
    name: 'Dark noise',
    blurb: 'Low, muffled rumble',
    category: 'background',
    evidence: 'comfort',
    science:
      'Dark noise emphasizes low tones, closer to a womb-like rumble. Many families find it cozy, but it has not been tested in infants.',
    source: require('../../assets/sounds/dark.wav'),
    tint: '#6B5B4F',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    blurb: 'Slow rolling waves',
    category: 'background',
    evidence: 'comfort',
    science: NATURE_NOTE,
    source: require('../../assets/sounds/ocean.wav'),
    tint: '#5B8FA8',
  },
  {
    id: 'rain',
    name: 'Rain',
    blurb: 'Soft steady patter',
    category: 'background',
    evidence: 'comfort',
    science: NATURE_NOTE,
    source: require('../../assets/sounds/rain.wav'),
    tint: '#7BA3B8',
  },
  {
    id: 'stream',
    name: 'Stream',
    blurb: 'Gentle running water',
    category: 'background',
    evidence: 'comfort',
    science: NATURE_NOTE,
    source: require('../../assets/sounds/stream.wav'),
    tint: '#6FB1B0',
  },

  {
    id: 'hush',
    name: 'White noise',
    blurb: 'Classic steady hush',
    category: 'steady',
    evidence: 'infant',
    science:
      'In a small 1990 study (Spencer et al.), most newborns fell asleep within 5 minutes with white noise versus about a quarter without it. The sample was tiny, so it is promising rather than proven. Keep it quiet: loud machines can harm hearing (Hugh et al., Pediatrics 2014).',
    source: require('../../assets/sounds/hush.wav'),
    tint: '#9DB8B0',
  },
  {
    id: 'pink',
    name: 'Pink noise',
    blurb: 'Softer, less hissy',
    category: 'steady',
    evidence: 'adult',
    science:
      'Pink noise has more low tones than white noise and sounds gentler. Adult studies suggest steady pink noise can make sleep more stable (Zhou et al., 2012). There are no strong infant trials yet.',
    source: require('../../assets/sounds/pink.wav'),
    tint: '#E8A29A',
  },
  {
    id: 'brown',
    name: 'Deep rumble',
    blurb: 'Low, cozy, womb-like',
    category: 'steady',
    evidence: 'comfort',
    science:
      'Brown noise is mostly low pitches, similar to the muffled rumble babies hear before birth. Many families find it calming, but it has not been tested in infants.',
    source: require('../../assets/sounds/brown.wav'),
    tint: '#B08968',
  },
  {
    id: 'womb',
    name: 'Womb sounds',
    blurb: 'Whoosh with a heartbeat',
    category: 'womb',
    evidence: 'infant',
    science:
      'Measurements inside the womb (Walker et al., 1971) show a constant low whoosh with a rhythmic heartbeat. Babies have heard this for months, which is why it is a popular newborn soother. Clinical evidence for sleep is limited.',
    source: require('../../assets/sounds/womb.wav'),
    tint: '#D9A0A0',
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    blurb: 'Slow, steady lub-dub',
    category: 'womb',
    evidence: 'infant',
    science:
      'Salk (1962) reported calmer newborns with a heartbeat sound. Later studies were mixed, so results vary baby to baby. The slow rhythm is the point.',
    source: require('../../assets/sounds/heartbeat.wav'),
    tint: '#E07A7A',
  },
  {
    id: 'beach',
    name: 'Beach waves',
    blurb: 'Tide closer to shore',
    category: 'nature',
    evidence: 'comfort',
    science: NATURE_NOTE + ' The slow swell mimics breathing pace, which many parents find settling.',
    source: require('../../assets/sounds/beach.wav'),
    tint: '#5B8FA8',
  },
  {
    id: 'crickets',
    name: 'Crickets',
    blurb: 'Warm summer night',
    category: 'nature',
    evidence: 'comfort',
    science:
      'Rhythmic night-time insects signal a calm, safe evening for many people, but there are no infant studies. Crickets are high-pitched, so start quiet.',
    source: require('../../assets/sounds/crickets.wav'),
    tint: '#A9C46C',
  },
  {
    id: 'cicadas',
    name: 'Cicadas',
    blurb: 'Humid evening drone',
    category: 'nature',
    evidence: 'comfort',
    science:
      'A pulsing drone that swells and fades. It is a comfort sound only, with no infant research. Cicadas are bright and high-pitched, so keep the volume low and the phone far from the crib.',
    source: require('../../assets/sounds/cicadas.wav'),
    tint: '#C9B458',
  },
  {
    id: 'jungle',
    name: 'Jungle night',
    blurb: 'Frogs, birds and dripping leaves',
    category: 'nature',
    evidence: 'comfort',
    science:
      'A layered, non-startling soundscape. It is a comfort sound with no infant studies; if the bird calls wake your baby, pick a steadier sound.',
    source: require('../../assets/sounds/jungle.wav'),
    tint: '#4F9D69',
  },
  {
    id: 'cars',
    name: 'Cars passing by',
    blurb: 'Distant road hum',
    category: 'home',
    evidence: 'comfort',
    science:
      'Many babies nod off on car rides, and a steady road hum also masks household noise. This is a comfort sound, not a studied one.',
    source: require('../../assets/sounds/cars.wav'),
    tint: '#8C94A8',
  },
  {
    id: 'boat',
    name: 'Boat on the water',
    blurb: 'Soft hull rumble and waves',
    category: 'home',
    evidence: 'comfort',
    science:
      'A low engine hum plus gentle water motion is another steady travel-style masker. It is a comfort sound with no infant studies — keep it quiet like the other loops.',
    source: require('../../assets/sounds/boat.wav'),
    tint: '#6A8FA8',
  },
  {
    id: 'train',
    name: 'Train ride',
    blurb: 'Soft rails and click-clack',
    category: 'home',
    evidence: 'comfort',
    science:
      'Rhythmic, low travel noise can soothe some babies the way car rides do. This is a comfort sound, not a clinical therapy. Start quiet so the clicks stay gentle.',
    source: require('../../assets/sounds/train.wav'),
    tint: '#8B7A6B',
  },
  {
    id: 'fan',
    name: 'Box fan',
    blurb: 'Smooth whirring hum',
    category: 'home',
    evidence: 'comfort',
    science:
      'A fan hum is acoustically close to white noise, the sound used in the infant studies. It is a comfort sound here. Real fans also keep air moving, which is a separate safe-sleep topic for your pediatrician.',
    source: require('../../assets/sounds/fan.wav'),
    tint: '#9AA5B1',
  },
  {
    id: 'lullaby',
    name: 'Music box',
    blurb: 'Soft, slow lullaby',
    category: 'music',
    evidence: 'infant',
    science:
      'Lullabies can calm babies. In premature infants, parent-sung lullabies lowered arousal and improved sleep (Loewy et al., Pediatrics 2013). Live singing worked best, so singing along beats any recording.',
    source: require('../../assets/sounds/lullaby.wav'),
    tint: '#E6C96A',
  },
];

export const timerOptions = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: 'All night', minutes: 0 },
] as const;

export const volumeOptions = [
  { label: 'Quiet', value: 0.3 },
  { label: 'Soft', value: 0.5 },
  { label: 'Medium', value: 0.7 },
] as const;

export const sleepScienceNotes = [
  'Steady noise can help some babies settle faster, but the studies are small. Think of it as a tool, not a cure.',
  'Keep it low: aim for no louder than a quiet conversation (about 50 dB) at the crib, with the speaker at least 7 feet away. Some machines can be loud enough to risk hearing at full volume (Hugh et al., 2014).',
  'Use the timer if you can, rather than playing sound at high volume all night.',
  'Safe sleep still comes first: baby on their back, on a firm flat surface, with an empty crib (AAP).',
  'This is general information, not medical advice. Talk to your pediatrician about your baby.',
];
