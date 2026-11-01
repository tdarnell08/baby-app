export type Problem = 'fall' | 'night' | 'early' | 'naps' | 'bedtime' | 'regression';
export type SleepAge = 'a0' | 'a4' | 'a7' | 'a12' | 'a24';

export const problems: { id: Problem; label: string; hint: string }[] = [
  { id: 'fall', label: 'Won’t fall asleep', hint: 'Takes a long time to settle' },
  { id: 'night', label: 'Wakes often at night', hint: 'Up again and again' },
  { id: 'early', label: 'Wakes too early', hint: 'Starts the day before dawn' },
  { id: 'naps', label: 'Short naps', hint: 'Naps end after 30 to 45 minutes' },
  { id: 'bedtime', label: 'Fights bedtime', hint: 'Stalling, protesting, getting up' },
  { id: 'regression', label: 'Sleep regression', hint: 'Sleep was fine, now it isn’t' },
];

export const sleepAges: { id: SleepAge; label: string; months: number }[] = [
  { id: 'a0', label: '0 to 3 months', months: 1 },
  { id: 'a4', label: '4 to 6 months', months: 5 },
  { id: 'a7', label: '7 to 12 months', months: 9 },
  { id: 'a12', label: '1 to 2 years', months: 18 },
  { id: 'a24', label: '2 years and up', months: 30 },
];

export function ageToBand(months: number): SleepAge {
  if (months < 4) return 'a0';
  if (months < 7) return 'a4';
  if (months < 13) return 'a7';
  if (months < 24) return 'a12';
  return 'a24';
}

export type TipLink = { label: string; href: '/sick' | '/sleep-window' | '/sleep' | '/sleep-routine' | '/sleep-safe' | '/sleep-night' };

export type Tip = {
  id: string;
  head: string;
  text: string;
  p: Problem[];
  a: SleepAge[];
  src: string[];
  link?: TipLink;
};

const ALL_AGES: SleepAge[] = ['a0', 'a4', 'a7', 'a12', 'a24'];
const OVER_3M: SleepAge[] = ['a4', 'a7', 'a12', 'a24'];
const BABY: SleepAge[] = ['a0', 'a4', 'a7'];
const TODDLER: SleepAge[] = ['a12', 'a24'];
const ALL_PROBLEMS: Problem[] = ['fall', 'night', 'early', 'naps', 'bedtime', 'regression'];

export const ruleOutTips: Tip[] = [
  { id: 'r-hungry', head: 'Offer a feed', text: 'A hungry baby can’t settle. Feed, burp, then settle again.', p: [], a: ['a0', 'a4', 'a7'], src: [] },
  { id: 'r-temp', head: 'Adjust the room', text: 'Dress them in one more layer than you’d wear. Sweating or a hot chest means too warm.', p: [], a: ALL_AGES, src: ['aapSafeSleep'] },
  { id: 'r-diaper', head: 'Change the diaper', text: 'Wet or dirty? A quick, quiet change with the lights low.', p: [], a: ALL_AGES, src: [] },
  { id: 'r-sick', head: 'Check for illness or teething', text: 'Fever, stuffy nose, pulling at ears, or sore gums can break sleep.', p: [], a: ALL_AGES, src: [], link: { label: 'Open Sick Day', href: '/sick' } },
  { id: 'r-nap', head: 'Check nap timing', text: 'Too much or too little awake time can make sleep harder.', p: [], a: ALL_AGES, src: [], link: { label: 'Wake window helper', href: '/sleep-window' } },
];

