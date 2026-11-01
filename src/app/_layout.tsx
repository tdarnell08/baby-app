import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { setAudioModeAsync } from 'expo-audio';
import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  useFonts as useFraunces,
} from '@expo-google-fonts/fraunces';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts as useNunito,
} from '@expo-google-fonts/nunito';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { LockProvider } from '@/providers/LockProvider';
import { PremiumProvider } from '@/providers/PremiumProvider';
import { RemindersRunner } from '@/providers/RemindersRunner';

export default function RootLayout() {
  const [frauncesLoaded, frauncesError] = useFraunces({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });
  const [nunitoLoaded, nunitoError] = useNunito({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 2500);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    }).catch(() => {
      // Audio mode is optional on web preview
    });
  }, []);

  const fontsReady =
    (frauncesLoaded || !!frauncesError) && (nunitoLoaded || !!nunitoError);

  if (!fontsReady && !timedOut) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.sage} size="large" />
      </View>
    );
  }

  return (
    <PremiumProvider>
      <LockProvider>
        <RemindersRunner />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.nightDeep },
            animation: 'fade',
          }}
        />
      </LockProvider>
    </PremiumProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.nightDeep,
  },
});
