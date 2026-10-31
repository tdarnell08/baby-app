import { firstFoods, type FirstFood, type FoodStage } from '@/data/foods';
import { milestoneBandMonths, milestonesForBand } from '@/data/milestones';
import { motorSkills, type MotorSkill } from '@/data/movement';
import { firstWords, type FirstWord, type WordCategory } from '@/data/words';

export type InterestId =
  | 'music'
  | 'animals'
  | 'books'
  | 'balls'
  | 'faces'
  | 'water'
  | 'textures'
  | 'outdoors';

export type TimeTierId = 'quick' | 'standard' | 'extra';

export type PlanHref = '/words' | '/steps' | '/foods' | '/milestones';
export type PlanKind = 'speech' | 'movement' | 'food' | 'bonding' | 'milestone';

export type PlanProfile = {
  name: string;
  ageMonths: number;
  interests: InterestId[];
  time: TimeTierId;
  achieved: string[];
};

export type PlanItem = {
  id: string;
  kind: PlanKind;
  emoji: string;
  label: string;
  title: string;
  minutes: number | null;
  steps: string[];
  note?: string;
  cta?: { label: string; href: PlanHref };
};

export type DailyPlan = {
  lowEffort: boolean;
  intro: string;
  totalMinutes: number;
  items: PlanItem[];
};

export const interestOptions: { id: InterestId; label: string; emoji: string; toy: string }[] = [
  { id: 'music', label: 'Music & singing', emoji: '🎵', toy: 'a shaker, a soft rattle, or just your own singing voice' },
  { id: 'animals', label: 'Animals', emoji: '🐶', toy: 'a soft animal toy or a board book with animal pictures' },
  { id: 'books', label: 'Books', emoji: '📖', toy: 'a sturdy board book with big, simple pictures' },
  { id: 'balls', label: 'Balls & rolling', emoji: '⚽', toy: 'a soft, lightweight ball' },
  { id: 'faces', label: 'Faces & mirrors', emoji: '🪞', toy: 'a baby-safe mirror, or your own big expressions' },
  { id: 'water', label: 'Water & bath', emoji: '🛁', toy: 'a plastic cup or a floating bath toy' },
  { id: 'textures', label: 'Textures', emoji: '🧸', toy: 'a crinkle cloth or a few safe, soft-textured toys' },
  { id: 'outdoors', label: 'Outdoors', emoji: '🌳', toy: 'a blanket on the grass or a favorite stroller walk' },
];

export const timeTiers: {
  id: TimeTierId;
  label: string;
  hint: string;
  speech: number;
  movement: number;
  bonding: number;
}[] = [
  { id: 'quick', label: '15 min', hint: 'Short and sweet', speech: 3, movement: 5, bonding: 3 },
  { id: 'standard', label: '30 min', hint: 'The usual plan', speech: 5, movement: 10, bonding: 5 },
  { id: 'extra', label: '45+ min', hint: 'A longer play block', speech: 7, movement: 15, bonding: 10 },
];

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickSeeded<T>(items: T[], seed: string): T {
  return items[hash(seed) % items.length];
}