export const tips: Tip[] = [
  // Won't fall asleep
  { id: 'f-clock', head: 'Watch the clock, not the yawns', text: 'Eye rubbing is often too late. Start settling near the early end of the wake window.', p: ['fall', 'naps'], a: OVER_3M, src: ['aapBrushBookBed'], link: { label: 'Wake window helper', href: '/sleep-window' } },
  { id: 'f-routine', head: 'Same wind-down every night', text: 'A short, predictable routine (bath, book, bed) tells their body what comes next.', p: ['fall', 'bedtime', 'regression', 'naps'], a: ALL_AGES, src: ['aapBrushBookBed'], link: { label: 'Build a routine', href: '/sleep-routine' } },
  { id: 'f-drowsy', head: 'Down drowsy, not asleep', text: 'From about 4 months, lay them down calm and sleepy so they practice falling asleep in their crib.', p: ['fall', 'night', 'naps'], a: ['a4', 'a7'], src: ['aapGettingToSleep'] },
  { id: 'f-dim', head: 'Lights down, voices low', text: 'Dim the lights before bedtime and keep things calm.', p: ['fall', 'bedtime', 'naps'], a: ALL_AGES, src: ['aapSleepHabits'] },
  { id: 'f-screens', head: 'Screens off an hour early', text: 'Turn off all screens at least 60 minutes before bed and keep them out of the bedroom.', p: ['fall', 'bedtime'], a: ['a7', 'a12', 'a24'], src: ['aapSleepHabits'] },
  { id: 'f-play', head: 'Quiet play at the end', text: 'Active play right before bed can wind them up. Try books, songs, or cuddles.', p: ['fall', 'bedtime'], a: TODDLER, src: ['aapToddlerSleep'] },
  { id: 'f-earlier', head: 'Try bedtime 15 minutes earlier', text: 'Even 15 to 20 minutes earlier can make a big difference.', p: ['fall', 'bedtime', 'early'], a: ['a7', 'a12', 'a24'], src: ['aapBrushBookBed'] },
  { id: 'f-newborn', head: 'Newborns don’t have a schedule yet', text: 'Follow sleepy cues and settle soon after they wake. Sleep organizes over the first months.', p: ['fall', 'naps', 'regression'], a: ['a0'], src: ['chopSleep'] },
  { id: 'f-daynight', head: 'Day is light, night is quiet', text: 'Play and talk in the day. At night keep it dark, calm, and short.', p: ['fall', 'night', 'early'], a: ['a0', 'a4'], src: ['aapGettingToSleep'] },
  { id: 'f-room', head: 'Keep the room comfortable', text: 'Comfortably cool (the AAP suggests 68 to 72°F) and no more than one extra layer.', p: ['fall', 'night', 'early'], a: ALL_AGES, src: ['aapSleepHabits', 'aapSafeSleep'] },
  { id: 'f-lovey', head: 'A favorite thing for bed', text: 'A safe teddy or small blanket can comfort toddlers. Check for loose parts.', p: ['fall', 'bedtime', 'night'], a: TODDLER, src: ['aapToddlerSleep'] },
  { id: 'f-sound', head: 'Try a soft, steady sound', text: 'It may help some babies settle. Keep it low and across the room, never at the crib.', p: ['fall', 'night', 'naps'], a: ALL_AGES, src: [], link: { label: 'Sleep sounds', href: '/sleep' } },

  // Wakes often at night
  { id: 'n-feeds', head: 'Night feeds are normal', text: 'Newborns wake to eat. Feed calmly, keep lights low, then back to sleep.', p: ['night'], a: ['a0'], src: ['aapGettingToSleep'] },
  { id: 'n-boring', head: 'Keep nights boring', text: 'Soft voice, low light, no play. Don’t stimulate or fully wake them.', p: ['night', 'early'], a: ['a0', 'a4'], src: ['aapGettingToSleep'] },
  { id: 'n-pause', head: 'Pause before you go in', text: 'Waking and settling is normal. Give a minute or two to see if they drift back.', p: ['night', 'early', 'regression'], a: ['a4', 'a7'], src: ['aapGettingToSleep'] },
  { id: 'n-same', head: 'Same response every time', text: 'Keep checks brief and calm. If you appear every time, they expect you every time.', p: ['night', 'bedtime', 'regression', 'early'], a: ['a7', 'a12', 'a24'], src: ['aapToddlerSleep'] },
  { id: 'n-solids', head: 'Early solids won’t fix nights', text: 'Starting solids before about 6 months doesn’t help sleep and may cause a tummy ache.', p: ['night'], a: ['a4'], src: ['aapSleepHabits'] },
  { id: 'n-bottle', head: 'No bottle in bed', text: 'Feed, wipe their gums, then lay them down. Milk or juice in bed can harm teeth.', p: ['night', 'fall'], a: ['a7', 'a12'], src: ['aapSleepHabits'] },
  { id: 'n-ownbed', head: 'Their own bed all night', text: 'Sharing your bed can make it harder for them to fall asleep alone.', p: ['night', 'bedtime'], a: TODDLER, src: ['aapToddlerSleep'] },
  { id: 'n-safe', head: 'Back to their own crib', text: 'If you feed or comfort in your bed, move them to their crib before you doze.', p: ['night'], a: BABY, src: ['aapSafeSleep'], link: { label: 'Safe sleep', href: '/sleep-safe' } },
  { id: 'n-brief', head: 'Safe and well? Keep it brief', text: 'If they’re safe and well, let them find their own way back to sleep.', p: ['night', 'bedtime'], a: TODDLER, src: ['aapToddlerSleep'] },
  { id: 'n-day', head: 'Bright, busy days', text: 'Daytime activity, fresh air, and light at wake-up support sleep at night.', p: ['night', 'early', 'fall'], a: ['a7', 'a12', 'a24'], src: ['aapSleepHabits'] },

  // Early waking
  { id: 'e-dim', head: 'Treat early wakes like night', text: 'Low light, few words. Bright light and play start at wake-up time.', p: ['early'], a: OVER_3M, src: ['aapSleepHabits'] },
  { id: 'e-waketime', head: 'Same wake time daily', text: 'A regular wake time, weekdays and weekends, steadies the body clock.', p: ['early', 'regression'], a: OVER_3M, src: ['aapSleepHabits'] },
  { id: 'e-bedtime', head: 'Check bedtime and naps', text: 'A bedtime that is too late or an overtired day can push wake-ups earlier.', p: ['early'], a: ['a4', 'a7', 'a12', 'a24'], src: ['aapBrushBookBed'] },
  { id: 'e-newborn', head: 'Early is normal this young', text: 'Newborns wake for feeds at any hour. A day and night rhythm comes later.', p: ['early'], a: ['a0'], src: ['chopSleep'] },
  { id: 'e-wait', head: 'Wait a few minutes', text: 'If they’re safe and calm, give them time to drift back before you step in.', p: ['early'], a: ['a4', 'a7'], src: ['aapGettingToSleep'] },
  { id: 'e-room', head: 'Check the room', text: 'Cool, dark, and quiet. Too warm or too bright can end sleep early.', p: ['early'], a: ALL_AGES, src: ['aapSleepHabits'] },

  // Short naps
  { id: 'p-window', head: 'Aim for the wake window', text: 'Naps go better when sleep starts inside the typical awake time for the age.', p: ['naps'], a: ALL_AGES, src: [], link: { label: 'Wake window helper', href: '/sleep-window' } },
  { id: 'p-mini', head: 'A mini routine before naps', text: 'Diaper, song, lights down. A short cue repeated daily helps.', p: ['naps'], a: ALL_AGES, src: ['aapBrushBookBed'] },
  { id: 'p-newborn', head: 'Every nap is a safe sleep', text: 'Newborn naps are short and unpredictable. Back to sleep, flat surface, every time.', p: ['naps'], a: ['a0'], src: ['aapBackSleep'], link: { label: 'Safe sleep', href: '/sleep-safe' } },
  { id: 'p-contact', head: 'Moved from the car seat?', text: 'If they doze in a car seat, swing, or carrier, move them to a flat crib on their back as soon as you can.', p: ['naps'], a: BABY, src: ['aapSafeSleep'] },
  { id: 'p-regular', head: 'Regular nap times', text: 'Set nap times and stick to them. Late naps can push bedtime later.', p: ['naps', 'bedtime'], a: ['a7', 'a12', 'a24'], src: ['aapBrushBookBed'] },
  { id: 'p-toddler', head: 'Naps are changing', text: 'Many toddlers go from 2 naps to 1 around 15 to 18 months. Between changes, naps can be uneven.', p: ['naps', 'regression'], a: ['a12', 'a24'], src: [] },

  // Fights bedtime
  { id: 'b-same', head: 'Same bedtime every night', text: 'It helps them know what to expect and builds healthy sleep patterns.', p: ['bedtime', 'fall'], a: ['a7', 'a12', 'a24'], src: ['aapToddlerSleep'] },
  { id: 'b-needs', head: 'Handle needs before lights out', text: 'Drink, potty, a nightlight, the door ajar. Then there are fewer reasons to stall.', p: ['bedtime'], a: TODDLER, src: ['aapToddlerSleep'] },
  { id: 'b-calm', head: 'Calm, not negotiating', text: 'Stay brief and kind. Walk them back to bed the same way each time.', p: ['bedtime'], a: TODDLER, src: ['aapToddlerSleep'] },
  { id: 'b-time', head: 'Give it time', text: 'It takes days or weeks. A negative response can make a sleep problem worse.', p: ['bedtime', 'regression', 'night'], a: ['a12', 'a24'], src: ['aapToddlerSleep'] },

  // Regression
  { id: 'g-pass', head: 'Rough patches are common', text: 'Big growth or new skills can shake sleep. Keep things steady for a few weeks.', p: ['regression'], a: ALL_AGES, src: [] },
  { id: 'g-skills', head: 'Practice new skills by day', text: 'Rolling, sitting, standing: give lots of awake floor play so it isn’t all at night.', p: ['regression'], a: ['a4', 'a7', 'a12'], src: ['aapBackSleep'] },
  { id: 'g-back', head: 'Keep back to sleep', text: 'Keep placing your baby on their back for every sleep, even while they learn to roll.', p: ['regression'], a: ['a4', 'a7'], src: ['aapBackSleep', 'aap2022'], link: { label: 'Safe sleep', href: '/sleep-safe' } },
  { id: 'g-check', head: 'Check teething or a cold', text: 'New sleep trouble can be teething or a bug. Rule it out first.', p: ['regression', 'night'], a: ['a7', 'a12', 'a24'], src: [], link: { label: 'Open Sick Day', href: '/sick' } },

  // Fallbacks that fit every problem and age
  { id: 'x-basics', head: 'Check the basics fast', text: 'Hungry, wet, too warm or cold? A quick check with the lights low.', p: ALL_PROBLEMS, a: ALL_AGES, src: ['aapGettingToSleep'] },
  { id: 'x-routine', head: 'Keep to one routine', text: 'Doing the same steps in the same order makes sleep easier to predict.', p: ALL_PROBLEMS, a: ALL_AGES, src: ['aapSleepHabits'], link: { label: 'Build a routine', href: '/sleep-routine' } },
  { id: 'x-safe', head: 'Safe sleep, every sleep', text: 'On their back, in a bare crib, in your room. No pillows, bumpers, or loose blankets.', p: ALL_PROBLEMS, a: ['a0', 'a4', 'a7'], src: ['aapSafeSleep'], link: { label: 'Safe sleep', href: '/sleep-safe' } },
];

