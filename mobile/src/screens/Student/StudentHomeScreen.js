// Trainee home: supervisor status, today's attendance, this week, hours progress and recent reports.
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfWeek, addDays } from 'date-fns';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import { useSupervisorStore } from '@/store/useSupervisorStore';
import { useReportStore } from '@/store/useReportStore';
import { useQrStore } from '@/store/useQrStore';
import { useAuth } from '@/store/useAuthStore';
import { sendSupervisorRequest } from '@/api/studentApi';
import { errorMessage } from '@/lib/api';
import { notify } from '@/lib/notify';
import OtpRequestModal from '@/components/OtpRequestModal';
import Avatar from '@/components/Avatar';

const BLUE = '#2076cc';

/** "12h 30m 5s" -> hours as a number */
const toHours = (text) => {
  const m = String(text || '').match(/(\d+)h\s*(\d+)m/);
  return m ? Number(m[1]) + Number(m[2]) / 60 : 0;
};

/** The request to show: approved first, then pending, then the latest one. */
const pickRequest = (requests) => {
  if (!Array.isArray(requests) || requests.length === 0) return null;
  return (
    requests.find((r) => Number(r.status) === 1) ||
    requests.find((r) => Number(r.status) === 0) ||
    requests[requests.length - 1]
  );
};

