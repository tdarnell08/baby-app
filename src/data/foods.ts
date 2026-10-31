export type FoodStage = 'start' | 'soft' | 'finger' | 'family';
export type Evidence = 'guideline' | 'research' | 'practice';

export type FirstFood = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  stage: FoodStage;
  allergens?: boolean;
  slice: string;
  why: string;
  avoid: string;
  serve: string;
  evidence: Evidence;
  science: string;
};

export const foodStages: { id: FoodStage; label: string; blurb: string }[] = [
  { id: 'start', label: 'Around 6 months', blurb: 'Soft first tastes when baby is ready' },
  { id: 'soft', label: 'Soft mashable', blurb: 'Foods that squash easily between fingers' },
  { id: 'finger', label: 'Finger foods', blurb: 'Strips baby can hold and self-feed' },
  { id: 'family', label: 'Family foods', blurb: 'Shared meals, still cut for safety' },
];

export const evidenceLabels: Record<Evidence, string> = {
  guideline: 'Pediatric guideline',
  research: 'Research-backed',
  practice: 'Common practice',
};

export const readinessSigns = [
  'About 6 months old (AAP), and your pediatrician agrees',
  'Sits with little or no support and has good head control',
  'Shows interest in food and opens their mouth when offered a spoon',
  'Can move food to the back of the mouth and swallow (tongue-thrust reflex fading)',
];

export const chokingRules = [
  'Always sit with baby. Never leave them alone while eating.',
  'Baby upright in a high chair, not reclined or walking around.',
  'Food should squash easily between your thumb and finger.',
  'Cut round foods lengthwise into sticks or tiny pieces. Avoid coin-shaped slices.',
  'No whole nuts, popcorn, hard candy, whole grapes, hot dogs cut into coins, or large chunks of raw hard veggies.',
  'Learn infant CPR before starting solids. Ask your pediatrician or a certified class.',
];

