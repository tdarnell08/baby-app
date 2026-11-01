export type Source = { id: string; org: string; title: string; url: string };

export const sources: Record<string, Source> = {
  aapFever: {
    id: 'aapFever',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Fever: When to Call the Pediatrician',
    url: 'https://www.healthychildren.org/English/health-issues/conditions/fever/Pages/When-to-Call-the-Pediatrician.aspx',
  },
  aapBaby: {
    id: 'aapBaby',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Fever and Your Baby',
    url: 'https://www.healthychildren.org/English/health-issues/conditions/fever/Pages/Fever-and-Your-Baby.aspx',
  },
  aapDehydration: {
    id: 'aapDehydration',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Signs of Dehydration in Infants and Children',
    url: 'https://www.healthychildren.org/English/health-issues/injuries-emergencies/Pages/Dehydration.aspx',
  },
  aapVomiting: {
    id: 'aapVomiting',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Drinks to Prevent Dehydration When Your Child Is Vomiting',
    url: 'https://www.healthychildren.org/English/health-issues/conditions/abdominal/Pages/Drinks-to-Prevent-Dehydration-in-a-Vomiting-Child.aspx',
  },
  aapDiarrhea: {
    id: 'aapDiarrhea',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Diarrhea in Children: What Parents Need to Know',
    url: 'https://www.healthychildren.org/English/health-issues/conditions/abdominal/Pages/Diarrhea.aspx',
  },
  aapColds: {
    id: 'aapColds',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: '10 Common Childhood Illnesses and Their Treatments',
    url: 'https://www.healthychildren.org/english/health-issues/conditions/treatments/pages/10-common-childhood-illnesses-and-their-treatments.aspx',
  },
  nhsFever: {
    id: 'nhsFever',
    org: 'NHS (UK)',
    title: 'High temperature (fever) in children',
    url: 'https://www.nhs.uk/conditions/fever-in-children/',
  },
  cdcRsv: {
    id: 'cdcRsv',
    org: 'Centers for Disease Control and Prevention',
    title: 'RSV in Infants and Young Children',
    url: 'https://www.cdc.gov/rsv/infants-young-children/',
  },
  cdcColds: {
    id: 'cdcColds',
    org: 'Centers for Disease Control and Prevention',
    title: 'Relief for Common Symptoms of Colds and Cough (children under 4)',
    url: 'https://www.cdc.gov/antibiotic-use/media/pdfs/HCP-Relief-Colds-Cough-85by11-P.pdf',
  },
  fdaColds: {
    id: 'fdaColds',
    org: 'U.S. Food and Drug Administration',
    title: 'Should You Give Kids Medicine for Coughs and Colds?',
    url: 'https://www.fda.gov/consumers/consumer-updates/should-you-give-kids-medicine-coughs-and-colds',
  },
  aapSafeSleep: {
    id: 'aapSafeSleep',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'How to Keep Your Sleeping Baby Safe: AAP Policy Explained',
    url: 'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/a-parents-guide-to-safe-sleep.aspx',
  },
  aapSids: {
    id: 'aapSids',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Safe Sleep: 9 Ways to Reduce a Baby’s Risk of SIDS and Suffocation',
    url: 'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/preventing-sids.aspx',
  },
  aapBackSleep: {
    id: 'aapBackSleep',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Back to Sleep, Tummy to Play',
    url: 'https://www.healthychildren.org/english/ages-stages/baby/sleep/pages/back-to-sleep-tummy-to-play.aspx',
  },
  aap2022: {
    id: 'aap2022',
    org: 'American Academy of Pediatrics (Pediatrics)',
    title: 'Sleep-Related Infant Deaths: Updated 2022 Recommendations',
    url: 'https://publications.aap.org/pediatrics/article/150/1/e2022057990/188304/Sleep-Related-Infant-Deaths-Updated-2022',
  },
  aapGettingToSleep: {
    id: 'aapGettingToSleep',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Getting Your Baby to Sleep',
    url: 'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/getting-your-baby-to-sleep.aspx',
  },
  aapToddlerSleep: {
    id: 'aapToddlerSleep',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Toddler Won’t Go to Sleep? 7 Tips to Help End Bedtime Battles',
    url: 'https://www.healthychildren.org/English/healthy-living/sleep/Pages/bedtime-trouble.aspx',
  },
  aapSleepHabits: {
    id: 'aapSleepHabits',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Healthy Sleep Habits: How Many Hours Does Your Child Need?',
    url: 'https://www.healthychildren.org/English/healthy-living/sleep/Pages/Healthy-Sleep-Habits-How-Many-Hours-Does-Your-Child-Need.aspx',
  },
  aapBrushBookBed: {
    id: 'aapBrushBookBed',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Brush, Book, Bed: How to Structure Your Child’s Nighttime Routine',
    url: 'https://www.healthychildren.org/English/healthy-living/oral-health/Pages/Brush-Book-Bed.aspx',
  },
  aapApnea: {
    id: 'aapApnea',
    org: 'American Academy of Pediatrics (HealthyChildren.org)',
    title: 'Sleep Apnea in Children: Detection and Treatment',
    url: 'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/Sleep-Apnea-Detection.aspx',
  },
  chopSleep: {
    id: 'chopSleep',
    org: 'Children’s Hospital of Philadelphia',
    title: 'Healthy Sleep Habits',
    url: 'https://www.chop.edu/primary-care/healthy-sleep-habits',
  },
};

