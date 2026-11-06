import { useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BulletItem } from '@/components/Sources';
import { Body, Btn, Chip, Field, Notice, Panel, Screen, Section, Title } from '@/components/ui';
import { colors, radii, spacing } from '@/constants/theme';
import { config } from '@/config';
import { ageItems, generalSafety } from '@/data/bestByAge';
import {
  bandById,
  bandForMonths,
  bands,
  categories,
  categoryCounts,
  itemsFor,
  parseAgeInput,
  type AgeItem,
  type AgeUnit,
  type BandId,
  type CategoryId,
  type GreenLevel,
} from '@/lib/bestByAgeLogic';
import { resolveLink } from '@/lib/picksLogic';
import { useBabyProfile } from '@/hooks/useBabyProfile';

const GREEN_GRADIENT: [string, string, string] = ['#14302A', '#1D4A3F', '#2A5E52'];

const greenCopy: Record<GreenLevel, { label: string; color: string }> = {
  verified: { label: 'Independent check', color: '#9FE0B8' },
  brand: { label: 'Brand claim only', color: colors.butter },
  none: { label: 'No green claim', color: colors.mist },
};

const errorCopy = {
  empty: 'Enter an age first.',
  invalid: 'Enter a number, like 8 or 1.5.',
  'too-old': 'Best by age covers birth to 5 years (under 6).',
} as const;

function affiliateFor(item: AgeItem) {
  return resolveLink(config.affiliateUrls[item.id] ?? '', item.productUrl);
}

function ItemCard({ item }: { item: AgeItem }) {
  const link = affiliateFor(item);
  const green = greenCopy[item.green.level];
  const open = (url: string) => void Linking.openURL(url).catch(() => {});
  return (
    <View style={styles.card} accessibilityLabel={`${item.name} by ${item.brand}`}>
      <Text style={styles.category}>{categories.find((c) => c.id === item.category)?.label}</Text>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.brand}>
        {item.brand} · {item.ageLabel}
      </Text>

      <Text style={styles.sub}>Why we like it</Text>
      <Body>{item.why}</Body>

      <Text style={styles.sub}>Safety notes</Text>
      {item.safety.map((t) => (
        <BulletItem key={t} text={t} />
      ))}

      <View style={styles.greenBox}>
        <Text style={[styles.greenLabel, { color: green.color }]}>{green.label}</Text>
        <Text style={styles.greenNote}>{item.green.note}</Text>
      </View>

      <Btn
        label={link.affiliate ? `See it at ${item.brand} (affiliate link)` : `See it at ${item.brand}`}
        onPress={() => open(link.url)}
      />

      <Text style={styles.sub}>Check it yourself</Text>
      {item.sources.map((s) => (
        <Text key={s.url} accessibilityRole="link" onPress={() => open(s.url)} style={styles.link}>
          {s.label}
        </Text>
      ))}
    </View>
  );
}

