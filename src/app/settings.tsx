import { useState } from 'react';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking, Platform, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { config } from '@/config';
import { colors, radii, spacing } from '@/constants/theme';
import type { LegalDocId } from '@/data/legal';
import { buildExport, deleteEverything } from '@/lib/dataControls';
import { useAppLock } from '@/providers/LockProvider';
import { usePremium } from '@/providers/PremiumProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium, mode, restore } = usePremium();
  const lock = useAppLock();
  const [lockNote, setLockNote] = useState<string | null>(null);
  const [exportText, setExportText] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [restoreNote, setRestoreNote] = useState<string | null>(null);

  const openLegal = (doc: LegalDocId) => router.push({ pathname: '/legal', params: { doc } });

  const toggleLock = async (next: boolean) => {
    setLockNote(null);
    const ok = await lock.setEnabled(next);
    if (!ok && next) setLockNote('App lock was not turned on. Authentication is needed to enable it.');
  };

  const doExport = async () => {
    const text = await buildExport();
    setExportText(text);
    if (Platform.OS !== 'web') {
      try {
        await Share.share({ message: text, title: 'Lulla data export' });
      } catch {
        // the text stays visible below so it can still be copied
      }
    }
  };

  const doDelete = async () => {
    await lock.setEnabled(false);
    await deleteEverything();
    setConfirming(false);
    setExportText(null);
    setDeleted(true);
  };

  const doRestore = async () => {
    const outcome = await restore();
    setRestoreNote(outcome.ok ? 'Your Lulla Plus purchase has been restored.' : (outcome.message ?? 'Nothing to restore.'));
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

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
          <Pressable hitSlop={12} onPress={() => router.push('/')}>
            <Text style={styles.back}>← Home</Text>
          </Pressable>
          <Text style={styles.title}>Settings</Text>

          <Text style={styles.section}>Lulla Plus</Text>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{isPremium ? 'You have Lulla Plus ✓' : 'Free plan'}</Text>
            <Text style={styles.body}>
              {isPremium
                ? 'Sleep predictions and charts, unlimited memories and keepsake PDFs, every sound and word, and personalization are unlocked.'
                : 'Upgrade for sleep predictions and charts, unlimited memories with keepsake PDFs, all 20 sounds, all words, and personalized plans.'}
            </Text>
            <Row label={isPremium ? 'Manage Lulla Plus' : 'See Lulla Plus'} onPress={() => router.push('/paywall')} />
            {mode !== 'unavailable' ? <Row label="Restore purchases" onPress={doRestore} /> : null}
            {restoreNote ? <Text style={styles.note}>{restoreNote}</Text> : null}
          </View>

          <Text style={styles.section}>Privacy and security</Text>
          <View style={styles.panel}>
            <View style={styles.switchRow}>
              <View style={styles.flex}>
                <Text style={styles.rowLabel}>App lock</Text>
                <Text style={styles.body}>
                  {Platform.OS === 'web'
                    ? 'Available in the iPhone app. Uses Face ID, Touch ID, or your passcode.'
                    : lock.supported
                      ? 'Ask for Face ID, Touch ID, or your passcode when opening Lulla.'
                      : 'Set up Face ID or a device passcode in your phone settings to use app lock.'}
                </Text>
              </View>
              <Switch
                accessibilityLabel="App lock"
                value={lock.enabled}
                disabled={!lock.supported}
                onValueChange={toggleLock}
                trackColor={{ true: colors.butter, false: 'rgba(255,255,255,0.2)' }}
              />
            </View>
            {lockNote ? <Text style={styles.warn}>{lockNote}</Text> : null}

            <Text style={styles.body}>
              Your baby’s information is stored only on this device, in encrypted secure storage. Nothing is uploaded.
            </Text>
            <Row label="Export my data" onPress={doExport} />
            {exportText ? (
              <View style={styles.exportBox}>
                <Text selectable style={styles.exportText}>
                  {exportText}
                </Text>
              </View>
            ) : null}

            {!confirming ? (
              <Row label="Delete all my data" danger onPress={() => setConfirming(true)} />
            ) : (
              <View style={styles.confirm}>
                <Text style={styles.confirmTitle}>Delete everything?</Text>
                <Text style={styles.confirmBody}>
                  This permanently erases your baby profile, milestones, sleep log, medicine courses and dose logs, memories
                  (photos and voice clips), voice recordings, scheduled reminders, and app lock setting from this device. It can’t be undone. Your Lulla Plus purchase is not affected.
                </Text>
                <View style={styles.confirmRow}>
                  <Pressable onPress={() => setConfirming(false)} style={styles.cancelBtn} accessibilityRole="button">
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={doDelete} style={styles.deleteBtn} accessibilityRole="button">
                    <Text style={styles.deleteText}>Delete everything</Text>
                  </Pressable>
                </View>
              </View>
            )}
            {deleted ? <Text style={styles.note}>All of your data has been deleted from this device.</Text> : null}
          </View>

          <Text style={styles.section}>Legal</Text>
          <View style={styles.panel}>
            <Row label="Privacy Policy" onPress={() => openLegal('privacy')} />
            <Row label="Terms of Use" onPress={() => openLegal('terms')} />
            <Row label="Medical Disclaimer" onPress={() => openLegal('medical')} />
            {config.privacyUrl ? <Row label="Privacy Policy on the web" onPress={() => void Linking.openURL(config.privacyUrl)} /> : null}
          </View>

          {config.supportEmail ? (
            <>
              <Text style={styles.section}>Support</Text>
              <View style={styles.panel}>
                <Row label={`Email ${config.supportEmail}`} onPress={() => void Linking.openURL(`mailto:${config.supportEmail}`)} />
              </View>
            </>
          ) : null}

          <Text style={styles.version}>Lulla {version}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function Row({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Text style={[styles.rowLabel, danger && styles.danger]}>{label}</Text>
      <Text style={[styles.chevron, danger && styles.danger]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  column: { width: '100%', maxWidth: 480 },
  flex: { flex: 1 },
  back: { fontFamily: 'Nunito_600SemiBold', color: colors.mist, fontSize: 15, marginBottom: spacing.sm },
  title: { fontFamily: 'Fraunces_700Bold', fontSize: 34, color: colors.foam },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
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
  panelTitle: { fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: colors.foam },
  body: { fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, color: colors.mist },
  note: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: colors.butter },
  warn: { fontFamily: 'Nunito_600SemiBold', fontSize: 13, color: colors.blush },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  rowLabel: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.foam },
  chevron: { fontSize: 22, color: colors.mist },
  danger: { color: colors.blush },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  exportBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radii.sm,
    padding: spacing.sm,
    maxHeight: 260,
    overflow: 'hidden',
  },
  exportText: { fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 11, color: colors.mist },
  confirm: {
    gap: spacing.sm,
    backgroundColor: 'rgba(232,162,154,0.16)',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(232,162,154,0.5)',
    padding: spacing.md,
  },
  confirmTitle: { fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.foam },
  confirmBody: { fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 19, color: colors.mist },
  confirmRow: { flexDirection: 'row', gap: spacing.sm },
  cancelBtn: {
    flex: 1,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.foam },
  deleteBtn: { flex: 1.4, borderRadius: radii.pill, backgroundColor: colors.blush, paddingVertical: 12, alignItems: 'center' },
  deleteText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.ink },
  version: { marginTop: spacing.lg, textAlign: 'center', fontFamily: 'Nunito_400Regular', fontSize: 12, color: 'rgba(247,243,234,0.5)' },
  pressed: { opacity: 0.85 },
});
