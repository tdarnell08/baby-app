import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Body, Btn, Notice, Panel, ProgressBar, Screen, Section, Title } from '@/components/ui';
import { colors } from '@/constants/theme';
import { courseDisclaimer, courseRules } from '@/data/courses';
import { sickDisclaimer } from '@/data/sickGuide';
import { useCourses } from '@/hooks/useCourses';
import { asNeededLabel, courseState, scheduleLabel } from '@/lib/courseLogic';
import { useNow } from '@/lib/time';

const GRADIENT: [string, string, string] = ['#2B2437', '#3B3150', '#4A3D63'];

function when(ts: number) {
  return new Date(ts).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' });
}

export default function MedicineLogScreen() {
  const router = useRouter();
  const { courses, ready } = useCourses();
  const now = useNow();
  const rows = courses.map((c) => ({ course: c, state: courseState(c, now) }));
  const asNeeded = rows.filter((r) => r.course.mode === 'asNeeded' && !r.state.finished);
  const scheduled = rows.filter((r) => r.course.mode !== 'asNeeded' && !r.state.finished);
  const past = rows.filter((r) => r.state.finished);

  const open = (id: string) => router.push({ pathname: '/course', params: { id } });

  return (
    <Screen gradient={GRADIENT} back="← Sick Day" backTo="/sick">
      <Title sub="Fever reducers, antibiotics, and anything else you give. Every entry comes from the label.">Medicine log</Title>

      <Notice tone="warn" title="A log, not a dosing tool">
        {sickDisclaimer}
      </Notice>

      <View style={{ gap: 10 }}>
        <Btn label="Add a medicine" onPress={() => router.push({ pathname: '/course-new', params: { mode: 'asNeeded' } })} />
        <Btn label="Add an antibiotic course" kind="secondary" onPress={() => router.push({ pathname: '/course-new', params: { mode: 'course' } })} />
      </View>

      <Section>As needed (fever reducers and similar)</Section>
      {asNeeded.length === 0 ? (
        <Panel>
          <Body>{ready ? 'Nothing here yet. Add a medicine to log doses and see when the next one is allowed, using the waiting time printed on its label.' : 'Loading…'}</Body>
        </Panel>
      ) : (
        asNeeded.map(({ course, state }) => (
          <Panel key={course.id}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 21, color: colors.foam }}>{course.medName}</Text>
            <Body>Label dose: {course.doseText}</Body>
            <Body tone="muted">{asNeededLabel(course)}</Body>
            <Body>
              Last given: {state.lastGivenAt ? when(state.lastGivenAt) : 'not yet'}
            </Body>
            <Body tone={state.allowedNow ? 'good' : 'warn'}>
              {state.nextAllowedAt === null ? 'Next allowed: any time, per the label' : state.allowedNow ? 'Next allowed: now' : `Next allowed at ${when(state.nextAllowedAt)}`}
            </Body>
            <Btn label="Open and log a dose" kind="secondary" small onPress={() => open(course.id)} />
          </Panel>
        ))
      )}

      <Section>Antibiotic and other courses</Section>
      {scheduled.length === 0 ? (
        <Panel>
          <Body>{ready ? 'No active courses. Add one when your baby is prescribed a medicine with a set schedule.' : 'Loading…'}</Body>
        </Panel>
      ) : (
        scheduled.map(({ course, state }) => (
          <Panel key={course.id}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 21, color: colors.foam }}>{course.medName}</Text>
            <Body>
              Label dose: {course.doseText} · {scheduleLabel(course.schedule)}
            </Body>
            <ProgressBar value={state.total ? (state.given + state.skipped) / state.total : 0} />
            <Body tone="muted">
              Day {state.dayNumber} of {course.days} · {state.given} of {state.total} doses logged
            </Body>
            {state.missed.length > 0 ? (
              <Body tone="warn">
                {state.missed.length} missed dose{state.missed.length === 1 ? '' : 's'}. Call your pharmacist or pediatrician.
              </Body>
            ) : state.nextAt ? (
              <Body tone={state.due ? 'good' : 'normal'}>{state.due ? 'Dose due now' : `Next dose ${when(state.nextAt)}`}</Body>
            ) : null}
            <Btn label="Open" kind="secondary" small onPress={() => open(course.id)} />
          </Panel>
        ))
      )}

      {past.length > 0 ? (
        <>
          <Section>Finished</Section>
          {past.map(({ course, state }) => (
            <Panel key={course.id}>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: colors.foam }}>{course.medName}</Text>
              <Body tone="muted">
                {course.mode === 'asNeeded'
                  ? `${course.log.length} dose${course.log.length === 1 ? '' : 's'} logged`
                  : `${state.given} of ${state.total} doses logged${state.stopped ? ' · stopped early' : ''}`}
                {' · '}ended {new Date(state.stopped ? (course.stoppedAt as number) : state.endsAt).toLocaleDateString()}
              </Body>
              <Btn label="View or export" kind="secondary" small onPress={() => open(course.id)} />
            </Panel>
          ))}
        </>
      ) : null}

      <Section>Safety</Section>
      <Panel>
        <Body tone="muted">{courseDisclaimer}</Body>
        {courseRules.map((rule) => (
          <View key={rule} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ color: colors.butter }}>•</Text>
            <View style={{ flex: 1 }}>
              <Body>{rule}</Body>
            </View>
          </View>
        ))}
      </Panel>
    </Screen>
  );
}