export default function BestByAgeScreen() {
  const router = useRouter();
  const { profile, ageMonths, ready } = useBabyProfile();
  const [chosenBand, setBandId] = useState<BandId | null>(null);
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const [text, setText] = useState('');
  const [unit, setUnit] = useState<AgeUnit>('months');
  const [error, setError] = useState<string | null>(null);
  const [typedLabel, setTypedLabel] = useState<string | null>(null);
  const profileBand = ready && profile.configured ? (bandForMonths(ageMonths)?.id ?? null) : null;
  const bandId = chosenBand ?? profileBand;

  const band = bandId ? bandById(bandId) : null;
  const counts = useMemo(() => (band ? categoryCounts(ageItems, band) : null), [band]);
  const visible = useMemo(() => (band ? itemsFor(ageItems, band, category) : []), [band, category]);
  const anyAffiliate = ageItems.some((i) => affiliateFor(i).affiliate);

  const pickBand = (id: BandId) => {
    setBandId(id);
    setCategory('all');
    setTypedLabel(null);
    setError(null);
    setText('');
  };

  const submit = () => {
    const result = parseAgeInput(text, unit);
    if (!result.ok) {
      setError(errorCopy[result.reason]);
      return;
    }
    const match = bandForMonths(result.months);
    if (!match) {
      setError(errorCopy['too-old']);
      return;
    }
    setError(null);
    setBandId(match.id);
    setCategory('all');
    setTypedLabel(`${text.trim()} ${unit === 'months' ? 'month' : 'year'}${text.trim() === '1' ? '' : 's'}`);
  };

  return (
    <Screen gradient={GREEN_GRADIENT}>
      <Title sub="Well-known products and toys, by your child’s age.">Best by age</Title>

      <Notice tone="info" title="How this works">
        {anyAffiliate
          ? 'Some links are affiliate links. If you buy through them, we may earn a small commission at no extra cost to you. '
          : 'Links open the brand’s own page. If we add affiliate links, we will say so on the button. '}
        Age and filters stay on this screen only. Lulla never sees what you tap or buy. Kid Mode has no links.
      </Notice>

      <Section>Pick an age</Section>
      <View style={styles.chips}>
        {bands.map((b) => (
          <Chip key={b.id} label={b.short} selected={bandId === b.id} onPress={() => pickBand(b.id)} accessibilityLabel={`Age ${b.label}`} />
        ))}
      </View>

      <Panel>
        <Field
          label="Or enter an age"
          hint="Whole months, or years like 1.5"
          value={text}
          onChangeText={(v) => {
            setText(v);
            setError(null);
          }}
          keyboardType="decimal-pad"
          returnKeyType="done"
          onSubmitEditing={submit}
          placeholder={unit === 'months' ? 'e.g. 8' : 'e.g. 2'}
          maxLength={5}
        />
        <View style={styles.chips}>
          <Chip label="Months" selected={unit === 'months'} onPress={() => setUnit('months')} />
          <Chip label="Years" selected={unit === 'years'} onPress={() => setUnit('years')} />
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Btn label="Show items" onPress={submit} />
      </Panel>

      {!band || !counts ? (
        <Panel>
          <Body>Pick an age above to see items for that stage. We start from the youngest age each maker’s own label allows, never earlier.</Body>
        </Panel>
      ) : (
        <>
          <Section>{typedLabel ? `${typedLabel} → ${band.label}` : band.label}</Section>
          <View style={styles.chips}>
            <Chip label={`All ${counts.all}`} selected={category === 'all'} onPress={() => setCategory('all')} accessibilityLabel={`All categories, ${counts.all} items`} />
            {categories.map((c) => (
              <Chip
                key={c.id}
                label={`${c.label} ${counts[c.id]}`}
                selected={category === c.id}
                onPress={() => setCategory(c.id)}
                accessibilityLabel={`${c.label}, ${counts[c.id]} items`}
              />
            ))}
          </View>

          {visible.length === 0 ? (
            <Panel>
              <Body>
                We do not list any {categories.find((c) => c.id === category)?.label.toLowerCase()} items for this age yet. Try another category, or check
                a nearby age.
              </Body>
            </Panel>
          ) : (
            visible.map((item) => <ItemCard key={item.id} item={item} />)
          )}

          <Section>Safety basics at every age</Section>
          <Panel>
            {generalSafety.map((s) => (
              <BulletItem key={s.text} text={s.text} />
            ))}
          </Panel>
        </>
      )}

      <Section>How we choose and mark green</Section>
      <Panel>
        <BulletItem text="We list well-known items and show what the maker says. Nothing here is a ranking, and we show no star ratings or scores." />
        <BulletItem text="We never list an item below the youngest age on its own label." />
        <BulletItem text="“Independent check” means a third-party seal or listing, linked so you can look it up. “Brand claim only” means the maker says so and we found no outside check." />
        <BulletItem text="“Non-toxic” and “natural” are marketing terms with no single legal meaning, so we only repeat them as a brand claim, and we do not use them as our own." />
      </Panel>
      <Body tone="muted">
        Details come from each maker and the sources linked on every card. They can change, so always read the current label and manual. This is not medical
        advice. Ask your pediatrician about feeding, sleep, and safety for your child.
      </Body>
      <Btn label="Weekly gentler pick" kind="secondary" onPress={() => router.push('/picks')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  error: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#FFB4A8' },
  card: {
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  category: { fontFamily: 'Nunito_700Bold', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.mist },
  name: { fontFamily: 'Fraunces_700Bold', fontSize: 24, color: colors.foam },
  brand: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: colors.mist },
  sub: { marginTop: spacing.xs, fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.butter },
  greenBox: { gap: 2, borderRadius: radii.sm, padding: spacing.sm, backgroundColor: 'rgba(0,0,0,0.18)' },
  greenLabel: { fontFamily: 'Nunito_700Bold', fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase' },
  greenNote: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, color: colors.foam },
  link: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.butter, textDecorationLine: 'underline' },
});
