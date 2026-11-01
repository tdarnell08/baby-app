import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import {
  buy,
  checkEntitlement,
  loadOffers,
  purchaseMode,
  resetMockPurchase,
  restore as restorePurchases,
  type Offer,
  type PurchaseMode,
  type PurchaseOutcome,
} from '@/lib/purchases';

type PremiumState = {
  isPremium: boolean;
  ready: boolean;
  mode: PurchaseMode;
  offers: Offer[];
  offersError: boolean;
  offersLoading: boolean;
  refreshOffers: () => Promise<void>;
  purchase: (offer: Offer) => Promise<PurchaseOutcome>;
  restore: () => Promise<PurchaseOutcome>;
  resetMock: () => Promise<void>;
};

const PremiumContext = createContext<PremiumState | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const mode = purchaseMode();
  const [isPremium, setIsPremium] = useState(false);
  const [ready, setReady] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersError, setOffersError] = useState(false);
  const [offersLoading, setOffersLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      checkEntitlement().then((value) => {
        if (!alive) return;
        setIsPremium(value);
        setReady(true);
      });
    void refresh();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  const refreshOffers = useCallback(async () => {
    setOffersLoading(true);
    setOffersError(false);
    try {
      const next = await loadOffers();
      setOffers(next);
      setOffersError(next.length === 0 && mode === 'revenuecat');
    } catch {
      setOffersError(true);
    } finally {
      setOffersLoading(false);
    }
  }, [mode]);

  const purchase = useCallback(
    async (offer: Offer) => {
      const outcome = await buy(offer);
      if (outcome.ok) setIsPremium(true);
      return outcome;
    },
    [],
  );

  const restore = useCallback(async () => {
    const outcome = await restorePurchases();
    if (outcome.ok) setIsPremium(true);
    return outcome;
  }, []);

  const resetMock = useCallback(async () => {
    await resetMockPurchase();
    setIsPremium(false);
  }, []);

  const value = useMemo(
    () => ({ isPremium, ready, mode, offers, offersError, offersLoading, refreshOffers, purchase, restore, resetMock }),
    [isPremium, ready, mode, offers, offersError, offersLoading, refreshOffers, purchase, restore, resetMock],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium(): PremiumState {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used inside PremiumProvider');
  return ctx;
}
