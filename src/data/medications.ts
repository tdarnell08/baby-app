export type MedId = 'acetaminophen' | 'ibuprofen';

export type DoseBand = {
  minLb: number;
  maxLb: number;
  age: string;
  ml: number;
};

export type MedInfo = {
  id: MedId;
  name: string;
  brands: string;
  emoji: string;
  concentration: string;
  mgPerMl: number;
  minMonths: number;
  minLb: number;
  mgPerKg: [number, number];
  minHours: number;
  maxHours: number;
  maxPerDay: number;
  bands: DoseBand[];
  notes: string[];
};

const lbPerKg = 2.2046226218;

export const lbToKg = (lb: number) => lb / lbPerKg;
export const kgToLb = (kg: number) => kg * lbPerKg;

export const medicines: Record<MedId, MedInfo> = {
  acetaminophen: {
    id: 'acetaminophen',
    name: 'Acetaminophen',
    brands: 'Tylenol, paracetamol',
    emoji: '💧',
    concentration: '160 mg per 5 mL (US infant and children’s liquid)',
    mgPerMl: 32,
    minMonths: 3,
    minLb: 12,
    mgPerKg: [10, 15],
    minHours: 4,
    maxHours: 6,
    maxPerDay: 5,
    bands: [
      { minLb: 6, maxLb: 12, age: '0 to 3 months', ml: 1.25 },
      { minLb: 12, maxLb: 18, age: '4 to 11 months', ml: 2.5 },
      { minLb: 18, maxLb: 24, age: '12 to 23 months', ml: 3.75 },
      { minLb: 24, maxLb: 36, age: '2 to 3 years', ml: 5 },
      { minLb: 36, maxLb: 48, age: '4 to 5 years', ml: 7.5 },
    ],
    notes: [
      'For babies under 12 weeks, call your pediatrician before giving any medicine.',
      'Many cold and flu products also contain acetaminophen. Check labels so you never double up.',
      'Too much acetaminophen can harm the liver, and early overdose can look like nothing is wrong.',
    ],
  },
  ibuprofen: {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    brands: 'Motrin, Advil',
    emoji: '🔥',
    concentration: '100 mg per 5 mL (children’s liquid)',
    mgPerMl: 20,
    minMonths: 6,
    minLb: 12,
    mgPerKg: [5, 10],
    minHours: 6,
    maxHours: 8,
    maxPerDay: 4,
    bands: [
      { minLb: 12, maxLb: 18, age: '6 to 11 months', ml: 2.5 },
      { minLb: 18, maxLb: 24, age: '12 to 23 months', ml: 4 },
      { minLb: 24, maxLb: 36, age: '2 to 3 years', ml: 5 },
      { minLb: 36, maxLb: 48, age: '4 to 5 years', ml: 7.5 },
    ],
    notes: [
      'Only for babies 6 months and older. Never give ibuprofen to a younger baby.',
      'Give with a little food or milk when possible.',
      'Do not give if your child is dehydrated, vomiting repeatedly, or has kidney problems unless your doctor says so.',
      'Infant ibuprofen drops are more concentrated than children’s liquid. Never swap one for the other.',
    ],
  },
};

export type DoseResult =
  | { status: 'ok'; band: DoseBand; ml: number; mg: number; mgPerKg: number }
  | { status: 'tooSmall' }
  | { status: 'tooBig' }
  | { status: 'askDoctor'; band: DoseBand };

export function doseFor(med: MedId, weightLb: number): DoseResult {
  const info = medicines[med];
  if (weightLb < info.bands[0].minLb) return { status: 'tooSmall' };
  const last = info.bands[info.bands.length - 1];
  if (weightLb >= last.maxLb) return { status: 'tooBig' };
  const band = info.bands.find((b) => weightLb >= b.minLb && weightLb < b.maxLb);
  if (!band) return { status: 'tooSmall' };
  if (med === 'acetaminophen' && band.minLb < info.minLb) return { status: 'askDoctor', band };
  const mg = band.ml * info.mgPerMl;
  return { status: 'ok', band, ml: band.ml, mg, mgPerKg: mg / lbToKg(weightLb) };
}

export function formatMl(ml: number) {
  return `${Number.isInteger(ml * 100) ? String(ml) : ml.toFixed(2)} mL`;
}

