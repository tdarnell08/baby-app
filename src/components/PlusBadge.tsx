import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '@/constants/theme';

export function PlusBadge({ dark = false }: { dark?: boolean }) {
  return (
    <View style={[styles.pill, dark && styles.pillDark]}>
      <Text style={[styles.text, dark && styles.textDark]}>Plus</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.butter,
    borderRadius: radii.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  pillDark: { backgroundColor: colors.ink },
  text: { fontFamily: 'Nunito_700Bold', fontSize: 11, letterSpacing: 0.5, color: colors.ink },
  textDark: { color: colors.butter },
});
