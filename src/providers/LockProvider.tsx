import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';
import { secureDelete, secureGet, secureSet } from '@/lib/secureStorage';

const LOCK_KEY = 'lulla.appLock';
const isNative = Platform.OS !== 'web';

type LockState = {
  supported: boolean;
  enabled: boolean;
  setEnabled: (on: boolean) => Promise<boolean>;
};

const LockContext = createContext<LockState | null>(null);

export function LockProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(!isNative);
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabledState] = useState(false);
  const [locked, setLocked] = useState(false);
  const [active, setActive] = useState(true);
  const autoTried = useRef(false);

  useEffect(() => {
    if (!isNative) return;
    let alive = true;
    (async () => {
      try {
        const level = await LocalAuthentication.getEnrolledLevelAsync();
        const on = (await secureGet(LOCK_KEY)) === '1';
        if (!alive) return;
        setSupported(level !== LocalAuthentication.SecurityLevel.NONE);
        setEnabledState(on);
        setLocked(on);
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setActive(state === 'active');
      if (state === 'background') {
        autoTried.current = false;
        setLocked((prev) => prev || enabled);
      }
    });
    return () => sub.remove();
  }, [enabled]);

  const authenticate = useCallback(async (message: string) => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: message,
        cancelLabel: 'Cancel',
      });
      return result.success;
    } catch {
      return false;
    }
  }, []);

  const unlock = useCallback(async () => {
    if (await authenticate('Unlock Lulla')) setLocked(false);
  }, [authenticate]);

  useEffect(() => {
    if (locked && active && loaded && !autoTried.current) {
      autoTried.current = true;
      void unlock();
    }
  }, [locked, active, loaded, unlock]);

  const setEnabled = useCallback(
    async (on: boolean) => {
      if (!isNative || !supported) return false;
      if (on) {
        const ok = await authenticate('Turn on the Lulla app lock');
        if (!ok) return false;
        await secureSet(LOCK_KEY, '1');
        setEnabledState(true);
        return true;
      }
      await secureDelete(LOCK_KEY);
      setEnabledState(false);
      setLocked(false);
      return true;
    },
    [supported, authenticate],
  );

  const value = useMemo(() => ({ supported, enabled, setEnabled }), [supported, enabled, setEnabled]);
  const covered = isNative && (!loaded || locked || (enabled && !active));

  return (
    <LockContext.Provider value={value}>
      {children}
      {covered ? (
        <LinearGradient colors={[colors.nightDeep, '#163645']} style={styles.cover} pointerEvents="auto">
          <View style={styles.box}>
            <Text style={styles.brand}>Lulla</Text>
            {loaded && locked ? (
              <>
                <Text style={styles.msg}>Locked to protect your baby’s information.</Text>
                <Pressable accessibilityRole="button" onPress={unlock} style={styles.btn}>
                  <Text style={styles.btnText}>Unlock</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </LinearGradient>
      ) : null}
    </LockContext.Provider>
  );
}

export function useAppLock(): LockState {
  const ctx = useContext(LockContext);
  if (!ctx) throw new Error('useAppLock must be used inside LockProvider');
  return ctx;
}

const styles = StyleSheet.create({
  cover: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  box: { alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  brand: { fontFamily: 'Fraunces_700Bold', fontSize: 44, color: colors.foam },
  msg: { fontFamily: 'Nunito_400Regular', fontSize: 15, color: colors.mist, textAlign: 'center' },
  btn: { backgroundColor: colors.butter, borderRadius: radii.pill, paddingVertical: 14, paddingHorizontal: 36 },
  btnText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.ink },
});
