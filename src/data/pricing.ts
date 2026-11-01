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
  { label: 'Sleep sounds', free: '6 core sounds, 15 to 45 min timer', plus: 'All 20 sounds and the all-night timer' },
  { label: 'First words', free: '12 starter words, App voice', plus: 'All 24 words and “My voice” recording' },
  { label: 'First steps', free: 'Tummy time, rolling, sitting', plus: 'Crawling, standing, and walking' },
  { label: 'Daily Play Plan', free: 'Plan by age, plus the exhausted mode', plus: 'Interests and 15 or 45+ minute plans' },
  { label: 'Milestone tracker', free: 'Everything', plus: 'Everything' },
  { label: 'First foods and choking safety', free: 'Everything', plus: 'Everything' },
  { label: 'Medicine safety and dose log', free: 'Everything', plus: 'Everything' },
  { label: 'App lock, data export and delete', free: 'Everything', plus: 'Everything' },
];

export const freePromise =
  'Safety and health tracking are always free: milestones, food and choking safety, medicine safety, privacy and security controls.';

export const paywallDisclosure =
  'Payment is charged to your Apple ID account at confirmation of purchase. Subscriptions renew automatically unless canceled at least 24 hours before the end of the current period. Your account is charged for renewal within 24 hours before the period ends. Manage or cancel any time in your Apple ID account settings after purchase. Any free trial ends when you subscribe, and an unused part of a trial is forfeited. Lifetime is a one-time purchase and does not renew.';
