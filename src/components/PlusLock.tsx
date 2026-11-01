import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PlusBadge } from '@/components/PlusBadge';
import { colors, radii, spacing } from '@/constants/theme';

export function PlusLock({ title, body, cta = 'See Lulla Plus' }: { title: string; body: string; cta?: string }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${cta}`}
      onPress={() => router.push('/paywall')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.head}>
        <Text style={styles.title}>{title}</Text>
        <PlusBadge />
      </View>
      <Text style={styles.body}>{body}</Text>
      <Text style={styles.cta}>{cta} ›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    backgroundColor: 'rgba(230,201,106,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(230,201,106,0.5)',
    borderRadius: radii.md,
    padding: spacing.md,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: colors.foam },
  body: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, color: colors.mist },
  cta: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.butter },
  pressed: { opacity: 0.88 },
});
