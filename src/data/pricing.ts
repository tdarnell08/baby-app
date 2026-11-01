export type PlanId = 'monthly' | 'annual' | 'lifetime';

export const ENTITLEMENT_ID = 'plus';

export type PlanDef = {
  id: PlanId;
  productId: string;
  title: string;
  period: string;
  fallbackPrice: string;
  note: string;
  trialDays: number | null;
  badge?: string;
  autoRenews: boolean;
};

export const plans: PlanDef[] = [
  {
    id: 'annual',
    productId: 'lulla_plus_annual',
    title: 'Yearly',
    period: 'year',
    fallbackPrice: '$29.99',
    note: 'Lowest price per month. Includes a free trial.',
    trialDays: 7,
    badge: 'Best value',
    autoRenews: true,
  },
  {
    id: 'monthly',
    productId: 'lulla_plus_monthly',
    title: 'Monthly',
    period: 'month',
    fallbackPrice: '$4.99',
    note: 'Flexible. Cancel any time.',
    trialDays: null,
    autoRenews: true,
  },
  {
    id: 'lifetime',
    productId: 'lulla_plus_lifetime',
    title: 'Lifetime',
    period: 'one time',
    fallbackPrice: '$59.99',
    note: 'Pay once. No renewals.',
    trialDays: null,
    autoRenews: false,
  },
];

export const freeSoundIds = ['balanced', 'rain', 'womb', 'heartbeat', 'ocean', 'fan'];
export const freeWordIds = ['ba', 'ma', 'da', 'mama', 'dada', 'baby', 'hi', 'bye', 'more', 'alldone', 'up', 'uhoh'];
export const freeStepStages = ['head', 'roll', 'sit'];

export type FeatureRow = { label: string; free: string; plus: string };

export const featureTable: FeatureRow[] = [
  { label: 'Sleep coach', free: 'One-tap nap and night logging, today’s view, typical wake windows', plus: 'Predicted next sleep window, a reminder before it opens, daily and weekly charts' },
  { label: 'Memory book', free: 'Save 10 memories with photos and voice clips', plus: 'Unlimited memories, monthly recap, month or year keepsake PDFs' },
  { label: 'Sleep help: troubleshooter, tonight’s plan, wake windows, routine builder, 3 a.m. mode, night wake log, safe sleep', free: 'Everything, with sources', plus: 'Everything, plus weekly night-wake patterns and the guided routine timer' },
  { label: 'Kid Mode: calm games for ages 1 to 5, offline, no ads, no data collected', free: 'Pop bubbles, Animal friends, and the Breathing buddy', plus: 'Adds Match the holes, Paint and trace, Peekaboo, the 5/10/15 min calm-down timer, and new games as they arrive' },
  { label: 'Sleep sounds', free: '6 core sounds, 15 to 45 min timer', plus: 'All 20 sounds and the all-night timer' },
  { label: 'First words', free: '12 starter words, App voice', plus: 'All 24 words and “My voice” recording' },
  { label: 'First steps', free: 'Tummy time, rolling, sitting', plus: 'Crawling, standing, and walking' },
  { label: 'Daily Play Plan', free: 'Plan by age, plus the exhausted mode', plus: 'Interests and 15 or 45+ minute plans' },
  { label: 'Sick Day: medicine log, symptom log, when to call the doctor, comfort tips, package dosing charts, doctor summary', free: 'Everything, including dose reminders', plus: 'Everything' },
  { label: 'Milestone tracker', free: 'Everything', plus: 'Everything' },
  { label: 'First foods and choking safety', free: 'Everything', plus: 'Everything' },
  { label: 'App lock, data export and delete', free: 'Everything', plus: 'Everything' },
];

export type Benefit = { emoji: string; title: string; body: string };

export const plusBenefits: Benefit[] = [
  { emoji: '🌙', title: 'Sleep you can plan around', body: 'Know when the next nap or bedtime window opens, learned from your baby’s own patterns, with a reminder before it starts. See your night-wake patterns by week and let a guided routine timer walk you through bedtime.' },
  { emoji: '📸', title: 'Memories that last', body: 'Unlimited photos, voice clips, and “today they…” moments, with a recap every month.' },
  { emoji: '🧸', title: 'Calm for the hard moments', body: 'Hand over Kid Mode with every game, a 5, 10, or 15 minute calm-down timer that winds down gently, and new games as they arrive. No ads, works offline, collects nothing.' },
  { emoji: '👪', title: 'Made to share with family', body: 'Turn a month or the whole year into a PDF keepsake for grandparents, or save a voice clip of a relative saying hello.' },
];

export const freePromise =
  'Safety and health tracking are always free: the Kid Mode breathing buddy, the basic Sleep help troubleshooter with safe sleep guidance, milestones, food and choking safety, the whole Sick Day section (medicine log with reminders, symptom log, when to call the doctor, comfort tips, and doctor summary), and privacy and security controls.';

export const paywallDisclosure =
  'Payment is charged to your Apple ID account at confirmation of purchase. Subscriptions renew automatically unless canceled at least 24 hours before the end of the current period. Your account is charged for renewal within 24 hours before the period ends. Manage or cancel any time in your Apple ID account settings after purchase. Any free trial ends when you subscribe, and an unused part of a trial is forfeited. Lifetime is a one-time purchase and does not renew.';

export const FREE_MEMORY_LIMIT = 10;