export type AgeBand = 'under3' | 'm3to6' | 'm6to12' | 'over12';

export const ageBands: { id: AgeBand; label: string }[] = [
  { id: 'under3', label: 'Under 3 months' },
  { id: 'm3to6', label: '3 to 6 months' },
  { id: 'm6to12', label: '6 to 12 months' },
  { id: 'over12', label: '12 months and up' },
];

export function bandForMonths(months: number): AgeBand {
  if (months < 3) return 'under3';
  if (months < 6) return 'm3to6';
  if (months < 12) return 'm6to12';
  return 'over12';
}

export type FlagItem = { text: string; src: string[] };
export type FlagTier = {
  id: 'emergency' | 'now' | 'soon';
  title: string;
  action: string;
  tone: 'danger' | 'warn' | 'info';
  items: FlagItem[];
};

export const emergencyTier: FlagTier = {
  id: 'emergency',
  title: 'Call 911 now',
  action: 'Call 911 (or your local emergency number). Do not drive yourself if your baby is struggling to breathe or is hard to wake.',
  tone: 'danger',
  items: [
    { text: 'Struggling to breathe: fast or very shallow breathing, grunting, nostrils flaring, the skin pulling in under or between the ribs, or pauses in breathing', src: ['cdcRsv', 'nhsFever'] },
    { text: 'Blue, gray, or very pale skin, lips, or tongue', src: ['nhsFever', 'cdcRsv'] },
    { text: 'Hard to wake, floppy, limp, or not responding the way they normally do', src: ['nhsFever', 'aapDehydration'] },
    { text: 'A seizure (shaking and not responding), especially a first one or one that does not stop', src: ['nhsFever', 'aapFever'] },
    { text: 'A rash of small red or purple spots or blotches that does not fade when you press a clear glass on it, especially with fever', src: ['nhsFever'] },
    { text: 'Stiff neck or being bothered by light, especially with a fever', src: ['nhsFever', 'aapFever'] },
    { text: 'Swelling of the lips, face, or tongue, or hives with trouble breathing (possible severe allergic reaction)', src: [] },
    { text: 'Extremely agitated and cannot be comforted, or confused', src: ['nhsFever'] },
  ],
};

const nowCommon: FlagItem[] = [
  { text: 'Signs of dehydration: fewer than 6 wet diapers in a day, no wet diaper for 8 hours or more, dry mouth or tongue, no tears when crying, or a sunken soft spot', src: ['aapDehydration', 'aapVomiting'] },
  { text: 'Looks very ill, is unusually drowsy, or is very fussy and cannot be comforted', src: ['aapFever'] },
  { text: 'Any breathing difficulty, wheezing, or a cough that is getting worse', src: ['aapFever', 'cdcRsv', 'fdaColds'] },
  { text: 'Vomit that is green, bloody, or looks like coffee grounds, or blood in the stool', src: ['aapDiarrhea'] },
  { text: 'Vomiting that lasts more than 12 to 24 hours, or a baby who will not eat or drink', src: ['aapDiarrhea', 'aapVomiting'] },
  { text: 'A fever and an unexplained rash, severe ear pain, severe sore throat, or repeated vomiting or diarrhea', src: ['aapFever'] },
  { text: 'Has had a seizure, or has a weakened immune system or a heart condition and now has a fever', src: ['aapFever'] },
  { text: 'A fever that rises above 104°F (40°C) more than once, at any age', src: ['aapFever'] },
];

