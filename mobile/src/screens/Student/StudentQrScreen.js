// Trainee attendance: get a code by email → enter it → show the QR → supervisor scans it → time out.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useQrStore } from '@/store/useQrStore';
import { useAttendanceStore } from '@/store/useAttendanceStore';
import { useSupervisorStore } from '@/store/useSupervisorStore';
import { verifyOtp, timeOut } from '@/api/studentApi';
import { errorMessage } from '@/lib/api';
import { notify } from '@/lib/notify';
import OtpRequestModal from '@/components/OtpRequestModal';
import { Button, Card, Field, Loading, Notice, Screen, T, colors, space } from '@/ui';

const pad = (n) => String(n).padStart(2, '0');
const short = (d) => (d ? String(d).replace(/\s*\d+s$/, '') : '');

export default function StudentQrScreen() {
  const navigation = useNavigation();
  const { qrData, fetchQrCode, generateQrCode, refreshQrStatus } = useQrStore();
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
  const state = today?.time_out ? 'done' : today?.time_in ? 'timedIn' : qrActive ? 'showQr' : 'needCode';

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
      if (useQrStore.getState().qrData?.is_used === 1) {
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

  // Expired while open: back to the code step
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
    Alert.alert('Time out now?', `You timed in at ${today?.time_in}. You can only time out once a day.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Time out', style: 'destructive', onPress: doTimeOut },
    ]);
  };

  const doTimeOut = async () => {
    setTimingOut(true);
    try {
      const res = await timeOut();
      if (res?.success) notify.success('Timed out', res.time_out ? `Recorded at ${res.time_out}.` : undefined);
      else notify.error("Couldn't time out", res?.message || 'Please try again.');
    } catch (e) {
      notify.error("Couldn't time out", errorMessage(e));
    } finally {
      await fetchMyAttendance();
      setTimingOut(false);
    }
  };

  if (!loaded) return <Loading />;

  const lowTime = remaining !== null && remaining < 5 * 60000;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh} keyboard>
      {state === 'done' && (
        <Card style={styles.center}>
          <Ionicons name="checkmark-circle" size={44} color={colors.success} />
          <T v="title" style={styles.centerText}>Done for today</T>
          <T v="body" style={[styles.centerText, { color: colors.muted }]}>
            {today.time_in} – {today.time_out}{today.duration ? ` · ${short(today.duration)}` : ''}
          </T>
          <T v="caption" style={[styles.centerText, { marginTop: space.lg }]}>Come back tomorrow for a new QR code.</T>
        </Card>
      )}

      {state === 'timedIn' && (
        <>
          <Card style={styles.center}>
            <T v="overline">TIMED IN</T>
            <T v="display" style={{ marginTop: space.xs }}>{today.time_in}</T>
            <T v="caption" style={styles.centerText}>Time out when you finish for the day.</T>
            <Button title="Time out" variant="danger" icon="log-out-outline" onPress={confirmTimeOut} loading={timingOut} style={{ alignSelf: 'stretch', marginTop: space.xl }} />
          </Card>
          <T v="caption" style={{ textAlign: 'center', marginTop: space.md }}>
            If you forget, you're timed out automatically at 11:00 PM.
          </T>
        </>
      )}

      {state === 'showQr' && (
        <Card style={styles.center}>
          <T v="heading">Show this to your supervisor</T>
          <T v="caption" style={styles.centerText}>They scan it to record your time-in.</T>
          <View style={styles.qrBox}>
            <QRCode value={String(qrData.qr)} size={216} color={colors.ink} backgroundColor="#fff" />
          </View>
          <T v="bodyStrong" style={{ color: lowTime ? colors.danger : colors.ink, fontVariant: ['tabular-nums'] }}>
            Expires in {pad(Math.floor((remaining || 0) / 60000))}:{pad(Math.floor(((remaining || 0) % 60000) / 1000))}
          </T>
          <T v="caption" style={{ marginTop: space.xs }}>This screen updates when it's scanned.</T>
        </Card>
      )}

      {state === 'needCode' && (
        <>
          {!hasSupervisor ? (
            <Notice tone="warning" title="You need a supervisor first" style={{ marginBottom: space.lg }}>
              Choose one on the Home tab. Once they accept you, you can time in here.
            </Notice>
          ) : null}

          <Step n={1} title="Get a code by email" done={!!codeSentTo}>
            <T v="caption" style={{ marginBottom: space.md }}>
              {codeSentTo ? `Sent to ${codeSentTo}. It's valid for 5 minutes.` : "Confirm your password and we'll email you a 6-digit code."}
            </T>
            <Button
              title={codeSentTo ? 'Send a new code' : 'Email me a code'}
              variant={codeSentTo ? 'secondary' : 'primary'}
              onPress={() => setOtpModal(true)}
              disabled={!hasSupervisor}
            />
          </Step>

          <Step n={2} title="Enter the code">
            <Field
              value={otp}
              onChangeText={(t) => {
                setOtp(t.replace(/\D/g, ''));
                setOtpError('');
              }}
              placeholder="6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              onSubmitEditing={submitCode}
              inputStyle={{ fontSize: 20, letterSpacing: 6 }}
              error={otpError}
              style={{ marginBottom: space.md }}
            />
            <Button title="Show my QR code" onPress={submitCode} loading={verifying} disabled={otp.length !== 6} />
          </Step>

          <T v="caption" style={{ textAlign: 'center', marginTop: space.sm }}>
            Codes can take a minute to arrive. Check your spam folder too.
          </T>
        </>
      )}

      <OtpRequestModal
        visible={otpModal}
        onClose={() => setOtpModal(false)}
        onSent={(email) => {
          setOtpModal(false);
          setCodeSentTo(email || 'your email');
          notify.success('Code sent', 'Check your email.');
        }}
      />
    </Screen>
  );
}

function Step({ n, title, done, children }) {
  return (
    <Card style={{ marginBottom: space.md }}>
      <View style={styles.stepHead}>
        <View style={[styles.stepNum, done && { backgroundColor: colors.success }]}>
          {done ? <Ionicons name="checkmark" size={14} color="#fff" /> : <T v="label" style={{ color: '#fff' }}>{n}</T>}
        </View>
        <T v="heading">{title}</T>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: space.xxl },
  centerText: { textAlign: 'center', marginTop: space.xs },
  qrBox: { marginVertical: space.xl, padding: space.md, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.sm },
  stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
