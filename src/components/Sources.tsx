import { Linking, Pressable, Text, View } from 'react-native';
import { Body } from '@/components/ui';
import { colors } from '@/constants/theme';
import { sources } from '@/data/sickGuide';

export function SourceTags({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <Text style={{ fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: colors.mist, opacity: 0.8 }}>
      Source: {ids.map((id) => sources[id]?.org.split(' (')[0]).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
    </Text>
  );
}

export function SourceList({ ids }: { ids: string[] }) {
  const list = ids.map((id) => sources[id]).filter(Boolean);
  return (
    <View style={{ gap: 8 }}>
      {list.map((s) => (
        <Pressable
          key={s.id}
          accessibilityRole="link"
          accessibilityLabel={`${s.org}: ${s.title}`}
          onPress={() => Linking.openURL(s.url).catch(() => {})}
        >
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.butter }}>{s.title}</Text>
          <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 13, color: colors.mist }}>{s.org}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function BulletItem({ text, src }: { text: string; src?: string[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Text style={{ color: colors.butter }}>•</Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Body>{text}</Body>
        {src ? <SourceTags ids={src} /> : null}
      </View>
    </View>
  );
}
