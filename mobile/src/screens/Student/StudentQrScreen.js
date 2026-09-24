// Trainee QR tab: get a code by email → enter it → show the QR → supervisor scans it → time out.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect } from '@react-navigation/native';
import { useQrStore } from '@/store/useQrStore';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import { useSupervisorStore } from '@/store/useSupervisorStore';
import { verifyOtp, timeOut } from '@/api/studentApi';
import { errorMessage } from '@/lib/api';
import { notify } from '@/lib/notify';
import OtpRequestModal from '@/components/OtpRequestModal';

const BLUE = '#2076cc';

const pad = (n) => String(n).padStart(2, '0');

export default function StudentQrScreen() {
  const { qrData, status, fetchQrCode, generateQrCode, refreshQrStatus } = useQrStore();
  const { myAttendance, fetchMyAttendance } = useAttendanceStore();
  const { mySupervisor, fetchMySupervisor } = useSupervisorStore();

  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [codeSentTo, setCodeSentTo] = useState(null);
  const [timingOut, setTimingOut] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    await Promise.all([fetchQrCode(), fetchMyAttendance(), fetchMySupervisor()]);
    setLoaded(true);
  }, [fetchQrCode, fetchMyAttendance, fetchMySupervisor]);

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

  const today = myAttendance?.today;
  const hasSupervisor = Array.isArray(mySupervisor) && mySupervisor.some((r) => Number(r.status) === 1);
  const expiresAt = qrData?.expires_at ? new Date(String(qrData.expires_at).replace(' ', 'T')).getTime() : 0;
  const qrActive = !!qrData?.qr && qrData.is_used === 0 && expiresAt > Date.now();

  const state = today?.time_out
    ? 'done'
    : today?.time_in
    ? 'timedIn'
    : qrActive
    ? 'showQr'
    : 'needCode';

  // While the QR is on screen: countdown, and check every 4 s whether the supervisor scanned it.
  useEffect(() => {
    if (state !== 'showQr') {
      setRemaining(null);
      return;
    }
    const tick = () => setRemaining(Math.max(0, expiresAt - Date.now()));
    tick();
    const countdown = setInterval(tick, 1000);
    pollRef.current = setInterval(async () => {
      await refreshQrStatus();
      const qr = useQrStore.getState().qrData;
      if (qr?.is_used === 1) {
        clearInterval(pollRef.current);
        await fetchMyAttendance();
        notify.success('Timed in', 'Your supervisor scanned your QR code.');
      }
    }, 4000);
    return () => {
      clearInterval(countdown);
      clearInterval(pollRef.current);
    };
  }, [state, expiresAt]);

  // Expired while open: go back to the code step
  useEffect(() => {
    if (remaining === 0) fetchQrCode();
  }, [remaining]);

  const submitCode = async () => {
    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      setOtpError('Enter the 6-digit code from your email.');
      return;
    }
    setVerifying(true);
    setOtpError('');
    try {
      const res = await verifyOtp({ otp: code });
      if (res?.success) {
        setOtp('');
        const made = await generateQrCode();
        if (made?.qr) {
          setCodeSentTo(null);
          notify.success('Code accepted', 'Show this QR code to your supervisor.');
        } else {
          setOtpError(made?.message || "Couldn't make your QR code. Please try again.");
        }
      } else {
        setOtpError(res?.message || 'That code is wrong or has expired.');
      }
    } catch (e) {
      setOtpError(errorMessage(e, "Couldn't check the code. Please try again."));
    } finally {
      setVerifying(false);
    }
  };

  const confirmTimeOut = () => {
    Alert.alert(
      'Time out now?',
      `You timed in at ${today?.time_in}. You can only time out once a day.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Time out', style: 'destructive', onPress: doTimeOut },
      ]
    );
  };

  const doTimeOut = async () => {
    setTimingOut(true);
    try {
      const res = await timeOut();
      if (res?.success) {
        notify.success('Timed out', res.time_out ? `Recorded at ${res.time_out}.` : 'Have a good rest of the day!');
      } else {
        notify.error("Couldn't time out", res?.message || 'Please try again.');
      }
    } catch (e) {
      notify.error("Couldn't time out", errorMessage(e));
    } finally {
      await fetchMyAttendance();
      setTimingOut(false);
    }
  };

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={BLUE} />
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  const mins = remaining !== null ? Math.floor(remaining / 60000) : 0;
  const secs = remaining !== null ? Math.floor((remaining % 60000) / 1000) : 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BLUE]} />}
      >
        {state === 'done' && (
          <View style={[styles.card, styles.centerCard]}>
            <View style={[styles.bigIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="checkmark-done" size={40} color="#16a34a" />
            </View>
            <Text style={styles.title}>You're done for today</Text>
            <Text style={styles.muted}>
              Timed in {today.time_in} · Timed out {today.time_out}
            </Text>
            {today.duration ? (
              <Text style={[styles.muted, { marginTop: 4 }]}>
                {today.duration.replace(/\s*\d+s$/, '')} recorded
              </Text>
            ) : null}
            <Text style={[styles.muted, { marginTop: 16, textAlign: 'center' }]}>
              Come back tomorrow for a new QR code.
            </Text>
          </View>
        )}

        {state === 'timedIn' && (
          <View style={[styles.card, styles.centerCard]}>
            <View style={[styles.bigIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="briefcase-outline" size={38} color={BLUE} />
            </View>
            <Text style={styles.title}>You're timed in</Text>
            <Text style={styles.muted}>Since {today.time_in}</Text>
            <TouchableOpacity
              style={[styles.dangerButton, timingOut && { opacity: 0.7 }]}
              onPress={confirmTimeOut}
              disabled={timingOut}
            >
              {timingOut ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="log-out" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Time out</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={[styles.muted, { marginTop: 10, textAlign: 'center' }]}>
              If you forget, you're timed out automatically at 11:00 PM.
            </Text>
          </View>
        )}

        {state === 'showQr' && (
          <View style={[styles.card, styles.centerCard]}>
            <Text style={styles.title}>Show this to your supervisor</Text>
            <Text style={styles.muted}>They scan it to record your time-in.</Text>
            <View style={styles.qrBox}>
              <QRCode value={String(qrData.qr)} size={220} color="#0f172a" backgroundColor="#fff" />
            </View>
            <View style={styles.row}>
              <Feather name="clock" size={16} color={remaining !== null && remaining < 5 * 60000 ? '#dc2626' : '#475569'} />
              <Text style={[styles.countdown, remaining !== null && remaining < 5 * 60000 && { color: '#dc2626' }]}>
                Expires in {pad(mins)}:{pad(secs)}
              </Text>
            </View>
            <View style={[styles.row, { marginTop: 10 }]}>
              <ActivityIndicator size="small" color="#94a3b8" />
              <Text style={styles.muted}>Waiting for the scan…</Text>
            </View>
          </View>
        )}

        {state === 'needCode' && (
          <>
            {!hasSupervisor ? (
              <View style={[styles.notice, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="information-circle-outline" size={20} color="#b45309" />
                <Text style={[styles.noticeText, { color: '#92400e' }]}>
                  You need a supervisor before you can time in. Choose one on the Home tab.
                </Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
                <Text style={styles.stepTitle}>Get a code by email</Text>
              </View>
              <Text style={[styles.muted, { marginBottom: 12 }]}>
                {codeSentTo
                  ? `We sent a code to ${codeSentTo}. It's valid for 5 minutes.`
                  : "We'll email you a 6-digit code after you confirm your password."}
              </Text>
              <TouchableOpacity
                style={[codeSentTo ? styles.outlineButton : styles.primaryButton, !hasSupervisor && styles.disabled]}
                onPress={() => setOtpModal(true)}
                disabled={!hasSupervisor}
              >
                <Text style={codeSentTo ? styles.outlineButtonText : styles.buttonText}>
                  {codeSentTo ? 'Send a new code' : 'Email me a code'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
                <Text style={styles.stepTitle}>Enter the code</Text>
              </View>
              <TextInput
                style={[styles.codeInput, otpError && { borderColor: '#fca5a5' }]}
                value={otp}
                onChangeText={(t) => {
                  setOtp(t.replace(/\D/g, ''));
                  setOtpError('');
                }}
                placeholder="••••••"
                placeholderTextColor="#cbd5e1"
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                onSubmitEditing={submitCode}
              />
              {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
              <TouchableOpacity
                style={[styles.primaryButton, (verifying || otp.length !== 6) && styles.disabled]}
                onPress={submitCode}
                disabled={verifying || otp.length !== 6}
              >
                {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Show my QR code</Text>}
              </TouchableOpacity>
            </View>

            {qrData?.qr && qrData.is_used === 0 ? (
              <Text style={[styles.muted, { textAlign: 'center' }]}>
                Your last QR code expired. Get a new code to make another.
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>

      <OtpRequestModal
        visible={otpModal}
        onClose={() => setOtpModal(false)}
        onSent={(email) => {
          setOtpModal(false);
          setCodeSentTo(email || 'your email');
          notify.success('Code sent', 'Check your email (and the spam folder).');
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#f5f7fb' },
  content: { padding: 16, paddingBottom: 32, backgroundColor: '#f5f7fb', flexGrow: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  centerCard: { alignItems: 'center', paddingVertical: 26 },
  bigIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 4, textAlign: 'center' },
  muted: { fontSize: 13, color: '#64748b', lineHeight: 19 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qrBox: {
    marginVertical: 18,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  countdown: { fontSize: 16, fontWeight: '700', color: '#475569' },
  notice: { flexDirection: 'row', gap: 8, borderRadius: 12, padding: 12, marginBottom: 14, alignItems: 'flex-start' },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 18 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontWeight: '700' },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  codeInput: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    fontSize: 26,
    letterSpacing: 10,
    textAlign: 'center',
    color: '#0f172a',
    marginBottom: 10,
  },
  errorText: { color: '#b91c1c', fontSize: 13, marginBottom: 10 },
  primaryButton: { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  outlineButton: { borderWidth: 1.5, borderColor: BLUE, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  outlineButtonText: { color: BLUE, fontWeight: '700', fontSize: 15 },
  dangerButton: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  disabled: { backgroundColor: '#cbd5e1', borderColor: '#cbd5e1' },
});
