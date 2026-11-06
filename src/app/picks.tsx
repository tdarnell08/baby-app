import { Linking, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BulletItem } from '@/components/Sources';
import { Body, Btn, Notice, Panel, Screen, Section, Title } from '@/components/ui';
import { colors, radii, spacing } from '@/constants/theme';
import { config } from '@/config';
import { choosingCriteria, picks } from '@/data/picks';
import { pickOfWeek, resolveLink, weekLabel, type Pick } from '@/lib/picksLogic';
import { useNow } from '@/lib/time';

const GREEN_GRADIENT: [string, string, string] = ['#14302A', '#1D4A3F', '#2A5E52'];

function PickCard({ pick, featured, weekOf }: { pick: Pick; featured?: boolean; weekOf?: string }) {
  const link = resolveLink(config.affiliateUrls[pick.id] ?? '', pick.productUrl);
  const open = (url: string) => void Linking.openURL(url).catch(() => {});
  return (
    <View style={[styles.card, featured && styles.cardFeatured]}>
      {featured ? <Text style={styles.badge}>Pick of the week · week of {weekOf}</Text> : null}
      <Text style={styles.category}>{pick.category}</Text>
      <Text style={styles.name}>{pick.name}</Text>
      <Text style={styles.brand}>
        {pick.brand} · {pick.ageFit}
      </Text>
      <Body>{pick.tagline}</Body>
      <Body tone="good">{pick.whyWeLike}</Body>

      <Text style={styles.sub}>The brand says</Text>
      {pick.brandSays.map((t) => (
        <BulletItem key={t} text={t} />
      ))}

      <Text style={styles.sub}>Worth knowing</Text>
      {pick.worthKnowing.map((t) => (
        <BulletItem key={t} text={t} />
      ))}

      <Btn
        label={link.affiliate ? `See it at ${pick.brand} (affiliate link)` : `See it at ${pick.brand}`}
        onPress={() => open(link.url)}
      />

      <Text style={styles.sub}>Check it yourself</Text>
      {pick.checkIt.map((c) => (
        <Text key={c.url} accessibilityRole="link" onPress={() => open(c.url)} style={styles.link}>
          {c.label}
        </Text>
      ))}
    </View>
  );
}

export default function PicksScreen() {
  const router = useRouter();
  const now = new Date(useNow(60 * 60 * 1000));
  const weekly = pickOfWeek(picks, now);
  const others = picks.filter((p) => p.id !== weekly?.id);
  const anyAffiliate = picks.some((p) => resolveLink(config.affiliateUrls[p.id] ?? '', p.productUrl).affiliate);

  return (
    <Screen gradient={GREEN_GRADIENT}>
      <Title sub="Gentler everyday things we use with our own kids.">Parent picks</Title>

      <Notice tone="info" title="How links work">
        {anyAffiliate
          ? 'Some links are affiliate links. If you buy through them, we may earn a small commission at no extra cost to you. '
          : 'Links open the brand’s own page. If we add affiliate links, we will say so on the button. '}
        Lulla never sees what you tap or buy, and these picks never change how the app works. Kid Mode has no links.
      </Notice>

      {weekly ? <PickCard pick={weekly} featured weekOf={weekLabel(now)} /> : null}

      {others.length > 0 ? <Section>More favorites</Section> : null}
      {others.map((p) => (
        <PickCard key={p.id} pick={p} />
      ))}

      <Section>Shopping for a specific age?</Section>
      <Btn label="Best by age" kind="secondary" onPress={() => router.push('/best-by-age')} />

      <Section>How we choose</Section>
      <Panel>
        {choosingCriteria.map((t) => (
          <BulletItem key={t} text={t} />
        ))}
      </Panel>
      <Body tone="muted">
        “Non-toxic” and “natural” are marketing terms with no single legal meaning, so we show ingredients and ratings instead. Product details come from
        the brand and the sources linked above and can change, so always read the current label. Picks are not medical advice. Ask your pediatrician about skin
        concerns or allergies.
      </Body>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  cardFeatured: { borderColor: 'rgba(230,201,106,0.6)', backgroundColor: 'rgba(230,201,106,0.1)' },
  badge: { fontFamily: 'Nunito_700Bold', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.butter },
  category: { fontFamily: 'Nunito_700Bold', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.mist },
  name: { fontFamily: 'Fraunces_700Bold', fontSize: 26, color: colors.foam },
  brand: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: colors.mist },
  sub: { marginTop: spacing.xs, fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.butter },
  link: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.butter, textDecorationLine: 'underline' },
});