export const callFirst = [
  'Your baby is under 3 months old and has a rectal temperature of 100.4°F (38°C) or higher. Call right away, day or night, before giving any medicine.',
  'A fever has lasted more than 24 hours in a child under 2, or more than 3 days at any age.',
  'The temperature is 104°F (40°C) or higher, or keeps coming back high.',
  'Your child seems very sleepy, hard to wake, or can’t be comforted, or has a stiff neck.',
  'There are signs of dehydration: very few wet diapers, no tears when crying, or a dry mouth.',
  'There is a new rash that doesn’t fade when pressed.',
];

export const callEmergency =
  'Call 911 for trouble breathing, blue or gray lips, a seizure, or if your child is hard to wake or unresponsive.';

export const safeUseRules = [
  'Dose by current weight whenever you can. Age is only a backup. Babies grow fast, so weigh again if it has been a few weeks.',
  'Measure in milliliters (mL) with the syringe or cup that came with that exact product. Kitchen spoons vary a lot and teaspoon mix-ups are common.',
  'Read the “active ingredient” on every product. Never give two products with the same ingredient.',
  'Write down the time and amount of every dose. The dose log below does that for you.',
  'Stay under the daily maximum: 5 doses of acetaminophen or 4 doses of ibuprofen in 24 hours.',
  'Don’t give both medicines at the same time, and don’t alternate them, unless your pediatrician tells you to.',
  'Fever medicine is for comfort. You don’t need to bring a temperature back to normal, and you don’t need to wake a sleeping child to give it.',
  'Shake the bottle, check the expiration date, and keep all medicine locked up and out of sight, even with child-resistant caps.',
  'If a child gets too much or the wrong medicine, call Poison Control right away at 1-800-222-1222 (US), even if they seem fine.',
];

export const doNotGive = [
  { title: 'Aspirin', why: 'Linked to Reye syndrome, a rare but serious illness, in children and teens.' },
  { title: 'Ibuprofen under 6 months', why: 'Not recommended for babies this young. Ask your pediatrician about fever or pain.' },
  {
    title: 'Cough and cold medicine under 4 years',
    why: 'These products haven’t been shown to help young children and can cause serious side effects (FDA, AAP).',
  },
  { title: 'Honey under 12 months', why: 'It can carry botulism spores that a baby’s gut can’t handle.' },
  {
    title: 'Teething gels and tablets',
    why: 'FDA warns against benzocaine and lidocaine gels and homeopathic teething tablets for babies. A cold teether or a clean chilled washcloth is safer.',
  },
  { title: 'Adult medicine, or split adult tablets', why: 'Strengths and ingredients differ, and small errors become big ones.' },
  { title: 'Codeine or tramadol', why: 'FDA says these should not be used in children under 12 because of the risk of serious breathing problems.' },
];

export const supplements = [
  {
    title: 'Vitamin D',
    body: 'The AAP recommends 400 IU a day for breastfed and partly breastfed babies starting in the first days of life, and for formula-fed babies drinking less than about 32 oz (1 liter) a day. Use a product made for infants and follow its label.',
  },
  {
    title: 'Iron',
    body: 'The AAP recommends extra iron for babies who are mostly or only breastfed, starting at about 4 months until they eat iron-rich foods. Iron drops come in different strengths, so ask your pediatrician for the exact product and amount.',
  },
];

export const medSources = [
  'American Academy of Pediatrics, HealthyChildren.org: Acetaminophen and ibuprofen dosing tables for infants and children.',
  'Sullivan JE, Farrar HC. Fever and antipyretic use in children. AAP Clinical Report, Pediatrics, 2011.',
  'Pantell RH, et al. Evaluation and management of well-appearing febrile infants 8 to 60 days old. AAP Clinical Practice Guideline, Pediatrics, 2021.',
  'U.S. FDA consumer updates: using the right dosing device; teething product warnings; cough and cold medicines in children; codeine and tramadol in children.',
  'American Academy of Pediatrics. Vitamin D and iron supplementation for infants (2008, 2010 clinical reports).',
  'CDC: Reye syndrome and infant botulism.',
];

export const medDisclaimer =
  'Lulla is not a substitute for medical advice. These amounts match published US dosing tables for the products listed. Products in other countries often have different strengths (for example, UK paracetamol is commonly 120 mg per 5 mL), so always check your label. If you are unsure, call your pediatrician, pharmacist, or Poison Control (1-800-222-1222 in the US).';
