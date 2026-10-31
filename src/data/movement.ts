export type MotorStage = 'head' | 'roll' | 'sit' | 'crawl' | 'stand' | 'walk';
export type Evidence = 'guideline' | 'research' | 'practice';

export type MotorSkill = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  stage: MotorStage;
  window: string;
  goal: string;
  setup: string;
  steps: string[];
  coaching: string;
  avoid: string;
  evidence: Evidence;
  science: string;
};

export const motorStages: { id: MotorStage; label: string; blurb: string }[] = [
  { id: 'head', label: 'Head & tummy', blurb: 'Neck strength starts on the belly' },
  { id: 'roll', label: 'Rolling', blurb: 'Sideways weight shifts unlock rolling' },
  { id: 'sit', label: 'Sitting', blurb: 'Balance with hands free to play' },
  { id: 'crawl', label: 'Crawl & scoot', blurb: 'Many paths to getting mobile' },
  { id: 'stand', label: 'Pull to stand', blurb: 'Strong legs and curious hands' },
  { id: 'walk', label: 'First steps', blurb: 'Cruise, then step, then go' },
];

export const evidenceLabels: Record<Evidence, string> = {
  guideline: 'Pediatric guideline',
  research: 'Research-backed',
  practice: 'Therapy practice',
};

export const movementPrinciples = [
  'Short, happy practice beats long frustrated sessions. Stop while baby is still smiling.',
  'Floor time on a firm, safe surface matters more than gadgets.',
  'Follow baby’s lead. Offer a toy to look at or reach for instead of forcing positions.',
  'Tummy time while awake and watched; back to sleep for naps and nights (AAP).',
  'Skip baby walkers. AAP recommends against them because of injury risk and possible motor delays.',
  'Every baby’s timeline differs. If you have concerns about tone, asymmetry, or delayed milestones, ask your pediatrician about early intervention or PT.',
];