const byId = new Map<string, Tip>([...ruleOutTips, ...tips].map((t) => [t.id, t]));

export function tipById(id: string): Tip | undefined {
  return byId.get(id);
}

export function tipsFor(problem: Problem, age: SleepAge, max = 5): Tip[] {
  const effective: Problem = problem === 'bedtime' && (age === 'a0' || age === 'a4') ? 'fall' : problem;
  const matches = tips.filter((t) => t.p.includes(effective) && t.a.includes(age));
  const specific = matches.filter((t) => !t.id.startsWith('x-'));
  const fill = matches.filter((t) => t.id.startsWith('x-'));
  return [...specific, ...fill].slice(0, max);
}

export type RoutineCatalogItem = { id: string; label: string; minutes: number };

export const routineCatalog: RoutineCatalogItem[] = [
  { id: 'bath', label: 'Bath', minutes: 10 },
  { id: 'pjs', label: 'Pajamas', minutes: 4 },
  { id: 'diaper', label: 'Diaper change', minutes: 3 },
  { id: 'teeth', label: 'Brush gums or teeth', minutes: 3 },
  { id: 'feed', label: 'Feed', minutes: 15 },
  { id: 'book', label: 'Book', minutes: 8 },
  { id: 'song', label: 'Lullaby or song', minutes: 4 },
  { id: 'cuddle', label: 'Cuddle', minutes: 5 },
  { id: 'lights', label: 'Lights down', minutes: 2 },
  { id: 'sound', label: 'Sound on', minutes: 1 },
  { id: 'kiss', label: 'Goodnight kiss, into the crib', minutes: 2 },
];

