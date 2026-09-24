// Supervisor home: greeting, getting started, pending requests, today's attendance and manual entry.
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import useTraineeStore from '@/store/useTraineeStore';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import { useAuth } from '@/store/useAuthStore';
import { errorMessage } from '@/lib/api';
import { notify } from '@/lib/notify';
import Avatar from '@/components/Avatar';
import GettingStarted from '@/components/GettingStarted';
import { Button, Card, Empty, Notice, Row, Screen, Section, T, colors, radius, space } from '@/ui';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function TeacherHomeScreen() {
  const navigation = useNavigation();
  const { user, profile, getUserProfile } = useAuth();
  const {
    trainees,
    fetchTrainees,
    traineeRequests,
    fetchTraineeRequests,
    noAttendanceRecords,
    fetchNoAttendanceRecords,
    recordAttendance,
    attendanceRecords,
    fetchAllAttendanceRecords,
  } = useTraineeStore();
  const { attendanceRecordToday, fetchAttendanceRecordToday } = useAttendanceStore();

  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('present');
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    await Promise.all([
      fetchTrainees(),
      fetchTraineeRequests(),
      fetchAttendanceRecordToday(),
      fetchNoAttendanceRecords(),
      fetchAllAttendanceRecords(),
      getUserProfile(),
    ]);
    setLoaded(true);
  }, [fetchTrainees, fetchTraineeRequests, fetchAttendanceRecordToday, fetchNoAttendanceRecords, fetchAllAttendanceRecords, getUserProfile]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const list = Array.isArray(trainees) ? trainees : [];
  const requests = Array.isArray(traineeRequests) ? traineeRequests : [];
  const notYet = Array.isArray(noAttendanceRecords) ? noAttendanceRecords : [];
  const present = attendanceRecordToday?.present ?? 0;
  const absent = attendanceRecordToday?.absent ?? 0;
  const name = profile?.full_name || profile?.complete_name || user?.username || '';
  const hasScanned = Object.keys(attendanceRecords?.attendance ?? {}).length > 0;

  const checklist = [
    { key: 'name', title: 'Add your full name', text: 'Trainees see it when they choose you.', done: !!profile?.full_name, onPress: () => navigation.navigate('EditProfile') },
    { key: 'accept', title: 'Accept your first trainee', text: 'Trainees send you a request from their app.', done: list.length > 0, onPress: () => navigation.navigate('RequestTrainee') },
    { key: 'scan', title: "Scan a trainee's QR code", text: 'This records their time-in.', done: hasScanned, onPress: () => navigation.navigate('ScanQrCode') },
  ];

  const openManual = async () => {
    setSelected(null);
    setStatus('present');
    setManualOpen(true);
    await fetchNoAttendanceRecords();
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await recordAttendance({ studentId: selected.trainee_id, status });
      if (res?.success === false) {
        notify.error('Not recorded', res.message || 'Please try again.');
        return;
      }
      setManualOpen(false);
      notify.success('Attendance recorded', `${selected.trainee_name} marked ${status}.`);
      loadAll();
    } catch (e) {
      notify.error('Not recorded', errorMessage(e, 'Failed to record attendance.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmSave = () => {
    if (status !== 'absent') return save();
    Alert.alert('Mark as absent?', `${selected.trainee_name} will be marked absent for today.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark absent', style: 'destructive', onPress: save },
    ]);
  };

  if (!loaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Screen refreshing={refreshing} onRefresh={onRefresh}>
        <View style={styles.greeting}>
          <View style={{ flex: 1 }}>
            <T v="caption">{format(new Date(), 'EEEE, MMMM d')}</T>
            <T v="title" numberOfLines={1}>{greeting()}{name ? `, ${name.split(' ')[0]}` : ''}</T>
          </View>
          <Pressable onPress={() => navigation.navigate('Profile')} accessibilityLabel="Profile">
            <Avatar uri={profile?.avatar_url} name={name} size={40} />
          </Pressable>
        </View>

        <GettingStarted items={checklist} storageKey={`gettingStarted:${user?.id}`} />

        {requests.length > 0 ? (
          <Card onPress={() => navigation.navigate('RequestTrainee')} style={{ marginBottom: space.xl, flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Ionicons name="person-add-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <T v="bodyStrong">
                {requests.length} {requests.length === 1 ? 'trainee wants' : 'trainees want'} to join
              </T>
              <T v="caption">Review and accept them.</T>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtle} />
          </Card>
        ) : null}

        <Section title="Record attendance">
          <Card>
            <T v="caption" style={{ marginBottom: space.lg }}>
              Scan the QR code on your trainee's phone to record their time-in.
            </T>
            <Button title="Scan QR code" icon="scan-outline" onPress={() => navigation.navigate('ScanQrCode')} />
            <Button title="Enter manually" variant="ghost" onPress={openManual} style={{ marginTop: space.sm }} />
          </Card>
        </Section>

        <Section title="Today">
          <Card padded={false}>
            <View style={styles.stats}>
              <Stat value={present} label="Present" color={colors.success} />
              <View style={styles.statDivider} />
              <Stat value={absent} label="Absent" color={absent ? colors.danger : colors.ink} />
              <View style={styles.statDivider} />
              <Stat value={notYet.length} label="Not yet" />
            </View>
            {notYet.length > 0 ? (
              <View style={{ borderTopWidth: 1, borderTopColor: colors.divider }}>
                <T v="overline" style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>NOT TIMED IN YET</T>
                {notYet.slice(0, 5).map((t, i) => (
                  <Row
                    key={t.trainee_id}
                    left={<Avatar name={t.trainee_name} size={32} />}
                    title={t.trainee_name}
                    last={i === Math.min(notYet.length, 5) - 1}
                  />
                ))}
              </View>
            ) : null}
          </Card>
        </Section>

        <Section title="Your trainees" action={list.length ? 'See all' : undefined} onAction={() => navigation.navigate('Trainee')}>
          <Card padded={false}>
            {list.length === 0 ? (
              <Empty
                icon="people-outline"
                title="No trainees yet"
                text="Trainees choose you as their supervisor in their app. Their requests appear here."
                action={requests.length ? 'Review requests' : undefined}
                onAction={() => navigation.navigate('RequestTrainee')}
              />
            ) : (
              list.slice(0, 4).map((t, i) => (
                <Row
                  key={t.trainee_id}
                  left={<Avatar uri={t.avatar_url} name={t.trainee_name} size={36} />}
                  title={t.trainee_name}
                  subtitle={t.course || t.trainee_email}
                  onPress={() => navigation.navigate('TraineeDetails', { item: t })}
                  last={i === Math.min(list.length, 4) - 1}
                />
              ))
            )}
          </Card>
        </Section>
      </Screen>

      {/* Manual entry */}
      <Modal visible={manualOpen} transparent animationType="slide" onRequestClose={() => setManualOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setManualOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <T v="title">Enter attendance manually</T>
            <T v="caption" style={{ marginTop: 2, marginBottom: space.lg }}>
              For trainees who can't show a QR code today.
            </T>

            <View style={styles.segment}>
              {['present', 'absent'].map((s) => (
                <Pressable key={s} onPress={() => setStatus(s)} style={[styles.segmentItem, status === s && styles.segmentActive]}>
                  <T v="bodyStrong" style={{ color: status === s ? colors.ink : colors.muted }}>
                    {s === 'present' ? 'Present' : 'Absent'}
                  </T>
                </Pressable>
              ))}
            </View>

            <ScrollView style={{ maxHeight: 320, marginTop: space.lg }}>
              {notYet.length === 0 ? (
                <Empty icon="checkmark-done-outline" title="Everyone is recorded" text="All your trainees have attendance for today." />
              ) : (
                notYet.map((t, i) => (
                  <Row
                    key={t.trainee_id}
                    left={<Avatar name={t.trainee_name} size={32} />}
                    title={t.trainee_name}
                    onPress={() => setSelected(t)}
                    right={
                      <Ionicons
                        name={selected?.trainee_id === t.trainee_id ? 'radio-button-on' : 'radio-button-off'}
                        size={22}
                        color={selected?.trainee_id === t.trainee_id ? colors.primary : colors.subtle}
                      />
                    }
                    last={i === notYet.length - 1}
                  />
                ))
              )}
            </ScrollView>

            <Button
              title={selected ? `Mark ${selected.trainee_name.split(' ')[0]} ${status}` : 'Choose a trainee'}
              onPress={confirmSave}
              disabled={!selected}
              loading={saving}
              variant={status === 'absent' ? 'danger' : 'primary'}
              style={{ marginTop: space.lg }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ value, label, color = colors.ink }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: space.lg }}>
      <T v="display" style={{ color, fontVariant: ['tabular-nums'] }}>{value}</T>
      <T v="caption">{label}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.xl, paddingTop: space.sm },
  stats: { flexDirection: 'row', alignItems: 'center' },
  statDivider: { width: 1, height: 36, backgroundColor: colors.divider },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,24,39,0.45)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl + 4, borderTopRightRadius: radius.xl + 4, padding: space.xl, paddingBottom: space.xxxl },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: space.lg },
  segment: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: radius.md, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
