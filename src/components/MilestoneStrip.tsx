import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/constants/theme';
import { domainInfo, focusMilestones, type MilestoneDomain } from '@/data/milestones';
import { useBabyProfile } from '@/hooks/useBabyProfile';

export function MilestoneStrip({ domain }: { domain: MilestoneDomain }) {
  const router = useRouter();
  const { profile, ageMonths, ageLabel, ready, toggleMilestone } = useBabyProfile();
  const info = domainInfo[domain];

  if (!ready) return null;

  if (!profile.configured) {
    return (
      <Pressable onPress={() => router.push('/profile')} style={styles.panel} accessibilityRole="button">
        <Text style={styles.title}>
          {info.emoji} Track {info.label.toLowerCase()} milestones
        </Text>
        <Text style={styles.body}>Add your baby’s age to see what to watch for and check milestones off.</Text>
        <Text style={styles.link}>Set up baby profile →</Text>
      </Pressable>
    );
  }

  const open = focusMilestones(ageMonths, profile.achieved, domain, 4);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>
        {info.emoji} {info.label} milestones · {ageLabel}
      </Text>
      {open.length === 0 ? (
        <Text style={styles.body}>
          Nothing left to watch for right now. Nice work noticing every one. More will show up as your baby grows.
        </Text>
      ) : (
        open.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: false }}
            onPress={() => toggleMilestone(item.id)}
            style={styles.row}
          >
            <View style={styles.box} />
            <View style={styles.flex}>
              <Text style={styles.rowText}>{item.text}</Text>
              <Text style={styles.rowMeta}>Typically by about {item.months} months · tap when you see it</Text>
            </View>
          </Pressable>
        ))
      )}
      <Pressable onPress={() => router.push('/milestones')} hitSlop={8}>
        <Text style={styles.link}>Open full milestone tracker →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.sm,
    backgroundColor: 'rgba(230,201,106,0.14)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(230,201,106,0.4)',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  flex: { flex: 1 },
  title: { fontFamily: 'Fraunces_600SemiBold', fontSize: 17, color: colors.foam },
  body: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, color: colors.mist },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.butter,
  },
  rowText: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, lineHeight: 20, color: colors.foam },
  rowMeta: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: colors.mist },
  link: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.butter },
});
