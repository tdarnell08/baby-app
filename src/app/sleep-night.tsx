import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BreathingOrb } from '@/components/BreathingOrb';
import { spacing } from '@/constants/theme';
import { volumeOptions } from '@/data/sounds';
import { nightTries } from '@/data/sleepHelp';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { nightSounds, useNightSound } from '@/hooks/useNightSound';
import { useSleepHelp } from '@/hooks/useSleepHelp';
import { tonightCount } from '@/lib/sleepHelpLogic';
import { useNow } from '@/lib/time';

const DIM = { bg: '#050709', card: '#10161B', border: '#1E2A31', text: '#C9B98A', soft: '#8A8672', btn: '#2A2616' };

export default function NightModeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useNow(60000);
  const { ageMonths } = useBabyProfile();
  const { wakes, logWake } = useSleepHelp();
  const { active, volume, error, play, stop, setVolume } = useNightSound();
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p === 'in' ? 'out' : 'in')), 3200);
    return () => clearInterval(id);
  }, []);

  const tries = nightTries(ageMonths);
  const count = tonightCount(wakes, now);

  return (
    <View style={[styles.root, { backgroundColor: DIM.bg }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.column}>
          <Pressable hitSlop={12} onPress={() => { stop(); router.push('/sleep-help'); }} accessibilityRole="button">
            <Text style={styles.back}>← Sleep help</Text>
          </Pressable>

          <Text style={styles.title}>3 a.m.</Text>
          <Text style={styles.sub}>You’re doing fine. Low light, low voice.</Text>

          <View style={styles.soundRow}>
            {nightSounds.map((n) => (
              <Pressable
                key={n.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active === n.id }}
                onPress={() => (active === n.id ? stop() : play(n.id))}
                style={[styles.big, active === n.id && styles.bigOn]}
              >
                <Text style={[styles.bigText, active === n.id && styles.bigTextOn]}>{n.label}</Text>
                <Text style={styles.bigHint}>{active === n.id ? 'Tap to stop' : 'Tap to play'}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.volRow}>
            {volumeOptions.map((v) => (
              <Pressable
                key={v.label}
                accessibilityRole="button"
                accessibilityState={{ selected: volume === v.value }}
                onPress={() => setVolume(v.value)}
                style={[styles.vol, volume === v.value && styles.volOn]}
              >
                <Text style={[styles.volText, volume === v.value && styles.volTextOn]}>{v.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.note}>Phone across the room. Stops by itself after 30 min.</Text>
          {error ? <Text style={styles.note}>{error}</Text> : null}

          <View style={styles.breath}>
            <BreathingOrb size={120} color="#6B5E33" />
            <Text style={styles.breathText}>{phase === 'in' ? 'Breathe in…' : 'Breathe out…'}</Text>
            <Text style={styles.note}>Slow breaths for you. A calm parent helps a calm baby.</Text>
          </View>

          <Text style={styles.section}>Try right now</Text>
          {tries.map((t, i) => (
            <View key={t.head} style={styles.card}>
              <Text style={styles.cardHead}>
                {i + 1}. {t.head}
              </Text>
              <Text style={styles.cardText}>{t.text}</Text>
            </View>
          ))}
          <Text style={styles.note}>Back to sleep, bare crib, in your room. If you’re worried about their health, call your pediatrician.</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              logWake('woke');
              setLogged(true);
            }}
            style={styles.logBtn}
          >
            <Text style={styles.bigText}>{logged ? 'Logged ✓' : 'Log this wake'}</Text>
            <Text style={styles.bigHint}>{count === 0 ? 'No wakes logged tonight' : `${count} logged tonight`}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  column: { width: '100%', maxWidth: 480, gap: spacing.md },
  back: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: DIM.soft },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 40, color: DIM.text },
  sub: { fontFamily: 'Nunito_400Regular', fontSize: 16, color: DIM.soft },
  soundRow: { flexDirection: 'row', gap: spacing.md },
  big: { flex: 1, minHeight: 120, borderRadius: 28, borderWidth: 2, borderColor: DIM.border, backgroundColor: DIM.card, alignItems: 'center', justifyContent: 'center', padding: spacing.md, gap: 4 },
  bigOn: { backgroundColor: DIM.text, borderColor: DIM.text },
  bigText: { fontFamily: 'Fraunces_700Bold', fontSize: 24, color: DIM.text, textAlign: 'center' },
  bigTextOn: { color: DIM.bg },
  bigHint: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: DIM.soft },
  volRow: { flexDirection: 'row', gap: spacing.sm },
  vol: { flex: 1, minHeight: 48, borderRadius: 24, borderWidth: 1, borderColor: DIM.border, alignItems: 'center', justifyContent: 'center' },
  volOn: { backgroundColor: DIM.btn, borderColor: DIM.text },
  volText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: DIM.soft },
  volTextOn: { color: DIM.text },
  note: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 18, color: DIM.soft, textAlign: 'center' },
  breath: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  breathText: { fontFamily: 'Fraunces_600SemiBold', fontSize: 26, color: DIM.text },
  section: { fontFamily: 'Nunito_700Bold', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: DIM.soft },
  card: { borderRadius: 20, borderWidth: 1, borderColor: DIM.border, backgroundColor: DIM.card, padding: spacing.md, gap: 4 },
  cardHead: { fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: DIM.text },
  cardText: { fontFamily: 'Nunito_400Regular', fontSize: 16, lineHeight: 22, color: DIM.soft },
  logBtn: { minHeight: 88, borderRadius: 28, borderWidth: 2, borderColor: DIM.border, backgroundColor: DIM.card, alignItems: 'center', justifyContent: 'center', gap: 4 },
});