export const MAX_ROUTINE_STEPS = 8;

export const sleepSafeBasics: { text: string; src: string[] }[] = [
  { text: 'Back to sleep, for every sleep, including naps.', src: ['aapBackSleep', 'aapSafeSleep'] },
  { text: 'A firm, flat crib, bassinet, or play yard that meets safety standards, with a tight fitted sheet and nothing else: no pillows, blankets, bumpers, or toys.', src: ['aapSafeSleep'] },
  { text: 'Share a room, not a bed. Keep the crib in your room for at least the first 6 months, ideally up to a year.', src: ['aapSids', 'aap2022'] },
  { text: 'Never fall asleep with your baby on a couch or armchair. If you feed in bed, put your baby back in their crib before you sleep.', src: ['aap2022', 'aapSafeSleep'] },
  { text: 'Don’t let them overheat: about one more layer than you’d wear, no hats indoors, and check for sweating or a hot chest.', src: ['aapSafeSleep', 'aapBackSleep'] },
  { text: 'If they fall asleep in a car seat, swing, stroller, or carrier, move them to a flat crib on their back as soon as you can.', src: ['aapSafeSleep'] },
];

export const pediatricianFlags: { text: string; src: string[] }[] = [
  { text: 'Frequent snoring, or noisy or labored breathing during sleep', src: ['aapApnea'] },
  { text: 'Pauses in breathing, gasping, or choking during sleep', src: ['aapApnea'] },
  { text: 'Unusual sleepiness in the day, trouble paying attention, or behavior problems', src: ['aapApnea'] },
  { text: 'Sleep trouble that keeps going, or that worries you, even with a steady routine', src: ['aapSleepHabits'] },
];

