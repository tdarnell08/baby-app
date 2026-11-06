import type { Pick } from '@/lib/picksLogic';

/**
 * Parent picks. One is featured each week, rotating through this list in order.
 * Add an entry, and optionally an affiliate link in src/config.ts via .env.local.
 * Only list what the brand itself says and what a parent should check. "Non-toxic" and
 * "natural" are not regulated terms, so do not use them as claims here.
 */
export const picks: Pick[] = [
  {
    id: 'dojo-foam-soap',
    name: 'Whippity Cloud Kids Foaming Soap',
    brand: 'Dojo',
    category: 'Bath time',
    ageFit: 'Ages 3 and up (per the brand)',
    tagline: 'A moldable foam soap kids can squish and shape while they wash.',
    whyWeLike: 'A recent favorite at our house. The kids love shaping the foam in the tub, and bath time goes more smoothly.',
    brandSays: [
      'Dermatologist-tested and gentle enough for daily use.',
      'Free of parabens, phenoxyethanol, harsh sulfates, and 26 known fragrance allergens.',
      'Vegan and cruelty-free.',
      'Nozzle has a built-in child lock, and an adult dispenses the foam.',
      'Developed with pediatric occupational therapists.',
    ],
    worthKnowing: [
      'It is for ages 3 and up. It is not a baby product.',
      'It is an aerosol foam with fragrance. Keep it away from flame, and have an adult dispense it.',
      'The brand does not call it non-toxic or natural. If you want fragrance-free or certified-natural only, check the label and skip this one.',
      'EWG Skin Deep rates the Grapefruit Amberwood scent “moderate hazard” (data availability: fair). Look up the scent you choose.',
      'Do a small patch test first. The brand says not to use it as shampoo.',
    ],
    checkIt: [
      { label: 'Dojo: ingredients by scent', url: 'https://dojocare.co/products/whippity-cloud-kids-foaming-soap' },
      { label: 'EWG Skin Deep: Dojo', url: 'https://www.ewg.org/skindeep/browse/brands/23035-dojo/' },
    ],
    productUrl: 'https://dojocare.co/products/whippity-cloud-kids-foaming-soap',
  },
];

export const choosingCriteria = [
  'We only list things we use with our own kids.',
  'We show what the brand says and what to watch for, not just the good parts.',
  'Ingredient lists and third-party ratings are linked so you can check for yourself.',
  'A pick never changes what Lulla does, and Lulla never sees what you tap or buy.',
];
