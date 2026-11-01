import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing } from '@/constants/theme';

export function Screen({
  gradient,
  children,
  back = '← Home',
  backTo = '/',
}: {
  gradient: [string, string, string];
  children: ReactNode;
  back?: string;
  backTo?: '/' | '/coach' | '/memories' | '/antibiotics' | '/sleep';
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={gradient} style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.column}>
          <Pressable hitSlop={12} onPress={() => router.push(backTo)} accessibilityRole="button">
            <Text style={styles.back}>{back}</Text>
          </Pressable>
          {children}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

export function Title({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.title}>{children}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

export function Section({ children }: { children: ReactNode }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function Body({ children, tone = 'normal' }: { children: ReactNode; tone?: 'normal' | 'muted' | 'warn' | 'good' }) {
  return (
    <Text style={[styles.body, tone === 'muted' && styles.muted, tone === 'warn' && styles.warn, tone === 'good' && styles.good]}>
      {children}
    </Text>
  );
}

export function Notice({ tone, title, children }: { tone: 'info' | 'warn' | 'danger'; title?: string; children: ReactNode }) {
  return (
    <View style={[styles.notice, tone === 'warn' && styles.noticeWarn, tone === 'danger' && styles.noticeDanger]}>
      {title ? <Text style={styles.noticeTitle}>{title}</Text> : null}
      <Text style={styles.noticeBody}>{children}</Text>
    </View>
  );
}

export function Btn({
  label,
  onPress,
  kind = 'primary',
  disabled,
  small,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        kind === 'primary' && styles.btnPrimary,
        kind === 'secondary' && styles.btnSecondary,
        kind === 'danger' && styles.btnDanger,
        kind === 'ghost' && styles.btnGhost,
        disabled && styles.btnDisabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.btnText,
          small && styles.btnTextSmall,
          kind === 'primary' && styles.btnTextPrimary,
          kind === 'danger' && styles.btnTextDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function Stepper({
  label,
  value,
  onMinus,
  onPlus,
  minusDisabled,
  plusDisabled,
}: {
  label: string;
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  minusDisabled?: boolean;
  plusDisabled?: boolean;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepLabel}>{label}</Text>
      <View style={styles.stepControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          disabled={minusDisabled}
          onPress={onMinus}
          style={[styles.stepBtn, minusDisabled && styles.btnDisabled]}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          disabled={plusDisabled}
          onPress={onPlus}
          style={[styles.stepBtn, plusDisabled && styles.btnDisabled]}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="rgba(215,230,225,0.5)"
        {...props}
        style={[styles.input, props.multiline && styles.inputMulti]}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function ProgressBar({ value, color = colors.butter }: { value: number; color?: string }) {
  return (
    <View style={styles.progress} accessibilityRole="progressbar">
      <View style={[styles.progressFill, { width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export const uiStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  flex: { flex: 1 },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  column: { width: '100%', maxWidth: 480, gap: spacing.md },
  back: { fontFamily: 'Nunito_600SemiBold', color: colors.mist, fontSize: 15 },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 34, color: colors.foam },
  sub: { fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 22, color: colors.mist },
  section: {
    marginTop: spacing.sm,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.mist,
  },
  panel: {
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: spacing.md,
  },
  body: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, color: colors.mist },
  muted: { color: 'rgba(215,230,225,0.7)', fontSize: 13 },
  warn: { color: colors.blush, fontFamily: 'Nunito_600SemiBold' },
  good: { color: colors.butter, fontFamily: 'Nunito_600SemiBold' },
  notice: {
    gap: 4,
    backgroundColor: 'rgba(215,230,225,0.1)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(215,230,225,0.28)',
    padding: spacing.md,
  },
  noticeWarn: { backgroundColor: 'rgba(230,201,106,0.14)', borderColor: 'rgba(230,201,106,0.55)' },
  noticeDanger: { backgroundColor: 'rgba(232,162,154,0.18)', borderColor: 'rgba(232,162,154,0.65)' },
  noticeTitle: { fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam },
  noticeBody: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, color: colors.mistSoft },
  btn: {
    borderRadius: radii.pill,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnSmall: { paddingVertical: 9, paddingHorizontal: spacing.md, minHeight: 38 },
  btnPrimary: { backgroundColor: colors.butter },
  btnSecondary: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.06)' },
  btnDanger: { backgroundColor: colors.blush },
  btnGhost: { backgroundColor: 'transparent' },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.foam },
  btnTextSmall: { fontSize: 14 },
  btnTextPrimary: { color: colors.ink },
  btnTextDanger: { color: colors.ink },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  chipOn: { backgroundColor: colors.butter, borderColor: colors.butter },
  chipText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.foam },
  chipTextOn: { color: colors.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  stepLabel: { flex: 1, fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam },
  stepControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  stepBtnText: { fontSize: 22, color: colors.foam, lineHeight: 26 },
  stepValue: { minWidth: 96, textAlign: 'center', fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.foam },
  fieldLabel: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.foam },
  input: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.foam,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
  },
  inputMulti: { minHeight: 84, textAlignVertical: 'top' },
  hint: { fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17, color: 'rgba(215,230,225,0.7)' },
  progress: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
});