export const firstFoods: FirstFood[] = [
  {
    id: 'avocado',
    name: 'Avocado',
    emoji: '🥑',
    color: '#A8C97A',
    stage: 'start',
    slice: 'Ripe strips about the size of your finger, or mash and offer on a preloaded spoon.',
    why: 'Soft fat and easy to mash. A classic first food.',
    avoid: 'Hard or underripe chunks that do not squash.',
    serve: 'Serve ripe and soft. Skin off.',
    evidence: 'guideline',
    science:
      'AAP supports complementary foods around 6 months when readiness signs appear. Soft textures lower choking risk while baby practices chewing and swallowing.',
  },
  {
    id: 'banana',
    name: 'Banana',
    emoji: '🍌',
    color: '#F2DC8A',
    stage: 'start',
    slice: 'Large ripe spear baby can fist-hold, or thin mash. Skip slippery round coins.',
    why: 'Naturally soft and sweet. Easy for gums to mash.',
    avoid: 'Firm green banana and small round discs.',
    serve: 'Very ripe. You can leave a little peel at the base as a handle.',
    evidence: 'practice',
    science:
      'Soft fruits are widely recommended as early textures. Shape matters: long spears are easier to hold than coins, which can block the airway more easily.',
  },
  {
    id: 'sweetpotato',
    name: 'Sweet potato',
    emoji: '🍠',
    color: '#E8A06A',
    stage: 'start',
    slice: 'Steam until soft. Offer finger-size spears or a smooth mash.',
    why: 'Naturally sweet, full of beta-carotene, and easy to soften.',
    avoid: 'Firm roasted cubes or fries that do not mash.',
    serve: 'Cook until a fork slides through with almost no pressure.',
    evidence: 'guideline',
    science:
      'Cooked soft vegetables are standard complementary foods. Thorough cooking is the safety step — hardness, not the vegetable itself, drives choking risk.',
  },
  {
    id: 'ironcereal',
    name: 'Iron-fortified cereal',
    emoji: '🥣',
    color: '#E6DDC8',
    stage: 'start',
    slice: 'Thin with breast milk or formula to a runny spoonable texture. Thicken slowly over weeks.',
    why: 'Iron matters after about 6 months, especially for breastfed babies.',
    avoid: 'Dry cereal puffs that are still hard, and thick paste a baby cannot manage.',
    serve: 'On a soft spoon. Follow baby’s pace.',
    evidence: 'guideline',
    science:
      'AAP highlights iron-rich foods in the second half of infancy. Iron-fortified infant cereal is one practical option alongside meats and beans.',
  },
  {
    id: 'egg',
    name: 'Egg',
    emoji: '🥚',
    color: '#F7E7B0',
    stage: 'soft',
    allergens: true,
    slice: 'Well-cooked scrambled soft bits, or strips of omelet that mash easily.',
    why: 'Protein, choline, and an important early allergen to introduce.',
    avoid: 'Runny undercooked egg and rubbery whole hard-boiled rounds.',
    serve: 'Fully cooked. Start with a tiny taste, then offer more if tolerated.',
    evidence: 'research',
    science:
      'Early introduction of common allergens (around 4–6 months, when ready) can reduce allergy risk for many babies (LEAP for peanut; similar timing guidance for egg in NIAID/AAP materials). Ask your doctor first if eczema or food allergy runs in the family.',
  },
  {
    id: 'peanut',
    name: 'Peanut (thinned)',
    emoji: '🥜',
    color: '#C4A484',
    stage: 'soft',
    allergens: true,
    slice: 'Never whole peanuts. Thin smooth peanut butter with water, breast milk, or formula until drippy, or mix into puree.',
    why: 'Early peanut introduction can lower peanut allergy risk for many infants.',
    avoid: 'Globs of thick peanut butter and any whole or chopped nuts.',
    serve: 'A thin smear on a spoon or mixed into a familiar food.',
    evidence: 'research',
    science:
      'The LEAP trial (Du Toit et al., NEJM 2015) showed early peanut introduction reduced peanut allergy in high-risk infants. NIAID and AAP support age-appropriate early peanut foods — never whole nuts for babies.',
  },
  {
    id: 'yogurt',
    name: 'Plain yogurt',
    emoji: '🥛',
    color: '#EFE6D8',
    stage: 'soft',
    allergens: true,
    slice: 'Spoonable plain whole-milk yogurt. No honey under age 1.',
    why: 'Calcium, fat, and a mild dairy introduction.',
    avoid: 'Choking toppings like whole berries or granola.',
    serve: 'On a spoon. Sweeten with fruit mash, not honey or sugar.',
    evidence: 'guideline',
    science:
      'Dairy yogurt can be part of complementary feeding. Honey is unsafe under 12 months because of infant botulism risk (AAP).',
  },
  {
    id: 'meat',
    name: 'Soft meat or poultry',
    emoji: '🍖',
    color: '#E8A29A',
    stage: 'soft',
    slice: 'Slow-cooked shreds or finely minced meat moistened with broth. Or a soft meat puree.',
    why: 'Heme iron and zinc, especially helpful after 6 months.',
    avoid: 'Tough steaks, round hot-dog coins, and dry jerky.',
    serve: 'Very tender. If offering strips, they should shred with light pressure.',
    evidence: 'guideline',
    science:
      'AAP encourages iron-rich complementary foods such as meats. Texture and tenderness matter more than the protein source for choking safety.',
  },
  {
    id: 'broccoli',
    name: 'Broccoli floret',
    emoji: '🥦',
    color: '#8FBF7F',
    stage: 'finger',
    slice: 'Steam until soft. Offer a floret with a long stem “handle,” or chop into tiny soft bits.',
    why: 'Easy grip stem plus soft tops for gumming.',
    avoid: 'Raw or crisp florets.',
    serve: 'Test: crown should mash between your fingers.',
    evidence: 'practice',
    science:
      'Cooked soft vegetables in graspable shapes support self-feeding. Softness is the safety rule; raw crucifers are a choking hazard.',
  },
  {
    id: 'toast',
    name: 'Soft toast strip',
    emoji: '🍞',
    color: '#E6C96A',
    stage: 'finger',
    slice: 'Lightly toasted bread cut into long finger-width strips. Spread a thin layer of avocado or thinned nut butter if you like.',
    why: 'Gives baby something to hold and gnaw.',
    avoid: 'Fresh doughy bread that gums into a paste ball, and hard crusts.',
    serve: 'Soft enough to dent easily.',
    evidence: 'practice',
    science:
      'Strip shapes help young self-feeders. Sticky globs of bread or thick spreads are more hazardous than thin, manageable strips.',
  },
  {
    id: 'pasta',
    name: 'Soft pasta',
    emoji: '🍝',
    color: '#F0C4C4',
    stage: 'finger',
    slice: 'Cook pasta very soft. Offer large shapes (rigatoni) or cut long noodles into short pieces.',
    why: 'Familiar family food with an easy grip.',
    avoid: 'Al dente noodles and whole cherry-tomato toppings.',
    serve: 'Plain or with a thin sauce. Skip hard chunks of meat.',
    evidence: 'practice',
    science:
      'Well-cooked pasta is a common complementary finger food. Undercooked pasta stays firm and is harder to manage safely.',
  },
  {
    id: 'berry',
    name: 'Berries',
    emoji: '🫐',
    color: '#9BB5C8',
    stage: 'finger',
    slice: 'Quarter or smash blueberries. Slice strawberries into thin lengthwise strips.',
    why: 'Bright flavor and practice with tiny soft pieces.',
    avoid: 'Whole blueberries and large whole strawberries for early eaters.',
    serve: 'Very ripe. Smash for younger babies.',
    evidence: 'guideline',
    science:
      'Round foods are classic choking hazards. CDC and AAP-style guidance emphasizes altering shape: smash, quarter, or slice lengthwise rather than serving spheres.',
  },
  {
    id: 'grape',
    name: 'Grape or cherry tomato',
    emoji: '🍇',
    color: '#B8A1C8',
    stage: 'family',
    slice: 'Always quarter lengthwise (cut in half, then half again). Never serve whole.',
    why: 'Common family foods that become safer when the round shape is removed.',
    avoid: 'Whole grapes, cherry tomatoes, or halves that are still round enough to plug an airway.',
    serve: 'Peeled if the skin is tough. Soft and ripe.',
    evidence: 'guideline',
    science:
      'Spherical foods can form a perfect airway plug. Cutting lengthwise into small pieces is standard choking-prevention advice from pediatric and public-health sources.',
  },
  {
    id: 'apple',
    name: 'Apple',
    emoji: '🍎',
    color: '#E8A29A',
    stage: 'family',
    slice: 'Cook until soft, then offer thin strips or mash. Raw apple only as very thin matchsticks for older toddlers who chew well.',
    why: 'Popular fruit that is hazardous when hard and raw.',
    avoid: 'Hard raw wedges and whole baby apples.',
    serve: 'Start cooked. Firm raw apple waits until chewing is reliable.',
    evidence: 'guideline',
    science:
      'Hard raw fruit and vegetables are frequent choking hazards. Cooking or cutting into thin strips changes both texture and shape.',
  },
  {
    id: 'cheese',
    name: 'Soft cheese',
    emoji: '🧀',
    color: '#F2DC8A',
    stage: 'family',
    allergens: true,
    slice: 'Thin strips or tiny soft pea-size bits of mild cheese. Avoid string-cheese coins.',
    why: 'Protein and a dairy option for older infants.',
    avoid: 'Large cubes and sticky thick chunks.',
    serve: 'Room temperature so it is softer.',
    evidence: 'practice',
    science:
      'Cheese can fit into complementary feeding, but firm cubes behave like other hard solids. Thin strips or tiny soft pieces are safer shapes.',
  },
  {
    id: 'fish',
    name: 'Flaky fish',
    emoji: '🐟',
    color: '#A9D3E8',
    stage: 'family',
    allergens: true,
    slice: 'Bake or steam until flaky. Remove all bones. Offer soft flakes or small pieces.',
    why: 'Omega-3 fats and a common allergen to introduce early in safe forms.',
    avoid: 'Fish sticks with hard crusts and any visible bones.',
    serve: 'Low-mercury options (for example salmon). Confirm with your pediatrician.',
    evidence: 'research',
    science:
      'AAP supports introducing allergenic foods including fish in infancy when developmentally ready. Bone removal and soft flakes are the safety essentials.',
  },
];

export const foodScience = [
  {
    title: 'Start around 6 months, when ready',
    body: 'AAP recommends exclusive milk feeding about 6 months, then complementary foods when baby shows readiness — not by the calendar alone.',
  },
  {
    title: 'Iron matters',
    body: 'Iron stores run lower after about 6 months. Iron-rich foods (meats, iron-fortified cereal, beans) are a priority in pediatric guidance.',
  },
  {
    title: 'Allergens earlier, not later',
    body: 'For most babies, introducing peanut and egg in the complementary-feeding window is associated with lower allergy risk than waiting. High-risk babies need a clinician’s plan first (LEAP; NIAID).',
  },
  {
    title: 'Shape and softness prevent choking',
    body: 'Round, firm, sticky, and hard foods cause many infant choking events. Lengthwise strips and mashable textures are practical risk reducers taught by pediatric and injury-prevention groups.',
  },
  {
    title: 'Responsive feeding',
    body: 'Watch baby’s hunger and fullness cues. Avoid forcing bites. Responsive feeding supports healthy eating patterns (WHO complementary feeding guidance).',
  },
];

export const foodDisclaimer =
  'General education only — not medical advice and not a substitute for your pediatrician, allergist, or infant CPR training. Feeding rules change with age, development, and medical history.';
