import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { config } from '@/config';
import { ENTITLEMENT_ID, plans, type PlanId } from '@/data/pricing';

export type PurchaseMode = 'revenuecat' | 'mock' | 'unavailable';

export type Offer = {
  id: PlanId;
  title: string;
  price: string;
  note: string;
  trialLabel: string | null;
  badge?: string;
  autoRenews: boolean;
  period: string;
  ref?: unknown;
};

export type PurchaseOutcome = { ok: boolean; cancelled?: boolean; message?: string };

const MOCK_KEY = 'lulla.mockPlus';


export function purchaseMode(): PurchaseMode {
  if (Platform.OS === 'ios' && config.revenueCatIosKey) return 'revenuecat';
  if (__DEV__ || config.mockPurchases) return 'mock';
  return 'unavailable';
}

let configured = false;

async function rc() {
  const mod = await import('react-native-purchases');
  const Purchases = mod.default;
  if (!configured) {
    Purchases.configure({ apiKey: config.revenueCatIosKey });
    configured = true;
  }
  return { Purchases, PACKAGE_TYPE: mod.PACKAGE_TYPE };
}

function trialFromIntro(intro: { price: number; periodNumberOfUnits: number; periodUnit: string } | null | undefined) {
  if (!intro || intro.price !== 0) return null;
  const n = intro.periodNumberOfUnits;
  const unit = intro.periodUnit.toUpperCase();
  if (unit === 'DAY') return n % 7 === 0 ? `${n / 7}-week free trial` : `${n}-day free trial`;
  if (unit === 'WEEK') return `${n}-week free trial`;
  if (unit === 'MONTH') return `${n}-month free trial`;
  return `${n}-year free trial`;
}

export async function checkEntitlement(): Promise<boolean> {
  const mode = purchaseMode();
  try {
    if (mode === 'revenuecat') {
      const { Purchases } = await rc();
      const info = await Purchases.getCustomerInfo();
      return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
    }
    if (mode === 'mock') return (await AsyncStorage.getItem(MOCK_KEY)) === '1';
  } catch {
    return false;
  }
  return false;
}

export async function loadOffers(): Promise<Offer[]> {
  const mode = purchaseMode();
  if (mode === 'mock') {
    return plans.map((p) => ({
      id: p.id,
      title: p.title,
      price: p.fallbackPrice,
      note: p.note,
      trialLabel: p.trialDays ? `${p.trialDays}-day free trial` : null,
      badge: p.badge,
      autoRenews: p.autoRenews,
      period: p.period,
    }));
  }
  if (mode !== 'revenuecat') return [];

  const { Purchases, PACKAGE_TYPE } = await rc();
  const offerings = await Purchases.getOfferings();
  const packages: PurchasesPackage[] = offerings.current?.availablePackages ?? [];
  const byType: Record<string, PlanId> = {
    [PACKAGE_TYPE.MONTHLY]: 'monthly',
    [PACKAGE_TYPE.ANNUAL]: 'annual',
    [PACKAGE_TYPE.LIFETIME]: 'lifetime',
  };

  const offers: Offer[] = [];
  for (const pkg of packages) {
    const id = byType[pkg.packageType];
    const def = plans.find((p) => p.id === id);
    if (!id || !def) continue;
    offers.push({
      id,
      title: def.title,
      price: pkg.product.priceString,
      note: def.note,
      trialLabel: trialFromIntro(pkg.product.introPrice),
      badge: def.badge,
      autoRenews: def.autoRenews,
      period: def.period,
      ref: pkg,
    });
  }
  return plans.map((p) => offers.find((o) => o.id === p.id)).filter((o): o is Offer => Boolean(o));
}

export async function buy(offer: Offer): Promise<PurchaseOutcome> {
  const mode = purchaseMode();
  try {
    if (mode === 'mock') {
      await AsyncStorage.setItem(MOCK_KEY, '1');
      return { ok: true };
    }
    if (mode === 'revenuecat' && offer.ref) {
      const { Purchases } = await rc();
      const result = await Purchases.purchasePackage(offer.ref as PurchasesPackage);
      return { ok: Boolean(result.customerInfo.entitlements.active[ENTITLEMENT_ID]) };
    }
    return { ok: false, message: 'Purchases are not available in this build.' };
  } catch (error) {
    const e = error as { userCancelled?: boolean | null; message?: string };
    if (e?.userCancelled) return { ok: false, cancelled: true };
    return { ok: false, message: 'The purchase could not be completed. You were not charged.' };
  }
}

export async function restore(): Promise<PurchaseOutcome> {
  const mode = purchaseMode();
  try {
    if (mode === 'mock') {
      return (await AsyncStorage.getItem(MOCK_KEY)) === '1'
        ? { ok: true }
        : { ok: false, message: 'No previous purchase found.' };
    }
    if (mode === 'revenuecat') {
      const { Purchases } = await rc();
      const info = await Purchases.restorePurchases();
      return info.entitlements.active[ENTITLEMENT_ID]
        ? { ok: true }
        : { ok: false, message: 'No active Lulla Plus purchase was found for this Apple ID.' };
    }
  } catch {
    return { ok: false, message: 'Could not restore purchases. Check your connection and try again.' };
  }
  return { ok: false, message: 'Purchases are not available in this build.' };
}

export async function resetMockPurchase() {
  await AsyncStorage.removeItem(MOCK_KEY);
}
