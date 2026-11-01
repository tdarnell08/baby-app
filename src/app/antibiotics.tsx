import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { Body, Btn, Notice, Panel, ProgressBar, Screen, Section, Title } from '@/components/ui';
import { colors } from '@/constants/theme';
import { courseDisclaimer, courseRules } from '@/data/courses';
import { useCourses } from '@/hooks/useCourses';
import { courseState, scheduleLabel } from '@/lib/courseLogic';
import { useNow } from '@/lib/time';

function when(ts: number) {
  return new Date(ts).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' });
}

export default function AntibioticsScreen() {
  const router = useRouter();
  const { courses, ready } = useCourses();
  const now = useNow();
  const rows = courses.map((c) => ({ course: c, state: courseState(c, now) }));
  const active = rows.filter((r) => !r.state.finished);
  const past = rows.filter((r) => r.state.finished);

  const open = (id: string) => router.push({ pathname: '/course', params: { id } });

  return (
    <Screen gradient={['#1E2F33', '#26474A', '#2F5E55']}>
      <Title sub="Keep track of every dose of a prescribed course, from the first to the last.">Antibiotic course tracker</Title>

      <Notice tone="warn" title="Tracker only">
        {courseDisclaimer}
      </Notice>

      <Btn label="Add a medicine course" onPress={() => router.push('/course-new')} />

      <Section>Active</Section>
      {active.length === 0 ? (
        <Panel>
          <Body>{ready ? 'No active courses. Add one when your baby is prescribed a medicine with a set schedule.' : 'Loading…'}</Body>
        </Panel>
      ) : (
        active.map(({ course, state }) => (
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
              <Body tone={state.due ? 'good' : 'normal'}>
                {state.due ? 'Dose due now' : `Next dose ${when(state.nextAt)}`}
              </Body>
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
                {state.given} of {state.total} doses logged{state.stopped ? ' · stopped early' : ''} · ended {new Date(state.stopped ? (course.stoppedAt as number) : state.endsAt).toLocaleDateString()}
              </Body>
              <Btn label="View or export" kind="secondary" small onPress={() => open(course.id)} />
            </Panel>
          ))}
        </>
      ) : null}

      <Section>Safety</Section>
      <Panel>
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
