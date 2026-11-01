export const config = {
  mockPurchases: process.env.EXPO_PUBLIC_ENABLE_MOCK_PURCHASES === 'true',
  revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? '',
  privacyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL ?? '',
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL ?? '',
};

export const APPLE_STANDARD_EULA = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
export const APPLE_MANAGE_SUBSCRIPTIONS = 'https://apps.apple.com/account/subscriptions';