export default function HomeIndex() {
  const navigation = useNavigation();
  const { profile, getUserProfile } = useAuth();
  const { myAttendance, fetchMyAttendance } = useAttendanceStore();
  const { supervisors, mySupervisor, fetchSupervisorDetails, fetchMySupervisor } = useSupervisorStore();
  const { reports, getReports } = useReportStore();
  const { qrData, status: qrStatus, fetchQrCode } = useQrStore();

  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [requesting, setRequesting] = useState(null);

  const loadAll = useCallback(async () => {
    await Promise.all([
      fetchMyAttendance(),
      fetchMySupervisor(),
      getReports(),
      fetchQrCode(),
      getUserProfile().catch(() => null),
    ]);
    setLoaded(true);
  }, [fetchMyAttendance, fetchMySupervisor, getReports, fetchQrCode, getUserProfile]);

  // Refresh every time the tab is shown
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
        notify.success('Request sent', `${sup.complete_name || sup.username} will be asked to approve you.`);
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
  const todayState = today?.time_out
    ? 'done'
    : today?.time_in
    ? 'in'
    : hasActiveQr
    ? 'qr'
    : 'none';

  // ---- This week (Mon–Sat), marked from the attendance records
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
        label: format(d, 'EEE'),
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

  const recent = (Array.isArray(reports) ? reports : []).filter(Boolean).slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BLUE]} />}
      >
        {/* Supervisor (nothing until loaded, so "Choose your supervisor" doesn't flash) */}
        {!loaded ? (
          <View style={[styles.banner, { backgroundColor: '#e6f0fc', height: 68 }]}>
            <ActivityIndicator color={BLUE} />
          </View>
        ) : requestStatus === 1 ? (
          <View style={[styles.banner, { backgroundColor: '#e6f0fc' }]}>
            <Avatar uri={request.avatar_url} name={request.supervisor_name} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerLabel}>Your supervisor</Text>
              <Text style={styles.bannerTitle}>{request.supervisor_name}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
          </View>
        ) : requestStatus === 0 ? (
          <View style={[styles.banner, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="time-outline" size={26} color="#b45309" />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Waiting for approval</Text>
              <Text style={styles.bannerText}>
                {request.supervisor_name} needs to accept your request. You'll get a notification.
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={[styles.banner, { backgroundColor: '#e6f0fc' }]} onPress={openSupervisorPicker}>
            <Ionicons name="person-add-outline" size={26} color={BLUE} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                {requestStatus === 2 ? 'Your request was declined' : 'Choose your supervisor'}
              </Text>
              <Text style={styles.bannerText}>
                You need a supervisor to record attendance and submit reports. Tap to send a request.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={BLUE} />
          </TouchableOpacity>
        )}

        {/* Today */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Today</Text>
            <Text style={styles.muted}>{format(new Date(), 'EEEE, MMM d')}</Text>
          </View>

          {todayState === 'done' ? (
            <View style={styles.todayRow}>
              <View style={[styles.todayIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="checkmark-done" size={24} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.todayTitle}>Done for today</Text>
                <Text style={styles.muted}>
                  {today.time_in} – {today.time_out}
                  {today.duration ? ` · ${today.duration.replace(/\s*\d+s$/, '')}` : ''}
                </Text>
              </View>
            </View>
          ) : todayState === 'in' ? (
            <>
              <View style={styles.todayRow}>
                <View style={[styles.todayIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="log-in-outline" size={24} color={BLUE} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.todayTitle}>Timed in at {today.time_in}</Text>
                  <Text style={styles.muted}>Remember to time out when you finish.</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('QR Code')}>
                <Text style={styles.secondaryButtonText}>Go to Time Out</Text>
              </TouchableOpacity>
            </>
          ) : todayState === 'qr' ? (
            <>
              <View style={styles.todayRow}>
                <View style={[styles.todayIcon, { backgroundColor: '#dbeafe' }]}>
                  <Ionicons name="qr-code-outline" size={24} color={BLUE} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.todayTitle}>Your QR code is ready</Text>
                  <Text style={styles.muted}>Show it to your supervisor to time in.</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('QR Code')}>
                <Text style={styles.primaryButtonText}>Show my QR code</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.todayRow}>
                <View style={[styles.todayIcon, { backgroundColor: '#f1f5f9' }]}>
                  <Ionicons name="time-outline" size={24} color="#64748b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.todayTitle}>Not timed in yet</Text>
                  <Text style={styles.muted}>Get a code by email, then show your QR to your supervisor.</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, requestStatus !== 1 && styles.buttonDisabled]}
                onPress={() => setOtpVisible(true)}
                disabled={requestStatus !== 1}
              >
                <Text style={styles.primaryButtonText}>Get today's QR code</Text>
              </TouchableOpacity>
              {requestStatus !== 1 ? (
                <Text style={[styles.muted, { marginTop: 8, textAlign: 'center' }]}>
                  Available once a supervisor accepts you.
                </Text>
              ) : null}
            </>
          )}
        </View>

        {/* This week */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>This week</Text>
            <Pressable onPress={() => navigation.navigate('Attendance')} hitSlop={8}>
              <Text style={styles.link}>History ›</Text>
            </Pressable>
          </View>
          <View style={styles.weekRow}>
            {week.map((d) => (
              <View key={d.label} style={styles.dayItem}>
                <Text style={[styles.dayLabel, d.isToday && { color: BLUE, fontWeight: '700' }]}>{d.label}</Text>
                <View
                  style={[
                    styles.dayCircle,
                    d.present && { backgroundColor: '#16a34a', borderColor: '#16a34a' },
                    d.absent && { backgroundColor: '#fee2e2', borderColor: '#fca5a5' },
                    d.isToday && !d.present && { borderColor: BLUE },
                  ]}
                >
                  {d.present ? (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  ) : (
                    <Text style={[styles.dayNum, d.absent && { color: '#b91c1c' }]}>{d.day}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <View style={[styles.legendDot, { backgroundColor: '#16a34a' }]} />
            <Text style={styles.legendText}>Present</Text>
            <View style={[styles.legendDot, { backgroundColor: '#fca5a5', marginLeft: 12 }]} />
            <Text style={styles.legendText}>Absent</Text>
          </View>
        </View>

        {/* Hours */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>OJT hours</Text>
            <Pressable onPress={() => navigation.navigate('Attendance')} hitSlop={8}>
              <Text style={styles.link}>Details ›</Text>
            </Pressable>
          </View>
          <Text style={styles.hoursValue}>
            {Math.floor(doneHours)}
            <Text style={styles.hoursUnit}> hrs{requiredHours ? ` of ${requiredHours}` : ''}</Text>
          </Text>
          {percent !== null ? (
            <>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.muted}>
                {percent >= 100
                  ? 'Required hours completed 🎉'
                  : `${percent}% complete · ${Math.max(0, Math.ceil(requiredHours - doneHours))} hrs to go`}
              </Text>
            </>
          ) : (
            <Text style={styles.muted}>Total time recorded from your QR attendance.</Text>
          )}
        </View>

        {/* Reports */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent reports</Text>
            <Pressable onPress={() => navigation.navigate('Report', { screen: 'History' })} hitSlop={8}>
              <Text style={styles.link}>See all ›</Text>
            </Pressable>
          </View>
          {recent.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.muted}>No reports yet.</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Report', { screen: 'Submit Report' })}>
                <Text style={styles.link}>Write today's report</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recent.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.reportRow}
                onPress={() => navigation.navigate('ReportDetails', { reportId: r.id })}
              >
                <Ionicons name="document-text-outline" size={20} color={BLUE} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reportTitle} numberOfLines={1}>{r.title}</Text>
                  <Text style={styles.muted}>{r.date ? format(new Date(r.date), 'EEE, MMM d') : ''}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <OtpRequestModal
        visible={otpVisible}
        onClose={() => setOtpVisible(false)}
        onSent={(email) => {
          setOtpVisible(false);
          notify.success('Code sent', `Check ${email || 'your email'} and enter the code on the QR Code tab.`);
          navigation.navigate('QR Code');
        }}
      />

      {/* Supervisor picker */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.sheetOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Choose your supervisor</Text>
            <Text style={[styles.muted, { marginBottom: 12 }]}>
              They'll get your request and need to accept it.
            </Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {supervisors === null ? (
                <ActivityIndicator color={BLUE} style={{ marginVertical: 24 }} />
              ) : (supervisors || []).length === 0 ? (
                <Text style={[styles.muted, { marginVertical: 24, textAlign: 'center' }]}>
                  No supervisors have signed up yet.
                </Text>
              ) : (
                supervisors.map((sup) => (
                  <TouchableOpacity
                    key={sup.id}
                    style={styles.supRow}
                    onPress={() => requestSupervisor(sup)}
                    disabled={requesting !== null}
                  >
                    <Avatar uri={sup.avatar_url} name={sup.complete_name || sup.username} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reportTitle}>{sup.complete_name || sup.username}</Text>
                      {sup.company ? <Text style={styles.muted}>{sup.company}</Text> : null}
                    </View>
                    {requesting === sup.id ? (
                      <ActivityIndicator color={BLUE} />
                    ) : (
                      <Text style={styles.link}>Request</Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const card = {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 16,
  marginBottom: 14,
  shadowColor: '#0f172a',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fb' },
  content: { padding: 16, paddingBottom: 32 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  bannerLabel: { fontSize: 12, color: '#475569' },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  bannerText: { fontSize: 13, color: '#475569', marginTop: 2, lineHeight: 18 },
  card,
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
  muted: { fontSize: 13, color: '#64748b' },
  link: { fontSize: 14, fontWeight: '600', color: BLUE },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  todayIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  todayTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  primaryButton: { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryButton: { borderWidth: 1.5, borderColor: BLUE, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { color: BLUE, fontWeight: '700', fontSize: 15 },
  buttonDisabled: { backgroundColor: '#cbd5e1' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: 6 },
  dayLabel: { fontSize: 12, color: '#64748b' },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: { fontSize: 14, fontWeight: '600', color: '#334155' },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: '#64748b' },
  hoursValue: { fontSize: 32, fontWeight: '800', color: '#0f172a' },
  hoursUnit: { fontSize: 16, fontWeight: '600', color: '#64748b' },
  progressTrack: { height: 10, backgroundColor: '#e2e8f0', borderRadius: 5, overflow: 'hidden', marginVertical: 10 },
  progressFill: { height: 10, backgroundColor: '#16a34a', borderRadius: 5 },
  emptyRow: { gap: 6 },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  reportTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  sheetOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 19, fontWeight: '700', color: '#0f172a' },
  supRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
});