export const nowByBand: Record<AgeBand, FlagTier> = {
  under3: {
    id: 'now',
    title: 'Call your pediatrician right away, day or night',
    action: 'Call now. Babies this young can become seriously ill quickly. If you cannot reach the office or on-call line, go to an emergency room.',
    tone: 'warn',
    items: [
      { text: 'A temperature of 100.4°F (38.0°C) or higher, even if your baby seems fine. This is the one most important rule at this age.', src: ['aapFever', 'aapBaby', 'nhsFever'] },
      { text: 'Feels hot to the touch or you think they have a fever, even if the thermometer reads lower (underarm readings can run low)', src: ['nhsFever', 'aapBaby'] },
      { text: 'Not feeding well, or feeding much less than usual', src: ['nhsFever', 'cdcRsv'] },
      { text: 'Unusually sleepy, hard to wake for feeds, irritable, or much less active than normal', src: ['cdcRsv', 'aapFever'] },
      { text: 'Cold symptoms, cough, or vomiting at this age: call to ask whether they should be seen. Colds can turn serious quickly in very young babies.', src: ['cdcRsv'] },
      ...nowCommon,
    ],
  },
  m3to6: {
    id: 'now',
    title: 'Call your pediatrician today, or right away if it is after hours and any of these apply',
    action: 'Call now. If you cannot reach your pediatrician, use their after-hours line or go to urgent care or an emergency room.',
    tone: 'warn',
    items: [
      { text: 'A fever of 101°F (38.3°C) or higher at 3 to 6 months (the NHS uses 102.2°F, 39°C, for this age; ask your pediatrician which they prefer)', src: ['aapBaby', 'nhsFever'] },
      { text: 'Fever that lasts more than 24 hours', src: ['aapFever'] },
      { text: 'Feeding much less than usual, or not wanting to feed at all', src: ['nhsFever'] },
      ...nowCommon,
    ],
  },
  m6to12: {
    id: 'now',
    title: 'Call your pediatrician today, or right away if it is after hours and any of these apply',
    action: 'Call now. If you cannot reach your pediatrician, use their after-hours line or go to urgent care or an emergency room.',
    tone: 'warn',
    items: [
      { text: 'A fever of 103°F (39.4°C) or higher', src: ['aapBaby'] },
      { text: 'Fever that lasts more than 24 hours in a child under 2 years old', src: ['aapFever'] },
      { text: 'Your baby still acts sick once the fever is brought down, or seems to be getting worse', src: ['aapFever'] },
      ...nowCommon,
    ],
  },
  over12: {
    id: 'now',
    title: 'Call your pediatrician today, or right away if it is after hours and any of these apply',
    action: 'Call now. If you cannot reach your pediatrician, use their after-hours line or go to urgent care or an emergency room.',
    tone: 'warn',
    items: [
      { text: 'A fever of 103°F (39.4°C) or higher', src: ['aapBaby'] },
      { text: 'Fever that lasts more than 24 hours in a child under 2 years old, or more than 3 days (72 hours) at 2 years and older', src: ['aapFever'] },
      { text: 'Your child still acts sick once the fever is brought down, or seems to be getting worse', src: ['aapFever'] },
      ...nowCommon,
    ],
  },
};

export const generalTips: FlagItem[] = [
  { text: 'It is a good sign when your child plays and interacts with you after a dose of medicine for comfort. A child who stays limp or hard to engage needs a call.', src: ['aapFever'] },
  { text: 'Trust your instincts. If something feels wrong, calling your pediatrician is never the wrong answer.', src: ['aapFever'] },
  { text: 'Symptoms that are getting worse after a few days, or a cold that lasts longer than about 10 days, deserve a call.', src: ['aapColds', 'cdcRsv'] },
  { text: 'Poison Control (US): 1-800-222-1222, if you think too much medicine, or the wrong medicine, was given.', src: [] },
];

export const redFlagDisclaimer =
  'This list is a summary of public guidance for parents. It is not a diagnosis, it does not cover every situation, and it is not a substitute for advice from your child’s doctor. A baby can be seriously ill without any of these signs. If you are worried, call your pediatrician, a nurse line, or 911.';

export type Tip = { text: string; src: string[]; minMonths?: number; maxMonths?: number };
export type TipGroup = { title: string; tips: Tip[] };

