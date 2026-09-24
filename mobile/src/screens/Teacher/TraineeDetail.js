// Supervisor: one trainee's hours, attendance, reports, and evaluation.
import React, { useCallback, useState } from 'react';
import { ActionSheetIOS, Alert, Platform, View } from 'react-native';
import { format } from 'date-fns';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useTraineeStore from '@/store/useTraineeStore';
import Avatar from '@/components/Avatar';
import { Badge, Button, Card, Empty, Loading, ProgressBar, Row, Screen, Section, T, colors, space } from '@/ui';

const toHours = (text) => {
  const m = String(text || '').match(/(\d+)h\s*(\d+)m/);
  return m ? Number(m[1]) + Number(m[2]) / 60 : 0;
};
const short = (d) => (d ? String(d).replace(/\s*\d+s$/, '') : '0h 0m');

export default function TraineeDetailsScreen({ route }) {
  const navigation = useNavigation();
  const { getTraineeDataById } = useTraineeStore();
  const { item } = route.params;
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await getTraineeDataById(item?.trainee_id);
    setData(res || {});
  }, [getTraineeDataById, item?.trainee_id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const evaluate = () => {
    const params = { traineeId: item?.trainee_id, traineeName: data?.trainee?.trainee_name };
    const options = ['Midterm / final evaluation', 'Evaluation form', 'Cancel'];
    const go = (i) => {
      if (i === 0) navigation.navigate('SupervisorEvaluation', params);
      if (i === 1) navigation.navigate('EvaluationPage', params);
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({ options, cancelButtonIndex: 2, title: 'Evaluate trainee' }, go);
    } else {
      Alert.alert('Evaluate trainee', 'Which evaluation do you want to fill out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Evaluation form', onPress: () => go(1) },
        { text: 'Midterm / final', onPress: () => go(0) },
      ]);
    }
  };

  if (!data) return <Loading />;

  const t = data.trainee || {};
  const name = t.trainee_name || item?.trainee_name || 'Trainee';
  const done = toHours(data.total_hours);
  const required = Number(t.ojt_required_hours) || 0;
  const present = data.total_present || 0;
  const absent = data.total_absent || 0;
  const rate = present + absent > 0 ? Math.round((present / (present + absent)) * 100) : null;
  const recentDays = (data.attendance || []).slice(0, 5);
  const reports = data.reports || [];

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, marginBottom: space.xl }}>
        <Avatar uri={t.avatar_url} name={name} size={56} />
        <View style={{ flex: 1 }}>
          <T v="heading" numberOfLines={1}>{name}</T>
          {t.email ? <T v="caption" numberOfLines={1}>{t.email}</T> : null}
          {t.course || t.company ? <T v="caption" numberOfLines={1}>{[t.course, t.company].filter(Boolean).join(' · ')}</T> : null}
        </View>
      </Card>

      <Section title="Progress">
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <T v="display" style={{ fontVariant: ['tabular-nums'] }}>{short(data.total_hours)}</T>
            {required ? <T v="caption">of {required} hours</T> : null}
          </View>
          {required ? <ProgressBar value={(done / required) * 100} tone={colors.success} style={{ marginTop: space.md }} /> : null}
          <View style={{ flexDirection: 'row', marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: colors.divider }}>
            <Stat value={present} label="Present" />
            <Stat value={absent} label="Absent" />
            <Stat value={rate === null ? '—' : `${rate}%`} label="Attendance" />
          </View>
          {t.started_at ? (
            <T v="caption" style={{ marginTop: space.md }}>
              Started {format(new Date(String(t.started_at).replace(' ', 'T')), 'MMMM d, yyyy')}
            </T>
          ) : null}
        </Card>
      </Section>

      <Section title="Recent attendance">
        <Card padded={false}>
          {recentDays.length === 0 ? (
            <Empty icon="calendar-outline" title="No attendance yet" text="Scan their QR code to record a time-in." />
          ) : (
            recentDays.map((d, i) => (
              <Row
                key={d.id}
                title={d.date}
                subtitle={d.status === 2 || !d.time_in ? 'No time-in' : d.time_out ? `${d.time_in} – ${d.time_out}` : `In ${d.time_in}`}
                right={
                  d.status === 2 || !d.time_in ? <Badge tone="danger">Absent</Badge> : d.time_out ? <Badge tone="success">Present</Badge> : <Badge tone="primary">In</Badge>
                }
                last={i === recentDays.length - 1}
              />
            ))
          )}
        </Card>
      </Section>

      <Section title={`Reports${reports.length ? ` · ${reports.length}` : ''}`}>
        <Card padded={false}>
          {reports.length === 0 ? (
            <Empty icon="document-text-outline" title="No reports yet" text="Reports this trainee submits appear here." />
          ) : (
            reports.slice(0, 10).map((r, i) => (
              <Row
                key={r.id}
                title={r.title}
                subtitle={r.date ? format(new Date(String(r.date).slice(0, 10) + 'T00:00:00'), 'EEE, MMM d') : undefined}
                onPress={() => navigation.navigate('ReportDetails', { report: r })}
                last={i === Math.min(reports.length, 10) - 1}
              />
            ))
          )}
        </Card>
      </Section>

      <Button title="Evaluate trainee" icon="clipboard-outline" onPress={evaluate} />
    </Screen>
  );
}

function Stat({ value, label }) {
  return (
    <View style={{ flex: 1 }}>
      <T v="title" style={{ fontVariant: ['tabular-nums'] }}>{value}</T>
      <T v="caption">{label}</T>
    </View>
  );
}
