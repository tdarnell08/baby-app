import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Body, Btn, Chip, Notice, Panel, Section, Title, uiStyles } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { kidAges, kidGames, TIMER_OPTIONS, type KidAge, type KidPrefs } from '@/lib/kidLogic';

const iosSteps = [
  'Open Settings, Accessibility, Guided Access, and turn it on.',
  'Tap Passcode Settings and set a Guided Access passcode.',
  'Open Lulla, enter Kid Mode, then triple-click the side button (or the Home button) and tap Start.',
  'To end it, triple-click again and enter the passcode.',
];

const androidSteps = [
  'Open Settings, Security (or Security and privacy), then search for “App pinning” (or “Screen pinning”) and turn it on.',
  'Open Lulla and enter Kid Mode, then open the Overview (recent apps) screen.',
  'Tap the Lulla icon at the top of its card and choose Pin.',
  'To unpin, swipe up and hold (gesture navigation), or touch and hold Back and Overview together.',
];

export function ParentPanel({
  prefs,
  isPremium,
  setupMode,
  timerMinutes,
  timerRunning,
  onAge,
  onSound,
  onStartTimer,
  onStopTimer,
  onStart,
  onExit,
  onPaywall,
}: {
  prefs: KidPrefs;
  isPremium: boolean;
  setupMode: boolean;
  timerMinutes: number;
  timerRunning: boolean;
  onAge: (age: KidAge) => void;
  onSound: (on: boolean) => void;
  onStartTimer: (minutes: number) => void;
  onStopTimer: () => void;
  onStart: () => void;
  onExit: () => void;
  onPaywall: () => void;
}) {
  const plusGames = kidGames.filter((g) => g.plus);
  return (
    <View style={styles.overlay}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <Title sub={setupMode ? 'Set this up once before you hand over the phone.' : 'Parent options. Your child cannot see this screen.'}>For grown-ups</Title>

          <Btn label={setupMode ? 'Start Kid Mode' : 'Back to games'} onPress={onStart} />

          <Section>Child’s age</Section>
          <Panel>
            <View style={uiStyles.wrap}>
              {kidAges.map((a) => (
                <Chip key={a.id} label={a.label} selected={prefs.age === a.id} onPress={() => onAge(a.id)} />
              ))}
            </View>
            <Body tone="muted">Younger children get fewer, bigger choices. Older children get numerals, letters, and a bit more to do.</Body>
          </Panel>

          <Panel>
            <View style={uiStyles.between}>
              <Text style={styles.label}>Sound and voice</Text>
              <Switch
                accessibilityLabel="Sound and voice"
                value={prefs.sound}
                onValueChange={onSound}
                trackColor={{ true: colors.butter, false: 'rgba(255,255,255,0.2)' }}
              />
            </View>
            <Body tone="muted">Turn it off in a waiting room. The ringer switch on iPhone can also silence it.</Body>
          </Panel>

          <Section>Calm-down timer</Section>
          <Panel>
            {isPremium ? (
              <>
                <Body>Ends with a gentle “all done” and a slow breathing wind-down.</Body>
                <View style={uiStyles.wrap}>
                  {TIMER_OPTIONS.map((m) => (
                    <Chip key={m} label={`${m} min`} selected={timerRunning && timerMinutes === m} onPress={() => onStartTimer(m)} />
                  ))}
                </View>
                {timerRunning ? <Btn label="Stop timer" kind="secondary" small onPress={onStopTimer} /> : <Body tone="muted">Tap a length to start. Then tap Back to games.</Body>}
              </>
            ) : (
              <>
                <Body>Set 5, 10, or 15 minutes and Kid Mode winds down on its own. This is part of Lulla Plus.</Body>
                <Btn label="See Lulla Plus" kind="secondary" small onPress={onPaywall} />
              </>
            )}
          </Panel>

          <Section>Games</Section>
          <Panel>
            {kidGames.map((g) => {
              const locked = g.plus && !isPremium;
              return (
                <View key={g.id} style={styles.gameRow}>
                  <Text style={styles.emoji}>{g.emoji}</Text>
                  <View style={uiStyles.flex}>
                    <Text style={styles.label}>{g.label}</Text>
                    <Text style={styles.sub}>{g.blurb}</Text>
                  </View>
                  <Text style={[styles.tag, locked && styles.tagPlus]}>{g.plus ? (locked ? 'Plus' : 'Plus ✓') : 'Free'}</Text>
                </View>
              );
            })}
            {!isPremium ? (
              <Btn label={`Unlock ${plusGames.length} more games with Plus`} kind="secondary" small onPress={onPaywall} />
            ) : null}
            <Body tone="muted">New games arrive with app updates. Nothing is downloaded while your child plays.</Body>
          </Panel>

          <Section>Keep them in the app</Section>
          <Panel>
            <Text style={styles.label}>{Platform.OS === 'android' ? 'Android screen pinning' : 'iPhone Guided Access'}</Text>
            {(Platform.OS === 'android' ? androidSteps : iosSteps).map((s, i) => (
              <Body key={s}>
                {i + 1}. {s}
              </Body>
            ))}
            <Text style={[styles.label, { marginTop: spacing.sm }]}>{Platform.OS === 'android' ? 'iPhone Guided Access' : 'Android screen pinning'}</Text>
            {(Platform.OS === 'android' ? iosSteps : androidSteps).map((s, i) => (
              <Body key={s} tone="muted">
                {i + 1}. {s}
              </Body>
            ))}
            <Body tone="muted">Menu names vary by phone and system version. Guided Access and pinning also keep the home gesture and other apps out of reach.</Body>
          </Panel>

          <Notice tone="info" title="What Kid Mode does and doesn’t do">
            No ads, links, purchases, or accounts. Notifications are silenced inside Kid Mode. Nothing your child does is collected, saved, or sent anywhere, and drawings are never stored. It works with no internet connection.
          </Notice>

          <Btn label="Exit Kid Mode" kind="ghost" onPress={onExit} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#17283A', zIndex: 30 },
  scroll: { padding: spacing.lg, paddingTop: spacing.xxl, alignItems: 'center' },
  column: { width: '100%', maxWidth: 480, gap: spacing.md },
  label: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam },
  sub: { fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.mist },
  gameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  emoji: { fontSize: 28 },
  tag: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: colors.mist },
  tagPlus: { color: colors.butter },
});
