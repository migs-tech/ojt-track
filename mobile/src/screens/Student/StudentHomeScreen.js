// Trainee home: greeting, getting-started list, today's attendance, this week, hours and reports.
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfWeek, addDays } from 'date-fns';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import { useSupervisorStore } from '@/store/useSupervisorStore';
import { useReportStore } from '@/store/useReportStore';
import { useQrStore } from '@/store/useQrStore';
import { useAuth } from '@/store/useAuthStore';
import { sendSupervisorRequest, checkOjtCompletionStatus } from '@/api/studentApi';
import { errorMessage } from '@/lib/api';
import { notify } from '@/lib/notify';
import OtpRequestModal from '@/components/OtpRequestModal';
import GettingStarted from '@/components/GettingStarted';
import Avatar from '@/components/Avatar';
import { Badge, Button, Card, Empty, Notice, ProgressBar, Row, Screen, Section, T, colors, radius, space } from '@/ui';

/** "12h 30m 5s" -> hours as a number */
const toHours = (text) => {
  const m = String(text || '').match(/(\d+)h\s*(\d+)m/);
  return m ? Number(m[1]) + Number(m[2]) / 60 : 0;
};
const short = (d) => (d ? String(d).replace(/\s*\d+s$/, '') : '');

/** The request to show: approved first, then pending, then the latest one. */
const pickRequest = (requests) => {
  if (!Array.isArray(requests) || requests.length === 0) return null;
  return (
    requests.find((r) => Number(r.status) === 1) ||
    requests.find((r) => Number(r.status) === 0) ||
    requests[requests.length - 1]
  );
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function HomeIndex() {
  const navigation = useNavigation();
  const { user, profile, getUserProfile } = useAuth();
  const { myAttendance, fetchMyAttendance } = useAttendanceStore();
  const { supervisors, mySupervisor, fetchSupervisorDetails, fetchMySupervisor } = useSupervisorStore();
  const { reports, getReports } = useReportStore();
  const { qrData, status: qrStatus, fetchQrCode } = useQrStore();

  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [requesting, setRequesting] = useState(null);
  const [completion, setCompletion] = useState(null);

  const loadAll = useCallback(async () => {
    await Promise.all([
      fetchMyAttendance(),
      fetchMySupervisor(),
      getReports(),
      fetchQrCode(),
      getUserProfile(),
      checkOjtCompletionStatus().then(setCompletion).catch(() => null),
    ]);
    setLoaded(true);
  }, [fetchMyAttendance, fetchMySupervisor, getReports, fetchQrCode, getUserProfile]);

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

  // ---- Supervisor
  const request = pickRequest(mySupervisor);
  const requestStatus = request ? Number(request.status) : null; // 0 pending, 1 approved, 2 declined

  const openSupervisorPicker = async () => {
    setPickerVisible(true);
    await fetchSupervisorDetails();
  };

  const requestSupervisor = async (sup) => {
    setRequesting(sup.id);
    try {
      const res = await sendSupervisorRequest(sup.id);
      if (res?.success) {
        setPickerVisible(false);
        notify.success('Request sent', `${sup.complete_name || sup.username} will be asked to accept you.`);
        await fetchMySupervisor();
      } else {
        notify.error("Couldn't send request", res?.message || 'Please try again.');
      }
    } catch (e) {
      notify.error("Couldn't send request", errorMessage(e));
    } finally {
      setRequesting(null);
    }
  };

  // ---- Today
  const today = myAttendance?.today;
  const hasActiveQr = qrData?.qr && qrData.is_used === 0 && qrStatus === 'active';
  const todayState = today?.time_out ? 'done' : today?.time_in ? 'in' : hasActiveQr ? 'qr' : 'none';

  // ---- This week (Mon–Sat)
  const week = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    const byDate = {};
    (myAttendance?.records || []).forEach((r) => {
      if (r.date_iso) byDate[r.date_iso] = r;
    });
    const todayIso = format(new Date(), 'yyyy-MM-dd');
    return Array.from({ length: 6 }, (_, i) => {
      const d = addDays(monday, i);
      const iso = format(d, 'yyyy-MM-dd');
      const rec = byDate[iso];
      return {
        label: format(d, 'EEEEE'),
        day: format(d, 'd'),
        isToday: iso === todayIso,
        present: rec && Number(rec.status) === 1 && rec.time_in,
        absent: rec && Number(rec.status) === 2,
      };
    });
  }, [myAttendance]);

  // ---- Hours
  const doneHours = toHours(myAttendance?.total_hours);
  const requiredHours = Number(profile?.ojt_required_hours) || 0;
  const percent = requiredHours ? Math.min(100, Math.round((doneHours / requiredHours) * 100)) : null;

  const reportList = (Array.isArray(reports) ? reports : []).filter(Boolean);
  const recent = reportList.slice(0, 3);
  const name = profile?.full_name || profile?.complete_name || user?.complete_name || user?.username || '';

  const checklist = [
    { key: 'name', title: 'Add your full name', text: 'Supervisors and reports use it.', done: !!profile?.full_name, onPress: () => navigation.navigate('EditProfile') },
    { key: 'email', title: 'Verify your email', text: 'Attendance codes are sent there.', done: Number(profile?.email_flg) === 1, onPress: () => navigation.navigate('EmailVerification') },
    { key: 'sup', title: 'Choose your supervisor', text: 'They accept you and scan your QR code.', done: requestStatus === 1, onPress: requestStatus === 0 ? undefined : openSupervisorPicker },
    { key: 'first', title: 'Record your first attendance', text: 'Get a code, then show your QR code.', done: (myAttendance?.records || []).some((r) => r.time_in), onPress: () => navigation.navigate('QR Code') },
    { key: 'report', title: 'Submit your first report', text: 'Write what you did and add a photo.', done: reportList.length > 0, onPress: () => navigation.navigate('Report', { screen: 'Submit Report' }) },
  ];

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
        {/* Greeting */}
        <View style={styles.greeting}>
          <View style={{ flex: 1 }}>
            <T v="caption">{format(new Date(), 'EEEE, MMMM d')}</T>
            <T v="title" numberOfLines={1}>
              {greeting()}{name ? `, ${name.split(' ')[0]}` : ''}
            </T>
          </View>
          <Pressable onPress={() => navigation.navigate('Profile')} accessibilityLabel="Profile">
            <Avatar uri={profile?.avatar_url} name={name} size={40} />
          </Pressable>
        </View>

        {/* Finished the required hours: ask for the supervisor rating */}
        {completion?.completed && !completion?.is_rated ? (
          <Card style={{ marginBottom: space.xl, borderColor: '#BFE3CB', backgroundColor: colors.successSoft }}>
            <T v="heading">You've completed your OJT hours</T>
            <T v="caption" style={{ marginTop: 2, marginBottom: space.md, color: colors.text }}>
              As the last requirement, rate your supervisor and confirm your completion.
            </T>
            <Button title="Complete OJT" small onPress={() => navigation.navigate('OjtCompletion')} style={{ alignSelf: 'flex-start' }} />
          </Card>
        ) : null}

        <GettingStarted items={checklist} storageKey={`gettingStarted:${user?.id}`} />

        {/* Supervisor status (only while not yet approved) */}
        {requestStatus === 0 ? (
          <Notice tone="warning" title="Waiting for your supervisor" style={{ marginBottom: space.xl }}>
            {request.supervisor_name} needs to accept your request. You'll get a notification.
          </Notice>
        ) : requestStatus === 2 ? (
          <Notice tone="danger" title="Your request was declined" style={{ marginBottom: space.xl }}>
            Choose another supervisor from the list.
          </Notice>
        ) : null}

        {/* Today */}
        <Section title="Today">
          <Card>
            {todayState === 'done' ? (
              <StatusLine icon="checkmark-circle" color={colors.success} title="Done for today" text={`${today.time_in} – ${today.time_out}${today.duration ? ` · ${short(today.duration)}` : ''}`} />
            ) : todayState === 'in' ? (
              <>
                <StatusLine icon="time" color={colors.primary} title={`Timed in at ${today.time_in}`} text="Time out when you finish for the day." />
                <Button title="Go to time out" variant="secondary" onPress={() => navigation.navigate('QR Code')} style={{ marginTop: space.lg }} />
              </>
            ) : todayState === 'qr' ? (
              <>
                <StatusLine icon="qr-code" color={colors.primary} title="Your QR code is ready" text="Show it to your supervisor to time in." />
                <Button title="Show QR code" onPress={() => navigation.navigate('QR Code')} style={{ marginTop: space.lg }} />
              </>
            ) : (
              <>
                <StatusLine icon="ellipse-outline" color={colors.subtle} title="Not timed in yet" text="Get a code by email, then show your QR code to your supervisor." />
                {requestStatus === 1 ? (
                  <Button title="Get today's QR code" onPress={() => setOtpVisible(true)} style={{ marginTop: space.lg }} />
                ) : (
                  <Button title="Choose a supervisor first" variant="secondary" onPress={openSupervisorPicker} disabled={requestStatus === 0} style={{ marginTop: space.lg }} />
                )}
              </>
            )}
          </Card>
        </Section>

        {/* Week + hours */}
        <Section title="This week" action="History" onAction={() => navigation.navigate('Attendance')}>
          <Card>
            <View style={styles.weekRow}>
              {week.map((d) => (
                <View key={d.label + d.day} style={styles.day}>
                  <T v="caption" style={d.isToday ? { color: colors.primary, fontWeight: '600' } : null}>{d.label}</T>
                  <View
                    style={[
                      styles.dayCell,
                      d.present && { backgroundColor: colors.success, borderColor: colors.success },
                      d.absent && { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
                      d.isToday && !d.present && { borderColor: colors.primary },
                    ]}
                  >
                    {d.present ? (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    ) : (
                      <T v="label" style={{ color: d.absent ? colors.danger : colors.text }}>{d.day}</T>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.hours}>
              <View style={styles.hoursHead}>
                <T v="label">OJT hours</T>
                <T v="label" style={{ color: colors.ink }}>
                  {Math.floor(doneHours)}{requiredHours ? ` / ${requiredHours}` : ''} h
                </T>
              </View>
              {percent !== null ? (
                <>
                  <ProgressBar value={percent} tone={colors.success} style={{ marginVertical: space.sm }} />
                  <T v="caption">
                    {percent >= 100 ? 'Required hours completed.' : `${percent}% · ${Math.max(0, Math.ceil(requiredHours - doneHours))} hours to go`}
                  </T>
                </>
              ) : (
                <T v="caption" style={{ marginTop: 4 }}>Total time recorded from your QR attendance.</T>
              )}
            </View>
          </Card>
        </Section>

        {/* Reports */}
        <Section title="Recent reports" action={recent.length ? 'See all' : undefined} onAction={() => navigation.navigate('Report', { screen: 'History' })}>
          <Card padded={false}>
            {recent.length === 0 ? (
              <Empty
                icon="document-text-outline"
                title="No reports yet"
                text="Write a short report of what you did today."
                action="Write a report"
                onAction={() => navigation.navigate('Report', { screen: 'Submit Report' })}
              />
            ) : (
              recent.map((r, i) => (
                <Row
                  key={r.id}
                  title={r.title}
                  subtitle={r.date ? format(new Date(String(r.date).slice(0, 10) + 'T00:00:00'), 'EEE, MMM d') : undefined}
                  onPress={() => navigation.navigate('ReportDetails', { reportId: r.id })}
                  last={i === recent.length - 1}
                />
              ))
            )}
          </Card>
        </Section>

        {requestStatus === 1 ? (
          <Card padded={false}>
            <Row
              left={<Avatar uri={request.avatar_url} name={request.supervisor_name} size={36} />}
              title={request.supervisor_name}
              subtitle={request.supervisor_company ? `Your supervisor · ${request.supervisor_company}` : 'Your supervisor'}
              right={<Badge tone="success">Active</Badge>}
              last
            />
          </Card>
        ) : null}
      </Screen>

      <OtpRequestModal
        visible={otpVisible}
        onClose={() => setOtpVisible(false)}
        onSent={(email) => {
          setOtpVisible(false);
          notify.success('Code sent', `Check ${email || 'your email'}, then enter the code here.`);
          navigation.navigate('QR Code');
        }}
      />

      {/* Supervisor picker */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <T v="title">Choose your supervisor</T>
            <T v="caption" style={{ marginTop: 2, marginBottom: space.md }}>They'll get your request and need to accept it.</T>
            <ScrollView style={{ maxHeight: 440 }}>
              {supervisors === null ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: space.xxl }} />
              ) : (supervisors || []).length === 0 ? (
                <Empty icon="people-outline" title="No supervisors yet" text="Ask your supervisor to create an account in the app first." />
              ) : (
                supervisors.map((sup, i) => (
                  <Row
                    key={sup.id}
                    left={<Avatar uri={sup.avatar_url} name={sup.complete_name || sup.username} size={40} />}
                    title={sup.complete_name || sup.username}
                    subtitle={sup.company || undefined}
                    onPress={requesting === null ? () => requestSupervisor(sup) : undefined}
                    right={requesting === sup.id ? <ActivityIndicator color={colors.primary} /> : <T v="label" style={{ color: colors.primary }}>Request</T>}
                    last={i === supervisors.length - 1}
                  />
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatusLine({ icon, color, title, text }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.md }}>
      <Ionicons name={icon} size={24} color={color} style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <T v="heading">{title}</T>
        <T v="caption" style={{ marginTop: 2 }}>{text}</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.xl, paddingTop: space.sm },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 6 },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hours: { marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: colors.divider },
  hoursHead: { flexDirection: 'row', justifyContent: 'space-between' },
  sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(17,24,39,0.45)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl + 4,
    borderTopRightRadius: radius.xl + 4,
    padding: space.xl,
    paddingBottom: space.xxxl,
  },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: space.lg },
});
