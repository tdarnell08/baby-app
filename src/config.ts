export const config = {
  mockPurchases: process.env.EXPO_PUBLIC_ENABLE_MOCK_PURCHASES === 'true',
  revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '',
  privacyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
  affiliateUrls: {
    'halo-sleepsack-swaddle': process.env.EXPO_PUBLIC_AFFILIATE_HALO_SLEEPSACK_SWADDLE ?? '',
    'halo-sleepsack-wearable': process.env.EXPO_PUBLIC_AFFILIATE_HALO_SLEEPSACK_WEARABLE ?? '',
    'drbronners-baby-unscented': process.env.EXPO_PUBLIC_AFFILIATE_DRBRONNERS_BABY_UNSCENTED ?? '',
    'dojo-foam-soap': process.env.EXPO_PUBLIC_AFFILIATE_DOJO_FOAM_SOAP ?? '',
    'drbrowns-options-bottle': process.env.EXPO_PUBLIC_AFFILIATE_DRBROWNS_OPTIONS_BOTTLE ?? '',
    'chicco-keyfit-30': process.env.EXPO_PUBLIC_AFFILIATE_CHICCO_KEYFIT_30 ?? '',
    'graco-extend2fit': process.env.EXPO_PUBLIC_AFFILIATE_GRACO_EXTEND2FIT ?? '',
    'lovevery-play-gym': process.env.EXPO_PUBLIC_AFFILIATE_LOVEVERY_PLAY_GYM ?? '',
    'sophie-la-girafe': process.env.EXPO_PUBLIC_AFFILIATE_SOPHIE_LA_GIRAFE ?? '',
    'fp-rock-a-stack': process.env.EXPO_PUBLIC_AFFILIATE_FP_ROCK_A_STACK ?? '',
    'ikea-antilop': process.env.EXPO_PUBLIC_AFFILIATE_IKEA_ANTILOP ?? '',
    'ezpz-tiny-cup': process.env.EXPO_PUBLIC_AFFILIATE_EZPZ_TINY_CUP ?? '',
    'ezpz-mini-mat': process.env.EXPO_PUBLIC_AFFILIATE_EZPZ_MINI_MAT ?? '',
    'hape-pound-and-tap-bench': process.env.EXPO_PUBLIC_AFFILIATE_HAPE_POUND_AND_TAP_BENCH ?? '',
    'lego-duplo-brick-box': process.env.EXPO_PUBLIC_AFFILIATE_LEGO_DUPLO_BRICK_BOX ?? '',
    'strider-12-sport': process.env.EXPO_PUBLIC_AFFILIATE_STRIDER_12_SPORT ?? '',
    'magna-tiles-classic': process.env.EXPO_PUBLIC_AFFILIATE_MAGNA_TILES_CLASSIC ?? '',
    'crayola-crayons-24': process.env.EXPO_PUBLIC_AFFILIATE_CRAYOLA_CRAYONS_24 ?? '',
    'planetbox-rover': process.env.EXPO_PUBLIC_AFFILIATE_PLANETBOX_ROVER ?? '',
    'lego-classic-large-brick-box': process.env.EXPO_PUBLIC_AFFILIATE_LEGO_CLASSIC_LARGE_BRICK_BOX ?? '',
  } as Record<string, string>,
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL ?? '',
};

export const APPLE_STANDARD_EULA = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
export const APPLE_MANAGE_SUBSCRIPTIONS = 'https://apps.apple.com/account/subscriptions';