export const motorSkills: MotorSkill[] = [
  {
    id: 'tummy',
    name: 'Tummy time',
    emoji: '🛏️',
    color: '#9DC3E6',
    stage: 'head',
    window: 'From the first weeks, a few minutes at a time while awake',
    goal: 'Lift and turn the head, push through arms, and build neck and core strength.',
    setup: 'Firm play mat. Get down face to face. Keep sessions supervised and awake only.',
    steps: [
      'Place baby on their tummy after a diaper change or during a calm awake window.',
      'Lie in front of them so your face is the toy.',
      'Start with 1–3 minutes and build toward pockets of time across the day.',
      'If baby protests, try tummy-to-chest on your body, or a rolled towel under the chest for support.',
    ],
    coaching: 'Talk, sing, and mirror expressions. A chest-to-chest hold counts as tummy work for newborns.',
    avoid: 'Never tummy time for sleep. Do not leave baby unattended on elevated surfaces.',
    evidence: 'guideline',
    science:
      'AAP recommends supervised tummy time to build strength and help prevent positional plagiocephaly (flat spots) now that babies sleep on their backs. Brief, frequent sessions work better than rare long ones.',
  },
  {
    id: 'neckturn',
    name: 'Neck turning',
    emoji: '🔄',
    color: '#B8D8B0',
    stage: 'head',
    window: 'Newborn to about 4 months',
    goal: 'Comfortably look left and right so neck muscles develop evenly.',
    setup: 'Alternate the arm you hold baby with. Change the crib approach side each day.',
    steps: [
      'During tummy time, slowly move your face or a high-contrast toy in an arc so baby tracks and turns.',
      'Hold feeds on both sides across the day.',
      'When baby wakes, approach from the side they use less often.',
      'Carry baby in both arms across the week so one shoulder is not always doing the work.',
    ],
    coaching: 'Gentle encouragement only. Never push or crack the neck.',
    avoid: 'Forcing the head. If baby always faces one way or has a head tilt, talk with your pediatrician about torticollis.',
    evidence: 'guideline',
    science:
      'Varying head position while awake reduces flat spots and supports symmetrical neck strength. Persistent preference for one side warrants clinical screening for congenital muscular torticollis.',
  },
  {
    id: 'reach',
    name: 'Reach and prop',
    emoji: '✋',
    color: '#E6C96A',
    stage: 'head',
    window: 'About 3 to 5 months',
    goal: 'Push through forearms or hands and reach for toys without collapsing.',
    setup: 'Tummy time with toys just out of easy reach, slightly to one side.',
    steps: [
      'Place a toy at eye level a little beyond baby’s hands.',
      'Tap the toy so it makes a soft sound.',
      'Celebrate any weight shift onto a forearm.',
      'Switch sides so both arms work.',
    ],
    coaching: 'If baby face-plants, slide a thin rolled cloth under the chest for a kinder angle.',
    avoid: 'Propping in sitting devices for long stretches instead of floor play.',
    evidence: 'research',
    science:
      'Reaching while bearing weight on the arms builds the shoulder girdle strength later used for crawling. Motor learning research favors active, goal-directed practice over passive positioning.',
  },
  {
    id: 'rollbacktobelly',
    name: 'Back to belly roll',
    emoji: '🔃',
    color: '#E8A29A',
    stage: 'roll',
    window: 'Often around 4 to 6 months',
    goal: 'Roll from back to tummy with control.',
    setup: 'Open floor space. Place a toy toward one hip to invite a turn.',
    steps: [
      'With baby on their back, hold a toy toward one side at hip height.',
      'Gently guide the hip and leg to that side while baby turns their head to look.',
      'Pause when baby starts to pull themselves over — let them finish the roll.',
      'Practice both directions across the week.',
    ],
    coaching: 'Start the motion, then wait. The “work” should be mostly baby’s.',
    avoid: 'Flipping baby over quickly. That skips the strength-building piece.',
    evidence: 'practice',
    science:
      'Pediatric PT commonly uses toy-motivated weight shifts to teach rolling. Active practice builds rotation through the trunk better than being rolled passively.',
  },
  {
    id: 'rollbellytoback',
    name: 'Belly to back roll',
    emoji: '↩️',
    color: '#9BB5C8',
    stage: 'roll',
    window: 'Often around 5 to 7 months',
    goal: 'Roll from tummy to back without getting stuck face-down frustrated.',
    setup: 'Tummy time near a toy placed slightly behind one shoulder.',
    steps: [
      'During tummy time, put a favorite toy just behind and to the side.',
      'Baby looks, shifts weight onto one arm, and the opposite hip lifts.',
      'Spot them so they do not bonk a hard surface as they tip.',
      'Cheer the landing on their back.',
    ],
    coaching: 'Some babies roll early by accident. Stay close on couches and beds.',
    avoid: 'Leaving baby alone on elevated surfaces once rolling begins.',
    evidence: 'guideline',
    science:
      'Once rolling starts, fall risk rises. AAP safe-sleep and safe-play guidance emphasizes supervised floor play and keeping sleep spaces clear and on the back.',
  },
  {
    id: 'sidelying',
    name: 'Side-lying play',
    emoji: '🧸',
    color: '#D9CBEA',
    stage: 'roll',
    window: 'About 4 to 7 months',
    goal: 'Bring hands to midline and feel the side-lying position that links back and belly.',
    setup: 'Lay baby on one side with a rolled towel behind the back for gentle support. Toys in front of the chest.',
    steps: [
      'Place baby on their side with hips and knees softly bent.',
      'Offer a toy at chest height so both hands can meet.',
      'Play 2–5 minutes, then switch sides.',
      'Remove the towel as baby holds the position alone.',
    ],
    coaching: 'This is a favorite PT progression toward rolling and sitting.',
    avoid: 'Leaving baby unsupervised with props.',
    evidence: 'practice',
    science:
      'Side-lying encourages hands to midline and trunk rotation — building blocks for rolling and sitting used widely in early intervention PT.',
  },
  {
    id: 'sitsupport',
    name: 'Supported sitting',
    emoji: '🪑',
    color: '#F0C4C4',
    stage: 'sit',
    window: 'About 5 to 7 months',
    goal: 'Sit with less hand support and keep the head steady while looking around.',
    setup: 'Sit on the floor with baby between your legs, or use your hands at their hips — not under the arms all the time.',
    steps: [
      'Support at the hips or lower trunk so baby can right themselves.',
      'Offer toys at midline on the floor or a low table.',
      'Briefly lighten your hands so baby practices balance reactions.',
      'Return support before frustration spikes.',
    ],
    coaching: 'Floor sitting beats long stretches in a Bumbo-style seat for building active balance.',
    avoid: 'Leaving baby propped in a sitting device for long periods.',
    evidence: 'research',
    science:
      'Containers that hold babies in sitting can reduce active muscle work. Developmental science favors floor-based practice where babies make postural corrections themselves.',
  },
  {
    id: 'sithandsfree',
    name: 'Hands-free sitting',
    emoji: '🎯',
    color: '#A8C97A',
    stage: 'sit',
    window: 'Often around 6 to 8 months',
    goal: 'Sit without arm props and use both hands to play.',
    setup: 'Stable floor seat of your lap or open mat. Soft pillows behind only for safety spot — not as a lean-all-day couch.',
    steps: [
      'Place toys slightly forward so baby reaches without falling back.',
      'Practice tiny weight shifts by moving a toy left and right.',
      'Let baby recover from small wobbles before you catch them.',
      'Keep sessions short on hard floors; use a mat.',
    ],
    coaching: 'Ring sitting (legs in a circle) is common. If legs always look stiff or very floppy, ask your clinician.',
    avoid: 'Forcing a C-shaped “sacral sit” for long periods if baby collapses every time.',
    evidence: 'guideline',
    science:
      'Independent sitting is a WHO motor milestone window with wide normal range. Practice that challenges balance briefly is more useful than passive propping.',
  },
  {
    id: 'pivot',
    name: 'Tummy pivot',
    emoji: '🌀',
    color: '#7BA3B8',
    stage: 'crawl',
    window: 'About 6 to 9 months',
    goal: 'Turn in a circle on the belly toward a toy — a crawl precursor.',
    setup: 'Tummy time with a toy moving slowly around baby’s body.',
    steps: [
      'Place baby on tummy with a toy at their side.',
      'Nudge the toy a few inches so baby pivots to keep it in view.',
      'Continue around in a gentle arc.',
      'Switch directions another day.',
    ],
    coaching: 'Pivoting teaches weight shift through the pelvis and shoulders.',
    avoid: 'Pulling baby’s legs to spin them.',
    evidence: 'practice',
    science:
      'Pivoting in prone is a typical pre-crawl pattern described in pediatric PT. It strengthens the girdles used later for creeping.',
  },
  {
    id: 'rock',
    name: 'Hands-and-knees rock',
    emoji: '🪨',
    color: '#C4A484',
    stage: 'crawl',
    window: 'About 7 to 10 months',
    goal: 'Hold a hands-and-knees position and rock forward and back.',
    setup: 'After baby can get onto hands and knees, place a mirror or toy in front.',
    steps: [
      'Help baby find hands and knees if needed by supporting the belly briefly.',
      'Place a toy just ahead so they look forward.',
      'Gently tap their bottom or sing while they rock.',
      'Remove your support as soon as they hold the position.',
    ],
    coaching: 'Rocking builds the timing for reciprocal crawling.',
    avoid: 'Holding baby in a crawl position for them for long stretches.',
    evidence: 'practice',
    science:
      'Rocking on all fours is a common transitional pattern before reciprocal crawl. Active holding of the position matters more than being placed there.',
  },
  {
    id: 'crawl',
    name: 'Crawl or scoot',
    emoji: '🐾',
    color: '#6F9083',
    stage: 'crawl',
    window: 'Many babies 8 to 12 months; some skip crawling',
    goal: 'Move across the room toward something interesting.',
    setup: 'Safe hallway or mat. Place a caregiver or toy a few feet away.',
    steps: [
      'Sit a short distance away and invite baby to come.',
      'Celebrate belly scoots, rolls-to-get-there, and classic crawls equally.',
      'Create tiny tunnels with your legs for motivation.',
      'Keep floors clear of small choking hazards.',
    ],
    coaching: 'Not every baby crawls. Bottom scooting or going straight to cruising can be typical.',
    avoid: 'Panic if baby skips crawling but otherwise plays with both sides of the body.',
    evidence: 'research',
    science:
      'WHO motor milestone standards show wide windows. Crawling is common but not required for typical walking. Asymmetry, very late mobility, or loss of skills still deserves a check-in.',
  },
  {
    id: 'kneel',
    name: 'Tall kneel to stand',
    emoji: '🧍',
    color: '#E8C96A',
    stage: 'stand',
    window: 'About 8 to 12 months',
    goal: 'Pull to kneel at a couch, then to stand using arms and legs.',
    setup: 'Couch or low sturdy table. Favorite toys on the surface.',
    steps: [
      'Place toys on the couch so baby pulls up from kneeling.',
      'Spot the hips rather than lifting under the arms.',
      'Encourage half-kneel (one foot planted) as a step toward standing.',
      'Practice coming back down slowly onto the bottom — landing soft is a skill.',
    ],
    coaching: 'Coming down safely prevents many frustrated topples.',
    avoid: 'Baby walkers and doorway jumpers as “practice standing.”',
    evidence: 'guideline',
    science:
      'AAP recommends against baby walkers due to injury risk and association with delayed motor skills. Pull-to-stand at furniture uses real balance reactions walkers bypass.',
  },
  {
    id: 'cruise',
    name: 'Cruising',
    emoji: '🛋️',
    color: '#9DC3E6',
    stage: 'stand',
    window: 'Often 9 to 13 months',
    goal: 'Side-step along furniture while holding on.',
    setup: 'Couch cushions in a line, or a low table path to a parent.',
    steps: [
      'Put a toy a step away along the couch.',
      'Let baby figure out the side step; spot loosely.',
      'Gradually increase the gap between furniture pieces.',
      'Practice turning corners at the couch arm.',
    ],
    coaching: 'Barefoot or grippy socks beat slippery socks on hard floors.',
    avoid: 'Slippery floors with slick socks.',
    evidence: 'practice',
    science:
      'Cruising builds hip strength and lateral weight shift used in independent walking. Environmental invitation (toys just out of reach) is a classic motor-learning setup.',
  },
  {
    id: 'standfree',
    name: 'Stand without holding',
    emoji: '🧍',
    color: '#B8D8B0',
    stage: 'walk',
    window: 'Around 10 to 14 months for many babies',
    goal: 'Let go for a moment and keep balance in standing.',
    setup: 'Open space with a soft mat. Sit a few feet away with arms open.',
    steps: [
      'While baby stands at the couch, hold a toy at their chest height a few inches away.',
      'They may let go briefly to reach.',
      'Cheer any free stand, even one second.',
      'Do not pull them to standing by the hands as the main practice method.',
    ],
    coaching: 'Wobbly knees are normal. Wide feet are normal.',
    avoid: 'Holding both hands high above the head and marching baby around as the only “walking practice.”',
    evidence: 'research',
    science:
      'Independent standing requires quiet balance (“postural control”). Brief free standing teaches that better than being walked while fully supported by adult hands.',
  },
  {
    id: 'firststeps',
    name: 'First independent steps',
    emoji: '👟',
    color: '#E6C96A',
    stage: 'walk',
    window: 'WHO window spans roughly 8 to 18 months for most children',
    goal: 'Take steps between two supportive surfaces or toward you.',
    setup: 'Kneel a short distance from the couch. Soft clear floor.',
    steps: [
      'Invite baby to walk from couch to your open hands — start with one step of distance.',
      'Increase distance slowly across days.',
      'Offer a push toy only if it is stable and weighted; many are too fast.',
      'Celebrate falls that baby gets back up from.',
    ],
    coaching: 'Shoes are for outdoor protection. Indoors, bare feet help grip and feedback.',
    avoid: 'Comparing month-by-month to another baby. Ranges are wide.',
    evidence: 'guideline',
    science:
      'WHO Multicentre Growth Reference Study motor standards describe wide healthy windows for walking alone. Late walking with otherwise typical development is often fine; regression or extreme asymmetry needs evaluation.',
  },
  {
    id: 'squat',
    name: 'Squat to pick up',
    emoji: '⏬',
    color: '#E8A29A',
    stage: 'walk',
    window: 'After early walking',
    goal: 'Squat to grab a toy and stand back up without plopping every time.',
    setup: 'Place a toy on the floor while baby is standing and holding a couch lightly.',
    steps: [
      'Encourage a squat to reach the toy.',
      'Let them push through both feet to rise.',
      'Practice in play: toys that “accidentally” fall.',
      'Keep one hand ready if balance is new.',
    ],
    coaching: 'This strengthens legs and teaches controlled movement, not just forward steps.',
    avoid: 'Always picking the toy up for them once they can try.',
    evidence: 'practice',
    science:
      'Squatting and recovering are part of refined gait development used in pediatric PT to build eccentric control and confidence after first steps.',
  },
];

export const movementScience = [
  {
    title: 'Back to sleep, tummy to play',
    body: 'AAP safe-sleep guidance keeps babies on their backs for sleep. Supervised tummy time while awake builds the strength that back-sleeping alone does not.',
  },
  {
    title: 'Wide milestone windows',
    body: 'WHO motor milestone standards show large healthy ranges. A single late skill is less concerning than a pattern of delays, asymmetry, or lost skills.',
  },
  {
    title: 'Active practice beats containers',
    body: 'Extended time in seats, swings, and walkers reduces opportunities for postural practice. Floor play is the main gym.',
  },
  {
    title: 'No baby walkers',
    body: 'AAP recommends against infant walkers because of fall/stair injuries and links to delayed motor skills.',
  },
  {
    title: 'When to get help',
    body: 'Ask your pediatrician about early intervention or pediatric PT for strong head tilt preference, using only one side, very low or high muscle tone, or milestones far outside expected windows.',
  },
];

export const movementDisclaimer =
  'Educational movement ideas inspired by common pediatric PT strategies — not therapy, not a diagnosis, and not a replacement for your pediatrician or a licensed physical therapist.';
