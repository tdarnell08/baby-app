export type MilestoneDomain = 'social' | 'language' | 'thinking' | 'movement' | 'feeding';

export type Milestone = {
  id: string;
  months: number;
  domain: MilestoneDomain;
  text: string;
  tip: string;
};

export const domainInfo: Record<MilestoneDomain, { label: string; emoji: string; tip: string }> = {
  social: { label: 'Social', emoji: '😊', tip: 'Give lots of face-to-face time and respond to every smile and sound.' },
  language: { label: 'Language', emoji: '🗣️', tip: 'Talk, sing, and pause so your baby can take a turn.' },
  thinking: { label: 'Thinking', emoji: '🧠', tip: 'Offer safe things to explore and play simple hide-and-find games.' },
  movement: { label: 'Movement', emoji: '🤸', tip: 'Give plenty of supervised floor time and a reason to reach or move.' },
  feeding: { label: 'Feeding', emoji: '🥄', tip: 'Let your baby lead at meals and offer safe, age-appropriate textures.' },
};

export const domainOrder: MilestoneDomain[] = ['social', 'language', 'thinking', 'movement', 'feeding'];

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36);
}

function m(months: number, domain: MilestoneDomain, text: string, tip?: string): Milestone {
  return { id: `${months}-${domain}-${slug(text)}`, months, domain, text, tip: tip ?? domainInfo[domain].tip };
}

export const milestones: Milestone[] = [
  m(2, 'social', 'Calms down when spoken to or picked up', 'Use a soft, steady voice and gentle holding.'),
  m(2, 'social', 'Looks at your face', 'Hold baby 8 to 12 inches away, where they focus best.'),
  m(2, 'social', 'Smiles when you talk or smile at them', 'Get face to face, smile big, and wait for the response.'),
  m(2, 'language', 'Makes sounds other than crying', 'Echo any coo and pause so they can answer.'),
  m(2, 'language', 'Reacts to loud sounds'),
  m(2, 'thinking', 'Watches you as you move', 'Slowly move across their view while you talk.'),
  m(2, 'thinking', 'Looks at a toy for several seconds', 'Hold a high-contrast toy about a foot away.'),
  m(2, 'movement', 'Holds head up when on their tummy', 'Offer short tummy-time bursts, even on your chest.'),
  m(2, 'movement', 'Moves both arms and both legs'),
  m(2, 'movement', 'Opens hands briefly'),

  m(4, 'social', 'Smiles on their own to get your attention'),
  m(4, 'social', 'Chuckles when you try to make them laugh', 'Try silly sounds, gentle tickles, or a surprise “boo!”'),
  m(4, 'language', 'Coos with sounds like “oooo” and “aahh”', 'Echo their sounds back and wait.'),
  m(4, 'language', 'Makes sounds back when you talk to them', 'Chat during diaper changes, then pause for their turn.'),
  m(4, 'language', 'Turns head toward the sound of your voice', 'Talk from the side, just out of sight.'),
  m(4, 'thinking', 'Looks at their hands with interest'),
  m(4, 'movement', 'Holds head steady without support when you hold them', 'Tummy time and supported sitting on your lap build the neck.'),
  m(4, 'movement', 'Holds a toy when you put it in their hand', 'Offer light rattles and soft toys that are easy to grip.'),
  m(4, 'movement', 'Pushes up onto elbows or forearms on their tummy', 'Place a toy just in front at eye level.'),
  m(4, 'movement', 'Brings hands to mouth'),
  m(4, 'feeding', 'Opens mouth when hungry and sees breast or bottle'),

  m(6, 'social', 'Knows familiar people', 'Name family members often: “There’s Grandma!”'),
  m(6, 'social', 'Likes to look at themselves in a mirror', 'Sit together at a baby-safe mirror and name faces.'),
  m(6, 'social', 'Laughs'),
  m(6, 'language', 'Takes turns making sounds with you', 'Copy their sounds and wait. Make it a game.'),
  m(6, 'language', 'Blows “raspberries”'),
  m(6, 'language', 'Makes squealing noises'),
  m(6, 'thinking', 'Puts things in mouth to explore them', 'Offer clean, safe, large objects. Watch for choking hazards.'),
  m(6, 'thinking', 'Reaches to grab a toy you hold', 'Hold a toy just within reach and let them work for it.'),
  m(6, 'movement', 'Rolls from tummy to back', 'Place a toy to one side during tummy time and let them try.'),
  m(6, 'movement', 'Pushes up with straight arms when on tummy'),
  m(6, 'movement', 'Leans on hands to support themselves when sitting', 'Practice supported sitting with toys just within reach.'),
  m(6, 'feeding', 'Closes lips to show they don’t want more food', 'Respect the signal. It teaches them you listen.'),

  m(9, 'social', 'Is shy, clingy, or fearful around strangers'),
  m(9, 'social', 'Looks when you call their name', 'Call their name from across the room, then smile.'),
  m(9, 'social', 'Smiles or laughs when you play peekaboo', 'Play peekaboo with a light cloth or your hands.'),
  m(9, 'language', 'Makes sounds like “mamamama” and “bababababa”', 'Say the sounds back with your mouth big and slow.'),
  m(9, 'language', 'Lifts arms up to be picked up'),
  m(9, 'thinking', 'Looks for objects when dropped out of sight', 'Drop a toy and say “Uh oh! Where did it go?”'),
  m(9, 'thinking', 'Bangs two things together'),
  m(9, 'movement', 'Gets to a sitting position by themselves'),
  m(9, 'movement', 'Sits without support', 'Short floor-sitting sessions with toys in front of them.'),
  m(9, 'movement', 'Moves things from one hand to the other'),
  m(9, 'feeding', 'Uses fingers to “rake” food toward themselves', 'Offer soft finger foods on the high-chair tray.'),

  m(12, 'social', 'Plays games with you, like pat-a-cake', 'Repeat the same game daily so they learn the pattern.'),
  m(12, 'language', 'Waves “bye-bye”', 'Wave and say “bye-bye” every time someone leaves.'),
  m(12, 'language', 'Calls a parent “mama” or “dada” or another special name', 'Name yourself often: “Mama is here.”'),
  m(12, 'language', 'Understands “no” (pauses or stops when you say it)'),
  m(12, 'thinking', 'Puts something in a container', 'Offer a bowl and a few large, safe objects.'),
  m(12, 'thinking', 'Looks for things you hide', 'Hide a toy under a blanket while they watch.'),
  m(12, 'movement', 'Pulls up to stand', 'Put toys on the couch so baby has a reason to pull up.'),
  m(12, 'movement', 'Walks holding on to furniture'),
  m(12, 'movement', 'Picks things up between thumb and pointer finger', 'Offer soft, dissolvable foods. Stay close for choking safety.'),
  m(12, 'feeding', 'Drinks from an open cup as you hold it', 'Offer a few sips of water in a small open cup at meals.'),

  m(15, 'social', 'Copies other children while playing'),
  m(15, 'social', 'Shows you an object they like'),
  m(15, 'social', 'Claps when excited'),
  m(15, 'language', 'Tries to say one or two words besides mama or dada', 'Pause after naming everyday things like “ball” or “milk.”'),
  m(15, 'language', 'Looks at a familiar object when you name it', 'Ask “Where’s your shoe?” and see where they look.'),
  m(15, 'language', 'Follows directions given with a gesture and words', 'Hold out your hand and say “Give me the ball.”'),
  m(15, 'language', 'Points to ask for something or to get help', 'Respond to every point: “You want the ball! Ball!”'),
  m(15, 'movement', 'Takes a few steps on their own', 'Sit a short distance away and invite them to walk to you.'),
  m(15, 'feeding', 'Uses fingers to feed themselves some food'),

  m(18, 'social', 'Moves away from you but looks to make sure you are close'),
  m(18, 'social', 'Points to show you something interesting', 'Look where they point and name it.'),
  m(18, 'language', 'Tries to say three or more words besides mama or dada', 'Read short books and point at pictures to name them.'),
  m(18, 'language', 'Follows one-step directions without any gestures', 'Try “Give me the ball” while keeping your hands still.'),
  m(18, 'thinking', 'Copies you doing chores'),
  m(18, 'thinking', 'Plays with toys in a simple way, like pushing a toy car'),
  m(18, 'movement', 'Walks without holding on', 'Let them practice barefoot on a safe, clear floor.'),
  m(18, 'movement', 'Scribbles'),
  m(18, 'movement', 'Climbs on and off a couch without help'),
  m(18, 'feeding', 'Drinks from an open cup and may spill'),
  m(18, 'feeding', 'Tries to use a spoon', 'Give them their own spoon and a thick food that sticks, like yogurt.'),

  m(24, 'social', 'Notices when others are hurt or upset'),
  m(24, 'social', 'Looks at your face to see how to react in a new situation'),
  m(24, 'language', 'Points to things in a book when you ask', 'Ask “Where’s the dog?” and wait.'),
  m(24, 'language', 'Says at least two words together, like “more milk”', 'Model two-word phrases: “more juice,” “bye bye ball.”'),
  m(24, 'language', 'Points to at least two body parts when asked'),
  m(24, 'thinking', 'Holds something in one hand while using the other'),
  m(24, 'thinking', 'Tries to use switches, knobs, or buttons'),
  m(24, 'movement', 'Kicks a ball', 'Roll a soft ball and cheer every kick.'),
  m(24, 'movement', 'Runs'),
  m(24, 'movement', 'Walks up a few stairs with or without help'),
  m(24, 'feeding', 'Eats with a spoon'),
];