export function dateKey(date: Date) {
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function formatAge(months: number) {
  if (months < 1) return 'Newborn';
  if (months === 1) return '1 month';
  if (months < 24) return `${months} months`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest === 0 ? `${years} years` : `${years} yr ${rest} mo`;
}

const interestToWords: Record<InterestId, string[]> = {
  music: ['ba', 'ma', 'da', 'more', 'nightnight'],
  animals: ['woof', 'meow', 'moo', 'quack'],
  books: ['book', 'baby', 'moon'],
  balls: ['ball', 'up', 'more'],
  faces: ['hi', 'bye', 'peekaboo', 'mama', 'dada'],
  water: ['water', 'milk', 'more'],
  textures: ['baby', 'milk', 'shoe'],
  outdoors: ['up', 'moon', 'bye', 'hi'],
};

function eligibleWords(age: number): FirstWord[] {
  const cats: WordCategory[] =
    age < 7
      ? ['sounds']
      : age < 10
        ? ['sounds', 'people']
        : age < 14
          ? ['people', 'routines']
          : ['people', 'routines', 'animals', 'things'];
  return firstWords.filter((w) => cats.includes(w.category));
}

function pickWord(profile: PlanProfile, day: string, salt: string, pool?: FirstWord[]): FirstWord {
  const candidates = pool ?? eligibleWords(profile.ageMonths);
  const preferredIds = profile.interests.flatMap((i) => interestToWords[i]);
  const preferred = candidates.filter((w) => preferredIds.includes(w.id));
  return pickSeeded(preferred.length > 0 ? preferred : candidates, `${day}:${salt}:${profile.ageMonths}`);
}

const movementRanges: Record<string, [number, number]> = {
  tummy: [0, 5],
  neckturn: [0, 4],
  reach: [3, 6],
  rollbacktobelly: [4, 7],
  sidelying: [4, 8],
  rollbellytoback: [5, 8],
  sitsupport: [5, 8],
  sithandsfree: [6, 10],
  pivot: [6, 10],
  rock: [7, 11],
  crawl: [8, 13],
  kneel: [8, 13],
  cruise: [9, 14],
  standfree: [10, 15],
  firststeps: [11, 20],
  squat: [13, 36],
};

function pickMovement(age: number, day: string): MotorSkill {
  const eligible = motorSkills.filter((s) => {
    const range = movementRanges[s.id];
    return range ? age >= range[0] && age <= range[1] : false;
  });
  const pool = eligible.length > 0 ? eligible : [motorSkills[motorSkills.length - 1]];
  return pickSeeded(pool, `${day}:move:${age}`);
}

function foodStageForAge(age: number): FoodStage {
  if (age < 8) return 'start';
  if (age < 10) return 'soft';
  if (age < 12) return 'finger';
  return 'family';
}

function pickFood(age: number, day: string): FirstFood | null {
  if (age < 6) return null;
  const pool = firstFoods.filter((f) => f.stage === foodStageForAge(age));
  return pool.length > 0 ? pickSeeded(pool, `${day}:food:${age}`) : null;
}

type Bonding = {
  id: string;
  emoji: string;
  title: string;
  minAge: number;
  maxAge: number;
  interests: InterestId[];
  steps: string[];
  why: string;
};

const bondingActivities: Bonding[] = [
  {
    id: 'skin',
    emoji: '🤱',
    title: 'Skin-to-skin cuddle',
    minAge: 0,
    maxAge: 6,
    interests: [],
    steps: [
      'Dress baby in just a diaper and hold them upright on your bare chest, with a blanket over you both.',
      'Keep baby’s nose and mouth uncovered and stay awake the whole time.',
      'Breathe slowly and hum or talk softly.',
    ],
    why: 'Skin-to-skin contact is linked with calmer babies and stronger early bonding (Cochrane review, Moore et al., 2016).',
  },
  {
    id: 'gaze',
    emoji: '👀',
    title: 'Eye contact and sing-song chat',
    minAge: 0,
    maxAge: 6,
    interests: ['faces', 'music'],
    steps: [
      'Hold baby 8 to 12 inches from your face, where they focus best.',
      'Smile, then pause and wait for their reaction.',
      'Copy any sound or expression they make, like a gentle game of ping-pong.',
    ],
    why: 'Back-and-forth “serve and return” moments help build the brain’s social and language wiring (Harvard Center on the Developing Child).',
  },
  {
    id: 'massage',
    emoji: '💆',
    title: 'Gentle baby massage',
    minAge: 0,
    maxAge: 8,
    interests: ['textures'],
    steps: [
      'Warm your hands and make sure baby is calm and awake.',
      'Use slow, light strokes on legs, arms, and tummy while you narrate what you are touching.',
      'Stop if baby turns away or fusses.',
    ],
    why: 'Many parents find massage soothing, and it builds closeness. Evidence for other benefits is mixed, so treat it as bonding time.',
  },
  {
    id: 'mirror',
    emoji: '🪞',
    title: 'Mirror friends',
    minAge: 3,
    maxAge: 12,
    interests: ['faces'],
    steps: [
      'Sit with baby in front of a baby-safe mirror.',
      'Point to baby’s eyes, nose, and smile and name each one.',
      'Make a silly face and see if baby copies you.',
    ],
    why: 'Faces are baby’s favorite thing to study, and naming body parts builds early vocabulary.',
  },
  {
    id: 'peekaboo',
    emoji: '🫣',
    title: 'Peekaboo with a soft cloth',
    minAge: 5,
    maxAge: 14,
    interests: ['faces', 'textures'],
    steps: [
      'Hold a light cloth in front of your face, then whisk it away: “Peekaboo!”',
      'Let baby pull the cloth off you, then off themselves.',
      'Stay close and keep the cloth light so it never covers the nose and mouth for long.',
    ],
    why: 'Peekaboo teaches that things still exist when hidden and gives baby a turn-taking game.',
  },
  {
    id: 'dance',
    emoji: '💃',
    title: 'Slow-dance with baby',
    minAge: 0,
    maxAge: 24,
    interests: ['music'],
    steps: [
      'Hold baby close with good head support and sway to a lullaby or your own humming.',
      'Change the tempo: slow, then a bit bouncy, then slow again.',
      'Finish with a gentle squeeze and a kiss.',
    ],
    why: 'Singing and gentle rocking to a steady beat are calming for babies and fun for you.',
  },
  {
    id: 'book',
    emoji: '📖',
    title: 'Cuddle-and-point book time',
    minAge: 4,
    maxAge: 24,
    interests: ['books', 'animals'],
    steps: [
      'Sit baby in your lap with a board book.',
      'Point at one picture per page and name it in a bright, sing-song voice.',
      'Pause and let baby touch, pat, or chew the book (board books only).',
    ],
    why: 'Reading together from early on is linked with stronger language skills (AAP recommends reading aloud from birth).',
  },
  {
    id: 'follow',
    emoji: '🧩',
    title: 'Follow-the-leader floor time',
    minAge: 5,
    maxAge: 24,
    interests: [],
    steps: [
      'Sit on the floor and let baby choose what to play with.',
      'Copy what they do and narrate: “You’re banging! Bang, bang!”',
      'Resist directing. Your attention is the prize.',
    ],
    why: 'Following a child’s lead builds trust and helps them learn the words for what they are already interested in.',
  },
  {
    id: 'bath',
    emoji: '🛁',
    title: 'Splash-and-sing bath time',
    minAge: 5,
    maxAge: 24,
    interests: ['water'],
    steps: [
      'Keep one hand on baby at all times and never leave them alone in the bath, even for a second.',
      'Pour water gently from a cup and sing a simple splash song.',
      'Pause after each splash so baby can react.',
    ],
    why: 'Calm bath routines are a reliable bonding moment and a natural place to practice words like “splash” and “more”.',
  },
  {
    id: 'walk',
    emoji: '🌳',
    title: 'Look-and-name walk',
    minAge: 2,
    maxAge: 24,
    interests: ['outdoors', 'animals'],
    steps: [
      'Take a short stroller or carrier walk, or sit on a blanket outside.',
      'Stop at one thing baby looks at: a leaf, a dog, a car. Name it twice.',
      'Pause and smile so baby can respond.',
    ],
    why: 'Naming what a baby is already looking at is one of the easiest ways to teach words (joint attention).',
  },
  {
    id: 'rhyme',
    emoji: '🎶',
    title: 'Lap rhymes and bounces',
    minAge: 4,
    maxAge: 18,
    interests: ['music', 'balls'],
    steps: [
      'Sit baby on your knees facing you and bounce gently to a nursery rhyme.',
      'Slow down, then pause just before the big “bounce” so baby anticipates it.',
      'Repeat the same rhyme a few times. Babies love familiar songs.',
    ],
    why: 'Predictable songs help babies learn rhythm and anticipation, and they delight in repeating them.',
  },
  {
    id: 'texture',
    emoji: '🧸',
    title: 'Texture tour',
    minAge: 3,
    maxAge: 18,
    interests: ['textures'],
    steps: [
      'Gather three safe textures: a soft blanket, a crinkly cloth, a smooth spoon.',
      'Stroke baby’s hand with each and say the word: “soft,” “crinkly,” “smooth.”',
      'Watch their face to see which one they love.',
    ],
    why: 'Pairing touch with words helps babies connect sensations with language.',
  },
  {
    id: 'animal',
    emoji: '🐮',
    title: 'Animal parade',
    minAge: 8,
    maxAge: 24,
    interests: ['animals'],
    steps: [
      'Line up two or three soft animals.',
      'Make each animal’s sound and move it across the floor to baby.',
      'Pause and wait for baby to wiggle, laugh, or make a sound back.',
    ],
    why: 'Animal sounds are easy first “words,” and silly voices keep babies engaged.',
  },
];

const lowEffortBonding: Bonding[] = [
  {
    id: 'quiet',
    emoji: '🫶',
    title: 'Five slow breaths cuddle',
    minAge: 0,
    maxAge: 36,
    interests: [],
    steps: [
      'Sit down wherever you are and hold baby close.',
      'Take five slow breaths together. Hum if you like.',
      'That is the whole activity. It counts.',
    ],
    why: 'Calm, close contact is bonding. You do not need a plan for it.',
  },
  {
    id: 'skin-lite',
    emoji: '🤱',
    title: 'Skin-to-skin rest',
    minAge: 0,
    maxAge: 6,
    interests: [],
    steps: [
      'Recline with baby on your bare chest and a blanket over both of you.',
      'Stay awake with baby’s nose and mouth uncovered.',
      'Rest. You are doing great.',
    ],
    why: 'Skin-to-skin helps both of you settle (Cochrane review, Moore et al., 2016).',
  },
  {
    id: 'floor-lounge',
    emoji: '🛋️',
    title: 'Lounge-on-the-floor play',
    minAge: 4,
    maxAge: 36,
    interests: [],
    steps: [
      'Lie on the floor and let baby crawl, pat, or climb on you.',
      'Say whatever you notice: “You found my nose!”',
      'No toys required.',
    ],
    why: 'Baby learns from your attention and your voice, even when you are lying down.',
  },
  {
    id: 'window',
    emoji: '🪟',
    title: 'Window-watching narration',
    minAge: 1,
    maxAge: 36,
    interests: ['outdoors', 'animals'],
    steps: [
      'Carry baby to a window and name two things you see.',
      'Pause and watch where baby looks.',
      'Name that, too.',
    ],
    why: 'Naming what baby is looking at is a low-effort way to grow vocabulary.',
  },
];

function pickBonding(profile: PlanProfile, day: string, pool: Bonding[]): Bonding {
  const age = profile.ageMonths;
  const eligible = pool.filter((b) => age >= b.minAge && age <= b.maxAge);
  const usable = eligible.length > 0 ? eligible : pool;
  const matched = usable.filter((b) => b.interests.some((i) => profile.interests.includes(i)));
  return pickSeeded(matched.length > 0 ? matched : usable, `${day}:bond:${age}`);
}

function pickMilestone(age: number, day: string, achieved: string[]) {
  const bands = milestoneBandMonths.filter((b) => b >= age);
  const order = bands.length > 0 ? bands : [milestoneBandMonths[milestoneBandMonths.length - 1]];
  for (const band of order) {
    const open = milestonesForBand(band).filter((x) => !achieved.includes(x.id));
    if (open.length > 0) return { band, item: pickSeeded(open, `${day}:mile:${band}`) };
  }
  const band = order[0];
  return { band, item: pickSeeded(milestonesForBand(band), `${day}:mile:${band}`) };
}

type LowMovement = { maxAge: number; title: string; emoji: string; steps: string[] };

const lowEffortMovement: LowMovement[] = [
  {
    maxAge: 3,
    title: 'Tummy time on your chest',
    emoji: '🛋️',
    steps: [
      'Lean back on the couch with baby tummy-down on your chest, face to face.',
      'Talk or sing for one to two minutes. Chest-to-chest counts as tummy time.',
      'Stay awake and keep their face visible. Stop if they fuss.',
    ],
  },
  {
    maxAge: 6,
    title: 'Tummy and reach after a diaper change',
    emoji: '🧷',
    steps: [
      'After the next diaper change, roll baby onto their tummy on the changing mat or floor.',
      'Hold a toy just out of reach for one minute.',
      'Celebrate any reach, push-up, or head lift. Repeat at the next change.',
    ],
  },
  {
    maxAge: 9,
    title: 'Floor sit while you have your coffee',
    emoji: '☕',
    steps: [
      'Sit on the floor with your drink and set baby next to you with two toys.',
      'Let them reach, pivot, or roll toward the toys.',
      'Keep a hand ready and enjoy the sip.',
    ],
  },
  {
    maxAge: 13,
    title: 'Couch cruise while you fold laundry',
    emoji: '🧺',
    steps: [
      'Put a few toys along the couch cushions.',
      'Let baby pull up and side-step along the couch while you fold nearby.',
      'Cheer any pull, step, or squat.',
    ],
  },
  {
    maxAge: 60,
    title: 'Walk-to-me hallway game',
    emoji: '🚶',
    steps: [
      'Sit or kneel three steps away from baby in a clear hallway.',
      'Open your arms and call them to you.',
      'Hug and repeat a couple of times. Falls are part of the game.',
    ],
  },
];

function pickLowMovement(age: number): LowMovement {
  return lowEffortMovement.find((m) => age <= m.maxAge) ?? lowEffortMovement[lowEffortMovement.length - 1];
}

function toyFor(profile: PlanProfile): string | null {
  const first = profile.interests[0];
  if (!first) return null;
  return interestOptions.find((i) => i.id === first)?.toy ?? null;
}

function chunkMinutes(total: number) {
  if (total <= 5) return { rounds: 1, each: total };
  const rounds = Math.ceil(total / 5);
  return { rounds, each: Math.round(total / rounds) };
}

function speechGame(profile: PlanProfile, day: string, minutes: number): PlanItem {
  const age = profile.ageMonths;

  if (age < 4) {
    return {
      id: 'speech',
      kind: 'speech',
      emoji: '🗣️',
      label: 'Speech game',
      title: 'Coo-and-answer',
      minutes,
      steps: [
        'Hold baby 8 to 12 inches from your face where they can see your mouth.',
        'Say a short sing-song sound like “ooo” or “hellooo,” then pause and wait for any reaction.',
        'Copy whatever baby does, a coo, a blink, or a smile, and answer like a conversation.',
        'Repeat for the full time, stopping if baby looks away.',
      ],
      note: 'Babies who get quick, warm responses to their sounds babble more (Goldstein & Schwade, 2008).',
      cta: { label: 'See babble sounds', href: '/words' },
    };
  }

  if (age < 7) {
    return {
      id: 'speech',
      kind: 'speech',
      emoji: '🗣️',
      label: 'Speech game',
      title: 'Sound ping-pong',
      minutes,
      steps: [
        'Sit face to face and make one simple sound, like “ba,” “ma,” or a raspberry.',
        'Pause for 5 seconds and wait with a smile.',
        'Copy anything baby does and cheer right away: “Yes! You said it!”',
        'Try one new sound every minute, using big, slow lips.',
      ],
      note: 'Pausing gives baby time to respond. Conversational turns matter more than the number of words (Romeo et al., 2018).',
      cta: { label: 'Open babble sounds', href: '/words' },
    };
  }

  const word = pickWord(profile, day, 'speech');
  return {
    id: 'speech',
    kind: 'speech',
    emoji: '🗣️',
    label: 'Speech game',
    title: `Say, pause, cheer: “${word.word}”`,
    minutes,
    steps: [
      'Sit face to face about 1 to 2 feet away so baby can see your mouth.',
      `Say “${word.say}” slowly in a high, sing-song voice. Add the gesture: ${word.gesture.charAt(0).toLowerCase()}${word.gesture.slice(1)}`,
      `Say the sentence: “${word.phrase}”`,
      'Pause for a full 5 seconds. Smile, lean in, and wait. Any sound, look, or wiggle counts.',
      'Cheer right away, then repeat 2 or 3 more times.',
    ],
    note: 'Slow, sing-song “parentese” plus pausing is linked with bigger vocabularies (Ramírez-Esparza et al., 2014).',
    cta: { label: 'Open the guided lesson', href: '/words' },
  };
}

function lowEffortSpeech(profile: PlanProfile, day: string): PlanItem {
  const age = profile.ageMonths;
  if (age < 7) {
    return {
      id: 'speech',
      kind: 'speech',
      emoji: '🗣️',
      label: 'Speech game',
      title: 'Narrate one routine',
      minutes: 2,
      steps: [
        'Pick one thing you are doing anyway, like a diaper change.',
        'Say what you are doing in a sing-song voice: “Now we’re putting on your socks.”',
        'Pause after each sentence so baby can coo back.',
      ],
      note: 'Everyday talk counts. You do not need a special game.',
    };
  }
  const routineWords = firstWords.filter((w) => ['more', 'up', 'milk', 'nightnight', 'alldone', 'bye'].includes(w.id));
  const word = pickSeeded(routineWords, `${day}:lowspeech:${age}`);
  return {
    id: 'speech',
    kind: 'speech',
    emoji: '🗣️',
    label: 'Speech game',
    title: `Use “${word.word}” in real life`,
    minutes: 2,
    steps: [
      `Say “${word.say}” whenever it fits today, at meals, diaper changes, or pick-ups.`,
      `Add the gesture: ${word.gesture.charAt(0).toLowerCase()}${word.gesture.slice(1)}`,
      'Pause for a few seconds each time and cheer any response.',
    ],
    note: 'Saying the word in the moment it matters helps it stick.',
  };
}

function movementItem(profile: PlanProfile, day: string, minutes: number): PlanItem {
  const skill = pickMovement(profile.ageMonths, day);
  const { rounds, each } = chunkMinutes(minutes);
  const toy = toyFor(profile);
  const steps = [
    rounds > 1
      ? `Do ${rounds} short rounds of about ${each} minutes each, with a break between so baby stays happy.`
      : `Play for about ${each} minutes, and stop while baby is still smiling.`,
    `Goal: ${skill.goal}`,
    `Set up: ${skill.setup}`,
    ...skill.steps,
  ];
  if (toy) steps.push(`Toy idea: ${toy}.`);
  steps.push(`Avoid: ${skill.avoid}`);
  return {
    id: 'movement',
    kind: 'movement',
    emoji: '🤸',
    label: 'Movement activity',
    title: skill.name,
    minutes,
    steps,
    note: skill.science,
    cta: { label: 'See more in First steps', href: '/steps' },
  };
}

function lowEffortMovementItem(profile: PlanProfile): PlanItem {
  const move = pickLowMovement(profile.ageMonths);
  return {
    id: 'movement',
    kind: 'movement',
    emoji: '🤸',
    label: 'Movement activity',
    title: move.title,
    minutes: 3,
    steps: move.steps,
    note: 'Short, repeated bursts of floor play add up. Three minutes counts.',
    cta: { label: 'See more in First steps', href: '/steps' },
  };
}

function foodItem(profile: PlanProfile, day: string, lowEffort: boolean): PlanItem {
  const food = pickFood(profile.ageMonths, day);
  if (!food) {
    return {
      id: 'food',
      kind: 'food',
      emoji: '🍼',
      label: 'One food to try',
      title: 'Milk is the whole menu for now',
      minutes: null,
      steps: [
        'Breast milk or formula gives baby everything they need until about 6 months.',
        'Watch for readiness signs: sitting with little support, good head control, interest in food, and opening their mouth for a spoon.',
        'Check with your pediatrician before starting solids.',
      ],
      cta: { label: 'See readiness signs', href: '/foods' },
    };
  }
  const steps = lowEffort
    ? [
        `If it is easy, share a safe version of ${food.name.toLowerCase()} from what you are already eating.`,
        `Serve it like this: ${food.slice}`,
        'It is completely fine to skip today.',
      ]
    : [
        `How to serve: ${food.slice}`,
        `Skip this form: ${food.avoid}`,
        'Sit baby upright in a high chair, stay within arm’s reach, and let them lead.',
        'Offer it when baby is calm and awake, not overtired.',
      ];
  if (food.allergens) {
    steps.push(
      'This is a common allergen. Offer a small taste earlier in the day so you can watch for a reaction, and talk to your pediatrician first if there is eczema or food allergy in the family.',
    );
  }
  return {
    id: 'food',
    kind: 'food',
    emoji: food.emoji,
    label: 'One food to try',
    title: food.name,
    minutes: null,
    steps,
    note: food.science,
    cta: { label: 'See slicing and safety', href: '/foods' },
  };
}

function bondingItem(profile: PlanProfile, day: string, minutes: number, lowEffort: boolean): PlanItem {
  const activity = pickBonding(profile, day, lowEffort ? lowEffortBonding : bondingActivities);
  return {
    id: 'bonding',
    kind: 'bonding',
    emoji: activity.emoji,
    label: 'Bonding activity',
    title: activity.title,
    minutes: lowEffort ? 3 : minutes,
    steps: activity.steps,
    note: activity.why,
  };
}

function milestoneItem(profile: PlanProfile, day: string): PlanItem {
  const { band, item } = pickMilestone(profile.ageMonths, day, profile.achieved);
  return {
    id: 'milestone',
    kind: 'milestone',
    emoji: '🌟',
    label: 'Milestone to watch for',
    title: item.text,
    minutes: null,
    steps: [
      `Many babies show this by about ${band} months.`,
      `How to encourage it: ${item.tip}`,
      'Check it off in the Milestones tracker when you see it.',
      'Every baby is different. This is a sign to look for, not a deadline.',
    ],
    note: 'Based on CDC “Learn the Signs. Act Early.” milestones. If you are worried about any skill, talk with your pediatrician.',
    cta: { label: 'Open milestone tracker', href: '/milestones' },
  };
}

export function buildPlan(profile: PlanProfile, day: string, lowEffort: boolean): DailyPlan {
  const tier = timeTiers.find((t) => t.id === profile.time) ?? timeTiers[1];
  const who = profile.name.trim() || 'baby';

  const items: PlanItem[] = lowEffort
    ? [
        lowEffortSpeech(profile, day),
        lowEffortMovementItem(profile),
        foodItem(profile, day, true),
        bondingItem(profile, day, 3, true),
        milestoneItem(profile, day),
      ]
    : [
        speechGame(profile, day, tier.speech),
        movementItem(profile, day, tier.movement),
        foodItem(profile, day, false),
        bondingItem(profile, day, tier.bonding, false),
        milestoneItem(profile, day),
      ];

  const totalMinutes = items.reduce((sum, item) => sum + (item.minutes ?? 0), 0);

  const intro = lowEffort
    ? `Rest counts. Babies learn from ordinary moments, so today’s plan for ${who} folds into things you are already doing. About ${totalMinutes} minutes in all.`
    : `Here is today’s plan for ${who}: about ${totalMinutes} minutes of play, plus one food at a meal you already have planned.`;

  return { lowEffort, intro, totalMinutes, items };
}
