import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '@/constants/theme';
import { legalDocs, type LegalDocId } from '@/data/legal';

const ids = Object.keys(legalDocs) as LegalDocId[];

export default function LegalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const id = ids.find((x) => x === doc) ?? 'privacy';
  const current = legalDocs[id];

  return (
    <LinearGradient colors={['#1E3144', '#27475A', '#2F5F5C']} style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          <Pressable hitSlop={12} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
            <Text style={styles.back}>← Back</Text>
          </Pressable>

          <View style={styles.tabs}>
            {ids.map((x) => (
              <Pressable
                key={x}
                accessibilityRole="tab"
                accessibilityState={{ selected: x === id }}
                onPress={() => router.setParams({ doc: x })}
                style={[styles.tab, x === id && styles.tabOn]}
              >
                <Text style={[styles.tabText, x === id && styles.tabTextOn]}>{legalDocs[x].title.replace(' Policy', '').replace(' of Use', '')}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.updated}>Last updated {current.updated}</Text>
          <Text style={styles.intro}>{current.intro}</Text>

          {current.sections.map((section) => (
            <View key={section.heading} style={styles.section}>
              <Text style={styles.heading}>{section.heading}</Text>
              {section.body.map((paragraph) => (
                <Text key={paragraph} style={styles.body}>
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  column: { width: '100%', maxWidth: 480 },
  back: { fontFamily: 'Nunito_600SemiBold', color: colors.mist, fontSize: 15, marginBottom: spacing.sm },
  tabs: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginBottom: spacing.md },
  tab: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  tabOn: { backgroundColor: colors.butter, borderColor: colors.butter },
  tabText: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: colors.foam },
  tabTextOn: { color: colors.ink },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 32, color: colors.foam },
  updated: { fontFamily: 'Nunito_400Regular', fontSize: 12, color: colors.mist, marginBottom: spacing.sm },
  intro: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, lineHeight: 22, color: colors.foam },
  section: { marginTop: spacing.lg, gap: spacing.sm },
  heading: { fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: colors.butter },
  body: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 21, color: colors.mist },
});