export const milestoneBandMonths = Array.from(new Set(milestones.map((x) => x.months)));

export const milestoneSource =
  'Adapted from the CDC’s “Learn the Signs. Act Early.” milestone checklists. They list skills most children (about 3 in 4) show by each age. Every baby is different, and these are not diagnostic.';

export const milestoneAdvice =
  'If a skill is missing or you are worried, mention it to your pediatrician at your next visit. You do not have to wait for a checkup to ask, and early support helps.';

export function milestonesForBand(months: number) {
  return milestones.filter((x) => x.months === months);
}

export function currentBand(ageMonths: number): number | null {
  const passed = milestoneBandMonths.filter((b) => b <= ageMonths);
  return passed.length > 0 ? passed[passed.length - 1] : null;
}

export function nextBand(ageMonths: number): number | null {
  return milestoneBandMonths.find((b) => b > ageMonths) ?? null;
}

export function focusMilestones(
  ageMonths: number,
  achieved: Record<string, string>,
  domain?: MilestoneDomain,
  limit = 4,
): Milestone[] {
  const bands = [currentBand(ageMonths), nextBand(ageMonths)].filter((b): b is number => b !== null);
  const pool = milestones.filter(
    (x) => bands.includes(x.months) && (!domain || x.domain === domain) && !achieved[x.id],
  );
  pool.sort((a, b) => a.months - b.months);
  return pool.slice(0, limit);
}
