import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APPLE_MANAGE_SUBSCRIPTIONS } from '@/config';
import { colors, radii, spacing } from '@/constants/theme';
import { featureTable, freePromise, paywallDisclosure, plusBenefits, type PlanId } from '@/data/pricing';
import type { Offer } from '@/lib/purchases';
import { usePremium } from '@/providers/PremiumProvider';

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium, mode, offers, offersError, offersLoading, refreshOffers, purchase, restore, resetMock } =
    usePremium();
  const [selected, setSelected] = useState<PlanId>('annual');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void refreshOffers();
  }, [refreshOffers]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const offer: Offer | undefined = offers.find((o) => o.id === selected) ?? offers[0];

  const onBuy = async () => {
    if (!offer || busy) return;
    setBusy(true);
    setMessage(null);
    const outcome = await purchase(offer);
    setBusy(false);
    if (outcome.ok) setMessage('Welcome to Lulla Plus. Everything is unlocked.');
    else if (!outcome.cancelled) setMessage(outcome.message ?? 'The purchase could not be completed.');
  };

  const onRestore = async () => {
    if (busy) return;
    setBusy(true);
    setMessage(null);
    const outcome = await restore();
    setBusy(false);
    setMessage(outcome.ok ? 'Your Lulla Plus purchase has been restored.' : (outcome.message ?? 'Nothing to restore.'));
  };

  const ctaLabel = offer?.trialLabel ? `Start ${offer.trialLabel}` : offer?.autoRenews === false ? 'Buy once' : 'Subscribe';
  const priceLine = offer
    ? offer.trialLabel
      ? `${offer.trialLabel}, then ${offer.price} per ${offer.period}. Cancel any time.`
      : offer.autoRenews
        ? `${offer.price} per ${offer.period}, renews automatically. Cancel any time.`
        : `${offer.price} one-time purchase. No renewals.`
    : '';

  return (
    <LinearGradient colors={['#17283A', '#1F3B4D', '#2A4F55']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={14} onPress={close}>
            <Text style={styles.close}>✕ Close</Text>
          </Pressable>

          <Text style={styles.title}>Lulla Plus</Text>
          <Text style={styles.subtitle}>
            Sleep you can plan around, memories you can keep, and keepsakes the whole family will treasure. Safety stays free.
          </Text>

          {mode === 'mock' ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                Preview mode: purchases are simulated on this build and nobody is charged.
              </Text>
            </View>
          ) : null}

          {isPremium ? (
            <View style={styles.owned}>
              <Text style={styles.ownedTitle}>You have Lulla Plus ✓</Text>
              <Text style={styles.ownedBody}>Everything is unlocked. Thank you for supporting Lulla.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void Linking.openURL(APPLE_MANAGE_SUBSCRIPTIONS)}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryText}>Manage subscription</Text>
              </Pressable>
              {mode === 'mock' ? (
                <Pressable onPress={() => void resetMock()} hitSlop={8}>
                  <Text style={styles.link}>Reset preview purchase</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View style={styles.benefits}>
            {plusBenefits.map((b) => (
              <View key={b.title} style={styles.benefit}>
                <Text style={styles.benefitEmoji}>{b.emoji}</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{b.title}</Text>
                  <Text style={styles.benefitBody}>{b.body}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={[styles.th, styles.colLabel]}>What you get</Text>
              <Text style={[styles.th, styles.colTier]}>Free</Text>
              <Text style={[styles.th, styles.colTier, styles.thPlus]}>Plus</Text>
            </View>
            {featureTable.map((row) => (
              <View key={row.label} style={styles.tr}>
                <Text style={[styles.tdLabel, styles.colLabel]}>{row.label}</Text>
                <Text style={[styles.td, styles.colTier]}>{row.free}</Text>
                <Text style={[styles.td, styles.colTier, styles.tdPlus]}>{row.plus}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.promise}>{freePromise}</Text>

          {!isPremium ? (
            <>
              <Text style={styles.section}>Choose a plan</Text>
              {offersLoading ? <ActivityIndicator color={colors.butter} style={styles.spinner} /> : null}

              {mode === 'unavailable' ? (
                <View style={styles.panel}>
                  <Text style={styles.panelBody}>
                    Lulla Plus can’t be purchased in this build yet. Everything in the free plan still works.
                  </Text>
                </View>
              ) : null}

              {offersError ? (
                <View style={styles.panel}>
                  <Text style={styles.panelBody}>We couldn’t load prices from the App Store. Check your connection.</Text>
                  <Pressable onPress={() => void refreshOffers()} hitSlop={8}>
                    <Text style={styles.link}>Try again</Text>
                  </Pressable>
                </View>
              ) : null}

              {offers.map((o) => {
                const on = (offer?.id ?? selected) === o.id;
                return (
                  <Pressable
                    key={o.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => setSelected(o.id)}
                    style={[styles.plan, on && styles.planOn]}
                  >
                    <View style={styles.radio}>{on ? <View style={styles.radioDot} /> : null}</View>
                    <View style={styles.flex}>
                      <View style={styles.planHead}>
                        <Text style={styles.planTitle}>{o.title}</Text>
                        {o.badge ? (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{o.badge}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.planNote}>{o.trialLabel ? `${o.trialLabel}. ` : ''}{o.note}</Text>
                    </View>
                    <View style={styles.priceBox}>
                      <Text style={styles.price}>{o.price}</Text>
                      <Text style={styles.per}>{o.autoRenews ? `per ${o.period}` : 'once'}</Text>
                    </View>
                  </Pressable>
                );
              })}

              {offer ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={onBuy}
                    style={({ pressed }) => [styles.cta, busy && styles.disabled, pressed && styles.pressed]}
                  >
                    {busy ? <ActivityIndicator color={colors.ink} /> : <Text style={styles.ctaText}>{ctaLabel}</Text>}
                  </Pressable>
                  <Text style={styles.priceLine}>{priceLine}</Text>
                </>
              ) : null}
            </>
          ) : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          {mode !== 'unavailable' ? (
            <Pressable onPress={onRestore} disabled={busy} hitSlop={8} style={styles.restore}>
              <Text style={styles.link}>Restore purchases</Text>
            </Pressable>
          ) : null}

          <Text style={styles.disclosure}>{paywallDisclosure}</Text>
          <View style={styles.legalRow}>
            <Pressable onPress={() => router.push({ pathname: '/legal', params: { doc: 'terms' } })} hitSlop={8}>
              <Text style={styles.link}>Terms of Use</Text>
            </Pressable>
            <Text style={styles.dot}>·</Text>
            <Pressable onPress={() => router.push({ pathname: '/legal', params: { doc: 'privacy' } })} hitSlop={8}>
              <Text style={styles.link}>Privacy Policy</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  column: { width: '100%', maxWidth: 480 },
  flex: { flex: 1 },
  close: { fontFamily: 'Nunito_600SemiBold', color: colors.mist, fontSize: 15, marginBottom: spacing.sm },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 38, color: colors.foam },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    lineHeight: 23,
    color: 'rgba(247,243,234,0.8)',
    marginBottom: spacing.md,
  },
  notice: {
    backgroundColor: 'rgba(232,162,154,0.18)',
    borderColor: 'rgba(232,162,154,0.5)',
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  noticeText: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: colors.foam },
  owned: {
    gap: spacing.sm,
    backgroundColor: colors.foam,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  ownedTitle: { fontFamily: 'Fraunces_700Bold', fontSize: 22, color: colors.ink },
  ownedBody: { fontFamily: 'Nunito_400Regular', fontSize: 14, color: colors.muted },
  secondaryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  secondaryText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.foam },
  table: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: spacing.sm,
  },
  tr: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  benefits: { gap: spacing.sm },
  benefit: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: 'rgba(230,201,106,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(230,201,106,0.4)',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  benefitEmoji: { fontSize: 28 },
  benefitText: { flex: 1, gap: 2 },
  benefitTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: colors.foam },
  benefitBody: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 19, color: colors.mist },
  colLabel: { flex: 1.1 },
  colTier: { flex: 1.3 },
  th: { fontFamily: 'Nunito_700Bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.mist },
  thPlus: { color: colors.butter },
  tdLabel: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.foam },
  td: { fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17, color: colors.mist },
  tdPlus: { color: colors.foam, fontFamily: 'Nunito_600SemiBold' },
  promise: {
    marginTop: spacing.sm,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    lineHeight: 19,
    color: colors.butter,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.mist,
  },
  spinner: { marginVertical: spacing.md },
  panel: {
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  panelBody: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, color: colors.mist },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  planOn: { borderColor: colors.butter, backgroundColor: 'rgba(230,201,106,0.12)' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.butter },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  planTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: colors.foam },
  planNote: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 18, color: colors.mist },
  badge: { backgroundColor: colors.butter, borderRadius: radii.pill, paddingVertical: 2, paddingHorizontal: 8 },
  badgeText: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: colors.ink },
  priceBox: { alignItems: 'flex-end' },
  price: { fontFamily: 'Fraunces_700Bold', fontSize: 20, color: colors.foam },
  per: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: colors.mist },
  cta: {
    marginTop: spacing.sm,
    backgroundColor: colors.butter,
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: colors.ink },
  disabled: { opacity: 0.6 },
  priceLine: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
    color: colors.mist,
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.foam,
  },
  restore: { alignSelf: 'center', marginTop: spacing.md },
  link: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.butter },
  disclosure: {
    marginTop: spacing.lg,
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(247,243,234,0.55)',
  },
  legalRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.sm },
  dot: { color: colors.mist },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});
