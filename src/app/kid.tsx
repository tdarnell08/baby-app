import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useKeepAwake } from 'expo-keep-awake';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimalsGame } from '@/components/kid/AnimalsGame';
import { BubblesGame } from '@/components/kid/BubblesGame';
import { BuddyGame } from '@/components/kid/BuddyGame';
import { kidColors, type GameProps } from '@/components/kid/kidUi';
import { MatchGame } from '@/components/kid/MatchGame';
import { PaintGame } from '@/components/kid/PaintGame';
import { CornerHold, ParentGate } from '@/components/kid/ParentGate';
import { ParentPanel } from '@/components/kid/ParentPanel';
import { PeekGame } from '@/components/kid/PeekGame';
import { spacing } from '@/constants/theme';
import { useKidAudio } from '@/hooks/useKidAudio';
import { useKidPrefs } from '@/hooks/useKidPrefs';
import { agePlans, kidGames, timerRemainingSec, type KidGameId } from '@/lib/kidLogic';
import { setKidModeActive } from '@/lib/kidMode';
import { nowMs, useNow } from '@/lib/time';
import { usePremium } from '@/providers/PremiumProvider';

type Timer = { startedAt: number; minutes: number };

function TimerPill({ timer, onDone }: { timer: Timer; onDone: () => void }) {
  const now = useNow(1000);
  const remaining = timerRemainingSec(timer.startedAt, timer.minutes, now);
  const fired = useRef(false);
  useEffect(() => {
    if (remaining === 0 && !fired.current) {
      fired.current = true;
      onDone();
    }
  }, [remaining, onDone]);
  const m = Math.floor(remaining / 60);
  const s = `${remaining % 60}`.padStart(2, '0');
  return (
    <View style={styles.pill} accessibilityLabel={`${m} minutes ${s} seconds left`}>
      <Text style={styles.pillText}>
        {m}:{s}
      </Text>
    </View>
  );
}

function Game({ id, ...props }: GameProps & { id: KidGameId }) {
  switch (id) {
    case 'bubbles':
      return <BubblesGame {...props} />;
    case 'animals':
      return <AnimalsGame {...props} />;
    case 'buddy':
      return <BuddyGame {...props} />;
    case 'match':
      return <MatchGame {...props} />;
    case 'paint':
      return <PaintGame {...props} />;
    case 'peek':
      return <PeekGame {...props} />;
  }
}

export default function KidModeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = usePremium();
  const { prefs, ready, update } = useKidPrefs();
  const { say, stop } = useKidAudio(prefs.sound);
  const [view, setView] = useState<'hub' | KidGameId>('hub');
  const [gate, setGate] = useState(false);
  const [panel, setPanel] = useState(false);
  const [timer, setTimer] = useState<Timer | null>(null);
  const [winding, setWinding] = useState(false);

  useKeepAwake();

  useEffect(() => {
    setKidModeActive(true);
    return () => setKidModeActive(false);
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setGate(true);
      return true;
    });
    return () => sub.remove();
  }, []);

  const plan = agePlans[prefs.age];
  const games = kidGames.filter((g) => !g.plus || isPremium);
  const setupMode = ready && !prefs.setup;
  const showPanel = panel || setupMode;

  const openGame = (id: KidGameId) => {
    stop();
    setView(id);
  };
  const goHub = () => {
    stop();
    setView('hub');
  };

  const onTimerDone = useCallback(() => {
    stop();
    setTimer(null);
    setWinding(true);
    setPanel(false);
    setGate(false);
    void say('p-alldone');
  }, [say, stop]);

  const startTimer = (minutes: number) => {
    setWinding(false);
    setTimer({ startedAt: nowMs(), minutes });
  };

  const exit = () => {
    stop();
    router.replace('/');
  };

  const toPaywall = () => {
    stop();
    router.replace('/paywall');
  };

  const closePanel = () => {
    if (setupMode) update({ setup: true });
    setPanel(false);
    setWinding(false);
  };

  const gameProps: GameProps = { age: plan, say, stopAudio: stop };

  return (
    <LinearGradient colors={winding ? kidColors.dim : kidColors.gradient} style={styles.root}>
      <View style={[styles.content, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.top}>
          <CornerHold onOpen={() => setGate(true)} />
          {timer ? <TimerPill timer={timer} onDone={onTimerDone} /> : <View />}
          {view !== 'hub' && !winding ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Back to games" onPress={goHub} style={styles.home}>
              <Text style={styles.homeText}>🏠</Text>
            </Pressable>
          ) : (
            <View style={styles.home} />
          )}
        </View>

        {!ready ? null : winding ? (
          <View style={styles.wind}>
            <Text style={styles.windTitle}>All done</Text>
            <View style={styles.windBuddy}>
              <BuddyGame {...gameProps} slow />
            </View>
          </View>
        ) : view === 'hub' ? (
          <View style={styles.hub}>
            {games.map((g, i) => (
              <Pressable
                key={g.id}
                accessibilityRole="button"
                accessibilityLabel={g.label}
                onPress={() => openGame(g.id)}
                style={({ pressed }) => [styles.tile, { backgroundColor: kidColors.tiles[i % kidColors.tiles.length] }, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.tileEmoji}>{g.emoji}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.game}>
            <Game id={view} {...gameProps} />
          </View>
        )}
      </View>

      {gate ? (
        <ParentGate
          onPass={() => {
            setGate(false);
            setPanel(true);
          }}
          onCancel={() => setGate(false)}
        />
      ) : null}

      {showPanel ? (
        <ParentPanel
          prefs={prefs}
          isPremium={isPremium}
          setupMode={setupMode}
          timerMinutes={timer?.minutes ?? 0}
          timerRunning={timer !== null}
          onAge={(age) => update({ age })}
          onSound={(sound) => update({ sound })}
          onStartTimer={startTimer}
          onStopTimer={() => setTimer(null)}
          onStart={closePanel}
          onExit={exit}
          onPaywall={toPaywall}
        />
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, paddingHorizontal: spacing.md, gap: spacing.sm, width: '100%', maxWidth: 560, alignSelf: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56 },
  pill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.55)' },
  pillText: { fontFamily: 'Nunito_700Bold', fontSize: 18, color: kidColors.ink },
  home: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.0)' },
  homeText: { fontSize: 34 },
  hub: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, alignContent: 'center', justifyContent: 'center' },
  tile: { width: '46%', aspectRatio: 1, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  tileEmoji: { fontSize: 78 },
  game: { flex: 1 },
  wind: { flex: 1, alignItems: 'center' },
  windTitle: { fontFamily: 'Fraunces_700Bold', fontSize: 40, color: '#F6F1E6' },
  windBuddy: { flex: 1, alignSelf: 'stretch' },
});
