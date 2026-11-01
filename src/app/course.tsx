import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, Share, Switch, Text, View } from 'react-native';
import { Body, Btn, Chip, Field, Notice, Panel, ProgressBar, Screen, Section, Title, uiStyles } from '@/components/ui';
import { colors } from '@/constants/theme';
import { courseDisclaimer, courseRules, courseSidePrompts } from '@/data/courses';
import { sickDisclaimer } from '@/data/sickGuide';
import { useBabyProfile } from '@/hooks/useBabyProfile';
import { useCourses } from '@/hooks/useCourses';
import { courseHtml } from '@/lib/courseExport';
import { asNeededLabel, courseState, courseSummary, doseWarnings, scheduleLabel } from '@/lib/courseLogic';
import { exportHtmlAsPdf } from '@/lib/pdf';
import { nowMs, useNow } from '@/lib/time';
import { ensureNotificationPermission, remindersSupported } from '@/lib/reminders';

function when(ts: number) {
  return new Date(ts).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function left(ms: number) {
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 48) return `${h} h ${mins % 60} min`;
  return `${Math.floor(h / 24)} days`;
}

export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile, ageMonths } = useBabyProfile();
  const hook = useCourses();
  const course = hook.courses.find((c) => c.id === id);
  const now = useNow();
  const [logging, setLogging] = useState(false);
  const [chosenBy, setBy] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [vomited, setVomited] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [exportText, setExportText] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);
  const [vomitAlert, setVomitAlert] = useState(false);

  if (!course) {
    return (
      <Screen gradient={['#1E2F33', '#26474A', '#2F5E55']} back="← Medicine log" backTo="/sick-meds">
        <Title>{hook.ready ? 'Medicine not found' : 'Loading…'}</Title>
        {hook.ready ? <Btn label="Back to medicine log" onPress={() => router.replace('/sick-meds')} /> : null}
      </Screen>
    );
  }

  const state = courseState(course, now);
  const asNeeded = course.mode === 'asNeeded';
  const warnings = logging ? doseWarnings(course, now) : [];
  const history = [...course.log].sort((a, b) => b.at - a.at);
  const remaining = state.total - state.given - state.skipped;
  const by = chosenBy ?? hook.caregivers[0] ?? '';
  const who = newName.trim() || by;

  const confirmLog = () => {
    const name = (newName.trim() || by).trim();
    hook.logDose(course.id, name, vomited);
    setLogging(false);
    setNewName('');
    if (vomited) setVomitAlert(true);
    setVomited(false);
    setMessage(null);
  };

  const toggleRemind = async (value: boolean) => {
    if (value && remindersSupported) {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        setMessage('Notifications are off for Lulla. Turn them on in your phone settings to get reminders.');
        return;
      }
    }
    setMessage(null);
    hook.setRemind(course.id, value);
  };

  const share = async () => {
    const text = courseSummary(course, nowMs());
    setExportText(text);
    if (Platform.OS !== 'web') {
      try {
        await Share.share({ message: text, title: `${course.medName} course record` });
      } catch {
        // text stays visible
      }
    }
  };

  const pdf = async () => {
    const result = await exportHtmlAsPdf(courseHtml(course, profile.name.trim(), nowMs()), `${course.medName} course record`);
    setMessage(result.ok ? null : (result.message ?? null));
  };

  return (
    <Screen gradient={['#1E2F33', '#26474A', '#2F5E55']} back="← Medicine log" backTo="/sick-meds">
      <Title sub={`As written on the label: ${course.doseText}`}>{course.medName}</Title>
      <Body tone="muted">{asNeeded ? asNeededLabel(course) : scheduleLabel(course.schedule)}</Body>

      {asNeeded && ageMonths < 3 ? (
        <Notice tone="danger" title="Under 3 months">
          Call your pediatrician before giving any medicine to a baby this young, including for fever.
        </Notice>
      ) : null}

      <Notice tone="danger" title={asNeeded ? 'Check the label every time' : 'Missed a dose or vomited?'}>
        {asNeeded
          ? 'Lulla only compares your log with the waiting time you typed from the label. It does not know your baby’s weight, age, or other medicines. Confirm with your pharmacist or pediatrician if you are unsure.'
          : 'Call your pharmacist or pediatrician before giving another dose. Follow the label and their advice.'}
      </Notice>

      {vomitAlert ? (
        <Notice tone="warn" title="Vomited after the dose">
          Call your pharmacist or pediatrician now and ask what to do. Do not repeat the dose unless they tell you to.
        </Notice>
      ) : null}

      {asNeeded ? (
        <Panel>
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.mist }}>LAST GIVEN</Text>
          <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: colors.foam }}>
            {state.lastGivenAt ? when(state.lastGivenAt) : 'Nothing logged yet'}
          </Text>
          {state.lastGivenAt ? <Body tone="muted">{left(now - state.lastGivenAt)} ago · {history[0]?.by || 'caregiver not noted'}</Body> : null}
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.mist, marginTop: 6 }}>NEXT ALLOWED AT</Text>
          <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 24, color: state.allowedNow ? colors.butter : colors.blush }}>
            {state.nextAllowedAt === null ? 'Any time, per the label' : state.allowedNow ? 'Now' : when(state.nextAllowedAt)}
          </Text>
          <Body tone="muted">
            {state.nextAllowedAt !== null && !state.allowedNow
              ? `In ${left(state.nextAllowedAt - now)}, based on the ${course.schedule.kind === 'interval' ? course.schedule.hours : ''} hour wait you entered.`
              : 'Based on the waiting time you entered from the label.'}
            {course.maxPer24 ? ` ${state.count24} of ${course.maxPer24} doses logged in the last 24 hours.` : ` ${state.count24} dose${state.count24 === 1 ? '' : 's'} logged in the last 24 hours.`}
          </Body>
          {state.stopped ? <Body tone="warn">You stopped tracking this medicine.</Body> : null}
        </Panel>
      ) : (
      <Panel>
        <View style={uiStyles.between}>
          <Text style={{ fontFamily: 'Fraunces_700Bold', fontSize: 26, color: colors.butter }}>
            {state.stopped ? 'Stopped' : state.finished ? 'Course complete' : `Day ${state.dayNumber} of ${course.days}`}
          </Text>
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.mist }}>
            {state.given} of {state.total} doses
          </Text>
        </View>
        <ProgressBar value={state.total ? (state.given + state.skipped) / state.total : 0} />
        {state.finished ? (
          <Body>
            {state.stopped
              ? 'You marked this course as stopped.'
              : remaining <= 0
                ? 'Every scheduled dose is accounted for. Follow up with your doctor as they advised.'
                : `The scheduled time has ended with ${remaining} dose${remaining === 1 ? '' : 's'} not logged. Ask your pharmacist or pediatrician what to do.`}
          </Body>
        ) : (
          <>
            <Body>
              {remaining} dose{remaining === 1 ? '' : 's'} left · last dose around {when(state.endsAt)} · about {left(state.endsAt - now)} to finish.
            </Body>
            <Body tone="muted">Finish the full course unless your doctor tells you to stop.</Body>
          </>
        )}
      </Panel>
      )}

      {!state.finished ? (
        <Panel>
          {!asNeeded ? (
            <>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 19, color: colors.foam }}>
                {state.nextAt ? (state.due ? 'Dose due now' : 'Next dose') : 'No dose scheduled right now'}
              </Text>
              {state.nextAt ? <Body>{when(state.nextAt)}{state.due ? '' : ` · in ${left(state.nextAt - now)}`}</Body> : null}
            </>
          ) : null}

          {!logging ? (
            <Btn label={asNeeded ? 'I gave this medicine' : 'I gave a dose'} onPress={() => setLogging(true)} />
          ) : (
            <View style={{ gap: 10 }}>
              {warnings.map((w) => (
                <Notice key={w.message} tone={w.level === 'danger' ? 'danger' : 'warn'} title={w.level === 'danger' ? 'Possible double dose' : 'Check first'}>
                  {w.message} If you are not sure, call your pharmacist or pediatrician before giving it.
                </Notice>
              ))}
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: colors.foam }}>Who gave it?</Text>
              <View style={uiStyles.wrap}>
                {hook.caregivers.map((c) => (
                  <Chip key={c} label={c} selected={by === c && !newName.trim()} onPress={() => { setBy(c); setNewName(''); }} />
                ))}
              </View>
              <Field
                label={hook.caregivers.length ? 'Someone else' : 'Name (for example Mom, Dad, Grandma)'}
                value={newName}
                onChangeText={setNewName}
                maxLength={20}
                placeholder="Type a name"
              />
              <View style={uiStyles.row}>
                <View style={uiStyles.flex}>
                  <Body>Baby vomited after this dose</Body>
                </View>
                <Switch
                  accessibilityLabel="Baby vomited after this dose"
                  value={vomited}
                  onValueChange={setVomited}
                  trackColor={{ true: colors.butter, false: 'rgba(255,255,255,0.2)' }}
                />
              </View>
              <View style={uiStyles.row}>
                <Btn label="Cancel" kind="secondary" onPress={() => { setLogging(false); setVomited(false); }} style={uiStyles.flex} />
                <Btn
                  label={warnings.some((w) => w.level === 'danger') ? 'Log it anyway' : 'Log dose'}
                  kind={warnings.some((w) => w.level === 'danger') ? 'danger' : 'primary'}
                  onPress={confirmLog}
                  style={{ flex: 1.4 }}
                />
              </View>
              <Body tone="muted">Logging records what you gave{who ? ` (${who})` : ''}. It does not check that the amount was right.</Body>
            </View>
          )}
        </Panel>
      ) : null}

      {!asNeeded && state.missed.length > 0 ? (
        <>
          <Section>Missed doses</Section>
          <Panel>
            <Body tone="warn">
              These scheduled doses have no log. Call your pharmacist or pediatrician about what to do. Don’t give extra to catch up unless they say so.
            </Body>
            {state.missed.map((i) => (
              <View key={i} style={{ gap: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 8 }}>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.blush }}>⚑ Missed: {when(state.slots[i])}</Text>
                <View style={uiStyles.row}>
                  <Btn label="I gave it late" kind="secondary" small onPress={() => hook.logLate(course.id, i, who)} style={uiStyles.flex} />
                  <Btn label="Mark as skipped" kind="secondary" small onPress={() => hook.skipSlot(course.id, i)} style={uiStyles.flex} />
                </View>
              </View>
            ))}
          </Panel>
        </>
      ) : null}

      <Section>Dose log</Section>
      <Panel>
        {history.length === 0 ? <Body tone="muted">No doses logged yet.</Body> : null}
        {history.map((l) => (
          <View key={l.id} style={{ gap: 4, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 8 }}>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: colors.foam }}>
              {when(l.at)} · {l.by || 'not noted'}
            </Text>
            <Body tone="muted">
              {[l.slot === null && !asNeeded ? 'Unscheduled dose' : '', l.early ? 'Earlier than scheduled' : '', l.vomited ? 'Vomited after dose' : ''].filter(Boolean).join(' · ') || 'On schedule'}
            </Body>
            <View style={uiStyles.row}>
              {!l.vomited ? <Btn label="Vomited after" kind="ghost" small onPress={() => { hook.markVomited(course.id, l.id); setVomitAlert(true); }} /> : null}
              <Btn label="Delete entry" kind="ghost" small onPress={() => hook.removeDose(course.id, l.id)} />
            </View>
          </View>
        ))}
      </Panel>

      <Section>Side effects and notes</Section>
      <Panel>
        <View style={uiStyles.wrap}>
          {courseSidePrompts.map((p) => (
            <Chip key={p} label={p} onPress={() => setNoteText((t) => (t ? `${t}, ${p.toLowerCase()}` : p))} />
          ))}
        </View>
        <Field label="What did you notice?" value={noteText} onChangeText={setNoteText} multiline maxLength={240} placeholder="For example: loose stools after the evening dose" />
        <Btn label="Save note" kind="secondary" small disabled={!noteText.trim()} onPress={() => { hook.addNote(course.id, noteText); setNoteText(''); }} />
        {course.notes.map((n) => (
          <View key={n.id} style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 8, gap: 2 }}>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 13, color: colors.mist }}>{when(n.at)}</Text>
            <Body>{n.text}</Body>
            <Btn label="Delete note" kind="ghost" small onPress={() => hook.removeNote(course.id, n.id)} />
          </View>
        ))}
        <Body tone="muted">Call your doctor about anything that worries you, especially a rash, trouble breathing, or severe diarrhea.</Body>
      </Panel>

      <Section>Reminders</Section>
      <Panel>
        <View style={uiStyles.row}>
          <View style={uiStyles.flex}>
            <Body>{asNeeded ? 'Remind me when the next dose is allowed' : 'Remind me at each dose time'}{remindersSupported ? '' : ' (iPhone app only)'}</Body>
          </View>
          <Switch
            accessibilityLabel="Reminders"
            value={course.remind}
            onValueChange={toggleRemind}
            trackColor={{ true: colors.butter, false: 'rgba(255,255,255,0.2)' }}
          />
        </View>
        <Body tone="muted">Reminders say “Medicine reminder” only, so the medicine name never appears on your lock screen.</Body>
      </Panel>

      <Section>Share with your doctor</Section>
      <Panel>
        <Body>Send the dose log, missed doses, and side-effect notes as text or a PDF.</Body>
        <View style={uiStyles.row}>
          <Btn label="Share summary" kind="secondary" onPress={share} style={uiStyles.flex} />
          <Btn label="Save as PDF" kind="secondary" onPress={pdf} style={uiStyles.flex} />
        </View>
        {exportText ? <Text selectable style={{ fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 11, color: colors.mist }}>{exportText}</Text> : null}
        {message ? <Body tone="warn">{message}</Body> : null}
      </Panel>

      <Section>Manage</Section>
      <Panel>
        {!state.finished ? (
          !confirmStop ? (
            <Btn label={asNeeded ? 'I’m done tracking this medicine' : 'My doctor told me to stop early'} kind="secondary" onPress={() => setConfirmStop(true)} />
          ) : (
            <View style={{ gap: 8 }}>
              <Body>{asNeeded ? 'Move this medicine to your finished list? Your log stays saved.' : 'Mark this course as stopped? Only do this if your doctor or pharmacist told you to.'}</Body>
              <View style={uiStyles.row}>
                <Btn label="Keep going" kind="secondary" onPress={() => setConfirmStop(false)} style={uiStyles.flex} />
                 <Btn label={asNeeded ? 'Move to finished' : 'Mark stopped'} onPress={() => { hook.stopCourse(course.id); setConfirmStop(false); }} style={uiStyles.flex} />
              </View>
            </View>
          )
        ) : null}
        {!confirmDelete ? (
          <Btn label={asNeeded ? 'Delete this medicine' : 'Delete this course'} kind="ghost" onPress={() => setConfirmDelete(true)} />
        ) : (
          <View style={{ gap: 8 }}>
            <Body tone="warn">Delete this course and its log from your phone? It can’t be undone.</Body>
            <View style={uiStyles.row}>
              <Btn label="Cancel" kind="secondary" onPress={() => setConfirmDelete(false)} style={uiStyles.flex} />
              <Btn label="Delete" kind="danger" onPress={() => { hook.remove(course.id); router.replace('/sick-meds'); }} style={uiStyles.flex} />
            </View>
          </View>
        )}
      </Panel>

      <Notice tone="info" title="Important">
        {asNeeded ? sickDisclaimer : courseDisclaimer}
      </Notice>
      <Panel>
        {courseRules.map((r) => (
          <Body key={r} tone="muted">• {r}</Body>
        ))}
      </Panel>
    </Screen>
  );
}