export const emergencyFlags: { text: string; src: string[] }[] = [
  { text: 'Breathing stops for more than 20 seconds', src: ['aapApnea'] },
  { text: 'Skin turns pale, bluish, or grayish', src: ['aapApnea'] },
  { text: 'A change in muscle tone (limp or floppy), or a fever or other signs of illness along with these', src: ['aapApnea'] },
];

export const sleepHelpDisclaimer =
  'Sleep Help shares general parenting and safe-sleep guidance from public sources. It is not medical advice and does not diagnose a sleep problem. Every baby is different. Talk to your pediatrician about anything that worries you.';

export type NightTry = { head: string; text: string };

export function nightTries(ageMonths: number): NightTry[] {
  if (ageMonths < 4) {
    return [
      { head: 'Feed if they’re hungry', text: 'Newborns wake to eat. Keep the lights low and your voice soft.' },
      { head: 'Quick check', text: 'Wet diaper? Too warm? Change or adjust, and keep it quiet.' },
      { head: 'Back in their crib', text: 'Lay them on their back in their own crib, in your room.' },
    ];
  }
  if (ageMonths < 12) {
    return [
      { head: 'Pause one or two minutes', text: 'Many babies resettle on their own. Listen before you go in.' },
      { head: 'Quick check', text: 'Hungry, wet, too warm? Low light, soft voice.' },
      { head: 'Soothe, then crib', text: 'Comfort them, then lay them down drowsy on their back. Not in your bed.' },
    ];
  }
  return [
    { head: 'Stay calm and brief', text: 'If they’re safe and well, keep it short and boring.' },
    { head: 'Same words each time', text: 'A short phrase and a pat, then leave. No new snacks or play.' },
    { head: 'Walk them back to bed', text: 'Gentle and the same every time. It takes time.' },
  ];
}
