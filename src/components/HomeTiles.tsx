import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';
import { currentBand, milestones } from '@/data/milestones';
import { useBabyProfile } from '@/hooks/useBabyProfile';

export function HomeTiles() {
  const router = useRouter();
  const { profile, ageMonths, ageLabel } = useBabyProfile();
  const band = currentBand(ageMonths);
  const due = band === null ? [] : milestones.filter((m) => m.months <= band);
  const done = due.filter((m) => profile.achieved[m.id]).length;

  return (
    <View style={styles.wrap}>
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/profile')}
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      >
        <Text style={styles.emoji}>👶</Text>
        <Text style={styles.label}>Baby profile</Text>
        <Text style={styles.hint} numberOfLines={2}>
          {profile.configured
            ? `${profile.name.trim() ? `${profile.name.trim()} · ` : ''}${ageLabel}`
            : 'Add age and interests'}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/milestones')}
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      >
        <Text style={styles.emoji}>🌟</Text>
        <Text style={styles.label}>Milestones</Text>
        <Text style={styles.hint} numberOfLines={2}>
          {profile.configured && due.length > 0 ? `${done} of ${due.length} checked` : 'Track what they can do'}
        </Text>
      </Pressable>
    </View>
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/coach')}
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      >
        <Text style={styles.emoji}>🌙</Text>
        <Text style={styles.label}>Sleep coach</Text>
        <Text style={styles.hint} numberOfLines={2}>
          Log naps, see wake windows
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/memories')}
        style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      >
        <Text style={styles.emoji}>📸</Text>
        <Text style={styles.label}>Memory book</Text>
        <Text style={styles.hint} numberOfLines={2}>
          Photos, voice clips, moments
        </Text>
      </Pressable>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  tile: {
    flex: 1,
    gap: 2,
    backgroundColor: 'rgba(215,230,225,0.12)',
    borderWidth: 1,
    borderColor: colors.sleepBorder,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  emoji: { fontSize: 26 },
  label: { marginTop: 4, fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: colors.foam },
  hint: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 18, color: colors.mist },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});
