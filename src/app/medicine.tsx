import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { config } from '@/config';
import { colors, radii, spacing } from '@/constants/theme';
import {
  callEmergency,
  callFirst,
  doNotGive,
  doseFor,
  formatMl,
  kgToLb,
  lbToKg,
  medDisclaimer,
  medSources,
  medicines,
  safeUseRules,
  supplements,
  type MedId,
  type MedInfo,
} from '@/data/medications';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useMedLog, type DoseEntry } from '@/hooks/useMedLog';

const HOUR = 60 * 60 * 1000;

function clock(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function ago(ms: number) {
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h ago` : `${h} h ${m} min ago`;
}

function wait(ms: number) {
  const mins = Math.ceil(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function dayLabel(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function logStatus(info: MedInfo, entries: DoseEntry[], now: number) {
  const mine = entries.filter((e) => e.med === info.id).sort((a, b) => a.at - b.at);
  const recent = mine.filter((e) => e.at > now - 24 * HOUR);
  const last = mine[mine.length - 1];
  const nextAt = last ? last.at + info.minHours * HOUR : null;
  const atLimit = recent.length >= info.maxPerDay;
  const limitUntil = atLimit ? recent[recent.length - info.maxPerDay].at + 24 * HOUR : null;
  return { last, count: recent.length, nextAt, atLimit, limitUntil };
}

export default function MedicineScreen() {
  if (!config.medicineDoses) return <MedicineUnavailable />;
  return <MedicineContent />;
}

function MedicineUnavailable() {
  const router = useRouter();
  return (
    <LinearGradient colors={['#34202E', '#47293D', '#5A3548']} style={styles.root}>
      <View style={styles.unavailable}>
        <Text style={styles.title}>Medicine doses</Text>
        <Text style={styles.subtitle}>
          This feature isn’t available in this version of Lulla. For dosing, check the label or ask your pediatrician or
          pharmacist. For poisoning in the US, call 1-800-222-1222.
        </Text>
        <Pressable onPress={() => router.replace('/')} style={styles.logBtn} accessibilityRole="button">
          <Text style={styles.logBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function MedicineContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hook = useBabyProfile();
  const { entries, add, remove, clear } = useMedLog();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const { profile, ageMonths, ageLabel, ready } = hook;
  const weightLb = profile.weightKg ? kgToLb(profile.weightKg) : null;

  return (
    <LinearGradient colors={['#34202E', '#47293D', '#5A3548']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.column}>
          <Pressable hitSlop={12} onPress={() => router.push('/')}>
            <Text style={styles.backText}>← Home</Text>
          </Pressable>
          <Text style={styles.title}>Medicine doses</Text>
          <Text style={styles.subtitle}>
            Weight-based doses for acetaminophen and ibuprofen from published pediatric dosing tables, plus a log so a
            dose is never repeated too soon.
          </Text>

          <View style={styles.alert}>
            <Text style={styles.alertTitle}>Emergency or poisoning?</Text>
            <Text style={styles.alertBody}>{callEmergency}</Text>
            <Text style={styles.alertBody}>
              Gave too much or the wrong medicine? Call Poison Control now: 1-800-222-1222 (US).
            </Text>
          </View>

          <Text style={styles.section}>Call your pediatrician first if</Text>
          <View style={styles.panel}>
            {callFirst.map((item) => (
              <View key={item} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>Your baby</Text>
          {ready ? <WeightCard hook={hook} /> : null}

          {ready && !profile.configured ? (
            <Pressable onPress={() => router.push('/profile')} style={styles.setup}>
              <Text style={styles.setupTitle}>Add your baby’s age first</Text>
              <Text style={styles.setupBody}>
                Some medicines have age limits, so Lulla needs your baby’s age before showing a dose.
              </Text>
              <Text style={styles.setupLink}>Set up baby profile →</Text>
            </Pressable>
          ) : null}

          {ready && profile.configured && weightLb === null ? (
            <View style={styles.panel}>
              <Text style={styles.panelBody}>Enter your baby’s weight above to see doses.</Text>
            </View>
          ) : null}

          {ready && profile.configured && weightLb !== null
            ? (['acetaminophen', 'ibuprofen'] as MedId[]).map((id) => (
                <DoseCard
                  key={id}
                  info={medicines[id]}
                  weightLb={weightLb}
                  weightDate={profile.weightDate}
                  ageMonths={ageMonths}
                  ageLabel={ageLabel}
                  entries={entries}
                  now={now}
                  onLog={(ml) => add(id, ml)}
                />
              ))
            : null}

          <Text style={styles.section}>Dose log · last 24 hours</Text>
          <View style={styles.panel}>
            {entries.filter((e) => e.at > now - 24 * HOUR).length === 0 ? (
              <Text style={styles.panelBody}>
                Nothing logged. After you give a dose, tap “I gave this dose” so you and anyone else caring for your
                baby can see what was given and when.
              </Text>
            ) : (
              entries
                .filter((e) => e.at > now - 24 * HOUR)
                .map((e) => (
                  <View key={e.id} style={styles.logRow}>
                    <View style={styles.flex}>
                      <Text style={styles.logTitle}>
                        {medicines[e.med].name} · {formatMl(e.ml)}
                      </Text>
                      <Text style={styles.logMeta}>
                        {clock(e.at)} · {ago(now - e.at)}
                      </Text>
                    </View>
                    <Pressable onPress={() => remove(e.id)} hitSlop={8}>
                      <Text style={styles.remove}>Remove</Text>
                    </Pressable>
                  </View>
                ))
            )}
            {entries.length > 0 ? (
              <Pressable onPress={clear} hitSlop={8}>
                <Text style={styles.remove}>Clear log</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.section}>Dosing tables</Text>
          {(['acetaminophen', 'ibuprofen'] as MedId[]).map((id) => (
            <DoseTable key={id} info={medicines[id]} weightLb={weightLb} />
          ))}

          <Text style={styles.section}>Safe-use rules</Text>
          <View style={styles.panel}>
            {safeUseRules.map((rule) => (
              <View key={rule} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{rule}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>What not to give</Text>
          <View style={styles.panel}>
            {doNotGive.map((item) => (
              <View key={item.title} style={styles.noGive}>
                <Text style={styles.noGiveTitle}>✕ {item.title}</Text>
                <Text style={styles.bulletText}>{item.why}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>Everyday supplements</Text>
          <View style={styles.panel}>
            {supplements.map((item) => (
              <View key={item.title} style={styles.noGive}>
                <Text style={styles.suppTitle}>{item.title}</Text>
                <Text style={styles.bulletText}>{item.body}</Text>
              </View>
            ))}
            <Text style={styles.panelBody}>Always confirm supplements with your pediatrician.</Text>
          </View>

          <Text style={styles.section}>Where this comes from</Text>
          <View style={styles.panel}>
            {medSources.map((source) => (
              <View key={source} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.sourceText}>{source}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.disclaimer}>{medDisclaimer}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function WeightCard({ hook }: { hook: ReturnType<typeof useBabyProfile> }) {
  const { profile, ageLabel, update, setWeight } = hook;
  const unit = profile.weightUnit;
  const [text, setText] = useState(() => {
    if (!profile.weightKg) return '';
    const value = unit === 'lb' ? kgToLb(profile.weightKg) : profile.weightKg;
    return String(Math.round(value * 10) / 10);
  });
  const [error, setError] = useState<string | null>(null);

  const apply = (raw: string, u: 'lb' | 'kg') => {
    const cleaned = raw.replace(/[^0-9.]/g, '');
    setText(cleaned);
    if (cleaned === '') {
      setError(null);
      setWeight(null);
      return;
    }
    const value = Number(cleaned);
    const lb = u === 'lb' ? value : kgToLb(value);
    if (!Number.isFinite(value) || lb < 4 || lb > 120) {
      setError(u === 'lb' ? 'Enter a weight between 4 and 120 lb.' : 'Enter a weight between 1.8 and 54 kg.');
      return;
    }
    setError(null);
    setWeight(u === 'lb' ? lbToKg(value) : value);
  };

  const switchUnit = (next: 'lb' | 'kg') => {
    if (next === unit) return;
    update({ weightUnit: next });
    if (profile.weightKg) {
      const value = next === 'lb' ? kgToLb(profile.weightKg) : profile.weightKg;
      setText(String(Math.round(value * 10) / 10));
      setError(null);
    } else {
      setText('');
    }
  };

  const lb = profile.weightKg ? kgToLb(profile.weightKg) : null;

  return (
    <View style={styles.panel}>
      <View style={styles.weightRow}>
        <View style={styles.flex}>
          <Text style={styles.fieldLabel}>Current weight</Text>
          <TextInput
            value={text}
            onChangeText={(t) => apply(t, unit)}
            placeholder={unit === 'lb' ? 'e.g. 17.5' : 'e.g. 7.9'}
            placeholderTextColor="rgba(247,243,234,0.4)"
            keyboardType="decimal-pad"
            style={styles.input}
            accessibilityLabel="Baby weight"
          />
        </View>
        <View style={styles.unitToggle}>
          {(['lb', 'kg'] as const).map((u) => (
            <Pressable
              key={u}
              onPress={() => switchUnit(u)}
              accessibilityRole="radio"
              accessibilityState={{ selected: unit === u }}
              style={[styles.unit, unit === u && styles.unitOn]}
            >
              <Text style={[styles.unitText, unit === u && styles.unitTextOn]}>{u}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.panelBody}>
        {profile.configured ? `Age: ${ageLabel}. ` : ''}
        {lb && profile.weightKg
          ? `${(Math.round(lb * 10) / 10).toFixed(1)} lb · ${(Math.round(profile.weightKg * 10) / 10).toFixed(1)} kg${
              profile.weightDate ? ` · saved ${dayLabel(profile.weightDate)}` : ''
            }`
          : 'Use a recent weight from a scale or your pediatrician’s office.'}
      </Text>
    </View>
  );
}

function DoseCard({
  info,
  weightLb,
  weightDate,
  ageMonths,
  ageLabel,
  entries,
  now,
  onLog,
}: {
  info: MedInfo;
  weightLb: number;
  weightDate: string | null;
  ageMonths: number;
  ageLabel: string;
  entries: DoseEntry[];
  now: number;
  onLog: (ml: number) => void;
}) {
  const result = doseFor(info.id, weightLb);
  const status = logStatus(info, entries, now);
  const ageBlocked = ageMonths < info.minMonths;

  const staleDays = weightDate
    ? Math.floor((now - new Date(weightDate + 'T00:00:00').getTime()) / (24 * HOUR))
    : 0;
  const stale = staleDays > (ageMonths < 12 ? 30 : 60);

  let body: React.ReactNode;
  if (ageBlocked) {
    body = (
      <View style={styles.block}>
        <Text style={styles.blockTitle}>
          {info.id === 'ibuprofen'
            ? 'Not for babies under 6 months'
            : 'Call your pediatrician before giving this'}
        </Text>
        <Text style={styles.panelBody}>
          {info.id === 'ibuprofen'
            ? `At ${ageLabel}, ibuprofen isn’t recommended. Ask your pediatrician what to use for fever or pain.`
            : `Babies under 12 weeks should be seen or advised by a doctor before getting any medicine. If your pediatrician recommends acetaminophen, use the amount they give you.`}
        </Text>
      </View>
    );
  } else if (result.status === 'tooSmall') {
    body = (
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Weight is below the dosing chart</Text>
        <Text style={styles.panelBody}>Ask your pediatrician for a dose.</Text>
      </View>
    );
  } else if (result.status === 'tooBig') {
    body = (
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Weight is above this app’s range</Text>
        <Text style={styles.panelBody}>Use the chart on the package or ask your pharmacist.</Text>
      </View>
    );
  } else if (result.status === 'askDoctor') {
    body = (
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Ask your pediatrician first</Text>
        <Text style={styles.panelBody}>At this weight, a doctor should give you the dose.</Text>
      </View>
    );
  } else {
    const tooSoon = status.nextAt !== null && now < status.nextAt;
    body = (
      <>
        <View style={styles.doseRow}>
          <Text style={styles.doseBig}>{formatMl(result.ml)}</Text>
          <View style={styles.flex}>
            <Text style={styles.doseMg}>{result.mg} mg per dose</Text>
            <Text style={styles.doseSub}>
              ≈ {result.mgPerKg.toFixed(1)} mg/kg · target {info.mgPerKg[0]} to {info.mgPerKg[1]}
            </Text>
          </View>
        </View>
        <Text style={styles.panelBody}>
          Product: {info.concentration}. Every {info.minHours} to {info.maxHours} hours if needed, no more than{' '}
          {info.maxPerDay} doses in 24 hours.
        </Text>

        {stale ? (
          <Text style={styles.warn}>
            Weight was saved {staleDays} days ago. Weigh your baby again so the dose is right.
          </Text>
        ) : null}

        <View style={[styles.statusBox, (tooSoon || status.atLimit) && styles.statusWarn]}>
          {status.last ? (
            <Text style={styles.statusText}>
              Last logged {clock(status.last.at)} ({ago(now - status.last.at)}) · {status.count} of {info.maxPerDay}{' '}
              doses in 24 h
            </Text>
          ) : (
            <Text style={styles.statusText}>No doses logged in the last 24 hours.</Text>
          )}
          {status.atLimit && status.limitUntil ? (
            <Text style={styles.statusStrong}>
              Daily limit reached. Don’t give more. If your baby still needs relief, call your pediatrician.
            </Text>
          ) : tooSoon && status.nextAt ? (
            <Text style={styles.statusStrong}>
              Too soon. Wait about {wait(status.nextAt - now)} (next at {clock(status.nextAt)}).
            </Text>
          ) : status.last ? (
            <Text style={styles.statusOk}>Spacing is OK. Earliest next dose has passed.</Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => onLog(result.ml)}
          style={({ pressed }) => [styles.logBtn, pressed && styles.pressed]}
        >
          <Text style={styles.logBtnText}>I gave this dose</Text>
        </Pressable>
      </>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {info.emoji} {info.name}
      </Text>
      <Text style={styles.cardBrands}>{info.brands}</Text>
      {body}
      <View style={styles.notes}>
        {info.notes.map((note) => (
          <View key={note} style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>{note}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DoseTable({ info, weightLb }: { info: MedInfo; weightLb: number | null }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.panel}>
      <Pressable onPress={() => setOpen(!open)} style={styles.tableHead} accessibilityRole="button">
        <Text style={styles.panelTitle}>
          {info.emoji} {info.name}
        </Text>
        <Text style={styles.chevron}>{open ? '▾' : '▸'}</Text>
      </Pressable>
      {open ? (
        <View>
          <Text style={styles.panelBody}>{info.concentration}. Use weight when you know it.</Text>
          <View style={[styles.tr, styles.th]}>
            <Text style={[styles.td, styles.thText]}>Weight</Text>
            <Text style={[styles.td, styles.thText]}>Age</Text>
            <Text style={[styles.tdEnd, styles.thText]}>Dose</Text>
          </View>
          {info.bands.map((band) => {
            const here = weightLb !== null && weightLb >= band.minLb && weightLb < band.maxLb;
            const ask = info.id === 'acetaminophen' && band.minLb < info.minLb;
            return (
              <View key={band.minLb} style={[styles.tr, here && styles.trHere]}>
                <Text style={styles.td}>
                  {band.minLb} to {band.maxLb - 1} lb
                </Text>
                <Text style={styles.td}>{band.age}</Text>
                <Text style={styles.tdEnd}>{ask ? 'Ask doctor' : formatMl(band.ml)}</Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  unavailable: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  scroll: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  column: { width: '100%', maxWidth: 480 },
  flex: { flex: 1 },
  backText: { fontFamily: 'Nunito_600SemiBold', color: colors.mist, fontSize: 15, marginBottom: spacing.sm },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 34, color: colors.foam },
  subtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(247,243,234,0.75)',
    marginBottom: spacing.md,
  },
  alert: {
    gap: 4,
    backgroundColor: '#F6D6D2',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  alertTitle: { fontFamily: 'Fraunces_700Bold', fontSize: 18, color: '#6B1F1A' },
  alertBody: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, lineHeight: 20, color: '#4A1A16' },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.mist,
  },
  panel: {
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  panelTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: colors.foam },
  panelBody: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, color: colors.mist },
  bulletRow: { flexDirection: 'row', gap: spacing.sm },
  bullet: { color: colors.butter, fontSize: 14, lineHeight: 21 },
  bulletText: { flex: 1, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 21, color: colors.mist },
  sourceText: { flex: 1, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 18, color: 'rgba(247,243,234,0.7)' },
  noGive: { gap: 2 },
  noGiveTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.blush },
  suppTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.butter },
  fieldLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.mist,
    marginBottom: 6,
  },
  weightRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: colors.foam,
  },
  unitToggle: {
    flexDirection: 'row',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  unit: { paddingVertical: 14, paddingHorizontal: 16 },
  unitOn: { backgroundColor: colors.butter },
  unitText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam },
  unitTextOn: { color: colors.ink },
  error: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: colors.blush },
  setup: {
    gap: 4,
    backgroundColor: 'rgba(230,201,106,0.16)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(230,201,106,0.45)',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  setupTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: colors.foam },
  setupBody: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, color: colors.mist },
  setupLink: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.butter },
  card: {
    gap: spacing.sm,
    backgroundColor: colors.foam,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: { fontFamily: 'Fraunces_700Bold', fontSize: 24, color: colors.ink },
  cardBrands: { marginTop: -6, fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.muted },
  doseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  doseBig: { fontFamily: 'Fraunces_700Bold', fontSize: 40, color: colors.ink },
  doseMg: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.ink },
  doseSub: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.muted },
  block: { gap: 4 },
  blockTitle: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#8A2A22' },
  warn: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, lineHeight: 18, color: '#8A5A00' },
  statusBox: {
    gap: 4,
    borderRadius: radii.sm,
    backgroundColor: '#E8F0EC',
    padding: spacing.sm,
  },
  statusWarn: { backgroundColor: '#F6D6D2' },
  statusText: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 18, color: colors.ink },
  statusStrong: { fontFamily: 'Nunito_700Bold', fontSize: 14, lineHeight: 19, color: '#8A2A22' },
  statusOk: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.sageDeep },
  logBtn: {
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    paddingVertical: 13,
    alignItems: 'center',
  },
  logBtnText: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam },
  notes: { gap: 4, marginTop: 2 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam },
  logMeta: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.mist },
  remove: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.butter },
  tableHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chevron: { fontSize: 16, color: colors.mist },
  tr: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  th: { borderBottomColor: 'rgba(255,255,255,0.35)' },
  thText: { fontFamily: 'Nunito_700Bold', color: colors.butter },
  trHere: {
    backgroundColor: 'rgba(230,201,106,0.38)',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.butter,
    paddingLeft: 6,
  },
  td: { flex: 1.2, fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: colors.foam },
  tdEnd: { flex: 0.9, textAlign: 'right', fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.foam },
  disclaimer: {
    marginTop: spacing.md,
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(247,243,234,0.6)',
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});