export const comfortGroups: TipGroup[] = [
  {
    title: 'Fluids and feeding',
    tips: [
      { text: 'Offer breast milk or formula more often, in smaller feeds if needed. Keep breastfeeding as normal.', src: ['nhsFever', 'aapColds'], maxMonths: 12 },
      { text: 'Offer water or other fluids often through the day, and food if they want it. Fluids matter more than food.', src: ['nhsFever', 'aapFever'], minMonths: 12 },
      { text: 'If your baby is vomiting, offer small sips or a few spoonfuls every few minutes. Aim for about 1 ounce (30 ml) an hour, and ask your doctor about an oral electrolyte solution.', src: ['aapVomiting'] },
      { text: 'Count wet diapers. Fewer than 6 a day, or none for 8 hours, is a reason to call.', src: ['aapDehydration'], maxMonths: 12 },
    ],
  },
  {
    title: 'Stuffy nose and cough',
    tips: [
      { text: 'Saline nose drops or spray, then gentle suction with a bulb syringe, before feeds and sleep. This works very well for babies under 1.', src: ['fdaColds', 'cdcColds'] },
      { text: 'A clean cool-mist humidifier can ease congestion. Do not use warm-mist or steam vaporizers, which can burn. Clean the humidifier between uses so mold does not grow.', src: ['fdaColds', 'cdcColds'] },
      { text: 'Do not give over-the-counter cough and cold medicines to children under 4, unless your doctor tells you to. They do not work well in young children and can cause serious side effects.', src: ['aapColds', 'fdaColds', 'cdcColds'] },
      { text: 'Honey can soothe a cough, but never give honey to a baby under 12 months (risk of infant botulism).', src: ['cdcColds'], minMonths: 12 },
      { text: 'Never give honey to a baby under 12 months. Fluids and comfort are enough for a cough at this age.', src: ['cdcColds'], maxMonths: 12 },
    ],
  },
  {
    title: 'Fever and rest',
    tips: [
      { text: 'Dress your baby in light clothing and keep the room comfortably cool. Do not bundle, and do not undress or sponge your child down to cool them.', src: ['nhsFever'] },
      { text: 'Let them rest. Keep checking on them, including during the night.', src: ['nhsFever', 'aapColds'] },
      { text: 'A fever is the body fighting infection. Focus on comfort, fluids, and how your baby is acting, not just the number.', src: ['aapFever', 'nhsFever'] },
      { text: 'Safe sleep rules do not change when your baby is sick: on their back, in their own crib or bassinet, with nothing soft in the sleep space.', src: [] },
    ],
  },
  {
    title: 'Medicine safety',
    tips: [
      { text: 'Under 3 months, call your pediatrician before giving any medicine for fever. The NHS advises no paracetamol (acetaminophen) under 2 months and no ibuprofen under 3 months.', src: ['aapFever', 'nhsFever'], maxMonths: 3 },
      { text: 'Never give aspirin to a child.', src: ['nhsFever', 'cdcRsv'] },
      { text: 'Check the active ingredient on every label. Cough, cold, and pain products can contain the same medicine, and doubling up is a common cause of overdose.', src: ['fdaColds'] },
      { text: 'Use the syringe or cup that came with that medicine, never a kitchen spoon. Do not give adult medicine to a baby.', src: ['fdaColds'] },
    ],
  },
];

export function tipsForAge(months: number): TipGroup[] {
  return comfortGroups
    .map((g) => ({
      ...g,
      tips: g.tips.filter((t) => (t.minMonths === undefined || months >= t.minMonths) && (t.maxMonths === undefined || months < t.maxMonths)),
    }))
    .filter((g) => g.tips.length > 0);
}

export const comfortDisclaimer =
  'These are general comfort measures from public health sources, not medical advice for your baby. Ask your pediatrician what is right for your child, especially before giving any medicine.';

export const chartConfirmNote =
  'Confirm with your pediatrician or pharmacist before giving any medicine. Dosing charts on packages depend on your child’s weight or age, and the right amount can be different for your child.';

export const chartSafetyRules = [
  'Use the dosing chart from the package of the exact product you are giving. Charts for different strengths and brands are not interchangeable.',
  'If your baby is under 3 months, or the chart on the package does not list your baby’s age or weight, do not guess. Call your pediatrician or pharmacist.',
  'Check the active ingredients before giving anything else. Do not give two products with the same ingredient.',
  'Use the dosing syringe or cup that came with the medicine.',
  'Never give aspirin to a child. Keep all medicine locked away and out of sight and reach.',
  'Poison Control (US): 1-800-222-1222.',
];

export const sickDisclaimer =
  'Sick Day is a record-keeping and information tool. It does not diagnose, treat, calculate or suggest doses of any medicine, or replace advice from your child’s doctor or pharmacist. In an emergency call 911.';
